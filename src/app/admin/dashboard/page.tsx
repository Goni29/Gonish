import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminDashboardKey, isAdminAuthenticated } from "@/lib/server/adminAuth";
import {
  getDailyUserCounts,
  getAvgSessionDurations,
  getExitPaths,
  getTodayUserCount,
  getTodayAvgDuration,
} from "@/lib/server/analyticsStore";
import { listEstimateLeads } from "@/lib/server/leadStore";
import { listContactInquiries } from "@/lib/server/contactStore";
import AdminLogoutButton from "../leads/AdminLogoutButton";
import styles from "./page.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Gonish Admin",
  description: "Gonish 관리자 대시보드",
};

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

export default async function AdminDashboardPage() {
  if (!getAdminDashboardKey()) {
    redirect("/admin/login");
  }

  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login?next=/admin/dashboard");
  }

  // Fetch all data in parallel
  const [
    dailyUsers,
    avgDurations,
    exitPaths,
    todayUsers,
    todayAvgDuration,
    allLeads,
    allContacts,
  ] = await Promise.all([
    getDailyUserCounts(30).catch(() => []),
    getAvgSessionDurations(30).catch(() => []),
    getExitPaths(30).catch(() => []),
    getTodayUserCount().catch(() => 0),
    getTodayAvgDuration().catch(() => 0),
    listEstimateLeads({ limit: 500, status: "all", archived: "all", sort: "created_desc" }).catch(() => []),
    listContactInquiries(500).catch(() => []),
  ]);

  // Inquiry counts
  const today = new Date().toISOString().slice(0, 10);
  const totalInquiries = allLeads.length + allContacts.length;

  const newEstimateCount = allLeads.filter((l) => l.createdAt.slice(0, 10) === today).length;
  const newContactCount = allContacts.filter((c) => c.createdAt.slice(0, 10) === today).length;
  const newInquiries = newEstimateCount + newContactCount;

  // Chart data
  const maxDailyCount = Math.max(1, ...dailyUsers.map((d) => d.count));
  const maxAvgMs = Math.max(1, ...avgDurations.map((d) => d.avgMs));
  const maxExitCount = Math.max(1, ...exitPaths.map((e) => e.count));

  const last14Users = dailyUsers.slice(-14);
  const last14Durations = avgDurations.slice(-14);
  const topExitPaths = exitPaths.slice(0, 15);

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
                  <td>{allLeads.length}건</td>
                  <td>
                    <span className={newEstimateCount > 0 ? styles.kpiAccent : ""}>
                      {newEstimateCount}건
                    </span>
                  </td>
                  <td>
                    <Link href="/admin/leads" className={styles.badge}>리드 운영 →</Link>
                  </td>
                </tr>
                <tr>
                  <td>Contact 일반 문의</td>
                  <td>{allContacts.length}건</td>
                  <td>
                    <span className={newContactCount > 0 ? styles.kpiAccent : ""}>
                      {newContactCount}건
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
