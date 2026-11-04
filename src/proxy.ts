import { NextResponse, type NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/auth/token";
import { isHiddenMenuPath } from "@/lib/proxy/hidden-menu";

/**
 * 요청 전처리
 * 1) /admin — 관리자 세션 낙관적 확인 (실제 권한 검증은 각 페이지/Server Action 의 requireAdmin())
 * 2) 공개 메뉴 — 관리자가 숨긴 메뉴의 페이지는 렌더링 전에 404 로 응답
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const session = await decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
    const isLoginPage = pathname === "/admin/login";
    if (!session && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    if (session && isLoginPage) return NextResponse.redirect(new URL("/admin", request.url));
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  if (await isHiddenMenuPath(pathname)) {
    // 존재하지 않는 경로로 내부 재작성 → not-found 화면과 404 상태 코드
    return NextResponse.rewrite(new URL("/_hidden-menu", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // 공개 대메뉴 경로는 src/lib/config/navigation.ts 와 맞춰야 한다 (matcher 는 정적 값만 허용)
  matcher: [
    "/admin",
    "/admin/:path*",
    "/about/:path*",
    "/business/:path*",
    "/participation/:path*",
    "/carbon-neutral/:path*",
    "/news/:path*",
  ],
};
