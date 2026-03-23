import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ESTIMATE_LEAD_ARCHIVE_FILTER_LABELS,
  ESTIMATE_LEAD_ARCHIVE_FILTER_VALUES,
  ESTIMATE_LEAD_SORT_LABELS,
  ESTIMATE_LEAD_SORT_VALUES,
  ESTIMATE_PIPELINE_STATUS_LABELS,
  ESTIMATE_PIPELINE_STATUS_VALUES,
  isEstimatePipelineStatus,
  normalizeEstimateLeadArchiveFilter,
  normalizeEstimateLeadSort,
} from "@/lib/leadPipeline";
import { getAdminDashboardKey, isAdminAuthenticated } from "@/lib/server/adminAuth";
import { listEstimateLeads } from "@/lib/server/leadStore";
import AdminLogoutButton from "./AdminLogoutButton";
import LeadPipelineEditor from "./LeadPipelineEditor";
import styles from "./page.module.css";

type MaybePromise<T> = Promise<T> | T;

type AdminLeadsPageProps = {
  searchParams?: MaybePromise<{
    status?: string | string[];
    archived?: string | string[];
    sort?: string | string[];
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Leads | Gonish",
  description: "Gonish 견적 리드 운영 페이지",
};

function normalizeList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item && item !== "-");
}

function getFirstQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseStatusFilter(value: string | string[] | undefined) {
  const first = getFirstQueryValue(value);
  if (!first || first === "all") return "all";
  return isEstimatePipelineStatus(first) ? first : "all";
}

function parseArchiveFilter(value: string | string[] | undefined) {
  return normalizeEstimateLeadArchiveFilter(getFirstQueryValue(value));
}

