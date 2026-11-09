import { describe, expect, it } from "vitest";
import { resolveMailMode } from "./config";

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
      smtp: { from: "center@example.kr", port: 587, secure: false },
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
