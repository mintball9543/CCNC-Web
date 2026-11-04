import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * 메일 발송 (SMTP).
 * 환경 변수: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM
 * MAIL_TRANSPORT=log 이면 실제로 보내지 않고 서버 로그에만 남긴다(개발·테스트용).
 */
export type MailResult =
  { sent: true } | { sent: false; reason: "not-configured" | "error"; error?: string };

let transporter: Transporter | null = null;

export function isMailConfigured(): boolean {
  return (
    process.env.MAIL_TRANSPORT === "log" || Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM)
  );
}

function getTransporter(): Transporter {
  if (transporter) return transporter;
  transporter =
    process.env.MAIL_TRANSPORT === "log"
      ? nodemailer.createTransport({ jsonTransport: true })
      : nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
        });
  return transporter;
}

export async function sendMail(message: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<MailResult> {
  if (!isMailConfigured()) return { sent: false, reason: "not-configured" };
  try {
    const info = await getTransporter().sendMail({
      from: process.env.MAIL_FROM ?? "no-reply@localhost",
      ...message,
    });
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
