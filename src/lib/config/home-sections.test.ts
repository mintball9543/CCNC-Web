import { describe, expect, it } from "vitest";
import { DEFAULT_HOME_SECTION_ORDER, normalizeHomeSectionOrder } from "./home-sections";

describe("normalizeHomeSectionOrder", () => {
  it("기본 순서: 공지·보도 → 활동 갤러리 → 나머지", () => {
    expect(DEFAULT_HOME_SECTION_ORDER.slice(0, 2)).toEqual(["latestPosts", "activityGallery"]);
    expect(normalizeHomeSectionOrder(null)).toEqual(DEFAULT_HOME_SECTION_ORDER);
  });

  it("저장된 순서를 그대로 사용", () => {
    const saved = [...DEFAULT_HOME_SECTION_ORDER].reverse();
    expect(normalizeHomeSectionOrder(saved)).toEqual(saved);
  });

  it("모르는 값·중복 제거, 빠진 영역은 기본 순서상 앞 영역 뒤에 추가", () => {
    const result = normalizeHomeSectionOrder([
      "stats",
      "unknown",
      "stats",
      "latestPosts",
      "relatedSites",
      "carbonData",
      "quickLinks",
    ]);
    expect(result).toEqual([
      "stats",
      "latestPosts",
      "activityGallery",
      "relatedSites",
      "carbonData",
      "quickLinks",
    ]);
    expect(new Set(result).size).toBe(DEFAULT_HOME_SECTION_ORDER.length);
  });
});
