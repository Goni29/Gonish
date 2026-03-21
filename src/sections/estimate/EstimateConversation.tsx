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

const projectTypeOptions: Option[] = [
  { id: "landing", label: "가볍게 소개하는 페이지", description: "서비스나 브랜드 하나를 또렷하게 보여주는 소개형 사이트예요.", price: 45, score: 1 },
  { id: "brand-site", label: "브랜드 홈페이지", description: "브랜드 분위기와 신뢰를 함께 전달하는 일반적인 홈페이지예요.", price: 75, score: 2 },
  { id: "renewal", label: "기존 사이트 리뉴얼", description: "이미 있는 사이트를 더 보기 좋고 이해하기 쉽게 정리하는 작업이에요.", price: 65, score: 2 },
  { id: "conversion", label: "문의·예약 중심 사이트", description: "상담 요청이나 예약 연결이 중요한 흐름형 사이트예요.", price: 90, score: 3 },
  { id: "unsure", label: "아직 방향을 정하는 중이에요", description: "괜찮아요. 필요한 흐름부터 함께 정리해 드릴게요.", price: 70, score: 2 },
];

const pageScopeOptions: Option[] = [
  { id: "small", label: "1~3페이지 정도", description: "메인, 소개, 문의처럼 비교적 단순한 구성에 가까워요.", price: 0, score: 1 },
  { id: "medium", label: "4~6페이지 정도", description: "브랜드 소개, 서비스, 사례, 문의까지 담는 가장 일반적인 범위예요.", price: 25, score: 2 },
  { id: "large", label: "7페이지 이상", description: "콘텐츠가 많거나 메뉴가 여러 갈래로 나뉘는 편이에요.", price: 55, score: 3 },
  { id: "unknown", label: "아직 잘 모르겠어요", description: "괜찮아요. 메뉴를 함께 정리하면서 페이지 수를 잡아도 충분해요.", price: 20, score: 2 },
];

const readinessOptions: Option[] = [
  { id: "ready", label: "글과 사진이 거의 준비됐어요", description: "소개 문구와 사진 자료가 어느 정도 정리된 상태예요.", price: 0, score: 0 },
  { id: "partial", label: "조금만 정리하면 될 것 같아요", description: "정보는 있는데, 어떤 식으로 보여줄지 정리가 더 필요한 상태예요.", price: 10, score: 1 },
  { id: "need-help", label: "무엇을 준비해야 할지도 잘 모르겠어요", description: "괜찮아요. 필요한 자료 목록부터 차근차근 같이 정리해 드릴게요.", price: 25, score: 2 },
];

const scheduleOptions: Option[] = [
  { id: "relaxed", label: "여유 있게 진행하고 싶어요", description: "브랜드 방향과 디테일을 충분히 맞춰 가는 방식이 좋아요.", price: 0, score: 0 },
  { id: "normal", label: "1~2개월 안에 진행하고 싶어요", description: "가장 일반적인 홈페이지 제작 속도에 가까워요.", price: 0, score: 1 },
  { id: "fast", label: "조금 빠르게 필요해요", description: "일정이 가까워 우선순위를 빠르게 정해야 하는 경우예요.", price: 30, score: 2 },
];

const domainHostingOptions: Option[] = [
  { id: "both-ready", label: "둘 다 있어요", description: "사이트 주소(도메인)와 올릴 공간(호스팅)이 이미 있어서 그대로 연결하면 돼요.", price: 0, score: 0 },
  { id: "domain-only", label: "주소(도메인)만 있어요", description: "예를 들면 mybrand.com 같은 주소는 있는데, 사이트를 올릴 공간은 아직 없어요.", price: 0, score: 0 },
  { id: "hosting-only", label: "올릴 공간(호스팅)만 있어요", description: "사이트를 올릴 계정이나 서버는 있는데, 연결할 주소는 아직 없어요.", price: 0, score: 0 },
  { id: "none", label: "둘 다 아직 없어요", description: "괜찮아요. 새로 추천받고 같이 준비하는 방향으로 진행할 수 있어요.", price: 0, score: 0 },
  { id: "unsure", label: "무슨 말인지 잘 모르겠어요", description: "전혀 괜찮아요. 상담 때 쉬운 말로 설명드리고 필요한 것만 같이 정리해 드릴게요.", price: 0, score: 0 },
];

