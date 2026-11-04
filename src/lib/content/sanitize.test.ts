import { describe, expect, it } from "vitest";
import { extractFirstImage, htmlToText, isEmptyHtml, sanitizePostHtml } from "./sanitize";

describe("sanitizePostHtml", () => {
  it("스크립트·이벤트 핸들러 제거", () => {
    const out = sanitizePostHtml(
      '<p onclick="x()">안녕<script>alert(1)</script></p><img src="x" onerror="alert(1)">',
    );
    expect(out).not.toMatch(/script|onclick|onerror/);
    expect(out).toContain("<p>안녕</p>");
  });

  it("javascript: 링크 제거, 외부 링크는 새 창", () => {
    expect(sanitizePostHtml('<a href="javascript:alert(1)">x</a>')).toBe("<a>x</a>");
    expect(sanitizePostHtml('<a href="https://a.kr">x</a>')).toContain('target="_blank"');
  });

  it("업로드 이미지(상대 경로)와 외부 https 이미지는 유지", () => {
    expect(sanitizePostHtml('<img src="/files/3" alt="a">')).toBe('<img src="/files/3" alt="a" />');
    expect(sanitizePostHtml('<img src="https://ex.com/a.png">')).toContain("https://ex.com/a.png");
    expect(sanitizePostHtml('<img src="data:image/png;base64,AAA">')).not.toContain("data:");
  });
});

describe("helpers", () => {
  it("extractFirstImage", () => {
    expect(extractFirstImage('<p>a</p><img src="/files/1"><img src="/files/2">')).toBe("/files/1");
    expect(extractFirstImage("<p>a</p>")).toBeNull();
  });

  it("htmlToText / isEmptyHtml", () => {
    expect(htmlToText("<p>가 <strong>나</strong></p>")).toBe("가 나");
    expect(isEmptyHtml("<p></p>")).toBe(true);
    expect(isEmptyHtml('<p><img src="/files/1"></p>')).toBe(false);
  });
});
