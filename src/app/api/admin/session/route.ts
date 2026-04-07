import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE_PATH,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
  deleteAdminSession,
  getAdminDashboardKey,
  verifyAdminKey,
} from "@/lib/server/adminAuth";
import { checkRateLimit, getClientIp, RATE_LIMIT } from "@/lib/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clearAdminCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    path: ADMIN_SESSION_COOKIE_PATH,
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function POST(request: Request) {
  // Rate limiting: 15분에 10회 (brute-force 방어)
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(
    ip,
    "admin_login",
    RATE_LIMIT.ADMIN_LOGIN.windowSecs,
    RATE_LIMIT.ADMIN_LOGIN.maxRequests,
  );
  if (!allowed) {
    return NextResponse.json(
      { ok: false, message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429 },
    );
  }

  const dashboardKey = getAdminDashboardKey();
  if (!dashboardKey) {
    return NextResponse.json(
      { ok: false, message: "ADMIN_DASHBOARD_KEY가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  let body: { key?: string };
  try {
    body = (await request.json()) as { key?: string };
  } catch {
    return NextResponse.json({ ok: false, message: "요청 본문을 읽을 수 없습니다." }, { status: 400 });
  }

  const inputKey = (body.key || "").trim();

  // scrypt 해시 비교 (verifyAdminKey 내부에서 timingSafeEqual 사용)
  // 환경변수에는 비밀번호 원문이 아닌 scrypt 해시가 저장됩니다.
  if (!verifyAdminKey(inputKey)) {
    return NextResponse.json({ ok: false, message: "관리자 키가 올바르지 않습니다." }, { status: 401 });
  }

  let rawToken: string;
  try {
    rawToken = await createAdminSession(getClientIp(request));
  } catch {
    return NextResponse.json({ ok: false, message: "세션 생성에 실패했습니다." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: rawToken,
    path: ADMIN_SESSION_COOKIE_PATH,
    maxAge: ADMIN_SESSION_MAX_AGE,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export async function DELETE() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";

  // DB에서 세션 삭제 (best-effort)
  await deleteAdminSession(rawToken);

  const response = NextResponse.json({ ok: true });
  clearAdminCookie(response);
  return response;
}
