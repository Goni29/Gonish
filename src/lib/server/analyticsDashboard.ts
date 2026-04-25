import { formatDuration, formatReferrerLabel, getCompactDeviceType, labelExitTarget } from "@/lib/analyticsFormat";

const SUPABASE_ANALYTICS_TABLE = process.env.SUPABASE_ANALYTICS_TABLE || "analytics_events";

type AnalyticsEventRow = {
  id: string;
  visitor_id: string | null;
  session_id: string;
  page_path: string;
  referrer: string;
  entered_at: string;
  duration_ms: number;
  exited_to: string;
  user_agent: string;
  created_at: string;
};

export type DailyTrend = {
  date: string;
  visitors: number;
  sessions: number;
  avgDurationMs: number;
  fallbackUsed: boolean;
};

export type PageStat = {
  pagePath: string;
  visitors: number;
  sessions: number;
  avgDurationMs: number;
  exitRate: number;
  mainDestination: string;
};

export type ExitPathStat = {
  pagePath: string;
  exitedTo: string;
  count: number;
  avgDurationMs: number;
  interpretation: string;
};

export type ReferrerStat = {
  referrer: string;
  visitors: number;
  sessions: number;
  avgDurationMs: number;
};

export type SessionLog = {
  sessionId: string;
  visitorId: string | null;
  startedAt: string;
  visitorKind: "신규 추정" | "재방문 추정" | "세션 기준 과거 데이터";
  totalDurationMs: number;
  pathParts: string[];
  hiddenPathCount: number;
  exitLocation: string;
  referrer: string;
  deviceType: string;
};

export type VisitorSummary = {
  visitorId: string;
  legacySessionOnly: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  sessionCount: number;
  totalDurationMs: number;
  avgDurationMs: number;
  topPage: string;
  topExitLocation: string;
  returning: boolean;
};

export type AnalyticsDashboardData = {
  todayVisitors: number;
  todaySessions: number;
  avgSessionDurationMs: number;
  activeDurationReady: boolean;
  topExitPath: ExitPathStat | null;
  fallbackUsed: boolean;
  newSessionCount: number;
  returningSessionCount: number;
  dailyTrends: DailyTrend[];
  pageStats: PageStat[];
  exitPaths: ExitPathStat[];
  referrers: ReferrerStat[];
  sessionLogs: SessionLog[];
  visitorSummaries: VisitorSummary[];
  insights: string[];
};

type SessionGroup = {
  sessionId: string;
  visitorId: string | null;
  rows: AnalyticsEventRow[];
  startedAt: string;
  lastSeenAt: string;
  totalDurationMs: number;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Missing Supabase config");
  return { url, serviceRoleKey };
}

function supabaseHeaders(serviceRoleKey: string) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function dateKey(value: string) {
  return value.slice(0, 10);
}

function visitorKey(row: AnalyticsEventRow) {
  return row.visitor_id || row.session_id;
}

function safeDuration(row: AnalyticsEventRow) {
  return Number.isFinite(row.duration_ms) ? Math.max(0, row.duration_ms) : 0;
}

function sortRowsByVisit(a: AnalyticsEventRow, b: AnalyticsEventRow) {
  const aTime = Date.parse(a.entered_at || a.created_at);
  const bTime = Date.parse(b.entered_at || b.created_at);
  return aTime - bTime;
}

