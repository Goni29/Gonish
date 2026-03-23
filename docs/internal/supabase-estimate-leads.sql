-- Gonish estimate lead store
-- Run this in Supabase SQL editor.

create table if not exists public.estimate_leads (
  id uuid primary key,
  kind text not null default 'estimate',
  created_at timestamptz not null default now(),
  view_key text not null,
  email_data jsonb not null,
  contract_draft jsonb not null,
  pipeline_status text not null default 'new',
  assigned_to text not null default '',
  next_action_at timestamptz,
  last_contacted_at timestamptz,
  internal_note text not null default '',
  close_reason text not null default '',
  archived boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.estimate_leads
  add column if not exists pipeline_status text not null default 'new',
  add column if not exists assigned_to text not null default '',
  add column if not exists next_action_at timestamptz,
  add column if not exists last_contacted_at timestamptz,
  add column if not exists internal_note text not null default '',
  add column if not exists close_reason text not null default '',
  add column if not exists archived boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists estimate_leads_view_key_idx
  on public.estimate_leads (view_key);

create index if not exists estimate_leads_created_at_idx
  on public.estimate_leads (created_at desc);

create index if not exists estimate_leads_pipeline_status_idx
  on public.estimate_leads (pipeline_status);

create index if not exists estimate_leads_archived_idx
  on public.estimate_leads (archived);

create index if not exists estimate_leads_next_action_at_idx
  on public.estimate_leads (next_action_at asc);

create index if not exists estimate_leads_updated_at_idx
  on public.estimate_leads (updated_at desc);

alter table public.estimate_leads enable row level security;

-- Optional: keep anonymous users blocked. Service role can still read/write.
revoke all on table public.estimate_leads from anon, authenticated;
