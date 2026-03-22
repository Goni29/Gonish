"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import GonishCharacter from "@/components/GonishCharacter";
import BrandButton from "@/components/ui/BrandButton";

import SmartLineBreak from "@/components/ui/SmartLineBreak";

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
const MIN_START_PRICE = 59;
const FAST_TRACK_PERCENT = 15;

const projectTypeOptions: Option[] = [
  {
    id: "landing",
    label: "홍보·브랜드 랜딩 페이지",
    description: "모바일과 PC에서 보기 좋게 만든 소개형 1페이지예요. 문의 남기기와 첫 오픈까지 포함돼요.",
    price: 59,
    score: 1,
  },
  {
    id: "corporate-site",
    label: "기업형·소개형 사이트",
    description: "메인과 여러 소개 페이지로 회사·브랜드 정보를 차근차근 보여주는 기본 구성입니다.",
    price: 119,
    score: 2,
  },
  {
    id: "member-site",
    label: "회원 기능 포함 사이트",
    description: "회원가입, 로그인, 내 정보 화면처럼 사람마다 다르게 보이는 화면이 들어가는 구성이에요.",
    price: 169,
    score: 3,
  },
  {
    id: "webapp",
    label: "관리자·업무형 웹앱",
    description: "관리자가 직접 관리할 수 있는 화면과 업무 흐름이 함께 들어가는 서비스형 구성이에요.",
    price: 249,
    score: 4,
  },
  {
    id: "unsure",
    label: "아직 어떤 유형이 맞는지 모르겠어요",
    description: "괜찮아요. 목적을 먼저 듣고 가장 가까운 시작 패키지부터 같이 잡아드릴게요.",
    price: 119,
    score: 2,
  },
];

const pageScopeOptions: Option[] = [
  {
    id: "included",
    label: "기본 패키지 범위 안에서 시작",
    description: "선택한 프로젝트 유형에 포함된 기본 페이지·화면 범위로 먼저 진행해요.",
    price: 0,
    score: 0,
  },
  {
    id: "static-page",
    label: "정적 페이지 추가",
    description: "소개 글, 이용 안내처럼 읽는 내용 중심 페이지가 더 필요할 때 선택해요.",
    price: 12,
    score: 1,
  },
  {
    id: "form-page",
    label: "폼 페이지 추가",
    description: "문의·신청처럼 사용자가 직접 내용을 입력하는 페이지가 더 필요할 때 선택해요.",
    price: 22,
    score: 1,
  },
  {
    id: "list-detail",
    label: "리스트 + 상세 화면 세트",
    description: "목록에서 고르고, 눌러서 자세히 보는 흐름이 필요한 화면 구성이에요.",
    price: 48,
    score: 2,
  },
  {
    id: "dashboard",
    label: "대시보드·마이페이지 성격 화면",
    description: "내 정보나 운영 현황처럼 사람별·관리용 화면이 더 필요할 때 선택해요.",
    price: 42,
    score: 2,
  },
  {
    id: "multi-add",
    label: "추가 화면이 여러 개 예정",
    description: "추가 페이지/화면이 3개 이상으로 확장될 가능성이 높아요.",
    price: 84,
    score: 3,
  },
  {
    id: "unknown",
    label: "추가 화면 범위가 아직 미정",
    description: "괜찮아요. 필수 화면부터 먼저 잡고, 나머지는 2차로 나누어도 충분해요.",
    price: 24,
    score: 2,
  },
];

const readinessOptions: Option[] = [
  { id: "ready", label: "글과 사진이 거의 준비됐어요", description: "소개 문구와 사진 자료가 어느 정도 정리된 상태예요.", price: 0, score: 0 },
  { id: "partial", label: "조금만 정리하면 될 것 같아요", description: "정보는 있는데, 어떤 식으로 보여줄지 정리가 더 필요한 상태예요.", price: 10, score: 1 },
  { id: "need-help", label: "무엇을 준비해야 할지도 잘 모르겠어요", description: "괜찮아요. 필요한 자료 목록부터 차근차근 같이 정리해 드릴게요.", price: 25, score: 2 },
];

