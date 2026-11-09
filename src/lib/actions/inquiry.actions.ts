"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getClientIp } from "@/lib/auth/client-ip";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getLimiter } from "@/lib/auth/rate-limit";
import { cacheTags } from "@/lib/cache/tags";
import { ensureOwnerKeyHash, getOwnerKeyHash } from "@/lib/inquiry/owner";
import { AUTH_MESSAGES, canAuthorModify } from "@/lib/inquiry/permissions";
import * as inquiryRepository from "@/lib/repositories/inquiry.repository";
import { formDataToObject, validationError } from "@/lib/validation/common";
import {
  inquiryDeleteSchema,
  inquiryPasswordSchema,
  inquirySchema,
  inquiryUpdateSchema,
} from "@/lib/validation/inquiry.schema";
import type { ActionState, Inquiry } from "@/types";

/** 문의 비밀번호 확인: IP 당 15분에 10회 실패 시 잠금 */
const passwordLimiter = () => getLimiter("inquiry-password", 10, 15 * 60 * 1000);

function invalidate(id: number) {
  updateTag(cacheTags.inquiries);
  updateTag(cacheTags.inquiry(id));
}

/**
 * 비밀번호 확인 (시도 횟수 제한 포함).
 * 반환: ok=비밀번호 일치, blocked=잠금 중
 */
async function checkPassword(
  password: string | null,
  hash: string | null,
): Promise<{ ok: boolean; blocked: boolean }> {
  if (!password || !hash) return { ok: false, blocked: false };
  const ip = await getClientIp();
  const limiter = passwordLimiter();
  if (limiter.blockedFor(ip) > 0) return { ok: false, blocked: true };
  const ok = await verifyPassword(password, hash);
  if (ok) limiter.reset(ip);
  else limiter.fail(ip);
  return { ok, blocked: false };
}

const BLOCKED_MESSAGE = "비밀번호 확인 시도가 너무 많습니다. 15분 후 다시 시도하세요.";

/** 공개 문의 등록 */
export async function createInquiryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = formDataToObject(formData);
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);

  const { title, content, authorName, email, phone, isPrivate, password } = parsed.data;
  const id = await inquiryRepository.insertInquiry({
    title,
    content,
    authorName,
    email,
    phone,
    isPrivate,
    // 공개 문의는 비밀번호를 쓰지 않는다 (작성한 브라우저로 본인 확인)
    passwordHash: isPrivate && password ? await hashPassword(password) : null,
    ownerKeyHash: await ensureOwnerKeyHash(),
  });
  updateTag(cacheTags.inquiries);
  redirect(`/news/inquiry/${id}?created=1`);
}

export type UnlockedInquiry = Pick<
  Inquiry,
  "id" | "title" | "content" | "phone" | "isPrivate" | "hasPassword" | "answer" | "answeredAt"
>;

/** 비공개 문의 열람(또는 수정 전 본인 확인) — 작성 시 입력한 비밀번호 확인 */
export async function unlockInquiryAction(
  _prev: ActionState<UnlockedInquiry>,
  formData: FormData,
): Promise<ActionState<UnlockedInquiry>> {
  const parsed = inquiryPasswordSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationError(parsed.error);

  const hash = await inquiryRepository.findInquiryPasswordHash(parsed.data.id);
  const result = await checkPassword(parsed.data.password, hash);
  if (result.blocked) return { ok: false, message: BLOCKED_MESSAGE };
  if (!result.ok) return { ok: false, message: "비밀번호가 일치하지 않습니다." };

  const inquiry = await inquiryRepository.findInquiry(parsed.data.id);
  if (!inquiry) return { ok: false, message: "문의를 찾을 수 없습니다." };
  return {
    ok: true,
    data: {
      id: inquiry.id,
      title: inquiry.title,
      content: inquiry.content,
      phone: inquiry.phone,
      isPrivate: inquiry.isPrivate,
      hasPassword: inquiry.hasPassword,
      answer: inquiry.answer,
      answeredAt: inquiry.answeredAt,
    },
  };
}

/** 작성자 본인 확인 — 답변 전 + (작성 브라우저 또는 비밀번호) */
async function authorize(id: number, currentPassword: string | null) {
  const auth = await inquiryRepository.findInquiryAuth(id);
  if (!auth) return { auth: null, error: "문의를 찾을 수 없습니다." } as const;

  const ownerKeyHash = await getOwnerKeyHash();
  const password = await checkPassword(currentPassword, auth.passwordHash);
  if (password.blocked) return { auth, error: BLOCKED_MESSAGE } as const;

  const result = canAuthorModify(
    {
      isPrivate: auth.isPrivate,
      hasPassword: auth.passwordHash !== null,
      answered: auth.answeredAt !== null,
    },
    {
      isOwnerBrowser: ownerKeyHash !== null && ownerKeyHash === auth.ownerKeyHash,
      passwordOk: password.ok,
    },
  );
  if (!result.ok) {
    const message =
      result.reason === "password-required" && currentPassword
        ? "비밀번호가 일치하지 않습니다."
        : AUTH_MESSAGES[result.reason];
    return { auth, error: message } as const;
  }
  return { auth, error: null } as const;
}

/** 작성자 본인의 문의 수정 (답변 전까지만) */
export async function updateOwnInquiryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = formDataToObject(formData);
  const parsed = inquiryUpdateSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  const { id, title, content, phone, isPrivate, currentPassword, newPassword } = parsed.data;

  const { auth, error } = await authorize(id, currentPassword);
  if (error || !auth)
    return { ok: false, message: error ?? "문의를 찾을 수 없습니다.", values: raw };

  if (isPrivate && !auth.passwordHash && !newPassword) {
    return {
      ok: false,
      message: "비공개로 바꾸려면 새 비밀번호를 입력하세요.",
      fieldErrors: { newPassword: ["비공개 문의는 비밀번호가 필요합니다."] },
      values: raw,
    };
  }

  await inquiryRepository.updateInquiryByAuthor(id, {
    title,
    content,
    phone,
    isPrivate,
    ...(newPassword && isPrivate ? { passwordHash: await hashPassword(newPassword) } : {}),
  });
  invalidate(id);
  redirect(`/news/inquiry/${id}?updated=1`);
}

/** 작성자 본인의 문의 삭제 (답변 전까지만) */
export async function deleteOwnInquiryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = inquiryDeleteSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  const { id, currentPassword } = parsed.data;

  const { error } = await authorize(id, currentPassword);
  if (error) return { ok: false, message: error };

  const deleted = await inquiryRepository.deleteInquiryByAuthor(id);
  if (!deleted) return { ok: false, message: AUTH_MESSAGES.answered };
  invalidate(id);
  redirect("/news/inquiry?deleted=1");
}
