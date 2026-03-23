"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getSessionId() {
  const key = "gonish_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

function send(payload: Record<string, unknown>) {
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", JSON.stringify(payload));
    } else {
      fetch("/api/analytics", {
        method: "POST",
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  } catch {
    // silently ignore
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const enteredAtRef = useRef<number>(0);
  const prevPathRef = useRef<string>("");

  useEffect(() => {
    // Skip admin pages
    if (pathname.startsWith("/admin")) return;

    const sessionId = getSessionId();
    const now = Date.now();

    // Send duration for previous page
    if (prevPathRef.current && enteredAtRef.current) {
      const duration = now - enteredAtRef.current;
      send({
        type: "duration",
        sessionId,
        pagePath: prevPathRef.current,
        durationMs: duration,
        exitedTo: pathname,
      });
    }

    // Record new pageview
    enteredAtRef.current = now;
    prevPathRef.current = pathname;

    send({
      type: "pageview",
      sessionId,
      pagePath: pathname,
      referrer: document.referrer || "",
    });

    // Send duration on page unload
    const handleUnload = () => {
      const duration = Date.now() - enteredAtRef.current;
      send({
        type: "duration",
        sessionId,
        pagePath: pathname,
        durationMs: duration,
        exitedTo: "(exit)",
      });
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [pathname]);

  return null;
}
