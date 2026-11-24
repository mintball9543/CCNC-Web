import type { NavSection } from "@/types";

/** 메뉴 노출 설정 키 */
export const sectionKey = (key: string) => `section:${key}`;

/**
 * 메뉴 노출 설정을 적용한 메뉴 트리 (순수 함수).
 * - 숨긴 대메뉴 / 숨긴 하위 메뉴 제거
 * - 하위 메뉴가 모두 숨겨지면 대메뉴도 제거
 * - 대메뉴 링크는 첫 번째로 보이는 하위 메뉴로 변경
 * 설정이 없는 항목은 '표시'로 간주한다.
 * 고정 대메뉴(locked)는 저장된 설정과 관계없이 대메뉴·하위 메뉴 모두 항상 표시한다.
 */
export function applyMenuVisibility(
  navigation: NavSection[],
  settings: Record<string, boolean>,
): NavSection[] {
  return navigation
    .filter((section) => section.locked || settings[sectionKey(section.key)] !== false)
    .map((section) => {
      const items = section.locked
        ? section.items
        : section.items.filter((item) => settings[item.href] !== false);
      return { ...section, items, href: items[0]?.href ?? section.href };
    })
    .filter((section) => section.items.length > 0);
}

/** 숨겨진 경로인지 (하위 경로 포함) */
export function isHiddenPath(pathname: string, visible: NavSection[], all: NavSection[]): boolean {
  const section = all.find((s) => s.key === pathname.split("/")[1]);
  if (!section) return false;
  const visibleSection = visible.find((s) => s.key === section.key);
  if (!visibleSection) return true;
  const item = section.items.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  if (!item) return false;
  return !visibleSection.items.some((i) => i.href === item.href);
}

/**
 * 링크 주소가 공개 메뉴에서 보이는 페이지인지 (#·? 뒤는 무시).
 * 메뉴에 속하지 않는 주소(홈, 검색 등)는 항상 보이는 것으로 본다.
 */
export function isVisibleHref(href: string, visible: NavSection[], all: NavSection[]): boolean {
  const pathname = href.split(/[?#]/)[0];
  return !isHiddenPath(pathname, visible, all);
}
