/**
 * 메인 '데이터로 보는 충남 탄소중립' 영역 데이터.
 * 수치는 관리자 > 도표 관리 '충청남도 부문별 총배출량'(처음 값은 carbon-info.ts 의 공식 자료)에서 계산한다.
 * 여기에 새 수치를 직접 적지 않는다.
 */
import { CHUNGNAM_2045, type StaticChart } from "./carbon-info";
import { totalOf } from "./emission-views";

/** 충남 2045 기본계획: 2018년 대비 2030년 감축률 (CHUNGNAM_2045.goal 문구와 같아야 한다) */
export const CHUNGNAM_2030_REDUCTION_RATE = 0.43;
export const CHUNGNAM_BASE_YEAR = "2018";
export const CHUNGNAM_PLAN_SOURCE = CHUNGNAM_2045.source;

const round1 = (v: number) => Math.round(v * 10) / 10;

/** 연도별 총배출량(흡수원 제외) — '총계' 열(공식 값)을 그대로 쓴다 */
export function chungnamTotals(data: StaticChart): { year: string; total: number }[] {
  return data.rows.map((r) => ({ year: r.label, total: totalOf(r) }));
}

export type PathwayKind = "actual" | "target" | "netZero";

export interface PathwayPoint {
  year: string;
  value: number;
  kind: PathwayKind;
}

/** 실적(첫 연도~최신) → 2030 목표(기준연도 × (1 − 43%)) → 2045 순배출 0 */
export function chungnamPathway(data: StaticChart): PathwayPoint[] {
  const totals = chungnamTotals(data);
  const base = totals.find((t) => t.year === CHUNGNAM_BASE_YEAR);
  return [
    ...totals.map((t) => ({ year: t.year, value: t.total, kind: "actual" as const })),
    // 기준연도 행이 지워졌으면 목표값을 계산할 수 없으므로 뺀다
    ...(base
      ? [
          {
            year: "2030",
            value: round1(base.total * (1 - CHUNGNAM_2030_REDUCTION_RATE)),
            kind: "target" as const,
          },
        ]
      : []),
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

/** 최신 연도(마지막 행) 부문별 배출 비중 */
export function chungnamSectorShares(data: StaticChart): {
  year: string;
  total: number;
  sectors: SectorShare[];
} {
  const latest = data.rows[data.rows.length - 1];
  if (!latest) return { year: "", total: 0, sectors: [] };
  const total = totalOf(latest);
  return {
    year: latest.label,
    total,
    sectors: data.series.slice(0, 5).map((sector, i) => {
      const value = latest.values[i] ?? 0;
      return {
        sector,
        value,
        share: total ? round1((value / total) * 100) : 0,
        local: i > 0,
      };
    }),
  };
}
