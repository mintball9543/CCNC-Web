import type { NavSection } from "@/types";

/** 메뉴 노출 설정 키 */
export const sectionKey = (key: string) => `section:${key}`;

/**
 * 메뉴 노출 설정을 적용한 메뉴 트리 (순수 함수).
 * - 숨긴 대메뉴 / 숨긴 하위 메뉴 제거
 * - 하위 메뉴가 모두 숨겨지면 대메뉴도 제거
 * - 대메뉴 링크는 첫 번째로 보이는 하위 메뉴로 변경
 * 설정이 없는 항목은 '표시'로 간주한다.
 */
export function applyMenuVisibility(
  navigation: NavSection[],
  settings: Record<string, boolean>,
): NavSection[] {
  return navigation
    .filter((section) => settings[sectionKey(section.key)] !== false)
    .map((section) => {
      const items = section.items.filter((item) => settings[item.href] !== false);
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
