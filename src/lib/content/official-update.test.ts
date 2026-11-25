import { describe, expect, it } from "vitest";
import { CONTENT_TABLE_SLUGS, SYSTEM_CHART_SLUGS } from "@/lib/config/charts";
import {
  CHUNGNAM_DIRECT_INDIRECT_CHART,
  CHUNGNAM_PLAN_PROGRESS,
  KOREA_SECTOR_EMISSIONS_CHART,
  KOREA_SECTOR_EMISSIONS_TABLE,
  type InfoCell,
} from "./carbon-info";
import { contentTableDefault, differsFromTableDefault } from "./content-tables";
import { differsFromSystemDefault, systemChartDefault } from "./system-charts";

const textOf = (c: InfoCell) => (typeof c === "string" ? c : c.text);
/** "233.9 (75.5)" → 233.9 */
const valueOf = (c: InfoCell) => Number(textOf(c).split(" ")[0].replace(/,/g, ""));

describe("공개 통계 최신화 (ISSUES.md CONTENT-008)", () => {
  it("충남 직접·간접 배출량은 2016~2023년, 지역 인벤토리 2025년 공표값", () => {
    const c = CHUNGNAM_DIRECT_INDIRECT_CHART;
    expect(c.rows.map((r) => r.label)).toEqual([
      "2016",
      "2017",
      "2018",
      "2019",
      "2020",
      "2021",
      "2022",
      "2023",
    ]);
    expect(c.rows.find((r) => r.label === "2018")?.values).toEqual([164.67, 31.69]);
    expect(c.rows.at(-1)?.values).toEqual([137.91, 23.9]);
    expect(c.title).toContain("2016~2023");
    // 설명 문장의 감축률이 값과 맞는지
    expect(((164.67 - 137.91) / 164.67) * 100).toBeCloseTo(16.3, 1);
    expect(c.description).toContain("16.3%");
  });

  it("국내 분야별 배출량 표: 분야 합이 총배출량, 에너지 세부 합이 에너지와 맞다 (반올림 0.2 이내)", () => {
    const rows = KOREA_SECTOR_EMISSIONS_TABLE.rows;
    const byName = (name: string) => rows.find((r) => textOf(r[0]).trim() === name)!;
    for (const col of [1, 2, 3]) {
      const v = (name: string) => valueOf(byName(name)[col]);
      const total = v("총배출량");
      expect(
        Math.abs(v("에너지") + v("산업공정 및 제품 사용") + v("농업") + v("폐기물") - total),
      ).toBeLessThanOrEqual(0.2);
      const energyParts = [
        "전기·열·석유정제",
        "제조업·건설업",
        "수송",
        "가정·상업 등",
        "미분류",
        "탈루",
      ];
      expect(Math.abs(energyParts.reduce((s, n) => s + v(n), 0) - v("에너지"))).toBeLessThanOrEqual(
        0.2,
      );
      expect(Math.abs(total + v("LULUCF") - v("순배출량"))).toBeLessThanOrEqual(0.2);
    }
  });

  it("국내 분야별 비교 도표는 표의 값과 같다", () => {
    const table = KOREA_SECTOR_EMISSIONS_TABLE.rows;
    const pairs: [string, string][] = [
      ["전기·열·정제", "전기·열·석유정제"],
      ["제조·건설", "제조업·건설업"],
      ["산업공정", "산업공정 및 제품 사용"],
      ["폐기물", "폐기물"],
    ];
    for (const [chartLabel, tableLabel] of pairs) {
      const row = table.find((r) => textOf(r[0]).trim() === tableLabel)!;
      expect(KOREA_SECTOR_EMISSIONS_CHART.rows.find((r) => r.label === chartLabel)?.values).toEqual(
        [1, 2, 3].map((i) => valueOf(row[i])),
      );
    }
  });

  it("2025년 이행 실적 표: 부문 합이 합계와 같다", () => {
    const rows = CHUNGNAM_PLAN_PROGRESS.table.rows;
    const [total, ...sectors] = rows;
    for (const col of [1, 2]) {
      const sum = sectors.reduce((s, r) => s + valueOf(r[col]), 0);
      expect(sum).toBeCloseTo(valueOf(total[col]), 5);
    }
    // 달성률 = 실적 / 목표
    expect((399.4 / 395.1) * 100).toBeCloseTo(101.1, 1);
  });
});

describe("최신 공식 값과 다른지 (관리자 안내)", () => {
  it("처음 값 그대로면 같고, 값을 고치면 다르다", () => {
    const slug = SYSTEM_CHART_SLUGS.chungnamDirectIndirect;
    const saved = systemChartDefault(slug);
    expect(differsFromSystemDefault(slug, saved)).toBe(false);
    const old = { ...saved, rows: saved.rows.slice(0, 5) };
    expect(differsFromSystemDefault(slug, old)).toBe(true);
  });

  it("글자 표도 같은 방식으로 비교한다", () => {
    const slug = CONTENT_TABLE_SLUGS.koreaSectorEmissions;
    const table = contentTableDefault(slug);
    expect(differsFromTableDefault(slug, table)).toBe(false);
    expect(differsFromTableDefault(slug, { ...table, head: table.head.slice(0, 3) })).toBe(true);
  });
});
