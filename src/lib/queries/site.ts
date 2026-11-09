import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import { applyMenuVisibility } from "@/lib/config/menu-visibility";
import { mainNavigation } from "@/lib/config/navigation";
import { siteConfig } from "@/lib/config/site";
import * as settingsRepository from "@/lib/repositories/settings.repository";
import type { ContactSettings } from "@/types";

/** 공개 화면용 사이트 설정 조회 (캐시 — 관리자 저장 시 updateTag 로 즉시 갱신) */

export async function getMenuSettings() {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.menu);
  return settingsRepository.listMenuSettings();
}

/** 노출 설정이 적용된 메뉴 트리 */
export async function getVisibleNavigation() {
  return applyMenuVisibility(mainNavigation, await getMenuSettings());
}

export async function getContactSettings(): Promise<ContactSettings> {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.settings);
  const saved = await settingsRepository.findContactSettings();
  return { ...siteConfig.contactDefaults, ...saved };
}

export async function getOrgMembers() {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.org);
  return settingsRepository.listOrgMembers({ visibleOnly: true });
}

export async function getPublishedChart(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.charts);
  const chart = await settingsRepository.findChartBySlug(slug);
  return chart?.isPublished ? chart : null;
}

export async function getHomeCharts() {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.charts);
  const charts = await settingsRepository.listCharts({ publishedOnly: true });
  return charts.filter((c) => c.showOnHome && c.rows.length > 0);
}

export async function getVisibleStats() {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.stats);
  return settingsRepository.listStats({ visibleOnly: true });
}

export async function getActiveHeroSlides() {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.heroSlides);
  return settingsRepository.listHeroSlides({ activeOnly: true });
}

/** 하단 관련 기관 사이트 (관리자 > 관련 사이트에서 수정) */
export async function getRelatedSites() {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.relatedSites);
  return settingsRepository.listRelatedSites({ visibleOnly: true });
}
