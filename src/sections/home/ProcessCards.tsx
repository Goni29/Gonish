import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ForwardedRef,
} from "react";
import gsap from "gsap";

/* ── 카드 데이터 ──────────────────────────────────────── */

type ProcessCard = {
  label: string;
  title: string;
  body: string;
  icon: React.ReactNode;
};

type ProcessStep = ProcessCard[];

/* ── SVG 아이콘 ──────────────────────────────────────── */

const BrandAnalysisIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="size-full">
    <circle cx="34" cy="34" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
    <circle cx="34" cy="34" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
    <circle cx="34" cy="34" r="5" fill="currentColor" opacity="0.12" />
    <line x1="47" y1="47" x2="62" y2="62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M58 54l8 8" stroke="#F31D5B" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="22" y="28" width="6" height="12" rx="1" fill="#F31D5B" opacity="0.25" />
    <rect x="31" y="24" width="6" height="16" rx="1" fill="#F31D5B" opacity="0.4" />
    <rect x="40" y="31" width="6" height="9" rx="1" fill="#F31D5B" opacity="0.2" />
  </svg>
);

const ToneMoodIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="size-full">
    <rect x="12" y="18" width="16" height="16" rx="3" fill="#F31D5B" opacity="0.35" />
    <rect x="32" y="18" width="16" height="16" rx="3" fill="#F31D5B" opacity="0.2" />
    <rect x="52" y="18" width="16" height="16" rx="3" fill="currentColor" opacity="0.08" />
    <rect x="12" y="38" width="16" height="16" rx="3" fill="#F31D5B" opacity="0.12" />
    <rect x="32" y="38" width="16" height="16" rx="3" fill="currentColor" opacity="0.06" />
    <rect x="52" y="38" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.2" opacity="0.15" />
    <path d="M14 62h52" stroke="currentColor" strokeWidth="1.2" opacity="0.15" />
    <path d="M14 62h28" stroke="#F31D5B" strokeWidth="2" strokeLinecap="round" />
    <circle cx="42" cy="62" r="2.5" fill="#F31D5B" />
  </svg>
);

const FirstImpressionIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="size-full">
    <rect x="10" y="14" width="60" height="42" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.18" />
    <rect x="10" y="14" width="60" height="8" rx="4" fill="currentColor" opacity="0.05" />
    <circle cx="17" cy="18" r="1.5" fill="#F31D5B" opacity="0.6" />
    <circle cx="23" cy="18" r="1.5" fill="currentColor" opacity="0.2" />
    <circle cx="29" cy="18" r="1.5" fill="currentColor" opacity="0.2" />
    <rect x="16" y="28" width="28" height="3" rx="1.5" fill="#F31D5B" opacity="0.3" />
    <rect x="16" y="34" width="20" height="2" rx="1" fill="currentColor" opacity="0.1" />
    <rect x="16" y="39" width="24" height="2" rx="1" fill="currentColor" opacity="0.08" />
    <rect x="16" y="44" width="16" height="2" rx="1" fill="currentColor" opacity="0.06" />
    <rect x="50" y="28" width="14" height="20" rx="2" fill="#F31D5B" opacity="0.12" stroke="#F31D5B" strokeWidth="0.8" />
    <path d="M30 64l10-6 10 4 10-8 10 2" stroke="#F31D5B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
  </svg>
);

const MoodCaptureIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="size-full">
    <circle cx="40" cy="40" r="24" stroke="currentColor" strokeWidth="1.2" opacity="0.12" />
    <circle cx="40" cy="40" r="16" stroke="currentColor" strokeWidth="1.2" opacity="0.18" />
    <circle cx="40" cy="40" r="8" stroke="#F31D5B" strokeWidth="1.5" opacity="0.4" />
    <circle cx="40" cy="40" r="3" fill="#F31D5B" opacity="0.5" />
    <line x1="40" y1="10" x2="40" y2="20" stroke="currentColor" strokeWidth="1.2" opacity="0.15" />
    <line x1="40" y1="60" x2="40" y2="70" stroke="currentColor" strokeWidth="1.2" opacity="0.15" />
    <line x1="10" y1="40" x2="20" y2="40" stroke="currentColor" strokeWidth="1.2" opacity="0.15" />
    <line x1="60" y1="40" x2="70" y2="40" stroke="currentColor" strokeWidth="1.2" opacity="0.15" />
    <path d="M26 22l4 4" stroke="#F31D5B" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
    <path d="M50 54l4 4" stroke="#F31D5B" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
  </svg>
);

const StructureDesignIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="size-full">
    <rect x="12" y="12" width="24" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.2" opacity="0.18" />
    <rect x="44" y="12" width="24" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.2" opacity="0.18" />
    <rect x="12" y="34" width="56" height="14" rx="2.5" stroke="#F31D5B" strokeWidth="1.2" opacity="0.3" />
    <rect x="16" y="38" width="20" height="2.5" rx="1" fill="#F31D5B" opacity="0.25" />
    <rect x="16" y="42.5" width="14" height="2" rx="1" fill="currentColor" opacity="0.1" />
    <rect x="12" y="54" width="24" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.2" opacity="0.12" />
    <rect x="44" y="54" width="24" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.2" opacity="0.12" />
    <path d="M24 28v6M56 28v6" stroke="currentColor" strokeWidth="1" opacity="0.15" strokeDasharray="2 2" />
    <path d="M24 48v6M56 48v6" stroke="currentColor" strokeWidth="1" opacity="0.15" strokeDasharray="2 2" />
  </svg>
);

const PreciseFeedbackIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="size-full">
    <rect x="16" y="12" width="48" height="56" rx="4" stroke="currentColor" strokeWidth="1.2" opacity="0.15" />
    <path d="M24 26h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.12" />
    <path d="M24 34h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.12" />
    <path d="M24 42h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.12" />
    <path d="M24 50h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.12" />
    <circle cx="52" cy="26" r="4" fill="#F31D5B" opacity="0.15" stroke="#F31D5B" strokeWidth="1" />
    <path d="M50 26l1.5 1.5L54 25" stroke="#F31D5B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="52" cy="34" r="4" fill="#F31D5B" opacity="0.15" stroke="#F31D5B" strokeWidth="1" />
    <path d="M50 34l1.5 1.5L54 33" stroke="#F31D5B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="52" cy="42" r="4" stroke="#F31D5B" strokeWidth="1" opacity="0.4" />
    <circle cx="52" cy="50" r="4" stroke="currentColor" strokeWidth="1" opacity="0.15" />
  </svg>
);

const AgileStartIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="size-full">
    <path d="M20 60V28c0-6 4-12 12-14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.15" />
    <path d="M32 14l8 6-4 2" stroke="#F31D5B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    <circle cx="40" cy="40" r="6" fill="#F31D5B" opacity="0.12" stroke="#F31D5B" strokeWidth="1.2" />
    <path d="M38 40l2 2 4-4" stroke="#F31D5B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 30c6 4 8 10 8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.15" />
    <path d="M20 60h40" stroke="currentColor" strokeWidth="1.2" opacity="0.12" />
    <rect x="24" y="52" width="4" height="8" rx="1" fill="currentColor" opacity="0.08" />
    <rect x="32" y="48" width="4" height="12" rx="1" fill="#F31D5B" opacity="0.15" />
    <rect x="40" y="44" width="4" height="16" rx="1" fill="#F31D5B" opacity="0.25" />
    <rect x="48" y="40" width="4" height="20" rx="1" fill="#F31D5B" opacity="0.35" />
    <rect x="56" y="46" width="4" height="14" rx="1" fill="#F31D5B" opacity="0.2" />
  </svg>
);

const ScheduleIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="size-full">
    <rect x="14" y="18" width="52" height="48" rx="4" stroke="currentColor" strokeWidth="1.2" opacity="0.18" />
    <path d="M14 30h52" stroke="currentColor" strokeWidth="1" opacity="0.12" />
    <rect x="24" y="12" width="2" height="10" rx="1" fill="currentColor" opacity="0.2" />
    <rect x="54" y="12" width="2" height="10" rx="1" fill="currentColor" opacity="0.2" />
    <rect x="20" y="36" width="8" height="6" rx="1.5" fill="currentColor" opacity="0.06" />
    <rect x="32" y="36" width="8" height="6" rx="1.5" fill="currentColor" opacity="0.06" />
    <rect x="44" y="36" width="8" height="6" rx="1.5" fill="#F31D5B" opacity="0.2" />
    <rect x="56" y="36" width="8" height="6" rx="1.5" fill="#F31D5B" opacity="0.3" />
    <rect x="20" y="46" width="8" height="6" rx="1.5" fill="#F31D5B" opacity="0.35" />
    <rect x="32" y="46" width="8" height="6" rx="1.5" fill="#F31D5B" opacity="0.15" />
    <rect x="44" y="46" width="8" height="6" rx="1.5" fill="currentColor" opacity="0.06" />
    <rect x="56" y="46" width="8" height="6" rx="1.5" fill="currentColor" opacity="0.06" />
    <rect x="20" y="56" width="8" height="6" rx="1.5" fill="currentColor" opacity="0.06" />
    <rect x="32" y="56" width="8" height="6" rx="1.5" fill="currentColor" opacity="0.04" />
    <circle cx="48" cy="49" r="3" fill="#F31D5B" opacity="0.5" />
  </svg>
);

const DeliveryIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="size-full">
    <path d="M16 52l24-12 24 12" stroke="currentColor" strokeWidth="1.2" opacity="0.12" />
    <path d="M16 44l24-12 24 12" stroke="currentColor" strokeWidth="1.2" opacity="0.18" />
    <path d="M16 36l24-12 24 12v16l-24 12-24-12V36z" stroke="#F31D5B" strokeWidth="1.2" opacity="0.3" />
    <path d="M16 36l24 12 24-12" stroke="#F31D5B" strokeWidth="1" opacity="0.2" />
    <path d="M40 48v16" stroke="#F31D5B" strokeWidth="1" opacity="0.2" />
    <path d="M40 48l24-12" stroke="#F31D5B" strokeWidth="1" opacity="0.15" />
    <path d="M28 30l24 12" stroke="#F31D5B" strokeWidth="0.8" opacity="0.15" />
    <circle cx="40" cy="38" r="4" fill="#F31D5B" opacity="0.15" />
    <path d="M38 38l1.5 1.5L43 36" stroke="#F31D5B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── 스텝별 카드 데이터 ───────────────────────────────── */

const processSteps: ProcessStep[] = [
  // Step 0: 품격있게 — SIGNATURE DESIGN
  [
    {
      label: "01",
      title: "브랜드 리서치",
      body: "업종의 맥락과 고객 기대를 분석해 브랜드가 서야 할 위치를 먼저 정리합니다.",
      icon: <BrandAnalysisIcon />,
    },
    {
      label: "02",
      title: "톤앤매너 설계",
      body: "브랜드 분위기에 맞는 색상, 서체, 이미지 언어를 설정해 일관된 인상을 만듭니다.",
      icon: <ToneMoodIcon />,
    },
    {
      label: "03",
      title: "첫인상 구성",
      body: "첫 화면에서 신뢰와 품격이 전해지도록 레이아웃과 메시지를 정돈합니다.",
      icon: <FirstImpressionIcon />,
    },
  ],
  // Step 1: 긴밀하게 — PRIVATE DIALOGUE
  [
    {
      label: "01",
      title: "1:1 전담 소통",
      body: "담당자가 직접 소통하며 브랜드의 결과 방향을 깊이 이해합니다.",
      icon: <MoodCaptureIcon />,
    },
    {
      label: "02",
      title: "뉘앙스 반영",
      body: "작은 톤의 차이까지 섬세하게 읽어 의도가 흐려지지 않는 결과를 만듭니다.",
      icon: <StructureDesignIcon />,
    },
    {
      label: "03",
      title: "맞춤 디렉션",
      body: "불필요한 수정 없이 핵심에 집중해 완성도를 빠르게 끌어올립니다.",
      icon: <PreciseFeedbackIcon />,
    },
  ],
  // Step 2: 빠르게 — FAST DELIVERY
  [
    {
      label: "01",
      title: "민첩한 착수",
      body: "확정된 방향을 즉시 화면으로 옮겨 프로젝트 초기 속도를 확보합니다.",
      icon: <AgileStartIcon />,
    },
    {
      label: "02",
      title: "일정 관리",
      body: "필요한 시점에 맞춰 안정적으로 진행하며 퀄리티와 속도를 함께 지킵니다.",
      icon: <ScheduleIcon />,
    },
    {
      label: "03",
      title: "결과 전달",
      body: "완성된 결과물을 깔끔하게 정리해 만족스러운 런칭을 이끌어냅니다.",
      icon: <DeliveryIcon />,
    },
  ],
];

export const PROCESS_STEP_COUNT = processSteps.length;

/* ── 핸들 타입 ────────────────────────────────────────── */

export type ProcessCardsHandle = {
  animateToStep: (step: number, onComplete?: () => void) => void;
  setStepInstant: (step: number) => void;
};

/* ── 컴포넌트 ─────────────────────────────────────────── */

const FLIP_DURATION = 0.62;
const FLIP_REDUCED = 0.2;

