-- Analytics events table for dashboard metrics
-- Tracks page views, session duration, and exit paths

create table if not exists analytics_events (
  id            uuid primary key default gen_random_uuid(),
  session_id    text not null,
  page_path     text not null,
  referrer      text default '',
  entered_at    timestamptz not null default now(),
  duration_ms   integer default 0,
  exited_to     text default '',
  user_agent    text default '',
  created_at    timestamptz not null default now()
);

-- Index for daily user count queries
create index if not exists idx_analytics_session_date
  on analytics_events (created_at, session_id);

-- Index for page path queries (exit path analysis)
create index if not exists idx_analytics_page_path
  on analytics_events (page_path, created_at);