function topEntry(map: Map<string, number>) {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function pushUniqueConsecutive(target: string[], value: string) {
  if (!value) return;
  if (target[target.length - 1] !== value) target.push(value);
}

async function fetchRecentRows(days: number, limit = 5000): Promise<AnalyticsEventRow[]> {
  const config = getSupabaseConfig();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const baseQuery = {
    created_at: `gte.${since.toISOString()}`,
    order: "created_at.asc",
    limit: String(limit),
  };

  const query = new URLSearchParams({
    select: "id,visitor_id,session_id,page_path,referrer,entered_at,duration_ms,exited_to,user_agent,created_at",
    ...baseQuery,
  });

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_ANALYTICS_TABLE}?${query.toString()}`, {
    method: "GET",
    headers: supabaseHeaders(config.serviceRoleKey),
    cache: "no-store",
  });

  if (response.ok) {
    const rows = (await response.json()) as AnalyticsEventRow[];
    return Array.isArray(rows) ? rows : [];
  }

  // visitor_id migration 적용 전 환경에서도 대시보드가 깨지지 않도록 legacy select 로 한 번 더 시도합니다.
  const legacyQuery = new URLSearchParams({
    select: "id,session_id,page_path,referrer,entered_at,duration_ms,exited_to,user_agent,created_at",
    ...baseQuery,
  });
  const legacyResponse = await fetch(`${config.url}/rest/v1/${SUPABASE_ANALYTICS_TABLE}?${legacyQuery.toString()}`, {
    method: "GET",
    headers: supabaseHeaders(config.serviceRoleKey),
    cache: "no-store",
  });

  if (!legacyResponse.ok) return [];
  const rows = (await legacyResponse.json()) as Array<Omit<AnalyticsEventRow, "visitor_id">>;
  return Array.isArray(rows) ? rows.map((row) => ({ ...row, visitor_id: null })) : [];
}

function buildSessionGroups(rows: AnalyticsEventRow[]) {
  const map = new Map<string, SessionGroup>();

  for (const row of rows) {
    const current = map.get(row.session_id);
    if (!current) {
      map.set(row.session_id, {
        sessionId: row.session_id,
        visitorId: row.visitor_id,
        rows: [row],
        startedAt: row.entered_at || row.created_at,
        lastSeenAt: row.created_at,
        totalDurationMs: safeDuration(row),
      });
      continue;
    }

    current.rows.push(row);
    current.visitorId ||= row.visitor_id;
    if (Date.parse(row.created_at) > Date.parse(current.lastSeenAt)) current.lastSeenAt = row.created_at;
    if (Date.parse(row.entered_at || row.created_at) < Date.parse(current.startedAt)) {
      current.startedAt = row.entered_at || row.created_at;
    }
    current.totalDurationMs += safeDuration(row);
  }

  for (const group of map.values()) {
    group.rows.sort(sortRowsByVisit);
  }

  return Array.from(map.values());
}

function classifySessions(sessions: SessionGroup[]) {
  const kindBySession = new Map<string, SessionLog["visitorKind"]>();
  const sessionsByVisitor = new Map<string, SessionGroup[]>();

  for (const session of sessions) {
    if (!session.visitorId) {
      kindBySession.set(session.sessionId, "세션 기준 과거 데이터");
      continue;
    }
    const list = sessionsByVisitor.get(session.visitorId) || [];
    list.push(session);
    sessionsByVisitor.set(session.visitorId, list);
  }

  for (const list of sessionsByVisitor.values()) {
    list.sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt));
    list.forEach((session, index) => {
      kindBySession.set(session.sessionId, index === 0 ? "신규 추정" : "재방문 추정");
    });
  }

  return kindBySession;
}

function buildPathParts(rows: AnalyticsEventRow[]) {
  const parts: string[] = [];
  for (const row of rows) {
    pushUniqueConsecutive(parts, row.page_path);
  }

  const lastRowWithExit = [...rows].reverse().find((row) => row.exited_to);
  if (lastRowWithExit?.exited_to === "(exit)") {
    pushUniqueConsecutive(parts, "사이트 이탈");
  } else if (lastRowWithExit?.exited_to) {
    pushUniqueConsecutive(parts, lastRowWithExit.exited_to);
  }

  return {
    pathParts: parts.slice(0, 6),
    hiddenPathCount: Math.max(0, parts.length - 6),
  };
}

function buildExitLocation(rows: AnalyticsEventRow[]) {
  const lastRowWithExit = [...rows].reverse().find((row) => row.exited_to);
  if (!lastRowWithExit) return "확인 중";
  return lastRowWithExit.exited_to === "(exit)" ? lastRowWithExit.page_path : labelExitTarget(lastRowWithExit.exited_to);
}

function buildDailyTrends(rows: AnalyticsEventRow[], sessions: SessionGroup[]) {
  const sessionDurationByDate = new Map<string, Map<string, number>>();
  const map = new Map<string, { visitors: Set<string>; sessions: Set<string>; fallbackUsed: boolean }>();

  for (const row of rows) {
    const key = dateKey(row.created_at);
    const current = map.get(key) || { visitors: new Set<string>(), sessions: new Set<string>(), fallbackUsed: false };
    current.visitors.add(visitorKey(row));
    current.sessions.add(row.session_id);
    current.fallbackUsed ||= !row.visitor_id;
    map.set(key, current);
  }

  for (const session of sessions) {
    const key = dateKey(session.startedAt);
    const current = sessionDurationByDate.get(key) || new Map<string, number>();
    current.set(session.sessionId, session.totalDurationMs);
    sessionDurationByDate.set(key, current);
  }

  return Array.from(map.entries())
    .map(([date, value]) => {
      const durations = Array.from(sessionDurationByDate.get(date)?.values() || []);
      const avgDurationMs = durations.length
        ? Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
        : 0;
      return {
        date,
        visitors: value.visitors.size,
        sessions: value.sessions.size,
        avgDurationMs,
        fallbackUsed: value.fallbackUsed,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildPageStats(rows: AnalyticsEventRow[]) {
  const map = new Map<
    string,
    {
      visitors: Set<string>;
      sessions: Set<string>;
      totalDurationMs: number;
      rowCount: number;
      completedCount: number;
      exitCount: number;
      destinations: Map<string, number>;
    }
  >();

  for (const row of rows) {
    const current = map.get(row.page_path) || {
      visitors: new Set<string>(),
      sessions: new Set<string>(),
      totalDurationMs: 0,
      rowCount: 0,
      completedCount: 0,
      exitCount: 0,
      destinations: new Map<string, number>(),
    };

    current.visitors.add(visitorKey(row));
    current.sessions.add(row.session_id);
    current.totalDurationMs += safeDuration(row);
    current.rowCount += 1;

    if (row.exited_to) {
      current.completedCount += 1;
      if (row.exited_to === "(exit)") current.exitCount += 1;
      const label = labelExitTarget(row.exited_to);
      current.destinations.set(label, (current.destinations.get(label) || 0) + 1);
    }

    map.set(row.page_path, current);
  }

  return Array.from(map.entries())
    .map(([pagePath, value]) => ({
      pagePath,
      visitors: value.visitors.size,
      sessions: value.sessions.size,
      // 페이지 방문 row 단위 평균입니다. 한 row 는 pageview 1회와 그 duration update 를 의미합니다.
      avgDurationMs: value.rowCount ? Math.round(value.totalDurationMs / value.rowCount) : 0,
      exitRate: value.completedCount ? value.exitCount / value.completedCount : 0,
      mainDestination: topEntry(value.destinations) || "확인 중",
    }))
    .sort((a, b) => b.visitors - a.visitors || b.sessions - a.sessions);
}

function buildExitPaths(rows: AnalyticsEventRow[]) {
  const map = new Map<string, { pagePath: string; exitedTo: string; totalDurationMs: number; count: number }>();

  for (const row of rows) {
    if (!row.exited_to) continue;
    const key = `${row.page_path}::${row.exited_to}`;
    const current = map.get(key) || { pagePath: row.page_path, exitedTo: row.exited_to, totalDurationMs: 0, count: 0 };
    current.totalDurationMs += safeDuration(row);
    current.count += 1;
    map.set(key, current);
  }

  return Array.from(map.values())
    .map((value) => ({
      pagePath: value.pagePath,
      exitedTo: labelExitTarget(value.exitedTo),
      count: value.count,
      avgDurationMs: value.count ? Math.round(value.totalDurationMs / value.count) : 0,
      interpretation: value.exitedTo === "(exit)" ? `${value.pagePath}에서 사이트 이탈` : `${value.exitedTo}로 이동`,
    }))
    .sort((a, b) => b.count - a.count || b.avgDurationMs - a.avgDurationMs);
}

function buildReferrers(rows: AnalyticsEventRow[]) {
  const map = new Map<string, { visitors: Set<string>; sessions: Set<string>; totalDurationMs: number; rowCount: number }>();

  for (const row of rows) {
    const label = formatReferrerLabel(row.referrer);
    const current = map.get(label) || {
      visitors: new Set<string>(),
      sessions: new Set<string>(),
      totalDurationMs: 0,
      rowCount: 0,
    };
    current.visitors.add(visitorKey(row));
    current.sessions.add(row.session_id);
    current.totalDurationMs += safeDuration(row);
    current.rowCount += 1;
    map.set(label, current);
  }

  return Array.from(map.entries())
    .map(([referrer, value]) => ({
      referrer,
      visitors: value.visitors.size,
      sessions: value.sessions.size,
      avgDurationMs: value.rowCount ? Math.round(value.totalDurationMs / value.rowCount) : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors || b.avgDurationMs - a.avgDurationMs);
}

function buildSessionLogs(sessions: SessionGroup[], kindBySession: Map<string, SessionLog["visitorKind"]>) {
  return sessions
    .map((session) => {
      const firstRow = session.rows[0];
      const { pathParts, hiddenPathCount } = buildPathParts(session.rows);
      return {
        sessionId: session.sessionId,
        visitorId: session.visitorId,
        startedAt: session.startedAt,
        visitorKind: kindBySession.get(session.sessionId) || "세션 기준 과거 데이터",
        totalDurationMs: session.totalDurationMs,
        pathParts,
        hiddenPathCount,
        exitLocation: buildExitLocation(session.rows),
        referrer: formatReferrerLabel(firstRow?.referrer || ""),
        deviceType: getCompactDeviceType(firstRow?.user_agent || ""),
      };
    })
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
}

function buildVisitorSummaries(sessions: SessionGroup[]) {
  const map = new Map<string, SessionGroup[]>();
  for (const session of sessions) {
    const key = session.visitorId || session.sessionId;
    const list = map.get(key) || [];
    list.push(session);
    map.set(key, list);
  }

  return Array.from(map.entries())
    .map(([key, list]) => {
      const sorted = [...list].sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt));
      const allRows = sorted.flatMap((session) => session.rows);
      const pageCounts = new Map<string, number>();
      const exitCounts = new Map<string, number>();
      const totalDurationMs = sorted.reduce((sum, session) => sum + session.totalDurationMs, 0);

      for (const row of allRows) {
        pageCounts.set(row.page_path, (pageCounts.get(row.page_path) || 0) + 1);
        if (row.exited_to) {
          const exitLocation = row.exited_to === "(exit)" ? row.page_path : labelExitTarget(row.exited_to);
          exitCounts.set(exitLocation, (exitCounts.get(exitLocation) || 0) + 1);
        }
      }

      return {
        visitorId: key,
        legacySessionOnly: !sorted[0]?.visitorId,
        firstSeenAt: sorted[0]?.startedAt || "",
        lastSeenAt: sorted[sorted.length - 1]?.lastSeenAt || "",
        sessionCount: sorted.length,
        totalDurationMs,
        avgDurationMs: sorted.length ? Math.round(totalDurationMs / sorted.length) : 0,
        topPage: topEntry(pageCounts) || "확인 중",
        topExitLocation: topEntry(exitCounts) || "확인 중",
        returning: Boolean(sorted[0]?.visitorId && sorted.length > 1),
      };
    })
    .sort((a, b) => Date.parse(b.lastSeenAt) - Date.parse(a.lastSeenAt));
}

function buildInsights(
  rows: AnalyticsEventRow[],
  pageStats: PageStat[],
  exitPaths: ExitPathStat[],
  avgSessionDurationMs: number,
) {
  if (rows.length < 3) return ["아직 충분한 데이터가 없어 경향을 판단하기 어렵습니다."];

  const insights: string[] = [];
  const longestPage = [...pageStats].sort((a, b) => b.avgDurationMs - a.avgDurationMs)[0];
  const topSiteExit = exitPaths.find((item) => item.exitedTo === "사이트 이탈");
  const homeMove = exitPaths.find((item) => item.pagePath === "/" && item.exitedTo !== "사이트 이탈");

  if (longestPage) insights.push(`최근 30일 동안 가장 체류 시간이 긴 페이지는 ${longestPage.pagePath}입니다.`);
  if (topSiteExit) insights.push(`가장 많은 사이트 이탈은 ${topSiteExit.pagePath} 페이지에서 발생했습니다.`);
  insights.push(`방문 세션은 평균적으로 ${formatDuration(avgSessionDurationMs)} 동안 사이트에 머뭅니다.`);
  if (homeMove) insights.push(`/ 페이지 방문자는 ${homeMove.exitedTo}로 가장 많이 이동했습니다.`);

  return insights.slice(0, 4);
}

export async function getAnalyticsDashboardData(days = 30): Promise<AnalyticsDashboardData> {
  const rows = await fetchRecentRows(days);
  const sessions = buildSessionGroups(rows);
  const kindBySession = classifySessions(sessions);
  const dailyTrends = buildDailyTrends(rows, sessions);
  const pageStats = buildPageStats(rows);
  const exitPaths = buildExitPaths(rows);
  const referrers = buildReferrers(rows);
  const sessionLogs = buildSessionLogs(sessions, kindBySession);
  const visitorSummaries = buildVisitorSummaries(sessions);
  const today = new Date().toISOString().slice(0, 10);
  const todayTrend = dailyTrends.find((trend) => trend.date === today);
  const avgSessionDurationMs = sessions.length
    ? Math.round(sessions.reduce((sum, session) => sum + session.totalDurationMs, 0) / sessions.length)
    : 0;
  const newSessionCount = sessionLogs.filter((session) => session.visitorKind === "신규 추정").length;
  const returningSessionCount = sessionLogs.filter((session) => session.visitorKind === "재방문 추정").length;

  return {
    todayVisitors: todayTrend?.visitors ?? 0,
    todaySessions: todayTrend?.sessions ?? 0,
    avgSessionDurationMs,
    activeDurationReady: false,
    topExitPath: exitPaths[0] || null,
    fallbackUsed: rows.some((row) => !row.visitor_id),
    newSessionCount,
    returningSessionCount,
    dailyTrends,
    pageStats,
    exitPaths,
    referrers,
    sessionLogs,
    visitorSummaries,
    insights: buildInsights(rows, pageStats, exitPaths, avgSessionDurationMs),
  };
}