const featureOptions: Option[] = [
  { id: "inquiry", label: "기본 문의 받기", description: "상담 내용과 연락처를 남기는 기본 문의 흐름이에요.", price: 0, score: 0 },
  { id: "gallery", label: "포트폴리오·사진 모음", description: "시공 사례나 작업 사진처럼 여러 이미지를 보여주는 구성이에요.", price: 15, score: 1 },
  { id: "booking", label: "예약·신청 흐름", description: "날짜나 시간 선택, 신청서 작성처럼 실제로 입력받는 기능이에요.", price: 45, score: 2 },
  { id: "multilingual", label: "다국어", description: "같은 내용을 한국어·영어처럼 여러 언어로 보여주는 구성이에요.", price: 25, score: 1 },
  { id: "commerce", label: "상품 판매·결제", description: "장바구니나 결제처럼 실제 판매 흐름이 들어가는 경우예요.", price: 90, score: 3 },
  { id: "member", label: "로그인·회원 기능", description: "회원 구분이나 개인 화면이 필요한 경우에 가까워요.", price: 55, score: 2 },
];

const discountOptions: Option[] = [
  { id: "portfolio", label: "포트폴리오로 소개되어도 괜찮아요", description: "완성 후 일부 화면과 결과물을 Gonish 포트폴리오에 소개할 수 있으면 5만 원 할인돼요.", price: -5, score: 0 },
  { id: "review", label: "작업 후 짧은 리뷰를 남길 수 있어요", description: "작업이 끝난 뒤 텍스트 후기나 짧은 리뷰를 남겨주시면 5만 원 할인돼요.", price: -5, score: 0 },
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
  if (score <= 3) {
    return {
      label: "가벼운 소개형",
      explanation: "메뉴가 많지 않고, 브랜드 소개와 문의 연결에 집중하는 심플한 사이트예요.",
    };
  }

  if (score <= 7) {
    return {
      label: "브랜드 홈페이지",
      explanation: "브랜드 소개부터 서비스, 사례, 문의까지 자연스럽게 담기는 가장 일반적인 홈페이지예요.",
    };
  }

  return {
    label: "기능이 포함된 프로젝트",
    explanation: "콘텐츠가 많거나 예약, 판매, 회원 기능처럼 실제로 동작하는 부분이 들어가는 프로젝트예요.",
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
    return "소개형 사이트라면 방문자가 처음 5초 안에 무엇을 알면 되는지부터 정리하면 흐름이 쉬워져요.";
  }

  if (form.projectType === "brand-site") {
    return "브랜드 홈페이지는 보통 브랜드 소개, 서비스, 사례, 문의 흐름으로 잡으면 가장 이해하기 쉬워요.";
  }

  if (form.projectType === "renewal") {
    return "리뉴얼이라면 기존 사이트에서 그대로 둘 것과 바꿀 것을 먼저 나누면 범위가 훨씬 빨리 선명해져요.";
  }

  if (form.projectType === "conversion") {
    return "문의나 예약이 중요한 사이트라면, 방문자가 어디서 클릭하고 어떤 정보를 남기는지 흐름부터 정하는 게 좋아요.";
  }

  if (form.projectType === "unsure") {
    return "방향을 정하는 중이라면 이 사이트로 가장 먼저 얻고 싶은 결과 한 가지만 정해도 출발이 훨씬 쉬워져요.";
  }

  return "어떤 사이트를 만들고 싶은지 먼저 정하면 전체 견적 흐름이 훨씬 쉬워져요.";
}

function getPageScopeStep(form: EstimateForm) {
  if (form.pageScope === "small") {
    if (form.projectType === "landing") {
      return "가볍게 소개하는 사이트라면 메인, 소개, 문의 정도의 1~3페이지로 시작해도 충분해 보여요.";
    }

    if (form.projectType === "brand-site") {
      return "브랜드 홈페이지를 작게 시작한다면, 핵심 서비스와 신뢰 포인트만 먼저 담아도 충분해요.";
    }

    return "1~3페이지 규모라면 핵심 소개와 문의 흐름 중심으로 가볍게 시작하기 좋아요.";
  }

  if (form.pageScope === "medium") {
    return "4~6페이지 규모라면 브랜드 소개, 서비스, 사례, 문의 흐름으로 잡는 구성이 가장 자연스러워요.";
  }

  if (form.pageScope === "large") {
    return "페이지가 많은 편이라면 1차 공개 범위와 나중에 추가할 범위를 먼저 나누는 게 좋아요.";
  }

  if (form.pageScope === "unknown") {
    return "페이지 수가 아직 미정이라면 메인, 소개, 문의처럼 꼭 필요한 메뉴부터 먼저 적어보면 충분해요.";
  }

  return "페이지 규모를 정하면 필요한 작업 범위가 훨씬 또렷해져요.";
}

