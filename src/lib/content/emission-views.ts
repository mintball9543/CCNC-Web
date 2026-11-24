/**
 * 관리자에서 수정하는 배출 자료(도표 관리 '홈페이지에 고정된 도표·자료')로
 * 배출현황 페이지의 표·도표를 만든다. 계열 순서는 SYSTEM_CHARTS 의 fixedSeries 를 따른다.
 */
import type { InfoCell, InfoTableData, StaticChart } from "./carbon-info";

/** 산업, 건물, 수송, 농축산, 폐기물, 흡수원, 총계 */
const SECTOR_COUNT = 5;
const SINK = 5;
const TOTAL = 6;
const LOCAL_FROM = 1;

/** 값들의 최대 소수 자릿수 (표에서 65.0 처럼 자릿수를 맞추기 위해, 최대 3) */
export function decimalsOf(rows: StaticChart["rows"]): number {
  let max = 0;
  for (const row of rows) {
    for (const v of row.values) {
      if (v === null || !Number.isFinite(v)) continue;
      const frac = String(v).split(".")[1];
      if (frac) max = Math.max(max, frac.length);
    }
  }
  return Math.min(max, 3);
}

export function formatFixed(v: number | null, decimals: number): string {
  if (v === null) return "-";
  return v.toLocaleString("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** "2016" → "2016년", "2034(전망)" → "2034년(전망)" */
export function yearHeading(label: string): string {
  const m = /^(\d{4})(?!\d)(.*)$/.exec(label);
  return m ? `${m[1]}년${m[2]}` : label;
}

/** 첫 행~마지막 행 범위 (예: "2016~2020") */
export function rowRange(rows: StaticChart["rows"]): string {
  if (rows.length === 0) return "";
  const first = rows[0].label;
  const last = rows[rows.length - 1].label;
  return first === last ? first : `${first}~${last}`;
}

const round1 = (v: number) => Math.round(v * 10) / 10;

const right = (text: string, emphasis = false): InfoCell =>
  emphasis ? { text, align: "right", emphasis } : { text, align: "right" };

const splitNotes = (notes?: string) =>
  (notes ?? "")
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);

/** 연도별 총계 — '총계' 열(공식 값)을 쓰고, 비어 있으면 부문 합으로 대신한다 */
export function totalOf(row: StaticChart["rows"][number]): number {
  const total = row.values[TOTAL];
  if (total !== null && total !== undefined) return total;
  return round1(row.values.slice(0, SECTOR_COUNT).reduce<number>((s, v) => s + (v ?? 0), 0));
}

/** 배출현황 '충청남도 온실가스 총배출량 현황' 표 */
export function chungnamTotalTable(data: StaticChart): InfoTableData {
  const { rows, series } = data;
  const d = decimalsOf(rows);
  const cells = (i: number) => rows.map((r) => right(formatFixed(r.values[i] ?? null, d)));
  const range = rowRange(rows);
  return {
    caption: range ? `${data.title} (${range})` : data.title,
    unit: data.unit,
    head: [[{ text: "구분", colSpan: 2 }, ...rows.map((r) => yearHeading(r.label))]],
    rows: [
      [
        { text: "산업부문\n(지자체 관리권한 외)", th: true },
        { text: series[0], th: true },
        ...cells(0),
      ],
      [
        { text: "비산업부문\n(지자체 관리권한)", rowSpan: SINK - LOCAL_FROM + 1, th: true },
        { text: series[1], th: true },
        ...cells(1),
      ],
      ...[2, 3, 4, SINK].map((i): InfoCell[] => [{ text: series[i], th: true }, ...cells(i)]),
      [
        { text: series[TOTAL], colSpan: 2, th: true, emphasis: true },
        ...rows.map((r) => right(formatFixed(totalOf(r), d), true)),
      ],
    ],
    source: data.source,
    minWidth: "min-w-[600px]",
  };
}

/** 배출현황 '부문별 총배출량 (흡수원 제외)' 누적 막대 */
export function chungnamTotalChart(data: StaticChart): StaticChart {
  return {
    title: "부문별 총배출량 (흡수원 제외)",
    unit: data.unit,
    chartType: "stacked",
    categoryLabel: data.categoryLabel,
    series: data.series.slice(0, SECTOR_COUNT),
    rows: data.rows.map((r) => ({ label: r.label, values: r.values.slice(0, SECTOR_COUNT) })),
    source: data.source,
    sourceUrl: data.sourceUrl,
  };
}

/** 배출현황 '지자체 관리권한 부문별 배출량' 누적 막대 (건물·수송·농축산·폐기물) */
export function chungnamLocalChart(data: StaticChart): StaticChart {
  const rows = data.rows.map((r) => ({
    label: r.label,
    values: r.values.slice(LOCAL_FROM, SECTOR_COUNT),
  }));
  const sums = rows.map(
    (r) =>
      `${yearHeading(r.label)} ${round1(r.values.reduce<number>((s, v) => s + (v ?? 0), 0)).toFixed(1)}`,
  );
  return {
    title: "지자체 관리권한 부문별 배출량",
    description: `합계: ${sums.join(" · ")}`,
    unit: data.unit,
    chartType: "stacked",
    categoryLabel: data.categoryLabel,
    series: data.series.slice(LOCAL_FROM, SECTOR_COUNT),
    rows,
    source: data.source,
    sourceUrl: data.sourceUrl,
  };
}

/** 배출현황 '지자체 관리권한 부문 배출량 실적과 전망' 표 (연도가 열) */
export function localOutlookTable(data: StaticChart): InfoTableData {
  const d = decimalsOf(data.rows);
  return {
    caption: data.title,
    unit: data.unit,
    head: [["구분", ...data.rows.map((r) => yearHeading(r.label))]],
    rows: data.series.map((name, i) => [
      name,
      ...data.rows.map((r) => right(formatFixed(r.values[i] ?? null, d), r.label.includes("전망"))),
    ]),
    notes: splitNotes(data.notes),
    source: data.source,
    minWidth: "min-w-[600px]",
  };
}

export { splitNotes };
