/**
 * 메인 '데이터로 보는 충남 탄소중립'·2045 비전 목표 데이터.
 * 수치는 관리자 > 도표 관리 '충청남도 부문별 총배출량'·'충청남도 탄소중립 목표'
 * (처음 값은 carbon-info.ts 의 공식 자료)에서 계산한다. 여기에 새 수치를 직접 적지 않는다.
 */
import type { StaticChart } from "./carbon-info";
import { totalOf } from "./emission-views";

const round1 = (v: number) => Math.round(v * 10) / 10;

/* ───────────── 감축 목표 (기준연도 0 · 중간 목표 · 탄소중립 100) ───────────── */

export interface CarbonPlan {
  /** 기준연도 (예: "2018") */
  baseYear: string;
  /** 중간 감축 목표 (예: 2030년 43%) */
  targets: { year: string; rate: number }[];
  /** 탄소중립(순배출 0) 연도 */
  netZeroYear: string;
  source: string;
}

export function carbonPlan(data: StaticChart): CarbonPlan {
  const rows = data.rows.map((r) => ({ year: r.label, rate: r.values[0] ?? 0 }));
  const base = rows.find((r) => r.rate === 0) ?? rows[0];
  const netZero = rows.findLast((r) => r.rate >= 100) ?? rows[rows.length - 1];
  return {
    baseYear: base?.year ?? "",
    targets: rows.filter((r) => r.rate > 0 && r.rate < 100),
    netZeroYear: netZero?.year ?? "",
    source: data.source ?? "",
  };
}

/** "2018년 온실가스 배출량 대비 2030년까지 43% 감축, 2045년 탄소중립 실현" */
export function carbonPlanGoal(plan: CarbonPlan): string {
  const targets = plan.targets.map((t) => `${t.year}년까지 ${t.rate}% 감축`).join(", ");
  return [
    targets && `${plan.baseYear}년 온실가스 배출량 대비 ${targets}`,
    `${plan.netZeroYear}년 탄소중립 실현`,
  ]
    .filter(Boolean)
    .join(", ");
}

/** 2045 비전 이정표: 기준연도 → 중간 목표 → 탄소중립 */
export function carbonPlanMilestones(plan: CarbonPlan): { year: string; label: string }[] {
  return [
    { year: plan.baseYear, label: "기준연도 배출량" },
    ...plan.targets.map((t) => ({ year: t.year, label: `${t.rate}% 감축` })),
    { year: plan.netZeroYear, label: "탄소중립 실현" },
  ];
}

/* ───────────── 배출 실적 ───────────── */

/** 연도별 총배출량(흡수원 제외) — '총계' 열(공식 값)을 그대로 쓴다 */
export function chungnamTotals(data: StaticChart): { year: string; total: number }[] {
  return data.rows.map((r) => ({ year: r.label, total: totalOf(r) }));
}

export type PathwayKind = "actual" | "target" | "netZero";

export interface PathwayPoint {
  year: string;
  value: number;
  kind: PathwayKind;
  /** 목표 감축률 (%) */
  rate?: number;
}

/** 실적(첫 연도~최신) → 중간 목표(기준연도 × (1 − 감축률)) → 탄소중립 순배출 0 */
export function chungnamPathway(data: StaticChart, plan: CarbonPlan): PathwayPoint[] {
  const totals = chungnamTotals(data);
  const base = totals.find((t) => t.year === plan.baseYear);
  return [
    ...totals.map((t) => ({ year: t.year, value: t.total, kind: "actual" as const })),
    // 기준연도 실적이 없으면 목표값을 계산할 수 없으므로 뺀다
    ...(base
      ? plan.targets.map((t) => ({
          year: t.year,
          value: round1(base.total * (1 - t.rate / 100)),
          kind: "target" as const,
          rate: t.rate,
        }))
      : []),
    { year: plan.netZeroYear, value: 0, kind: "netZero" },
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
