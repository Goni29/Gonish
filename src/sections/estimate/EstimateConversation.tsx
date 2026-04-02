"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDrag } from "@use-gesture/react";
import GonishCharacter from "@/components/GonishCharacter";
import BrandButton from "@/components/ui/BrandButton";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import type { EstimateContractDraft, EstimateEmailData, InquiryResponse } from "@/lib/inquiry";
import { isValidReplyContact, REPLY_CONTACT_VALIDATION_MESSAGE } from "@/lib/replyContact";

type Option = {
  description: string;
  id: string;
  label: string;
  percent?: number;
  price: number;
  score: number;
};

type EstimateForm = {
  brand: string;
  domainHosting: string;
  discounts: string[];
  features: string[];
  goal: string;
  name: string;
  note: string;
  pageScope: string;
  projectType: string;
  readiness: string;
  reply: string;
  schedule: string;
};

type SingleChoiceField = "domainHosting" | "pageScope" | "projectType" | "readiness" | "schedule";
type NextStepField = SingleChoiceField | "discounts" | "features";

const ease = [0.22, 1, 0.36, 1] as const;
const defaultCharacterReply = "어려운 말 없이, 필요한 것들을 하나씩 편하게 정리해볼게요.";
const defaultEstimateStatusMessage = "선택하신 내용을 바탕으로 더 정확한 범위와 일정, 최종 견적을 함께 정리해드릴게요.";
const estimateSubmitSuccessMessage = "견적이 전송되었어요! 최대한 빨리 확인하고 회신드릴게요!";
const inquirySubmitFailureMessage = "문의 전송이 실패했어요. 잠시 후 다시 시도해주세요.";
const MIN_START_PRICE = 60;
const FAST_TRACK_PERCENT = 15;

const projectTypeOptions: Option[] = [
  {
    id: "landing",
    label: "원페이지 / 랜딩 페이지",
    description: "이벤트, 광고, 브랜드 소개처럼 한 페이지 중심으로 구성되는 사이트예요.",
    price: 60,
    score: 1,
  },
  {
    id: "corporate-site",
    label: "기업형 / 소개형 사이트",
    description: "회사 소개, 서비스 소개, 포트폴리오, 문의 페이지 등 일반적인 다페이지 사이트예요.",
    price: 119,
    score: 2,
  },
  {
    id: "member-site",
    label: "회원 기능 포함 사이트",
    description: "회원가입, 로그인, 마이페이지처럼 사용자 계정 기능이 필요한 사이트예요.",
    price: 169,
    score: 3,
  },
  {
    id: "webapp",
    label: "관리자 / 업무형 웹앱",
    description: "운영 화면, 데이터 관리, 업무 처리 기능이 포함되는 웹앱이에요.",
    price: 249,
    score: 4,
  },
  {
    id: "unsure",
    label: "아직 잘 모르겠어요",
    description: "필요한 범위가 아직 정리되지 않았다면 상담 과정에서 함께 정리해드릴게요.",
    price: 119,
    score: 2,
  },
];

const pageScopeOptions: Option[] = [
  {
    id: "included",
    label: "기본 화면 구성으로 시작",
    description: "선택한 프로젝트 유형의 기본 페이지/화면 구성으로 먼저 시작하는 방식이에요.",
    price: 0,
    score: 0,
  },
  {
    id: "static-page",
    label: "추가 정적 페이지",
    description: "회사 소개, 서비스 소개, 브랜드 소개처럼 정보 전달 중심의 일반 페이지예요.",
    price: 12,
    score: 1,
  },
  {
    id: "form-page",
    label: "추가 입력 페이지",
    description: "문의, 신청, 예약, 접수처럼 사용자가 정보를 입력하는 화면이에요.",
    price: 22,
    score: 1,
  },
  {
    id: "list-detail",
    label: "리스트 + 상세 화면 세트",
    description: "공지사항, 포트폴리오, 게시글, 상품처럼 목록과 상세가 함께 필요한 화면 구성이에요.",
    price: 48,
    score: 2,
  },
  {
    id: "dashboard",
    label: "로그인 후 개인화 화면",
    description: "마이페이지, 내 정보, 활동 내역처럼 로그인 이후 사용자 전용 화면이에요.",
    price: 42,
    score: 2,
  },
  {
    id: "multi-add",
    label: "추가 화면 3개 이상 예정",
    description: "기본 범위 외에 필요한 화면이 여러 개라 전체 구성이 더 커질 가능성이 있는 경우예요.",
    price: 84,
    score: 3,
  },
  {
    id: "unknown",
    label: "화면 수를 아직 모르겠어요",
    description: "필요한 화면 수와 구성이 아직 명확하지 않은 경우예요.",
    price: 24,
    score: 2,
  },
];

const readinessOptions: Option[] = [
  {
    id: "ready",
    label: "자료와 방향이 거의 정리되어 있어요",
    description: "문구, 이미지, 참고 사이트, 필요한 화면 구성이 어느 정도 준비된 상태예요.",
    price: 0,
    score: 0,
  },
  {
    id: "partial",
    label: "일부만 정리되어 있어요",
    description: "기본 방향은 있지만 문구나 화면 구성은 함께 정리할 필요가 있어요.",
    price: 10,
    score: 1,
  },
  {
    id: "need-help",
    label: "아직 상담이 많이 필요해요",
    description: "필요한 기능이나 구성 방향이 아직 명확하지 않아 상담을 통해 함께 정리해야 해요.",
    price: 25,
    score: 2,
  },
];

const scheduleOptions: Option[] = [
  { id: "relaxed", label: "여유 있게 진행하고 싶어요", description: "일반적인 일정 안에서 차분히 진행해도 괜찮아요.", price: 0, score: 0 },
  { id: "normal", label: "평균적인 일정으로 진행하고 싶어요", description: "보통 2~4주 내외의 일정으로 생각하고 있어요.", price: 0, score: 1 },
  {
    id: "fast",
    label: "조금 더 빠르게 진행하고 싶어요",
    description: "일정 압축이 필요한 편이라 우선순위 조정이 필요할 수 있어요.",
    price: 0,
    percent: FAST_TRACK_PERCENT,
    score: 2,
  },
];

const domainHostingOptions: Option[] = [
  { id: "both-ready", label: "둘 다 있어요", description: "사이트 주소(도메인)와 올릴 공간(호스팅)이 이미 있어서 그대로 연결하면 돼요.", price: 0, score: 0 },
  { id: "domain-only", label: "주소(도메인)만 있어요", description: "예를 들면 mybrand.com 같은 주소는 있는데, 사이트를 올릴 공간은 아직 없어요.", price: 0, score: 0 },
  { id: "hosting-only", label: "올릴 공간(호스팅)만 있어요", description: "사이트를 올릴 계정이나 서버는 있는데, 연결할 주소는 아직 없어요.", price: 0, score: 0 },
  { id: "none", label: "둘 다 아직 없어요", description: "괜찮아요. 새로 추천받고 같이 준비하는 방향으로 진행할 수 있어요.", price: 0, score: 0 },
  { id: "unsure", label: "무슨 말인지 잘 모르겠어요", description: "전혀 괜찮아요. 상담 때 쉬운 말로 설명드리고 필요한 것만 같이 정리해 드릴게요.", price: 0, score: 0 },
];

