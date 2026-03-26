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
    progressLabel: "신뢰",
    keyword: "신뢰감",
    headline: "고객이 3초 안에 '여기 괜찮다'고 느끼는 홈페이지.",
    body:
      "아무리 좋은 서비스를 갖고 있어도, 홈페이지가 허술하면 고객은 떠납니다. 깔끔하고 세련된 디자인이 말보다 먼저 신뢰를 만들고, 문의와 예약으로 자연스럽게 이어지게 합니다.",
    pullQuote: "홈페이지 하나로, 방문자가 고객이 됩니다.",
    detailTitle: "디자인이 곧 매출입니다",
    detailBody:
      "방문자의 75%는 홈페이지 디자인만 보고 그 업체를 판단합니다. 전문적인 첫인상이 문의와 매출로 이어집니다.",
    reactions: [
      "'여기 뭔가 다르다'는 첫인상",
      "'한번 연락해볼까'라는 마음",
      "경쟁사보다 먼저 기억에 남는 브랜드",
    ],
  },
  {
    eyebrow: "Scene 02",
    progressLabel: "소통",
    keyword: "편안하게",
    headline: "웹사이트, 전혀 몰라도 괜찮습니다. 전부 알아서 해드려요.",
    body:
      "기획서도, 전문 용어도 필요 없습니다. 원하시는 분위기만 편하게 말씀해 주세요. 어떤 느낌이 좋은지, 어떤 정보를 넣고 싶은지 대화하다 보면 방향이 잡힙니다. 복잡한 건 Gonish가 전부 처리합니다.",
    pullQuote: "대화만 하시면, 완성은 저희 몫입니다.",
    detailTitle: "전문 지식 없이도 만족스러운 결과",
    detailBody:
      "어떤 업종이든, 어떤 규모든 상관없습니다. 사장님이 말씀해주신 것만으로 충분히 멋진 결과가 나옵니다.",
    reactions: [
      "전문 용어 없이 편하게 소통",
      "내가 원하는 게 그대로 반영되는 경험",
      "수정 사항도 빠르고 깔끔하게 처리",
    ],
  },
  {
    eyebrow: "Scene 03",
    progressLabel: "속도",
    keyword: "빠르게",
    headline: "기다림 없이, 사업에 바로 도움이 되는 속도.",
    body:
      "홈페이지가 늦어지면 사업 기회도 늦어집니다. Gonish는 빠르게, 하지만 꼼꼼하게 작업합니다. 중간중간 진행 상황을 보여드리니 안심하고 맡기실 수 있습니다.",
    pullQuote: "빠른 오픈이 곧 빠른 매출입니다.",
    detailTitle: "체계적인 일정, 확실한 결과",
    detailBody:
      "정해진 일정 안에 확실하게 완성합니다. 진행 과정을 투명하게 공유하니 불안하게 기다리실 일이 없습니다.",
    reactions: [
      "약속한 일정에 맞춰 확실하게 오픈",
      "중간 확인으로 방향 틀어질 걱정 없음",
      "오픈 후에도 안정적으로 관리",
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
                className="mt-3 max-w-3xl font-display leading-[1.1] tracking-[-0.04em] text-ink"
                style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.8rem)" }}
              >
                {step.headline}
              </h2>

              <p className="mt-3 max-w-2xl text-[0.88rem] leading-[1.7] text-ink-muted sm:text-[0.94rem]">
                {step.body}
              </p>

              <p className="mt-4 max-w-md border-l-2 border-brand/18 pl-4 font-display text-[clamp(0.92rem,1.4vw,1.12rem)] leading-[1.5] text-ink/50">
                {step.pullQuote}
              </p>
            </div>

            {/* ── Right: Detail panel ── */}
            <div className="flex flex-col justify-center border-t border-ink/8 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <p className="font-display text-[clamp(1.2rem,1.7vw,1.65rem)] leading-[1.2] tracking-[-0.03em] text-ink">
                {step.detailTitle}
              </p>

              <p className="mt-3 text-[0.84rem] leading-[1.6] text-ink-muted">
                {step.detailBody}
              </p>

              <div className="mt-4 space-y-2.5">
                {step.reactions.map((reaction, ri) => (
                  <div key={reaction} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-brand/8 font-display text-[9px] text-brand/60">
                      {ri + 1}
                    </span>
                    <p className="text-[0.82rem] leading-[1.45] text-ink/55">{reaction}</p>
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