function ProcessCardsImpl(
  _: {},
  ref: ForwardedRef<ProcessCardsHandle>,
) {
  const containerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const previousStepRef = useRef(0);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const clamp = useCallback(
    (v: number) => Math.max(0, Math.min(PROCESS_STEP_COUNT - 1, v)),
    [],
  );

  const stop = useCallback(() => {
    tlRef.current?.kill();
    tlRef.current = null;
  }, []);

  const setStepInstant = useCallback(
    (step: number) => {
      stop();
      const s = clamp(step);
      containerRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, {
          rotateX: i === s ? 0 : 90,
          autoAlpha: i === s ? 1 : 0,
          scale: i === s ? 1 : 0.92,
          y: 0,
          zIndex: i === s ? 2 : 1,
        });
      });
      previousStepRef.current = s;
    },
    [clamp, stop],
  );

  const animateToStep = useCallback(
    (step: number, onComplete?: () => void) => {
      stop();
      const next = clamp(step);
      const prev = clamp(previousStepRef.current);
      if (next === prev) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const dur = reduced ? FLIP_REDUCED : FLIP_DURATION;

      const prevEl = containerRefs.current[prev];
      const nextEl = containerRefs.current[next];
      if (!prevEl || !nextEl) return;

      const goingForward = next > prev;

      // 나머지 모두 숨기기
      containerRefs.current.forEach((el, i) => {
        if (!el || i === prev || i === next) return;
        gsap.set(el, { autoAlpha: 0, rotateX: 90, scale: 0.92, zIndex: 1 });
      });

      // 현재 카드: 보이는 상태
      gsap.set(prevEl, { zIndex: 3, autoAlpha: 1, rotateX: 0, scale: 1, y: 0 });
      // 다음 카드: 뒤에서 대기 (반대 방향에서 접혀 있음)
      gsap.set(nextEl, {
        zIndex: 2,
        autoAlpha: 0.4,
        rotateX: goingForward ? -45 : 45,
        scale: 0.92,
        y: goingForward ? -30 : 30,
      });

      tlRef.current = gsap
        .timeline({
          defaults: { force3D: true, overwrite: "auto" },
          onComplete: () => {
            tlRef.current = null;
            onComplete?.();
          },
        })
        // 1단계: 현재 카드가 반대쪽으로 접히며 사라짐
        .to(prevEl, {
          rotateX: goingForward ? 60 : -60,
          scale: 0.92,
          y: goingForward ? 20 : -20,
          autoAlpha: 0,
          duration: dur * 0.5,
          ease: "power3.in",
        }, 0)
        // 2단계: 다음 카드가 반대쪽에서 펼쳐지며 등장
        .to(nextEl, {
          rotateX: 0,
          scale: 1,
          y: 0,
          autoAlpha: 1,
          zIndex: 3,
          duration: dur * 0.6,
          ease: "power2.out",
        }, dur * 0.3);

      previousStepRef.current = next;
    },
    [clamp, stop],
  );

  useImperativeHandle(ref, () => ({ animateToStep, setStepInstant }), [
    animateToStep,
    setStepInstant,
  ]);

  useLayoutEffect(() => {
    setStepInstant(0);
    return () => stop();
  }, [setStepInstant, stop]);

  return (
    <div
      className="relative size-full"
      style={{ perspective: "1400px" }}
    >
      {processSteps.map((cards, stepIndex) => (
        <div
          key={stepIndex}
          ref={(el) => { containerRefs.current[stepIndex] = el; }}
          className="absolute inset-0 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-5 lg:gap-6 will-change-transform"
          style={{ transformOrigin: "center 40%", backfaceVisibility: "hidden" }}
        >
          {cards.map((card) => (
            <div
              key={card.title}
              className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-ink/[0.07] bg-white/60 p-6 text-center backdrop-blur-xl transition-shadow sm:p-8 lg:p-10 hover:shadow-[0_24px_80px_rgba(20,16,20,0.08)]"
            >
              {/* 아이콘 */}
              <div className="mb-4 size-16 text-ink/80 sm:mb-5 sm:size-20 lg:size-24">
                {card.icon}
              </div>

              {/* 번호 */}
              <p className="eyebrow mb-2 text-brand/60">{card.label}</p>

              {/* 타이틀 */}
              <h3 className="text-lg font-semibold leading-snug tracking-tight text-ink sm:text-xl lg:text-[1.35rem]">
                {card.title}
              </h3>

              {/* 본문 */}
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted sm:text-[0.94rem]">
                {card.body}
              </p>

              {/* 미묘한 브랜드 그래디언트 하이라이트 */}
              <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-brand/[0.04] opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const ProcessCards = forwardRef<ProcessCardsHandle>(ProcessCardsImpl);
export default ProcessCards;
