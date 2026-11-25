"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit/record";
import { requireAdmin } from "@/lib/auth/guard";
import { cacheTags } from "@/lib/cache/tags";
import { contentTableOf, systemChartOf, type SystemChart } from "@/lib/config/charts";
import { contentTableDefault } from "@/lib/content/content-tables";
import { systemDefaultFingerprint, tableDefaultFingerprint } from "@/lib/content/official-updates";
import { systemChartDefault } from "@/lib/content/system-charts";
import * as settingsRepository from "@/lib/repositories/settings.repository";
import { formDataToObject, validationError } from "@/lib/validation/common";
import {
  contentTableSchema,
  systemChartSchema,
  heroSlideSchema,
  committeeMemberSchema,
  orgMemberSchema,
  relatedSiteSchema,
  statSchema,
} from "@/lib/validation/settings.schema";
import type { ActionState, ChartDataset } from "@/types";

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
    summary: `조직도 구성원 ${verb(id)}: ${[parsed.data.department, parsed.data.position, parsed.data.name].filter(Boolean).join(" ")}`,
  });
  updateTag(cacheTags.org);
  redirect("/admin/organization");
}

export async function saveCommitteeMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  const parsed = committeeMemberSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  const id = idOf(raw);
  await settingsRepository.saveCommitteeMember(id, parsed.data);
  await recordAudit({
    action: id ? "committee.update" : "committee.create",
    target: id ? `committee_members:${id}` : null,
    summary: `운영위원 ${verb(id)}: ${parsed.data.organization} ${parsed.data.name}`,
  });
  updateTag(cacheTags.org);
  redirect("/admin/committee");
}

export async function deleteCommitteeMemberAction(id: number): Promise<void> {
  await requireAdmin();
  const member = await settingsRepository.findCommitteeMember(id);
  if (member) {
    await settingsRepository.deleteCommitteeMember(id);
    await recordAudit({
      action: "committee.delete",
      target: `committee_members:${id}`,
      summary: `운영위원 삭제: ${member.organization} ${member.name}`,
    });
  }
  updateTag(cacheTags.org);
  redirect("/admin/committee");
}

export async function deleteOrgMemberAction(id: number): Promise<void> {
  await requireAdmin();
  const member = await settingsRepository.findOrgMember(id);
  if (member) {
    await settingsRepository.deleteOrgMember(id);
    await recordAudit({
      action: "org.delete",
      target: `org_members:${id}`,
      summary: `조직도 구성원 삭제: ${[member.department, member.position, member.name].filter(Boolean).join(" ")}`,
    });
  }
  updateTag(cacheTags.org);
  redirect("/admin/organization");
}

// ── 도표 ────────────────────────────────────────────────
/** 도표·자료 저장 — 홈페이지에 고정된 도표·자료만 있다 (새 도표 만들기·삭제 없음) */
export async function saveChartAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  const id = idOf(raw);
  const existing = id ? await settingsRepository.findChart(id) : null;
  const system = existing ? systemChartOf(existing.slug) : null;
  if (!existing || !system) return { ok: false, message: "도표를 찾을 수 없습니다.", values: raw };
  return saveSystemChart(existing, system, raw);
}

/** 홈페이지에 고정된 도표·자료 저장 — 내부 키·공개 여부는 그대로, 계열 고정 자료는 계열을 바꿀 수 없다 */
async function saveSystemChart(
  current: ChartDataset,
  system: SystemChart,
  raw: Record<string, string>,
): Promise<ActionState> {
  const parsed = systemChartSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  const data = parsed.data;
  if (system.fixedSeries) {
    const same =
      data.series.length === system.fixedSeries.length &&
      data.series.every((name, i) => name === system.fixedSeries![i]);
    if (!same) {
      return {
        ok: false,
        message: `이 자료의 계열(${system.fixedSeries.join(", ")})은 바꿀 수 없습니다.`,
        values: raw,
      };
    }
  }
  await settingsRepository.saveChart(current.id, {
    ...data,
    chartType: system.fixedSeries ? current.chartType : data.chartType,
    slug: current.slug,
    isPublished: true,
    showOnHome: false,
    sortOrder: current.sortOrder,
  });
  // 저장할 때 보고 있던 공식 자료는 확인한 것으로 남긴다 (그 뒤 공식 자료가 바뀔 때만 알림)
  await settingsRepository.saveOfficialAck(
    "chart",
    system.slug,
    systemDefaultFingerprint(system.slug),
  );
  await recordAudit({
    action: "chart.update",
    target: `chart_datasets:${current.id}`,
    summary: `도표 수정: ${data.title} (${data.rows.length}행, 홈페이지 고정 자료 '${system.label}')`,
  });
  updateTag(cacheTags.charts);
  redirect("/admin/charts");
}

