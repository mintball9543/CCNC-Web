/**
 * 홈페이지에 고정된 도표·자료의 처음 값 (기존 carbon-info.ts 값 그대로).
 * DB 에 없으면 이 값으로 화면을 그리고, 관리자 > 도표 관리를 열면 DB 에 옮겨진다.
 */
import { SYSTEM_CHART_SLUGS, SYSTEM_CHARTS, type SystemChartSlug } from "@/lib/config/charts";
import type { ChartDataset } from "@/types";
import {
  CHUNGNAM_DIRECT_INDIRECT_CHART,
  CHUNGNAM_LOCAL_OUTLOOK_DATA,
  CHUNGNAM_TARGETS_DATA,
  CHUNGNAM_TOTAL_DATA,
  KOREA_SECTOR_EMISSIONS_CHART,
  NATIONAL_TARGET_CHART,
  type StaticChart,
} from "./carbon-info";

const DEFAULTS: Record<SystemChartSlug, StaticChart> = {
  [SYSTEM_CHART_SLUGS.chungnamTotal]: CHUNGNAM_TOTAL_DATA,
  [SYSTEM_CHART_SLUGS.chungnamDirectIndirect]: CHUNGNAM_DIRECT_INDIRECT_CHART,
  [SYSTEM_CHART_SLUGS.chungnamLocalOutlook]: CHUNGNAM_LOCAL_OUTLOOK_DATA,
  [SYSTEM_CHART_SLUGS.koreaSectorEmissions]: KOREA_SECTOR_EMISSIONS_CHART,
  [SYSTEM_CHART_SLUGS.nationalTarget]: NATIONAL_TARGET_CHART,
  [SYSTEM_CHART_SLUGS.chungnamTargets]: CHUNGNAM_TARGETS_DATA,
};

/** DB 에 넣을 처음 값 */
export function systemChartDefault(slug: SystemChartSlug): Omit<ChartDataset, "id"> {
  const c = DEFAULTS[slug];
  return {
    slug,
    title: c.title,
    description: c.description ?? "",
    notes: c.notes ?? "",
    unit: c.unit,
    chartType: c.chartType,
    categoryLabel: c.categoryLabel,
    series: [...c.series],
    rows: c.rows.map((r) => ({ label: r.label, values: [...r.values] })),
    source: c.source ?? "",
    sourceUrl: c.sourceUrl ?? null,
    isPublished: true,
    showOnHome: false,
    sortOrder: SYSTEM_CHARTS.findIndex((s) => s.slug === slug),
  };
}

export function allSystemChartDefaults(): Omit<ChartDataset, "id">[] {
  return SYSTEM_CHARTS.map((c) => systemChartDefault(c.slug));
}

/** 비교할 내용 — 화면에 보이는 값만 (키·공개 여부·순서·수정일 제외) */
export type ChartContent = Pick<
  ChartDataset,
  | "title"
  | "description"
  | "notes"
  | "unit"
  | "chartType"
  | "categoryLabel"
  | "series"
  | "rows"
  | "source"
  | "sourceUrl"
>;

/** 비교용 내용 문자열 (내부 키·공개 여부·순서 제외) */
export const systemChartContentKey = (c: ChartContent) =>
  JSON.stringify([
    c.title,
    c.description ?? "",
    c.notes ?? "",
    c.unit,
    c.chartType,
    c.categoryLabel,
    c.series,
    c.rows.map((r) => [r.label, r.values]),
    c.source ?? "",
    c.sourceUrl ?? null,
  ]);

/**
 * 저장된 자료가 코드에 넣어 둔 최신 공식 값(처음 값)과 다른지.
 * 새 공식 자료로 처음 값을 고친 뒤, 관리자에서 '최신 공식 값으로 바꾸기'를 안내할 때 쓴다.
 */
export function differsFromSystemDefault(slug: SystemChartSlug, saved: ChartContent): boolean {
  return systemChartContentKey(saved) !== systemChartContentKey(systemChartDefault(slug));
}
