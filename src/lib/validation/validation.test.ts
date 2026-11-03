import { describe, expect, it } from "vitest";
import { inquirySchema } from "./inquiry.schema";
import { popupSchema } from "./popup.schema";
import { postSchema } from "./post.schema";

const basePopup = {
  title: "팝업",
  content: "내용",
  position: "custom",
  left: "10",
  top: "20",
  width: "400",
  height: "",
  sortOrder: "0",
};

describe("popupSchema", () => {
  it("체크박스 미체크(필드 없음)는 false 로 처리된다", () => {
    const result = popupSchema.parse(basePopup);
    expect(result.isActive).toBe(false);
    expect(result.height).toBeNull();
    expect(result.left).toBe(10);
  });

  it("체크박스 'on' 은 true", () => {
    expect(popupSchema.parse({ ...basePopup, isActive: "on" }).isActive).toBe(true);
  });

  it("종료 일시가 시작 일시보다 빠르면 실패", () => {
    const result = popupSchema.safeParse({
      ...basePopup,
      startsAt: "2026-12-10T10:00",
      endsAt: "2026-12-01T10:00",
    });
    expect(result.success).toBe(false);
  });

  it("이미지 사용 시 대체 텍스트 필수", () => {
    const result = popupSchema.safeParse({ ...basePopup, imageUrl: "https://example.com/a.png" });
    expect(result.success).toBe(false);
  });

  it("javascript: 링크는 거부", () => {
    expect(popupSchema.safeParse({ ...basePopup, linkUrl: "javascript:alert(1)" }).success).toBe(
      false,
    );
    expect(popupSchema.safeParse({ ...basePopup, linkUrl: "//evil.com" }).success).toBe(false);
    expect(popupSchema.safeParse({ ...basePopup, linkUrl: "/news/notice" }).success).toBe(true);
  });
});

describe("postSchema", () => {
  it("체크박스 미체크 시 false", () => {
    const result = postSchema.parse({ boardKey: "notice", title: "t", content: "c", author: "a" });
    expect(result.isPinned).toBe(false);
    expect(result.isPublished).toBe(false);
    expect(result.category).toBeNull();
  });
});

describe("inquirySchema", () => {
  const base = {
    title: "문의",
    content: "열 글자 이상 문의 내용입니다.",
    authorName: "홍길동",
    email: "hong@example.com",
    password: "1234",
    privacyConsent: "on",
  };

  it("정상 입력", () => {
    expect(inquirySchema.safeParse(base).success).toBe(true);
  });

  it("개인정보 동의 필수", () => {
    const { privacyConsent: _omit, ...rest } = base;
    void _omit;
    expect(inquirySchema.safeParse(rest).success).toBe(false);
  });

  it("허니팟 필드에 값이 있으면 거부", () => {
    expect(inquirySchema.safeParse({ ...base, website: "http://spam" }).success).toBe(false);
  });
});