const scheduleOptions: Option[] = [
  { id: "relaxed", label: "여유 있게 진행하고 싶어요", description: "브랜드 방향과 디테일을 충분히 맞춰 가는 방식이 좋아요.", price: 0, score: 0 },
  { id: "normal", label: "1~2개월 안에 진행하고 싶어요", description: "가장 일반적인 홈페이지 제작 속도에 가까워요.", price: 0, score: 1 },
  {
    id: "fast",
    label: "긴급 납기로 빠르게 필요해요",
    description: "짧은 일정 안에 핵심 화면부터 먼저 오픈해야 하는 경우예요.",
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
  { id: "inquiry", label: "문의 남기기", description: "방문자가 이름과 연락처를 남기고 문의를 보낼 수 있어요.", price: 0, score: 0 },
  { id: "social-login", label: "간편 로그인", description: "구글·카카오 같은 계정으로 빠르게 로그인할 수 있어요.", price: 26, score: 1 },
  { id: "role-permission", label: "사람별 화면 나누기", description: "일반 사용자, 운영자처럼 보는 화면과 할 일을 나눌 수 있어요.", price: 38, score: 2 },
  { id: "file-upload", label: "파일 올리기", description: "사진이나 문서를 직접 올릴 수 있어요.", price: 24, score: 1 },
  { id: "search-filter", label: "찾기·걸러보기", description: "원하는 항목을 검색하거나 조건으로 쉽게 고를 수 있어요.", price: 26, score: 1 },
  { id: "rich-editor", label: "글쓰기 편집창", description: "공지나 소개 글을 보기 좋게 작성할 수 있어요.", price: 34, score: 2 },
  { id: "crud-board", label: "공지·게시판 관리", description: "글을 쓰고, 고치고, 지우고, 목록으로 보는 기능이에요.", price: 69, score: 3 },
  { id: "payment", label: "온라인 결제 받기", description: "사이트 안에서 결제를 받을 수 있어요.", price: 89, score: 3 },
  { id: "subscription", label: "정기 결제 받기", description: "매달 또는 일정 주기로 결제가 반복되도록 만들 수 있어요.", price: 129, score: 4 },
  { id: "reservation", label: "예약 받기", description: "날짜와 시간을 골라 예약을 받고 관리할 수 있어요.", price: 95, score: 3 },
  { id: "notification-email", label: "자동 이메일 보내기", description: "가입·문의·예약 시 안내 메일이 자동으로 가요.", price: 16, score: 1 },
  { id: "notification-sms", label: "문자·알림 보내기", description: "중요한 알림을 문자나 메신저로 자동 발송할 수 있어요.", price: 29, score: 1 },
  { id: "map", label: "지도 보여주기", description: "매장 위치나 길찾기 정보를 지도에서 바로 보여줄 수 있어요.", price: 32, score: 1 },
  { id: "external-api", label: "다른 서비스와 연결", description: "이미 쓰는 다른 서비스와 데이터를 주고받을 수 있어요.", price: 48, score: 2 },
  { id: "admin-dashboard", label: "관리자 요약 화면", description: "운영자가 한눈에 상황을 볼 수 있는 화면을 만들어요.", price: 59, score: 2 },
  { id: "admin-module", label: "관리자 목록 관리", description: "회원·문의·상품 같은 목록을 관리자가 직접 관리할 수 있어요.", price: 48, score: 2 },
  { id: "admin-permission", label: "관리자 권한 나누기", description: "관리자마다 할 수 있는 일을 다르게 설정할 수 있어요.", price: 36, score: 1 },
  { id: "stats-report", label: "운영 현황 보기", description: "가입, 문의, 매출 같은 흐름을 보기 쉽게 확인할 수 있어요.", price: 54, score: 2 },
  { id: "excel-export", label: "엑셀로 내려받기", description: "목록 데이터를 엑셀 파일로 저장할 수 있어요.", price: 28, score: 1 },
  { id: "maintenance", label: "오픈 후 관리 도와주기", description: "오픈 뒤에 작은 수정이나 점검을 도와드리는 옵션이에요.", price: 25, score: 1 },
];

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
      explanation: "핵심 소개와 문의 연결 중심으로 시작하는 비교적 가벼운 범위예요.",
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
      explanation: "가입, 예약, 알림 같은 실제 사용 기능이 함께 들어가는 단계예요.",
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

function getProjectTypeStep(form: EstimateForm) {
  if (form.projectType === "landing") {
    return "랜딩형은 방문자가 들어오자마자 무엇을 해야 하는지 한눈에 보이게 정리하면 좋아요.";
  }

  if (form.projectType === "corporate-site") {
    return "기업형 소개 사이트는 회사 소개, 서비스, 사례, 문의 순서로 잡으면 방문자 입장에서 가장 이해하기 쉬워요.";
  }

  if (form.projectType === "member-site") {
    return "회원 기능이 들어가면 로그인 전/후에 화면이 어떻게 달라지는지부터 잡아두면 범위를 훨씬 정확하게 정리할 수 있어요.";
  }

  if (form.projectType === "webapp") {
    return "업무형 웹앱은 누가 어떤 화면을 쓰는지 먼저 나누면 전체 구조를 훨씬 쉽게 잡을 수 있어요.";
  }

  if (form.projectType === "unsure") {
    return "유형이 아직 애매하다면 이 프로젝트로 가장 먼저 해결하고 싶은 문제 1개만 정해도 시작이 훨씬 쉬워져요.";
  }

  return "어떤 사이트를 만들고 싶은지 먼저 정하면 전체 견적 흐름이 훨씬 쉬워져요.";
}

function getPageScopeStep(form: EstimateForm) {
  if (form.pageScope === "included") {
    return "기본 패키지 범위 안에서 시작하면 일정과 비용을 안정적으로 잡기 좋아요.";
  }

  if (form.pageScope === "static-page") {
    return "정적 페이지는 콘텐츠만 확정되면 빠르게 추가할 수 있어서 1차 공개 범위를 넓히기 좋아요.";
  }

  if (form.pageScope === "form-page") {
    return "입력 페이지는 어떤 칸을 받는지, 제출 후 어떤 안내를 보여줄지만 먼저 정해도 훨씬 쉬워져요.";
  }

  if (form.pageScope === "list-detail") {
    return "목록+상세 화면은 목록에서 보여줄 항목과 상세에서 보여줄 내용을 먼저 정하면 좋아요.";
  }

  if (form.pageScope === "dashboard") {
    return "요약 화면은 첫 화면에서 꼭 보여줄 정보 3~5개만 먼저 정해도 방향이 금방 잡혀요.";
  }

  if (form.pageScope === "multi-add") {
    return "추가 화면이 여러 개인 경우엔 1차 공개 화면과 2차 확장 화면을 나누면 일정과 예산을 안정적으로 관리할 수 있어요.";
  }

  if (form.pageScope === "unknown") {
    return "추가 화면이 아직 미정이라면 지금 꼭 필요한 화면 2~3개만 먼저 확정해도 견적이 훨씬 정확해져요.";
  }

  return "추가 화면 범위를 정하면 필요한 작업 범위가 훨씬 또렷해져요.";
}

function getFeatureStep(form: EstimateForm) {
  const featureIds = form.features.filter((feature) => feature !== "inquiry");

  if (featureIds.length >= 6) {
    return "기능이 많이 들어가는 프로젝트예요. 1차 오픈 기능과 2차 확장 기능을 나누면 일정과 비용을 훨씬 현실적으로 설계할 수 있어요.";
  }

  if (featureIds.length >= 3) {
    return "기능이 여러 개 들어가면 우선순위를 나눠서 핵심 기능부터 오픈하는 방식이 견적을 가장 선명하게 만들어줘요.";
  }

  if (featureIds.includes("payment") || featureIds.includes("subscription")) {
    return "결제 기능은 결제가 안 됐을 때 어떻게 안내할지까지 정해두면 진행이 훨씬 안정적이에요.";
  }

  if (featureIds.includes("reservation")) {
    return "예약 기능은 가능한 시간, 취소 방법, 중복 예약 처리만 먼저 정해도 범위가 또렷해져요.";
  }

  if (featureIds.includes("external-api")) {
    return "다른 서비스와 연결하는 기능은 연결 실패 시 안내 방법을 미리 정하면 운영이 훨씬 편해져요.";
  }

  if (featureIds.includes("admin-module") || featureIds.includes("admin-dashboard") || featureIds.includes("admin-permission")) {
    return "관리자 기능은 누가 무엇을 수정할 수 있는지만 먼저 정하면 실수가 크게 줄어요.";
  }

  if (featureIds.includes("crud-board") || featureIds.includes("rich-editor")) {
    return "글쓰기 기능은 꼭 필요한 입력칸과 수정 절차만 먼저 정해도 충분히 시작할 수 있어요.";
  }

  if (featureIds.includes("search-filter") || featureIds.includes("stats-report")) {
    return "찾기·현황 기능은 꼭 필요한 조건 몇 가지만 먼저 정하면 화면이 복잡해지지 않아요.";
  }

  if (form.features.includes("inquiry")) {
    return "기본 문의 중심이라면 문의 항목과 답변 받을 이메일 정도만 정해도 가볍게 시작할 수 있어요.";
  }

  return undefined;
}

function getReadinessStep(form: EstimateForm) {
  if (form.readiness === "ready") {
    return "글과 사진이 거의 준비돼 있다면, 어떤 내용을 어느 페이지에 배치할지만 정리하면 바로 초안으로 넘어갈 수 있어요.";
  }

  if (form.readiness === "partial") {
    return "정보는 있으니, 소개 문구와 서비스 설명을 어떤 순서로 보여줄지만 정리하면 훨씬 빨라져요.";
  }

  if (form.readiness === "need-help") {
    return "자료가 아직 없더라도 괜찮아요. 어떤 글과 사진이 필요한지 목록부터 같이 정리해 드릴게요.";
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
    return "여유 있는 일정이라면 첫 공개 범위뿐 아니라 브랜드 톤과 디테일까지 차근차근 맞춰가기 좋아요.";
  }

  if (form.schedule === "normal") {
    return "1~2개월 일정이라면 먼저 첫 공개 범위를 정하고, 추가 고도화는 2차로 나누는 방식이 가장 안정적이에요.";
  }

  if (form.schedule === "fast") {
    return "일정이 빠르면 꼭 필요한 화면부터 먼저 열고, 나머지는 다음 단계로 나누는 방식이 가장 안전해요.";
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
    return getFeatureStep(form) ?? "필요한 기능을 정하면 실제로 어디까지 만들어야 하는지 더 정확해져요.";
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

  return getNextStep(form, field);
}

export default function EstimateConversation() {
  const [form, setForm] = useState<EstimateForm>(initialForm);
  const [isSmiling, setIsSmiling] = useState(false);
  const [lastTouchedField, setLastTouchedField] = useState<NextStepField | null>(null);
  const smilingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "연락처를 남겨주시면 지금 정리한 내용을 바탕으로 다음 단계를 안내드릴게요.",
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

  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
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
        description: "기본 랜딩 시작가 기준이에요. 항목을 고를수록 안내 범위가 더 정확해져요.",
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

    const min = roundToFive(Math.max(MIN_START_PRICE, discountedBase));
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
          ? `긴급 납기 가산(약 ${urgentSurcharge}만 원)이 반영된 범위예요.`
          : selectedDiscounts.length > 0
            ? "혜택까지 반영하면 이 정도 범위에서 시작하시는 게 좋아 보여요."
            : "지금 선택하신 기준으로 보면 이 정도 범위에서 시작하시면 좋아요.",
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

  const conversationReply = useMemo(() => getCharacterReply(form, lastTouchedField), [form, lastTouchedField]);

  const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSingleChoice = (field: SingleChoiceField, value: string) => {
    if (form[field] === value) return;
    setForm((current) => ({ ...current, [field]: value }));
    setLastTouchedField(field);
    triggerSmile();
  };

  const toggleFeature = (value: string) => {
    const removing = form.features.includes(value);
    setForm((current) => ({
      ...current,
      features: removing ? current.features.filter((item) => item !== value) : [...current.features, value],
    }));
    setLastTouchedField("features");
    if (!removing) triggerSmile();
  };

  const toggleDiscount = (value: string) => {
    const removing = form.discounts.includes(value);
    setForm((current) => ({
      ...current,
      discounts: removing ? current.discounts.filter((item) => item !== value) : [...current.discounts, value],
    }));
    setLastTouchedField("discounts");
    if (!removing) triggerSmile();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.reply.trim()) {
      setStatusMessage("연락처만 남겨주셔도 돼요. 지금 정리한 내용을 바탕으로 상담을 이어갈게요.");
      return;
    }

    if (!contactEmail) {
      setStatusMessage("지금 견적 상담 채널을 확인하고 있어요. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const subject = encodeURIComponent(`[Gonish 견적 문의] ${form.brand || form.name || selectedType?.label || "새 프로젝트"}`);
    const body = encodeURIComponent(
      [
        `이름: ${form.name || "-"}`,
        `브랜드명: ${form.brand || "-"}`,
        `답변 받을 연락처: ${form.reply || "-"}`,
        `프로젝트 방향: ${selectedType?.label || "-"}`,
        `추가 화면 범위: ${selectedPageScope?.label || "-"}`,
        `자료 준비도: ${selectedReadiness?.label || "-"}`,
        `일정: ${selectedSchedule?.label || "-"}`,
        `도메인/호스팅 준비: ${selectedDomainHosting?.label || "-"}`,
        `예상 공개가: ${priceEstimate.label}`,
        `필요 기능: ${selectedFeatures.length > 0 ? selectedFeatures.map((feature) => feature.label).join(", ") : "-"}`,
        `할인 혜택: ${selectedDiscounts.length > 0 ? selectedDiscounts.map((discount) => discount.label).join(", ") : "-"}`,
        "",
        `지금 가장 중요한 목표: ${form.goal || "-"}`,
        "",
        form.note || "추가 메모 없음",
      ].join("\n"),
    );

    triggerSmile();
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    setStatusMessage("메일 앱으로 연결할게요. 정리한 내용을 바탕으로 곧 회신드릴게요.");
  };

  return (
    <section className="section-space relative overflow-x-clip">
      {/* Cosmic background glows */}
      <div className="pointer-events-none absolute left-[-8rem] top-28 h-[18rem] w-[18rem] rounded-full bg-brand/[0.05] blur-[110px]" />
      <div className="pointer-events-none absolute right-[-10rem] top-24 h-[20rem] w-[20rem] rounded-full bg-brand/[0.04] blur-[120px]" />

      <div className="shell relative z-10">
        <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_360px]">
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
                견적, 어렵게 생각하지 않아도 돼요.
              </p>
              <p className="max-w-3xl text-sm leading-7 text-ink-muted md:text-base">
                정확한 금액을 바로 정하는 게 아니라, 어떤 것들이 필요한지 먼저 가볍게 정리해보는 거예요.
                추가 화면은 정적/폼/리스트·상세처럼 유형으로 생각하시면 쉽고, 기능은 결제나 예약처럼 실제로 동작하는 부분이에요.
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
                  helper="예를 들어 '브랜드 홈페이지'는 회사나 브랜드의 소개, 분위기, 신뢰를 함께 보여주는 사이트를 말해요."
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
                  question="기본 범위 밖에 추가될 화면이 있나요?"
                  helper="페이지가 더 필요하면 어떤 종류인지 골라주세요. 읽는 페이지인지, 입력하는 페이지인지부터 정하면 쉬워요."
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
                  helper="기능은 실제로 움직이는 부분이에요. 필요한 것만 체크해도 충분해요."
                >
                  <div className="grid gap-2 md:grid-cols-2">
                    {featureOptions.map((option) => (
                      <ChoiceButton
                        key={option.id}
                        selected={form.features.includes(option.id)}
                        label={option.label}
                        description={option.description}
                        onClick={() => toggleFeature(option.id)}
                      />
                    ))}
                  </div>
                </QuestionSection>

                <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
                  <QuestionSection
                    number="04"
                    question="자료는 어느 정도 준비되어 있나요?"
                    helper="이 부분이 비어 있어도 괜찮아요. 어떤 자료가 필요한지부터 같이 정리할 수 있어요."
                    headerClassName="lg:h-[13.5rem]"
                    alignHeaderDesktop
                  >
                    <div className="grid gap-2">
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
                    helper="일정은 작업 순서와 우선순위에 영향을 줘요. 빠른 일정일수록 꼭 필요한 것부터 먼저 여는 방식이 좋아요."
                    headerClassName="lg:h-[13.5rem]"
                    alignHeaderDesktop
                  >
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
                  </QuestionSection>
                </div>

                <QuestionSection
                  number="06"
                  question="사이트 주소와 올릴 공간은 준비되어 있나요?"
                  helper="도메인은 mybrand.com 같은 사이트 주소예요. 호스팅은 사이트를 올려둘 공간이에요. 아직 없거나 잘 모르셔도 괜찮아요."
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
                  question="이런 혜택이 가능하실까요?"
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
              <BrandButton type="submit">견적 상담 요청하기</BrandButton>
            </motion.div>
          </form>

          {/* ── Right: Aside ── */}
          <aside>
            {/* Sticky panel — follows scroll */}
            <div className="xl:sticky xl:top-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease }}
              className="panel space-y-5 rounded-[2.2rem] p-5"
            >
              {/* Estimated price */}
              <div>
                <p className="eyebrow">Estimated price</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.32em] text-brand">Launch range</p>
                <p className="mt-2 font-display text-[clamp(2rem,3vw,2.8rem)] leading-[0.95] text-brand">
                  <SmartLineBreak text={priceEstimate.label} maxCharsPerLine={11} maxLines={3} />
                </p>
                <p className="mt-3 text-xs leading-5 text-ink-muted">선택 반영 기준가: 약 {priceEstimate.basePrice}만 원</p>
                {priceEstimate.urgentSurcharge > 0 ? (
                  <p className="mt-1 text-xs leading-5 text-ink-muted">
                    긴급 납기 가산: 약 {priceEstimate.urgentSurcharge}만 원
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-6 text-ink-muted">{priceEstimate.description}</p>
              </div>

              <div className="soft-divider" />

              {/* Range interpretation */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-brand">현재 범위</p>
                <p className="mt-2 font-medium leading-6 text-ink">{estimateBand.label}</p>
                <p className="mt-1.5 text-sm leading-6 text-ink-muted">{estimateBand.explanation}</p>
              </div>

              <div className="soft-divider" />

              {/* Summary */}
              <div className="space-y-2.5 text-sm leading-6 text-ink-muted">
                <SummaryLine label="프로젝트 방향" value={selectedType?.label ?? "아직 고르는 중"} />
                <SummaryLine label="추가 화면 범위" value={selectedPageScope?.label ?? "아직 고르는 중"} />
                <SummaryLine
                  label="필요 기능"
                  value={selectedFeatures.length > 0 ? selectedFeatures.map((feature) => feature.label).join(", ") : "기본만으로 시작"}
                />
                <SummaryLine label="자료 준비도" value={selectedReadiness?.label ?? "아직 고르는 중"} />
                <SummaryLine label="희망 일정" value={selectedSchedule?.label ?? "아직 고르는 중"} />
                <SummaryLine label="사이트 주소/호스팅" value={selectedDomainHosting?.label ?? "아직 고르는 중"} />
                <SummaryLine
                  label="적용 혜택"
                  value={selectedDiscounts.length > 0 ? selectedDiscounts.map((discount) => discount.label).join(", ") : "아직 선택 안 함"}
                />
              </div>

              <div className="soft-divider" />

              {/* Base includes */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.32em] text-brand">기본 포함</p>
                <p className="text-sm leading-6 text-ink-muted">
                  휴대폰/PC에서 보기 좋은 화면 제작, 문의 남기기, 메일 연결, 첫 오픈까지 기본으로 포함돼 있어요.
                </p>
                <p className="text-xs leading-5 text-ink-muted">
                  지금 보이는 금액은 예상 범위예요. 사이트 주소/서버 사용료, 외부 결제 서비스 이용료, 유료 서비스 비용은 별도일 수 있어요.
                </p>
              </div>

            </motion.div>
            </div>
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
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease }}
        className="fixed bottom-6 left-6 z-50 flex cursor-grab items-end gap-3 select-none active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <div className="pointer-events-none h-16 w-16 shrink-0 sm:h-20 sm:w-20">
          <GonishCharacter isSmiling={isSmiling} className="h-full w-full drop-shadow-lg" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={conversationReply}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.35, ease }}
            className="relative max-w-[16rem] rounded-[1.2rem] bg-brand px-4 py-3 text-[13px] leading-5 text-white shadow-[0_14px_36px_rgba(243,29,91,0.24)] sm:max-w-xs"
          >
            <div className="absolute -left-1.5 bottom-4 h-3 w-3 rotate-45 bg-brand" />
            {conversationReply}
          </motion.div>
        </AnimatePresence>
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
              ? "lg:grid lg:grid-rows-[auto_minmax(4.7rem,auto)_minmax(3.5rem,auto)] lg:content-start lg:gap-y-2"
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
          <p className={["mt-3 text-sm leading-6 text-ink/40", alignHeaderDesktop ? "lg:mt-0" : ""].join(" ")}>{helper}</p>
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
  selected,
}: {
  description: string;
  label: string;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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
      <span className="shrink-0 text-[10px] uppercase tracking-[0.28em] text-ink-soft">{label}</span>
      <span className="text-right text-sm leading-6 text-ink">{value}</span>
    </div>
  );
}
