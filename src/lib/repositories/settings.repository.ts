import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  chartDatasets,
  heroSlides,
  menuSettings,
  orgMembers,
  relatedSites,
  siteSettings,
  statHighlights,
} from "@/lib/db/schema";
import type {
  ChartDataset,
  ContactSettings,
  HeroSlide,
  OrgMember,
  RelatedSite,
  StatHighlight,
} from "@/types";

/** 관리자 관리 콘텐츠(메뉴 노출·연락처·조직도·도표·실적·메인 비주얼) 데이터 접근 계층 */

// ── 메뉴 노출 ────────────────────────────────────────────
export async function listMenuSettings(): Promise<Record<string, boolean>> {
  const rows = await db.select().from(menuSettings);
  return Object.fromEntries(rows.map((r) => [r.key, r.isVisible]));
}

export async function saveMenuSettings(entries: Record<string, boolean>): Promise<void> {
  await db.transaction(async (tx) => {
    for (const [key, isVisible] of Object.entries(entries)) {
      await tx
        .insert(menuSettings)
        .values({ key, isVisible })
        .onConflictDoUpdate({
          target: menuSettings.key,
          set: { isVisible, updatedAt: new Date() },
        });
    }
  });
}

// ── 연락처 (site_settings: contact) ─────────────────────
export async function findContactSettings(): Promise<Partial<ContactSettings> | null> {
  const row = await db.query.siteSettings.findFirst({ where: eq(siteSettings.key, "contact") });
  return row?.value ?? null;
}

export async function saveContactSettings(value: ContactSettings): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key: "contact", value })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
}

// ── 조직도 ──────────────────────────────────────────────
export async function listOrgMembers({ visibleOnly = false } = {}): Promise<OrgMember[]> {
  return db
    .select()
    .from(orgMembers)
    .where(visibleOnly ? eq(orgMembers.isVisible, true) : undefined)
    .orderBy(desc(orgMembers.isHead), asc(orgMembers.sortOrder), asc(orgMembers.id));
}

export async function findOrgMember(id: number): Promise<OrgMember | null> {
  return (await db.query.orgMembers.findFirst({ where: eq(orgMembers.id, id) })) ?? null;
}

export async function saveOrgMember(
  id: number | null,
  values: Omit<OrgMember, "id">,
): Promise<void> {
  if (id) await db.update(orgMembers).set(values).where(eq(orgMembers.id, id));
  else await db.insert(orgMembers).values(values);
}

export async function deleteOrgMember(id: number): Promise<void> {
  await db.delete(orgMembers).where(eq(orgMembers.id, id));
}

// ── 도표 ────────────────────────────────────────────────
export async function listCharts({ publishedOnly = false } = {}): Promise<ChartDataset[]> {
  return db
    .select()
    .from(chartDatasets)
    .where(publishedOnly ? eq(chartDatasets.isPublished, true) : undefined)
    .orderBy(asc(chartDatasets.sortOrder), asc(chartDatasets.id));
}

export async function findChart(id: number): Promise<ChartDataset | null> {
  return (await db.query.chartDatasets.findFirst({ where: eq(chartDatasets.id, id) })) ?? null;
}

export async function findChartBySlug(slug: string): Promise<ChartDataset | null> {
  return (await db.query.chartDatasets.findFirst({ where: eq(chartDatasets.slug, slug) })) ?? null;
}

export async function saveChart(
  id: number | null,
  values: Omit<ChartDataset, "id">,
): Promise<number> {
  if (id) {
    await db.update(chartDatasets).set(values).where(eq(chartDatasets.id, id));
    return id;
  }
  const [row] = await db.insert(chartDatasets).values(values).returning({ id: chartDatasets.id });
  return row.id;
}

export async function deleteChart(id: number): Promise<void> {
  await db.delete(chartDatasets).where(eq(chartDatasets.id, id));
}

