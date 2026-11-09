"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit/record";
import { requireAdmin } from "@/lib/auth/guard";
import { cacheTags } from "@/lib/cache/tags";
import * as settingsRepository from "@/lib/repositories/settings.repository";
import { formDataToObject, validationError } from "@/lib/validation/common";
import {
  chartSchema,
  heroSlideSchema,
  orgMemberSchema,
  relatedSiteSchema,
  statSchema,
} from "@/lib/validation/settings.schema";
import type { ActionState } from "@/types";

/** 관리자 관리 콘텐츠: 조직도 · 도표 · 숫자로 보는 센터 · 메인 비주얼 · 관련 사이트 */

const idOf = (raw: Record<string, string>) => (raw.id ? Number(raw.id) : null);
const verb = (id: number | null) => (id ? "수정" : "등록");

// ── 조직도 ──────────────────────────────────────────────
export async function saveOrgMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  const parsed = orgMemberSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  const id = idOf(raw);
  await settingsRepository.saveOrgMember(id, parsed.data);
  await recordAudit({
    action: id ? "org.update" : "org.create",
    target: id ? `org_members:${id}` : null,
    summary: `조직도 구성원 ${verb(id)}: ${parsed.data.department} ${parsed.data.position} ${parsed.data.name}`,
  });
  updateTag(cacheTags.org);
  redirect("/admin/organization");
}

export async function deleteOrgMemberAction(id: number): Promise<void> {
  await requireAdmin();
  const member = await settingsRepository.findOrgMember(id);
  if (member) {
    await settingsRepository.deleteOrgMember(id);
    await recordAudit({
      action: "org.delete",
      target: `org_members:${id}`,
      summary: `조직도 구성원 삭제: ${member.department} ${member.position} ${member.name}`,
    });
  }
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
  const savedId = await settingsRepository.saveChart(id, parsed.data);
  await recordAudit({
    action: id ? "chart.update" : "chart.create",
    target: `chart_datasets:${savedId}`,
    summary: `도표 ${verb(id)}: ${parsed.data.title} (${parsed.data.rows.length}행, ${
      parsed.data.isPublished ? "공개" : "비공개"
    })`,
  });
  updateTag(cacheTags.charts);
  redirect("/admin/charts");
}

export async function deleteChartAction(id: number): Promise<void> {
  await requireAdmin();
  const chart = await settingsRepository.findChart(id);
  if (chart) {
    await settingsRepository.deleteChart(id);
    await recordAudit({
      action: "chart.delete",
      target: `chart_datasets:${id}`,
      summary: `도표 삭제: ${chart.title}`,
    });
  }
  updateTag(cacheTags.charts);
  redirect("/admin/charts");
}

// ── 숫자로 보는 센터 ─────────────────────────────────────
export async function saveStatAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  const parsed = statSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  const id = idOf(raw);
  await settingsRepository.saveStat(id, parsed.data);
  await recordAudit({
    action: id ? "stat.update" : "stat.create",
    target: id ? `stat_highlights:${id}` : null,
    summary: `숫자로 보는 센터 ${verb(id)}: ${parsed.data.label} ${parsed.data.value.toLocaleString("ko-KR")}${parsed.data.unit}`,
  });
  updateTag(cacheTags.stats);
  return { ok: true, message: "저장했습니다." };
}

export async function deleteStatAction(id: number): Promise<void> {
  await requireAdmin();
  const stat = (await settingsRepository.listStats()).find((s) => s.id === id);
  if (stat) {
    await settingsRepository.deleteStat(id);
    await recordAudit({
      action: "stat.delete",
      target: `stat_highlights:${id}`,
      summary: `숫자로 보는 센터 삭제: ${stat.label}`,
    });
  }
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
  const id = idOf(raw);
  await settingsRepository.saveHeroSlide(id, parsed.data);
  await recordAudit({
    action: id ? "hero.update" : "hero.create",
    target: id ? `hero_slides:${id}` : null,
    summary: `메인 비주얼 ${verb(id)}: ${parsed.data.title || parsed.data.imageAlt}${
      parsed.data.postId ? ` (활동 갤러리 #${parsed.data.postId} 연동)` : ""
    }`,
  });
  updateTag(cacheTags.heroSlides);
  redirect("/admin/hero");
}

export async function deleteHeroSlideAction(id: number): Promise<void> {
  await requireAdmin();
  const slide = await settingsRepository.findHeroSlide(id);
  if (slide) {
    await settingsRepository.deleteHeroSlide(id);
    await recordAudit({
      action: "hero.delete",
      target: `hero_slides:${id}`,
      summary: `메인 비주얼 삭제: ${slide.title || slide.imageAlt}`,
    });
  }
  updateTag(cacheTags.heroSlides);
  redirect("/admin/hero");
}

// ── 관련 기관 사이트 ─────────────────────────────────────
export async function saveRelatedSiteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  const parsed = relatedSiteSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  const id = idOf(raw);
  await settingsRepository.saveRelatedSite(id, parsed.data);
  await recordAudit({
    action: id ? "related_site.update" : "related_site.create",
    target: id ? `related_sites:${id}` : null,
    summary: `관련 사이트 ${verb(id)}: ${parsed.data.name} (${parsed.data.url})`,
  });
  updateTag(cacheTags.relatedSites);
  redirect("/admin/related-sites");
}

export async function deleteRelatedSiteAction(id: number): Promise<void> {
  await requireAdmin();
  const site = await settingsRepository.findRelatedSite(id);
  if (site) {
    await settingsRepository.deleteRelatedSite(id);
    await recordAudit({
      action: "related_site.delete",
      target: `related_sites:${id}`,
      summary: `관련 사이트 삭제: ${site.name}`,
    });
  }
  updateTag(cacheTags.relatedSites);
  redirect("/admin/related-sites");
}
