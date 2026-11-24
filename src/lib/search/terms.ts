/** 검색어 처리 (순수 함수) — 게시판 검색·통합 검색 공용 */

/** 검색어 최대 길이 · 검색어 조각 최대 개수 */
export const MAX_KEYWORD_LENGTH = 50;
export const MAX_SEARCH_TERMS = 5;

/** 검색어 정리: 앞뒤·연속 공백 정리, 길이 제한 (빈 값이면 null) */
export function normalizeKeyword(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const keyword = value.replace(/\s+/g, " ").trim().slice(0, MAX_KEYWORD_LENGTH).trim();
  return keyword || null;
}

/** 띄어쓰기로 나눈 검색어 조각 (중복 제거, 최대 MAX_SEARCH_TERMS 개) — 모든 조각을 포함한 글을 찾는다 */
export function splitSearchTerms(keyword: string | null | undefined): string[] {
  if (!keyword) return [];
  const terms: string[] = [];
  for (const term of keyword.split(/\s+/)) {
    if (term && !terms.some((t) => t.toLowerCase() === term.toLowerCase())) terms.push(term);
    if (terms.length === MAX_SEARCH_TERMS) break;
  }
  return terms;
}

/** SQL LIKE 패턴 — %·_ 를 글자 그대로 찾도록 이스케이프 (ESCAPE '\') */
export function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** 검색어가 처음 나오는 곳 주변을 잘라낸 요약문 (없으면 앞부분) */
export function makeExcerpt(text: string, terms: string[], length = 120): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= length) return clean;
  const lower = clean.toLowerCase();
  const positions = terms.map((t) => lower.indexOf(t.toLowerCase())).filter((i) => i >= 0);
  const hit = positions.length ? Math.min(...positions) : 0;
  // 검색어 앞쪽 문맥을 조금 남긴다
  const start = Math.max(0, Math.min(hit - Math.floor(length / 4), clean.length - length));
  const end = start + length;
  return `${start > 0 ? "…" : ""}${clean.slice(start, end).trim()}${end < clean.length ? "…" : ""}`;
}

export interface HighlightSegment {
  text: string;
  match: boolean;
}

/** 검색어 부분 표시용 조각 나누기 (대소문자 무시) */
export function highlightSegments(text: string, terms: string[]): HighlightSegment[] {
  const valid = terms.filter(Boolean);
  if (!text || valid.length === 0) return text ? [{ text, match: false }] : [];
  // 긴 검색어를 먼저 맞춰 겹치는 경우 긴 쪽을 표시
  const pattern = new RegExp(
    `(${[...valid]
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join("|")})`,
    "gi",
  );
  return text
    .split(pattern)
    .filter((part) => part !== "")
    .map((part) => ({
      text: part,
      match: valid.some((t) => t.toLowerCase() === part.toLowerCase()),
    }));
}
