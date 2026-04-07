-- analytics_events 테이블 Row Level Security 설정
--
-- 목적:
--   외부 클라이언트가 anon key 로 분석 데이터를 조회하는 것을 차단합니다.
--   INSERT 는 anon 에게 허용하여 향후 클라이언트 직접 전송 방식으로
--   전환 시에도 별도 마이그레이션 없이 대응할 수 있습니다.
--
-- 접근 정책 요약:
--   anon role        → INSERT 만 허용 (SELECT/UPDATE/DELETE 차단)
--   authenticated    → 정책 없음 (차단)
--   service_role     → RLS 우회 (모든 작업 허용, 대시보드 조회용)

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있을 경우 충돌 방지를 위해 삭제 후 재생성
DROP POLICY IF EXISTS "anon_can_insert_analytics" ON analytics_events;

CREATE POLICY "anon_can_insert_analytics"
  ON analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- SELECT / UPDATE / DELETE 는 명시적 정책 없음 = anon 완전 차단
-- 대시보드(service_role)는 RLS 를 자동 우회하므로 별도 정책 불필요


-- ============================================================
-- 입력값 길이를 DB 레벨에서도 제한합니다.
-- (API 레이어 검증이 우회되더라도 과도한 데이터 저장을 방지)
--
-- NOT VALID 옵션:
--   이미 저장된 기존 row 는 검사하지 않고,
--   이 마이그레이션 이후의 INSERT / UPDATE 에만 제약을 적용합니다.
--   기존 데이터가 범위를 벗어나더라도 마이그레이션이 실패하지 않습니다.
-- ============================================================

-- session_id: 최대 64자
ALTER TABLE analytics_events
  ADD CONSTRAINT chk_session_id_length
  CHECK (char_length(session_id) <= 64) NOT VALID;

-- page_path: '/' 로 시작, 최대 200자
ALTER TABLE analytics_events
  ADD CONSTRAINT chk_page_path_format
  CHECK (
    page_path ~ '^/' AND
    char_length(page_path) <= 200
  ) NOT VALID;

-- duration_ms: 0 이상, 24시간(86400000ms) 이하
ALTER TABLE analytics_events
  ADD CONSTRAINT chk_duration_ms_range
  CHECK (duration_ms >= 0 AND duration_ms <= 86400000) NOT VALID;

-- exited_to: 최대 200자
ALTER TABLE analytics_events
  ADD CONSTRAINT chk_exited_to_length
  CHECK (char_length(exited_to) <= 200) NOT VALID;

-- user_agent: 최대 512자
ALTER TABLE analytics_events
  ADD CONSTRAINT chk_user_agent_length
  CHECK (char_length(user_agent) <= 512) NOT VALID;
