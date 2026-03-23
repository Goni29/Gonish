# Gonish 내부 가격 기준표

이 문서는 `내부용`입니다.  
최신 기준 소스는 `src/sections/estimate/EstimateConversation.tsx`와
`docs/internal/gonish-estimate-calculator.html`입니다.

## 1. 기본 원칙

- 모든 금액 단위는 `만원` 기준입니다.
- 공개 기본 시작가는 `60만 원`입니다.
- 아무 선택이 없을 때 기본 노출 범위는 `60만 ~ 95만 원`입니다.
- 빠른 일정(`fast`)은 소계 기준 `15%`를 `5만원 단위 올림` 가산합니다.
- 도메인/호스팅 선택은 가격 가산 없이 배포 준비 상태만 기록합니다.
- 할인은 항목당 `-5만 원`이며, 계산은 옵션 선택 기준으로 자동 반영됩니다.

## 2. 옵션별 단가

### 프로젝트 유형

| ID | 라벨 | 가격 | 점수 |
| --- | --- | ---: | ---: |
| `landing` | 원페이지 / 랜딩 페이지 | 60 | 1 |
| `corporate-site` | 기업형 / 소개형 사이트 | 119 | 2 |
| `member-site` | 회원 기능 포함 사이트 | 169 | 3 |
| `webapp` | 관리자 / 업무형 웹앱 | 249 | 4 |
| `unsure` | 아직 잘 모르겠어요 | 119 | 2 |

### 추가 화면 구성

| ID | 라벨 | 가격 | 점수 |
| --- | --- | ---: | ---: |
| `included` | 기본 화면 구성으로 시작 | 0 | 0 |
| `static-page` | 추가 정적 페이지 | 12 | 1 |
| `form-page` | 추가 입력 페이지 | 22 | 1 |
| `list-detail` | 리스트 + 상세 화면 세트 | 48 | 2 |
| `dashboard` | 로그인 후 개인화 화면 | 42 | 2 |
| `multi-add` | 추가 화면 3개 이상 예정 | 84 | 3 |
| `unknown` | 화면 수를 아직 모르겠어요 | 24 | 2 |

### 자료 준비도

| ID | 라벨 | 가격 | 점수 |
| --- | --- | ---: | ---: |
| `ready` | 자료와 방향이 거의 정리되어 있어요 | 0 | 0 |
| `partial` | 일부만 정리되어 있어요 | 10 | 1 |
| `need-help` | 아직 상담이 많이 필요해요 | 25 | 2 |

### 일정

| ID | 라벨 | 가격 | 퍼센트 | 점수 |
| --- | --- | ---: | ---: | ---: |
| `relaxed` | 여유 있게 진행하고 싶어요 | 0 | 0% | 0 |
| `normal` | 평균적인 일정으로 진행하고 싶어요 | 0 | 0% | 1 |
| `fast` | 조금 더 빠르게 진행하고 싶어요 | 0 | 15% | 2 |

### 도메인/호스팅 (가격 영향 없음)

| ID | 라벨 |
| --- | --- |
| `both-ready` | 둘 다 있어요 |
| `domain-only` | 주소(도메인)만 있어요 |
| `hosting-only` | 올릴 공간(호스팅)만 있어요 |
| `none` | 둘 다 아직 없어요 |
| `unsure` | 무슨 말인지 잘 모르겠어요 |

### 기능

| ID | 라벨 | 가격 | 점수 |
| --- | --- | ---: | ---: |
| `member-auth` | 회원가입 / 로그인 | 42 | 2 |
| `social-login` | 소셜 로그인 | 26 | 1 |
| `role-permission` | 사용자 역할 / 권한 분리 | 38 | 2 |
| `admin-dashboard` | 관리자 대시보드 | 59 | 2 |
| `admin-module` | 관리자용 업무 관리 모듈 | 48 | 2 |
| `admin-permission` | 관리자 권한 세분화 | 36 | 1 |
| `stats-report` | 고급 통계 / 리포트 | 54 | 2 |
| `crud-board` | 게시판 / 콘텐츠 관리 | 69 | 3 |
| `payment` | 온라인 결제 | 89 | 3 |
| `subscription` | 정기 결제 / 구독 | 129 | 4 |
| `map` | 기본 지도 표시 | 32 | 1 |
| `notification-email` | 자동 이메일 발송 | 16 | 1 |
| `notification-sms` | 문자 / 알림 발송 | 29 | 1 |
| `external-api` | 기타 외부 API 연동 1종 | 48 | 2 |

### 혜택(할인)

| ID | 라벨 | 할인 |
| --- | --- | ---: |
| `portfolio` | 포트폴리오 소개에 동의할게요 | -5 |
| `review` | 작업 후 짧은 후기를 남길게요 | -5 |

## 3. 계산식

1. 소계(긴급 전):
`subtotal_before_urgent = project_type + page_scope + readiness + features_total`
2. 빠른 일정 가산:
`urgent_surcharge = IF(schedule=fast, CEILING(subtotal_before_urgent * 0.15, 5), 0)`
3. 예상 시작가(min):
`min_price = CEILING(MAX(0, subtotal_before_urgent + urgent_surcharge + schedule_price + discount_total + manual_adjustment), 5)`
4. 상단 버퍼:
- `buffer_base = IF(min<120,20, IF(min<240,30, IF(min<400,40,55)))`
- `feature_buffer = IF(feature_count>=6,30, IF(feature_count>=3,15,0))`
- `scope_buffer = IF(scope=multi-add,15, IF(scope in [dashboard,list-detail],10,0))`
5. 예상 범위(max):
`max_price = CEILING(min_price + buffer_base + feature_buffer + scope_buffer, 5)`

## 4. 복잡도 가이드

복잡도 점수:
`score = project_type_score + page_scope_score + readiness_score + schedule_score + sum(feature_scores)`

| 점수 구간 | 라벨 | 설명 |
| --- | --- | --- |
| `<= 5` | 랜딩·소개 중심 | 핵심 소개 화면 중심의 가벼운 범위 |
| `<= 13` | 기업형·브랜드형 | 일반 비즈니스 홈페이지 범위 |
| `<= 22` | 회원·운영 기능 포함 | 회원/운영 기능이 포함된 범위 |
| `23+` | 관리자·업무형 웹앱 | 운영팀 실사용 중심의 대형 범위 |

## 5. 견적서/계약서 자동반영 메모

- 최종 견적서 초안 총액(`exactQuoteLabel`)은 `min_price` 기준으로 채웁니다.
- 선금/잔금은 `50:50`이며 선금은 `5만원 단위 올림`으로 계산합니다.
- 계약서에는 선택한 도메인/호스팅 상태와 관련 안내 문구를 함께 반영합니다.
