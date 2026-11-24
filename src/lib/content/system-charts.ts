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
