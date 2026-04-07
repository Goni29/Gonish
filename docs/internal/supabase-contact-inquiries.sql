-- Gonish contact inquiry store
-- Run this in Supabase SQL editor.

create table if not exists public.contact_inquiries (
  id uuid primary key,
  kind text not null default 'contact',
  created_at timestamptz not null default now(),
  form jsonb not null,
  last_replied_at timestamptz,
  last_reply_subject text not null default '',
  last_reply_preview text not null default ''
);

alter table public.contact_inquiries
  add column if not exists last_replied_at timestamptz,
  add column if not exists last_reply_subject text not null default '',
  add column if not exists last_reply_preview text not null default '';

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at desc);

create index if not exists contact_inquiries_last_replied_at_idx
  on public.contact_inquiries (last_replied_at desc);

alter table public.contact_inquiries enable row level security;

-- Optional: keep anonymous users blocked. Service role can still read/write.
revoke all on table public.contact_inquiries from anon, authenticated;
