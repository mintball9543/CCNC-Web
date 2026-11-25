import { describe, expect, it } from "vitest";
import { CONTENT_TABLE_SLUGS, SYSTEM_CHART_SLUGS } from "@/lib/config/charts";
import { contentTableDefault } from "./content-tables";
import {
  chartOfficialDiff,
  hasNewOfficialChart,
  hasNewOfficialTable,
  systemDefaultFingerprint,
  tableDefaultFingerprint,
  tableOfficialDiff,
} from "./official-updates";
import { systemChartDefault } from "./system-charts";

const slug = SYSTEM_CHART_SLUGS.chungnamTotal;
const official = systemChartDefault(slug);

describe("'새 공식 자료 있음' 알림", () => {
  it("오래된 연도를 지운 것만으로는 뜨지 않는다 (확인 기록 없을 때)", () => {
    const trimmed = { ...official, rows: official.rows.slice(2) };
    expect(hasNewOfficialChart(slug, trimmed, null)).toBe(false);
  });

  it("공식 자료에만 있는 새 연도가 있으면 뜬다 (확인 기록 없을 때)", () => {
    const older = { ...official, rows: official.rows.slice(0, -1) };
    expect(hasNewOfficialChart(slug, older, null)).toBe(true);
  });

  it("확인 기록이 있으면, 그 뒤 공식 자료가 바뀌었을 때만 뜬다", () => {
    const edited = { ...official, rows: official.rows.slice(0, -1) };
    expect(hasNewOfficialChart(slug, edited, systemDefaultFingerprint(slug))).toBe(false);
    expect(hasNewOfficialChart(slug, official, "00000000")).toBe(true);
  });

  it("글자 표도 같은 규칙", () => {
    const t = CONTENT_TABLE_SLUGS.koreaSectorEmissions;
    const table = contentTableDefault(t);
    const withoutLastRow = { ...table, rows: table.rows.slice(0, -1) };
    expect(hasNewOfficialTable(t, withoutLastRow, null)).toBe(true);
    expect(hasNewOfficialTable(t, withoutLastRow, tableDefaultFingerprint(t))).toBe(false);
  });
});

describe("지금 값 ↔ 공식 자료 비교", () => {
  it("새 연도·값이 다른 칸·지금 값에만 있는 연도를 구분한다", () => {
    const saved = {
      ...official,
      rows: [
        { label: "2015", values: [1, 1, 1, 1, 1, 0, 5] },
        ...official.rows
          .slice(0, 2)
          .map((r, i) =>
            i === 1 ? { ...r, values: r.values.map((v, j) => (j === 0 ? 99 : v)) } : r,
          ),
      ],
      source: "예전 출처",
    };
    const diff = chartOfficialDiff(saved, official);
    const byLabel = (l: string) => diff.rows.find((r) => r.label === l)!;
    expect(byLabel("2016").status).toBe("same");
    expect(byLabel("2017").status).toBe("changed");
    expect(byLabel("2017").cells[0]).toEqual({ saved: "99", official: "62.4", changed: true });
    expect(byLabel("2023").status).toBe("officialOnly");
    expect(byLabel("2015").status).toBe("savedOnly");
    expect(diff.rows.at(-1)?.label).toBe("2015");
    expect(diff.fields.map((f) => f.label)).toEqual(["출처"]);
  });

  it("같으면 달라진 것이 없다", () => {
    const diff = chartOfficialDiff(official, official);
    expect(diff.changedRows).toBe(0);
    expect(diff.fields).toEqual([]);
    const t = contentTableDefault(CONTENT_TABLE_SLUGS.worldRanking);
    expect(tableOfficialDiff(t, t).changedRows).toBe(0);
  });
});