const featureOptions: Option[] = [
  {
    id: "member-auth",
    label: "회원가입 / 로그인",
    description: "이메일 또는 기본 계정 방식으로 회원가입과 로그인이 가능한 기능이에요.",
    price: 42,
    score: 2,
  },
  { id: "social-login", label: "소셜 로그인", description: "카카오, 구글, 네이버 등 외부 계정으로 로그인하는 기능이에요.", price: 26, score: 1 },
  { id: "role-permission", label: "사용자 역할 / 권한 분리", description: "일반회원, 파트너, 매니저처럼 사용자 유형별 접근 범위를 나누는 기능이에요.", price: 38, score: 2 },
  { id: "admin-dashboard", label: "관리자 대시보드", description: "관리자 첫 화면에서 전체 현황을 요약해서 보는 화면이에요. 요약 카드, 최근 항목, 간단한 수치 확인이 포함될 수 있어요.", price: 59, score: 2 },
  { id: "admin-module", label: "관리자용 업무 관리 모듈", description: "회원 관리, 주문 관리, 예약 관리, 문의 관리처럼 운영자가 업무 데이터를 처리하는 기능 1개예요.", price: 48, score: 2 },
  { id: "admin-permission", label: "관리자 권한 세분화", description: "운영자 계정마다 볼 수 있는 메뉴와 수정 가능한 범위를 다르게 설정하는 기능이에요.", price: 36, score: 1 },
  { id: "stats-report", label: "고급 통계 / 리포트", description: "기간별 통계, 필터, 차트, 다운로드처럼 운영 데이터를 더 자세히 분석하는 기능이에요.", price: 54, score: 2 },
  { id: "crud-board", label: "게시판 / 콘텐츠 관리", description: "공지사항, 블로그, 포트폴리오처럼 콘텐츠를 등록·수정·삭제하는 기능이에요.", price: 69, score: 3 },
  { id: "payment", label: "온라인 결제", description: "일반적인 1회성 결제를 사이트에서 받을 수 있어요.", price: 89, score: 3 },
  { id: "subscription", label: "정기 결제 / 구독", description: "매달 또는 일정 주기로 자동 결제가 필요한 경우예요.", price: 129, score: 4 },
  { id: "map", label: "기본 지도 표시", description: "매장이나 회사 위치처럼 고정된 장소를 사이트에 보여주는 기능이에요.", price: 32, score: 1 },
  { id: "notification-email", label: "자동 이메일 발송", description: "문의 접수, 신청 완료, 알림 메일처럼 자동으로 이메일을 보내는 기능이에요.", price: 16, score: 1 },
  { id: "notification-sms", label: "문자 / 알림 발송", description: "신청 완료, 상태 변경, 예약 안내 등을 문자나 알림으로 보내는 기능이에요.", price: 29, score: 1 },
  { id: "external-api", label: "기타 외부 API 연동 1종", description: "지도, 이메일, 문자 외에 다른 외부 서비스와 연동이 필요한 경우예요.", price: 48, score: 2 },
];

type FeatureGroup = {
  id: string;
  title: string;
  optionIds: string[];
};

const featureGroups: FeatureGroup[] = [
  { id: "member-user", title: "회원 / 사용자 기능", optionIds: ["member-auth", "social-login", "role-permission"] },
  { id: "admin-ops", title: "운영 / 관리자 기능", optionIds: ["admin-dashboard", "admin-module", "admin-permission", "stats-report"] },
  { id: "content-data", title: "콘텐츠 / 데이터 기능", optionIds: ["crud-board"] },
  { id: "payment-biz", title: "결제 / 비즈니스 기능", optionIds: ["payment", "subscription"] },
  { id: "external-integration", title: "외부 서비스 연동", optionIds: ["map", "notification-email", "notification-sms", "external-api"] },
];

const featureReplyById: Record<string, string> = {
  "member-auth": "회원가입과 로그인은 가입 방식과 필요한 기본 정보만 먼저 정해도 범위를 꽤 정확하게 잡을 수 있어요.",
  "social-login": "소셜 로그인은 어떤 플랫폼을 붙일지와 기존 계정 연동 방식까지 같이 보면 구현 범위가 선명해져요.",
  "role-permission": "권한 분리는 누가 무엇을 볼 수 있는지부터 정하면 화면과 데이터 범위가 깔끔하게 정리돼요.",
  "admin-dashboard": "관리자 대시보드는 첫 화면에서 꼭 봐야 할 지표만 먼저 추리면 훨씬 실용적으로 설계할 수 있어요.",
  "admin-module": "업무 관리 모듈은 어떤 데이터를 등록하고 처리해야 하는지 흐름부터 잡으면 견적이 안정적으로 나와요.",
  "admin-permission": "관리자 권한 세분화는 역할별 접근 범위를 먼저 나누면 운영 구조가 훨씬 명확해져요.",
  "stats-report": "통계와 리포트는 어떤 지표를 기간별로 볼지부터 정하면 필요한 데이터 구조를 빠르게 잡을 수 있어요.",
  "crud-board": "콘텐츠와 데이터 기능은 등록, 수정, 삭제 흐름과 목록·상세 화면을 같이 보면 범위를 정확하게 정리할 수 있어요.",
  payment: "온라인 결제는 결제 성공, 실패, 취소 이후 흐름까지 같이 정하면 실제 운영에 맞게 설계할 수 있어요.",
  subscription: "정기 결제는 결제 주기, 해지, 재시도 같은 운영 규칙까지 함께 잡아야 견적이 정확해져요.",
  map: "지도 연동은 고정 위치 표시인지, 여러 지점 안내인지에 따라 구현 범위가 꽤 달라져요.",
  "notification-email": "자동 이메일은 어떤 시점에 누구에게 보낼지 정하면 템플릿과 연동 범위를 깔끔하게 나눌 수 있어요.",
  "notification-sms": "문자와 알림 발송은 발송 조건과 실패 처리 기준까지 먼저 정해두면 운영이 훨씬 안정적이에요.",
  "external-api": "외부 API 연동은 연결 대상, 인증 방식, 실패 처리까지 먼저 정리하면 리스크를 많이 줄일 수 있어요.",
};

const discountOptions: Option[] = [
  { id: "portfolio", label: "포트폴리오 소개에 동의할게요", description: "완성 후 일부 화면을 포트폴리오 예시로 소개해도 괜찮아요.", price: -5, score: 0 },
  { id: "review", label: "작업 후 짧은 후기를 남길게요", description: "작업이 끝난 뒤 간단한 후기 작성에 참여할 수 있어요.", price: -5, score: 0 },
];

const initialForm: EstimateForm = {
  brand: "",
  domainHosting: "",
  discounts: [],
  features: [],
  goal: "",
  name: "",
  note: "",
  pageScope: "",
  projectType: "",
  readiness: "",
  reply: "",
  schedule: "",
};