function getFeatureStep(form: EstimateForm) {
  const featureIds = form.features.filter((feature) => feature !== "inquiry");

  if (featureIds.length >= 2) {
    return "기능이 여러 개 들어가면 이번 오픈에 꼭 필요한 기능과 나중에 붙일 기능을 나누는 게 견적을 가장 선명하게 만들어줘요.";
  }

  if (featureIds.includes("commerce")) {
    return "판매 기능이 들어가면 상품 수, 결제 방식, 배송이나 환불 정책까지 같이 봐야 견적이 정확해져요.";
  }

  if (featureIds.includes("booking")) {
    return "예약이나 신청 기능은 어떤 정보를 받을지와 접수 후 어떻게 확정할지 먼저 정하면 좋아요.";
  }

  if (featureIds.includes("member")) {
    return "로그인·회원 기능은 회원마다 무엇을 보고 무엇을 할 수 있는지부터 정해야 범위가 정확해져요.";
  }

  if (featureIds.includes("multilingual")) {
    return "다국어는 몇 개 언어를 동시에 열지와 번역 원고를 누가 준비할지 먼저 정하면 훨씬 쉬워져요.";
  }

  if (featureIds.includes("gallery")) {
    return "사진이나 사례가 많다면 카테고리 기준과 대표 이미지 규칙부터 잡아두면 훨씬 정돈돼 보여요.";
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
    return "일정이 빠르다면 꼭 필요한 페이지와 기능만 먼저 공개하는 방식으로 잡는 게 가장 안전해요.";
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
    return "포트폴리오 소개 혜택을 반영했어요. 리뷰도 가능하면 추가로 5만 원 더 반영돼요.";
  }

  if (hasReview) {
    return "리뷰 혜택을 반영했어요. 포트폴리오 소개도 가능하면 추가로 5만 원 더 반영돼요.";
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

export default function EstimateConversation() {
  const [form, setForm] = useState<EstimateForm>(initialForm);
  const [isSmiling, setIsSmiling] = useState(false);
  const [lastTouchedField, setLastTouchedField] = useState<NextStepField>("projectType");
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

  const totalDiscount = useMemo(() => Math.abs(selectedDiscounts.reduce((sum, option) => sum + option.price, 0)), [selectedDiscounts]);

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
        min: 45,
        max: 80,
        label: formatPriceRange(45, 80),
        description: "가장 기본적인 소개형 사이트 기준이에요. 항목을 선택하시면 더 정확해져요.",
      };
    }

    const rawBasePrice =
      (selectedType?.price ?? 45) +
      (selectedPageScope?.price ?? 0) +
      (selectedReadiness?.price ?? 0) +
      (selectedSchedule?.price ?? 0) +
      selectedFeatures.reduce((sum, option) => sum + option.price, 0) +
      selectedDiscounts.reduce((sum, option) => sum + option.price, 0);

    const min = roundToFive(Math.max(45, rawBasePrice));
    const bufferBase = min < 80 ? 15 : min < 150 ? 20 : min < 240 ? 30 : 40;
    const featureBuffer = selectedFeatures.length >= 2 ? 10 : 0;
    const largeScopeBuffer = form.pageScope === "large" ? 10 : 0;
    const max = roundToFive(min + bufferBase + featureBuffer + largeScopeBuffer);

    return {
      min,
      max,
      label: formatPriceRange(min, max),
      description:
        selectedDiscounts.length > 0
          ? "혜택까지 반영하면 이 정도 범위에서 시작하시는 게 좋아 보여요."
          : "지금 선택하신 기준으로 보면 이 정도 범위에서 시작하시면 좋을 것 같아요.",
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

  const nextStep = useMemo(() => getNextStep(form, lastTouchedField), [form, lastTouchedField]);

  const conversationReply = useMemo(() => {
    if (selectedType && !selectedPageScope) {
      return `${selectedType.label}을 생각하고 계시군요! 이제 페이지 규모만 알려주시면 범위가 훨씬 선명해져요.`;
    }
    if (selectedType && selectedPageScope && selectedFeatures.length === 0) {
      return "좋아요! 이제 추가 기능이 필요한지만 보면 비용을 더 정확하게 가늠할 수 있어요.";
    }
    if (selectedFeatures.length > 0 && !selectedReadiness) {
      return "필요한 기능이 보이기 시작했어요. 다음은 자료 준비 상태를 한번 볼까요?";
    }
    if (selectedReadiness && selectedSchedule && !selectedDomainHosting) {
      return "좋아요! 마지막으로 사이트 주소와 올릴 공간 준비 여부만 보면 거의 다 정리돼요.";
    }
    if (selectedDomainHosting && selectedDiscounts.length === 0) {
      return "거의 다 왔어요! 혜택도 확인해보시겠어요?";
    }
    if (selectedDiscounts.length > 0) {
      return "좋아요, 혜택까지 반영했어요! 마지막으로 원하는 결과만 알려주시면 끝이에요.";
    }
    return "어려운 말 없이, 필요한 것들을 하나씩 편하게 정리해볼게요.";
  }, [selectedDiscounts.length, selectedDomainHosting, selectedFeatures.length, selectedPageScope, selectedReadiness, selectedSchedule, selectedType]);

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
        `페이지 규모: ${selectedPageScope?.label || "-"}`,
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
      <div className="pointer-events-none absolute left-[-10rem] top-20 h-[24rem] w-[24rem] rounded-full bg-brand/[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute right-[-12rem] top-16 h-[26rem] w-[26rem] rounded-full bg-brand/[0.06] blur-[130px]" />

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
                페이지 수는 메뉴 수라고 생각하시면 되고, 기능은 예약이나 결제처럼 실제로 동작하는 부분이에요.
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
                  question="생각하고 있는 페이지 규모는 어느 정도인가요?"
                  helper="페이지는 보통 메뉴 수와 비슷하게 생각하시면 쉬워요. 예를 들면 메인 / 소개 / 서비스 / 문의처럼요."
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
                  helper="기능은 사용자가 버튼을 누르거나 정보를 입력했을 때 실제로 동작하는 부분이라고 생각하시면 쉬워요."
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
                  >
                    <div className="space-y-2">
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
                    question="희망 일정은 어느 정도인가요?"
                    helper="일정은 금액뿐 아니라 작업 순서와 우선순위에도 영향을 줘요."
                  >
                    <div className="space-y-2">
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
                  helper="포트폴리오 소개 가능과 리뷰 작성은 각각 5만 원씩 반영돼요. 두 항목 모두 선택하셔도 최저가는 45만 원 아래로 내려가지 않아요."
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
                        <span className="block text-[10px] uppercase tracking-[0.32em] text-ink/42">Name</span>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleTextChange}
                          placeholder="성함"
                          className="mt-2 w-full border-0 border-b border-ink/10 bg-transparent pb-2 text-base text-ink outline-none transition-colors placeholder:text-ink/28 focus:border-brand/40"
                        />
                      </label>
                      <label className="group block">
                        <span className="block text-[10px] uppercase tracking-[0.32em] text-ink/42">Brand</span>
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
                      <span className="block text-[10px] uppercase tracking-[0.32em] text-ink/42">Reply</span>
                      <input
                        name="reply"
                        value={form.reply}
                        onChange={handleTextChange}
                        placeholder="답변 받을 이메일 또는 연락처"
                        className="mt-2 w-full border-0 border-b border-ink/10 bg-transparent pb-2 text-base text-ink outline-none transition-colors placeholder:text-ink/28 focus:border-brand/40"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] uppercase tracking-[0.32em] text-ink/42">Goal</span>
                      <input
                        name="goal"
                        value={form.goal}
                        onChange={handleTextChange}
                        placeholder="가장 중요하게 바라는 결과 한 가지"
                        className="mt-2 w-full border-0 border-b border-ink/10 bg-transparent pb-2 text-base text-ink outline-none transition-colors placeholder:text-ink/28 focus:border-brand/40"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] uppercase tracking-[0.32em] text-ink/42">Note</span>
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
            {/* Base includes — stays at top, does not follow scroll */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease }}
              className="mb-4 space-y-2 px-1"
            >
              <p className="text-[10px] uppercase tracking-[0.32em] text-brand">기본 포함</p>
              <p className="text-sm leading-6 text-ink-muted">
                반응형 웹 제작, 기본 문의 흐름, 메일 세팅, 배포 연결까지 기본으로 포함돼 있어요.
              </p>
              <p className="text-xs leading-5 text-ink-muted">
                지금 보이는 금액은 예상 범위예요. 도메인, 호스팅, 유료 플러그인, 외부 결제 수수료는 별도일 수 있어요.
              </p>
            </motion.div>

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
                <SummaryLine label="페이지 규모" value={selectedPageScope?.label ?? "아직 고르는 중"} />
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

              {/* Next steps */}
              <div>
                <p className="eyebrow">Next step</p>
                <div className="mt-3 flex items-start gap-3">
                  <span className="mt-[9px] size-[6px] shrink-0 rounded-full bg-brand/40" />
                  <p className="text-sm leading-6 text-ink-muted">{nextStep}</p>
                </div>
              </div>

            </motion.div>
            </div>
          </aside>
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
  children,
  helper,
  number,
  question,
}: {
  children: ReactNode;
  helper: string;
  number: string;
  question: string;
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
        <div>
          <span className="font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-none text-brand/12">{number}</span>
          <p className="mt-2 font-display text-[clamp(1.6rem,2.5vw,2.2rem)] leading-[1.1] text-ink">
            <SmartLineBreak text={question} maxCharsPerLine={16} maxLines={3} />
          </p>
          <p className="mt-3 text-sm leading-6 text-ink/40">{helper}</p>
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
