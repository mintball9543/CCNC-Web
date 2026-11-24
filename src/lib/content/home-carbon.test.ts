import { describe, expect, it } from "vitest";
import { CHUNGNAM_2045, CHUNGNAM_TOTAL_DATA as DATA } from "./carbon-info";
import {
  CHUNGNAM_2030_REDUCTION_RATE,
  chungnamPathway,
  chungnamSectorShares,
  chungnamTotals,
} from "./home-carbon";

describe("메인 충남 탄소중립 데이터", () => {
  it("감축률이 2045 기본계획 목표 문구와 같다", () => {
    expect(CHUNGNAM_2045.goal).toContain(`${Math.round(CHUNGNAM_2030_REDUCTION_RATE * 100)}%`);
  });

  it("연도별 총배출량은 총배출량 표의 총계이고, 부문별 합과 0.1 이내로 맞는다", () => {
    const totals = chungnamTotals(DATA);
    expect(totals).toEqual([
      { year: "2016", total: 79.8 },
      { year: "2017", total: 80.9 },
      { year: "2018", total: 82.9 },
      { year: "2019", total: 83.0 },
      { year: "2020", total: 78.7 },
    ]);
    DATA.rows.forEach((row, i) => {
      expect(row.label).toBe(totals[i].year);
      const sum = row.values.slice(0, 5).reduce<number>((s, v) => s + (v ?? 0), 0);
      expect(Math.abs(sum - totals[i].total)).toBeLessThan(0.15);
    });
  });

  it("감축 경로: 실적 5년 → 2030 목표 47.3 → 2045 순배출 0", () => {
    const path = chungnamPathway(DATA);
    expect(path.filter((p) => p.kind === "actual").map((p) => p.year)).toEqual([
      "2016",
      "2017",
      "2018",
      "2019",
      "2020",
    ]);
    expect(path.find((p) => p.kind === "target")).toEqual({
      year: "2030",
      value: 47.3,
      kind: "target",
    });
    expect(path[path.length - 1]).toEqual({ year: "2045", value: 0, kind: "netZero" });
  });

  it("부문별 비중은 최신 연도 기준이고 합이 100% 이다", () => {
    const { year, total, sectors } = chungnamSectorShares(DATA);
    expect(year).toBe("2020");
    expect(total).toBe(78.7);
    expect(sectors[0]).toMatchObject({ sector: "산업", share: 78.9, local: false });
    const sum = sectors.reduce((s, x) => s + x.share, 0);
    expect(Math.abs(sum - 100)).toBeLessThan(0.2);
  });

  it("관리자가 새 연도를 추가하면 최신 연도·경로가 따라 바뀐다", () => {
    const next = {
      ...DATA,
      rows: [...DATA.rows, { label: "2021", values: [60, 7, 4.5, 3.7, 1.0, -1.0, 76.2] }],
    };
    expect(chungnamSectorShares(next)).toMatchObject({ year: "2021", total: 76.2 });
    const path = chungnamPathway(next);
    expect(path.filter((p) => p.kind === "actual").at(-1)).toEqual({
      year: "2021",
      value: 76.2,
      kind: "actual",
    });
    expect(path.find((p) => p.kind === "target")?.value).toBe(47.3);
  });
});
