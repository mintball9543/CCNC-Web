/**
 * 숨긴 메뉴 접근 차단 (proxy 전용).
 * proxy 는 렌더링 코드와 별도로 실행되므로 Next 캐시(updateTag)를 공유하지 않는다.
 * 대신 메뉴 노출 설정을 짧게(5초) 메모리에 보관해 매 요청 DB 조회를 피한다.
 */
import { applyMenuVisibility, isHiddenPath } from "@/lib/config/menu-visibility";
import { mainNavigation } from "@/lib/config/navigation";
import { createDatabase, type Database } from "@/lib/db/factory";
import { menuSettings } from "@/lib/db/schema";

const TTL_MS = 5_000;
let db: Database | null = null;
let cache: { at: number; settings: Record<string, boolean> } | null = null;

async function loadSettings(): Promise<Record<string, boolean>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.settings;
  db ??= createDatabase();
  const rows = await db.select().from(menuSettings);
  cache = { at: Date.now(), settings: Object.fromEntries(rows.map((r) => [r.key, r.isVisible])) };
  return cache.settings;
}

export async function isHiddenMenuPath(pathname: string): Promise<boolean> {
  try {
    const visible = applyMenuVisibility(mainNavigation, await loadSettings());
    return isHiddenPath(pathname, visible, mainNavigation);
  } catch (error) {
    // DB 오류 시 페이지는 정상 처리하고 화면 단계의 검사(SectionLayout)에 맡긴다
    console.error("메뉴 노출 설정 조회 실패", error);
    return false;
  }
}
