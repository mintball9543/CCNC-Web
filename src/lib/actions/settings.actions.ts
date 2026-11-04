"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/guard";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { cacheTags } from "@/lib/cache/tags";
import { sectionKey } from "@/lib/config/menu-visibility";
import { mainNavigation } from "@/lib/config/navigation";
import { findAdminById, updateAdminPassword } from "@/lib/repositories/admin-user.repository";
import * as settingsRepository from "@/lib/repositories/settings.repository";
import { formDataToObject, validationError } from "@/lib/validation/common";
import { contactSchema, passwordChangeSchema } from "@/lib/validation/settings.schema";
import type { ActionState } from "@/types";

/** 메뉴 노출 설정 저장 — 체크된 항목(visible) 만 표시 */
export async function saveMenuSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const visible = new Set(formData.getAll("visible").map(String));
  const entries: Record<string, boolean> = {};
  for (const section of mainNavigation) {
    entries[sectionKey(section.key)] = visible.has(sectionKey(section.key));
    for (const item of section.items) entries[item.href] = visible.has(item.href);
  }
  await settingsRepository.saveMenuSettings(entries);
  updateTag(cacheTags.menu);
  return { ok: true, message: "메뉴 표시 설정을 저장했습니다." };
}

/** 기관 연락처 저장 (푸터·오시는 길) */
export async function saveContactAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  await settingsRepository.saveContactSettings(parsed.data);
  updateTag(cacheTags.settings);
  return { ok: true, message: "기관 정보를 저장했습니다." };
}

/** 관리자 비밀번호 변경 */
export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  const parsed = passwordChangeSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationError(parsed.error);

  const admin = await findAdminById(session.userId);
  if (!admin || !(await verifyPassword(parsed.data.currentPassword, admin.passwordHash))) {
    return {
      ok: false,
      message: "현재 비밀번호가 올바르지 않습니다.",
      fieldErrors: { currentPassword: ["현재 비밀번호가 올바르지 않습니다."] },
    };
  }
  await updateAdminPassword(admin.id, await hashPassword(parsed.data.newPassword));
  return {
    ok: true,
    message: "비밀번호를 변경했습니다. 다음 로그인부터 새 비밀번호를 사용하세요.",
  };
}
