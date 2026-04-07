import { NextRequest, NextResponse } from "next/server";
import { insertAnalyticsEvent, updateAnalyticsEventDuration } from "@/lib/server/analyticsStore";
import { checkRateLimit, getClientIp, RATE_LIMIT } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

// 입력값 검증 상수
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE_PATH_REGEX = /^\//;
const MAX_SESSION_ID_LENGTH = 64;
const MAX_PAGE_PATH_LENGTH = 200;
const MAX_EXITED_TO_LENGTH = 200;
const MAX_DURATION_MS = 86_400_000; // 24시간

function isValidSessionId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_SESSION_ID_LENGTH &&
    UUID_REGEX.test(value)
  );
}

function isValidPagePath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_PAGE_PATH_LENGTH &&
    PAGE_PATH_REGEX.test(value)
  );
}

function sanitizeDurationMs(value: unknown): number {
  const n = typeof value === "number" ? Math.floor(value) : 0;
  return Math.max(0, Math.min(n, MAX_DURATION_MS));
}

function sanitizeExitedTo(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_EXITED_TO_LENGTH);
}

export async function POST(request: NextRequest) {
  // Rate limiting
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

  if (type === "pageview") {
    const { sessionId, pagePath, referrer } = body;

    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { ok: false, message: "Invalid sessionId" },
        { status: 400 },
      );
    }
    if (!isValidPagePath(pagePath)) {
      return NextResponse.json(
        { ok: false, message: "Invalid pagePath" },
        { status: 400 },
      );
    }

    try {
      await insertAnalyticsEvent({
        sessionId,
        pagePath,
        referrer: typeof referrer === "string" ? referrer.slice(0, 500) : "",
        userAgent: (request.headers.get("user-agent") || "").slice(0, 512),
      });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false, message: "Internal error" }, { status: 500 });
    }
  }

  if (type === "duration") {
    const { sessionId, pagePath, durationMs, exitedTo } = body;

    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { ok: false, message: "Invalid sessionId" },
        { status: 400 },
      );
    }
    if (!isValidPagePath(pagePath)) {
      return NextResponse.json(
        { ok: false, message: "Invalid pagePath" },
        { status: 400 },
      );
    }

    try {
      await updateAnalyticsEventDuration(
        sessionId,
        pagePath,
        sanitizeDurationMs(durationMs),
        sanitizeExitedTo(exitedTo),
      );
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false, message: "Internal error" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: false, message: "Unknown event type" }, { status: 400 });
}
