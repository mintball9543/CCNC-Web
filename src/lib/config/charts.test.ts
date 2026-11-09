import { describe, expect, it } from "vitest";
import { CHART_PLACEMENTS, CHART_SLUGS, chartPlacementOf, unplacedChartSlug } from "./charts";

describe("chart placements", () => {
  it("배출현황 페이지 키를 메뉴 이름으로 바꾼다", () => {
    expect(chartPlacementOf(CHART_SLUGS.emissions)?.label).toBe("충남 탄소중립 > 배출현황");
  });
  it("지정되지 않은 키는 null", () => {
    expect(chartPlacementOf(unplacedChartSlug(3))).toBeNull();
  });
  it("페이지 키는 서로 다르다", () => {
    const slugs = CHART_PLACEMENTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it("자동 키는 페이지 키와 겹치지 않는다", () => {
    expect(CHART_PLACEMENTS.some((p) => p.slug === unplacedChartSlug(1))).toBe(false);
  });
});
