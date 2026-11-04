"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { cacheTags } from "@/lib/cache/tags";
import * as settingsRepository from "@/lib/repositories/settings.repository";
import { formDataToObject, validationError } from "@/lib/validation/common";
import {
  chartSchema,
  heroSlideSchema,
  orgMemberSchema,
  statSchema,
} from "@/lib/validation/settings.schema";
import type { ActionState } from "@/types";

/** 관리자 관리 콘텐츠: 조직도 · 도표 · 숫자로 보는 센터 · 메인 비주얼 */

const idOf = (raw: Record<string, string>) => (raw.id ? Number(raw.id) : null);

// ── 조직도 ──────────────────────────────────────────────
export async function saveOrgMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  const parsed = orgMemberSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  await settingsRepository.saveOrgMember(idOf(raw), parsed.data);
  updateTag(cacheTags.org);
  redirect("/admin/organization");
}

export async function deleteOrgMemberAction(id: number): Promise<void> {
  await requireAdmin();
  await settingsRepository.deleteOrgMember(id);
  updateTag(cacheTags.org);
  redirect("/admin/organization");
}

// ── 도표 ────────────────────────────────────────────────
export async function saveChartAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  const parsed = chartSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);

  const id = idOf(raw);
  const duplicate = await settingsRepository.findChartBySlug(parsed.data.slug);
  if (duplicate && duplicate.id !== id) {
    return {
      ok: false,
      message: "이미 사용 중인 키입니다.",
      fieldErrors: { slug: ["이미 사용 중인 키입니다."] },
      values: raw,
    };
  }
  await settingsRepository.saveChart(id, parsed.data);
  updateTag(cacheTags.charts);
  redirect("/admin/charts");
}

export async function deleteChartAction(id: number): Promise<void> {
  await requireAdmin();
  await settingsRepository.deleteChart(id);
  updateTag(cacheTags.charts);
  redirect("/admin/charts");
}

// ── 숫자로 보는 센터 ─────────────────────────────────────
export async function saveStatAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  const parsed = statSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  await settingsRepository.saveStat(idOf(raw), parsed.data);
  updateTag(cacheTags.stats);
  return { ok: true, message: "저장했습니다." };
}

export async function deleteStatAction(id: number): Promise<void> {
  await requireAdmin();
  await settingsRepository.deleteStat(id);
  updateTag(cacheTags.stats);
}

// ── 메인 비주얼 ──────────────────────────────────────────
export async function saveHeroSlideAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  const parsed = heroSlideSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  await settingsRepository.saveHeroSlide(idOf(raw), parsed.data);
  updateTag(cacheTags.heroSlides);
  redirect("/admin/hero");
}

export async function deleteHeroSlideAction(id: number): Promise<void> {
  await requireAdmin();
  await settingsRepository.deleteHeroSlide(id);
  updateTag(cacheTags.heroSlides);
  redirect("/admin/hero");
}
