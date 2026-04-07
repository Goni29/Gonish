import { createHash } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "gonish_admin_session";
export const ADMIN_SESSION_COOKIE_PATH = "/";

export function getAdminDashboardKey() {
  return (process.env.ADMIN_DASHBOARD_KEY || "").trim();
}

export function buildAdminSessionValue(adminKey: string) {
  return createHash("sha256").update(`gonish-admin:${adminKey}`).digest("hex");
}

export async function isAdminAuthenticated() {
  const dashboardKey = getAdminDashboardKey();
  if (!dashboardKey) return false;

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";

  return sessionValue === buildAdminSessionValue(dashboardKey);
}
