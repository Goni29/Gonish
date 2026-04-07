import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminDashboardKey, isAdminAuthenticated } from "@/lib/server/adminAuth";
import AdminLogoutButton from "../leads/AdminLogoutButton";
import styles from "./page.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Gonish Admin",
  description: "Gonish 관리자 대시보드",
};

// ============================================================
// Supabase RPC 호출 헬퍼
// ============================================================

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

type DashboardSummary = {
  totalLeads: number;
  todayLeads: number;
  totalContacts: number;
  todayContacts: number;
};

type AnalyticsSummary = {
  dailyUsers: Array<{ date: string; count: number }>;
  avgDurations: Array<{ date: string; avgMs: number }>;
};

type ExitPath = {
  pagePath: string;
  exitedTo: string;
  avgDurationMs: number;
  count: number;
};

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/rest/v1/rpc/get_dashboard_summary`, {
    method: "POST",
    headers: supabaseHeaders(config.serviceRoleKey),
    body: JSON.stringify({}),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("get_dashboard_summary failed");
  return response.json() as Promise<DashboardSummary>;
}

async function fetchAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/rest/v1/rpc/get_analytics_summary`, {
    method: "POST",
    headers: supabaseHeaders(config.serviceRoleKey),
    body: JSON.stringify({ p_days: days }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("get_analytics_summary failed");
  return response.json() as Promise<AnalyticsSummary>;
}

async function fetchExitPaths(days = 30): Promise<ExitPath[]> {
  const config = getSupabaseConfig();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const query = new URLSearchParams({
    select: "page_path,exited_to,duration_ms,created_at",
    created_at: `gte.${since.toISOString()}`,
    exited_to: "neq.",
    limit: "5000",
  });

  const response = await fetch(
    `${config.url}/rest/v1/analytics_events?${query.toString()}`,
    {
      method: "GET",
      headers: supabaseHeaders(config.serviceRoleKey),
      cache: "no-store",
    },
  );
  if (!response.ok) return [];

  const rows = (await response.json()) as Array<{
    page_path: string;
    exited_to: string;
    duration_ms: number;
  }>;
  if (!Array.isArray(rows)) return [];

  const keyMap = new Map<string, { totalDuration: number; count: number }>();
  for (const row of rows) {
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

// ============================================================
// 유틸리티
// ============================================================

function formatDuration(ms: number) {
  if (ms < 1000) return "0초";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}초`;
  return `${minutes}분 ${seconds}초`;
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().slice(0, 10);
}

// ============================================================
// 페이지
// ============================================================

export default async function AdminDashboardPage() {
  if (!getAdminDashboardKey()) {
    redirect("/admin/login");
  }

  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login?next=/admin/dashboard");
  }

  // RPC 로 집계 데이터만 수신 — 개별 row 전체를 가져오지 않습니다
  const [summary, analytics, exitPaths] = await Promise.all([
    fetchDashboardSummary().catch(
      (): DashboardSummary => ({ totalLeads: 0, todayLeads: 0, totalContacts: 0, todayContacts: 0 }),
    ),
    fetchAnalyticsSummary(30).catch(
      (): AnalyticsSummary => ({ dailyUsers: [], avgDurations: [] }),
    ),
    fetchExitPaths(30).catch((): ExitPath[] => []),
  ]);

  const totalInquiries = summary.totalLeads + summary.totalContacts;
  const newInquiries = summary.todayLeads + summary.todayContacts;

  const last14Users = analytics.dailyUsers.slice(-14);
  const last14Durations = analytics.avgDurations.slice(-14);
  const topExitPaths = exitPaths.slice(0, 15);

  const maxDailyCount = Math.max(1, ...last14Users.map((d) => d.count));
  const maxAvgMs = Math.max(1, ...last14Durations.map((d) => d.avgMs));
  const maxExitCount = Math.max(1, ...topExitPaths.map((e) => e.count));

  // 오늘 analytics (dailyUsers 중 오늘 항목)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEntry = analytics.dailyUsers.find((d) => d.date === todayStr);
  const todayUsers = todayEntry?.count ?? 0;
  const todayDurationEntry = analytics.avgDurations.find((d) => d.date === todayStr);
  const todayAvgDuration = todayDurationEntry?.avgMs ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* Header */}
        <header className={styles.toolbar}>
          <div className={styles.titleWrap}>
            <p className={styles.eyebrow}>Gonish admin</p>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.desc}>사이트 접속 현황과 문의 데이터를 한눈에 확인합니다.</p>
          </div>
          <div className={styles.actions}>
            <Link href="/admin/leads" className={`${styles.button} ${styles.buttonSecondary}`}>
              Estimate 리드
            </Link>
            <Link href="/admin/contacts" className={`${styles.button} ${styles.buttonSecondary}`}>
              Contact 문의
            </Link>
            <AdminLogoutButton />
          </div>
        </header>

        {/* KPI Summary */}
        <div className={styles.kpiRow}>
          <div className={styles.kpi}>
            <p className={styles.kpiLabel}>오늘 접속 유저</p>
            <p className={styles.kpiValue}>
              {todayUsers}
              <span className={styles.kpiUnit}>명</span>
            </p>
          </div>
          <div className={styles.kpi}>
            <p className={styles.kpiLabel}>오늘 평균 체류</p>
            <p className={styles.kpiValue}>
              {formatDuration(todayAvgDuration)}
            </p>
          </div>
          <div className={styles.kpi}>
            <p className={styles.kpiLabel}>총 문의</p>
            <p className={styles.kpiValue}>
              {totalInquiries}
              <span className={styles.kpiUnit}>건</span>
            </p>
          </div>
          <div className={styles.kpi}>
            <p className={styles.kpiLabel}>오늘 신규 문의</p>
            <p className={`${styles.kpiValue} ${newInquiries > 0 ? styles.kpiAccent : ""}`}>
              {newInquiries}
              <span className={styles.kpiUnit}>건</span>
            </p>
          </div>
        </div>

        {/* 1. 일일 접속 유저수 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>일일 접속 유저수</h2>
            <span className={styles.sectionMeta}>최근 14일</span>
          </div>
          <div className={styles.sectionBody}>
            {last14Users.length === 0 ? (
              <p className={styles.empty}>아직 수집된 접속 데이터가 없습니다.</p>
            ) : (
              <div className={styles.chartWrap}>
                {last14Users.map((d) => (
                  <div key={d.date} className={styles.barGroup}>
                    <div
                      className={styles.bar}
                      style={{
                        height: `${Math.max(2, (d.count / maxDailyCount) * 140)}px`,
                        opacity: isToday(d.date) ? 1 : 0.7,
                      }}
                      title={`${d.date}: ${d.count}명`}
                    />
                    <span className={styles.barLabel}>{formatShortDate(d.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. 유저 체류 시간 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>평균 체류 시간</h2>
            <span className={styles.sectionMeta}>최근 14일</span>
          </div>
          <div className={styles.sectionBody}>
            {last14Durations.length === 0 ? (
              <p className={styles.empty}>아직 수집된 체류 시간 데이터가 없습니다.</p>
            ) : (
              <div className={styles.chartWrap}>
                {last14Durations.map((d) => (
                  <div key={d.date} className={styles.barGroup}>
                    <div
                      className={styles.bar}
                      style={{
                        height: `${Math.max(2, (d.avgMs / maxAvgMs) * 140)}px`,
                        opacity: isToday(d.date) ? 1 : 0.7,
                      }}
                      title={`${d.date}: ${formatDuration(d.avgMs)}`}
                    />
                    <span className={styles.barLabel}>{formatShortDate(d.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. 이탈 경로 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>체류 시간 대비 이탈 경로</h2>
            <span className={styles.sectionMeta}>최근 30일 · 상위 {topExitPaths.length}건</span>
          </div>
          {topExitPaths.length === 0 ? (
            <p className={styles.empty}>아직 수집된 이탈 경로 데이터가 없습니다.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>페이지</th>
                    <th>이탈 경로</th>
                    <th>평균 체류</th>
                    <th>횟수</th>
                  </tr>
                </thead>
                <tbody>
                  {topExitPaths.map((ep, i) => (
                    <tr key={i}>
                      <td>{ep.pagePath}</td>
                      <td>
                        <span className={styles.badge}>
                          {ep.exitedTo === "(exit)" ? "사이트 이탈" : ep.exitedTo}
                        </span>
                      </td>
                      <td>{formatDuration(ep.avgDurationMs)}</td>
                      <td>
                        <span
                          className={styles.exitBar}
                          style={{ width: `${Math.max(4, (ep.count / maxExitCount) * 80)}px` }}
                        />
                        {ep.count}회
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4 & 5. 문의 현황 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>문의 현황</h2>
            <span className={styles.sectionMeta}>전체 {totalInquiries}건 · 오늘 {newInquiries}건</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>구분</th>
                  <th>총 문의</th>
                  <th>오늘 신규</th>
                  <th>바로가기</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Estimate 견적 문의</td>
                  <td>{summary.totalLeads}건</td>
                  <td>
                    <span className={summary.todayLeads > 0 ? styles.kpiAccent : ""}>
                      {summary.todayLeads}건
                    </span>
                  </td>
                  <td>
                    <Link href="/admin/leads" className={styles.badge}>리드 운영 →</Link>
                  </td>
                </tr>
                <tr>
                  <td>Contact 일반 문의</td>
                  <td>{summary.totalContacts}건</td>
                  <td>
                    <span className={summary.todayContacts > 0 ? styles.kpiAccent : ""}>
                      {summary.todayContacts}건
                    </span>
                  </td>
                  <td>
                    <Link href="/admin/contacts" className={styles.badge}>문의 관리 →</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
