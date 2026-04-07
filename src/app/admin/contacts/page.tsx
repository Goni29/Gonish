import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import InquiryReplyComposer from "@/components/admin/InquiryReplyComposer";
import { buildContactReplyDraft } from "@/lib/adminReply";
import { getAdminDashboardKey, isAdminAuthenticated } from "@/lib/server/adminAuth";
import { listContactInquiries } from "@/lib/server/contactStore";
import AdminLogoutButton from "./AdminLogoutButton";
import styles from "./page.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Contacts | Gonish",
  description: "Gonish Contact 문의 운영 페이지",
};

function formatDateTime(value: string | null) {
  if (!value) return "아직 발송 이력이 없습니다.";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "아직 발송 이력이 없습니다.";
  return parsed.toLocaleString("ko-KR");
}

export default async function AdminContactsPage() {
  if (!getAdminDashboardKey()) {
    redirect("/admin/login");
  }

  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login?next=/admin/contacts");
  }

  let inquiries = [] as Awaited<ReturnType<typeof listContactInquiries>>;
  let loadError = "";

  try {
    inquiries = await listContactInquiries(200);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "문의 조회 중 오류가 발생했습니다.";
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.toolbar}>
          <div className={styles.titleWrap}>
            <p className={styles.eyebrow}>Gonish admin</p>
            <h1 className={styles.title}>Contact 문의 운영</h1>
            <p className={styles.desc}>Contact 페이지에서 들어온 상담 문의를 확인하고 바로 답변 메일을 발송할 수 있습니다.</p>
          </div>
          <div className={styles.actions}>
            <Link href="/admin/dashboard" className={`${styles.button} ${styles.buttonSecondary}`}>
              Dashboard
            </Link>
            <Link href="/admin/leads" className={`${styles.button} ${styles.buttonSecondary}`}>
              Estimate 리드
            </Link>
            <Link href="/contact" className={`${styles.button} ${styles.buttonSecondary}`}>
              Contact 페이지
            </Link>
            <AdminLogoutButton />
          </div>
        </header>

        <section className={styles.card}>
          <div className={styles.meta}>
            <span>총 {inquiries.length}건</span>
            <span>최신 순 정렬</span>
          </div>

          {loadError ? <p className={styles.empty}>문의를 불러오지 못했습니다. {loadError}</p> : null}

          {!loadError && inquiries.length === 0 ? (
            <p className={styles.empty}>아직 저장된 Contact 문의가 없습니다.</p>
          ) : !loadError ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>접수일</th>
                    <th>이름 / 브랜드</th>
                    <th>연락처</th>
                    <th>프로젝트</th>
                    <th>무드</th>
                    <th>메시지</th>
                    <th>답변 메일</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => {
                    const replyDraft = buildContactReplyDraft(inquiry);

                    return (
                      <tr key={inquiry.id}>
                        <td>
                          <div>{new Date(inquiry.createdAt).toLocaleDateString("ko-KR")}</div>
                          <div className={styles.muted}>{new Date(inquiry.createdAt).toLocaleTimeString("ko-KR")}</div>
                        </td>
                        <td>
                          <div className={styles.rowTitle}>{inquiry.form.name || "-"}</div>
                        </td>
                        <td>{inquiry.form.reply || "-"}</td>
                        <td>
                          <div>{inquiry.form.project || "-"}</div>
                        </td>
                        <td>{inquiry.form.tone || "-"}</td>
                        <td>
                          <p className={styles.multiline}>{inquiry.form.message || "-"}</p>
                          <div className={styles.muted}>최근 답변: {formatDateTime(inquiry.lastRepliedAt)}</div>
                          {inquiry.lastReplySubject ? <div className={styles.muted}>{inquiry.lastReplySubject}</div> : null}
                        </td>
                        <td>
                          <InquiryReplyComposer
                            inquiryId={inquiry.id}
                            kind="contact"
                            replyContact={inquiry.form.reply}
                            initialRecipientEmail={replyDraft.recipientEmail}
                            initialSubject={replyDraft.subject}
                            initialMessage={replyDraft.message}
                            lastSentAt={inquiry.lastRepliedAt}
                            lastSentSubject={inquiry.lastReplySubject}
                          />
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
