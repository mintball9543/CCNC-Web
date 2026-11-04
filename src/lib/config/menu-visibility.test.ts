import { describe, expect, it } from "vitest";
import { applyMenuVisibility, isHiddenPath, sectionKey } from "./menu-visibility";
import { mainNavigation } from "./navigation";

describe("applyMenuVisibility", () => {
  it("설정이 없으면 모두 표시", () => {
    expect(applyMenuVisibility(mainNavigation, {})).toHaveLength(mainNavigation.length);
  });

  it("대메뉴 숨김 (참여·실천 전체)", () => {
    const nav = applyMenuVisibility(mainNavigation, { [sectionKey("participation")]: false });
    expect(nav.find((s) => s.key === "participation")).toBeUndefined();
    expect(isHiddenPath("/participation/upsyu", nav, mainNavigation)).toBe(true);
  });

  it("하위 메뉴 숨김 (주요사업 > 교육·홍보)", () => {
    const nav = applyMenuVisibility(mainNavigation, { "/business/education": false });
    const business = nav.find((s) => s.key === "business");
    expect(business?.items.map((i) => i.href)).not.toContain("/business/education");
    expect(isHiddenPath("/business/education", nav, mainNavigation)).toBe(true);
    expect(isHiddenPath("/business/policy", nav, mainNavigation)).toBe(false);
  });

  it("첫 하위 메뉴를 숨기면 대메뉴 링크가 다음 메뉴로", () => {
    const nav = applyMenuVisibility(mainNavigation, { "/about/greeting": false });
    expect(nav.find((s) => s.key === "about")?.href).toBe("/about/history");
  });

  it("게시글 상세 등 하위 경로도 숨김 처리", () => {
    const nav = applyMenuVisibility(mainNavigation, { "/news/press": false });
    expect(isHiddenPath("/news/press/12", nav, mainNavigation)).toBe(true);
  });
});

describe("proxy matcher", () => {
  it("모든 대메뉴 경로가 proxy matcher 에 포함되어 있다", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync(new URL("../../proxy.ts", import.meta.url), "utf8");
    for (const section of mainNavigation) {
      expect(source).toContain(`"/${section.key}/:path*"`);
    }
  });
});