function findOption(options: Option[], id: string) {
  return options.find((option) => option.id === id);
}

function getEstimateBand(score: number) {
  if (score <= 5) {
    return {
      label: "랜딩·소개 중심",
      explanation: "핵심 소개 화면 위주로 시작하는 비교적 가벼운 범위예요.",
    };
  }

  if (score <= 13) {
    return {
      label: "기업형·브랜드형",
      explanation: "서비스 소개와 운영 기본 기능이 함께 들어가는 가장 일반적인 비즈니스 홈페이지 범위예요.",
    };
  }

  if (score <= 22) {
    return {
      label: "회원·운영 기능 포함",
      explanation: "회원, 운영, 콘텐츠 관리 같은 실제 동작 기능이 함께 들어가는 단계예요.",
    };
  }

  return {
    label: "관리자·업무형 웹앱",
    explanation: "운영팀이 매일 쓰는 관리 화면과 사용자 기능이 함께 들어가는 큰 범위예요.",
  };
}

function roundToFive(value: number) {
  return Math.ceil(value / 5) * 5;
}

function formatPriceRange(min: number, max: number) {
  return `${min}만 ~ ${max}만 원`;
}

function formatPrice(value: number) {
  return `${value}만 원`;
}

function getTimeline(scheduleKey: string, minPrice: number) {
  if (scheduleKey === "fast") {
    return "약 2~4주 (우선순위 압축 기준)";
  }

  if (minPrice < 120) {
    return "약 3~5주";
  }

  if (minPrice < 240) {
    return "약 4~7주";
  }

  if (minPrice < 400) {
    return "약 6~10주";
  }

  return "약 10주 이상";
}

function getDomainHostingNote(domainHostingKey: string) {
  if (domainHostingKey === "both-ready") {
    return "기존 도메인과 호스팅 정보를 확인해 연결 기준으로 진행합니다.";
  }

  if (domainHostingKey === "domain-only") {
    return "도메인은 보유 중이며, 호스팅(서버) 환경은 별도 준비가 필요합니다.";
  }

  if (domainHostingKey === "hosting-only") {
    return "호스팅은 보유 중이며, 도메인 구매/연결 작업은 별도 준비가 필요합니다.";
  }

  if (domainHostingKey === "none") {
    return "도메인/호스팅 신규 구매 및 세팅 비용은 별도입니다.";
  }

  if (domainHostingKey === "unsure") {
    return "도메인/호스팅 준비 상태가 미정이어서 상담 시 우선 확인이 필요합니다.";
  }

  return "도메인/호스팅 준비 상태는 상담에서 함께 확인합니다.";
}

function buildScopeText(params: {
  projectTypeLabel: string;
  pageScopeLabel: string;
  featureLabels: string[];
  domainHostingLabel: string;
  goal: string;
}) {
  const featureText = params.featureLabels.length > 0 ? params.featureLabels.join(", ") : "선택한 추가 기능 없음";
  const goalText = params.goal.trim() ? ` / 목표: ${params.goal.trim()}` : "";

  return `${params.projectTypeLabel} / ${params.pageScopeLabel} / 기능: ${featureText} / 도메인·호스팅: ${params.domainHostingLabel}${goalText}`;
}

function buildRevisionPolicy(scheduleKey: string) {
  if (scheduleKey === "fast") {
    return "빠른 일정 기준으로 범위를 우선 고정한 뒤 시안 기준 2회 수정 포함. 큰 방향 변경은 별도 견적으로 재안내합니다.";
  }

  return "시안 기준 2회 수정 포함. 큰 방향 변경이나 추가 기능 요청은 별도 견적으로 재안내합니다.";
}

function getProjectTypeStep(form: EstimateForm) {
  if (form.projectType === "landing") {
    return "랜딩 페이지는 방문자가 처음 5초 안에 이해할 수 있도록 핵심 메시지와 행동 버튼을 먼저 정하면 좋아요.";
  }

  if (form.projectType === "corporate-site") {
    return "기업형/소개형은 회사 소개, 서비스 소개, 포트폴리오, 문의 흐름으로 잡으면 방문자 입장에서 가장 이해하기 쉬워요.";
  }

  if (form.projectType === "member-site") {
    return "회원 기능이 들어가면 로그인 전/후에 화면이 어떻게 달라지는지부터 정리하면 견적 범위가 훨씬 정확해져요.";
  }

  if (form.projectType === "webapp") {
    return "업무형 웹앱은 운영자와 사용자 역할을 먼저 나누면 전체 화면 구조와 기능 범위를 훨씬 쉽게 잡을 수 있어요.";
  }

  if (form.projectType === "unsure") {
    return "유형이 아직 애매해도 괜찮아요. 가장 먼저 해결하고 싶은 문제 1개만 정하면 상담에서 빠르게 방향을 잡을 수 있어요.";
  }

  return "어떤 사이트를 만들고 싶은지 먼저 정하면 전체 견적 흐름이 훨씬 쉬워져요.";
}

function getPageScopeStep(form: EstimateForm) {
  if (form.pageScope === "included") {
    return "기본 화면 구성으로 시작하면 1차 오픈 범위를 안정적으로 잡기 좋아요.";
  }

  if (form.pageScope === "static-page") {
    return "정적 페이지는 정보 전달 중심 화면이라 콘텐츠만 정리되면 비교적 빠르게 범위를 확장할 수 있어요.";
  }

  if (form.pageScope === "form-page") {
    return "입력 페이지는 어떤 항목을 받을지와 제출 후 안내만 먼저 정하면 화면 범위를 또렷하게 잡을 수 있어요.";
  }

  if (form.pageScope === "list-detail") {
    return "리스트+상세 세트는 화면 구조 범위예요. 화면에서 다룰 항목 종류를 먼저 정하면 이후 기능 설계가 쉬워져요.";
  }

  if (form.pageScope === "dashboard") {
    return "로그인 후 개인화 화면은 사용자별로 무엇이 달라 보여야 하는지부터 정하면 범위를 정확히 잡기 쉬워요.";
  }

  if (form.pageScope === "multi-add") {
    return "추가 화면이 3개 이상이면 1차 오픈 화면과 2차 확장 화면을 나눠서 일정과 예산을 관리하는 방식이 안정적이에요.";
  }

  if (form.pageScope === "unknown") {
    return "화면 수가 아직 미정이라면 꼭 필요한 화면 2~3개만 먼저 확정해도 초기 견적 정확도가 크게 올라가요.";
  }

  return "추가 화면은 화면 수와 구성 범위를 정하는 단계예요. 실제 동작 기능은 다음 항목에서 선택하면 돼요.";
}

function getFeatureStepById(featureId: string) {
  return featureReplyById[featureId];
}

