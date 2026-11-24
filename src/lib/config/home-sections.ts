/** 메인 화면 영역 — 메인 비주얼(맨 위)과 팝업을 제외한 영역의 표시 순서를 관리자가 정한다 */

export const HOME_SECTIONS = [
  { key: "latestPosts", label: "공지사항·보도자료", hint: "최근 게시글" },
  { key: "activityGallery", label: "활동 갤러리", hint: "최근 활동 사진" },
  { key: "quickLinks", label: "주요사업·참여 바로가기", hint: "주요사업·참여·실천 메뉴" },
  { key: "stats", label: "숫자로 보는 센터", hint: "수치 관리" },
  { key: "carbonData", label: "데이터로 보는 충남 탄소중립", hint: "충남 탄소중립 도표" },
  { key: "charts", label: "우리가 이뤄낸 탄소중립의 기록", hint: "도표 관리 › 메인 화면에도 표시" },
  { key: "relatedSites", label: "관련 사이트", hint: "관련 기관 로고" },
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number]["key"];

/** 기본 순서 (저장된 설정이 없을 때) */
export const DEFAULT_HOME_SECTION_ORDER: HomeSectionKey[] = HOME_SECTIONS.map((s) => s.key);

const KEYS = new Set<string>(DEFAULT_HOME_SECTION_ORDER);

export function isHomeSectionKey(value: unknown): value is HomeSectionKey {
  return typeof value === "string" && KEYS.has(value);
}

/**
 * 저장된 순서를 정리한다 — 모르는 값·중복은 버리고, 빠진 영역(새로 생긴 영역 등)은
 * 기본 순서상 바로 앞 영역 뒤에 끼워 넣는다.
 */
export function normalizeHomeSectionOrder(saved: unknown): HomeSectionKey[] {
  const order: HomeSectionKey[] = [];
  if (Array.isArray(saved)) {
    for (const key of saved) if (isHomeSectionKey(key) && !order.includes(key)) order.push(key);
  }
  DEFAULT_HOME_SECTION_ORDER.forEach((key, i) => {
    if (order.includes(key)) return;
    const prev = DEFAULT_HOME_SECTION_ORDER.slice(0, i).findLast((k) => order.includes(k));
    order.splice(prev ? order.indexOf(prev) + 1 : 0, 0, key);
  });
  return order;
}

export function homeSectionLabel(key: HomeSectionKey): string {
  return HOME_SECTIONS.find((s) => s.key === key)?.label ?? key;
}
