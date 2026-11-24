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

/* ───────────────────── 홈페이지에 고정된 도표·자료 ───────────────────── */

/**
 * 페이지 코드가 직접 쓰는 도표·자료의 내부 키.
 * 처음 값은 기존 화면(carbon-info.ts)과 같고, 관리자 > 도표 관리에서 수정·연도 추가한다.
 */
export const SYSTEM_CHART_SLUGS = {
  chungnamTotal: "system-chungnam-total",
  chungnamDirectIndirect: "system-chungnam-direct-indirect",
  chungnamLocalOutlook: "system-chungnam-local-outlook",
  koreaSectorEmissions: "system-korea-sector-emissions",
  nationalTarget: "system-national-target",
} as const;

export type SystemChartSlug = (typeof SYSTEM_CHART_SLUGS)[keyof typeof SYSTEM_CHART_SLUGS];

export interface SystemChart {
  slug: SystemChartSlug;
  /** 관리자 목록에 보이는 이름 */
  label: string;
  /** 이 자료가 쓰이는 화면 */
  usedIn: readonly string[];
  /**
   * 계열(열) 고정 — 화면이 열 위치로 값을 읽어 표·도표·메인 수치를 만드는 자료.
   * 관리자는 행(연도)과 값만 바꾼다.
   */
  fixedSeries?: readonly string[];
  /** 미리보기에 그릴 앞쪽 계열 수 (생략하면 전체) */
  previewSeries?: number;
  /** 편집 화면 안내 */
  guide: string;
}

export const SYSTEM_CHARTS: readonly SystemChart[] = [
  {
    slug: SYSTEM_CHART_SLUGS.chungnamTotal,
    label: "충청남도 부문별 총배출량",
    usedIn: [
      "메인 > 데이터로 보는 충남 탄소중립 (총배출량·감축 경로·부문 비중)",
      "충남 탄소중립 > 배출현황 (총배출량 표·부문별 도표·지자체 관리권한 도표)",
    ],
    fixedSeries: ["산업", "건물", "수송", "농축산", "폐기물", "흡수원", "총계(흡수원 제외)"],
    previewSeries: 5,
    guide:
      "새 연도 자료가 나오면 '행 추가'로 연도를 넣으세요. 마지막 행이 최신 연도로 쓰이며, 메인 화면 수치와 배출현황 표·도표가 함께 바뀝니다. 총계는 공식 자료 값을 그대로 입력하세요(부문 합과 반올림 차이가 날 수 있습니다). 제목 뒤에는 연도 범위가 자동으로 붙습니다.",
  },
  {
    slug: SYSTEM_CHART_SLUGS.chungnamDirectIndirect,
    label: "충청남도 직접·간접 배출량",
    usedIn: ["충남 탄소중립 > 배출현황"],
    guide: "새 연도는 '행 추가'로 넣으세요. 제목의 연도 범위도 함께 고쳐 주세요.",
  },
  {
    slug: SYSTEM_CHART_SLUGS.chungnamLocalOutlook,
    label: "지자체 관리권한 부문 배출량 실적과 전망",
    usedIn: ["충남 탄소중립 > 배출현황 (전망 표)"],
    fixedSeries: ["배출량"],
    guide:
      "표로 나오는 자료입니다. 연도 칸에 '2034(전망)'처럼 '전망'을 넣으면 강조해 표시합니다. 설명은 표 위 요약 문장, 주석은 표 아래 설명으로 나옵니다.",
  },
  {
    slug: SYSTEM_CHART_SLUGS.koreaSectorEmissions,
    label: "국내 분야별 온실가스 배출량 비교",
    usedIn: ["충남 탄소중립 > 탄소중립 이해 (온실가스 배출 현황)"],
    guide:
      "가로축은 분야, 계열은 연도입니다. 비교 연도를 바꾸거나 더하려면 계열 이름과 값을 고치세요. 바로 위 분야별 표는 비중(%)이 함께 실린 공식 표라 코드에서 관리합니다.",
  },
  {
    slug: SYSTEM_CHART_SLUGS.nationalTarget,
    label: "정부 탄소중립 목표",
    usedIn: ["충남 탄소중립 > 탄소중립 이해 (국가 2050 탄소중립)"],
    guide: "흡수·제거량처럼 줄어드는 값은 음수로 입력합니다.",
  },
];

export function systemChartOf(slug: string): SystemChart | null {
  return SYSTEM_CHARTS.find((c) => c.slug === slug) ?? null;
}
