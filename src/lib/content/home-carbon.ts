/**
 * 메인 '데이터로 보는 충남 탄소중립' 영역 데이터.
 * 수치는 모두 carbon-info.ts(기존 홈페이지 '탄소중립 정보'에서 옮긴 공식 자료)에서 계산한다.
 * 여기에 새 수치를 직접 적지 않는다.
 */
import {
  type InfoCell,
  CHUNGNAM_2045,
  CHUNGNAM_TOTAL_CHART,
  CHUNGNAM_TOTAL_TABLE,
} from "./carbon-info";

/** 충남 2045 기본계획: 2018년 대비 2030년 감축률 (CHUNGNAM_2045.goal 문구와 같아야 한다) */
export const CHUNGNAM_2030_REDUCTION_RATE = 0.43;
export const CHUNGNAM_BASE_YEAR = "2018";
export const CHUNGNAM_UNIT = CHUNGNAM_TOTAL_CHART.unit;
export const CHUNGNAM_TOTAL_SOURCE = CHUNGNAM_TOTAL_CHART.source ?? "";
export const CHUNGNAM_PLAN_SOURCE = CHUNGNAM_2045.source;

const round1 = (v: number) => Math.round(v * 10) / 10;

const cellText = (c: InfoCell) => (typeof c === "string" ? c : c.text);

/**
 * 연도별 총배출량(흡수원 제외) — 총배출량 표의 '총계' 행을 그대로 쓴다.
 * (부문별 값은 반올림돼 있어 더하면 공식 총계와 0.1 차이가 날 수 있다)
 */
export function chungnamTotals(): { year: string; total: number }[] {
  const years = CHUNGNAM_TOTAL_TABLE.head[0].slice(1).map((c) => cellText(c).replace("년", ""));
  const totalRow = CHUNGNAM_TOTAL_TABLE.rows[CHUNGNAM_TOTAL_TABLE.rows.length - 1];
  return totalRow.slice(1).map((c, i) => ({ year: years[i], total: Number(cellText(c)) }));
}

export type PathwayKind = "actual" | "target" | "netZero";

export interface PathwayPoint {
  year: string;
  value: number;
  kind: PathwayKind;
}

/** 실적(2016~최신) → 2030 목표(기준연도 × (1 − 43%)) → 2045 순배출 0 */
export function chungnamPathway(): PathwayPoint[] {
  const totals = chungnamTotals();
  const base = totals.find((t) => t.year === CHUNGNAM_BASE_YEAR);
  if (!base) throw new Error(`${CHUNGNAM_BASE_YEAR}년 총배출량이 없습니다.`);
  return [
    ...totals.map((t) => ({ year: t.year, value: t.total, kind: "actual" as const })),
    {
      year: "2030",
      value: round1(base.total * (1 - CHUNGNAM_2030_REDUCTION_RATE)),
      kind: "target",
    },
    { year: "2045", value: 0, kind: "netZero" },
  ];
}

export interface SectorShare {
  sector: string;
  value: number;
  /** 비중 (%, 소수 첫째 자리) */
  share: number;
  /** 지자체 관리권한(비산업) 부문 여부 */
  local: boolean;
}

/** 최신 연도 부문별 배출 비중 */
export function chungnamSectorShares(): { year: string; total: number; sectors: SectorShare[] } {
  const latest = CHUNGNAM_TOTAL_CHART.rows[CHUNGNAM_TOTAL_CHART.rows.length - 1];
  const total = chungnamTotals().find((t) => t.year === latest.label)?.total;
  if (!total) throw new Error(`${latest.label}년 총배출량이 없습니다.`);
  return {
    year: latest.label,
    total,
    sectors: CHUNGNAM_TOTAL_CHART.series.map((sector, i) => {
      const value = latest.values[i] ?? 0;
      return {
        sector,
        value,
        share: round1((value / total) * 100),
        local: sector !== "산업",
      };
    }),
  };
}
