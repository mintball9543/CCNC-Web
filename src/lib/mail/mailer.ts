import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { resolveMailMode } from "./config";

/**
 * 메일 발송 (SMTP).
 * 환경 변수: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM
 * MAIL_TRANSPORT=log 이면 실제로 보내지 않고 서버 로그에만 남긴다(개발·테스트용).
 * 설정 점검: npm run env:check
 */
export type MailResult =
  { sent: true } | { sent: false; reason: "not-configured" | "error"; error?: string };

let cached: { key: string; transporter: Transporter; from: string } | null = null;

export function isMailConfigured(): boolean {
  return resolveMailMode(process.env).mode !== "off";
}

function getTransporter(): { transporter: Transporter; from: string } | null {
  const mode = resolveMailMode(process.env);
  if (mode.mode === "off") return null;
  // 설정이 바뀌면(개발 서버 재시작 없이 env 변경 등) 새로 만든다
  const key = JSON.stringify(mode);
  if (cached?.key === key) return cached;
  const transporter =
    mode.mode === "log"
      ? nodemailer.createTransport({ jsonTransport: true })
      : nodemailer.createTransport({
          host: mode.smtp.host,
          port: mode.smtp.port,
          secure: mode.smtp.secure,
          auth: mode.smtp.auth,
        });
  cached = { key, transporter, from: mode.mode === "log" ? mode.from : mode.smtp.from };
  return cached;
}

export async function sendMail(message: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<MailResult> {
  const t = getTransporter();
  if (!t) return { sent: false, reason: "not-configured" };
  try {
    const info = await t.transporter.sendMail({ from: t.from, ...message });
    if (process.env.MAIL_TRANSPORT === "log") {
      console.info("[mail:log]", message.to, message.subject, String(info.messageId ?? ""));
    }
    return { sent: true };
  } catch (error) {
    console.error("메일 발송 실패", error);
    return {
      sent: false,
      reason: "error",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
