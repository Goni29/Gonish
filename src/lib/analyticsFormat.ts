const FALLBACK_ID_REGEX = /^fallback-\d{10,17}-[a-f0-9]{6,32}$/i;

export function formatDuration(ms: number) {
  const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  if (safeMs < 1000) return "0초";

  const totalSeconds = Math.floor(safeMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  if (hours > 0) return `${hours}시간 ${minutes}분`;
  if (totalMinutes > 0) return `${totalMinutes}분 ${seconds}초`;
  return `${seconds}초`;
}

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0";
  return Math.round(value).toLocaleString("ko-KR");
}

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  const percent = value * 100;
  return `${Number.isInteger(percent) ? percent.toFixed(0) : percent.toFixed(1)}%`;
}

export function maskAnalyticsId(id: string | null | undefined, prefix: string) {
  const clean = (id || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
  const suffix = clean.slice(-4) || "0000";
  return `${prefix} #${suffix}`;
}

export function isAllowedAnalyticsId(id: string, uuidRegex: RegExp) {
  return uuidRegex.test(id) || FALLBACK_ID_REGEX.test(id);
}

export function normalizeAnalyticsPath(value: unknown, maxLength = 200) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return "";

  try {
    const url = new URL(trimmed, "https://gonish.local");
    return url.pathname.slice(0, maxLength) || "/";
  } catch {
    const [withoutQuery] = trimmed.split("?");
    const [withoutHash] = withoutQuery.split("#");
    return withoutHash.slice(0, maxLength) || "/";
  }
}

export function normalizeAnalyticsReferrer(value: unknown, maxLength = 500) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return `${url.origin}${url.pathname}`.slice(0, maxLength);
  } catch {
    const [withoutQuery] = trimmed.split("?");
    const [withoutHash] = withoutQuery.split("#");
    return withoutHash.slice(0, maxLength);
  }
}

export function formatReferrerLabel(referrer: string | null | undefined) {
  if (!referrer) return "직접 방문";

  try {
    const url = new URL(referrer);
    const path = url.pathname && url.pathname !== "/" ? url.pathname : "";
    return `${url.hostname}${path}`;
  } catch {
    return referrer || "직접 방문";
  }
}

export function labelExitTarget(value: string | null | undefined) {
  if (!value) return "확인 중";
  return value === "(exit)" ? "사이트 이탈" : value;
}

export function getCompactDeviceType(userAgentSummary: string | null | undefined) {
  const summary = userAgentSummary || "";
  if (summary.includes("device=mobile")) return "모바일";
  if (summary.includes("device=tablet")) return "태블릿";
  if (summary.includes("device=desktop")) return "데스크톱";
  if (/mobile|iphone|android/i.test(summary)) return "모바일";
  if (/ipad|tablet/i.test(summary)) return "태블릿";
  return "데스크톱";
}
