const SUPABASE_ANALYTICS_TABLE = process.env.SUPABASE_ANALYTICS_TABLE || "analytics_events";

type AnalyticsEventRow = {
  id: string;
  session_id: string;
  page_path: string;
  referrer: string;
  entered_at: string;
  duration_ms: number;
  exited_to: string;
  user_agent: string;
  created_at: string;
};

export type InsertAnalyticsEvent = {
  sessionId: string;
  pagePath: string;
  referrer?: string;
  enteredAt?: string;
  durationMs?: number;
  exitedTo?: string;
  userAgent?: string;
};

export type DailyUserCount = { date: string; count: number };
export type AvgDuration = { date: string; avgMs: number };
export type ExitPath = { pagePath: string; exitedTo: string; avgDurationMs: number; count: number };

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }
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

export async function insertAnalyticsEvent(event: InsertAnalyticsEvent) {
  const config = getSupabaseConfig();

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_ANALYTICS_TABLE}`, {
    method: "POST",
    headers: { ...supabaseHeaders(config.serviceRoleKey), Prefer: "return=minimal" },
    body: JSON.stringify([
      {
        session_id: event.sessionId,
        page_path: event.pagePath,
        referrer: event.referrer || "",
        entered_at: event.enteredAt || new Date().toISOString(),
        duration_ms: event.durationMs ?? 0,
        exited_to: event.exitedTo || "",
        user_agent: event.userAgent || "",
        created_at: new Date().toISOString(),
      },
    ]),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Analytics insert failed: ${response.status} ${errorText}`);
  }
}

export async function updateAnalyticsEventDuration(sessionId: string, pagePath: string, durationMs: number, exitedTo: string) {
  const config = getSupabaseConfig();

  const latestRowQuery = new URLSearchParams({
    select: "id",
    session_id: `eq.${sessionId}`,
    page_path: `eq.${pagePath}`,
    order: "created_at.desc",
    limit: "1",
  });

  const latestRowResponse = await fetch(`${config.url}/rest/v1/${SUPABASE_ANALYTICS_TABLE}?${latestRowQuery.toString()}`, {
    method: "GET",
    headers: supabaseHeaders(config.serviceRoleKey),
    cache: "no-store",
  });

  if (!latestRowResponse.ok) {
    const errorText = await latestRowResponse.text();
    throw new Error(`Analytics latest-row fetch failed: ${latestRowResponse.status} ${errorText}`);
  }

  const latestRows = (await latestRowResponse.json()) as Array<{ id: string }>;
  const latestId = Array.isArray(latestRows) ? latestRows[0]?.id : null;

  if (!latestId) {
    return;
  }

  const query = new URLSearchParams({
    id: `eq.${latestId}`,
  });

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_ANALYTICS_TABLE}?${query.toString()}`, {
    method: "PATCH",
    headers: { ...supabaseHeaders(config.serviceRoleKey), Prefer: "return=minimal" },
    body: JSON.stringify({
      duration_ms: durationMs,
      exited_to: exitedTo,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Analytics update failed: ${response.status} ${errorText}`);
  }
}

/** Fetch all analytics rows for the last N days */
async function fetchRecentEvents(days: number): Promise<AnalyticsEventRow[]> {
  const config = getSupabaseConfig();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const query = new URLSearchParams({
    select: "id,session_id,page_path,referrer,entered_at,duration_ms,exited_to,user_agent,created_at",
    created_at: `gte.${since.toISOString()}`,
    order: "created_at.desc",
    limit: "5000",
  });

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_ANALYTICS_TABLE}?${query.toString()}`, {
    method: "GET",
    headers: supabaseHeaders(config.serviceRoleKey),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Analytics fetch failed: ${response.status} ${errorText}`);
  }

  const rows = (await response.json()) as AnalyticsEventRow[];
  return Array.isArray(rows) ? rows : [];
}

/** 일일 접속 유저수 (unique sessions per day) for last N days */
export async function getDailyUserCounts(days = 30): Promise<DailyUserCount[]> {
  const rows = await fetchRecentEvents(days);

  const dateMap = new Map<string, Set<string>>();
  for (const row of rows) {
    const date = row.created_at.slice(0, 10);
    if (!dateMap.has(date)) dateMap.set(date, new Set());
    dateMap.get(date)!.add(row.session_id);
  }

  const result: DailyUserCount[] = [];
  for (const [date, sessions] of dateMap) {
    result.push({ date, count: sessions.size });
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

/** 유저 체류 시간 (average session duration per day) */
export async function getAvgSessionDurations(days = 30): Promise<AvgDuration[]> {
  const rows = await fetchRecentEvents(days);

  const dateMap = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const date = row.created_at.slice(0, 10);
    if (!dateMap.has(date)) dateMap.set(date, new Map());
    const sessionMap = dateMap.get(date)!;
    const current = sessionMap.get(row.session_id) || 0;
    sessionMap.set(row.session_id, current + (row.duration_ms || 0));
  }

  const result: AvgDuration[] = [];
  for (const [date, sessionMap] of dateMap) {
    const durations = Array.from(sessionMap.values());
    const avg = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    result.push({ date, avgMs: avg });
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

/** 유저 체류 시간 대비 이탈 경로 */
export async function getExitPaths(days = 30): Promise<ExitPath[]> {
  const rows = await fetchRecentEvents(days);

  const keyMap = new Map<string, { totalDuration: number; count: number }>();
  for (const row of rows) {
    if (!row.exited_to) continue;
    const key = `${row.page_path}::${row.exited_to}`;
    const entry = keyMap.get(key) || { totalDuration: 0, count: 0 };
    entry.totalDuration += row.duration_ms || 0;
    entry.count += 1;
    keyMap.set(key, entry);
  }

  const result: ExitPath[] = [];
  for (const [key, value] of keyMap) {
    const [pagePath, exitedTo] = key.split("::");
    result.push({
      pagePath,
      exitedTo,
      avgDurationMs: value.count > 0 ? Math.round(value.totalDuration / value.count) : 0,
      count: value.count,
    });
  }

  return result.sort((a, b) => b.count - a.count);
}

/** 오늘 접속 유저수 */
export async function getTodayUserCount(): Promise<number> {
  const rows = await fetchRecentEvents(1);
  const today = new Date().toISOString().slice(0, 10);
  const sessions = new Set<string>();
  for (const row of rows) {
    if (row.created_at.slice(0, 10) === today) {
      sessions.add(row.session_id);
    }
  }
  return sessions.size;
}

/** 오늘 평균 체류 시간 (ms) */
export async function getTodayAvgDuration(): Promise<number> {
  const rows = await fetchRecentEvents(1);
  const today = new Date().toISOString().slice(0, 10);
  const sessionDurations = new Map<string, number>();
  for (const row of rows) {
    if (row.created_at.slice(0, 10) !== today) continue;
    const current = sessionDurations.get(row.session_id) || 0;
    sessionDurations.set(row.session_id, current + (row.duration_ms || 0));
  }
  const durations = Array.from(sessionDurations.values());
  if (durations.length === 0) return 0;
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
}