function getFeatureStep(form: EstimateForm) {
  const featureIds = form.features;

  if (featureIds.length >= 7) {
    return "기능 항목이 많은 프로젝트예요. 핵심 기능 1차 오픈과 확장 기능 2차 오픈으로 나누면 일정과 견적이 훨씬 현실적으로 정리돼요.";
  }

  if (featureIds.length >= 4) {
    return "기능이 여러 개 들어가면 우선순위를 나눠 핵심 기능부터 열고, 고도화 기능을 다음 단계로 분리하면 견적이 선명해져요.";
  }

  if (featureIds.includes("payment") || featureIds.includes("subscription")) {
    return "결제 기능은 결제 실패/취소/환불 흐름까지 함께 정리해 두면 실제 운영에서 훨씬 안정적으로 사용할 수 있어요.";
  }

  if (
    featureIds.includes("admin-module") ||
    featureIds.includes("admin-dashboard") ||
    featureIds.includes("admin-permission") ||
    featureIds.includes("stats-report")
  ) {
    return "관리자 영역은 대시보드(요약), 업무 모듈(처리), 권한(접근 범위), 리포트(분석)처럼 역할을 나눠 정리하면 중복 없이 설계할 수 있어요.";
  }

  if (featureIds.includes("crud-board")) {
    return "게시판/콘텐츠 관리는 등록·수정·삭제 로직이 핵심이에요. 리스트+상세 화면 구성과는 별개로 동작 기능 범위로 보면 좋아요.";
  }

  if (
    featureIds.includes("external-api") ||
    featureIds.includes("notification-email") ||
    featureIds.includes("notification-sms") ||
    featureIds.includes("map")
  ) {
    return "외부 연동 기능은 서비스별 인증 방식과 발송/연결 실패 시 처리 방법을 미리 정하면 운영이 훨씬 편해져요.";
  }

  if (featureIds.includes("member-auth") || featureIds.includes("social-login") || featureIds.includes("role-permission")) {
    return "회원/권한 기능은 어떤 사용자 유형이 있는지 먼저 정해두면 화면과 기능 설계를 훨씬 정확하게 시작할 수 있어요.";
  }

  return undefined;
}

function getReadinessStep(form: EstimateForm) {
  if (form.readiness === "ready") {
    return "자료와 방향이 거의 준비된 상태라면 화면별 배치만 정리해도 바로 설계 초안으로 넘어갈 수 있어요.";
  }

  if (form.readiness === "partial") {
    return "일부만 정리된 상태라면 소개 문구 우선순위와 핵심 화면 구성부터 함께 맞추면 빠르게 진행할 수 있어요.";
  }

  if (form.readiness === "need-help") {
    return "상담이 많이 필요한 단계여도 괜찮아요. 필요한 자료 목록과 기능 우선순위를 먼저 같이 정리해드릴게요.";
  }

  return undefined;
}

function getDomainHostingStep(form: EstimateForm) {
  if (form.domainHosting === "both-ready") {
    return "이미 가진 도메인과 호스팅이 있다면, 접속 정보만 확인해서 그대로 연결 가능한지 먼저 봐드릴게요.";
  }

  if (form.domainHosting === "domain-only") {
    return "도메인은 있으니, 사이트를 올릴 공간(호스팅)만 예산과 관리 방식에 맞춰 정하면 돼요.";
  }

  if (form.domainHosting === "hosting-only") {
    return "호스팅은 있으니, 연결할 사이트 주소(도메인)만 정하면 배포 흐름을 빠르게 잡을 수 있어요.";
  }

  if (form.domainHosting === "none") {
    return "도메인과 호스팅이 모두 없다면 예산과 관리 난이도에 맞는 조합부터 추천해 드릴게요.";
  }

  if (form.domainHosting === "unsure") {
    return "도메인과 호스팅이 낯설어도 괜찮아요. 지금은 사이트 주소가 이미 있는지만 떠올려도 충분해요.";
  }

  return undefined;
}

function getScheduleStep(form: EstimateForm) {
  if (form.schedule === "relaxed") {
    return "여유 있는 일정은 기획과 화면 디테일까지 충분히 조율하면서 안정적으로 진행하기 좋아요.";
  }

  if (form.schedule === "normal") {
    return "평균 일정은 핵심 범위를 먼저 오픈하고 세부 고도화를 다음 단계로 분리할 때 가장 안정적이에요.";
  }

  if (form.schedule === "fast") {
    return "빠른 일정은 우선순위 조정이 필요해요. 꼭 필요한 화면과 기능부터 먼저 여는 방식이 가장 안전해요.";
  }

  return undefined;
}

function getDiscountStep(form: EstimateForm) {
  const hasPortfolio = form.discounts.includes("portfolio");
  const hasReview = form.discounts.includes("review");

  if (hasPortfolio && hasReview) {
    return "두 혜택 모두 반영했어요. 마지막으로 원하는 결과만 적어주시면 상담 준비가 거의 끝나요.";
  }

  if (hasPortfolio) {
    return "포트폴리오 소개 동의가 반영됐어요. 후기도 가능하면 함께 체크해 주세요.";
  }

  if (hasReview) {
    return "후기 참여 동의가 반영됐어요. 포트폴리오 소개도 가능하면 함께 체크해 주세요.";
  }

  return "혜택은 가능한 항목만 체크하시면 되고, 선택하지 않으셔도 괜찮아요.";
}

function getNextStep(form: EstimateForm, field: NextStepField) {
  if (field === "projectType") {
    return getProjectTypeStep(form);
  }

  if (field === "pageScope") {
    return getPageScopeStep(form);
  }

  if (field === "features") {
    return getFeatureStep(form) ?? "추가 기능은 화면 위에서 실제로 동작하는 로직/권한/연동 범위를 정하는 단계예요.";
  }

  if (field === "readiness") {
    return getReadinessStep(form) ?? "자료 준비 상태를 알면 작업 순서와 일정 안내가 훨씬 쉬워져요.";
  }

  if (field === "schedule") {
    return getScheduleStep(form) ?? "희망 일정을 정하면 어떤 순서로 진행할지 더 또렷하게 안내할 수 있어요.";
  }

  if (field === "domainHosting") {
    return getDomainHostingStep(form) ?? "도메인과 호스팅 준비 여부를 알면 배포 방식까지 함께 정리할 수 있어요.";
  }

  if (field === "discounts") {
    return getDiscountStep(form);
  }

  return "지금 선택한 내용을 바탕으로 다음 단계를 바로 안내해 드릴게요.";
}

function getCharacterReply(form: EstimateForm, field: NextStepField | null) {
  if (!field) {
    return defaultCharacterReply;
  }

  if (field === "features") {
    const latestSelectedFeatureId = form.features.at(-1);
    if (latestSelectedFeatureId) {
      return getFeatureStepById(latestSelectedFeatureId) ?? getNextStep(form, field);
    }
  }

  return getNextStep(form, field);
}

