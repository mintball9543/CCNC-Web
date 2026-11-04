import { describe, expect, it } from "vitest";
import { inquiryAnsweredMail } from "./templates";

describe("inquiryAnsweredMail", () => {
  const mail = inquiryAnsweredMail({
    siteName: "충청남도 탄소중립지원센터",
    authorName: "홍길동",
    inquiryTitle: "<b>교육</b> 문의",
    answer: "가능합니다.\n연락드리겠습니다.",
    inquiryUrl: "https://example.kr/news/inquiry/1",
    isPrivate: true,
  });

  it("제목에 문의 제목 포함", () => {
    expect(mail.subject).toContain("교육");
  });

  it("HTML 은 이스케이프", () => {
    expect(mail.html).toContain("&lt;b&gt;교육&lt;/b&gt;");
    expect(mail.html).not.toContain("<b>교육</b>");
  });

  it("비공개 안내 문구", () => {
    expect(mail.text).toContain("비밀번호");
  });
});
