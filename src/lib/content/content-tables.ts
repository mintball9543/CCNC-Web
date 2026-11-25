/**
 * 홈페이지에 들어간 글자 표 — 관리자 > 도표 관리 '표'에서 고친다.
 * 처음 값은 carbon-info.ts 의 공식 표 그대로이고, 화면에는 InfoTable 형식으로 바꿔 그린다.
 */
import { CONTENT_TABLE_SLUGS, type ContentTableSlug } from "@/lib/config/charts";
import type { ContentTable, ContentTableRow } from "@/types";
import {
  KOREA_SECTOR_EMISSIONS_TABLE,
  WORLD_RANKING,
  type InfoCell,
  type InfoTableData,
} from "./carbon-info";
import { splitNotes } from "./emission-views";

/** 숫자 칸(오른쪽 정렬): -37.8 · 12,856* · 240.4 (82.3) */
const NUMERIC = /^[-−]?[\d,]+(\.\d+)?\*?(\s*\([-−]?[\d,]+(\.\d+)?\))?$/;

export function isNumericCell(text: string): boolean {
  return NUMERIC.test(text.trim());
}

const textOf = (c: InfoCell) => (typeof c === "string" ? c : c.text);
const emphasized = (c: InfoCell) => typeof c !== "string" && !!c.emphasis;

/** 기존 InfoTable(병합 없는 단순 표) → 관리자 편집 형식 */
export function toContentTable(
  table: InfoTableData,
  extra: { title: string; description?: string },
): ContentTable {
  return {
    title: extra.title,
    description: extra.description ?? "",
    caption: table.caption,
    unit: table.unit ?? "",
    head: table.head[0].map(textOf),
    rows: table.rows.map((row): ContentTableRow => {
      const style = row.slice(1).some(emphasized) ? "row" : emphasized(row[0]) ? "header" : "";
      return { cells: row.map(textOf), style };
    }),
    notes: (table.notes ?? []).join("\n"),
    source: table.source ?? "",
  };
}

/** 관리자 편집 형식 → 화면 표 (첫 열은 항목명, 숫자 칸은 오른쪽 정렬) */
export function toInfoTable(table: ContentTable, minWidth?: string): InfoTableData {
  const info: InfoTableData = {
    caption: table.caption,
    head: [table.head],
    rows: table.rows.map((row) =>
      row.cells.map((text, i): InfoCell => {
        if (i === 0) return row.style ? { text, emphasis: true, th: true } : text;
        const align = isNumericCell(text) ? ("right" as const) : undefined;
        const emphasis = row.style === "row";
        if (!align && !emphasis) return text;
        return { text, ...(align && { align }), ...(emphasis && { emphasis }) };
      }),
    ),
  };
  if (table.unit) info.unit = table.unit;
  const notes = splitNotes(table.notes);
  if (notes.length) info.notes = notes;
  if (table.source) info.source = table.source;
  if (minWidth) info.minWidth = minWidth;
  return info;
}

const DEFAULTS: Record<ContentTableSlug, { table: ContentTable; minWidth: string }> = {
  [CONTENT_TABLE_SLUGS.koreaSectorEmissions]: {
    table: toContentTable(KOREA_SECTOR_EMISSIONS_TABLE, {
      title: "국내 분야별 온실가스 배출량 (IPCC 기준)",
    }),
    minWidth: KOREA_SECTOR_EMISSIONS_TABLE.minWidth ?? "",
  },
  [CONTENT_TABLE_SLUGS.worldRanking]: {
    table: toContentTable(WORLD_RANKING.table, {
      title: "우리나라 온실가스 배출량 순위 (2018년 기준)",
      description: WORLD_RANKING.summary,
    }),
    minWidth: WORLD_RANKING.table.minWidth ?? "",
  },
};

export function contentTableDefault(slug: ContentTableSlug): ContentTable {
  return structuredClone(DEFAULTS[slug].table);
}

/** 좁은 화면 가로 스크롤 기준 너비 (Tailwind 클래스라 코드에 둔다) */
export function contentTableMinWidth(slug: ContentTableSlug): string {
  return DEFAULTS[slug].minWidth;
}

/** 저장된 표가 코드에 넣어 둔 최신 공식 표(처음 값)와 다른지 */
export function differsFromTableDefault(slug: ContentTableSlug, saved: ContentTable): boolean {
  return JSON.stringify(saved) !== JSON.stringify(contentTableDefault(slug));
}
