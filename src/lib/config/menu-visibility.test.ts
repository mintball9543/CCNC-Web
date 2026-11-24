import { describe, expect, it } from "vitest";
import { applyMenuVisibility, isHiddenPath, isVisibleHref, sectionKey } from "./menu-visibility";
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

  it("하위 메뉴 숨김 (주요사업 > 소통·협력)", () => {
    const nav = applyMenuVisibility(mainNavigation, { "/business/communication": false });
    const business = nav.find((s) => s.key === "business");
    expect(business?.items.map((i) => i.href)).not.toContain("/business/communication");
    expect(isHiddenPath("/business/communication", nav, mainNavigation)).toBe(true);
    expect(isHiddenPath("/business/policy", nav, mainNavigation)).toBe(false);
  });

  it("첫 하위 메뉴를 숨기면 대메뉴 링크가 다음 메뉴로", () => {
    const nav = applyMenuVisibility(mainNavigation, { "/business/policy": false });
    expect(nav.find((s) => s.key === "business")?.href).toBe("/business/information");
  });

  it("하위 경로도 숨김 처리", () => {
    const nav = applyMenuVisibility(mainNavigation, { "/carbon-neutral/emissions": false });
    expect(isHiddenPath("/carbon-neutral/emissions/x", nav, mainNavigation)).toBe(true);
  });

  it("센터소개·알림마당은 저장된 설정과 관계없이 항상 표시", () => {
    const nav = applyMenuVisibility(mainNavigation, {
      [sectionKey("about")]: false,
      "/about/greeting": false,
      "/news/press": false,
      "/news/inquiry": false,
    });
    for (const key of ["about", "news"]) {
      const all = mainNavigation.find((s) => s.key === key)!;
      expect(nav.find((s) => s.key === key)?.items).toEqual(all.items);
    }
    expect(isHiddenPath("/news/press/12", nav, mainNavigation)).toBe(false);
    expect(nav.find((s) => s.key === "about")?.href).toBe("/about/greeting");
  });
});

describe("isVisibleHref", () => {
  const nav = applyMenuVisibility(mainNavigation, { "/business/policy": false });
  it("숨긴 메뉴 링크(# 포함)는 보이지 않음", () => {
    expect(isVisibleHref("/business/policy#project-1-1", nav, mainNavigation)).toBe(false);
    expect(isVisibleHref("/business/information#project-2-2", nav, mainNavigation)).toBe(true);
  });
  it("메뉴 밖 주소는 항상 보임", () => {
    expect(isVisibleHref("/search?q=a", nav, mainNavigation)).toBe(true);
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
