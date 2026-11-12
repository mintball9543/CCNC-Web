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

/** 보내는 사람 — 받는 사람의 메일함에는 이름(name)이 주소 대신 크게 표시된다 */
export interface MailSender {
  name: string;
  address: string;
}

/** 이름이 없는 MAIL_FROM 에 붙이는 기본 보내는 사람 이름 */
export const DEFAULT_SENDER_NAME = "충청남도 탄소중립지원센터";

/** '이름 <주소>' 또는 '주소' 형식을 해석한다. 이름이 없으면 기관명을 붙인다. */
export function parseSender(value: string): MailSender {
  const match = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/.exec(value);
  const name = match?.[1].trim() || DEFAULT_SENDER_NAME;
  const address = (match ? match[2] : value).trim();
  return { name, address };
}

const domainOf = (address: string) => address.split("@")[1]?.toLowerCase() ?? "";

/**
 * Gmail SMTP 는 보내는 주소를 로그인 계정(SMTP_USER)으로 바꿔 보낸다
 * (Gmail 설정의 '다른 주소에서 메일 보내기'에 등록된 주소 제외).
 * 이 경우 받는 사람에게 MAIL_FROM 이 아닌 SMTP_USER 주소가 보이므로 점검에서 알린다.
 */
export function senderIsRewritten(smtp: Pick<SmtpSettings, "host" | "auth" | "from">): boolean {
  if (!/(^|\.)(gmail|googlemail)\.com$/i.test(smtp.host) || !smtp.auth) return false;
  return smtp.auth.user.toLowerCase() !== smtp.from.address.toLowerCase();
}

export function senderDomainMismatch(smtp: Pick<SmtpSettings, "auth" | "from">): boolean {
  return (
    !!smtp.auth?.user.includes("@") && domainOf(smtp.auth.user) !== domainOf(smtp.from.address)
  );
}

export interface SmtpSettings {
  host: string;
  port: number;
  /** 465 는 SSL(secure), 587·25 는 STARTTLS */
  secure: boolean;
  auth?: { user: string; pass: string };
  from: MailSender;
}

export type MailMode =
  | { mode: "log"; from: MailSender }
  | { mode: "smtp"; smtp: SmtpSettings }
  | { mode: "off"; reason: string };

export function resolveMailMode(env: MailEnv | Record<string, string | undefined>): MailMode {
  const e = env as MailEnv;
  const from = e.MAIL_FROM?.trim() || e.SMTP_USER?.trim() || "";
  if (e.MAIL_TRANSPORT === "log")
    return { mode: "log", from: parseSender(from || "no-reply@localhost") };
  const host = e.SMTP_HOST?.trim();
  if (!host) return { mode: "off", reason: "SMTP_HOST 가 비어 있습니다." };
  if (!from) return { mode: "off", reason: "MAIL_FROM(보내는 사람 주소)이 비어 있습니다." };
  const port = Number(e.SMTP_PORT?.trim() || 587);
  const secure = e.SMTP_SECURE?.trim() ? e.SMTP_SECURE.trim() === "true" : port === 465;
  const user = e.SMTP_USER?.trim();
  return {
    mode: "smtp",
    smtp: {
      host,
      port,
      secure,
      auth: user ? { user, pass: e.SMTP_PASS ?? "" } : undefined,
      from: parseSender(from),
    },
  };
}
