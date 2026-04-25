-- Analytics visitor/session refinement
--
-- 목적:
--   - 로그인 기능이 없는 Gonish 웹앱에서 개인 식별이 아니라
--     "동일 브라우저 환경의 익명 방문자 추정" 기준으로 분석합니다.
--   - visitor_id 는 localStorage 에 저장되는 랜덤 ID이며 이름/이메일/IP 등
--     직접 식별 정보와 결합하지 않습니다.
--   - session_id 는 sessionStorage 에 저장되는 방문 세션 ID입니다.
--
-- 보관 권장:
--   - 원본 analytics_events: 90일
--   - 월/일 단위 집계 데이터: 12개월
--   실제 삭제/집계 배치가 필요해지면 별도 scheduled job 에서 관리합니다.

ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS visitor_id text;

CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_created
  ON public.analytics_events (visitor_id, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_created
  ON public.analytics_events (session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_page_created
  ON public.analytics_events (page_path, created_at);

ALTER TABLE public.analytics_events
  ADD CONSTRAINT chk_visitor_id_length
  CHECK (visitor_id IS NULL OR char_length(visitor_id) <= 64) NOT VALID;

COMMENT ON COLUMN public.analytics_events.visitor_id IS
  'Anonymous random ID for estimating repeat visits from the same browser storage. Not a direct person identifier.';

COMMENT ON COLUMN public.analytics_events.user_agent IS
  'Compact browser/os/device summary for analytics. Avoid long-term retention of raw user-agent strings; recommended raw event retention is 90 days.';

-- 기존 RLS 구조 유지:
-- anon 은 INSERT 만 허용하고, SELECT/UPDATE/DELETE 는 정책 없음으로 차단합니다.
-- 실제 앱 API 는 service_role 로 insert/update 하므로 기존 구조와 호환됩니다.
DROP POLICY IF EXISTS "anon_can_insert_analytics" ON public.analytics_events;

CREATE POLICY "anon_can_insert_analytics"
  ON public.analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (
    session_id IS NOT NULL AND
    page_path IS NOT NULL AND
    (visitor_id IS NULL OR char_length(visitor_id) <= 64)
  );

-- Dashboard RPC: visitor_id 가 있는 신규 데이터는 익명 방문자 기준,
-- visitor_id 가 없는 과거 데이터는 session_id 기준으로 fallback 계산합니다.
CREATE OR REPLACE FUNCTION get_analytics_summary(p_days integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_since timestamptz;
  v_daily_visitors json;
  v_daily_sessions json;
  v_avg_durations json;
  v_fallback_used boolean;
BEGIN
  v_since := now() - (p_days || ' days')::interval;

  SELECT EXISTS (
    SELECT 1
    FROM public.analytics_events
    WHERE created_at >= v_since
      AND visitor_id IS NULL
  )
  INTO v_fallback_used;

  SELECT json_agg(row_to_json(t) ORDER BY t.date)
  INTO v_daily_visitors
  FROM (
    SELECT
      created_at::date::text AS date,
      COUNT(DISTINCT COALESCE(visitor_id, session_id)) AS count,
      BOOL_OR(visitor_id IS NULL) AS "fallbackUsed"
    FROM public.analytics_events
    WHERE created_at >= v_since
    GROUP BY created_at::date
  ) t;

  SELECT json_agg(row_to_json(t) ORDER BY t.date)
  INTO v_daily_sessions
  FROM (
    SELECT
      created_at::date::text AS date,
      COUNT(DISTINCT session_id) AS count
    FROM public.analytics_events
    WHERE created_at >= v_since
    GROUP BY created_at::date
  ) t;

  SELECT json_agg(row_to_json(t) ORDER BY t.date)
  INTO v_avg_durations
  FROM (
    SELECT
      created_at::date::text AS date,
      ROUND(AVG(total_ms))::bigint AS "avgMs"
    FROM (
      SELECT
        created_at::date,
        session_id,
        SUM(duration_ms) AS total_ms
      FROM public.analytics_events
      WHERE created_at >= v_since
      GROUP BY created_at::date, session_id
    ) session_sums
    GROUP BY created_at::date
  ) t;

  RETURN json_build_object(
    'dailyVisitors', COALESCE(v_daily_visitors, '[]'::json),
    'dailySessions', COALESCE(v_daily_sessions, '[]'::json),
    'avgDurations', COALESCE(v_avg_durations, '[]'::json),
    'fallbackUsed', COALESCE(v_fallback_used, false)
  );
END;
$$;
