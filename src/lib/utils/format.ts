const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Seoul",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Seoul",
});

/** 2026.11.03 형식 */
export function formatDate(date: Date | string | number): string {
  return dateFormatter.format(new Date(date)).replace(/\.\s?/g, ".").replace(/\.$/, "");
}

/** 2026.11.03 14:30 형식 */
export function formatDateTime(date: Date | string | number): string {
  const parts = dateTimeFormatter.formatToParts(new Date(date));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")} ${get("hour")}:${get("minute")}`;
}

/** 작성자 이름 마스킹: 홍길동 → 홍*동, 김철 → 김* */
export function maskName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 1) return "*";
  if (trimmed.length === 2) return `${trimmed[0]}*`;
  return `${trimmed[0]}${"*".repeat(trimmed.length - 2)}${trimmed[trimmed.length - 1]}`;
}

/** <input type="datetime-local"> 값(한국시간 기준) ↔ Date 변환 */
export function toDateTimeLocalValue(date: Date | null | undefined): string {
  if (!date) return "";
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(`${value}:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
