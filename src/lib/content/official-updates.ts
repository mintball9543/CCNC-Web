/**
 * '새 공식 자료 있음' 알림 — 저장값이 코드의 처음 값과 다르다는 것만으로는 띄우지 않는다.
 * 관리자가 저장·되돌리기·알림 끄기를 할 때 그 시점 공식 자료의 지문(fingerprint)을 남기고,
 * 코드에 넣어 둔 공식 자료가 그 뒤 바뀌었을 때만 알린다. (오래된 연도를 지워도 뜨지 않음)
 */
import type { ContentTableSlug, SystemChartSlug } from "@/lib/config/charts";
import type { ContentTable } from "@/types";
import { contentTableDefault } from "./content-tables";
import { systemChartContentKey, systemChartDefault, type ChartContent } from "./system-charts";

/** 짧은 문자열 지문 (FNV-1a 32비트) — 내용이 바뀌었는지만 가린다 */
export function fingerprint(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export const systemDefaultFingerprint = (slug: SystemChartSlug) =>
  fingerprint(systemChartContentKey(systemChartDefault(slug)));

export const tableDefaultFingerprint = (slug: ContentTableSlug) =>
  fingerprint(JSON.stringify(contentTableDefault(slug)));

/**
 * 공식 목록에서, 저장된 값에 있는 마지막 항목보다 뒤에 오는 새 항목이 있는지.
 * (앞쪽의 오래된 연도를 지운 것은 새 자료로 보지 않는다)
 */
function hasNewerItems(official: readonly string[], saved: readonly string[]): boolean {
  const have = new Set(saved);
  let lastCommon = -1;
  official.forEach((item, i) => {
    if (have.has(item)) lastCommon = i;
  });
  return official.slice(lastCommon + 1).some((item) => !have.has(item));
}

/**
 * 알림을 띄울지. acknowledged 는 관리자가 마지막으로 확인한 공식 자료 지문.
 * 지문이 없으면(이 기능 이전에 저장된 자료) 저장된 마지막 연도·항목 뒤에 공식 자료의 새 항목이 있을 때만 띄운다.
 */
export function hasNewOfficialChart(
  slug: SystemChartSlug,
  saved: ChartContent,
  acknowledged: string | null,
): boolean {
  if (acknowledged) return acknowledged !== systemDefaultFingerprint(slug);
  const official = systemChartDefault(slug);
  return (
    hasNewerItems(
      official.rows.map((r) => r.label),
      saved.rows.map((r) => r.label),
    ) || hasNewerItems(official.series, saved.series)
  );
}

export function hasNewOfficialTable(
  slug: ContentTableSlug,
  saved: ContentTable,
  acknowledged: string | null,
): boolean {
  if (acknowledged) return acknowledged !== tableDefaultFingerprint(slug);
  const official = contentTableDefault(slug);
  const rowName = (r: ContentTable["rows"][number]) => r.cells[0] ?? "";
  return (
    hasNewerItems(official.head, saved.head) ||
    hasNewerItems(official.rows.map(rowName), saved.rows.map(rowName))
  );
}

/* ───────────── 지금 값 ↔ 새 공식 값 비교 ───────────── */

export type DiffStatus = "same" | "changed" | "officialOnly" | "savedOnly";

export interface DiffCell {
  saved: string | null;
  official: string | null;
  changed: boolean;
}

export interface DiffRow {
  label: string;
  status: DiffStatus;
  cells: DiffCell[];
}

export interface OfficialDiff {
  /** 제목·단위·출처 등 글자 항목 중 달라진 것 */
  fields: { label: string; saved: string; official: string }[];
  columns: string[];
  rows: DiffRow[];
  /** 달라진 행 수 (같은 행 제외) */
  changedRows: number;
}

const union = (official: readonly string[], saved: readonly string[]) => [
  ...official,
  ...saved.filter((s) => !official.includes(s)),
];

function diffGrid(
  columns: string[],
  savedRows: Map<string, Map<string, string>>,
  officialRows: Map<string, Map<string, string>>,
): DiffRow[] {
  const labels = union([...officialRows.keys()], [...savedRows.keys()]);
  return labels.map((label) => {
    const s = savedRows.get(label);
    const o = officialRows.get(label);
    const cells = columns.map((col): DiffCell => {
      const saved = s?.get(col) ?? null;
      const official = o?.get(col) ?? null;
      return { saved, official, changed: saved !== official };
    });
    const status: DiffStatus = !s
      ? "officialOnly"
      : !o
        ? "savedOnly"
        : cells.some((c) => c.changed)
          ? "changed"
          : "same";
    return { label, status, cells };
  });
}

function diffFields(pairs: [string, string | null | undefined, string | null | undefined][]) {
  return pairs
    .map(([label, saved, official]) => ({ label, saved: saved ?? "", official: official ?? "" }))
    .filter((f) => f.saved.trim() !== f.official.trim());
}

const num = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));

export function chartOfficialDiff(saved: ChartContent, official: ChartContent): OfficialDiff {
  const columns = union(official.series, saved.series);
  const grid = (c: ChartContent) =>
    new Map(
      c.rows.map((r) => [
        r.label,
        new Map(c.series.map((name, i): [string, string] => [name, num(r.values[i])])),
      ]),
    );
  const rows = diffGrid(columns, grid(saved), grid(official));
  return {
    fields: diffFields([
      ["제목", saved.title, official.title],
      ["설명", saved.description, official.description],
      ["주석", saved.notes, official.notes],
      ["단위", saved.unit, official.unit],
      ["출처", saved.source, official.source],
      ["출처 링크", saved.sourceUrl, official.sourceUrl],
    ]),
    columns,
    rows,
    changedRows: rows.filter((r) => r.status !== "same").length,
  };
}

export function tableOfficialDiff(saved: ContentTable, official: ContentTable): OfficialDiff {
  // 첫 열은 항목 이름이므로 비교 열에서 뺀다
  const columns = union(official.head.slice(1), saved.head.slice(1));
  const grid = (t: ContentTable) =>
    new Map(
      t.rows.map((r) => [
        r.cells[0] ?? "",
        new Map(t.head.slice(1).map((h, i): [string, string] => [h, r.cells[i + 1] ?? ""])),
      ]),
    );
  const rows = diffGrid(columns, grid(saved), grid(official));
  return {
    fields: diffFields([
      ["소제목", saved.title, official.title],
      ["설명", saved.description, official.description],
      ["표 제목", saved.caption, official.caption],
      ["단위", saved.unit, official.unit],
      ["주석", saved.notes, official.notes],
      ["출처", saved.source, official.source],
    ]),
    columns,
    rows,
    changedRows: rows.filter((r) => r.status !== "same").length,
  };
}
