import { describe, expect, it } from "vitest";
import { checkUpload, formatFileSize, getExtension, isPreviewable } from "./policy";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const pdf = new TextEncoder().encode("%PDF-1.7");
const cfb = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

describe("checkUpload", () => {
  it("정상 이미지 허용", () => {
    expect(checkUpload("photo.PNG", 100, png, "image")).toEqual({
      ok: true,
      mime: "image/png",
      extension: "png",
    });
  });

  it("본문 이미지 업로드에 PDF 는 거부", () => {
    expect(checkUpload("a.pdf", 100, pdf, "image").ok).toBe(false);
  });

  it("첨부파일 PDF·HWP 허용", () => {
    expect(checkUpload("보고서.pdf", 100, pdf, "attachment").ok).toBe(true);
    expect(checkUpload("공문.hwp", 100, cfb, "attachment").ok).toBe(true);
  });

  it("확장자 위장 거부", () => {
    expect(checkUpload("evil.png", 100, pdf, "image").ok).toBe(false);
  });

  it("SVG·HTML 거부", () => {
    expect(checkUpload("x.svg", 10, new TextEncoder().encode("<svg"), "image").ok).toBe(false);
    expect(checkUpload("x.html", 10, new TextEncoder().encode("<html"), "attachment").ok).toBe(
      false,
    );
  });

  it("크기 제한", () => {
    expect(checkUpload("big.png", 11 * 1024 * 1024, png, "image").ok).toBe(false);
  });
});

describe("helpers", () => {
  it("getExtension / isPreviewable / formatFileSize", () => {
    expect(getExtension("a.b.HWP")).toBe("hwp");
    expect(isPreviewable("x.pdf")).toBe(true);
    expect(isPreviewable("x.hwp")).toBe(true);
    expect(isPreviewable("x.xlsx")).toBe(false);
    expect(formatFileSize(1536)).toBe("1.5KB");
  });
});
