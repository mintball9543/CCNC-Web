import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import type { ContentTableSlug, SystemChartSlug } from "@/lib/config/charts";
import { normalizeHomeSectionOrder } from "@/lib/config/home-sections";
import { applyMenuVisibility } from "@/lib/config/menu-visibility";
import { mainNavigation } from "@/lib/config/navigation";
import { siteConfig } from "@/lib/config/site";
import { contentTableDefault } from "@/lib/content/content-tables";
import { systemChartDefault } from "@/lib/content/system-charts";
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

/** 메인 화면 영역 순서 (메인 비주얼 아래) */
export async function getHomeSectionOrder() {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.homeSections);
  return normalizeHomeSectionOrder(await settingsRepository.findHomeSectionOrder());
}

export async function getOrgMembers() {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.org);
  return settingsRepository.listOrgMembers({ visibleOnly: true });
}

export async function getCommitteeMembers() {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.org);
  return settingsRepository.listCommitteeMembers({ visibleOnly: true });
}

/**
 * 페이지 코드가 직접 쓰는 도표·자료 (관리자 > 도표 관리 '홈페이지에 고정된 도표·자료').
 * 아직 DB 에 없으면 처음 값(기존 화면과 같은 값)을 쓴다.
 */
export async function getSystemChart(slug: SystemChartSlug) {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.charts);
  return (await settingsRepository.findChartBySlug(slug)) ?? systemChartDefault(slug);
}

/** 홈페이지에 들어간 글자 표 (관리자 > 도표 관리 > 표). 저장한 적이 없으면 처음 값 */
export async function getContentTable(slug: ContentTableSlug) {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.charts);
  return (await settingsRepository.findContentTable(slug))?.value ?? contentTableDefault(slug);
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
