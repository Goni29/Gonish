import { randomUUID } from "node:crypto";
import type { ContactInquiryForm, ContactInquiryRecord } from "@/lib/inquiry";

const SUPABASE_CONTACTS_TABLE = process.env.SUPABASE_CONTACTS_TABLE || "contact_inquiries";

const BASE_SELECT_COLUMNS = "id,kind,created_at,form";
const REPLY_SELECT_COLUMNS = `${BASE_SELECT_COLUMNS},last_replied_at,last_reply_subject,last_reply_preview`;
const REPLY_COLUMN_NAMES = ["last_replied_at", "last_reply_subject", "last_reply_preview"];

type SupabaseContactRow = {
  id: string;
  kind: "contact";
  created_at: string;
  form: ContactInquiryForm;
  last_replied_at?: string | null;
  last_reply_subject?: string | null;
  last_reply_preview?: string | null;
};

export type UpdateContactInquiryReplyInput = {
  lastRepliedAt?: string | null;
  lastReplySubject?: string;
  lastReplyPreview?: string;
};

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

function shouldRetryWithoutReplyColumns(status: number, errorText: string) {
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

  return REPLY_COLUMN_NAMES.some((column) => lowered.includes(column));
}

function mapRowToRecord(row: SupabaseContactRow): ContactInquiryRecord {
  return {
    id: row.id,
    kind: "contact",
    createdAt: row.created_at,
    form: row.form,
    lastRepliedAt: normalizeIsoOrNull(row.last_replied_at),
    lastReplySubject: toTrimmedText(row.last_reply_subject),
    lastReplyPreview: toTrimmedText(row.last_reply_preview),
  };
}

async function selectContactRowById(id: string, includeReply = true): Promise<SupabaseContactRow | null> {
  const config = getSupabaseConfig();

  const query = new URLSearchParams({
    select: includeReply ? REPLY_SELECT_COLUMNS : BASE_SELECT_COLUMNS,
    id: `eq.${id}`,
    limit: "1",
  });

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_CONTACTS_TABLE}?${query.toString()}`, {
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
    if (includeReply && shouldRetryWithoutReplyColumns(response.status, errorText)) {
      return selectContactRowById(id, false);
    }
    throw new Error(`Supabase contact select failed: ${response.status} ${errorText}`);
  }

  const rows = (await response.json()) as SupabaseContactRow[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const row = rows[0];
  if (row.kind !== "contact") {
    return null;
  }

  return row;
}

async function selectContactRows(limit: number, includeReply = true): Promise<SupabaseContactRow[]> {
  const config = getSupabaseConfig();
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));

  const query = new URLSearchParams({
    select: includeReply ? REPLY_SELECT_COLUMNS : BASE_SELECT_COLUMNS,
    order: "created_at.desc",
    limit: String(safeLimit),
  });

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_CONTACTS_TABLE}?${query.toString()}`, {
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
    if (includeReply && shouldRetryWithoutReplyColumns(response.status, errorText)) {
      return selectContactRows(limit, false);
    }
    throw new Error(`Supabase contact list failed: ${response.status} ${errorText}`);
  }

  const rows = (await response.json()) as SupabaseContactRow[];
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.filter((row) => row.kind === "contact");
}

export async function createContactInquiry(form: ContactInquiryForm) {
  const config = getSupabaseConfig();

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_CONTACTS_TABLE}`, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      {
        id: randomUUID(),
        kind: "contact",
        created_at: new Date().toISOString(),
        form,
      },
    ]),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase contact insert failed: ${response.status} ${errorText}`);
  }

  const rows = (await response.json()) as SupabaseContactRow[];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Supabase contact insert returned empty result.");
  }

  return mapRowToRecord(rows[0]);
}

export async function getContactInquiryById(id: string) {
  const row = await selectContactRowById(id);
  if (!row) return null;
  return mapRowToRecord(row);
}

export async function listContactInquiries(limit = 100) {
  const rows = await selectContactRows(limit);
  return rows.map(mapRowToRecord);
}

export async function updateContactInquiryReply(inquiryId: string, input: UpdateContactInquiryReplyInput) {
  const config = getSupabaseConfig();

  const payload: Record<string, unknown> = {};

  if (input.lastRepliedAt !== undefined) payload.last_replied_at = normalizeIsoInput(input.lastRepliedAt);
  if (input.lastReplySubject !== undefined) payload.last_reply_subject = input.lastReplySubject;
  if (input.lastReplyPreview !== undefined) payload.last_reply_preview = input.lastReplyPreview;

  if (Object.keys(payload).length === 0) {
    throw new Error("No contact reply fields to update.");
  }

  const query = new URLSearchParams({
    id: `eq.${inquiryId}`,
    select: REPLY_SELECT_COLUMNS,
  });

  const response = await fetch(`${config.url}/rest/v1/${SUPABASE_CONTACTS_TABLE}?${query.toString()}`, {
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
    if (shouldRetryWithoutReplyColumns(response.status, errorText)) {
      throw new Error("Contact 문의 답변 이력 컬럼이 아직 생성되지 않았습니다. Supabase SQL migration을 먼저 실행해 주세요.");
    }
    throw new Error(`Supabase contact update failed: ${response.status} ${errorText}`);
  }

  const rows = (await response.json()) as SupabaseContactRow[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return mapRowToRecord(rows[0]);
}
