import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ForwardedRef,
} from "react";
import gsap from "gsap";

type ProcessPoint = {
  number: string;
  title: string;
};

type ProcessStep = ProcessPoint[];

const processSteps: ProcessStep[] = [
  [
    { number: "01", title: "고객이 신뢰하는 디자인으로 시작합니다" },
    { number: "02", title: "중요한 정보가 한눈에 보이게 정리합니다" },
    { number: "03", title: "문의·예약까지 자연스럽게 연결합니다" },
  ],
  [
    { number: "01", title: "원하시는 분위기만 말씀해 주세요" },
    { number: "02", title: "전문 용어 없이 쉽게 소통합니다" },
    { number: "03", title: "수정 사항도 빠르게 반영합니다" },
  ],
  [
    { number: "01", title: "빠르게 초안을 보여드립니다" },
    { number: "02", title: "진행 상황을 투명하게 공유합니다" },
    { number: "03", title: "약속한 일정에 맞춰 오픈합니다" },
  ],
];

export const PROCESS_STEP_COUNT = processSteps.length;

export type ProcessCardsHandle = {
  animateToStep: (step: number, onComplete?: () => void) => void;
  setStepInstant: (step: number) => void;
};

const TRANSITION_DURATION = 0.42;
const TRANSITION_REDUCED = 0.18;

function ProcessCardsImpl(_: {}, ref: ForwardedRef<ProcessCardsHandle>) {
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const previousStepRef = useRef(0);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);

  const clamp = useCallback(
    (value: number) => Math.max(0, Math.min(PROCESS_STEP_COUNT - 1, value)),
    [],
  );

  const stop = useCallback(() => {
    transitionRef.current?.kill();
    transitionRef.current = null;
  }, []);

  const setStepInstant = useCallback((step: number) => {
    stop();
    const nextStep = clamp(step);

    stepRefs.current.forEach((node, index) => {
      if (!node) return;
      gsap.set(node, {
        autoAlpha: index === nextStep ? 1 : 0,
        y: 0,
      });
    });

    previousStepRef.current = nextStep;
  }, [clamp, stop]);

  const animateToStep = useCallback((step: number, onComplete?: () => void) => {
    stop();

    const nextStep = clamp(step);
    const previousStep = clamp(previousStepRef.current);

    if (nextStep === previousStep) {
      return;
    }

    const previousNode = stepRefs.current[previousStep];
    const nextNode = stepRefs.current[nextStep];

    if (!previousNode || !nextNode) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const direction = nextStep > previousStep ? 1 : -1;
    const duration = reduceMotion ? TRANSITION_REDUCED : TRANSITION_DURATION;

    gsap.set(nextNode, {
      autoAlpha: 0,
      y: reduceMotion ? 0 : 14 * direction,
    });

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
      .to(previousNode, {
        autoAlpha: 0,
        y: reduceMotion ? 0 : -10 * direction,
        duration: duration * 0.7,
      }, 0)
      .to(nextNode, {
        autoAlpha: 1,
        y: 0,
        duration,
      }, reduceMotion ? 0 : 0.08);

    previousStepRef.current = nextStep;
  }, [clamp, stop]);

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
      stop();
    };
  }, [setStepInstant, stop]);

  return (
    <div className="relative size-full min-h-[90px]">
      {processSteps.map((points, stepIndex) => (
        <div
          key={`process-step-${stepIndex}`}
          ref={(node) => {
            stepRefs.current[stepIndex] = node;
          }}
          className="absolute inset-0 will-change-transform"
        >
          {/* ── Orbital line + dots ── */}
          <div className="relative flex w-full items-start">
            {/* Connecting line behind dots */}
            <div className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-[6px]">
              <div className="h-px w-full bg-gradient-to-r from-brand/10 via-brand/22 to-brand/10" />
              <div className="absolute inset-x-[20%] -top-px h-[3px] bg-gradient-to-r from-transparent via-brand/10 to-transparent blur-[2px]" />
            </div>

            {points.map((point, pi) => (
              <div key={`${stepIndex}-${pi}`} className="flex flex-1 flex-col items-center">
                {/* Orbital dot */}
                <div className="relative">
                  <div className="flex h-[13px] w-[13px] items-center justify-center rounded-full border border-brand/20 bg-white/80 backdrop-blur-sm">
                    <div className="h-1 w-1 rounded-full bg-brand/50" />
                  </div>
                  <div className="absolute -inset-1 rounded-full bg-brand/[0.05] blur-[3px]" />
                </div>

                {/* Number */}
                <p className="mt-2 font-display text-[0.68rem] tracking-[0.2em] text-brand/50">
                  {point.number}
                </p>

                {/* Title */}
                <p className="mt-1 max-w-[190px] text-center text-[0.78rem] leading-[1.4] text-ink/65 sm:max-w-[210px]">
                  {point.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const ProcessCards = forwardRef<ProcessCardsHandle>(ProcessCardsImpl);

export default ProcessCards;
