import { describe, expect, it } from "vitest";
import { MAX_SERIES } from "@/lib/charts/limits";
import { SYSTEM_CHARTS, SYSTEM_CHART_SLUGS, systemChartOf } from "@/lib/config/charts";
import { chungnamLocalChart, chungnamTotalChart } from "./emission-views";
import {
  CHUNGNAM_DIRECT_INDIRECT_CHART,
  CHUNGNAM_LOCAL_OUTLOOK_DATA,
  CHUNGNAM_TOTAL_DATA,
  KOREA_SECTOR_EMISSIONS_CHART,
  NATIONAL_TARGET_CHART,
  SECTOR_TARGETS,
  sectorTaskSummary,
} from "./carbon-info";

describe("부문별 감축목표", () => {
  it("과제·세부사업 수가 기존 홈페이지 표기와 같다", () => {
    expect(Object.fromEntries(SECTOR_TARGETS.map((s) => [s.label, sectorTaskSummary(s)]))).toEqual({
      전환: "3개 과제 9개 세부사업",
      산업: "3개 과제 27개 세부사업",
      건물: "4개 과제 24개 세부사업",
      수송: "2개 과제 6개 세부사업",
      농축수산: "3개 과제 11개 세부사업",
      폐기물: "3개 과제 10개 세부사업",
      흡수원: "3개 과제 10개 세부사업",
      이행기반: "3개 과제 17개 세부사업",
    });
  });

  it("주요지표 행은 머리글(6열)과 열 수가 맞는다 (rowSpan 으로 이어지는 행 제외)", () => {
    for (const s of SECTOR_TARGETS) {
      let carried = 0;
      for (const row of s.indicators) {
        const width = row.reduce<number>(
          (n, c) => n + (typeof c === "string" ? 1 : (c.colSpan ?? 1)),
          0,
        );
        expect(width + (carried > 0 ? 1 : 0), `${s.label} ${JSON.stringify(row[0])}`).toBe(6);
        carried = Math.max(0, carried - 1);
        const spanning = row.find((c) => typeof c !== "string" && (c.rowSpan ?? 1) > 1);
        if (spanning && typeof spanning !== "string") carried = (spanning.rowSpan ?? 1) - 1;
      }
    }
  });
});

describe("도표 데이터", () => {
  const charts = [
    NATIONAL_TARGET_CHART,
    KOREA_SECTOR_EMISSIONS_CHART,
    CHUNGNAM_DIRECT_INDIRECT_CHART,
    chungnamTotalChart(CHUNGNAM_TOTAL_DATA),
    chungnamLocalChart(CHUNGNAM_TOTAL_DATA),
  ];
  it.each(charts.map((c) => [c.title, c]))("%s: 계열 수와 값 개수가 일치", (_, chart) => {
    expect(chart.series.length).toBeLessThanOrEqual(MAX_SERIES);
    for (const row of chart.rows) expect(row.values).toHaveLength(chart.series.length);
  });

  it("충남 부문별 합계가 원자료 총계와 같다 (반올림 오차 0.1 이내)", () => {
    const expected = [79.8, 80.9, 82.9, 83.0, 78.7];
    CHUNGNAM_TOTAL_DATA.rows.forEach((r, i) => {
      expect(r.values[6]).toBe(expected[i]);
      const sum = r.values.slice(0, 5).reduce<number>((a, v) => a + (v ?? 0), 0);
      expect(Math.abs(sum - expected[i])).toBeLessThanOrEqual(0.1 + 1e-9);
    });
  });
});

describe("홈페이지에 고정된 도표·자료", () => {
  it("계열 고정 자료의 처음 값은 고정 계열과 같다", () => {
    expect(CHUNGNAM_TOTAL_DATA.series).toEqual(
      systemChartOf(SYSTEM_CHART_SLUGS.chungnamTotal)?.fixedSeries,
    );
    expect(CHUNGNAM_LOCAL_OUTLOOK_DATA.series).toEqual(
      systemChartOf(SYSTEM_CHART_SLUGS.chungnamLocalOutlook)?.fixedSeries,
    );
  });

  it("내부 키가 겹치지 않는다", () => {
    const slugs = SYSTEM_CHARTS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
