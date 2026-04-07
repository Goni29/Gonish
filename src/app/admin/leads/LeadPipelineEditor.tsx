"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import InquiryReplyComposer, { type ReplySentPayload } from "@/components/admin/InquiryReplyComposer";
import {
  buildEstimateContractPaymentLabels,
  normalizeEstimateBasePriceInput,
  normalizeEstimatePriceRangeInput,
} from "@/lib/estimatePricing";
import {
  ESTIMATE_PIPELINE_STATUS_LABELS,
  ESTIMATE_PIPELINE_STATUS_VALUES,
  type EstimatePipelineStatus,
} from "@/lib/leadPipeline";
import styles from "./page.module.css";

type LeadPipelineEditorProps = {
  leadId: string;
  initialStatus: EstimatePipelineStatus;
  initialAssignedTo: string;
  initialNextActionAt: string | null;
  initialLastContactedAt: string | null;
  initialInternalNote: string;
  initialCloseReason: string;
  initialArchived: boolean;
  replyContact: string;
  initialReplyRecipientEmail: string;
  initialReplySubject: string;
  initialReplyMessage: string;
  initialBasePrice: string;
  initialPriceRange: string;
  onPricingApplied?: (pricing: { basePrice: string; priceRange: string }) => void;
};

type UpdateResponse = {
  ok?: boolean;
  message?: string;
};

type SaveMode = "all" | "pricing" | null;

