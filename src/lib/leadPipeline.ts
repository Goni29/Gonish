export const ESTIMATE_PIPELINE_STATUS_VALUES = [
  "new",
  "first_reply_sent",
  "quoting",
  "quote_sent",
  "contract_sent",
  "won",
  "lost",
  "on_hold",
] as const;

export type EstimatePipelineStatus = (typeof ESTIMATE_PIPELINE_STATUS_VALUES)[number];

export const ESTIMATE_PIPELINE_STATUS_LABELS: Record<EstimatePipelineStatus, string> = {
  new: "신규",
  first_reply_sent: "1차 응답완료",
  quoting: "견적 작성중",
  quote_sent: "견적 발송",
  contract_sent: "계약서 발송",
  won: "계약 완료",
  lost: "종료(실패)",
  on_hold: "보류",
};

export const ESTIMATE_LEAD_SORT_VALUES = ["created_desc", "next_action_asc", "updated_desc"] as const;

export type EstimateLeadSort = (typeof ESTIMATE_LEAD_SORT_VALUES)[number];

export const ESTIMATE_LEAD_SORT_LABELS: Record<EstimateLeadSort, string> = {
  created_desc: "최신 접수순",
  next_action_asc: "다음 액션일 빠른순",
  updated_desc: "최근 업데이트순",
};

export const ESTIMATE_LEAD_ARCHIVE_FILTER_VALUES = ["active", "all", "archived"] as const;

export type EstimateLeadArchiveFilter = (typeof ESTIMATE_LEAD_ARCHIVE_FILTER_VALUES)[number];

export const ESTIMATE_LEAD_ARCHIVE_FILTER_LABELS: Record<EstimateLeadArchiveFilter, string> = {
  active: "운영중만",
  all: "전체",
  archived: "아카이브만",
};

export function isEstimatePipelineStatus(value: string): value is EstimatePipelineStatus {
  return (ESTIMATE_PIPELINE_STATUS_VALUES as readonly string[]).includes(value);
}

export function normalizeEstimatePipelineStatus(value: string | null | undefined): EstimatePipelineStatus {
  if (!value) return "new";
  return isEstimatePipelineStatus(value) ? value : "new";
}

export function isEstimateLeadSort(value: string): value is EstimateLeadSort {
  return (ESTIMATE_LEAD_SORT_VALUES as readonly string[]).includes(value);
}

export function normalizeEstimateLeadSort(value: string | null | undefined): EstimateLeadSort {
  if (!value) return "created_desc";
  return isEstimateLeadSort(value) ? value : "created_desc";
}

export function isEstimateLeadArchiveFilter(value: string): value is EstimateLeadArchiveFilter {
  return (ESTIMATE_LEAD_ARCHIVE_FILTER_VALUES as readonly string[]).includes(value);
}

export function normalizeEstimateLeadArchiveFilter(value: string | null | undefined): EstimateLeadArchiveFilter {
  if (!value) return "active";
  return isEstimateLeadArchiveFilter(value) ? value : "active";
}
