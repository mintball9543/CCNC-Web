/** 방문자 집계 보조 함수 (순수 함수) */

export interface VisitCount {
  visitors: number;
  pageViews: number;
}

export interface VisitBucket extends VisitCount {
  /** 일별 YYYY-MM-DD · 월별 YYYY-MM · 연도별 YYYY */
  key: string;
}

const kstFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 한국 시간 기준 날짜 (YYYY-MM-DD) */
export function kstDay(date: Date): string {
  return kstFormatter.format(date);
}

/** 검색엔진·미리보기·자동화 도구 등 사람이 아닌 접속 */
export function isBotUserAgent(userAgent: string): boolean {
  if (!userAgent.trim()) return true;
  return /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|daumoa|yeti|curl|wget|python|axios|node-fetch|go-http|java\//i.test(
    userAgent,
  );
}

const toUtc = (day: string) => new Date(`${day}T00:00:00Z`);
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

export function addDays(day: string, amount: number): string {
  const date = toUtc(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return isoDay(date);
}

export function addMonths(month: string, amount: number): string {
  const date = toUtc(`${month}-01`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return isoDay(date).slice(0, 7);
}

/** 빈 날짜·달·해는 0 으로 채워 연속된 목록을 만든다 (오래된 것부터) */
export function fillBuckets(rows: VisitBucket[], keys: string[]): VisitBucket[] {
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return keys.map((key) => byKey.get(key) ?? { key, visitors: 0, pageViews: 0 });
}

export function lastDays(today: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(today, i - count + 1));
}

export function lastMonths(today: string, count: number): string[] {
  const month = today.slice(0, 7);
  return Array.from({ length: count }, (_, i) => addMonths(month, i - count + 1));
}

export function yearRange(firstYear: string | null, today: string): string[] {
  const end = Number(today.slice(0, 4));
  const start = firstYear ? Math.min(Number(firstYear), end) : end;
  return Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
}

/** ?month= 값 검사 — YYYY-MM 이고 오늘이 속한 달 이후가 아니면 그대로, 아니면 이번 달 */
export function parseMonth(value: unknown, today: string): string {
  const current = today.slice(0, 7);
  if (typeof value !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return current;
  return value > current ? current : value;
}

/** 달력 칸 — 일요일부터 한 주 7칸, 그 달이 아닌 칸은 null */
export function monthCalendar(month: string): (string | null)[][] {
  const first = `${month}-01`;
  const lead = toUtc(first).getUTCDay();
  const days = Number(addDays(`${addMonths(month, 1)}-01`, -1).slice(8));
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: days }, (_, i) => addDays(first, i)),
  ];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

/** 달력 칸 색 진하기 (0: 방문 없음, 1~4: 그 달 최댓값 대비) */
export function heatLevel(value: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (value <= 0 || max <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((value / max) * 4))) as 1 | 2 | 3 | 4;
}
