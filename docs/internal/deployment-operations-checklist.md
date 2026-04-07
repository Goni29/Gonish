# Gonish 배포 운영 체크리스트

이 프로젝트는 문의/견적 운영을 **Supabase + Resend + Admin Dashboard** 기준으로 동작합니다.

## 1) 환경변수

배포 환경에 아래 값을 모두 설정합니다.

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CONTACT_RECEIVE_EMAIL`
- `NEXT_PUBLIC_SITE_URL` (메일 로고/링크에 사용할 공개 도메인, 예: `https://gonish.kr`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_LEADS_TABLE` (기본값: `estimate_leads`)
- `SUPABASE_CONTACTS_TABLE` (기본값: `contact_inquiries`)
- `ADMIN_DASHBOARD_KEY`

## 2) Supabase 테이블 생성

Supabase SQL Editor에서 아래 파일을 실행합니다.

- `docs/internal/supabase-estimate-leads.sql`
- `docs/internal/supabase-contact-inquiries.sql`

`estimate_leads`를 이미 운영 중이라면 `supabase-estimate-leads.sql`을 다시 실행해서 파이프라인 컬럼(상태/담당자/다음 액션일/메모/아카이브)을 추가하세요.
`contact_inquiries`를 이미 운영 중이라면 `supabase-contact-inquiries.sql`을 다시 실행해서 답변 발송 이력 컬럼을 추가하세요.

## 3) 운영 플로우 점검

1. `/estimate`에서 테스트 문의 1건 전송
2. 수신 메일에서 `계약서 초안 열기` 링크 동작 확인
3. `/admin/login` 접속 후 관리자 로그인
4. `/admin/leads`에서 방금 문의가 조회되는지 확인
5. `/admin/leads`에서 상태/담당자/메모를 수정 후 저장 반영 확인
6. 계약서 페이지에서 `PDF 저장 / 인쇄` 동작 확인

## 4) 장애 포인트

- 문의 전송 실패: `RESEND_*`, `CONTACT_RECEIVE_EMAIL` 확인
- 저장 실패: `SUPABASE_*` 확인
- 관리자 로그인 불가: `ADMIN_DASHBOARD_KEY` 확인

## 5) 보안 권장

- `SUPABASE_SERVICE_ROLE_KEY`는 서버 환경에만 설정
- `ADMIN_DASHBOARD_KEY`는 충분히 긴 랜덤 문자열 사용
- 주기적 키 교체 및 배포 로그 모니터링 권장
