"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
};

type UpdateResponse = {
  ok?: boolean;
  message?: string;
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

export default function LeadPipelineEditor({
  leadId,
  initialStatus,
  initialAssignedTo,
  initialNextActionAt,
  initialLastContactedAt,
  initialInternalNote,
  initialCloseReason,
  initialArchived,
}: LeadPipelineEditorProps) {
  const router = useRouter();
  const [status, setStatus] = useState<EstimatePipelineStatus>(initialStatus);
  const [assignedTo, setAssignedTo] = useState(initialAssignedTo);
  const [nextActionAt, setNextActionAt] = useState(toDateTimeLocalInput(initialNextActionAt));
  const [lastContactedAt, setLastContactedAt] = useState(toDateTimeLocalInput(initialLastContactedAt));
  const [internalNote, setInternalNote] = useState(initialInternalNote);
  const [closeReason, setCloseReason] = useState(initialCloseReason);
  const [archived, setArchived] = useState(initialArchived);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const disableCloseReason = useMemo(() => status !== "lost" && status !== "on_hold", [status]);

  const handleSave = async () => {
    setSaving(true);
    setFeedback("");

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipelineStatus: status,
          assignedTo,
          nextActionAt: nextActionAt || null,
          lastContactedAt: lastContactedAt || null,
          internalNote,
          closeReason: disableCloseReason ? "" : closeReason,
          archived,
        }),
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

      setFeedback(result.message || "저장되었습니다.");
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

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
          <input
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            placeholder="예: Goni"
            className={styles.editorInput}
          />
        </label>
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
          placeholder="다음 통화 때 확인할 내용, 리스크, 우선순위 등을 기록"
        />
      </label>

      <label className={styles.editorField}>
        <span className={styles.editorLabel}>종료/보류 사유</span>
        <input
          value={closeReason}
          onChange={(event) => setCloseReason(event.target.value)}
          className={styles.editorInput}
          disabled={disableCloseReason}
          placeholder={disableCloseReason ? "상태가 종료(실패)/보류일 때 입력" : "예: 예산 보류, 일정 미스매치"}
        />
      </label>

      <label className={styles.archiveCheck}>
        <input type="checkbox" checked={archived} onChange={(event) => setArchived(event.target.checked)} />
        <span>아카이브로 숨김 처리</span>
      </label>

      <div className={styles.editorFooter}>
        <button type="button" className={styles.button} onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </button>
        {feedback ? <span className={styles.feedback}>{feedback}</span> : null}
      </div>
    </div>
  );
}
