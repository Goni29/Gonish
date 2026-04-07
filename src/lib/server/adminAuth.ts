import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "gonish_admin_session";
export const ADMIN_SESSION_COOKIE_PATH = "/admin";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12; // 12시간

/**
 * ADMIN_DASHBOARD_KEY_HASH 환경변수가 설정됐는지 확인합니다.
 * 값 자체(해시 문자열)를 반환하며, 비어있으면 관리자 기능이 비활성 상태입니다.
 *
 * 환경변수 형식: "salt(hex):hash(hex)"
 * 생성 방법: node scripts/hash-admin-key.mjs
 */
export function getAdminDashboardKey(): string {
  return (process.env.ADMIN_DASHBOARD_KEY_HASH || "").trim();
}

/**
 * 입력된 비밀번호를 저장된 scrypt 해시와 비교합니다.
 *
 * - scrypt: 느린 해시 함수 (brute-force 저항)
 * - timingSafeEqual: 비교 시간 고정 (timing attack 방어)
 * - 오류 발생 시 항상 false 반환 (fail-closed)
 */
export function verifyAdminKey(input: string): boolean {
  const storedHash = getAdminDashboardKey();
  if (!storedHash || !input.trim()) return false;

  const colonIndex = storedHash.indexOf(":");
  if (colonIndex === -1) return false;

  const salt = storedHash.slice(0, colonIndex);
  const hash = storedHash.slice(colonIndex + 1);

  try {
    const inputHash = scryptSync(input.trim(), salt, 64);
    const expectedHash = Buffer.from(hash, "hex");
    if (inputHash.length !== expectedHash.length) return false;
    return timingSafeEqual(inputHash, expectedHash);
  } catch {
    return false;
  }
}

function hashToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }
  return { url, serviceRoleKey };
}

function supabaseHeaders(serviceRoleKey: string, extra?: Record<string, string>) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extra,
  };
}

/**
 * 새 관리자 세션을 생성하고 raw 토큰을 반환합니다.
 * 쿠키에는 raw 토큰, DB에는 SHA-256 해시만 저장됩니다.
 */
export async function createAdminSession(ipHint = ""): Promise<string> {
  const config = getSupabaseConfig();

  // 만료된 세션 정리 (best-effort)
  fetch(`${config.url}/rest/v1/rpc/cleanup_expired_admin_sessions`, {
    method: "POST",
    headers: supabaseHeaders(config.serviceRoleKey),
    body: JSON.stringify({}),
  }).catch(() => undefined);

  const rawToken = randomBytes(32).toString("hex"); // 64자 hex
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_MAX_AGE * 1000).toISOString();

  const response = await fetch(`${config.url}/rest/v1/admin_sessions`, {
    method: "POST",
    headers: supabaseHeaders(config.serviceRoleKey, { Prefer: "return=minimal" }),
    body: JSON.stringify({
      token_hash: tokenHash,
      expires_at: expiresAt,
      ip_hint: ipHint.slice(0, 64),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to create admin session: ${err}`);
  }

  return rawToken;
}

/**
 * 쿠키의 raw 토큰을 해시해 DB에서 유효한 세션을 조회합니다.
 * 유효하면 last_used_at 을 갱신하고 true 를 반환합니다.
 */
export async function verifyAdminSession(rawToken: string): Promise<boolean> {
  if (!rawToken) return false;

  const config = getSupabaseConfig();
  const tokenHash = hashToken(rawToken);

  const query = new URLSearchParams({
    select: "id",
    token_hash: `eq.${tokenHash}`,
    expires_at: `gt.${new Date().toISOString()}`,
    limit: "1",
  });

  const response = await fetch(`${config.url}/rest/v1/admin_sessions?${query.toString()}`, {
    method: "GET",
    headers: supabaseHeaders(config.serviceRoleKey),
    cache: "no-store",
  });

  if (!response.ok) return false;

  const rows = (await response.json()) as Array<{ id: string }>;
  if (!Array.isArray(rows) || rows.length === 0) return false;

  // last_used_at 갱신 (best-effort, 실패해도 인증 결과에 영향 없음)
  fetch(
    `${config.url}/rest/v1/admin_sessions?token_hash=eq.${tokenHash}`,
    {
      method: "PATCH",
      headers: supabaseHeaders(config.serviceRoleKey, { Prefer: "return=minimal" }),
      body: JSON.stringify({ last_used_at: new Date().toISOString() }),
    },
  ).catch(() => undefined);

  return true;
}

/**
 * DB에서 세션을 삭제합니다 (로그아웃 시 호출).
 */
export async function deleteAdminSession(rawToken: string): Promise<void> {
  if (!rawToken) return;

  const config = getSupabaseConfig();
  const tokenHash = hashToken(rawToken);

  await fetch(
    `${config.url}/rest/v1/admin_sessions?token_hash=eq.${tokenHash}`,
    {
      method: "DELETE",
      headers: supabaseHeaders(config.serviceRoleKey),
    },
  ).catch(() => undefined);
}

/**
 * 현재 요청의 쿠키를 읽어 세션 유효성을 검증합니다.
 * 서버 컴포넌트 및 Route Handler 에서 사용합니다.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const dashboardKey = getAdminDashboardKey();
  if (!dashboardKey) return false;

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";

  return verifyAdminSession(rawToken);
}
