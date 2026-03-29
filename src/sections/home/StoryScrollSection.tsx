"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ForwardedRef,
} from "react";
import gsap from "gsap";

type StoryStep = {
  body: string;
  detailBody: string;
  detailTitle: string;
  eyebrow: string;
  headline: string;
  keyword: string;
  progressLabel: string;
  pullQuote: string;
  reactions: string[];
};

const storySteps: StoryStep[] = [
  {
    eyebrow: "Scene 01",
    progressLabel: "품격",
    keyword: "품격",
    headline: "첫 화면만으로도, \n브랜드의 수준은 조용히 전달됩니다.",
    body:
      "고객은 설명을 읽기 전에 분위기를 먼저 받아들입니다. 정제된 화면, 균형 잡힌 정보, 섬세한 디테일은 브랜드를 더 신뢰할 만한 선택으로 보이게 합니다. Gonish는 방문이 문의로 이어지는 첫인상을 설계합니다.",
    pullQuote: "처음 스친 순간의 확신이, 결국 선택을 만듭니다.",
    detailTitle: "좋은 디자인은 신뢰를 대신 말합니다",
    detailBody:
      "브랜드의 격은 한 장면 안에서 느껴집니다. 고급스럽게 정돈된 첫인상은 가격보다 먼저 신뢰를 만들고, 비교보다 먼저 마음을 움직입니다.",
    reactions: [
      '"여기는 다르다"는 조용한 확신',
      "가격보다 가치가 먼저 느껴지는 인상",
      "오래 기억되고 다시 찾게 되는 브랜드",
    ],
  },
  {
    eyebrow: "Scene 02",
    progressLabel: "안심",
    keyword: "안심",
    headline: "준비가 완벽하지 않아도 괜찮습니다. \n브랜드의 결만 들려주세요.",
    body:
      "기획서와 전문 용어 없이도 충분합니다. 원하는 무드와 목표를 편하게 말씀해 주시면, 필요한 구조와 표현은 Gonish가 정교하게 정리합니다. 과정은 가볍고, 결과는 깊이 있게 완성합니다.",
    pullQuote: "설명은 편안하게, 완성은 정교하게.",
    detailTitle: "복잡한 준비 없이도 시작할 수 있습니다",
    detailBody:
      "자료가 완벽하지 않아도 괜찮습니다. 대화 속에서 브랜드의 핵심을 선별하고, 고객이 이해하기 쉬운 흐름으로 번역해드립니다.",
    reactions: [
      "어려운 용어 없이도 자연스러운 진행",
      "취향과 목표가 세심하게 반영되는 과정",
      "피드백이 가볍고 매끄럽게 이어지는 경험",
    ],
  },
  {
    eyebrow: "Scene 03",
    progressLabel: "완성",
    keyword: "완성",
    headline: "늦지 않게, 가볍지 않게. \n완성도 높은 속도로 오픈합니다.",
    body:
      "런칭이 늦어질수록 기회도 함께 미뤄집니다. Gonish는 빠른 초안과 명확한 진행 공유로 불확실성을 줄이고, 약속한 일정 안에서 품질을 놓치지 않는 제작을 지향합니다.",
    pullQuote: "속도는 빠르게, 완성은 우아하게.",
    detailTitle: "일정은 명확하게, 결과는 단단하게",
    detailBody:
      "중간 단계마다 필요한 판단만 편하게 하실 수 있도록 정리합니다. 불필요한 지연 없이, 브랜드의 완성도를 지키며 오픈까지 이어갑니다.",
    reactions: [
      "빠른 초안으로 초반 감도를 먼저 확인",
      "과정이 투명해 일정이 흔들리지 않는 진행",
      "오픈 이후까지 안정감을 남기는 마무리",
    ],
  },
];

export const STORY_STEP_COUNT = storySteps.length;
export const STORY_SCROLL_PER_STEP = 450;
const STORY_TRANSITION_COUNT = Math.max(1, STORY_STEP_COUNT - 1);
export const STORY_SCENE_SCROLL_DISTANCE = STORY_TRANSITION_COUNT * STORY_SCROLL_PER_STEP;

export type StoryScrollSectionHandle = {
  animateToStep: (step: number, onComplete?: () => void) => boolean;
  setStepInstant: (step: number) => void;
};

type StoryScrollSectionProps = {};

