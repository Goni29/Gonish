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
      "\"여기는 다르다\"는 조용한 확신",
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

function StoryScrollSectionImpl(_: StoryScrollSectionProps, ref: ForwardedRef<StoryScrollSectionHandle>) {
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const previousStepRef = useRef(0);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const clampStep = useCallback(
    (value: number) => Math.max(0, Math.min(STORY_STEP_COUNT - 1, value)),
    [],
  );

  const stopTransition = useCallback(() => {
    transitionRef.current?.kill();
    transitionRef.current = null;
  }, []);

  const setStepInstant = useCallback((step: number) => {
    stopTransition();
    const nextIndex = clampStep(step);

    stepRefs.current.forEach((node, i) => {
      if (!node) return;
      gsap.set(node, {
        autoAlpha: i === nextIndex ? 1 : 0,
        y: 0,
        scale: 1,
      });
    });

    previousStepRef.current = nextIndex;
    setActiveStep(nextIndex);
  }, [clampStep, stopTransition]);

  const animateToStep = useCallback((step: number, onComplete?: () => void) => {
    const nextIndex = clampStep(step);
    const previousIndex = clampStep(previousStepRef.current);

    if (nextIndex === previousIndex) {
      return false;
    }

    stopTransition();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const direction = nextIndex > previousIndex ? 1 : -1;
    const duration = reduceMotion ? 0.16 : 0.52;

    const prevNode = stepRefs.current[previousIndex];
    const nextNode = stepRefs.current[nextIndex];

    if (!prevNode || !nextNode) return false;

    stepRefs.current.forEach((node, i) => {
      if (node && i !== previousIndex && i !== nextIndex) {
        gsap.set(node, { autoAlpha: 0 });
      }
    });

    gsap.set(nextNode, {
      autoAlpha: 0,
      y: reduceMotion ? 0 : 30 * direction,
      scale: reduceMotion ? 1 : 0.97,
    });

    setActiveStep(nextIndex);

    transitionRef.current = gsap
      .timeline({
        defaults: {
          ease: reduceMotion ? "none" : "power3.out",
          force3D: true,
          overwrite: "auto",
        },
        onComplete: () => {
          transitionRef.current = null;
          onComplete?.();
        },
      })
      .to(prevNode, {
        autoAlpha: 0,
        y: reduceMotion ? 0 : -22 * direction,
        scale: reduceMotion ? 1 : 1.015,
        duration: duration * 0.62,
      }, 0)
      .to(nextNode, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration,
      }, reduceMotion ? 0 : 0.1);

    previousStepRef.current = nextIndex;
    return true;
  }, [clampStep, stopTransition]);

  useImperativeHandle(
    ref,
    () => ({
      animateToStep,
      setStepInstant,
    }),
    [animateToStep, setStepInstant],
  );

  useLayoutEffect(() => {
    setStepInstant(0);

    return () => {
      stopTransition();
    };
  }, [setStepInstant, stopTransition]);

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      {/* ── Ambient atmosphere ── */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 22%, rgba(243,29,91,0.08), transparent 18%), radial-gradient(circle at 85% 12%, rgba(255,224,233,0.70), transparent 20%)",
          }}
        />
        <div className="story-halo-float absolute -left-16 top-[15%] h-44 w-44 rounded-full bg-brand/[0.05] blur-[90px]" />
        <div className="story-halo-float-delayed absolute right-[-3rem] top-[8%] h-40 w-40 rounded-full bg-white/60 blur-[100px]" />
        <div className="story-line-drift absolute inset-x-[18%] top-[28%] h-px bg-gradient-to-r from-transparent via-brand/16 to-transparent" />
      </div>

      {/* ── Progress dots — left edge ── */}
      <div className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex xl:left-5">
        {storySteps.map((step, i) => {
          const isActive = i === activeStep;
          return (
            <div key={step.progressLabel} className="flex items-center gap-2.5">
              <div className="relative">
                <div
                  className="h-2 w-2 rounded-full transition-all duration-500"
                  style={{
                    background: isActive ? "#F31D5B" : "rgba(20,16,20,0.12)",
                    boxShadow: isActive ? "0 0 12px rgba(243,29,91,0.4)" : "none",
                    transform: isActive ? "scale(1.3)" : "scale(1)",
                  }}
                />
                {isActive && (
                  <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-brand/25" />
                )}
              </div>
              <span
                className="text-[0.6rem] uppercase tracking-[0.18em] transition-all duration-400"
                style={{
                  color: isActive ? "#F31D5B" : "rgba(20,16,20,0.25)",
                }}
              >
                {step.progressLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Step layers ── */}
      {storySteps.map((step, index) => (
        <div
          key={step.progressLabel}
          ref={(node) => {
            stepRefs.current[index] = node;
          }}
          className="absolute inset-0 flex items-center will-change-transform"
        >
          {/* Giant faded step number — watermark */}
          <div
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none font-display leading-none tracking-[-0.06em] text-ink/[0.018] sm:right-6"
            style={{ fontSize: "clamp(10rem, 24vw, 18rem)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>

          <div className="relative grid w-full gap-5 px-3 sm:px-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(220px,0.5fr)] lg:gap-8 lg:pl-16 lg:pr-6 xl:pl-20">
            {/* ── Left: Main content ── */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <span className="h-px w-12 bg-brand/35" />
                <p className="eyebrow">{step.eyebrow}</p>
              </div>

              <p
                className="home-story-serif-font mt-2 text-ink/90"
                style={{
                  fontSize: "clamp(3rem, 9vw, 7rem)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.04em",
                }}
              >
                {step.keyword}
              </p>

              <h2
                className="mt-3 max-w-3xl whitespace-pre-line font-display leading-[1.1] tracking-[-0.04em] text-ink"
                style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.8rem)" }}
              >
                {step.headline}
              </h2>

              <p className="mt-3 max-w-2xl whitespace-pre-line text-[0.88rem] leading-[1.7] text-ink-muted sm:text-[0.94rem]">
                {step.body}
              </p>

              <p className="mt-4 max-w-md whitespace-pre-line border-l-2 border-brand/18 pl-4 font-display text-[clamp(0.92rem,1.4vw,1.12rem)] leading-[1.5] text-ink/50">
                {step.pullQuote}
              </p>
            </div>

            {/* ── Right: Detail panel ── */}
            <div className="flex flex-col justify-center border-t border-ink/8 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <p className="whitespace-pre-line font-display text-[clamp(1.2rem,1.7vw,1.65rem)] leading-[1.2] tracking-[-0.03em] text-ink">
                {step.detailTitle}
              </p>

              <p className="mt-3 whitespace-pre-line text-[0.84rem] leading-[1.6] text-ink-muted">
                {step.detailBody}
              </p>

              <div className="mt-4 space-y-2.5">
                {step.reactions.map((reaction, ri) => (
                  <div key={reaction} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-brand/8 font-display text-[9px] text-brand/60">
                      {ri + 1}
                    </span>
                    <p className="whitespace-pre-line text-[0.82rem] leading-[1.45] text-ink/55">{reaction}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ── Mobile progress — bottom ── */}
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
