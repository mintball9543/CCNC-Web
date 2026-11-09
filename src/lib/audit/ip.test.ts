import { describe, expect, it } from "vitest";
import { categoryOf } from "./labels";
import { ipFromHeaders, normalizeIp } from "./ip";

const h = (init: Record<string, string>) => new Headers(init);

describe("ipFromHeaders", () => {
  it("X-Forwarded-For 첫 값 사용", () => {
    expect(ipFromHeaders(h({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }))).toBe("203.0.113.5");
  });
  it("X-Real-IP 대체, 없으면 unknown", () => {
    expect(ipFromHeaders(h({ "x-real-ip": "198.51.100.7" }))).toBe("198.51.100.7");
    expect(ipFromHeaders(h({}))).toBe("unknown");
  });
  it("IPv6 표기 정규화", () => {
    expect(normalizeIp("::ffff:127.0.0.1")).toBe("127.0.0.1");
    expect(normalizeIp("::1")).toBe("127.0.0.1");
    expect(normalizeIp("2001:db8::1")).toBe("2001:db8::1");
  });
});

describe("categoryOf", () => {
  it("동작 코드로 분류", () => {
    expect(categoryOf("view.page")).toBe("view");
    expect(categoryOf("auth.login")).toBe("auth");
    expect(categoryOf("post.delete")).toBe("change");
  });
});
