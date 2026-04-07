import type { EstimatePipelineStatus } from "@/lib/leadPipeline";

export type ContactInquiryForm = {
  name: string;
  project: string;
  tone: string;
  reply: string;
  message: string;
};

export type ContactInquiryRecord = {
  id: string;
  kind: "contact";
  createdAt: string;
  form: ContactInquiryForm;
  lastRepliedAt: string | null;
  lastReplySubject: string;
  lastReplyPreview: string;
};

export type EstimateEmailData = {
  name: string;
  brand: string;
  reply: string;
  projectType: string;
  pageScope: string;
  features: string;
  readiness: string;
  schedule: string;
  domainHosting: string;
  discounts: string;
  basePrice: string;
  priceRange: string;
  goal: string;
  note: string;
};

export type EstimateContractDraft = {
  projectTitle: string;
  clientName: string;
  clientContact: string;
  projectTypeLabel: string;
  pageScopeLabel: string;
  featureLabels: string[];
  readinessLabel: string;
  scheduleLabel: string;
  domainHostingLabel: string;
  domainHostingNote: string;
  discountLabels: string[];
  estimateBandLabel: string;
  estimateBandDescription: string;
  basePriceLabel: string;
  priceRangeLabel: string;
  scopeText: string;
  timeline: string;
  quoteLabel: string;
  depositLabel: string;
  balanceLabel: string;
  revisionPolicy: string;
  contractExtra: string;
  goal: string;
  note: string;
};

export type ContactInquiryPayload = {
  kind: "contact";
  form: ContactInquiryForm;
};

export type EstimateInquiryPayload = {
  kind: "estimate";
  emailData: EstimateEmailData;
  contractDraft: EstimateContractDraft;
};

export type InquiryPayload = ContactInquiryPayload | EstimateInquiryPayload;

export type InquiryResponse = {
  ok: boolean;
  message: string;
  contractUrl?: string;
};

export type EstimateLeadRecord = {
  id: string;
  kind: "estimate";
  createdAt: string;
  viewKey: string;
  emailData: EstimateEmailData;
  contractDraft: EstimateContractDraft;
  pipelineStatus: EstimatePipelineStatus;
  assignedTo: string;
  nextActionAt: string | null;
  lastContactedAt: string | null;
  internalNote: string;
  closeReason: string;
  archived: boolean;
  updatedAt: string;
};
