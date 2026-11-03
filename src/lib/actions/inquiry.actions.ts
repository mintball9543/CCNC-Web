"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { cacheTags } from "@/lib/cache/tags";
import * as inquiryRepository from "@/lib/repositories/inquiry.repository";
import { formDataToObject, validationError } from "@/lib/validation/common";
import { inquiryPasswordSchema, inquirySchema } from "@/lib/validation/inquiry.schema";
import type { ActionState, Inquiry } from "@/types";

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
    passwordHash: await hashPassword(password),
  });
  updateTag(cacheTags.inquiries);
  redirect(`/news/inquiry/${id}?created=1`);
}

export type UnlockedInquiry = Pick<Inquiry, "content" | "answer" | "answeredAt">;

/** 비공개 문의 열람 — 작성 시 입력한 비밀번호 확인 */
export async function unlockInquiryAction(
  _prev: ActionState<UnlockedInquiry>,
  formData: FormData,
): Promise<ActionState<UnlockedInquiry>> {
  const parsed = inquiryPasswordSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationError(parsed.error);

  const hash = await inquiryRepository.findInquiryPasswordHash(parsed.data.id);
  if (!hash || !(await verifyPassword(parsed.data.password, hash))) {
    return { ok: false, message: "비밀번호가 일치하지 않습니다." };
  }
  const inquiry = await inquiryRepository.findInquiry(parsed.data.id);
  if (!inquiry) return { ok: false, message: "문의를 찾을 수 없습니다." };

  return {
    ok: true,
    data: { content: inquiry.content, answer: inquiry.answer, answeredAt: inquiry.answeredAt },
  };
}
