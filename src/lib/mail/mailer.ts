import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import nodemailer, { type Transporter } from "nodemailer";
import { resolveMailMode, senderIsRewritten, type MailSender } from "./config";
import { MAIL_LOGO_CID, MAIL_LOGO_FILE } from "./templates";

/**
 * 메일 발송 (SMTP).
 * 환경 변수: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM
 * MAIL_TRANSPORT=log 이면 실제로 보내지 않고 서버 로그에만 남긴다(개발·테스트용).
 * 설정 점검: npm run env:check
 */
export type MailResult =
  { sent: true } | { sent: false; reason: "not-configured" | "error"; error?: string };

let cached: { key: string; transporter: Transporter; from: MailSender } | null = null;

export function isMailConfigured(): boolean {
  return resolveMailMode(process.env).mode !== "off";
}

function getTransporter(): { transporter: Transporter; from: MailSender } | null {
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
  let from = mode.mode === "log" ? mode.from : mode.smtp.from;
  // Gmail 은 등록되지 않은 보내는 주소를 로그인 계정으로 바꾸면서 이름도 계정 이름으로 바꿀 수 있다.
  // 로그인 계정 주소로 직접 보내 '보내는 사람 이름'(기관명)이 그대로 표시되게 한다.
  if (mode.mode === "smtp" && mode.smtp.auth && senderIsRewritten(mode.smtp)) {
    from = { name: from.name, address: mode.smtp.auth.user };
  }
  cached = { key, transporter, from };
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
    const logo = path.join(process.cwd(), MAIL_LOGO_FILE);
    const info = await t.transporter.sendMail({
      from: t.from,
      ...message,
      attachments: existsSync(logo)
        ? [
            {
              filename: "ccnc-logo.png",
              path: logo,
              cid: MAIL_LOGO_CID,
              contentDisposition: "inline",
            },
          ]
        : [],
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
