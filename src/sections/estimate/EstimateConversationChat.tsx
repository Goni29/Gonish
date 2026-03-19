"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import BrandButton from "@/components/ui/BrandButton";
import SmartLineBreak from "@/components/ui/SmartLineBreak";

type StepId =
  | "projectType"
  | "pageScope"
  | "features"
  | "readiness"
  | "schedule"
  | "discounts"
  | "details";

type Option = {
  description: string;
  id: string;
  label: string;
  price: number;
  score: number;
};

type EstimateForm = {
  brand: string;
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

type SingleChoiceField = "pageScope" | "projectType" | "readiness" | "schedule";

type OrbitStep = {
  angle: number;
  id: StepId;
  label: string;
  short: string;
};

const projectTypeOptions: Option[] = [
  { id: "landing", label: "가볍게 소개하는 페이지", description: "서비스나 브랜드 하나를 또렷하게 보여주는 소개형 사이트예요.", price: 45, score: 1 },
  { id: "brand-site", label: "브랜드 홈페이지", description: "브랜드의 분위기와 신뢰를 함께 전달하는 일반적인 홈페이지예요.", price: 75, score: 2 },
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
  { id: "partial", label: "조금만 정리하면 될 것 같아요", description: "정보는 있는데 어떤 식으로 보여줄지 정리가 더 필요한 상태예요.", price: 10, score: 1 },
  { id: "need-help", label: "무엇을 준비해야 할지도 잘 모르겠어요", description: "괜찮아요. 필요한 자료 목록부터 같이 정리해 드릴게요.", price: 25, score: 2 },
];

const scheduleOptions: Option[] = [
  { id: "relaxed", label: "여유 있게 진행하고 싶어요", description: "브랜드 방향과 디테일을 충분히 맞춰 가는 방식이 좋아요.", price: 0, score: 0 },
  { id: "normal", label: "1~2개월 안에 진행하고 싶어요", description: "가장 일반적인 홈페이지 제작 속도에 가까워요.", price: 0, score: 1 },
  { id: "fast", label: "조금 빠르게 필요해요", description: "일정이 가까워 우선순위를 빠르게 정해야 하는 경우예요.", price: 30, score: 2 },
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

const orbitSteps: OrbitStep[] = [
  { id: "projectType", label: "프로젝트 방향", short: "방향", angle: -80 },
  { id: "pageScope", label: "페이지 규모", short: "규모", angle: -28 },
  { id: "features", label: "추가 기능", short: "기능", angle: 22 },
  { id: "readiness", label: "자료 준비", short: "자료", angle: 78 },
  { id: "schedule", label: "희망 일정", short: "일정", angle: 132 },
  { id: "discounts", label: "혜택 선택", short: "혜택", angle: 190 },
  { id: "details", label: "마지막 설명", short: "메모", angle: 246 },
];

const initialForm: EstimateForm = {
  brand: "",
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

function roundToFive(value: number) {
  return Math.ceil(value / 5) * 5;
}

function formatPriceRange(min: number, max: number) {
  return `${min}만 ~ ${max}만 원`;
}

function getEstimateBand(score: number) {
  if (score <= 3) {
    return {
      label: "가벼운 소개형 범위",
      explanation: "메뉴 수가 많지 않고, 복잡한 기능 없이 브랜드 소개와 문의 연결에 집중하는 경우가 많아요.",
    };
  }

  if (score <= 7) {
    return {
      label: "브랜드 홈페이지 범위",
      explanation: "브랜드 소개, 서비스 안내, 사례, 문의까지 자연스럽게 이어지는 일반적인 홈페이지 범위예요.",
    };
  }

  return {
    label: "기능 포함 프로젝트 범위",
    explanation: "콘텐츠 양이 많거나 예약, 판매, 회원 기능처럼 실제 동작이 들어가는 프로젝트에 가까워요.",
  };
}

function getNextSteps(form: EstimateForm) {
  const steps: string[] = [];

  if (form.readiness === "need-help") {
    steps.push("어떤 글과 사진이 필요한지 먼저 목록으로 정리해 드릴게요.");
  }

  if (form.features.includes("booking") || form.features.includes("commerce") || form.features.includes("member")) {
    steps.push("기능이 필요한 경우에는 어디까지 자동화할지부터 정하면 견적이 더 정확해집니다.");
  }

  if (form.pageScope === "large" || form.pageScope === "unknown") {
    steps.push("메뉴 수가 많거나 아직 미정이라면, 우선순위를 먼저 정하는 것이 중요해요.");
  }

  if (form.schedule === "fast") {
    steps.push("빠른 일정일수록 꼭 필요한 범위부터 먼저 정리하는 방식이 안정적이에요.");
  }

  if (steps.length === 0) {
    steps.push("지금 정보만으로도 상담에서 꽤 또렷하게 범위를 잡아볼 수 있는 상태예요.");
  }

  return steps.slice(0, 3);
}

function getOrbitPoint(angle: number, radiusX = 132, radiusY = 110) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: Math.cos(radians) * radiusX,
    y: Math.sin(radians) * radiusY,
  };
}

export default function EstimateConversationChat() {
  const [form, setForm] = useState<EstimateForm>(initialForm);
  const [activeStep, setActiveStep] = useState<StepId>("projectType");
  const [visitedSteps, setVisitedSteps] = useState<StepId[]>(["projectType"]);
  const [statusMessage, setStatusMessage] = useState(
    "답변 받을 연락처를 남겨주시면 지금 정리한 내용을 바탕으로 다음 단계와 범위를 이어서 안내드릴게요.",
  );

  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const selectedType = useMemo(() => findOption(projectTypeOptions, form.projectType), [form.projectType]);
  const selectedPageScope = useMemo(() => findOption(pageScopeOptions, form.pageScope), [form.pageScope]);
  const selectedReadiness = useMemo(() => findOption(readinessOptions, form.readiness), [form.readiness]);
  const selectedSchedule = useMemo(() => findOption(scheduleOptions, form.schedule), [form.schedule]);
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
        label: formatPriceRange(45, 80),
        max: 80,
        min: 45,
        description: "가벼운 소개형 시작가 기준으로 먼저 보셔도 괜찮은 공개 범위예요.",
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
      label: formatPriceRange(min, max),
      max,
      min,
      description:
        selectedDiscounts.length > 0
          ? "선택하신 혜택까지 반영하면 이 정도 범위에서 시작하는 편이 가장 자연스러워 보여요."
          : "현재 선택 기준으로 보면 이 정도 범위에서 시작하시는 편이 가장 무리 없어 보여요.",
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

  const nextSteps = useMemo(() => getNextSteps(form), [form]);
  const orbitStep = orbitSteps.find((step) => step.id === activeStep) ?? orbitSteps[0];
  const orbitPoint = getOrbitPoint(orbitStep.angle);

  const replyByStep = useMemo<Record<StepId, string | null>>(
    () => ({
      projectType: selectedType ? `${selectedType.label} 방향으로 이해했어요. ${selectedType.description}` : null,
      pageScope: selectedPageScope ? `${selectedPageScope.label} 정도면 흐름과 메뉴 구조를 같이 정리하기 좋은 범위예요.` : null,
      features:
        selectedFeatures.length > 0
          ? `${selectedFeatures.map((feature) => feature.label).join(", ")} 기능이 필요해 보여요. 이 부분이 실제 견적 차이를 가장 크게 만드는 요소예요.`
          : null,
      readiness: selectedReadiness ? `${selectedReadiness.label} 상태군요. 자료 준비 범위에 따라 상담 방식도 더 편하게 맞출 수 있어요.` : null,
      schedule: selectedSchedule ? `${selectedSchedule.label} 쪽으로 이해했어요. 일정은 작업 순서와 우선순위에도 영향을 줘요.` : null,
      discounts:
        selectedDiscounts.length > 0
          ? `${selectedDiscounts.map((discount) => discount.label).join(", ")} 기준으로 총 ${totalDiscount}만 원 조정해서 보고 있어요.`
          : "혜택은 아직 열어두셔도 괜찮아요. 상담하면서 최종 조건을 정해도 충분합니다.",
      details:
        form.brand || form.goal || form.note || form.reply
          ? [
              form.brand ? `${form.brand} 프로젝트로 보고 있어요.` : null,
              form.goal ? `가장 중요한 목표는 ${form.goal} 쪽이군요.` : null,
              form.reply ? `답변드릴 채널도 함께 받아둘게요.` : null,
            ]
              .filter(Boolean)
              .join(" ")
          : null,
    }),
    [form.brand, form.goal, form.note, form.reply, selectedDiscounts, selectedFeatures, selectedPageScope, selectedReadiness, selectedSchedule, selectedType, totalDiscount],
  );

  function activateStep(step: StepId) {
    setActiveStep(step);
    setVisitedSteps((current) => (current.includes(step) ? current : [...current, step]));
  }

  const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    activateStep("details");
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSingleChoice = (field: SingleChoiceField, value: string) => {
    activateStep(field);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleFeature = (value: string) => {
    activateStep("features");
    setForm((current) => ({
      ...current,
      features: current.features.includes(value) ? current.features.filter((item) => item !== value) : [...current.features, value],
    }));
  };

  const toggleDiscount = (value: string) => {
    activateStep("discounts");
    setForm((current) => ({
      ...current,
      discounts: current.discounts.includes(value)
        ? current.discounts.filter((item) => item !== value)
        : [...current.discounts, value],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.reply.trim()) {
      activateStep("details");
      setStatusMessage("답변 받을 연락처만 남겨주셔도, 지금 정리한 내용을 바탕으로 상담을 이어서 안내드릴게요.");
      return;
    }

    if (!contactEmail) {
      setStatusMessage("현재 견적 상담 채널을 점검하고 있습니다. 잠시 후 다시 시도해 주세요.");
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
        `예상 공개가: ${priceEstimate.label}`,
        `필요 기능: ${selectedFeatures.length > 0 ? selectedFeatures.map((feature) => feature.label).join(", ") : "-"}`,
        `할인 혜택: ${selectedDiscounts.length > 0 ? selectedDiscounts.map((discount) => discount.label).join(", ") : "-"}`,
        "",
        `지금 가장 중요한 목표: ${form.goal || "-"}`,
        "",
        form.note || "추가 메모 없음",
      ].join("\n"),
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    setStatusMessage("메일 앱으로 연결하고 있습니다. 정리한 내용을 바탕으로 견적 상담을 이어가겠습니다.");
  };

  return (
    <section className="section-space relative overflow-hidden">
      <div className="pointer-events-none absolute left-[-10rem] top-20 h-[24rem] w-[24rem] rounded-full bg-brand/[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute right-[-12rem] top-16 h-[28rem] w-[28rem] rounded-full bg-brand/[0.08] blur-[130px]" />

      <div className="shell relative z-10">
        <div className="panel relative overflow-hidden rounded-[2.8rem] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(243,29,91,0.09),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(255,194,216,0.28),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))]" />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
            <LayoutGroup>
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-[2.2rem] border border-black/8 bg-white/78 p-5 backdrop-blur-xl sm:p-6"
                >
                  <p className="eyebrow">Project conversation</p>
                  <p className="mt-4 font-display text-[clamp(2rem,3vw,2.8rem)] leading-[1] text-ink">
                    견적도 대화처럼
                    <br />
                    차근차근 정리할게요.
                  </p>
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-muted md:text-base">
                    개발을 잘 몰라도 괜찮아요. 필요한 범위를 하나씩 고르시면, 그때그때 이해한 내용을 바로 아래 답변 말풍선으로 정리해 드릴게요.
                  </p>
                </motion.div>

                <ConversationStep eyebrow="Question 01" helper="예를 들어 ‘브랜드 홈페이지’는 회사나 브랜드의 소개, 분위기, 신뢰를 함께 보여주는 사이트를 말해요." question="어떤 사이트를 생각하고 계신가요?" reply={activeStep === "projectType" ? replyByStep.projectType : null}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {projectTypeOptions.map((option) => (
                      <ChoiceButton key={option.id} description={option.description} label={option.label} onClick={() => handleSingleChoice("projectType", option.id)} selected={form.projectType === option.id} />
                    ))}
                  </div>
                </ConversationStep>

                <ConversationStep eyebrow="Question 02" helper="페이지는 보통 메뉴 수와 비슷하게 생각하시면 쉬워요. 예를 들면 메인, 소개, 서비스, 문의처럼요." question="생각하고 있는 페이지 규모는 어느 정도인가요?" reply={activeStep === "pageScope" ? replyByStep.pageScope : null}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {pageScopeOptions.map((option) => (
                      <ChoiceButton key={option.id} description={option.description} label={option.label} onClick={() => handleSingleChoice("pageScope", option.id)} selected={form.pageScope === option.id} />
                    ))}
                  </div>
                </ConversationStep>

                <ConversationStep eyebrow="Question 03" helper="기능은 사용자가 버튼을 누르거나 정보를 입력했을 때 실제로 동작하는 부분이라고 생각하시면 쉬워요." question="추가로 필요한 기능이 있나요?" reply={activeStep === "features" ? replyByStep.features : null}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {featureOptions.map((option) => (
                      <ChoiceButton key={option.id} description={option.description} label={option.label} onClick={() => toggleFeature(option.id)} selected={form.features.includes(option.id)} />
                    ))}
                  </div>
                </ConversationStep>

                <div className="grid gap-5 lg:grid-cols-2">
                  <ConversationStep eyebrow="Question 04" helper="이 부분이 비어 있어도 괜찮아요. 어떤 자료가 필요한지부터 같이 정리하면서 시작할 수 있어요." question="자료는 어느 정도 준비되어 있나요?" reply={activeStep === "readiness" ? replyByStep.readiness : null}>
                    <div className="grid gap-3">
                      {readinessOptions.map((option) => (
                        <ChoiceButton key={option.id} description={option.description} label={option.label} onClick={() => handleSingleChoice("readiness", option.id)} selected={form.readiness === option.id} />
                      ))}
                    </div>
                  </ConversationStep>

                  <ConversationStep eyebrow="Question 05" helper="일정은 금액뿐 아니라 작업 순서와 우선순위에도 영향을 줘요. 빠를수록 꼭 필요한 범위를 정하는 것이 중요해요." question="희망 일정은 어느 정도인가요?" reply={activeStep === "schedule" ? replyByStep.schedule : null}>
                    <div className="grid gap-3">
                      {scheduleOptions.map((option) => (
                        <ChoiceButton key={option.id} description={option.description} label={option.label} onClick={() => handleSingleChoice("schedule", option.id)} selected={form.schedule === option.id} />
                      ))}
                    </div>
                  </ConversationStep>
                </div>

                <ConversationStep eyebrow="Question 06" helper="포트폴리오 소개 가능과 리뷰 작성은 각각 5만 원씩 반영돼요. 두 항목 모두 선택하셔도 공개 견적 기준 최저가는 45만 원 아래로 내려가지 않아요." question="이런 혜택이 가능하실까요?" reply={activeStep === "discounts" ? replyByStep.discounts : null}>
                  <div className="grid gap-3">
                    {discountOptions.map((option) => (
                      <ChoiceButton key={option.id} description={option.description} label={option.label} onClick={() => toggleDiscount(option.id)} selected={form.discounts.includes(option.id)} />
                    ))}
                  </div>
                </ConversationStep>

                <ConversationStep eyebrow="Question 07" helper="예: 지금 사이트가 너무 오래돼 보여요 / 문의가 더 잘 들어오면 좋겠어요 / 브랜드 분위기를 더 고급스럽게 정리하고 싶어요" question="마지막으로 편하게 설명해 주세요." reply={activeStep === "details" ? replyByStep.details : null}>
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <ChatInput label="Name" name="name" onChange={handleTextChange} placeholder="성함" value={form.name} />
                      <ChatInput label="Brand" name="brand" onChange={handleTextChange} placeholder="브랜드명 또는 프로젝트명" value={form.brand} />
                    </div>
                    <ChatInput label="Reply" name="reply" onChange={handleTextChange} placeholder="답변 받을 이메일 또는 연락처" value={form.reply} />
                    <ChatInput label="Goal" name="goal" onChange={handleTextChange} placeholder="가장 중요하게 바라는 결과 한 가지" value={form.goal} />
                    <ChatTextarea label="Note" name="note" onChange={handleTextChange} placeholder="지금 상황, 참고하고 싶은 사이트, 꼭 반영하고 싶은 분위기 등을 편하게 적어주세요." rows={5} value={form.note} />
                  </div>
                </ConversationStep>

                <div className="flex flex-col gap-4 rounded-[2rem] border border-black/8 bg-white/76 p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
                  <p className="max-w-3xl text-sm leading-6 text-ink-muted">{statusMessage}</p>
                  <BrandButton type="submit">견적 상담 요청하기</BrandButton>
                </div>
              </form>
            </LayoutGroup>

            <aside className="space-y-4 xl:sticky xl:top-28">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="panel rounded-[2.2rem] p-5 sm:p-6"
              >
                <p className="eyebrow">Estimated price</p>
                <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-brand/12 bg-[linear-gradient(180deg,rgba(255,247,250,0.9),rgba(255,255,255,0.7))] p-4">
                  <div className="relative mx-auto h-[22rem] w-full max-w-[22rem]">
                    <div className="absolute left-1/2 top-1/2 h-[19rem] w-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/16" />
                    <div className="absolute left-1/2 top-1/2 h-[15rem] w-[15rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/12 border-dashed" />

                    {orbitSteps.map((step) => {
                      const point = getOrbitPoint(step.angle);
                      const isCurrent = step.id === activeStep;
                      const isVisited = visitedSteps.includes(step.id);

                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => activateStep(step.id)}
                          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-left"
                          style={{ transform: `translate(calc(-50% + ${point.x}px), calc(-50% + ${point.y}px))` }}
                        >
                          <div className="flex items-center gap-2 rounded-full bg-white/88 px-3 py-2 shadow-[0_10px_28px_rgba(20,16,20,0.08)] backdrop-blur-xl">
                            <span className={["h-2.5 w-2.5 rounded-full transition-all duration-300", isCurrent ? "bg-brand shadow-[0_0_0_6px_rgba(243,29,91,0.12)]" : isVisited ? "bg-brand/42" : "bg-black/12"].join(" ")} />
                            <span className={["text-[11px] tracking-[0.24em] uppercase", isCurrent ? "text-brand" : "text-ink/54"].join(" ")}>{step.short}</span>
                          </div>
                        </button>
                      );
                    })}

                    <motion.div
                      initial={false}
                      animate={{ x: orbitPoint.x, y: orbitPoint.y }}
                      transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.9 }}
                      className="absolute left-1/2 top-1/2 z-20"
                    >
                      <div className="w-[9.2rem] -translate-x-1/2 -translate-y-1/2 rounded-[1.6rem] bg-brand px-4 py-3 text-white shadow-[0_22px_48px_rgba(243,29,91,0.28)]">
                        <p className="text-[9px] uppercase tracking-[0.34em] text-white/72">Estimated price</p>
                        <p className="mt-2 text-sm font-medium leading-5">{priceEstimate.label}</p>
                      </div>
                    </motion.div>

                    <div className="absolute left-1/2 top-1/2 z-10 w-[11.6rem] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-black/8 bg-white/90 p-5 text-center shadow-[0_18px_42px_rgba(20,16,20,0.08)] backdrop-blur-xl">
                      <p className="text-[10px] uppercase tracking-[0.32em] text-brand">Current orbit</p>
                      <p className="mt-3 font-display text-[1.9rem] leading-[0.95] text-ink">
                        <SmartLineBreak text={orbitStep.label} maxCharsPerLine={7} maxLines={2} />
                      </p>
                      <p className="mt-3 text-sm leading-6 text-ink-muted">
                        {replyByStep[activeStep] ?? "질문을 선택하면 그 단계의 답변 요약이 이곳에 보입니다."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.6rem] border border-brand/12 bg-[#fff7fa] p-4">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-brand">Range note</p>
                  <p className="mt-3 font-medium leading-6 text-ink">{estimateBand.label}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{estimateBand.explanation}</p>
                </div>

                <div className="mt-4 space-y-3 text-sm leading-6 text-ink-muted">
                  <SummaryLine label="프로젝트 방향" value={selectedType?.label ?? "아직 고르는 중"} />
                  <SummaryLine label="페이지 규모" value={selectedPageScope?.label ?? "아직 고르는 중"} />
                  <SummaryLine label="필요 기능" value={selectedFeatures.length > 0 ? selectedFeatures.map((feature) => feature.label).join(", ") : "지금은 가볍게 시작"} />
                  <SummaryLine label="적용 혜택" value={selectedDiscounts.length > 0 ? selectedDiscounts.map((discount) => discount.label).join(", ") : "아직 선택 안 함"} />
                  <SummaryLine label="자료 준비도" value={selectedReadiness?.label ?? "아직 고르는 중"} />
                  <SummaryLine label="희망 일정" value={selectedSchedule?.label ?? "아직 고르는 중"} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[2rem] border border-black/10 bg-white/74 p-5 backdrop-blur-xl"
              >
                <p className="eyebrow">Next step</p>
                <div className="mt-4 space-y-3">
                  {nextSteps.map((step) => (
                    <p key={step} className="text-sm leading-6 text-ink-muted">{step}</p>
                  ))}
                </div>
              </motion.div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConversationStep({
  children,
  eyebrow,
  helper,
  question,
  reply,
}: {
  children: ReactNode;
  eyebrow: string;
  helper: string;
  question: string;
  reply: string | null;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-10 sm:pl-12"
    >
      <div className="pointer-events-none absolute left-4 top-0 h-full w-px bg-[linear-gradient(180deg,rgba(243,29,91,0.18),rgba(243,29,91,0.04))] sm:left-5" />
      <div className="absolute left-0 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-[10px] uppercase tracking-[0.28em] text-ink/46 sm:left-1 sm:h-9 sm:w-9">Q</div>

      <div className="space-y-3 rounded-[2rem] border border-black/8 bg-white/76 p-5 backdrop-blur-xl sm:p-6">
        <div className="max-w-2xl rounded-[1.6rem] border border-brand/12 bg-[#fff7fa] p-5">
          <p className="text-[10px] uppercase tracking-[0.32em] text-brand/72">{eyebrow}</p>
          <p className="mt-4 font-display text-[clamp(1.9rem,3vw,2.6rem)] leading-[1] text-ink">
            <SmartLineBreak text={question} maxCharsPerLine={14} maxLines={3} />
          </p>
          <p className="mt-4 text-sm leading-6 text-ink-muted">{helper}</p>
        </div>

        {children}

        {reply ? (
          <div className="flex justify-end pt-2">
            <motion.div layoutId="estimate-reply-bubble" transition={{ type: "spring", stiffness: 260, damping: 26 }} className="max-w-[30rem] rounded-[1.7rem] bg-brand px-5 py-4 text-sm leading-6 text-white shadow-[0_22px_46px_rgba(243,29,91,0.24)]">
              {reply}
            </motion.div>
          </div>
        ) : null}
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
        "rounded-[1.5rem] border p-4 text-left transition-all duration-300",
        selected ? "border-brand/28 bg-white shadow-[0_18px_40px_rgba(243,29,91,0.12)]" : "border-black/8 bg-white/68 hover:-translate-y-0.5 hover:border-brand/16",
      ].join(" ")}
    >
      <p className={["font-medium leading-6", selected ? "text-brand" : "text-ink"].join(" ")}>{label}</p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
    </button>
  );
}

function ChatInput({
  label,
  name,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="rounded-[1.5rem] border border-black/10 bg-white/78 p-4 backdrop-blur-xl">
      <span className="block text-[10px] uppercase tracking-[0.32em] text-ink/42">{label}</span>
      <input name={name} value={value} onChange={onChange} placeholder={placeholder} className="mt-3 w-full border-0 bg-transparent p-0 text-base text-ink outline-none placeholder:text-ink/32" />
    </label>
  );
}

function ChatTextarea({
  label,
  name,
  onChange,
  placeholder,
  rows,
  value,
}: {
  label: string;
  name: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows: number;
  value: string;
}) {
  return (
    <label className="rounded-[1.5rem] border border-black/10 bg-white/78 p-4 backdrop-blur-xl">
      <span className="block text-[10px] uppercase tracking-[0.32em] text-ink/42">{label}</span>
      <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-base leading-7 text-ink outline-none placeholder:text-ink/32" />
    </label>
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
