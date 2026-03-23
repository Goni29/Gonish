-- Gonish contact inquiry store
-- Run this in Supabase SQL editor.

create table if not exists public.contact_inquiries (
  id uuid primary key,
  kind text not null default 'contact',
  created_at timestamptz not null default now(),
  form jsonb not null
);

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at desc);

alter table public.contact_inquiries enable row level security;

-- Optional: keep anonymous users blocked. Service role can still read/write.
revoke all on table public.contact_inquiries from anon, authenticated;
