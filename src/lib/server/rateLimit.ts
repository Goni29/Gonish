/**
 * Supabase 기반 Rate Limiter
 *
 * check_rate_limit() RPC 를 호출해 원자적으로 요청 카운트를 확인·증가합니다.
 * 서버리스 환경(Vercel)에서 인스턴스 간 상태를 공유할 수 없으므로
 * Supabase DB 를 공유 저장소로 사용합니다.
 *
 * 정책 (엔드포인트별):
 *   /api/inquiries       — 10분(600s)에 3회
 *   /api/analytics       — 1분(60s)에 120회
 *   /api/admin/session   — 15분(900s)에 10회
 */

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase env vars for rate limiting.");
  }
  return { url, serviceRoleKey };
}

/**
 * IP + 엔드포인트 조합의 요청이 허용 범위 내인지 확인합니다.
 *
 * @returns true  → 허용 (한도 이하)
 * @returns false → 차단 (한도 초과)
 *
 * DB 오류 시 fail-open(true 반환)으로 처리해 서비스를 중단하지 않습니다.
 */
export async function checkRateLimit(
  ip: string,
  endpoint: string,
  windowSecs: number,
  maxRequests: number,
): Promise<boolean> {
  try {
    const config = getSupabaseConfig();

    const response = await fetch(`${config.url}/rest/v1/rpc/check_rate_limit`, {
      method: "POST",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_ip: ip,
        p_endpoint: endpoint,
        p_window_secs: windowSecs,
        p_max_requests: maxRequests,
      }),
    });

    if (!response.ok) return true; // fail-open

    const result = (await response.json()) as boolean;
    return result === true;
  } catch {
    return true; // fail-open: DB 장애 시 서비스 중단 방지
  }
}

/**
 * 요청에서 클라이언트 IP 를 추출합니다.
 * Vercel 환경에서는 x-forwarded-for 헤더를 사용합니다.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim().slice(0, 64);

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim().slice(0, 64);

  return "unknown";
}

// 엔드포인트별 rate limit 정책 상수
export const RATE_LIMIT = {
  INQUIRIES: { windowSecs: 600, maxRequests: 3 },   // 10분에 3회
  ANALYTICS: { windowSecs: 60,  maxRequests: 120 },  // 1분에 120회
  ADMIN_LOGIN: { windowSecs: 900, maxRequests: 10 },  // 15분에 10회
} as const;
