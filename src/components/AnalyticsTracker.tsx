"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function createSessionId() {
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

  return `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionId() {
  const key = "gonish_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = createSessionId();
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
  const pathname = usePathname() ?? "/";
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