/**
 * 홈페이지에 고정된 도표·자료를 코드에 넣어 둔 최신 공식 값으로 바꾼다.
 * 새 공식 통계로 처음 값(carbon-info.ts)을 고친 뒤, 이미 DB 에 저장된 자료를 갱신할 때 쓴다.
 */
export async function resetSystemChartAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const existing = Number.isInteger(id) && id > 0 ? await settingsRepository.findChart(id) : null;
  const system = existing ? systemChartOf(existing.slug) : null;
  if (!existing || !system) redirect("/admin/charts");
  const values = systemChartDefault(system.slug);
  await settingsRepository.saveChart(existing.id, { ...values, sortOrder: existing.sortOrder });
  await settingsRepository.saveOfficialAck(
    "chart",
    system.slug,
    systemDefaultFingerprint(system.slug),
  );
  await recordAudit({
    action: "chart.reset",
    target: `chart_datasets:${existing.id}`,
    summary: `도표 최신 공식 값으로 변경: ${system.label} (${values.rows.length}행)`,
  });
  updateTag(cacheTags.charts);
  redirect("/admin/charts");
}

/** 홈페이지 글자 표를 코드에 넣어 둔 최신 공식 표로 바꾼다 */
export async function resetContentTableAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const config = contentTableOf(String(formData.get("slug") ?? ""));
  if (!config) redirect("/admin/charts");
  const table = contentTableDefault(config.slug);
  await settingsRepository.saveContentTable(config.slug, table);
  await settingsRepository.saveOfficialAck(
    "table",
    config.slug,
    tableDefaultFingerprint(config.slug),
  );
  await recordAudit({
    action: "table.reset",
    target: `site_settings:table:${config.slug}`,
    summary: `표 최신 공식 값으로 변경: ${config.label} (${table.rows.length}행 × ${table.head.length}열)`,
  });
  updateTag(cacheTags.charts);
  redirect("/admin/charts");
}

/** '새 공식 자료 있음' 알림 끄기 — 지금 값을 그대로 두고, 지금의 공식 자료를 확인한 것으로 남긴다 */
export async function dismissOfficialUpdateAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const kind = formData.get("kind");
  const slug = String(formData.get("slug") ?? "");
  if (kind === "chart") {
    const system = systemChartOf(slug);
    if (system) {
      await settingsRepository.saveOfficialAck(
        "chart",
        system.slug,
        systemDefaultFingerprint(system.slug),
      );
      await recordAudit({
        action: "chart.official_dismiss",
        target: `chart_datasets:${system.slug}`,
        summary: `새 공식 자료 알림 끔 (지금 값 유지): ${system.label}`,
      });
    }
  } else if (kind === "table") {
    const config = contentTableOf(slug);
    if (config) {
      await settingsRepository.saveOfficialAck(
        "table",
        config.slug,
        tableDefaultFingerprint(config.slug),
      );
      await recordAudit({
        action: "table.official_dismiss",
        target: `site_settings:table:${config.slug}`,
        summary: `새 공식 자료 알림 끔 (지금 값 유지): ${config.label}`,
      });
    }
  }
  redirect("/admin/charts");
}

/** 홈페이지 글자 표 저장 — 저장하면 해당 페이지에 바로 반영 */
export async function saveContentTableAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  // 어떤 표인지는 폼의 hidden slug 로 받고, 정해진 표 목록에 있는지 서버에서 다시 확인한다
  const config = contentTableOf(raw.slug ?? "");
  if (!config) return { ok: false, message: "표를 찾을 수 없습니다.", values: raw };
  const parsed = contentTableSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  await settingsRepository.saveContentTable(config.slug, parsed.data);
  await settingsRepository.saveOfficialAck(
    "table",
    config.slug,
    tableDefaultFingerprint(config.slug),
  );
  await recordAudit({
    action: "table.update",
    target: `site_settings:table:${config.slug}`,
    summary: `표 수정: ${config.label} (${parsed.data.rows.length}행 × ${parsed.data.head.length}열)`,
  });
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
