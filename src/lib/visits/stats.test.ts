import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  fillBuckets,
  heatLevel,
  isBotUserAgent,
  kstDay,
  lastDays,
  lastMonths,
  monthCalendar,
  parseMonth,
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

describe("parseMonth", () => {
  it("올바른 지난 달은 그대로, 잘못된 값·미래 달은 이번 달", () => {
    expect(parseMonth("2026-10", "2026-11-24")).toBe("2026-10");
    expect(parseMonth("2026-11", "2026-11-24")).toBe("2026-11");
    expect(parseMonth("2026-12", "2026-11-24")).toBe("2026-11");
    expect(parseMonth("2026-13", "2026-11-24")).toBe("2026-11");
    expect(parseMonth(["2026-10"], "2026-11-24")).toBe("2026-11");
    expect(parseMonth(undefined, "2026-11-24")).toBe("2026-11");
  });
});

describe("monthCalendar", () => {
  it("일요일부터 주 단위로 나누고 빈 칸은 null", () => {
    const weeks = monthCalendar("2026-11"); // 2026-11-01 은 일요일
    expect(weeks[0]?.[0]).toBe("2026-11-01");
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks.at(-1)).toEqual(["2026-11-29", "2026-11-30", null, null, null, null, null]);
  });
  it("윤년 2월과 앞쪽 빈 칸", () => {
    const weeks = monthCalendar("2028-02"); // 2028-02-01 은 화요일
    expect(weeks[0]?.slice(0, 3)).toEqual([null, null, "2028-02-01"]);
    expect(weeks.flat().filter(Boolean).at(-1)).toBe("2028-02-29");
  });
});

describe("heatLevel", () => {
  it("방문 없음은 0, 나머지는 최댓값 대비 1~4", () => {
    expect(heatLevel(0, 10)).toBe(0);
    expect(heatLevel(1, 100)).toBe(1);
    expect(heatLevel(50, 100)).toBe(2);
    expect(heatLevel(51, 100)).toBe(3);
    expect(heatLevel(100, 100)).toBe(4);
  });
});
