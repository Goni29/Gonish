-- 대시보드 집계 함수
--
-- 목적:
--   현재 대시보드는 estimate_leads 500건 + contact_inquiries 500건을
--   전체 row 로 불러온 뒤 JS 에서 카운트합니다.
--   데이터가 늘수록 네트워크 전송량과 서버 처리 비용이 선형 증가합니다.
--
--   이 함수는 DB 서버에서 집계를 완료하고 숫자 4개만 반환합니다.
--   네트워크 페이로드: 500건 × 2 row set → JSON 객체 1개
--
-- 반환값:
--   {
--     "totalLeads":    <number>,  -- estimate_leads 전체 건수
--     "todayLeads":    <number>,  -- 오늘 접수된 estimate_leads
--     "totalContacts": <number>,  -- contact_inquiries 전체 건수
--     "todayContacts": <number>   -- 오늘 접수된 contact_inquiries
--   }
--
-- SECURITY DEFINER:
--   함수 소유자(postgres) 권한으로 실행됩니다.
--   호출자의 RLS 정책에 관계없이 집계가 가능합니다.
--   반환값은 집계 숫자만이므로 개별 데이터 노출 위험 없습니다.

CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_leads    bigint;
  v_today_leads    bigint;
  v_total_contacts bigint;
  v_today_contacts bigint;
BEGIN
  SELECT COUNT(*) INTO v_total_leads
    FROM estimate_leads;

  SELECT COUNT(*) INTO v_today_leads
    FROM estimate_leads
    WHERE created_at >= CURRENT_DATE
      AND created_at <  CURRENT_DATE + INTERVAL '1 day';

  SELECT COUNT(*) INTO v_total_contacts
    FROM contact_inquiries;

  SELECT COUNT(*) INTO v_today_contacts
    FROM contact_inquiries
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
-- get_analytics_summary(p_days)
--
-- 대시보드의 analytics 집계도 DB 에서 처리합니다.
-- fetchRecentEvents() 가 최대 5000행을 가져오던 것을
-- 집계 결과 N행으로 대체합니다.
--
-- 반환값: 일별 유니크 세션 수 + 평균 체류시간 배열
-- ============================================================
CREATE OR REPLACE FUNCTION get_analytics_summary(p_days integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_since timestamptz;
  v_daily_users json;
  v_avg_durations json;
BEGIN
  v_since := now() - (p_days || ' days')::interval;

  -- 일별 유니크 세션 수
  SELECT json_agg(row_to_json(t) ORDER BY t.date)
  INTO v_daily_users
  FROM (
    SELECT
      created_at::date::text AS date,
      COUNT(DISTINCT session_id) AS count
    FROM analytics_events
    WHERE created_at >= v_since
    GROUP BY created_at::date
  ) t;

  -- 일별 세션 평균 체류시간
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
      FROM analytics_events
      WHERE created_at >= v_since
      GROUP BY created_at::date, session_id
    ) session_sums
    GROUP BY created_at::date
  ) t;

  RETURN json_build_object(
    'dailyUsers',    COALESCE(v_daily_users, '[]'::json),
    'avgDurations',  COALESCE(v_avg_durations, '[]'::json)
  );
END;
$$;
