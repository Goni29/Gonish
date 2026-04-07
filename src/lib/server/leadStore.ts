import { randomBytes, randomUUID } from "node:crypto";
import type { EstimateContractDraft, EstimateEmailData, EstimateLeadRecord } from "@/lib/inquiry";
import type { EstimateLeadArchiveFilter, EstimateLeadSort, EstimatePipelineStatus } from "@/lib/leadPipeline";
import { normalizeEstimatePipelineStatus } from "@/lib/leadPipeline";

const SUPABASE_TABLE = process.env.SUPABASE_LEADS_TABLE || "estimate_leads";

const BASE_SELECT_COLUMNS = "id,kind,created_at,view_key,email_data,contract_draft";
const PIPELINE_SELECT_COLUMNS =
  `${BASE_SELECT_COLUMNS},pipeline_status,assigned_to,next_action_at,last_contacted_at,internal_note,close_reason,archived,updated_at`;
const PIPELINE_COLUMN_NAMES = [
  "pipeline_status",
  "assigned_to",
  "next_action_at",
  "last_contacted_at",
  "internal_note",
  "close_reason",
  "archived",
  "updated_at",
];

type SupabaseLeadRow = {
  id: string;
  kind: "estimate";
  created_at: string;
  view_key: string;
  email_data: EstimateEmailData;
  contract_draft: EstimateContractDraft;
  pipeline_status?: string;
  assigned_to?: string | null;
  next_action_at?: string | null;
  last_contacted_at?: string | null;
  internal_note?: string | null;
  close_reason?: string | null;
  archived?: boolean | null;
  updated_at?: string | null;
};

export type ListEstimateLeadsOptions = {
  limit?: number;
  status?: EstimatePipelineStatus | "all";
  archived?: EstimateLeadArchiveFilter;
  sort?: EstimateLeadSort;
};

export type UpdateEstimateLeadPipelineInput = {
  pipelineStatus?: EstimatePipelineStatus;
  assignedTo?: string;
  nextActionAt?: string | null;
  lastContactedAt?: string | null;
  internalNote?: string;
  closeReason?: string;
  archived?: boolean;
};

function createViewKey() {
  return randomBytes(18).toString("base64url");
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  return { serviceRoleKey, url };
}

function toTrimmedText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeIsoOrNull(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function mapRowToLeadRecord(row: SupabaseLeadRow): EstimateLeadRecord {
  return {
    id: row.id,
    kind: "estimate",
    createdAt: row.created_at,
    viewKey: row.view_key,
    emailData: row.email_data,
    contractDraft: row.contract_draft,
    pipelineStatus: normalizeEstimatePipelineStatus(row.pipeline_status),
    assignedTo: toTrimmedText(row.assigned_to),
    nextActionAt: normalizeIsoOrNull(row.next_action_at),
    lastContactedAt: normalizeIsoOrNull(row.last_contacted_at),
    internalNote: toTrimmedText(row.internal_note),
    closeReason: toTrimmedText(row.close_reason),
    archived: row.archived === true,
    updatedAt: normalizeIsoOrNull(row.updated_at) || row.created_at,
  };
}

function shouldRetryWithoutPipelineColumns(status: number, errorText: string) {
  if (status !== 400) return false;
  const lowered = errorText.toLowerCase();
  const isSchemaColumnError =
    lowered.includes("schema cache") ||
    lowered.includes("does not exist") ||
    lowered.includes("could not find") ||
    lowered.includes("unknown column");

  if (!isSchemaColumnError) {
    return false;
  }

  return PIPELINE_COLUMN_NAMES.some((column) => lowered.includes(column));
}

async function insertLeadRow(row: SupabaseLeadRow) {
  const config = getSupabaseConfig();

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_TABLE}`, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([row]),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase insert failed: ${response.status} ${errorText}`);
  }

  const rows = (await response.json()) as SupabaseLeadRow[];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Supabase insert returned empty result.");
  }

  return rows[0];
}

async function selectLeadRowByIdAndViewKey(leadId: string, viewKey: string, includePipeline = true): Promise<SupabaseLeadRow | null> {
  const config = getSupabaseConfig();

  const query = new URLSearchParams({
    select: includePipeline ? PIPELINE_SELECT_COLUMNS : BASE_SELECT_COLUMNS,
    id: `eq.${leadId}`,
    view_key: `eq.${viewKey}`,
    limit: "1",
  });

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_TABLE}?${query.toString()}`, {
    method: "GET",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (includePipeline && shouldRetryWithoutPipelineColumns(response.status, errorText)) {
      return selectLeadRowByIdAndViewKey(leadId, viewKey, false);
    }
    throw new Error(`Supabase select failed: ${response.status} ${errorText}`);
  }

  const rows = (await response.json()) as SupabaseLeadRow[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const row = rows[0];
  if (row.kind !== "estimate") {
    return null;
  }

  return row;
}

async function selectLeadRowById(leadId: string, includePipeline = true): Promise<SupabaseLeadRow | null> {
  const config = getSupabaseConfig();

  const query = new URLSearchParams({
    select: includePipeline ? PIPELINE_SELECT_COLUMNS : BASE_SELECT_COLUMNS,
    id: `eq.${leadId}`,
    limit: "1",
  });

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_TABLE}?${query.toString()}`, {
    method: "GET",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (includePipeline && shouldRetryWithoutPipelineColumns(response.status, errorText)) {
      return selectLeadRowById(leadId, false);
    }
    throw new Error(`Supabase select failed: ${response.status} ${errorText}`);
  }

  const rows = (await response.json()) as SupabaseLeadRow[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const row = rows[0];
  if (row.kind !== "estimate") {
    return null;
  }

  return row;
}