function parseSort(value: string | string[] | undefined) {
  return normalizeEstimateLeadSort(getFirstQueryValue(value));
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("ko-KR");
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("ko-KR");
}

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  if (!getAdminDashboardKey()) {
    redirect("/admin/login");
  }

  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login?next=/admin/leads");
  }

  const resolvedSearchParams = (await searchParams) || {};
  const statusFilter = parseStatusFilter(resolvedSearchParams.status);
  const archiveFilter = parseArchiveFilter(resolvedSearchParams.archived);
  const sort = parseSort(resolvedSearchParams.sort);

  let leads = [] as Awaited<ReturnType<typeof listEstimateLeads>>;
  let loadError = "";

  try {
    leads = await listEstimateLeads({
      limit: 200,
      status: statusFilter,
      archived: archiveFilter,
      sort,
    });
  } catch (error) {
    loadError = error instanceof Error ? error.message : "리드 조회 중 오류가 발생했습니다.";
  }

  const activeCount = leads.filter((lead) => !lead.archived).length;
  const archivedCount = leads.filter((lead) => lead.archived).length;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.toolbar}>
          <div className={styles.titleWrap}>
            <p className={styles.eyebrow}>Gonish admin</p>
            <h1 className={styles.title}>견적 리드 운영</h1>
            <p className={styles.desc}>상태, 담당자, 다음 액션일, 내부 메모를 기준으로 견적 리드를 운영하세요.</p>
          </div>
          <div className={styles.actions}>
            <Link href="/admin/dashboard" className={`${styles.button} ${styles.buttonSecondary}`}>
              Dashboard
            </Link>
            <Link href="/admin/contacts" className={`${styles.button} ${styles.buttonSecondary}`}>
              Contact 문의
            </Link>
            <Link href="/estimate" className={`${styles.button} ${styles.buttonSecondary}`}>
              견적 페이지
            </Link>
            <AdminLogoutButton />
          </div>
        </header>

        <section className={styles.card}>
          <div className={styles.meta}>
            <span>총 {leads.length}건</span>
            <span>운영중 {activeCount}건</span>
            <span>아카이브 {archivedCount}건</span>
          </div>

          <form className={styles.filters} method="get">
            <label className={styles.filterField}>
              <span>상태</span>
              <select name="status" defaultValue={statusFilter} className={styles.filterInput}>
                <option value="all">전체</option>
                {ESTIMATE_PIPELINE_STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {ESTIMATE_PIPELINE_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField}>
              <span>아카이브</span>
              <select name="archived" defaultValue={archiveFilter} className={styles.filterInput}>
                {ESTIMATE_LEAD_ARCHIVE_FILTER_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {ESTIMATE_LEAD_ARCHIVE_FILTER_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField}>
              <span>정렬</span>
              <select name="sort" defaultValue={sort} className={styles.filterInput}>
                {ESTIMATE_LEAD_SORT_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {ESTIMATE_LEAD_SORT_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className={styles.filterButton}>
              적용
            </button>
            <Link href="/admin/leads" className={`${styles.filterButton} ${styles.filterButtonSecondary}`}>
              초기화
            </Link>
          </form>

          {loadError ? <p className={styles.empty}>리드를 불러오지 못했습니다. {loadError}</p> : null}

          {!loadError && leads.length === 0 ? (
            <p className={styles.empty}>조건에 맞는 견적 리드가 없습니다.</p>
          ) : !loadError ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>접수일</th>
                    <th>고객</th>
                    <th>연락처</th>
                    <th>프로젝트</th>
                    <th>예상금액</th>
                    <th>상세</th>
                    <th>운영</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const contractPath = `/admin/contracts/${lead.id}?key=${encodeURIComponent(lead.viewKey)}`;
                    const featureLabels = normalizeList(lead.contractDraft.featureLabels);
                    const discountLabels =
                      normalizeList(lead.contractDraft.discountLabels).length > 0
                        ? normalizeList(lead.contractDraft.discountLabels)
                        : parseCommaList(lead.emailData.discounts);

                    return (
                      <tr key={lead.id}>
                        <td>
                          <div>{new Date(lead.createdAt).toLocaleDateString("ko-KR")}</div>
                          <div className={styles.muted}>{new Date(lead.createdAt).toLocaleTimeString("ko-KR")}</div>
                        </td>
                        <td>
                          <div className={styles.rowTitle}>{lead.emailData.brand || lead.emailData.name || "미정"}</div>
                          <div className={styles.muted}>{lead.contractDraft.clientName || "-"}</div>
                        </td>
                        <td>{lead.emailData.reply || "-"}</td>
                        <td>
                          <div>{lead.emailData.projectType || "-"}</div>
                          <div className={styles.muted}>{lead.emailData.pageScope || "-"}</div>
                        </td>
                        <td>
                          <span className={styles.pill}>{lead.emailData.basePrice || "-"}</span>
                          <div className={styles.muted}>{lead.emailData.priceRange || "-"}</div>
                        </td>
                        <td>
                          <details className={styles.details}>
                            <summary className={styles.detailsSummary}>선택 내역 보기</summary>
                            <div className={styles.detailsBody}>
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>자료 준비</span>
                                <span>{lead.emailData.readiness || "-"}</span>
                              </div>
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>희망 일정</span>
                                <span>{lead.emailData.schedule || "-"}</span>
                              </div>
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>도메인/호스팅</span>
                                <span>{lead.emailData.domainHosting || "-"}</span>
                              </div>
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>기능 선택</span>
                                {featureLabels.length > 0 ? (
                                  <div className={styles.tagWrap}>
                                    {featureLabels.map((label) => (
                                      <span key={`${lead.id}-feature-${label}`} className={styles.tag}>
                                        {label}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span>-</span>
                                )}
                              </div>
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>혜택 선택</span>
                                {discountLabels.length > 0 ? (
                                  <div className={styles.tagWrap}>
                                    {discountLabels.map((label) => (
                                      <span key={`${lead.id}-discount-${label}`} className={styles.tagMuted}>
                                        {label}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span>-</span>
                                )}
                              </div>
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>프로젝트 목표</span>
                                <p className={styles.multiline}>{lead.emailData.goal || "-"}</p>
                              </div>
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>고객 메모</span>
                                <p className={styles.multiline}>{lead.emailData.note || "-"}</p>
                              </div>
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>계약 일정</span>
                                <span>{lead.contractDraft.timeline || "-"}</span>
                              </div>
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>수정 정책</span>
                                <p className={styles.multiline}>{lead.contractDraft.revisionPolicy || "-"}</p>
                              </div>
                            </div>
                          </details>
                        </td>
                        <td>
                          <div className={styles.pipelineMeta}>
                            <span className={styles.pipelineStatus}>{ESTIMATE_PIPELINE_STATUS_LABELS[lead.pipelineStatus]}</span>
                            <span>다음 액션: {formatDate(lead.nextActionAt)}</span>
                            <span>마지막 연락: {formatDate(lead.lastContactedAt)}</span>
                            <span>업데이트: {formatDateTime(lead.updatedAt)}</span>
                          </div>
                          <LeadPipelineEditor
                            leadId={lead.id}
                            initialStatus={lead.pipelineStatus}
                            initialAssignedTo={lead.assignedTo}
                            initialNextActionAt={lead.nextActionAt}
                            initialLastContactedAt={lead.lastContactedAt}
                            initialInternalNote={lead.internalNote}
                            initialCloseReason={lead.closeReason}
                            initialArchived={lead.archived}
                          />
                        </td>
                        <td>
                          <Link href={contractPath} className={styles.link}>
                            계약서 초안 열기
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
