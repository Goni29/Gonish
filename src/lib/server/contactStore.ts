import { randomUUID } from "node:crypto";
import type { ContactInquiryForm, ContactInquiryRecord } from "@/lib/inquiry";

const SUPABASE_CONTACTS_TABLE = process.env.SUPABASE_CONTACTS_TABLE || "contact_inquiries";

type SupabaseContactRow = {
  id: string;
  kind: "contact";
  created_at: string;
  form: ContactInquiryForm;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  return { serviceRoleKey, url };
}

function mapRowToRecord(row: SupabaseContactRow): ContactInquiryRecord {
  return {
    id: row.id,
    kind: "contact",
    createdAt: row.created_at,
    form: row.form,
  };
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

export async function listContactInquiries(limit = 100) {
  const config = getSupabaseConfig();
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));

  const query = new URLSearchParams({
    select: "id,kind,created_at,form",
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
    throw new Error(`Supabase contact list failed: ${response.status} ${errorText}`);
  }

  const rows = (await response.json()) as SupabaseContactRow[];
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.filter((row) => row.kind === "contact").map(mapRowToRecord);
}
