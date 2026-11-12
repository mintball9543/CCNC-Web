import { describe, expect, it } from "vitest";
import { parseSender, resolveMailMode, senderDomainMismatch, senderIsRewritten } from "./config";

describe("resolveMailMode", () => {
  it("SMTP_HOST 가 없으면 꺼짐", () => {
    expect(resolveMailMode({ MAIL_FROM: "a@b.kr" }).mode).toBe("off");
  });

  it("MAIL_FROM 이 없으면 SMTP_USER 로 대체", () => {
    const mode = resolveMailMode({
      SMTP_HOST: "smtp.example.kr",
      SMTP_USER: "center@example.kr",
      SMTP_PASS: "x",
    });
    expect(mode).toMatchObject({
      mode: "smtp",
      smtp: {
        from: { name: "충청남도 탄소중립지원센터", address: "center@example.kr" },
        port: 587,
        secure: false,
      },
    });
  });

  it("465 포트는 SMTP_SECURE 가 없으면 자동으로 SSL", () => {
    const mode = resolveMailMode({ SMTP_HOST: "h", SMTP_PORT: "465", MAIL_FROM: "a@b.kr" });
    expect(mode).toMatchObject({ mode: "smtp", smtp: { secure: true } });
  });

  it("log 모드", () => {
    expect(resolveMailMode({ MAIL_TRANSPORT: "log" }).mode).toBe("log");
  });
});

describe("parseSender", () => {
  it("이름과 주소를 나눈다", () => {
    expect(parseSender('"센터" <a@b.kr>')).toEqual({ name: "센터", address: "a@b.kr" });
    expect(parseSender("센터 알림 <a@b.kr>")).toEqual({ name: "센터 알림", address: "a@b.kr" });
  });
  it("이름이 없으면 기관명을 붙인다", () => {
    expect(parseSender(" a@b.kr ")).toEqual({
      name: "충청남도 탄소중립지원센터",
      address: "a@b.kr",
    });
    expect(parseSender("<a@b.kr>").name).toBe("충청남도 탄소중립지원센터");
  });
});

describe("보내는 주소 점검", () => {
  const from = { name: "센터", address: "no-reply@center.kr" };
  it("Gmail 계정과 다른 보내는 주소는 Gmail 이 바꿔 보낸다", () => {
    expect(
      senderIsRewritten({ host: "smtp.gmail.com", auth: { user: "x@gmail.com", pass: "" }, from }),
    ).toBe(true);
    expect(
      senderIsRewritten({
        host: "smtp.gmail.com",
        auth: { user: "no-reply@center.kr", pass: "" },
        from,
      }),
    ).toBe(false);
    expect(
      senderIsRewritten({ host: "smtp.center.kr", auth: { user: "x@gmail.com", pass: "" }, from }),
    ).toBe(false);
  });
  it("로그인 계정과 보내는 주소의 도메인이 다르면 알린다", () => {
    expect(senderDomainMismatch({ auth: { user: "x@gmail.com", pass: "" }, from })).toBe(true);
    expect(senderDomainMismatch({ auth: { user: "x@center.kr", pass: "" }, from })).toBe(false);
    expect(senderDomainMismatch({ auth: { user: "x", pass: "" }, from })).toBe(false);
  });
});
