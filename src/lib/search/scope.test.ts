import { describe, expect, it } from "vitest";
import { applyMenuVisibility } from "@/lib/config/menu-visibility";
import { mainNavigation } from "@/lib/config/navigation";
import { searchMenus, visibleBoardKeys } from "./scope";

describe("visibleBoardKeys", () => {
  it("모든 메뉴가 보이면 게시판 전체", () => {
    expect(visibleBoardKeys(mainNavigation)).toEqual([
      "notice",
      "center-news",
      "gallery",
      "press",
      "archive",
    ]);
  });

  it("숨긴 게시판은 검색 범위에서 빠진다", () => {
    const nav = applyMenuVisibility(mainNavigation, { "/news/press": false });
    expect(visibleBoardKeys(nav)).not.toContain("press");
    expect(visibleBoardKeys(nav)).toContain("notice");
  });

  it("알림마당 전체를 숨기면 게시판 없음", () => {
    const nav = applyMenuVisibility(mainNavigation, { "section:news": false });
    expect(visibleBoardKeys(nav)).toEqual([]);
  });
});

describe("searchMenus", () => {
  it("메뉴 이름으로 찾는다", () => {
    expect(searchMenus(mainNavigation, ["오시는"])).toEqual([
      { title: "오시는 길", href: "/about/location", section: "센터소개" },
    ]);
  });

  it("대메뉴 이름 + 메뉴 이름에 모든 검색어가 있어야 한다 (대소문자 무시)", () => {
    const results = searchMenus(mainNavigation, ["주요사업", "정책"]);
    expect(results.map((r) => r.href)).toEqual(["/business/policy"]);
    expect(searchMenus(mainNavigation, ["ci"]).map((r) => r.href)).toEqual(["/about/ci"]);
  });

  it("숨긴 메뉴·빈 검색어는 결과 없음", () => {
    const nav = applyMenuVisibility(mainNavigation, { "/about/location": false });
    expect(searchMenus(nav, ["오시는"])).toEqual([]);
    expect(searchMenus(mainNavigation, [])).toEqual([]);
  });
});