// ── Orbit geometry (mirrored from SignatureSection) ──────────────────────────
const VW = 700;
const VH = 420;
const CX = 350;
const CY = 174;
const ORBIT_RX = 252;
const ORBIT_RY = 94;
const ORBIT_ROT = -14;
const ORBIT_SLOT_DEG = [220, 332] as const;
const ORBIT_SLOT_SCALE = [0.32, 0.34] as const;
const ORBIT_LABEL_Y = 0;
const ACTIVE_ORBIT_DEG = 92;
const FEATURED_X = 350;
const FEATURED_Y = 282;
const FEATURED_SIZE = "clamp(11.5rem, 45vw, 18rem)";
const ROT_RAD = (ORBIT_ROT * Math.PI) / 180;

function getOrbitPoint(deg: number, offset = 0) {
  const rad = (deg * Math.PI) / 180;
  const lx = (ORBIT_RX + offset) * Math.cos(rad);
  const ly = (ORBIT_RY + offset * 0.4) * Math.sin(rad);
  return {
    x: CX + lx * Math.cos(ROT_RAD) - ly * Math.sin(ROT_RAD),
    y: CY + lx * Math.sin(ROT_RAD) + ly * Math.cos(ROT_RAD),
  };
}

const ORBIT_SLOTS = ORBIT_SLOT_DEG.map((deg) => getOrbitPoint(deg));
const ACTIVE_ORBIT_POINT = getOrbitPoint(ACTIVE_ORBIT_DEG, -10);
const ARC_START = getOrbitPoint(0);
const ARC_END = getOrbitPoint(180);
const BACK_ARC = `M ${ARC_START.x} ${ARC_START.y} A ${ORBIT_RX} ${ORBIT_RY} ${ORBIT_ROT} 0 0 ${ARC_END.x} ${ARC_END.y}`;
const FRONT_ARC = `M ${ARC_START.x} ${ARC_START.y} A ${ORBIT_RX} ${ORBIT_RY} ${ORBIT_ROT} 0 1 ${ARC_END.x} ${ARC_END.y}`;

function orbitSlotOf(i: number, step: number) {
  if (i === step) return -1;
  const visibleOrder = [(step + 1) % STORY_STEP_COUNT, (step + 2) % STORY_STEP_COUNT];
  return visibleOrder.indexOf(i);
}

type PlanetProxy = { x: number; y: number; sc: number; labelY: number; opacity: number };

// ─────────────────────────────────────────────────────────────────────────────

