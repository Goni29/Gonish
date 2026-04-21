# Gonish 내부 가격 기준표

이 문서는 `내부용`입니다.  
최신 기준 소스는 `src/sections/estimate/EstimateConversation.tsx`와
`docs/internal/gonish-estimate-calculator.html`입니다.

## 1. 기본 원칙

- 모든 금액 단위는 `만원` 기준입니다.
- 공개 기본 시작가는 `10만 원`입니다.
- 아무 선택이 없을 때 기본 노출 범위는 `10만 ~ 20만 원`입니다.
- 빠른 일정(`fast`)은 `5만 원` 고정 가산으로 반영합니다.
- 도메인/호스팅 선택은 가격 가산 없이 배포 준비 상태만 기록합니다.
- 공개 금액은 `포트폴리오 사용 + 리뷰 제공` 두 조건을 전제로 한 할인가입니다.
- 두 조건 중 빠지는 항목은 `항목당 +5만 원`씩 일반 견적으로 재산정합니다.

## 2. 옵션별 단가

### 프로젝트 유형

| ID | 라벨 | 가격 | 점수 |
| --- | --- | ---: | ---: |
| `landing` | 원페이지 / 랜딩 페이지 | 10 | 1 |
| `corporate-site` | 기업형 / 소개형 사이트 | 10 | 2 |
| `member-site` | 회원 기능 포함 사이트 | 18 | 3 |
| `webapp` | 관리자 / 업무형 웹앱 | 26 | 4 |
| `unsure` | 아직 잘 모르겠어요 | 10 | 2 |

### 추가 화면 구성

| ID | 라벨 | 가격 | 점수 |
| --- | --- | ---: | ---: |
| `included` | 기본 화면 구성으로 시작 | 0 | 0 |
| `static-page` | 추가 정적 페이지 | 10 | 1 |
| `form-page` | 추가 입력 페이지 | 10 | 1 |
| `list-detail` | 리스트 + 상세 화면 세트 | 20 | 2 |
| `dashboard` | 로그인 후 개인화 화면 | 10 | 2 |
| `multi-add` | 추가 화면 3개 이상 예정 | 30 | 3 |
| `unknown` | 화면 수를 아직 모르겠어요 | 10 | 2 |

### 자료 준비도

| ID | 라벨 | 가격 | 점수 |
| --- | --- | ---: | ---: |
| `ready` | 자료와 방향이 거의 정리되어 있어요 | 0 | 0 |
| `partial` | 일부만 정리되어 있어요 | 5 | 1 |
| `need-help` | 아직 상담이 많이 필요해요 | 12 | 2 |

### 일정

| ID | 라벨 | 가격 | 퍼센트 | 점수 |
| --- | --- | ---: | ---: | ---: |
| `relaxed` | 여유 있게 진행하고 싶어요 | 0 | 0% | 0 |
| `normal` | 평균적인 일정으로 진행하고 싶어요 | 0 | 0% | 1 |
| `fast` | 조금 더 빠르게 진행하고 싶어요 | 5 | 고정 가산 | 2 |

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
| `member-auth` | 회원가입 / 로그인 | 8 | 2 |
| `social-login` | 소셜 로그인 | 8 | 1 |
| `role-permission` | 사용자 역할 / 권한 분리 | 8 | 2 |
| `admin-dashboard` | 관리자 대시보드 | 10 | 2 |
| `admin-module` | 관리자용 업무 관리 모듈 | 10 | 2 |
| `admin-permission` | 관리자 권한 세분화 | 8 | 1 |
| `stats-report` | 고급 통계 / 리포트 | 10 | 2 |
| `crud-board` | 게시판 / 콘텐츠 관리 | 10 | 3 |
| `payment` | 온라인 결제 | 15 | 3 |
| `subscription` | 정기 결제 / 구독 | 23 | 4 |
| `map` | 기본 지도 표시 | 5 | 1 |
| `notification-email` | 자동 이메일 발송 | 5 | 1 |
| `notification-sms` | 문자 / 알림 발송 | 8 | 1 |
| `external-api` | 기타 외부 API 연동 1종 | 10 | 2 |

### 할인가 적용 조건

| ID | 라벨 | 미적용 시 가산 |
| --- | --- | ---: |
| `portfolio` | 완성작 포트폴리오 사용 가능해요 | +5 |
| `review` | 작업 후 짧은 리뷰 제공 가능해요 | +5 |

## 3. 계산식

1. 소계(긴급 전):
`subtotal_before_urgent = project_type + page_scope + readiness + features_total`
2. 빠른 일정 가산:
`schedule_price = IF(schedule=fast, 5, 0)`
3. 예상 시작가(min):
`min_price = CEILING(MAX(0, subtotal_before_urgent + schedule_price + condition_adjustment + manual_adjustment), 5)`
4. 상단 버퍼:
- `buffer_base = IF(min<30,10, IF(min<80,15, IF(min<150,20,30)))`
- `feature_buffer = IF(feature_count>=6,20, IF(feature_count>=3,10,0))`
- `scope_buffer = IF(scope=multi-add,10, IF(scope in [dashboard,list-detail],5,0))`
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