function applyOrder(query: URLSearchParams, sort: EstimateLeadSort, includePipeline: boolean) {
  if (!includePipeline) {
    query.append("order", "created_at.desc");
    return;
  }

  if (sort === "next_action_asc") {
    query.append("order", "next_action_at.asc.nullslast");
    query.append("order", "created_at.desc");
    return;
  }

  if (sort === "updated_desc") {
    query.append("order", "updated_at.desc");
    query.append("order", "created_at.desc");
    return;
  }

  query.append("order", "created_at.desc");
}

async function selectLeadRows(options: ListEstimateLeadsOptions, includePipeline = true): Promise<SupabaseLeadRow[]> {
  const config = getSupabaseConfig();
  const safeLimit = Math.max(1, Math.min(500, Math.floor(options.limit || 100)));
  const statusFilter = options.status || "all";
  const archiveFilter = options.archived || "active";
  const sort = options.sort || "created_desc";

  const query = new URLSearchParams({
    select: includePipeline ? PIPELINE_SELECT_COLUMNS : BASE_SELECT_COLUMNS,
    limit: String(safeLimit),
  });

  if (includePipeline) {
    if (statusFilter !== "all") {
      query.set("pipeline_status", `eq.${statusFilter}`);
    }

    if (archiveFilter === "active") {
      query.set("archived", "eq.false");
    } else if (archiveFilter === "archived") {
      query.set("archived", "eq.true");
    }
  }

  applyOrder(query, sort, includePipeline);

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_TABLE}?${query.toString()}`, {
    method: "GET",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (includePipeline && shouldRetryWithoutPipelineColumns(response.status, errorText)) {
      return selectLeadRows(options, false);
    }
    throw new Error(`Supabase list failed: ${response.status} ${errorText}`);
  }

  const rows = (await response.json()) as SupabaseLeadRow[];
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.filter((row) => row.kind === "estimate");
}

function normalizeIsoInput(value: string | null) {
  if (value === null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid datetime value: ${value}`);
  }
  return parsed.toISOString();
}

export async function createEstimateLead(params: { emailData: EstimateEmailData; contractDraft: EstimateContractDraft }) {
  const row = await insertLeadRow({
    id: randomUUID(),
    kind: "estimate",
    created_at: new Date().toISOString(),
    view_key: createViewKey(),
    email_data: params.emailData,
    contract_draft: params.contractDraft,
  });

  return mapRowToLeadRecord(row);
}

export async function getEstimateLeadForView(leadId: string, viewKey: string) {
  const row = await selectLeadRowByIdAndViewKey(leadId, viewKey);
  if (!row) return null;
  return mapRowToLeadRecord(row);
}

export async function getEstimateLeadById(leadId: string) {
  const row = await selectLeadRowById(leadId);
  if (!row) return null;
  return mapRowToLeadRecord(row);
}

export async function listEstimateLeads(options: number | ListEstimateLeadsOptions = 100) {
  const normalizedOptions: ListEstimateLeadsOptions =
    typeof options === "number"
      ? { limit: options, status: "all", archived: "all", sort: "created_desc" }
      : {
          limit: options.limit ?? 100,
          status: options.status ?? "all",
          archived: options.archived ?? "active",
          sort: options.sort ?? "created_desc",
        };

  const rows = await selectLeadRows(normalizedOptions);
  return rows.map(mapRowToLeadRecord);
}

export async function updateEstimateLeadPipeline(leadId: string, input: UpdateEstimateLeadPipelineInput) {
  const config = getSupabaseConfig();

  const payload: Record<string, unknown> = {};

  if (input.pipelineStatus) payload.pipeline_status = input.pipelineStatus;
  if (input.assignedTo !== undefined) payload.assigned_to = input.assignedTo;
  if (input.nextActionAt !== undefined) payload.next_action_at = normalizeIsoInput(input.nextActionAt);
  if (input.lastContactedAt !== undefined) payload.last_contacted_at = normalizeIsoInput(input.lastContactedAt);
  if (input.internalNote !== undefined) payload.internal_note = input.internalNote;
  if (input.closeReason !== undefined) payload.close_reason = input.closeReason;
  if (input.archived !== undefined) payload.archived = input.archived;

  if (Object.keys(payload).length === 0) {
    throw new Error("No pipeline fields to update.");
  }

  payload.updated_at = new Date().toISOString();

  const query = new URLSearchParams({
    id: `eq.${leadId}`,
    select: PIPELINE_SELECT_COLUMNS,
  });

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_TABLE}?${query.toString()}`, {
    method: "PATCH",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (shouldRetryWithoutPipelineColumns(response.status, errorText)) {
      throw new Error("리드 운영 컬럼이 아직 생성되지 않았습니다. Supabase SQL migration을 먼저 실행해 주세요.");
    }
    throw new Error(`Supabase update failed: ${response.status} ${errorText}`);
  }

  const rows = (await response.json()) as SupabaseLeadRow[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return mapRowToLeadRecord(rows[0]);
}
