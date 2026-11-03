"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { cacheTags } from "@/lib/cache/tags";
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

  await inquiryRepository.saveInquiryAnswer(parsed.data.id, {
    text: parsed.data.answer,
    answeredBy: session.displayName,
  });
  invalidate(parsed.data.id);
  return { ok: true, message: "답변이 저장되었습니다." };
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
