import { describe, expect, it } from "vitest";
import { AttemptLimiter } from "./rate-limit";

describe("AttemptLimiter", () => {
  it("최대 횟수 초과 시 차단, 시간이 지나면 해제", () => {
    const limiter = new AttemptLimiter(3, 60_000);
    const t = 1_000_000;
    for (let i = 0; i < 2; i++) limiter.fail("ip", t);
    expect(limiter.blockedFor("ip", t)).toBe(0);
    limiter.fail("ip", t);
    expect(limiter.blockedFor("ip", t + 1000)).toBe(59_000);
    expect(limiter.blockedFor("ip", t + 60_001)).toBe(0);
  });

  it("성공 시 초기화", () => {
    const limiter = new AttemptLimiter(1, 60_000);
    limiter.fail("ip");
    limiter.reset("ip");
    expect(limiter.blockedFor("ip")).toBe(0);
  });
});
