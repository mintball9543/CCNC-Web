"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit/record";
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

  const existingId = raw.id ? Number(raw.id) : null;
  const id = existingId
    ? (await popupRepository.updatePopup(existingId, parsed.data), existingId)
    : await popupRepository.insertPopup(parsed.data);
  const p = parsed.data;
  await recordAudit({
    action: existingId ? "popup.update" : "popup.create",
    target: `popups:${id}`,
    summary: `팝업 ${existingId ? "수정" : "등록"}: ${p.title} (${p.isActive ? "ON" : "OFF"}, ${
      p.position === "center" ? "중앙" : `X${p.left}·Y${p.top}`
    }, ${p.width}×${p.height ?? "auto"})`,
  });
  updateTag(cacheTags.popups);
  redirect("/admin/popups");
}

export async function togglePopupAction(id: number, isActive: boolean): Promise<void> {
  await requireAdmin();
  const popup = await popupRepository.findPopup(id);
  if (!popup) return;
  await popupRepository.updatePopup(id, { isActive });
  await recordAudit({
    action: "popup.toggle",
    target: `popups:${id}`,
    summary: `팝업 ${isActive ? "켜기" : "끄기"}: ${popup.title}`,
  });
  updateTag(cacheTags.popups);
}

export async function deletePopupAction(id: number): Promise<void> {
  await requireAdmin();
  const popup = await popupRepository.findPopup(id);
  if (popup) {
    await popupRepository.deletePopup(id);
    await recordAudit({
      action: "popup.delete",
      target: `popups:${id}`,
      summary: `팝업 삭제: ${popup.title}`,
    });
  }
  updateTag(cacheTags.popups);
  redirect("/admin/popups");
}
