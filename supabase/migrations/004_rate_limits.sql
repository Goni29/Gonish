-- Rate limiting table
-- API 엔드포인트별 IP 요청 횟수를 추적합니다.
-- check_rate_limit() RPC로 원자적 확인+증가를 수행합니다.

CREATE TABLE IF NOT EXISTS rate_limits (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ip           text        NOT NULL,
  endpoint     text        NOT NULL,
  window_start timestamptz NOT NULL,
  count        integer     NOT NULL DEFAULT 1,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ON CONFLICT (ip, endpoint, window_start) DO UPDATE 에 필요한 UNIQUE INDEX
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_unique_window
  ON rate_limits (ip, endpoint, window_start);

-- 만료된 레코드 정리용 인덱스
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start
  ON rate_limits (window_start);

-- 외부(anon/authenticated) 접근 차단 — service role 만 사용
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- RLS 정책 없음 = public 접근 완전 차단
-- (service role 은 RLS 를 항상 우회)


-- ============================================================
-- check_rate_limit(p_ip, p_endpoint, p_window_secs, p_max)
--
-- 역할: 원자적으로 카운터를 확인·증가한 뒤 허용 여부를 반환합니다.
--   true  → 요청 허용 (현재 count <= p_max)
--   false → 요청 거부 (rate limit 초과)
--
-- 고정 윈도우 방식 (Fixed Window):
--   window_start = floor(epoch / p_window_secs) * p_window_secs
--   동일 윈도우 내 모든 요청이 같은 row 를 공유합니다.
--
-- 원자성:
--   INSERT ... ON CONFLICT DO UPDATE 는 단일 SQL 문이라
--   별도 트랜잭션 없이도 race condition 이 없습니다.
-- ============================================================
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip           text,
  p_endpoint     text,
  p_window_secs  integer,
  p_max_requests integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_window_start timestamptz;
  v_current_count integer;
BEGIN
  -- 현재 시각을 윈도우 경계로 내림 (epoch 기반 고정 윈도우)
  v_window_start := to_timestamp(
    floor(EXTRACT(EPOCH FROM now()) / p_window_secs) * p_window_secs
  );

  -- 원자적 upsert: 신규 윈도우면 INSERT, 기존 윈도우면 count++
  INSERT INTO rate_limits (ip, endpoint, window_start, count)
  VALUES (p_ip, p_endpoint, v_window_start, 1)
  ON CONFLICT (ip, endpoint, window_start)
  DO UPDATE SET count = rate_limits.count + 1
  RETURNING count INTO v_current_count;

  -- 만료된 레코드 정리 (현재 IP·엔드포인트 한정, 부담 최소화)
  DELETE FROM rate_limits
  WHERE ip = p_ip
    AND endpoint = p_endpoint
    AND window_start < now() - (p_window_secs * 3 || ' seconds')::interval;

  -- 한도 이하이면 true(허용), 초과이면 false(차단)
  RETURN v_current_count <= p_max_requests;
END;
$$;
