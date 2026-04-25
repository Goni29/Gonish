import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  formatDuration,
  formatNumber,
  formatPercent,
  maskAnalyticsId,
} from "@/lib/analyticsFormat";
import {
  getAnalyticsDashboardData,
  type AnalyticsDashboardData,
  type ExitPathStat,
  type PageStat,
  type ReferrerStat,
  type SessionLog,
  type VisitorSummary,
} from "@/lib/server/analyticsDashboard";
import { getAdminDashboardKey, isAdminAuthenticated } from "@/lib/server/adminAuth";
import AdminLogoutButton from "../leads/AdminLogoutButton";
import styles from "./page.module.css";

type MaybePromise<T> = Promise<T> | T;

type AdminDashboardPageProps = {
  searchParams?: MaybePromise<{
    pageSort?: string | string[];
    exitSort?: string | string[];
    refSort?: string | string[];
    sessionSort?: string | string[];
    visitorSort?: string | string[];
  }>;
};

type DashboardSummary = {
  totalLeads: number;
  todayLeads: number;
  totalContacts: number;
  todayContacts: number;
};

type DataColumn<T> = {
  label: string;
  align?: "left" | "right";
  sort?: {
    param: "pageSort" | "exitSort" | "refSort" | "sessionSort" | "visitorSort";
    value: string;
    active: boolean;
  };
  render: (row: T, index: number) => ReactNode;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Gonish Admin",
  description: "Gonish 관리자 대시보드",
};

