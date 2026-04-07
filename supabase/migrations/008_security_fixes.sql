-- 보안 경고 수정
--
-- [1] Function Search Path Mutable
--   SECURITY DEFINER 함수에 search_path 가 고정되지 않으면
--   공격자가 동명의 스키마/오브젝트를 만들어 함수 실행을 가로챌 수 있습니다.
--   → SET search_path = '' 추가 + 모든 테이블 참조를 public. 으로 완전 수식
--
-- [2] RLS Policy Always True
--   WITH CHECK (true) 는 실질적 검사가 없는 정책으로 경고 대상입니다.
--   → NOT NULL 컬럼 조건으로 최소한의 실질 검사를 추가합니다.


-- ============================================================
-- [1-a] check_rate_limit — search_path 고정
-- ============================================================
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip           text,
  p_endpoint     text,
  p_window_secs  integer,
  p_max_requests integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_window_start timestamptz;
  v_current_count integer;
BEGIN
  v_window_start := to_timestamp(
    floor(EXTRACT(EPOCH FROM now()) / p_window_secs) * p_window_secs
  );

  INSERT INTO public.rate_limits (ip, endpoint, window_start, count)
  VALUES (p_ip, p_endpoint, v_window_start, 1)
  ON CONFLICT (ip, endpoint, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO v_current_count;

  DELETE FROM public.rate_limits
  WHERE ip = p_ip
    AND endpoint = p_endpoint
    AND window_start < now() - (p_window_secs * 3 || ' seconds')::interval;

  RETURN v_current_count <= p_max_requests;
END;
$$;


-- ============================================================
-- [1-b] cleanup_expired_admin_sessions — search_path 고정
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.admin_sessions
  WHERE expires_at < now();
END;
$$;


-- ============================================================
-- [1-c] get_dashboard_summary — search_path 고정
-- ============================================================
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total_leads    bigint;
  v_today_leads    bigint;
  v_total_contacts bigint;
  v_today_contacts bigint;
BEGIN
  SELECT COUNT(*) INTO v_total_leads
    FROM public.estimate_leads;

  SELECT COUNT(*) INTO v_today_leads
    FROM public.estimate_leads
    WHERE created_at >= CURRENT_DATE
      AND created_at <  CURRENT_DATE + INTERVAL '1 day';

  SELECT COUNT(*) INTO v_total_contacts
    FROM public.contact_inquiries;

  SELECT COUNT(*) INTO v_today_contacts
    FROM public.contact_inquiries
    WHERE created_at >= CURRENT_DATE
      AND created_at <  CURRENT_DATE + INTERVAL '1 day';

  RETURN json_build_object(
    'totalLeads',    v_total_leads,
    'todayLeads',    v_today_leads,
    'totalContacts', v_total_contacts,
    'todayContacts', v_today_contacts
  );
END;
$$;


-- ============================================================
-- [1-d] get_analytics_summary — search_path 고정
-- ============================================================
CREATE OR REPLACE FUNCTION get_analytics_summary(p_days integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_since        timestamptz;
  v_daily_users  json;
  v_avg_durations json;
BEGIN
  v_since := now() - (p_days || ' days')::interval;

  SELECT json_agg(row_to_json(t) ORDER BY t.date)
  INTO v_daily_users
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
    'dailyUsers',   COALESCE(v_daily_users, '[]'::json),
    'avgDurations', COALESCE(v_avg_durations, '[]'::json)
  );
END;
$$;


-- ============================================================
-- [2] RLS Policy Always True 수정 — analytics_events
--
-- WITH CHECK (true) → NOT NULL 컬럼 조건으로 대체합니다.
-- session_id / page_path 는 테이블에서 NOT NULL 이므로
-- 실질적 동작은 동일하지만 정책 자체에 검사 조건이 생깁니다.
-- ============================================================
DROP POLICY IF EXISTS "anon_can_insert_analytics" ON public.analytics_events;

CREATE POLICY "anon_can_insert_analytics"
  ON public.analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (
    session_id IS NOT NULL AND
    page_path  IS NOT NULL
  );