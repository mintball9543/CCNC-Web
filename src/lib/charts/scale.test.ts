import { describe, expect, it } from "vitest";
import { formatTick, niceTicks, parseClipboardTable, parseNumber } from "./scale";

describe("niceTicks", () => {
  it("0부터 보기 좋은 간격", () => {
    expect(niceTicks(0, 87)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(niceTicks(1200, 9800)).toEqual([0, 2000, 4000, 6000, 8000, 10000]);
  });
  it("음수 포함", () => {
    expect(niceTicks(-30, 50)[0]).toBeLessThanOrEqual(-30);
  });
  it("값이 모두 0", () => {
    expect(niceTicks(0, 0)).toEqual([0, 1]);
  });
});

describe("format/parse", () => {
  it("formatTick", () => {
    expect(formatTick(2000, 10000)).toBe("2,000");
    expect(formatTick(200000, 400000)).toBe("20만");
  });
  it("parseNumber", () => {
    expect(parseNumber("1,234.5")).toBe(1234.5);
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
  });
  it("parseClipboardTable", () => {
    expect(parseClipboardTable("연도\t배출량\r\n2021\t1,000\n2022\t900\n")).toEqual([
      ["연도", "배출량"],
      ["2021", "1,000"],
      ["2022", "900"],
    ]);
  });
});
