import { NextRequest, NextResponse } from "next/server";
import { insertAnalyticsEvent, updateAnalyticsEventDuration } from "@/lib/server/analyticsStore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === "pageview") {
      const { sessionId, pagePath, referrer } = body;
      if (!sessionId || !pagePath) {
        return NextResponse.json({ ok: false, message: "Missing sessionId or pagePath" }, { status: 400 });
      }

      await insertAnalyticsEvent({
        sessionId,
        pagePath,
        referrer: referrer || "",
        userAgent: request.headers.get("user-agent") || "",
      });

      return NextResponse.json({ ok: true });
    }

    if (type === "duration") {
      const { sessionId, pagePath, durationMs, exitedTo } = body;
      if (!sessionId || !pagePath) {
        return NextResponse.json({ ok: false, message: "Missing sessionId or pagePath" }, { status: 400 });
      }

      await updateAnalyticsEventDuration(sessionId, pagePath, durationMs || 0, exitedTo || "");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, message: "Unknown event type" }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, message: "Internal error" }, { status: 500 });
  }
}