type LeadPatchPayload = {
  pipelineStatus?: EstimatePipelineStatus;
  assignedTo?: string;
  nextActionAt?: string | null;
  lastContactedAt?: string | null;
  internalNote?: string;
  closeReason?: string;
  archived?: boolean;
  basePrice?: string;
  priceRange?: string;
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toDateTimeLocalInput(value: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}T${pad2(parsed.getHours())}:${pad2(parsed.getMinutes())}`;
}

function nowLocalInputValue() {
  return toDateTimeLocalInput(new Date().toISOString());
}

function resolveBudgetLabel(basePrice: string, priceRange: string) {
  return priceRange.trim() || basePrice.trim() || "범위 조율 예정";
}

function replaceEstimateBudgetLine(message: string, budgetLabel: string) {
  const budgetLine = `- 예산 범위: ${budgetLabel}`;

  if (/^- 예산 범위: .*$/m.test(message)) {
    return message.replace(/^- 예산 범위: .*$/m, budgetLine);
  }

  return `${message.trim()}\n${budgetLine}`.trim();
}

export default function LeadPipelineEditor({
  leadId,
  initialStatus,
  initialAssignedTo,
  initialNextActionAt,
  initialLastContactedAt,
  initialInternalNote,
  initialCloseReason,
  initialArchived,
  replyContact,
  initialReplyRecipientEmail,
  initialReplySubject,
  initialReplyMessage,
  initialBasePrice,
  initialPriceRange,
  onPricingApplied,
}: LeadPipelineEditorProps) {
  const router = useRouter();
  const [status, setStatus] = useState<EstimatePipelineStatus>(initialStatus);
  const [assignedTo, setAssignedTo] = useState(initialAssignedTo);
  const [nextActionAt, setNextActionAt] = useState(toDateTimeLocalInput(initialNextActionAt));
  const [lastContactedAt, setLastContactedAt] = useState(toDateTimeLocalInput(initialLastContactedAt));
  const [internalNote, setInternalNote] = useState(initialInternalNote);
  const [closeReason, setCloseReason] = useState(initialCloseReason);
  const [archived, setArchived] = useState(initialArchived);
  const [basePrice, setBasePrice] = useState(initialBasePrice);
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [appliedBasePrice, setAppliedBasePrice] = useState(initialBasePrice);
  const [appliedPriceRange, setAppliedPriceRange] = useState(initialPriceRange);
  const [saveMode, setSaveMode] = useState<SaveMode>(null);
  const [feedback, setFeedback] = useState("");

  const disableCloseReason = useMemo(() => status !== "lost" && status !== "on_hold", [status]);
  const normalizedAppliedBasePrice = useMemo(() => normalizeEstimateBasePriceInput(appliedBasePrice), [appliedBasePrice]);
  const normalizedAppliedPriceRange = useMemo(() => normalizeEstimatePriceRangeInput(appliedPriceRange), [appliedPriceRange]);
  const normalizedDraftBasePrice = useMemo(() => normalizeEstimateBasePriceInput(basePrice), [basePrice]);
  const normalizedDraftPriceRange = useMemo(() => normalizeEstimatePriceRangeInput(priceRange), [priceRange]);
  const amountDirty = normalizedDraftBasePrice !== normalizedAppliedBasePrice || normalizedDraftPriceRange !== normalizedAppliedPriceRange;
  const paymentPreview = useMemo(() => buildEstimateContractPaymentLabels(basePrice), [basePrice]);
  const liveReplyMessage = useMemo(
    () => replaceEstimateBudgetLine(initialReplyMessage, resolveBudgetLabel(appliedBasePrice, appliedPriceRange)),
    [appliedBasePrice, appliedPriceRange, initialReplyMessage],
  );
  const composerRefreshKey = `${leadId}:${appliedBasePrice}:${appliedPriceRange}:${initialLastContactedAt || ""}`;

  const handleReplySent = (payload: ReplySentPayload) => {
    if (payload.kind !== "estimate") return;

    setLastContactedAt(toDateTimeLocalInput(payload.lastSentAt));
    if (payload.pipelineStatus && ESTIMATE_PIPELINE_STATUS_VALUES.includes(payload.pipelineStatus as EstimatePipelineStatus)) {
      setStatus(payload.pipelineStatus as EstimatePipelineStatus);
    }
  };

  const submitPatch = async (mode: Exclude<SaveMode, null>, payload: LeadPatchPayload, successFallback: string) => {
    setSaveMode(mode);
    setFeedback("");

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let result: UpdateResponse = {};
      try {
        result = (await response.json()) as UpdateResponse;
      } catch {
        result = {};
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "저장에 실패했습니다.");
      }

      setFeedback(result.message || successFallback);
      router.refresh();
      return true;
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "저장에 실패했습니다.");
      return false;
    } finally {
      setSaveMode(null);
    }
  };

  const handleApplyPricing = async () => {
    const nextBasePrice = normalizeEstimateBasePriceInput(basePrice);
    const nextPriceRange = normalizeEstimatePriceRangeInput(priceRange);
    const previousAppliedBasePrice = appliedBasePrice;
    const previousAppliedPriceRange = appliedPriceRange;

    setBasePrice(nextBasePrice);
    setPriceRange(nextPriceRange);
    setAppliedBasePrice(nextBasePrice);
    setAppliedPriceRange(nextPriceRange);

    const ok = await submitPatch(
      "pricing",
      {
        basePrice: nextBasePrice,
        priceRange: nextPriceRange,
      },
      "금액을 적용했습니다. 템플릿도 최신 예산 범위로 갱신됩니다.",
    );

    if (!ok) {
      setAppliedBasePrice(previousAppliedBasePrice);
      setAppliedPriceRange(previousAppliedPriceRange);
      return;
    }

    onPricingApplied?.({
      basePrice: nextBasePrice,
      priceRange: nextPriceRange,
    });
  };

  const handleSave = async () => {
    const nextBasePrice = normalizeEstimateBasePriceInput(basePrice);
    const nextPriceRange = normalizeEstimatePriceRangeInput(priceRange);
    const previousAppliedBasePrice = appliedBasePrice;
    const previousAppliedPriceRange = appliedPriceRange;

    setBasePrice(nextBasePrice);
    setPriceRange(nextPriceRange);
    setAppliedBasePrice(nextBasePrice);
    setAppliedPriceRange(nextPriceRange);

    const ok = await submitPatch(
      "all",
      {
        pipelineStatus: status,
        assignedTo,
        nextActionAt: nextActionAt || null,
        lastContactedAt: lastContactedAt || null,
        internalNote,
        closeReason: disableCloseReason ? "" : closeReason,
        archived,
        basePrice: nextBasePrice,
        priceRange: nextPriceRange,
      },
      "리드 정보를 저장했습니다.",
    );

    if (!ok) {
      setAppliedBasePrice(previousAppliedBasePrice);
      setAppliedPriceRange(previousAppliedPriceRange);
      return;
    }

    onPricingApplied?.({
      basePrice: nextBasePrice,
      priceRange: nextPriceRange,
    });
  };

  const isSaving = saveMode !== null;

  return (
    <div className={styles.pipelineEditor}>
      <div className={styles.editorRow}>
        <label className={styles.editorField}>
          <span className={styles.editorLabel}>상태</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as EstimatePipelineStatus)} className={styles.editorInput}>
            {ESTIMATE_PIPELINE_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {ESTIMATE_PIPELINE_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.editorField}>
          <span className={styles.editorLabel}>담당자</span>
          <input value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} placeholder="예: Goni" className={styles.editorInput} />
        </label>
      </div>

      <div className={styles.editorRow}>
        <label className={styles.editorField}>
          <span className={styles.editorLabel}>예상 시작가</span>
          <input
            value={basePrice}
            onChange={(event) => setBasePrice(event.target.value)}
            onBlur={() => setBasePrice(normalizeEstimateBasePriceInput(basePrice))}
            placeholder="예: 180 또는 180만 원"
            className={styles.editorInput}
          />
          <span className={styles.editorHint}>숫자만 입력해도 저장할 때 `만 원` 형식으로 맞춰집니다.</span>
        </label>

        <label className={styles.editorField}>
          <span className={styles.editorLabel}>예상 범위</span>
          <input
            value={priceRange}
            onChange={(event) => setPriceRange(event.target.value)}
            onBlur={() => setPriceRange(normalizeEstimatePriceRangeInput(priceRange))}
            placeholder="예: 180~260 또는 180만 ~ 260만 원"
            className={styles.editorInput}
          />
          <span className={styles.editorHint}>적용 버튼을 누르면 템플릿 초안이 새로고침 없이 바로 바뀝니다.</span>
        </label>
      </div>

      <div className={styles.amountActions}>
        <div className={styles.amountPreview}>
          <span className={styles.editorLabel}>템플릿 반영 미리보기</span>
          <p className={styles.amountPreviewText}>
            {paymentPreview.quoteLabel
              ? `예산 범위 ${resolveBudgetLabel(basePrice, priceRange)} / 총액 ${paymentPreview.quoteLabel} / 선금 ${paymentPreview.depositLabel || "-"} / 잔금 ${paymentPreview.balanceLabel || "-"}`
              : "시작가를 입력하면 계약 템플릿 금액이 여기서 바로 계산됩니다."}
          </p>
        </div>
        <button
          type="button"
          className={`${styles.button} ${styles.amountApplyButton}`}
          onClick={handleApplyPricing}
          disabled={isSaving || !amountDirty}
        >
          {saveMode === "pricing" ? "금액 적용 중.." : "금액 적용"}
        </button>
      </div>

      <div className={styles.editorRow}>
        <label className={styles.editorField}>
          <span className={styles.editorLabel}>다음 액션일</span>
          <input
            type="datetime-local"
            value={nextActionAt}
            onChange={(event) => setNextActionAt(event.target.value)}
            className={styles.editorInput}
          />
        </label>

        <label className={styles.editorField}>
          <span className={styles.editorLabel}>마지막 연락일</span>
          <div className={styles.inlineField}>
            <input
              type="datetime-local"
              value={lastContactedAt}
              onChange={(event) => setLastContactedAt(event.target.value)}
              className={styles.editorInput}
            />
            <button type="button" className={styles.miniButton} onClick={() => setLastContactedAt(nowLocalInputValue())}>
              지금
            </button>
          </div>
        </label>
      </div>

      <label className={styles.editorField}>
        <span className={styles.editorLabel}>내부 메모</span>
        <textarea
          rows={2}
          value={internalNote}
          onChange={(event) => setInternalNote(event.target.value)}
          className={styles.editorTextarea}
          placeholder="다음 통화 때 확인할 내용이나 우선순위를 메모해 두세요"
        />
      </label>

      <InquiryReplyComposer
        key={composerRefreshKey}
        inquiryId={leadId}
        kind="estimate"
        replyContact={replyContact}
        initialRecipientEmail={initialReplyRecipientEmail}
        initialSubject={initialReplySubject}
        initialMessage={liveReplyMessage}
        lastSentAt={initialLastContactedAt}
        onSent={handleReplySent}
      />

      <label className={styles.editorField}>
        <span className={styles.editorLabel}>종료 / 보류 사유</span>
        <input
          value={closeReason}
          onChange={(event) => setCloseReason(event.target.value)}
          className={styles.editorInput}
          disabled={disableCloseReason}
          placeholder={disableCloseReason ? "상태가 종료 또는 보류일 때만 입력됩니다." : "예: 일정 미스매치, 예산 보류"}
        />
      </label>

      <label className={styles.archiveCheck}>
        <input type="checkbox" checked={archived} onChange={(event) => setArchived(event.target.checked)} />
        <span>아카이브로 이동</span>
      </label>

      <div className={styles.editorFooter}>
        <button type="button" className={styles.button} onClick={handleSave} disabled={isSaving}>
          {saveMode === "all" ? "저장 중.." : "리드 정보 저장"}
        </button>
        {feedback ? <span className={styles.feedback}>{feedback}</span> : null}
      </div>
    </div>
  );
}
