"use client";

import { useMemo, useState } from "react";
import styles from "./InquiryReplyComposer.module.css";

type InquiryReplyComposerProps = {
  inquiryId: string;
  kind: "contact" | "estimate";
  replyContact: string;
  initialRecipientEmail: string;
  initialSubject: string;
  initialMessage: string;
  lastSentAt?: string | null;
  lastSentSubject?: string;
  onSent?: (payload: ReplySentPayload) => void;
};

export type ReplySentPayload = {
  kind: "contact" | "estimate";
  lastSentAt: string;
  lastSentSubject: string;
  pipelineStatus?: string;
};

type ReplyResponse = {
  ok?: boolean;
  message?: string;
  warning?: string;
  lead?: {
    pipelineStatus?: string;
    lastContactedAt?: string | null;
  };
  inquiry?: {
    lastRepliedAt?: string | null;
    lastReplySubject?: string;
  };
};

function formatDateTime(value?: string | null) {
  if (!value) return "아직 발송 이력이 없어요.";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "아직 발송 이력이 없어요.";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(parsed);
}

export default function InquiryReplyComposer({
  inquiryId,
  kind,
  replyContact,
  initialRecipientEmail,
  initialSubject,
  initialMessage,
  lastSentAt,
  lastSentSubject,
  onSent,
}: InquiryReplyComposerProps) {
  const [recipientEmail, setRecipientEmail] = useState(initialRecipientEmail);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialMessage);
  const [displayLastSentAt, setDisplayLastSentAt] = useState(lastSentAt);
  const [displayLastSentSubject, setDisplayLastSentSubject] = useState(lastSentSubject || "");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("success");

  const missingEmailHint = useMemo(() => {
    if (initialRecipientEmail) return "";
    if (!replyContact.trim()) {
      return "문의에 이메일이 없어 메일을 바로 보낼 수 없어요. 받을 주소를 직접 입력해 주세요.";
    }
    return "문의자가 이메일 대신 다른 연락처를 남겼어요. 메일로 답변하려면 받을 이메일 주소를 입력해 주세요.";
  }, [initialRecipientEmail, replyContact]);

  const disabled = sending || !recipientEmail.trim() || !subject.trim() || !message.trim();

  const handleReset = () => {
    setRecipientEmail(initialRecipientEmail);
    setSubject(initialSubject);
    setMessage(initialMessage);
    setFeedback("");
  };

  const handleSend = async () => {
    setSending(true);
    setFeedback("");

    try {
      const response = await fetch("/api/admin/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          inquiryId,
          recipientEmail,
          subject,
          message,
        }),
      });

      let result: ReplyResponse = {};
      try {
        result = (await response.json()) as ReplyResponse;
      } catch {
        result = {};
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "메일 전송 중 오류가 발생했습니다.");
      }

      const nextLastSentAt = result.lead?.lastContactedAt || result.inquiry?.lastRepliedAt || new Date().toISOString();
      const nextLastSentSubject = result.inquiry?.lastReplySubject || subject;

      setDisplayLastSentAt(nextLastSentAt);
      setDisplayLastSentSubject(nextLastSentSubject);
      setFeedbackTone("success");
      setFeedback(result.warning ? `${result.message}\n${result.warning}` : result.message || "메일을 전송했습니다.");

      if (result.lead?.lastContactedAt) {
        onSent?.({
          kind,
          lastSentAt: result.lead.lastContactedAt,
          lastSentSubject: subject,
          pipelineStatus: result.lead.pipelineStatus,
        });
      }
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(error instanceof Error ? error.message : "메일 전송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.composer}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>{kind === "estimate" ? "Estimate Reply" : "Contact Reply"}</p>
          <div className={styles.title}>답변 메일 초안</div>
        </div>
        <span className={styles.badge}>{kind === "estimate" ? "견적 문의" : "일반 문의"}</span>
      </div>

      <div className={styles.context}>
        <div className={styles.contextRow}>
          <span className={styles.contextLabel}>문의 연락처</span>
          <span className={styles.contextValue}>{replyContact || "-"}</span>
        </div>
        <div className={styles.contextRow}>
          <span className={styles.contextLabel}>마지막 발송</span>
          <span className={styles.contextValue}>{formatDateTime(displayLastSentAt)}</span>
        </div>
        {displayLastSentSubject ? <p className={styles.subjectPreview}>최근 제목: {displayLastSentSubject}</p> : null}
      </div>

      <label className={styles.field}>
        <span className={styles.label}>받는 사람 이메일</span>
        <input
          type="email"
          value={recipientEmail}
          onChange={(event) => setRecipientEmail(event.target.value)}
          className={styles.input}
          placeholder="reply@example.com"
        />
      </label>

      {missingEmailHint ? <p className={styles.hint}>{missingEmailHint}</p> : null}

      <label className={styles.field}>
        <span className={styles.label}>메일 제목</span>
        <input value={subject} onChange={(event) => setSubject(event.target.value)} className={styles.input} />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>메일 본문</span>
        <textarea rows={12} value={message} onChange={(event) => setMessage(event.target.value)} className={styles.textarea} />
      </label>

      <div className={styles.footer}>
        <button type="button" className={styles.button} onClick={handleSend} disabled={disabled}>
          {sending ? "메일 전송 중..." : "답변 메일 전송"}
        </button>
        <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleReset} disabled={sending}>
          템플릿 다시 불러오기
        </button>
        {feedback ? (
          <p className={`${styles.feedback} ${feedbackTone === "success" ? styles.feedbackSuccess : styles.feedbackError}`}>{feedback}</p>
        ) : null}
      </div>
    </div>
  );
}
