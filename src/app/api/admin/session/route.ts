import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE_PATH,
  buildAdminSessionValue,
  getAdminDashboardKey,
} from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clearAdminCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    path: ADMIN_SESSION_COOKIE_PATH,
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    path: "/admin",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function POST(request: Request) {
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
  if (!inputKey || inputKey !== dashboardKey) {
    return NextResponse.json({ ok: false, message: "관리자 키가 올바르지 않습니다." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: buildAdminSessionValue(dashboardKey),
    path: ADMIN_SESSION_COOKIE_PATH,
    maxAge: 60 * 60 * 12,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearAdminCookie(response);
  return response;
}
