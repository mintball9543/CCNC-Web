import { describe, expect, it } from "vitest";
import { CHUNGNAM_LOCAL_OUTLOOK_DATA, CHUNGNAM_TOTAL_DATA } from "./carbon-info";
import {
  chungnamLocalChart,
  chungnamTotalTable,
  decimalsOf,
  localOutlookTable,
  yearHeading,
} from "./emission-views";

describe("배출현황 표·도표 만들기", () => {
  it("연도 머리글", () => {
    expect(yearHeading("2016")).toBe("2016년");
    expect(yearHeading("2034(전망)")).toBe("2034년(전망)");
    expect(yearHeading("A안")).toBe("A안");
  });

  it("소수 자릿수를 자료 전체에 맞춘다 (65 → 65.0)", () => {
    expect(decimalsOf(CHUNGNAM_TOTAL_DATA.rows)).toBe(1);
    const table = chungnamTotalTable(CHUNGNAM_TOTAL_DATA);
    expect(table.caption).toBe("충청남도 온실가스 총배출량 현황 (2016~2020)");
    expect(table.rows[0]).toContainEqual({ text: "65.0", align: "right" });
  });

  it("새 연도를 추가하면 표 열·제목 범위·합계 설명이 늘어난다", () => {
    const next = {
      ...CHUNGNAM_TOTAL_DATA,
      rows: [
        ...CHUNGNAM_TOTAL_DATA.rows,
        { label: "2021", values: [60, 7, 4.5, 3.7, 1, -1, 76.2] },
      ],
    };
    const table = chungnamTotalTable(next);
    expect(table.caption).toContain("(2016~2021)");
    expect(table.head[0]).toHaveLength(7);
    expect(table.rows.at(-1)?.at(-1)).toEqual({ text: "76.2", align: "right", emphasis: true });
    expect(chungnamLocalChart(next).description).toContain("2021년 16.2");
  });

  it("전망 연도는 강조하고 천 단위 구분을 넣는다", () => {
    const table = localOutlookTable(CHUNGNAM_LOCAL_OUTLOOK_DATA);
    expect(table.rows[0].at(-1)).toEqual({ text: "16,853.4", align: "right", emphasis: true });
    expect(table.rows[0][4]).toEqual({ text: "17,356.0", align: "right" });
  });
});
