"use client";

import { type ReactNode, useEffect, useState } from "react";
import type { EstimatePipelineStatus } from "@/lib/leadPipeline";
import LeadPipelineEditor from "./LeadPipelineEditor";
import styles from "./page.module.css";

type EstimateLeadLiveCellsProps = {
  leadId: string;
  initialBasePrice: string;
  initialPriceRange: string;
  pipelineStatusLabel: string;
  nextActionLabel: string;
  lastContactedLabel: string;
  updatedLabel: string;
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
  children: ReactNode;
};

export default function EstimateLeadLiveCells({
  leadId,
  initialBasePrice,
  initialPriceRange,
  pipelineStatusLabel,
  nextActionLabel,
  lastContactedLabel,
  updatedLabel,
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
  children,
}: EstimateLeadLiveCellsProps) {
  const [basePrice, setBasePrice] = useState(initialBasePrice);
  const [priceRange, setPriceRange] = useState(initialPriceRange);

  useEffect(() => {
    setBasePrice(initialBasePrice);
  }, [initialBasePrice]);

  useEffect(() => {
    setPriceRange(initialPriceRange);
  }, [initialPriceRange]);

  return (
    <>
      <td>
        <span className={styles.pill}>{basePrice || "-"}</span>
        <div className={styles.muted}>{priceRange || "-"}</div>
      </td>
      <td>{children}</td>
      <td>
        <div className={styles.operationsStack}>
          <div className={styles.pipelineMeta}>
            <span className={styles.pipelineStatus}>{pipelineStatusLabel}</span>
            <span>다음 액션: {nextActionLabel}</span>
            <span>마지막 연락: {lastContactedLabel}</span>
            <span>업데이트: {updatedLabel}</span>
          </div>
          <LeadPipelineEditor
            leadId={leadId}
            initialStatus={initialStatus}
            initialAssignedTo={initialAssignedTo}
            initialNextActionAt={initialNextActionAt}
            initialLastContactedAt={initialLastContactedAt}
            initialInternalNote={initialInternalNote}
            initialCloseReason={initialCloseReason}
            initialArchived={initialArchived}
            replyContact={replyContact}
            initialReplyRecipientEmail={initialReplyRecipientEmail}
            initialReplySubject={initialReplySubject}
            initialReplyMessage={initialReplyMessage}
            initialBasePrice={initialBasePrice}
            initialPriceRange={initialPriceRange}
            onPricingApplied={({ basePrice: nextBasePrice, priceRange: nextPriceRange }) => {
              setBasePrice(nextBasePrice);
              setPriceRange(nextPriceRange);
            }}
          />
        </div>
      </td>
    </>
  );
}
