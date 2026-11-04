"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { cacheTags } from "@/lib/cache/tags";
import { siteConfig } from "@/lib/config/site";
import { isMailConfigured, sendMail } from "@/lib/mail/mailer";
import { inquiryAnsweredMail } from "@/lib/mail/templates";
import * as inquiryRepository from "@/lib/repositories/inquiry.repository";
import { formDataToObject, validationError } from "@/lib/validation/common";
import { inquiryAnswerSchema } from "@/lib/validation/inquiry.schema";
import type { ActionState } from "@/types";

function invalidate(id: number) {
  updateTag(cacheTags.inquiries);
  updateTag(cacheTags.inquiry(id));
}

/** 답변 등록/수정 */
export async function saveAnswerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  const raw = formDataToObject(formData);
  const parsed = inquiryAnswerSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);

  const { id, answer, notify } = parsed.data;
  await inquiryRepository.saveInquiryAnswer(id, { text: answer, answeredBy: session.displayName });
  invalidate(id);

  if (!notify) return { ok: true, message: "답변이 저장되었습니다." };
  if (!isMailConfigured()) {
    return {
      ok: true,
      message:
        "답변이 저장되었습니다. (메일 서버가 설정되지 않아 알림 메일은 발송되지 않았습니다 — .env 의 SMTP 설정 확인)",
    };
  }

  const inquiry = await inquiryRepository.findInquiry(id);
  if (!inquiry) return { ok: false, message: "문의를 찾을 수 없습니다." };
  const mail = inquiryAnsweredMail({
    siteName: siteConfig.name,
    authorName: inquiry.authorName,
    inquiryTitle: inquiry.title,
    answer,
    inquiryUrl: `${siteConfig.url}/news/inquiry/${id}`,
    isPrivate: inquiry.isPrivate,
  });
  const result = await sendMail({ to: inquiry.email, ...mail });
  if (!result.sent) {
    return {
      ok: true,
      message: "답변은 저장되었으나 알림 메일 발송에 실패했습니다. 메일 설정을 확인하세요.",
    };
  }
  await inquiryRepository.markInquiryNotified(id);
  return { ok: true, message: `답변이 저장되었고 ${inquiry.email} 로 알림 메일을 보냈습니다.` };
}

/** 답변 삭제 (답변대기 상태로 되돌림) */
export async function deleteAnswerAction(id: number): Promise<void> {
  await requireAdmin();
  await inquiryRepository.saveInquiryAnswer(id, null);
  invalidate(id);
}

/** 문의 삭제 */
export async function deleteInquiryAction(id: number): Promise<void> {
  await requireAdmin();
  await inquiryRepository.deleteInquiry(id);
  invalidate(id);
  redirect("/admin/inquiries");
}
