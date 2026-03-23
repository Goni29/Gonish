import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { EstimateContractDraft } from "@/lib/inquiry";
import { getEstimateLeadForView } from "@/lib/server/leadStore";
import PrintButton from "./PrintButton";
import styles from "./page.module.css";

type MaybePromise<T> = Promise<T> | T;

type ContractPageProps = {
  params: MaybePromise<{ leadId: string }>;
  searchParams: MaybePromise<{ key?: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contract Draft | Gonish",
  description: "자동 입력된 계약서 초안",
};

function EditableText({ value, className }: { value: string; className?: string }) {
  return (
    <div contentEditable suppressContentEditableWarning className={className}>
      {value}
    </div>
  );
}

function EditableList({ items }: { items: string[] }) {
  return (
    <ul contentEditable suppressContentEditableWarning className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function draftToSections(draft: EstimateContractDraft) {
  const normalizedDiscountLabels = draft.discountLabels.map((label) => label.trim()).filter(Boolean);
  const consentSource = `${normalizedDiscountLabels.join(" ")} ${draft.contractExtra || ""}`;
  const hasPortfolioConsent = /포트폴리오|소개 동의|공개/.test(consentSource);
  const hasReviewConsent = /후기|리뷰/.test(consentSource);

  const leadText = `${draft.projectTitle || "프로젝트"} 프로젝트 진행을 위한 기본 계약 조건을 정리한 문서입니다.`;
  const scopeText = draft.scopeText || `${draft.projectTypeLabel || "프로젝트"} 제작`;
  const timelineText = draft.timeline || "협의 후 확정";
  const quoteLabel = draft.quoteLabel || draft.basePriceLabel || "협의 후 확정";
  const depositLabel = draft.depositLabel || "50% / 협의";
  const balanceLabel = draft.balanceLabel || "50% / 협의";
  const domainHostingText = draft.domainHostingLabel || "미정";
  const extraText =
    draft.contractExtra ||
    `${draft.domainHostingNote || "도메인/호스팅 준비 상태는 상담에서 함께 확인합니다."} 본 계약서에 명시되지 않은 사항은 상호 협의에 따라 결정하며, 필요한 경우 별도 특약 문서를 추가할 수 있습니다.`;

  const portfolioReviewText = [
    "최종 잔금 지급 완료 후 결과물의 사용 권한은 의뢰인에게 이전됩니다.",
    hasPortfolioConsent
      ? "의뢰인 동의에 따라 Gonish는 제작 사실과 일부 화면 이미지를 포트폴리오 및 홍보 목적에 한해 사용할 수 있습니다."
      : "포트폴리오 공개는 의뢰인 사전 동의가 있을 때만 진행하며, 동의가 없는 경우 공개하지 않습니다.",
    hasReviewConsent
      ? "의뢰인은 프로젝트 종료 후 짧은 후기(텍스트 기준) 제공에 동의합니다."
      : "후기 제공은 선택 사항이며, 별도 동의가 없는 경우 요청하지 않습니다.",
    "비공개 요청이 있는 경우 그 범위에 맞춰 공개를 제한합니다.",
  ].join(" ");

  return {
    leadText,
    scopeText,
    timelineText: `작업은 선금 확인일을 기준으로 시작하며, 예상 작업 기간은 ${timelineText}입니다. 도메인/호스팅 준비 상태는 '${domainHostingText}' 기준으로 진행합니다. 단, 자료 전달 지연이나 범위 변경이 발생하는 경우 일정은 함께 조정될 수 있습니다.`,
    amountText: `총 계약 금액은 ${quoteLabel}입니다.`,
    paymentItems: [
      `선금 ${depositLabel}은 계약 확정 후 지급합니다.`,
      `잔금 ${balanceLabel}은 최종 검수 완료 후 지급합니다.`,
      "세금계산서 또는 현금영수증 발행 여부는 별도 협의합니다.",
    ],
    revisionText: draft.revisionPolicy || "시안 기준 2회 수정 포함. 큰 방향 변경이나 추가 기능 요청은 별도 견적으로 재안내합니다.",
    portfolioReviewText,
    extraText,
  };
}

export default async function ContractDraftPage({ params, searchParams }: ContractPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const leadId = resolvedParams.leadId;
  const viewKey = resolvedSearchParams.key;

  if (!viewKey) {
    notFound();
  }

  const lead = await getEstimateLeadForView(leadId, viewKey);
  if (!lead) {
    notFound();
  }

  const draft = lead.contractDraft;
  const sections = draftToSections(draft);
  const createdAt = new Date(lead.createdAt).toLocaleString("ko-KR");

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.toolbar}>
          <p className={styles.toolbarNote}>
            자동 입력된 계약서 초안입니다. 문구를 클릭해 바로 수정한 뒤 <strong>PDF 저장 / 인쇄</strong>로 내보내세요.
          </p>
          <div className={styles.toolbarActions}>
            <span className={styles.status}>Lead {lead.id.slice(0, 8)} · {createdAt}</span>
            <Link href="/estimate" className={`${styles.button} ${styles.buttonSecondary}`}>
              견적 페이지
            </Link>
            <PrintButton className={styles.button} />
          </div>
        </div>

        <section className={styles.sheet}>
          <p className={styles.eyebrow}>Gonish agreement draft</p>
          <h1 className={styles.title}>웹사이트 제작 계약서</h1>
          <EditableText value={sections.leadText} className={styles.lead} />

          <div className={styles.grid}>
            <section className={styles.card}>
              <span className={styles.label}>Provider</span>
              <EditableText value="Gonish" className={styles.editable} />
              <EditableText value="대표자 / 연락처 / 이메일" className={styles.editable} />
            </section>
            <section className={styles.card}>
              <span className={styles.label}>Client</span>
              <EditableText value={draft.clientName || ""} className={styles.editable} />
              <EditableText value={draft.clientContact || ""} className={styles.editable} />
            </section>
          </div>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.number}>1</span>
              <h2 className={styles.sectionTitle}>프로젝트 범위</h2>
            </div>
            <EditableText value={`본 프로젝트의 범위는 ${sections.scopeText}입니다.`} className={styles.body} />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.number}>2</span>
              <h2 className={styles.sectionTitle}>작업 일정</h2>
            </div>
            <EditableText value={sections.timelineText} className={styles.body} />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.number}>3</span>
              <h2 className={styles.sectionTitle}>계약 금액 및 지급 조건</h2>
            </div>
            <div className={styles.body}>
              <EditableText value={sections.amountText} className={styles.editable} />
              <EditableList items={sections.paymentItems} />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.number}>4</span>
              <h2 className={styles.sectionTitle}>수정 범위</h2>
            </div>
            <EditableText value={sections.revisionText} className={styles.body} />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.number}>5</span>
              <h2 className={styles.sectionTitle}>의뢰인 제공 자료</h2>
            </div>
            <EditableText
              value="의뢰인은 프로젝트 진행에 필요한 텍스트, 이미지, 로고, 제품 또는 서비스 정보 등 필수 자료를 협의된 일정에 맞춰 제공합니다. 자료 전달 지연은 전체 일정에 영향을 줄 수 있습니다."
              className={styles.body}
            />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.number}>6</span>
              <h2 className={styles.sectionTitle}>저작권 및 포트폴리오/리뷰</h2>
            </div>
            <EditableText value={sections.portfolioReviewText} className={styles.body} />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.number}>7</span>
              <h2 className={styles.sectionTitle}>해지 및 환불</h2>
            </div>
            <EditableText
              value="작업 시작 전 계약 해지는 협의 후 가능합니다. 작업 시작 이후에는 진행된 범위에 해당하는 금액을 제외하고 정산합니다. 이미 전달된 산출물과 시안은 무단 사용이 불가합니다."
              className={styles.body}
            />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.number}>8</span>
              <h2 className={styles.sectionTitle}>기타</h2>
            </div>
            <EditableText value={sections.extraText} className={styles.body} />
          </section>

          <div className={styles.signature}>
            <section className={styles.signatureBox}>
              <span className={styles.label}>Provider sign</span>
              <EditableText value="서명 / 날짜" className={styles.editable} />
            </section>
            <section className={styles.signatureBox}>
              <span className={styles.label}>Client sign</span>
              <EditableText value="서명 / 날짜" className={styles.editable} />
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
