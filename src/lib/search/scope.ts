import { boardList } from "@/lib/config/boards";
import type { BoardKey, NavSection } from "@/types";

/** 통합 검색 범위 (순수 함수) — 관리자 '메뉴 표시 설정'으로 숨긴 메뉴·게시판은 검색하지 않는다 */

/** 공개 메뉴에 보이는 게시판 키 (게시판 정의 순서) */
export function visibleBoardKeys(navigation: NavSection[]): BoardKey[] {
  const hrefs = new Set(navigation.flatMap((section) => section.items.map((item) => item.href)));
  return boardList.filter((board) => hrefs.has(`/news/${board.key}`)).map((board) => board.key);
}

export interface MenuSearchResult {
  title: string;
  href: string;
  /** 대메뉴 이름 */
  section: string;
}

/** 메뉴(페이지) 이름 검색 — 모든 검색어 조각이 '대메뉴 + 메뉴 이름'에 들어 있는 메뉴 */
export function searchMenus(navigation: NavSection[], terms: string[]): MenuSearchResult[] {
  if (terms.length === 0) return [];
  const lowered = terms.map((t) => t.toLowerCase());
  return navigation.flatMap((section) =>
    section.items
      .filter((item) => {
        const haystack = `${section.title} ${item.title}`.toLowerCase();
        return lowered.every((term) => haystack.includes(term));
      })
      .map((item) => ({ title: item.title, href: item.href, section: section.title })),
  );
}
