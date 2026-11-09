/** 페이지에서 참조하는 도표 키 — 관리자 > 도표 관리의 '표시 위치'로 지정된다 */
export const CHART_SLUGS = {
  /** 충남 탄소중립 > 배출현황 */
  emissions: "chungnam-emissions",
} as const;

export interface ChartPlacement {
  /** 내부 키 (chart_datasets.slug) */
  slug: string;
  /** 관리자 화면에 보이는 메뉴 이름 */
  label: string;
  href: string;
}

/**
 * 도표를 넣을 수 있는 페이지(메뉴) 목록 — 관리자 '표시 위치' 드롭다운의 선택지.
 * 새 페이지에 도표를 넣으려면 여기에 추가하고 해당 페이지에서 getPublishedChart(slug) 를 호출한다.
 */
export const CHART_PLACEMENTS: readonly ChartPlacement[] = [
  {
    slug: CHART_SLUGS.emissions,
    label: "충남 탄소중립 > 배출현황",
    href: "/carbon-neutral/emissions",
  },
];

export function chartPlacementOf(slug: string): ChartPlacement | null {
  return CHART_PLACEMENTS.find((p) => p.slug === slug) ?? null;
}

/** 페이지에 지정되지 않은 도표의 내부 키 */
export function unplacedChartSlug(id: number | string): string {
  return `chart-${id}`;
}
