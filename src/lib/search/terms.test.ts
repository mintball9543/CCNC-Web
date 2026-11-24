import { describe, expect, it } from "vitest";
import {
  highlightSegments,
  likePattern,
  makeExcerpt,
  MAX_KEYWORD_LENGTH,
  normalizeKeyword,
  splitSearchTerms,
} from "./terms";

describe("normalizeKeyword", () => {
  it("공백을 정리하고 빈 값은 null", () => {
    expect(normalizeKeyword("  탄소   중립 ")).toBe("탄소 중립");
    expect(normalizeKeyword("   ")).toBeNull();
    expect(normalizeKeyword(undefined)).toBeNull();
    expect(normalizeKeyword(["a", "b"])).toBeNull();
  });

  it("최대 길이로 자른다", () => {
    expect(normalizeKeyword("가".repeat(80))).toHaveLength(MAX_KEYWORD_LENGTH);
  });
});

describe("splitSearchTerms", () => {
  it("띄어쓰기로 나누고 중복(대소문자 무시)을 없앤다", () => {
    expect(splitSearchTerms("탄소 교육 탄소 CBAM cbam")).toEqual(["탄소", "교육", "CBAM"]);
  });

  it("최대 5개까지만", () => {
    expect(splitSearchTerms("a b c d e f g")).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("빈 값", () => {
    expect(splitSearchTerms(null)).toEqual([]);
    expect(splitSearchTerms("")).toEqual([]);
  });
});

describe("likePattern", () => {
  it("%·_·\\ 를 글자 그대로 찾도록 이스케이프", () => {
    expect(likePattern("50%")).toBe("%50\\%%");
    expect(likePattern("a_b")).toBe("%a\\_b%");
    expect(likePattern("c:\\d")).toBe("%c:\\\\d%");
    expect(likePattern("탄소")).toBe("%탄소%");
  });
});

describe("makeExcerpt", () => {
  const long = `${"가".repeat(200)} 탄소중립 교육 안내 ${"나".repeat(200)}`;

  it("짧은 글은 그대로", () => {
    expect(makeExcerpt("  짧은   글  ", ["글"])).toBe("짧은 글");
  });

  it("검색어 주변을 잘라 앞뒤에 … 를 붙인다", () => {
    const excerpt = makeExcerpt(long, ["교육"], 60);
    expect(excerpt).toContain("탄소중립 교육");
    expect(excerpt.startsWith("…")).toBe(true);
    expect(excerpt.endsWith("…")).toBe(true);
  });

  it("검색어가 본문에 없으면 앞부분", () => {
    const excerpt = makeExcerpt(long, ["없는말"], 60);
    expect(excerpt.startsWith("가")).toBe(true);
    expect(excerpt.endsWith("…")).toBe(true);
  });

  it("검색어가 끝 근처에 있어도 길이를 채운다", () => {
    const text = `${"가".repeat(100)}끝말`;
    const excerpt = makeExcerpt(text, ["끝말"], 40);
    expect(excerpt).toBe(`…${"가".repeat(38)}끝말`);
  });
});

describe("highlightSegments", () => {
  it("검색어 부분만 표시 (대소문자 무시, 여러 검색어)", () => {
    expect(highlightSegments("CBAM 대응 cbam 교육", ["cbam", "교육"])).toEqual([
      { text: "CBAM", match: true },
      { text: " 대응 ", match: false },
      { text: "cbam", match: true },
      { text: " ", match: false },
      { text: "교육", match: true },
    ]);
  });

  it("정규식 특수문자도 글자 그대로", () => {
    expect(highlightSegments("a+b (c)", ["(c)"])).toEqual([
      { text: "a+b ", match: false },
      { text: "(c)", match: true },
    ]);
  });

  it("겹치는 검색어는 긴 쪽을 표시", () => {
    expect(highlightSegments("탄소중립", ["탄소", "탄소중립"])).toEqual([
      { text: "탄소중립", match: true },
    ]);
  });

  it("검색어가 없으면 통째로", () => {
    expect(highlightSegments("본문", [])).toEqual([{ text: "본문", match: false }]);
    expect(highlightSegments("", ["a"])).toEqual([]);
  });
});
