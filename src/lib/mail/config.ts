/**
 * SMTP 설정 해석 (순수 함수 — 앱과 `npm run env:check` 공용).
 * 환경 변수: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TRANSPORT
 */
export interface MailEnv {
  MAIL_TRANSPORT?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_SECURE?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  MAIL_FROM?: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  /** 465 는 SSL(secure), 587·25 는 STARTTLS */
  secure: boolean;
  auth?: { user: string; pass: string };
  from: string;
}

export type MailMode =
  | { mode: "log"; from: string }
  | { mode: "smtp"; smtp: SmtpSettings }
  | { mode: "off"; reason: string };

export function resolveMailMode(env: MailEnv | Record<string, string | undefined>): MailMode {
  const e = env as MailEnv;
  const from = e.MAIL_FROM?.trim() || e.SMTP_USER?.trim() || "";
  if (e.MAIL_TRANSPORT === "log") return { mode: "log", from: from || "no-reply@localhost" };
  const host = e.SMTP_HOST?.trim();
  if (!host) return { mode: "off", reason: "SMTP_HOST 가 비어 있습니다." };
  if (!from) return { mode: "off", reason: "MAIL_FROM(보내는 사람 주소)이 비어 있습니다." };
  const port = Number(e.SMTP_PORT?.trim() || 587);
  const secure = e.SMTP_SECURE?.trim() ? e.SMTP_SECURE.trim() === "true" : port === 465;
  const user = e.SMTP_USER?.trim();
  return {
    mode: "smtp",
    smtp: { host, port, secure, auth: user ? { user, pass: e.SMTP_PASS ?? "" } : undefined, from },
  };
}