export default function EstimateConversation() {
  const [form, setForm] = useState<EstimateForm>(initialForm);
  const [isSmiling, setIsSmiling] = useState(false);
  const [lastTouchedField, setLastTouchedField] = useState<NextStepField | null>(null);
  const smilingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sending, setSending] = useState(false);
  const statusMessage = defaultEstimateStatusMessage;
  const [submitCharacterReply, setSubmitCharacterReply] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  const bindCharacterDrag = useDrag(
    ({ offset: [x, y], event }) => {
      event?.preventDefault();
      setDragPos({ x, y });
    },
    {
      filterTaps: true,
      from: () => [dragPos.x, dragPos.y],
      pointer: { touch: true },
    },
  );

  const triggerSmile = useCallback(() => {
    setIsSmiling(true);
    if (smilingTimer.current) clearTimeout(smilingTimer.current);
    smilingTimer.current = setTimeout(() => setIsSmiling(false), 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (smilingTimer.current) clearTimeout(smilingTimer.current);
    };
  }, []);

  const selectedType = useMemo(() => findOption(projectTypeOptions, form.projectType), [form.projectType]);
  const selectedPageScope = useMemo(() => findOption(pageScopeOptions, form.pageScope), [form.pageScope]);
  const selectedReadiness = useMemo(() => findOption(readinessOptions, form.readiness), [form.readiness]);
  const selectedSchedule = useMemo(() => findOption(scheduleOptions, form.schedule), [form.schedule]);
  const selectedDomainHosting = useMemo(() => findOption(domainHostingOptions, form.domainHosting), [form.domainHosting]);
  const selectedFeatures = useMemo(() => featureOptions.filter((option) => form.features.includes(option.id)), [form.features]);
  const selectedDiscounts = useMemo(() => discountOptions.filter((option) => form.discounts.includes(option.id)), [form.discounts]);

  const estimateBand = useMemo(() => {
    const score =
      (selectedType?.score ?? 0) +
      (selectedPageScope?.score ?? 0) +
      (selectedReadiness?.score ?? 0) +
      (selectedSchedule?.score ?? 0) +
      selectedFeatures.reduce((sum, option) => sum + option.score, 0);

    return getEstimateBand(score);
  }, [selectedFeatures, selectedPageScope, selectedReadiness, selectedSchedule, selectedType]);

  const priceEstimate = useMemo(() => {
    const hasSelection =
      Boolean(form.projectType) ||
      Boolean(form.pageScope) ||
      Boolean(form.readiness) ||
      Boolean(form.schedule) ||
      form.features.length > 0 ||
      form.discounts.length > 0;

    if (!hasSelection) {
      return {
        basePrice: MIN_START_PRICE,
        min: MIN_START_PRICE,
        max: 95,
        urgentSurcharge: 0,
        label: formatPriceRange(MIN_START_PRICE, 95),
        description: "기본 시작가예요. 항목을 선택할수록 선택 반영 기준가가 더 정확해져요.",
      };
    }

    const subtotalBeforeUrgent =
      (selectedType?.price ?? MIN_START_PRICE) +
      (selectedPageScope?.price ?? 0) +
      (selectedReadiness?.price ?? 0) +
      selectedFeatures.reduce((sum, option) => sum + option.price, 0);

    const urgentPercent = selectedSchedule?.percent ?? 0;
    const urgentSurcharge = urgentPercent > 0 ? roundToFive(subtotalBeforeUrgent * (urgentPercent / 100)) : 0;

    const discountedBase =
      subtotalBeforeUrgent +
      urgentSurcharge +
      (selectedSchedule?.price ?? 0) +
      selectedDiscounts.reduce((sum, option) => sum + option.price, 0);

    const min = roundToFive(Math.max(0, discountedBase));
    const bufferBase = min < 120 ? 20 : min < 240 ? 30 : min < 400 ? 40 : 55;
    const featureBuffer = selectedFeatures.length >= 6 ? 30 : selectedFeatures.length >= 3 ? 15 : 0;
    const largeScopeBuffer =
      form.pageScope === "multi-add" ? 15 : form.pageScope === "dashboard" || form.pageScope === "list-detail" ? 10 : 0;
    const max = roundToFive(min + bufferBase + featureBuffer + largeScopeBuffer);

    return {
      basePrice: min,
      min,
      max,
      urgentSurcharge,
      label: formatPriceRange(min, max),
      description:
        urgentSurcharge > 0
          ? "빠른 일정 반영 기준가예요."
          : selectedDiscounts.length > 0
            ? "혜택까지 반영한 선택 기준가예요."
            : "선택하신 범위를 기준으로 계산한 예상 시작가예요.",
    };
  }, [
    form.discounts.length,
    form.features.length,
    form.pageScope,
    form.projectType,
    form.readiness,
    form.schedule,
    selectedDiscounts,
    selectedFeatures,
    selectedPageScope,
    selectedReadiness,
    selectedSchedule,
    selectedType,
  ]);

  const conversationReply = useMemo(
    () => submitCharacterReply ?? getCharacterReply(form, lastTouchedField),
    [form, lastTouchedField, submitCharacterReply],
  );

  const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setSubmitCharacterReply(null);
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSingleChoice = (field: SingleChoiceField, value: string) => {
    if (form[field] === value) return;
    setSubmitCharacterReply(null);
    setForm((current) => ({ ...current, [field]: value }));
    setLastTouchedField(field);
    triggerSmile();
  };

  const toggleFeature = (value: string) => {
    const removing = form.features.includes(value);
    setSubmitCharacterReply(null);
    setForm((current) => ({
      ...current,
      features: removing ? current.features.filter((item) => item !== value) : [...current.features, value],
    }));
    setLastTouchedField("features");
    if (!removing) triggerSmile();
  };

  const toggleDiscount = (value: string) => {
    const removing = form.discounts.includes(value);
    setSubmitCharacterReply(null);
    setForm((current) => ({
      ...current,
      discounts: removing ? current.discounts.filter((item) => item !== value) : [...current.discounts, value],
    }));
    setLastTouchedField("discounts");
    if (!removing) triggerSmile();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.reply.trim()) {
      setSubmitCharacterReply("연락처만 남겨주셔도 괜찮아요. 지금 정리된 범위를 바탕으로 상담을 이어갈게요.");
      return;
    }

    if (!isValidReplyContact(form.reply)) {
      setSubmitCharacterReply(REPLY_CONTACT_VALIDATION_MESSAGE);
      return;
    }

    setSending(true);

    try {
      const featureLabels = selectedFeatures.map((feature) => feature.label);
      const discountLabels = selectedDiscounts.map((discount) => discount.label);
      const domainHostingNote = getDomainHostingNote(form.domainHosting);
      const timeline = getTimeline(form.schedule, priceEstimate.basePrice);
      const projectTypeLabel = selectedType?.label || "미정";
      const pageScopeLabel = selectedPageScope?.label || "미정";
      const readinessLabel = selectedReadiness?.label || "미정";
      const scheduleLabel = selectedSchedule?.label || "미정";
      const domainHostingLabel = selectedDomainHosting?.label || "미정";
      const quoteLabel = formatPrice(priceEstimate.basePrice);
      const half = roundToFive(priceEstimate.basePrice / 2);
      const contractExtra = [
        discountLabels.length > 0 ? `적용 혜택: ${discountLabels.join(", ")}` : "",
        domainHostingNote,
        form.note.trim() ? `추가 메모: ${form.note.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const emailData: EstimateEmailData = {
        name: form.name,
        brand: form.brand,
        reply: form.reply,
        projectType: projectTypeLabel,
        pageScope: pageScopeLabel,
        features: featureLabels.length > 0 ? featureLabels.join(", ") : "-",
        readiness: readinessLabel,
        schedule: scheduleLabel,
        domainHosting: domainHostingLabel,
        discounts: discountLabels.length > 0 ? discountLabels.join(", ") : "-",
        basePrice: formatPrice(priceEstimate.basePrice),
        priceRange: priceEstimate.label,
        goal: form.goal,
        note: form.note,
      };

      const contractDraft: EstimateContractDraft = {
        projectTitle: form.brand || form.name ? `${form.brand || form.name} 프로젝트 견적` : "프로젝트 견적",
        clientName: form.name || form.brand || "",
        clientContact: form.reply,
        projectTypeLabel,
        pageScopeLabel,
        featureLabels,
        readinessLabel,
        scheduleLabel,
        domainHostingLabel,
        domainHostingNote,
        discountLabels,
        estimateBandLabel: estimateBand.label,
        estimateBandDescription: estimateBand.explanation,
        basePriceLabel: emailData.basePrice,
        priceRangeLabel: emailData.priceRange,
        scopeText: buildScopeText({
          projectTypeLabel,
          pageScopeLabel,
          featureLabels,
          domainHostingLabel,
          goal: form.goal,
        }),
        timeline,
        quoteLabel,
        depositLabel: `50% / ${formatPrice(half)}`,
        balanceLabel: `50% / ${formatPrice(priceEstimate.basePrice - half)}`,
        revisionPolicy: buildRevisionPolicy(form.schedule),
        contractExtra,
        goal: form.goal,
        note: form.note,
      };

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "estimate",
          emailData,
          contractDraft,
        }),
      });

      const result = (await response.json()) as InquiryResponse;
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "견적 문의 전송에 실패했어요.");
      }

      triggerSmile();
      setSubmitCharacterReply(estimateSubmitSuccessMessage);
    } catch {
      setSubmitCharacterReply(inquirySubmitFailureMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="section-space relative">
      {/* Cosmic background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-x-clip">
        <div className="absolute left-[-8rem] top-28 h-[18rem] w-[18rem] rounded-full bg-brand/[0.05] blur-[110px]" />
        <div className="absolute right-[-10rem] top-24 h-[20rem] w-[20rem] rounded-full bg-brand/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-[min(1400px,calc(100vw-2rem))] sm:w-[min(1400px,calc(100vw-3rem))] lg:w-[min(1480px,calc(100vw-5rem))]">
        <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
          {/* ── Left: Form ── */}
          <form onSubmit={handleSubmit}>
            {/* Intro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease }}
              className="mb-16 space-y-4"
            >
              <p className="eyebrow">Gonish says</p>
              <p className="font-display text-[clamp(2rem,3vw,2.8rem)] leading-[1] text-ink">
                정직한 커스텀 제작 기준으로 안내드릴게요.
              </p>
              <p className="max-w-3xl text-sm leading-7 text-ink-muted md:text-base">
                몇 가지 질문에 답해주시면 필요한 범위와 예상 금액을 함께 정리해드릴게요.
                모든 견적은 템플릿 재활용이 아닌 커스텀 제작 기준이며, 최종 금액은 기능 범위와 난이도에 따라 달라질 수 있어요.
              </p>
            </motion.div>

            {/* Questions — orbital timeline */}
            <div className="relative pl-10 sm:pl-12">
              {/* Vertical orbit line */}
              <div className="absolute bottom-0 left-[4px] top-0 w-px bg-gradient-to-b from-brand/25 via-brand/12 to-transparent" />

              <div className="space-y-16">
                <QuestionSection
                  number="01"
                  question="어떤 사이트를 생각하고 계신가요?"
                  helper="복잡한 개발 용어 대신, 지금 필요한 결과에 가장 가까운 유형을 선택해 주세요."
                >
                  <div className="grid gap-2 md:grid-cols-2">
                    {projectTypeOptions.map((option) => (
                      <ChoiceButton
                        key={option.id}
                        selected={form.projectType === option.id}
                        label={option.label}
                        description={option.description}
                        onClick={() => handleSingleChoice("projectType", option.id)}
                      />
                    ))}
                  </div>
                </QuestionSection>

                <QuestionSection
                  number="02"
                  question="기본 범위 외에 추가할 화면이 있나요?"
                  helper="추가 화면은 페이지/화면 구성 범위를 반영한 비용입니다. 실제 동작 기능이나 외부 연동은 아래 기능 항목에서 별도로 선택해 주세요."
                >
                  <div className="grid gap-2 md:grid-cols-2">
                    {pageScopeOptions.map((option) => (
                      <ChoiceButton
                        key={option.id}
                        selected={form.pageScope === option.id}
                        label={option.label}
                        description={option.description}
                        onClick={() => handleSingleChoice("pageScope", option.id)}
                      />
                    ))}
                  </div>
                </QuestionSection>

                <QuestionSection
                  number="03"
                  question="추가로 필요한 기능이 있나요?"
                  helper="추가 기능은 화면 위에서 실제로 동작하는 로직, 권한, 결제, 외부 연동 등을 의미해요."
                >
                  <div className="space-y-5">
                    {featureGroups.map((group) => (
                      <div key={group.id} className="space-y-2.5">
                        <p className="pl-1 text-[10px] uppercase tracking-[0.28em] text-brand/80">{group.title}</p>
                        <div className="grid gap-2 md:grid-cols-2">
                          {group.optionIds.map((optionId) => {
                            const option = findOption(featureOptions, optionId);
                            if (!option) return null;

                            return (
                              <ChoiceButton
                                key={option.id}
                                selected={form.features.includes(option.id)}
                                label={option.label}
                                description={option.description}
                                optionId={option.id}
                                onClick={() => toggleFeature(option.id)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <p className="pl-1 text-xs leading-5 text-ink/62">
                      화면 수(구성)와 기능(동작)은 별도예요. 예를 들어 리스트+상세는 화면 구조이고, 게시판 관리는 등록·수정·삭제 로직이에요.
                    </p>
                  </div>
                </QuestionSection>

                <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
                  <QuestionSection
                    number="04"
                    question="자료는 어느 정도 준비되어 있나요?"
                    helper="자료가 완벽하지 않아도 괜찮아요. 현재 준비된 정도에 가장 가까운 항목을 골라주세요."
                    headerClassName="lg:h-[13.5rem]"
                    alignHeaderDesktop
                  >
                    <div className="grid gap-2 lg:hidden">
                      {readinessOptions.map((option) => (
                        <ChoiceButton
                          key={option.id}
                          selected={form.readiness === option.id}
                          label={option.label}
                          description={option.description}
                          onClick={() => handleSingleChoice("readiness", option.id)}
                        />
                      ))}
                    </div>
                  </QuestionSection>

                  <QuestionSection
                    number="05"
                    question={
                      <>
                        희망 일정은
                        <br />
                        어느 정도인가요?
                      </>
                    }
                    helper="일정에 따라 작업 우선순위와 진행 방식이 달라져요."
                    headerClassName="lg:h-[13.5rem]"
                    alignHeaderDesktop
                  >
                    <div className="space-y-2 lg:hidden">
                      <div className="grid gap-2">
                        {scheduleOptions.map((option) => (
                          <ChoiceButton
                            key={option.id}
                            selected={form.schedule === option.id}
                            label={option.label}
                            description={option.description}
                            onClick={() => handleSingleChoice("schedule", option.id)}
                          />
                        ))}
                      </div>
                      <p className="pl-1 text-xs leading-5 text-ink/62">
                        빠른 일정은 작업 우선순위 조정이 필요해 추가 비용이 발생할 수 있어요.
                      </p>
                    </div>
                  </QuestionSection>
                </div>
                <div className="hidden lg:flex lg:flex-col lg:gap-2">
                  {readinessOptions.map((readinessOption, rowIndex) => {
                    const scheduleOption = scheduleOptions[rowIndex];
                    if (!scheduleOption) return null;

                    return (
                      <div key={`aligned-row-${readinessOption.id}-${scheduleOption.id}`} className="grid grid-cols-2 gap-12">
                        <ChoiceButton
                          selected={form.readiness === readinessOption.id}
                          label={readinessOption.label}
                          description={readinessOption.description}
                          onClick={() => handleSingleChoice("readiness", readinessOption.id)}
                        />
                        <ChoiceButton
                          selected={form.schedule === scheduleOption.id}
                          label={scheduleOption.label}
                          description={scheduleOption.description}
                          onClick={() => handleSingleChoice("schedule", scheduleOption.id)}
                        />
                      </div>
                    );
                  })}
                  <div className="grid grid-cols-2 gap-12">
                    <div />
                    <p className="pl-1 text-xs leading-5 text-ink/62">
                      빠른 일정은 작업 우선순위 조정이 필요해 추가 비용이 발생할 수 있어요.
                    </p>
                  </div>
                </div>

                <QuestionSection
                  number="06"
                  question="사이트 주소와 올릴 공간은 준비되어 있나요?"
                  helper="사이트 운영에 필요한 도메인과 호스팅은 별도 준비 또는 대행이 가능해요. 아직 없거나 잘 모르셔도 괜찮아요."
                >
                  <div className="grid gap-2 md:grid-cols-2">
                    {domainHostingOptions.map((option) => (
                      <ChoiceButton
                        key={option.id}
                        selected={form.domainHosting === option.id}
                        label={option.label}
                        description={option.description}
                        onClick={() => handleSingleChoice("domainHosting", option.id)}
                      />
                    ))}
                  </div>
                </QuestionSection>

                <QuestionSection
                  number="07"
                  question="선택 가능한 혜택이 있을까요?"
                  helper="가능한 항목만 편하게 체크해 주세요. 선택하지 않으셔도 괜찮아요."
                >
                  <div className="space-y-2">
                    {discountOptions.map((option) => (
                      <ChoiceButton
                        key={option.id}
                        selected={form.discounts.includes(option.id)}
                        label={option.label}
                        description={option.description}
                        onClick={() => toggleDiscount(option.id)}
                      />
                    ))}
                  </div>
                </QuestionSection>

                <QuestionSection
                  number="08"
                  question="마지막으로 편하게 설명해 주세요."
                  helper="예: 지금 사이트가 너무 오래돼 보여요 / 문의가 더 잘 들어오면 좋겠어요"
                >
                  <div className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="group block">
                        <span className="block text-[10px] uppercase tracking-[0.32em] text-ink">Name</span>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleTextChange}
                          placeholder="성함"
                          className="mt-2 w-full border-0 border-b border-ink/10 bg-transparent pb-2 text-base text-ink outline-none transition-colors placeholder:text-ink/28 focus:border-brand/40"
                        />
                      </label>
                      <label className="group block">
                        <span className="block text-[10px] uppercase tracking-[0.32em] text-ink">Brand</span>
                        <input
                          name="brand"
                          value={form.brand}
                          onChange={handleTextChange}
                          placeholder="브랜드명 또는 프로젝트명"
                          className="mt-2 w-full border-0 border-b border-ink/10 bg-transparent pb-2 text-base text-ink outline-none transition-colors placeholder:text-ink/28 focus:border-brand/40"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="block text-[10px] uppercase tracking-[0.32em] text-ink">Reply</span>
                      <input
                        name="reply"
                        value={form.reply}
                        onChange={handleTextChange}
                        placeholder="답변 받을 이메일 또는 연락처"
                        className="mt-2 w-full border-0 border-b border-ink/10 bg-transparent pb-2 text-base text-ink outline-none transition-colors placeholder:text-ink/28 focus:border-brand/40"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] uppercase tracking-[0.32em] text-ink">Goal</span>
                      <input
                        name="goal"
                        value={form.goal}
                        onChange={handleTextChange}
                        placeholder="가장 중요하게 바라는 결과 한 가지"
                        className="mt-2 w-full border-0 border-b border-ink/10 bg-transparent pb-2 text-base text-ink outline-none transition-colors placeholder:text-ink/28 focus:border-brand/40"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] uppercase tracking-[0.32em] text-ink">Note</span>
                      <textarea
                        name="note"
                        value={form.note}
                        onChange={handleTextChange}
                        rows={4}
                        placeholder="지금 상황, 참고하고 싶은 사이트, 꼭 반영하고 싶은 분위기 등을 편하게 적어주세요."
                        className="mt-2 w-full resize-none border-0 border-b border-ink/10 bg-transparent pb-2 text-base leading-7 text-ink outline-none transition-colors placeholder:text-ink/28 focus:border-brand/40"
                      />
                    </label>
                  </div>
                </QuestionSection>
              </div>
            </div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease }}
              className="mt-16 flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
            >
              <p className="max-w-2xl text-sm leading-6 text-ink-muted">{statusMessage}</p>
              <BrandButton type="submit" disabled={sending}>
                {sending ? "전송 중…" : "이 범위로 상담 요청하기"}
              </BrandButton>
            </motion.div>
          </form>

          {/* ── Right: Aside ── */}
          <aside className="xl:sticky xl:top-6 xl:self-start">
            {/* Sticky panel — follows scroll */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease }}
              className="panel space-y-5 rounded-[2.2rem] p-5"
            >
              {/* Estimated price */}
              <div>
                <p className="eyebrow">예상 견적</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.32em] text-brand">예상 시작가</p>
                <p className="mt-2 font-display text-[clamp(2rem,3vw,2.8rem)] leading-[0.95] text-brand">
                  <SmartLineBreak text={formatPrice(priceEstimate.basePrice)} maxCharsPerLine={11} maxLines={3} />
                </p>
                <p className="mt-3 text-sm leading-6 text-ink-muted">{priceEstimate.description}</p>
                <p className="mt-2 text-xs leading-5 text-ink/62">
                  선택하신 범위를 기준으로 계산한 예상 금액입니다. 최종 견적은 기능 상세 범위, 디자인 난이도, 외부 연동 여부에 따라 조정될 수 있어요.
                </p>
              </div>

              <div className="soft-divider" />

              {/* Range interpretation */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-brand">프로젝트 복잡도 가이드</p>
                <p className="mt-2 font-medium leading-6 text-ink">{estimateBand.label}</p>
                <p className="mt-1.5 text-sm leading-6 text-ink-muted">{estimateBand.explanation}</p>
              </div>

              <div className="soft-divider" />

              {/* Summary */}
              <div className="space-y-2.5 text-sm leading-6 text-ink-muted">
                <SummaryLine label="프로젝트 유형" value={selectedType?.label ?? "아직 고르는 중"} />
                <SummaryLine label="추가 화면 구성" value={selectedPageScope?.label ?? "아직 고르는 중"} />
                <SummaryLine
                  label="추가 기능 구성"
                  value={selectedFeatures.length > 0 ? selectedFeatures.map((feature) => feature.label).join(", ") : "선택한 추가 기능 없음"}
                />
                <SummaryLine label="자료 준비 상태" value={selectedReadiness?.label ?? "아직 고르는 중"} />
                <SummaryLine label="희망 일정" value={selectedSchedule?.label ?? "아직 고르는 중"} />
                <SummaryLine label="도메인 / 호스팅" value={selectedDomainHosting?.label ?? "아직 고르는 중"} />
                <SummaryLine
                  label="적용 혜택"
                  value={selectedDiscounts.length > 0 ? selectedDiscounts.map((discount) => discount.label).join(", ") : "아직 선택 안 함"}
                />
              </div>

              <div className="soft-divider" />

              {/* Guidance */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.32em] text-brand">안내 사항</p>
                <p className="text-xs leading-5 text-ink-muted">
                  유지보수는 운영 점검과 소규모 수정 중심이며, 신규 기능 개발은 별도예요.
                </p>
                <p className="text-xs leading-5 text-ink/62">
                  모든 견적은 템플릿 재활용이 아닌 맞춤 제작 기준으로 계산됩니다.
                </p>
                <p className="text-xs leading-5 text-ink/62">
                  단순 최저가보다 완성도와 운영 편의성을 우선해 필요한 범위를 정직하게 안내드리고 있어요.
                </p>
              </div>

            </motion.div>
          </aside>
        </div>
      </div>

      {/* ── Cross-link to Contact ── */}
      <div className="shell relative z-10 mt-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm leading-6 text-ink-muted">
            아직 프로젝트가 구체적이지 않거나, 간단한 질문만 있으신가요?
          </p>
          <BrandButton to="/contact" variant="ghost">
            부담 없이 문의하기
          </BrandButton>
        </div>
      </div>

      {/* ── Fixed character + reply (bottom-left) ── */}
      {/* ── Draggable character ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease }}
        className="fixed bottom-24 left-4 z-50 md:bottom-28 md:left-6 xl:bottom-6"
      >
        <div
          {...bindCharacterDrag()}
          className="flex cursor-grab items-end gap-3 touch-none select-none active:cursor-grabbing"
          style={{ transform: `translate3d(${dragPos.x}px, ${dragPos.y}px, 0)` }}
        >
          <div className="h-16 w-16 shrink-0 sm:h-20 sm:w-20">
            <GonishCharacter isSmiling={isSmiling} className="h-full w-full drop-shadow-lg" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={conversationReply}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.35, ease }}
              data-testid="estimate-reply-bubble"
              className="relative max-w-[16rem] rounded-[1.2rem] bg-brand px-4 py-3 text-[13px] leading-5 text-white shadow-[0_14px_36px_rgba(243,29,91,0.24)] sm:max-w-xs"
            >
              <div className="absolute -left-1.5 bottom-4 h-3 w-3 rotate-45 bg-brand" />
              {conversationReply}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Sub-components ── */

function QuestionSection({
  alignHeaderDesktop,
  children,
  helper,
  headerClassName,
  number,
  question,
}: {
  alignHeaderDesktop?: boolean;
  children: ReactNode;
  helper: string;
  headerClassName?: string;
  number: string;
  question: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease }}
      className="relative"
    >
      {/* Timeline dot */}
      <span className="absolute -left-10 top-[6px] flex items-center justify-center sm:-left-12">
        <span className="relative z-10 size-[10px] rounded-full bg-brand shadow-[0_0_14px_rgba(243,29,91,0.45)]" />
        <span className="absolute size-[22px] rounded-full bg-brand/10" />
      </span>

      <div className="space-y-5">
        <div
          className={[
            headerClassName ?? "",
            alignHeaderDesktop
              ? "lg:grid lg:grid-rows-[auto_5rem_4rem] lg:content-start lg:gap-y-2"
              : "lg:flex lg:flex-col lg:justify-start",
          ].join(" ").trim()}
        >
          <span className="font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-none text-brand/12">{number}</span>
          <p
            className={[
              "mt-2 font-display text-[clamp(1.6rem,2.5vw,2.2rem)] leading-[1.1] text-ink",
              alignHeaderDesktop ? "lg:mt-0" : "",
            ].join(" ").trim()}
          >
            {typeof question === "string" ? (
              <SmartLineBreak text={question} maxCharsPerLine={16} maxLines={3} />
            ) : (
              question
            )}
          </p>
          <p className={["mt-3 text-sm leading-6 text-ink/52", alignHeaderDesktop ? "lg:mt-0" : ""].join(" ")}>{helper}</p>
        </div>
        {children}
      </div>
    </motion.section>
  );
}

function ChoiceButton({
  description,
  label,
  onClick,
  optionId,
  selected,
}: {
  description: string;
  label: string;
  onClick: () => void;
  optionId?: string;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-option-id={optionId}
      aria-pressed={selected}
      className={[
        "group relative overflow-hidden rounded-2xl py-4 pl-5 pr-4 text-left transition-all duration-300",
        selected
          ? "bg-brand/[0.06]"
          : "hover:bg-ink/[0.02]",
      ].join(" ")}
    >
      {/* Left accent bar */}
      <span
        className={[
          "absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300",
          selected
            ? "bg-brand shadow-[0_0_10px_rgba(243,29,91,0.35)]"
            : "bg-ink/8 group-hover:bg-ink/15",
        ].join(" ")}
      />
      <p className={["text-[15px] font-medium leading-6 transition-colors duration-300", selected ? "text-brand" : "text-ink"].join(" ")}>{label}</p>
      <p className="mt-1.5 text-sm leading-6 text-ink-muted">{description}</p>
    </button>
  );
}

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-black/6 pb-3 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-[10px] uppercase tracking-[0.28em] text-ink/58">{label}</span>
      <span className="text-right text-sm leading-6 text-ink">{value}</span>
    </div>
  );
}