const EMPTY_ANALYTICS: AnalyticsDashboardData = {
  todayVisitors: 0,
  todaySessions: 0,
  avgSessionDurationMs: 0,
  activeDurationReady: false,
  topExitPath: null,
  fallbackUsed: false,
  newSessionCount: 0,
  returningSessionCount: 0,
  dailyTrends: [],
  pageStats: [],
  exitPaths: [],
  referrers: [],
  sessionLogs: [],
  visitorSummaries: [],
  insights: ["아직 충분한 데이터가 없어 경향을 판단하기 어렵습니다."],
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

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSort(value: string | string[] | undefined, allowed: string[], fallback: string) {
  const current = firstParam(value);
  return current && allowed.includes(current) ? current : fallback;
}

function sortHref(param: string, value: string) {
  return `/admin/dashboard?${param}=${encodeURIComponent(value)}`;
}

function formatMetric(value: number, suffix: string) {
  return value > 0 ? `${formatNumber(value)}${suffix}` : "데이터 없음";
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "확인 중";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = d.toDateString() === today.toDateString();
  const yesterdayDay = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

  if (sameDay) return `오늘 ${time}`;
  if (yesterdayDay) return `어제 ${time}`;
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

function sortPageStats(rows: PageStat[], sort: string) {
  return [...rows].sort((a, b) => {
    if (sort === "sessions") return b.sessions - a.sessions;
    if (sort === "duration") return b.avgDurationMs - a.avgDurationMs;
    if (sort === "exitRate") return b.exitRate - a.exitRate;
    return b.visitors - a.visitors;
  });
}

function sortExitPaths(rows: ExitPathStat[], sort: string) {
  return [...rows].sort((a, b) => {
    if (sort === "duration") return b.avgDurationMs - a.avgDurationMs;
    return b.count - a.count;
  });
}

function sortReferrers(rows: ReferrerStat[], sort: string) {
  return [...rows].sort((a, b) => {
    if (sort === "sessions") return b.sessions - a.sessions;
    if (sort === "duration") return b.avgDurationMs - a.avgDurationMs;
    return b.visitors - a.visitors;
  });
}

function sortSessionLogs(rows: SessionLog[], sort: string) {
  return [...rows].sort((a, b) => {
    if (sort === "duration") return b.totalDurationMs - a.totalDurationMs;
    return Date.parse(b.startedAt) - Date.parse(a.startedAt);
  });
}

function sortVisitorSummaries(rows: VisitorSummary[], sort: string) {
  return [...rows].sort((a, b) => {
    if (sort === "sessions") return b.sessionCount - a.sessionCount;
    if (sort === "duration") return b.totalDurationMs - a.totalDurationMs;
    return Date.parse(b.lastSeenAt) - Date.parse(a.lastSeenAt);
  });
}

function MetricCard({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: ReactNode;
  helper: string;
  accent?: boolean;
}) {
  return (
    <article className={`${styles.metricCard} ${accent ? styles.metricCardAccent : ""}`}>
      <p className={styles.metricLabel}>{label}</p>
      <div className={styles.metricValue}>{value}</div>
      <p className={styles.metricHelper}>{helper}</p>
    </article>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className={styles.emptyState}>
      <strong>데이터 없음</strong>
      <span>{message}</span>
    </div>
  );
}

function SortLink({
  label,
  param,
  value,
  active,
}: {
  label: string;
  param: string;
  value: string;
  active: boolean;
}) {
  return (
    <Link className={`${styles.sortLink} ${active ? styles.sortLinkActive : ""}`} href={sortHref(param, value)}>
      {label}
    </Link>
  );
}

function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage,
}: {
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  emptyMessage: string;
}) {
  if (rows.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.label} className={column.align === "right" ? styles.alignRight : undefined}>
                {column.sort ? (
                  <SortLink
                    label={column.label}
                    param={String(column.sort.param)}
                    value={column.sort.value}
                    active={column.sort.active}
                  />
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)}>
              {columns.map((column) => (
                <td key={column.label} className={column.align === "right" ? styles.alignRight : undefined}>
                  {column.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({
  title,
  meta,
  helper,
  children,
}: {
  title: string;
  meta?: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {helper ? <p className={styles.sectionHelper}>{helper}</p> : null}
        </div>
        {meta ? <span className={styles.sectionMeta}>{meta}</span> : null}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function TrendBars({ trends }: { trends: AnalyticsDashboardData["dailyTrends"] }) {
  if (trends.length === 0) {
    return <EmptyState message="아직 수집된 방문 추이 데이터가 없습니다." />;
  }

  const maxVisitors = Math.max(1, ...trends.map((trend) => trend.visitors));
  const maxSessions = Math.max(1, ...trends.map((trend) => trend.sessions));

  return (
    <div className={styles.trendGrid}>
      {trends.slice(-30).map((trend) => (
        <div key={trend.date} className={styles.trendItem}>
          <div className={styles.trendBars}>
            <span
              className={styles.visitorBar}
              style={{ height: `${Math.max(4, (trend.visitors / maxVisitors) * 132)}px` }}
              title={`${trend.date}: 방문자 ${trend.visitors}명`}
            />
            <span
              className={styles.sessionBar}
              style={{ height: `${Math.max(4, (trend.sessions / maxSessions) * 132)}px` }}
              title={`${trend.date}: 세션 ${trend.sessions}회`}
            />
          </div>
          <span className={styles.trendLabel}>{formatShortDate(trend.date)}</span>
        </div>
      ))}
    </div>
  );
}

function PathFlow({ parts, hiddenCount }: { parts: string[]; hiddenCount: number }) {
  return (
    <div className={styles.pathFlow}>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className={part === "사이트 이탈" ? styles.exitText : undefined}>
          {index > 0 ? "→ " : ""}
          {part}
        </span>
      ))}
      {hiddenCount > 0 ? <span>외 {hiddenCount}개</span> : null}
    </div>
  );
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  if (!getAdminDashboardKey()) {
    redirect("/admin/login");
  }

  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login?next=/admin/dashboard");
  }

  const params = (await searchParams) || {};
  const pageSort = normalizeSort(params.pageSort, ["visitors", "sessions", "duration", "exitRate"], "visitors");
  const exitSort = normalizeSort(params.exitSort, ["count", "duration"], "count");
  const refSort = normalizeSort(params.refSort, ["visitors", "sessions", "duration"], "visitors");
  const sessionSort = normalizeSort(params.sessionSort, ["recent", "duration"], "recent");
  const visitorSort = normalizeSort(params.visitorSort, ["recent", "sessions", "duration"], "recent");

  const [summary, analytics] = await Promise.all([
    fetchDashboardSummary().catch(
      (): DashboardSummary => ({ totalLeads: 0, todayLeads: 0, totalContacts: 0, todayContacts: 0 }),
    ),
    getAnalyticsDashboardData(30).catch(() => EMPTY_ANALYTICS),
  ]);

  const pageRows = sortPageStats(analytics.pageStats, pageSort).slice(0, 10);
  const exitRows = sortExitPaths(analytics.exitPaths, exitSort).slice(0, 10);
  const referrerRows = sortReferrers(analytics.referrers, refSort).slice(0, 10);
  const sessionRows = sortSessionLogs(analytics.sessionLogs, sessionSort).slice(0, 12);
  const visitorRows = sortVisitorSummaries(analytics.visitorSummaries, visitorSort).slice(0, 10);
  const totalInquiries = summary.totalLeads + summary.totalContacts;
  const newInquiries = summary.todayLeads + summary.todayContacts;
  const returningTotal = analytics.newSessionCount + analytics.returningSessionCount;
  const returningRatio = returningTotal ? analytics.returningSessionCount / returningTotal : 0;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.toolbar}>
          <div className={styles.titleWrap}>
            <p className={styles.eyebrow}>Gonish admin</p>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.desc}>방문자, 세션, 문의 흐름을 집계 중심으로 확인합니다.</p>
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

        <div className={styles.notice}>
          이 화면의 방문자는 로그인 사용자가 아니라 브라우저 저장소의 익명 ID 기준입니다. 쿠키/저장소 삭제,
          다른 브라우저 또는 다른 기기 사용 시 다른 방문자로 집계될 수 있습니다.
        </div>

        <div className={styles.metricGrid}>
          <MetricCard
            label="오늘 방문자 수"
            value={formatMetric(analytics.todayVisitors, "명")}
            helper="오늘 방문한 익명 브라우저 기준"
            accent
          />
          <MetricCard
            label="오늘 세션 수"
            value={formatMetric(analytics.todaySessions, "회")}
            helper="새 탭 또는 30분 이후 재방문 포함"
          />
          <MetricCard
            label="평균 체류 시간"
            value={analytics.avgSessionDurationMs ? formatDuration(analytics.avgSessionDurationMs) : "데이터 없음"}
            helper="한 세션이 사이트에 머문 평균 시간"
          />
          <MetricCard
            label="평균 활성 체류 시간"
            value={analytics.activeDurationReady ? formatDuration(0) : "수집 준비 중"}
            helper="탭 활성 상태 기준 집계 예정"
          />
          <MetricCard
            label="주요 이탈 경로"
            value={analytics.topExitPath ? `${analytics.topExitPath.pagePath} → ${analytics.topExitPath.exitedTo}` : "데이터 없음"}
            helper="가장 자주 발생한 이동 또는 이탈"
          />
        </div>

        <div className={styles.insightRow}>
          <div className={styles.insightPanel}>
            <h2>짧은 해석</h2>
            <ul>
              {analytics.insights.map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          </div>
          <div className={styles.insightPanel}>
            <h2>문의 현황</h2>
            <p>
              전체 문의 {formatNumber(totalInquiries)}건, 오늘 신규 문의 {formatNumber(newInquiries)}건입니다.
            </p>
            <p>
              재방문 추정 세션 비율은 {formatPercent(returningRatio)}입니다.
            </p>
          </div>
        </div>

        {analytics.fallbackUsed ? (
          <div className={styles.fallbackNotice}>일부 과거 데이터는 세션 기준으로 계산됨</div>
        ) : null}

        <Section
          title="최근 30일 방문 추이"
          meta="방문자 / 세션"
          helper="분홍 막대는 방문자 수, 짙은 막대는 세션 수입니다."
        >
          <TrendBars trends={analytics.dailyTrends} />
        </Section>

        <Section
          title="페이지별 체류 시간"
          meta={`상위 ${pageRows.length}개`}
          helper="페이지 방문 1회 기준 평균 체류와 사이트 이탈 비율입니다."
        >
          <DataTable
            rows={pageRows}
            rowKey={(row) => row.pagePath}
            emptyMessage="아직 페이지별 체류 데이터가 없습니다."
            columns={[
              { label: "페이지", render: (row) => row.pagePath },
              {
                label: "방문자 수",
                align: "right",
                sort: { param: "pageSort", value: "visitors", active: pageSort === "visitors" },
                render: (row) => `${formatNumber(row.visitors)}명`,
              },
              {
                label: "세션 수",
                align: "right",
                sort: { param: "pageSort", value: "sessions", active: pageSort === "sessions" },
                render: (row) => `${formatNumber(row.sessions)}회`,
              },
              {
                label: "평균 체류",
                align: "right",
                sort: { param: "pageSort", value: "duration", active: pageSort === "duration" },
                render: (row) => formatDuration(row.avgDurationMs),
              },
              {
                label: "이탈률",
                align: "right",
                sort: { param: "pageSort", value: "exitRate", active: pageSort === "exitRate" },
                render: (row) => formatPercent(row.exitRate),
              },
              { label: "주요 이동/이탈", render: (row) => row.mainDestination },
            ]}
          />
        </Section>

        <Section title="이탈 경로 TOP 10" meta="최근 30일" helper="이전 페이지와 다음 이동 또는 사이트 이탈을 묶어 보여줍니다.">
          <DataTable
            rows={exitRows}
            rowKey={(row, index) => `${row.pagePath}-${row.exitedTo}-${index}`}
            emptyMessage="아직 이탈 경로 데이터가 없습니다."
            columns={[
              { label: "이전 페이지", render: (row) => row.pagePath },
              { label: "이동/이탈 위치", render: (row) => row.exitedTo },
              {
                label: "발생 횟수",
                align: "right",
                sort: { param: "exitSort", value: "count", active: exitSort === "count" },
                render: (row) => `${formatNumber(row.count)}회`,
              },
              {
                label: "평균 체류",
                align: "right",
                sort: { param: "exitSort", value: "duration", active: exitSort === "duration" },
                render: (row) => formatDuration(row.avgDurationMs),
              },
              { label: "해석", render: (row) => row.interpretation },
            ]}
          />
        </Section>

        <Section title="유입 경로별 체류 시간" meta={`상위 ${referrerRows.length}개`} helper="query string은 제거하고 출처 도메인과 경로만 요약합니다.">
          <DataTable
            rows={referrerRows}
            rowKey={(row) => row.referrer}
            emptyMessage="아직 유입 경로 데이터가 없습니다."
            columns={[
              { label: "유입", render: (row) => row.referrer },
              {
                label: "방문자 수",
                align: "right",
                sort: { param: "refSort", value: "visitors", active: refSort === "visitors" },
                render: (row) => `${formatNumber(row.visitors)}명`,
              },
              {
                label: "세션 수",
                align: "right",
                sort: { param: "refSort", value: "sessions", active: refSort === "sessions" },
                render: (row) => `${formatNumber(row.sessions)}회`,
              },
              {
                label: "평균 체류",
                align: "right",
                sort: { param: "refSort", value: "duration", active: refSort === "duration" },
                render: (row) => formatDuration(row.avgDurationMs),
              },
            ]}
          />
        </Section>

        <Section title="방문 세션 로그" meta={`최근 ${sessionRows.length}개`} helper="개인을 식별하지 않고 세션 단위 이동 흐름만 요약합니다.">
          <DataTable
            rows={sessionRows}
            rowKey={(row) => row.sessionId}
            emptyMessage="아직 방문 세션 로그가 없습니다."
            columns={[
              { label: "방문 시각", render: (row) => formatDateTime(row.startedAt) },
              { label: "구분", render: (row) => row.visitorKind },
              { label: "세션", render: (row) => maskAnalyticsId(row.sessionId, "세션") },
              {
                label: "체류 시간",
                align: "right",
                sort: { param: "sessionSort", value: "duration", active: sessionSort === "duration" },
                render: (row) => formatDuration(row.totalDurationMs),
              },
              { label: "이동 경로", render: (row) => <PathFlow parts={row.pathParts} hiddenCount={row.hiddenPathCount} /> },
              { label: "이탈 위치", render: (row) => row.exitLocation },
              { label: "유입", render: (row) => row.referrer },
              { label: "기기", render: (row) => row.deviceType },
            ]}
          />
        </Section>

        <Section title="익명 방문자 요약" meta={`최근 ${visitorRows.length}명`} helper="익명 방문자 원문 ID는 표시하지 않고 마스킹된 표시값만 사용합니다.">
          <DataTable
            rows={visitorRows}
            rowKey={(row) => row.visitorId}
            emptyMessage="아직 익명 방문자 요약 데이터가 없습니다."
            columns={[
              {
                label: "방문자",
                render: (row) => maskAnalyticsId(row.visitorId, row.legacySessionOnly ? "과거 세션" : "방문자"),
              },
              { label: "첫 방문", render: (row) => formatDateTime(row.firstSeenAt) },
              {
                label: "최근 방문",
                sort: { param: "visitorSort", value: "recent", active: visitorSort === "recent" },
                render: (row) => formatDateTime(row.lastSeenAt),
              },
              {
                label: "세션 수",
                align: "right",
                sort: { param: "visitorSort", value: "sessions", active: visitorSort === "sessions" },
                render: (row) => `${formatNumber(row.sessionCount)}회`,
              },
              {
                label: "총 체류",
                align: "right",
                sort: { param: "visitorSort", value: "duration", active: visitorSort === "duration" },
                render: (row) => formatDuration(row.totalDurationMs),
              },
              { label: "평균 체류", align: "right", render: (row) => formatDuration(row.avgDurationMs) },
              { label: "주요 방문 페이지", render: (row) => row.topPage },
              { label: "주요 이탈 위치", render: (row) => row.topExitLocation },
              { label: "재방문 여부", render: (row) => (row.returning ? "재방문 추정" : row.legacySessionOnly ? "과거 데이터" : "신규 추정") },
            ]}
          />
        </Section>

        <Section title="데이터 수집 상태 안내" helper="분석 목적과 보관 기준을 운영자가 빠르게 확인할 수 있게 정리했습니다.">
          <div className={styles.statusGrid}>
            <div>
              <strong>관리자 제외</strong>
              <span>관리자 세션 쿠키를 서버에서 검증한 뒤 집계에서 제외합니다.</span>
            </div>
            <div>
              <strong>개인정보 최소화</strong>
              <span>URL과 유입 경로의 query string은 저장하지 않고, 원본 IP는 분석 이벤트에 저장하지 않습니다.</span>
            </div>
            <div>
              <strong>브라우저 기준</strong>
              <span>익명 방문자 ID는 브라우저 저장소 기준이며 삭제 또는 기기 변경 시 새 방문자로 집계될 수 있습니다.</span>
            </div>
            <div>
              <strong>보관 권장</strong>
              <span>원본 이벤트 90일, 집계 데이터 12개월 보관을 권장합니다.</span>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
