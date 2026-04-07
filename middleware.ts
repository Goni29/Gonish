import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_PATH = "/admin/login";
const ADMIN_SESSION_COOKIE = "gonish_admin_session";

/**
 * Edge Middleware — /admin 경로 진입 시 쿠키 존재 여부를 확인합니다.
 *
 * 쿠키가 없으면 /admin/login 으로 즉시 redirect 합니다.
 * 쿠키가 있더라도 실제 유효성 검증(DB 조회)은 각 서버 컴포넌트에서
 * isAdminAuthenticated() 를 통해 수행합니다.
 *
 * Edge Runtime 에서는 node:crypto 가 제한되므로
 * DB 조회 없이 쿠키 존재 여부만 확인하는 것이 현실적인 최선입니다.
 * 쿠키가 있어도 서버 컴포넌트에서 유효성 검증을 다시 하므로
 * 보안상 문제가 없습니다.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 페이지 자체는 통과
  if (pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!session) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    // 로그인 후 원래 페이지로 돌아올 수 있도록 next 파라미터 전달
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // /admin 하위 경로 전체에 적용 (/admin/login 은 핸들러 내에서 제외)
  matcher: ["/admin/:path*"],
};
