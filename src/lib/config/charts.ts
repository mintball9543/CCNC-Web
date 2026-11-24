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
  chungnamTargets: "system-chungnam-targets",
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
    slug: SYSTEM_CHART_SLUGS.chungnamTargets,
    label: "충청남도 탄소중립 목표 (기준연도·감축률)",
    usedIn: [
      "메인 > 데이터로 보는 충남 탄소중립 (감축 목표·감축 경로)",
      "충남 탄소중립 > 충남 2045 비전·목표 (목표 문구·이정표)",
    ],
    fixedSeries: ["기준연도 대비 감축률(%)"],
    guide:
      "기본계획이 바뀌면 고치세요. 기준연도는 0, 탄소중립 연도는 100으로 입력하고, 그 사이 목표 연도(예: 2030년 43)를 넣습니다. 메인 감축 경로의 목표값은 기준연도 총배출량에 감축률을 적용해 계산합니다.",
  },
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

/* ───────────────────── 홈페이지에 들어간 표 (글자 표) ───────────────────── */

export const CONTENT_TABLE_SLUGS = {
  koreaSectorEmissions: "korea-sector-emissions",
  worldRanking: "world-ranking",
} as const;

export type ContentTableSlug = (typeof CONTENT_TABLE_SLUGS)[keyof typeof CONTENT_TABLE_SLUGS];

export interface ContentTableConfig {
  slug: ContentTableSlug;
  label: string;
  usedIn: string;
  guide: string;
}

export const CONTENT_TABLES: readonly ContentTableConfig[] = [
  {
    slug: CONTENT_TABLE_SLUGS.koreaSectorEmissions,
    label: "국내 분야별 온실가스 배출량 표",
    usedIn: "충남 탄소중립 > 탄소중립 이해 (온실가스 배출 현황)",
    guide:
      "값은 '240.4 (82.3)'처럼 배출량과 비중을 함께 적습니다. 새 연도는 '열 추가'로 넣으세요. 하위 분야는 앞에 전각 공백(　)을 넣으면 들여쓰기됩니다. 바로 아래 비교 도표는 '국내 분야별 온실가스 배출량 비교'에서 따로 고칩니다.",
  },
  {
    slug: CONTENT_TABLE_SLUGS.worldRanking,
    label: "국가별 온실가스 배출량 순위 표",
    usedIn: "충남 탄소중립 > 탄소중립 이해 (온실가스 배출 현황)",
    guide: "설명은 표 위 문장으로 나옵니다. 우리나라 행은 '행 전체 강조'로 표시합니다.",
  },
];

export function contentTableOf(slug: string): ContentTableConfig | null {
  return CONTENT_TABLES.find((t) => t.slug === slug) ?? null;
}