function StoryScrollSectionImpl(_: StoryScrollSectionProps, ref: ForwardedRef<StoryScrollSectionHandle>) {
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const previousStepRef = useRef(0);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);
  const featuredPlanetRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const planetGroupRef = useRef<(SVGGElement | null)[]>([null, null, null]);
  const planetInnerRef = useRef<(SVGGElement | null)[]>([null, null, null]);
  const planetGlowRef = useRef<(SVGCircleElement | null)[]>([null, null, null]);
  const planetCircleRef = useRef<(SVGCircleElement | null)[]>([null, null, null]);
  const planetRingRef = useRef<(SVGEllipseElement | null)[]>([null, null, null]);
  const planetLabelRef = useRef<(SVGTextElement | null)[]>([null, null, null]);

  const proxies = useRef<PlanetProxy[]>(
    storySteps.map((_, i) => {
      const slot = orbitSlotOf(i, 0);
      if (slot === -1) return { x: ACTIVE_ORBIT_POINT.x, y: ACTIVE_ORBIT_POINT.y, sc: 0.4, labelY: ORBIT_LABEL_Y, opacity: 0 };
      return { x: ORBIT_SLOTS[slot].x, y: ORBIT_SLOTS[slot].y, sc: ORBIT_SLOT_SCALE[slot], labelY: ORBIT_LABEL_Y, opacity: 1 };
    }),
  );

  const applyPlanet = useCallback((i: number) => {
    const proxy = proxies.current[i];
    const group = planetGroupRef.current[i];
    if (group) {
      group.setAttribute("transform", `translate(${proxy.x.toFixed(1)},${proxy.y.toFixed(1)})`);
      group.setAttribute("opacity", proxy.opacity.toFixed(3));
    }
    planetInnerRef.current[i]?.setAttribute("transform", `scale(${proxy.sc.toFixed(3)})`);
    planetLabelRef.current[i]?.setAttribute("y", proxy.labelY.toFixed(1));
  }, []);

  const applyPlanetStyle = useCallback((i: number, isVisible: boolean) => {
    planetCircleRef.current[i]?.setAttribute("fill", isVisible ? "rgba(243,29,91,0.55)" : "rgba(243,29,91,0.24)");
    const ring = planetRingRef.current[i];
    if (ring) {
      ring.setAttribute("stroke", isVisible ? "rgba(243,29,91,0.42)" : "rgba(243,29,91,0.16)");
      ring.setAttribute("stroke-width", isVisible ? "1.6" : "1.1");
    }
    planetGlowRef.current[i]?.setAttribute("opacity", isVisible ? "0.55" : "0");
    const label = planetLabelRef.current[i];
    if (label) {
      label.setAttribute("fill", isVisible ? "rgba(243,29,91,0.72)" : "rgba(243,29,91,0.26)");
    }
  }, []);

  const animatePlanets = useCallback((step: number) => {
    storySteps.forEach((_, i) => {
      const slot = orbitSlotOf(i, step);
      const isVisible = slot !== -1;
      const target = isVisible ? ORBIT_SLOTS[slot] : ACTIVE_ORBIT_POINT;
      applyPlanetStyle(i, isVisible);
      gsap.to(proxies.current[i], {
        x: target.x,
        y: target.y,
        sc: isVisible ? ORBIT_SLOT_SCALE[slot as 0 | 1] : 0.4,
        labelY: ORBIT_LABEL_Y,
        opacity: isVisible ? 1 : 0,
        duration: 0.65,
        ease: "power2.inOut",
        overwrite: true,
        onUpdate: () => applyPlanet(i),
      });
    });
  }, [applyPlanet, applyPlanetStyle]);

  const snapPlanets = useCallback((step: number) => {
    storySteps.forEach((_, i) => {
      gsap.killTweensOf(proxies.current[i]);
      const slot = orbitSlotOf(i, step);
      const isVisible = slot !== -1;
      const target = isVisible ? ORBIT_SLOTS[slot] : ACTIVE_ORBIT_POINT;
      proxies.current[i] = {
        x: target.x, y: target.y,
        sc: isVisible ? ORBIT_SLOT_SCALE[slot as 0 | 1] : 0.4,
        labelY: ORBIT_LABEL_Y,
        opacity: isVisible ? 1 : 0,
      };
      applyPlanet(i);
      applyPlanetStyle(i, isVisible);
    });
  }, [applyPlanet, applyPlanetStyle]);

  const stopTransition = useCallback(() => {
    transitionRef.current?.kill();
    transitionRef.current = null;
  }, []);

  const clampStep = useCallback((value: number) => Math.max(0, Math.min(STORY_STEP_COUNT - 1, value)), []);

  const setStepInstant = useCallback((step: number) => {
    stopTransition();
    const nextIndex = clampStep(step);
    stepRefs.current.forEach((node, i) => {
      if (!node) return;
      gsap.set(node, { autoAlpha: i === nextIndex ? 1 : 0, y: 0, scale: 1 });
    });
    snapPlanets(nextIndex);
    previousStepRef.current = nextIndex;
    setActiveStep(nextIndex);
  }, [clampStep, snapPlanets, stopTransition]);

  const animateToStep = useCallback((step: number, onComplete?: () => void) => {
    const nextIndex = clampStep(step);
    const previousIndex = clampStep(previousStepRef.current);
    if (nextIndex === previousIndex) return false;

    stopTransition();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const direction = nextIndex > previousIndex ? 1 : -1;
    const duration = reduceMotion ? 0.16 : 0.52;

    const prevNode = stepRefs.current[previousIndex];
    const nextNode = stepRefs.current[nextIndex];
    if (!prevNode || !nextNode) return false;

    stepRefs.current.forEach((node, i) => {
      if (node && i !== previousIndex && i !== nextIndex) gsap.set(node, { autoAlpha: 0 });
    });

    gsap.set(nextNode, { autoAlpha: 0, y: reduceMotion ? 0 : 30 * direction, scale: reduceMotion ? 1 : 0.97 });
    setActiveStep(nextIndex);
    animatePlanets(nextIndex);

    transitionRef.current = gsap
      .timeline({
        defaults: { ease: reduceMotion ? "none" : "power3.out", force3D: true, overwrite: "auto" },
        onComplete: () => { transitionRef.current = null; onComplete?.(); },
      })
      .to(prevNode, { autoAlpha: 0, y: reduceMotion ? 0 : -22 * direction, scale: reduceMotion ? 1 : 1.015, duration: duration * 0.62 }, 0)
      .to(nextNode, { autoAlpha: 1, y: 0, scale: 1, duration }, reduceMotion ? 0 : 0.1);

    previousStepRef.current = nextIndex;
    return true;
  }, [animatePlanets, clampStep, stopTransition]);

  useImperativeHandle(ref, () => ({ animateToStep, setStepInstant }), [animateToStep, setStepInstant]);

  useLayoutEffect(() => {
    setStepInstant(0);
    return () => { stopTransition(); };
  }, [setStepInstant, stopTransition]);

  useLayoutEffect(() => {
    const node = featuredPlanetRef.current;
    if (!node) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.fromTo(
      node,
      { autoAlpha: reduceMotion ? 1 : 0.45, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.9 },
      { autoAlpha: 1, y: 0, scale: 1, duration: reduceMotion ? 0.01 : 0.7, ease: "power3.out", overwrite: true },
    );
  }, [activeStep]);

  const activePlanet = storySteps[activeStep];

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      {/* Ambient atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 22%, rgba(243,29,91,0.08), transparent 18%), radial-gradient(circle at 85% 12%, rgba(255,224,233,0.70), transparent 20%)",
          }}
        />
      </div>

      <div className="flex h-full flex-col items-center gap-5 lg:flex-row lg:items-center lg:gap-12 xl:gap-16">

        {/* ── Left: Orbit SVG stage ── */}
        <div className="relative shrink-0 self-center pb-4 lg:pb-0" style={{ width: "min(100%, min(58vw, 700px))" }}>

          {/* Featured planet — active keyword */}
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(FEATURED_X / VW) * 100}%`, top: `${(FEATURED_Y / VH) * 100}%`, width: FEATURED_SIZE }}
            aria-hidden="true"
          >
            <div ref={featuredPlanetRef} className="relative will-change-transform">
              <svg viewBox="0 0 220 220" className="w-full" style={{ overflow: "visible" }}>
                <defs>
                  <filter id="sss-glow" x="-90%" y="-90%" width="280%" height="280%">
                    <feGaussianBlur stdDeviation="14" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <circle cx="110" cy="110" r="74" fill="rgba(243,29,91,0.08)" filter="url(#sss-glow)" />
                <circle cx="110" cy="112" r="58" fill="rgba(255,253,252,0.96)" stroke="#F31D5B" strokeWidth="7" />
                <ellipse cx="110" cy="112" rx="88" ry="24" fill="none" stroke="#F31D5B" strokeWidth="7" transform="rotate(-28 110 112)" />
                <ellipse cx="110" cy="112" rx="70" ry="18" fill="none" stroke="rgba(243,29,91,0.22)" strokeWidth="3" transform="rotate(-28 110 112)" />
                <text
                  x="110" y="114"
                  textAnchor="middle" dominantBaseline="middle"
                  fontFamily="'Paperozi', 'Noto Sans KR', sans-serif"
                  fontSize="32" fontWeight="700"
                  fill="#8B1842"
                >
                  {activePlanet.keyword}
                </text>
              </svg>
            </div>
          </div>

          {/* Orbit ring SVG */}
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            style={{ overflow: "visible" }}
            aria-hidden="true"
          >
            <defs>
              <filter id="sss-sun" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="9" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="sss-planet" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="sss-aura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(243,29,91,0.13)" />
                <stop offset="100%" stopColor="rgba(243,29,91,0)" />
              </radialGradient>
            </defs>

            <ellipse cx={CX} cy={CY} rx={88} ry={60} fill="url(#sss-aura)" />
            <ellipse cx={CX} cy={CY} rx={ORBIT_RX + 38} ry={ORBIT_RY + 20} fill="none" stroke="rgba(243,29,91,0.04)" strokeWidth="28" transform={`rotate(${ORBIT_ROT} ${CX} ${CY})`} />

            {/* Back arc */}
            <path d={BACK_ARC} fill="none" stroke="rgba(243,29,91,0.07)" strokeWidth="8" />
            <path d={BACK_ARC} fill="none" stroke="rgba(243,29,91,0.16)" strokeWidth="1.5" strokeDasharray="9 6" strokeLinecap="round" style={{ animation: "orbitRingFlow 32s linear infinite" }} />

            {/* Orbiting planets */}
            {storySteps.map((step, i) => {
              const initialSlot = orbitSlotOf(i, 0);
              const initialVisible = initialSlot !== -1;
              const initialPoint = initialVisible ? ORBIT_SLOTS[initialSlot] : ACTIVE_ORBIT_POINT;
              const initialScale = initialVisible ? ORBIT_SLOT_SCALE[initialSlot as 0 | 1] : 0.4;

              return (
                <g
                  key={step.keyword}
                  ref={(node) => { planetGroupRef.current[i] = node; }}
                  transform={`translate(${initialPoint.x},${initialPoint.y})`}
                  opacity={initialVisible ? 1 : 0}
                >
                  <circle ref={(node) => { planetGlowRef.current[i] = node; }} cx={0} cy={0} r={54} fill="rgba(243,29,91,0.09)" filter="url(#sss-planet)" opacity={initialVisible ? "0.55" : "0"} />
                  <g ref={(node) => { planetInnerRef.current[i] = node; }} transform={`scale(${initialScale})`}>
                    <circle ref={(node) => { planetCircleRef.current[i] = node; }} cx={0} cy={0} r={24} fill="rgba(243,29,91,0.55)" />
                    <ellipse ref={(node) => { planetRingRef.current[i] = node; }} cx={0} cy={0} rx={42} ry={10} fill="none" stroke="rgba(243,29,91,0.42)" strokeWidth="1.6" transform="rotate(-28)" />
                    <ellipse cx={0} cy={0} rx={32} ry={7.5} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" transform="rotate(-28)" />
                  </g>
                  <text
                    ref={(node) => { planetLabelRef.current[i] = node; }}
                    x={0} y={ORBIT_LABEL_Y}
                    textAnchor="middle" dominantBaseline="middle"
                    fontFamily="'Paperozi', 'Noto Sans KR', sans-serif"
                    fontSize="14px" fontWeight="500"
                    fill="rgba(243,29,91,0.72)"
                  >
                    {step.keyword}
                  </text>
                </g>
              );
            })}

            {/* Front arc */}
            <path d={FRONT_ARC} fill="none" stroke="rgba(243,29,91,0.11)" strokeWidth="9" />
            <path d={FRONT_ARC} fill="none" stroke="rgba(243,29,91,0.30)" strokeWidth="2" strokeDasharray="9 6" strokeLinecap="round" style={{ animation: "orbitRingFlow 32s linear infinite" }} />

            {/* Gonish center */}
            <text
              x={CX} y={CY + 5}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="58"
              fontFamily="'Snell Roundhand', 'Segoe Script', 'Brush Script MT', 'Apple Chancery', cursive"
              fill="#F31D5B"
              opacity="0.9"
              filter="url(#sss-sun)"
            >
              Gonish
            </text>
          </svg>
        </div>

        {/* ── Right: Content panel ── */}
        <div className="relative w-full flex-1 self-center" style={{ minHeight: "clamp(220px, 38vh, 360px)" }}>
          {storySteps.map((step, index) => (
            <div
              key={step.progressLabel}
              ref={(node) => { stepRefs.current[index] = node; }}
              className="absolute inset-0 flex flex-col justify-center will-change-transform"
            >
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-brand/40" />
                <p className="eyebrow">{step.eyebrow}</p>
              </div>

              <p
                className="home-story-serif-font mt-2 leading-none text-ink/80"
                style={{ fontSize: "clamp(3.2rem, 7vw, 6rem)", letterSpacing: "-0.04em" }}
              >
                {step.keyword}
              </p>

              <h2
                className="mt-3 whitespace-pre-line font-display leading-[1.1] tracking-[-0.04em] text-ink"
                style={{ fontSize: "clamp(1.1rem, 1.9vw, 1.75rem)" }}
              >
                {step.headline}
              </h2>

              <p className="mt-3 max-w-lg text-[0.87rem] leading-[1.78] text-ink-muted sm:text-[0.92rem]">
                {step.body}
              </p>

              <p className="mt-3 max-w-md border-l-2 border-brand/18 pl-4 font-display text-[clamp(0.88rem,1.3vw,1.05rem)] leading-[1.5] text-ink/50">
                {step.pullQuote}
              </p>

              <div className="mt-4 space-y-2">
                {step.reactions.map((r) => (
                  <div key={r} className="flex items-start gap-2.5">
                    <span className="mt-[0.38rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand/55" />
                    <p className="text-[0.80rem] leading-[1.5] text-ink/50">{r}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile progress dots ── */}
      <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-2 lg:hidden">
        {storySteps.map((step, i) => (
          <div
            key={`mobile-${step.progressLabel}`}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === activeStep ? "1.6rem" : "0.35rem",
              height: "0.35rem",
              background: i === activeStep ? "#F31D5B" : "rgba(20,16,20,0.14)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const StoryScrollSection = forwardRef<StoryScrollSectionHandle, StoryScrollSectionProps>(StoryScrollSectionImpl);

export default StoryScrollSection;
