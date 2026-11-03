import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateTime,
  fromDateTimeLocalValue,
  maskName,
  toDateTimeLocalValue,
} from "./format";

describe("maskName", () => {
  it("이름 가운데를 마스킹한다", () => {
    expect(maskName("홍길동")).toBe("홍*동");
    expect(maskName("남궁민수")).toBe("남**수");
    expect(maskName("김철")).toBe("김*");
    expect(maskName("이")).toBe("*");
  });
});

describe("date formatting (Asia/Seoul)", () => {
  const date = new Date("2026-11-02T23:30:00Z"); // KST 2026-11-03 08:30

  it("formatDate", () => {
    expect(formatDate(date)).toBe("2026.11.03");
  });

  it("formatDateTime", () => {
    expect(formatDateTime(date)).toBe("2026.11.03 08:30");
  });

  it("datetime-local 값 왕복 변환", () => {
    expect(toDateTimeLocalValue(date)).toBe("2026-11-03T08:30");
    expect(fromDateTimeLocalValue("2026-11-03T08:30")?.toISOString()).toBe(date.toISOString());
    expect(fromDateTimeLocalValue("")).toBeNull();
  });
});
