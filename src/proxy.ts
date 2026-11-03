import { NextResponse, type NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/auth/token";

/**
 * 관리자 영역 낙관적 접근 제어.
 * 실제 권한 검증은 각 페이지/Server Action 의 requireAdmin() 에서 다시 수행한다.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  const isLoginPage = pathname === "/admin/login";

  if (!session && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
