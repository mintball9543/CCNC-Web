import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  fillBuckets,
  isBotUserAgent,
  kstDay,
  lastDays,
  lastMonths,
  yearRange,
} from "./stats";

describe("kstDay", () => {
  it("한국 시간 기준으로 날짜를 정한다", () => {
    expect(kstDay(new Date("2026-03-31T14:59:59Z"))).toBe("2026-03-31");
    expect(kstDay(new Date("2026-03-31T15:00:00Z"))).toBe("2026-04-01");
  });
});

describe("isBotUserAgent", () => {
  it("검색엔진·자동화 도구는 제외", () => {
    expect(isBotUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBotUserAgent("Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)")).toBe(true);
    expect(isBotUserAgent("Mozilla/5.0 ... HeadlessChrome/120.0")).toBe(true);
    expect(isBotUserAgent("")).toBe(true);
  });
  it("일반 브라우저는 집계", () => {
    expect(
      isBotUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      ),
    ).toBe(false);
  });
});

describe("날짜 계산", () => {
  it("월말·연말을 넘긴다", () => {
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
  });
  it("최근 N일·N개월 (오래된 것부터, 오늘 포함)", () => {
    expect(lastDays("2026-03-02", 3)).toEqual(["2026-02-28", "2026-03-01", "2026-03-02"]);
    expect(lastMonths("2026-02-15", 3)).toEqual(["2025-12", "2026-01", "2026-02"]);
  });
  it("연도 범위는 첫 기록 연도부터 올해까지", () => {
    expect(yearRange("2024", "2026-05-01")).toEqual(["2024", "2025", "2026"]);
    expect(yearRange(null, "2026-05-01")).toEqual(["2026"]);
  });
});

it("fillBuckets 는 빈 칸을 0 으로 채운다", () => {
  expect(fillBuckets([{ key: "b", visitors: 2, pageViews: 5 }], ["a", "b"])).toEqual([
    { key: "a", visitors: 0, pageViews: 0 },
    { key: "b", visitors: 2, pageViews: 5 },
  ]);
});
