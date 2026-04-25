import { NextRequest, NextResponse } from "next/server";
import {
  isAllowedAnalyticsId,
  normalizeAnalyticsPath,
  normalizeAnalyticsReferrer,
} from "@/lib/analyticsFormat";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/server/adminAuth";
import { insertAnalyticsEvent, updateAnalyticsEventDuration } from "@/lib/server/analyticsStore";
import { checkRateLimit, getClientIp, RATE_LIMIT } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE_PATH_REGEX = /^\//;
const MAX_ANALYTICS_ID_LENGTH = 64;
const MAX_PAGE_PATH_LENGTH = 200;
const MAX_EXITED_TO_LENGTH = 200;
const MAX_DURATION_MS = 86_400_000; // 24시간

const ANALYTICS_EVENT_TYPES = [
  "pageview",
  "duration",
  "session_start",
  "session_end",
  "page_exit",
  "section_view",
  "section_exit",
  "scroll_depth",
  "heartbeat",
  "idle_start",
  "idle_end",
] as const;

type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

function isKnownEventType(value: unknown): value is AnalyticsEventType {
  return typeof value === "string" && ANALYTICS_EVENT_TYPES.includes(value as AnalyticsEventType);
}

function isValidAnalyticsId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_ANALYTICS_ID_LENGTH &&
    isAllowedAnalyticsId(value, UUID_REGEX)
  );
}

function isValidPagePath(value: string): boolean {
  return value.length > 0 && value.length <= MAX_PAGE_PATH_LENGTH && PAGE_PATH_REGEX.test(value);
}

function sanitizeDurationMs(value: unknown): number {
  const n = typeof value === "number" ? Math.floor(value) : 0;
  return Math.max(0, Math.min(n, MAX_DURATION_MS));
}

function sanitizeExitedTo(value: unknown): string {
  if (typeof value !== "string") return "";
  const normalized = value === "(exit)" ? value : normalizeAnalyticsPath(value, MAX_EXITED_TO_LENGTH);
  return normalized.slice(0, MAX_EXITED_TO_LENGTH);
}

function summarizeUserAgent(rawUserAgent: string) {
  const raw = rawUserAgent.slice(0, 512);
  const lower = raw.toLowerCase();

  let browser = "other";
  if (lower.includes("edg/")) browser = "edge";
  else if (lower.includes("samsungbrowser")) browser = "samsung-internet";
  else if (lower.includes("firefox/")) browser = "firefox";
  else if (lower.includes("chrome/") || lower.includes("crios/")) browser = "chrome";
  else if (lower.includes("safari/")) browser = "safari";

  let os = "other";
  if (lower.includes("windows")) os = "windows";
  else if (lower.includes("iphone") || lower.includes("ipad")) os = "ios";
  else if (lower.includes("android")) os = "android";
  else if (lower.includes("mac os x") || lower.includes("macintosh")) os = "macos";
  else if (lower.includes("linux")) os = "linux";

  let device = "desktop";
  if (lower.includes("ipad") || lower.includes("tablet")) device = "tablet";
  else if (lower.includes("mobi") || lower.includes("iphone") || lower.includes("android")) device = "mobile";

  // user_agent 컬럼에는 원문 장기 보관 대신 분석용 축약값만 저장합니다.
  return `browser=${browser}; os=${os}; device=${device}`;
}

async function isVerifiedAdminRequest(request: NextRequest) {
  const rawToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!rawToken) return false;

  try {
    return await verifyAdminSession(rawToken);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (await isVerifiedAdminRequest(request)) {
    return NextResponse.json({ ok: true, ignored: "admin" });
  }

  const ip = getClientIp(request);
  const allowed = await checkRateLimit(
    ip,
    "analytics",
    RATE_LIMIT.ANALYTICS.windowSecs,
    RATE_LIMIT.ANALYTICS.maxRequests,
  );
  if (!allowed) {
    return NextResponse.json({ ok: false, message: "Too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body" }, { status: 400 });
  }

  const { type } = body;
  if (!isKnownEventType(type)) {
    return NextResponse.json({ ok: false, message: "Unknown event type" }, { status: 400 });
  }

  if (type !== "pageview" && type !== "duration") {
    return NextResponse.json({ ok: true, ignored: "event_not_enabled" });
  }

  const visitorId = body.visitorId;
  const sessionId = body.sessionId;
  const pagePath = normalizeAnalyticsPath(body.pagePath, MAX_PAGE_PATH_LENGTH);

  if (!isValidAnalyticsId(visitorId)) {
    return NextResponse.json({ ok: false, message: "Invalid visitorId" }, { status: 400 });
  }
  if (!isValidAnalyticsId(sessionId)) {
    return NextResponse.json({ ok: false, message: "Invalid sessionId" }, { status: 400 });
  }
  if (!isValidPagePath(pagePath)) {
    return NextResponse.json({ ok: false, message: "Invalid pagePath" }, { status: 400 });
  }

  if (type === "pageview") {
    try {
      await insertAnalyticsEvent({
        visitorId,
        sessionId,
        pagePath,
        referrer: normalizeAnalyticsReferrer(body.referrer),
        userAgent: summarizeUserAgent(request.headers.get("user-agent") || ""),
      });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false, message: "Internal error" }, { status: 500 });
    }
  }

  try {
    await updateAnalyticsEventDuration(
      visitorId,
      sessionId,
      pagePath,
      sanitizeDurationMs(body.durationMs),
      sanitizeExitedTo(body.exitedTo),
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Internal error" }, { status: 500 });
  }
}
