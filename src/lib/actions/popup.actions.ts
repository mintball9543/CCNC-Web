"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { cacheTags } from "@/lib/cache/tags";
import * as popupRepository from "@/lib/repositories/popup.repository";
import { formDataToObject, validationError } from "@/lib/validation/common";
import { popupSchema } from "@/lib/validation/popup.schema";
import type { ActionState } from "@/types";

/** 팝업 생성/수정 — hidden 필드 id 가 있으면 수정 */
export async function savePopupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  const parsed = popupSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);

  const id = raw.id ? Number(raw.id) : null;
  if (id) {
    await popupRepository.updatePopup(id, parsed.data);
  } else {
    await popupRepository.insertPopup(parsed.data);
  }
  updateTag(cacheTags.popups);
  redirect("/admin/popups");
}

export async function togglePopupAction(id: number, isActive: boolean): Promise<void> {
  await requireAdmin();
  await popupRepository.updatePopup(id, { isActive });
  updateTag(cacheTags.popups);
}

export async function deletePopupAction(id: number): Promise<void> {
  await requireAdmin();
  await popupRepository.deletePopup(id);
  updateTag(cacheTags.popups);
  redirect("/admin/popups");
}
