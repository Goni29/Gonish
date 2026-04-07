-- admin_sessions 테이블
--
-- 목적:
--   관리자 세션을 stateful 하게 관리합니다.
--   기존 방식(ADMIN_DASHBOARD_KEY 의 SHA-256 을 쿠키에 저장)은
--   키가 유출되면 세션값을 즉시 재계산할 수 있고 서버에서 무효화할 수 없는
--   구조적 한계가 있습니다.
--
--   변경 후:
--   - 로그인 시 cryptographically random 토큰 생성
--   - 토큰의 SHA-256 해시만 DB에 저장 (원본 노출 방지)
--   - 쿠키에는 원본 토큰 저장
--   - 검증 시 쿠키 토큰 → 해시 → DB 조회
--   - 서버에서 언제든지 세션 무효화(DELETE) 가능
--
-- 보안 속성:
--   token_hash: 저장된 해시만으로는 원본 토큰을 역산 불가
--   expires_at: 만료 시각을 DB에서도 강제
--   ip_hint:    감사(audit) 목적의 IP 기록 (인증에는 사용하지 않음)

CREATE TABLE IF NOT EXISTS admin_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash   text        NOT NULL UNIQUE,  -- SHA-256(raw_token) hex
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  last_used_at timestamptz,
  ip_hint      text        DEFAULT ''        -- 감사용, 인증에 미사용
);

-- 토큰 조회 핵심 경로 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_sessions_token_hash
  ON admin_sessions (token_hash);

-- 만료된 세션 정리 쿼리용 인덱스
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at
  ON admin_sessions (expires_at);

-- 외부 접근 완전 차단
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
-- 명시적 정책 없음 = anon/authenticated 모두 차단
-- service_role(서버)만 RLS 우회하여 접근 가능


-- ============================================================
-- cleanup_expired_admin_sessions()
--
-- 만료된 세션을 정리합니다.
-- 로그인 시 자동 호출되어 오래된 레코드를 제거합니다.
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM admin_sessions
  WHERE expires_at < now();
END;
$$;
