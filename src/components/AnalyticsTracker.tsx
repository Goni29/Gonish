"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { normalizeAnalyticsPath, normalizeAnalyticsReferrer } from "@/lib/analyticsFormat";

type AnalyticsEventType =
  | "pageview"
  | "duration"
  | "session_start"
  | "session_end"
  | "page_exit"
  | "section_view"
  | "section_exit"
  | "scroll_depth"
  | "heartbeat"
  | "idle_start"
  | "idle_end";

type AnalyticsPayload = {
  type: AnalyticsEventType;
  visitorId: string;
  sessionId: string;
  pagePath: string;
  referrer?: string;
  durationMs?: number;
  exitedTo?: string;
};

const VISITOR_ID_KEY = "gonish_visitor_id";
const SESSION_ID_KEY = "gonish_session_id";
const LAST_ACTIVITY_KEY = "gonish_last_activity_at";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function createAnalyticsId() {
  const webCrypto = globalThis.crypto;
  if (typeof webCrypto?.randomUUID === "function") {
    return webCrypto.randomUUID();
  }

  if (typeof webCrypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    webCrypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
  }

  return `fallback-${Date.now()}-${Math.random().toString(16).slice(2, 14)}`;
}

function safeGet(storage: Storage, key: string) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // Storage can be disabled in strict browser modes.
  }
}

function getVisitorId() {
  const stored = safeGet(localStorage, VISITOR_ID_KEY);
  if (stored) return stored;

  const id = createAnalyticsId();
  safeSet(localStorage, VISITOR_ID_KEY, id);
  return id;
}

function readLastActivityAt() {
  const raw = safeGet(sessionStorage, LAST_ACTIVITY_KEY);
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

function isSessionExpired(now: number) {
  const lastActivityAt = readLastActivityAt();
  return lastActivityAt > 0 && now - lastActivityAt > SESSION_TIMEOUT_MS;
}

function touchSessionActivity(now = Date.now()) {
  safeSet(sessionStorage, LAST_ACTIVITY_KEY, String(now));
}

function getSessionId(forceNew = false) {
  let id = forceNew ? "" : safeGet(sessionStorage, SESSION_ID_KEY);
  if (!id) {
    id = createAnalyticsId();
    safeSet(sessionStorage, SESSION_ID_KEY, id);
  }
  return id;
}

function send(payload: AnalyticsPayload) {
  try {
    const body = JSON.stringify(payload);
    const queued = typeof navigator.sendBeacon === "function"
      ? navigator.sendBeacon("/api/analytics", body)
      : false;

    if (!queued) {
      fetch("/api/analytics", {
        method: "POST",
        body,
        keepalive: true,
      });
    }
  } catch {
    // Analytics should never interrupt the public site experience.
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname() ?? "/";
  const enteredAtRef = useRef<number>(0);
  const pagePathRef = useRef<string>("");
  const sessionIdRef = useRef<string>("");
  const visitorIdRef = useRef<string>("");

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const now = Date.now();
    const pagePath = normalizeAnalyticsPath(pathname) || "/";
    const visitorId = visitorIdRef.current || getVisitorId();
    visitorIdRef.current = visitorId;

    const expired = isSessionExpired(now);
    const previousSessionId = sessionIdRef.current;

    if (pagePathRef.current && enteredAtRef.current && previousSessionId) {
      send({
        type: "duration",
        visitorId,
        sessionId: previousSessionId,
        pagePath: pagePathRef.current,
        durationMs: now - enteredAtRef.current,
        exitedTo: pagePath,
      });
    }

    const sessionId = getSessionId(expired);
    sessionIdRef.current = sessionId;
    enteredAtRef.current = now;
    pagePathRef.current = pagePath;
    touchSessionActivity(now);

    send({
      type: "pageview",
      visitorId,
      sessionId,
      pagePath,
      referrer: normalizeAnalyticsReferrer(document.referrer || ""),
    });

    const flushDuration = (exitedTo: string) => {
      if (!enteredAtRef.current || !pagePathRef.current || !sessionIdRef.current) return;
      send({
        type: "duration",
        visitorId: visitorIdRef.current || visitorId,
        sessionId: sessionIdRef.current,
        pagePath: pagePathRef.current,
        durationMs: Date.now() - enteredAtRef.current,
        exitedTo,
      });
    };

    const handleBeforeUnload = () => flushDuration("(exit)");
    const handlePageHide = () => flushDuration("(exit)");
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Hidden 상태는 실제 이탈이 아닐 수 있으므로 duration만 갱신하고 exited_to는 비워 둡니다.
        flushDuration("");
      } else {
        const resumedAt = Date.now();
        if (isSessionExpired(resumedAt) && pagePathRef.current) {
          const resumedSessionId = getSessionId(true);
          sessionIdRef.current = resumedSessionId;
          enteredAtRef.current = resumedAt;
          touchSessionActivity(resumedAt);
          send({
            type: "pageview",
            visitorId: visitorIdRef.current || visitorId,
            sessionId: resumedSessionId,
            pagePath: pagePathRef.current,
            referrer: "",
          });
        } else {
          touchSessionActivity(resumedAt);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}