// ── 주요 실적(숫자로 보는 센터) ──────────────────────────
export async function listStats({ visibleOnly = false } = {}): Promise<StatHighlight[]> {
  return db
    .select()
    .from(statHighlights)
    .where(visibleOnly ? eq(statHighlights.isVisible, true) : undefined)
    .orderBy(asc(statHighlights.sortOrder), asc(statHighlights.id));
}

export async function saveStat(
  id: number | null,
  values: Omit<StatHighlight, "id">,
): Promise<void> {
  if (id) await db.update(statHighlights).set(values).where(eq(statHighlights.id, id));
  else await db.insert(statHighlights).values(values);
}

export async function deleteStat(id: number): Promise<void> {
  await db.delete(statHighlights).where(eq(statHighlights.id, id));
}

// ── 메인 비주얼 ──────────────────────────────────────────
export async function listHeroSlides({ activeOnly = false } = {}): Promise<HeroSlide[]> {
  return db
    .select()
    .from(heroSlides)
    .where(activeOnly ? eq(heroSlides.isActive, true) : undefined)
    .orderBy(asc(heroSlides.sortOrder), desc(heroSlides.id));
}

export async function findHeroSlide(id: number): Promise<HeroSlide | null> {
  return (await db.query.heroSlides.findFirst({ where: eq(heroSlides.id, id) })) ?? null;
}

export async function saveHeroSlide(
  id: number | null,
  values: Omit<HeroSlide, "id">,
): Promise<void> {
  if (id) await db.update(heroSlides).set(values).where(eq(heroSlides.id, id));
  else await db.insert(heroSlides).values(values);
}

export async function deleteHeroSlide(id: number): Promise<void> {
  await db.delete(heroSlides).where(eq(heroSlides.id, id));
}

/** 활동 갤러리 게시글과 연동된 슬라이드 */
export async function findHeroSlideByPostId(postId: number): Promise<HeroSlide | null> {
  return (await db.query.heroSlides.findFirst({ where: eq(heroSlides.postId, postId) })) ?? null;
}

/** 갤러리 게시글 저장 시 연동 슬라이드 생성·갱신 (문구·순서는 관리자가 바꾼 값 유지) */
export async function upsertHeroSlideForPost(
  postId: number,
  values: { imageUrl: string; imageAlt: string; title: string; linkUrl: string; isActive: boolean },
): Promise<void> {
  const existing = await findHeroSlideByPostId(postId);
  if (existing) {
    await db
      .update(heroSlides)
      .set({
        imageUrl: values.imageUrl,
        imageAlt: values.imageAlt,
        linkUrl: values.linkUrl,
        isActive: values.isActive,
      })
      .where(eq(heroSlides.id, existing.id));
  } else {
    await db.insert(heroSlides).values({ ...values, subtitle: "", postId, sortOrder: 0 });
  }
}

export async function deleteHeroSlidesByPostIds(postIds: number[]): Promise<number> {
  if (postIds.length === 0) return 0;
  const removed = await db
    .delete(heroSlides)
    .where(inArray(heroSlides.postId, postIds))
    .returning({ id: heroSlides.id });
  return removed.length;
}

// ── 관련 기관 사이트 ─────────────────────────────────────
export async function listRelatedSites({ visibleOnly = false } = {}): Promise<RelatedSite[]> {
  return db
    .select()
    .from(relatedSites)
    .where(visibleOnly ? eq(relatedSites.isVisible, true) : undefined)
    .orderBy(asc(relatedSites.sortOrder), asc(relatedSites.id));
}

export async function findRelatedSite(id: number): Promise<RelatedSite | null> {
  return (await db.query.relatedSites.findFirst({ where: eq(relatedSites.id, id) })) ?? null;
}

export async function saveRelatedSite(
  id: number | null,
  values: Omit<RelatedSite, "id">,
): Promise<void> {
  if (id) await db.update(relatedSites).set(values).where(eq(relatedSites.id, id));
  else await db.insert(relatedSites).values(values);
}

export async function deleteRelatedSite(id: number): Promise<void> {
  await db.delete(relatedSites).where(eq(relatedSites.id, id));
}
