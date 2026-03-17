import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ForwardedRef,
} from "react";
import gsap from "gsap";

type StoryStep = {
  eyebrow: string;
  title: string;
  body: string;
};

const storySteps: StoryStep[] = [
  {
    eyebrow: "SIGNATURE DESIGN",
    title: "품격있게",
    body: "브랜드의 분위기와 메시지를 세련되게 정돈해, 첫인상만으로도 신뢰를 전하는 품격 있는 사이트를 만듭니다.",
  },
  {
    eyebrow: "PRECISE DIRECTION",
    title: "정확하게",
    body: "원하는 무드와 목적을 섬세하게 파악해, 불필요한 수정은 줄이고 완성도 높은 결과물로 정확하게 이어갑니다.",
  },
  {
    eyebrow: "FAST DELIVERY",
    title: "빠르게",
    body: "퀄리티의 기준은 놓치지 않으면서도 진행은 민첩하게, 필요한 시점에 맞춘 빠른 제작으로 만족스러운 결과를 전달합니다.",
  },
];

export const STORY_STEP_COUNT = storySteps.length;
export const STORY_SCROLL_PER_STEP = 450;
const STORY_TRANSITION_COUNT = Math.max(1, STORY_STEP_COUNT - 1);
export const STORY_SCENE_SCROLL_DISTANCE = STORY_TRANSITION_COUNT * STORY_SCROLL_PER_STEP;
const STORY_TRANSITION_DURATION = 0.46;
const STORY_REDUCED_MOTION_DURATION = 0.16;
const STORY_SHIFT_Y = 10;
const STORY_ENTER_OFFSET = 0.04;

export type StoryScrollSectionHandle = {
  animateToStep: (step: number, onComplete?: () => void) => boolean;
  setStepInstant: (step: number) => void;
};

type StoryScrollSectionProps = {};

function StoryScrollSectionImpl(_: StoryScrollSectionProps, ref: ForwardedRef<StoryScrollSectionHandle>) {
  const titleRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const eyebrowRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const bodyRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const previousStepRef = useRef(0);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);

  const getLayers = useCallback(() => {
    const titleNodes = titleRefs.current.slice(0, STORY_STEP_COUNT);
    const eyebrowNodes = eyebrowRefs.current.slice(0, STORY_STEP_COUNT);
    const bodyNodes = bodyRefs.current.slice(0, STORY_STEP_COUNT);

    if (
      titleNodes.length !== STORY_STEP_COUNT ||
      eyebrowNodes.length !== STORY_STEP_COUNT ||
      bodyNodes.length !== STORY_STEP_COUNT ||
      titleNodes.some((node) => !node) ||
      eyebrowNodes.some((node) => !node) ||
      bodyNodes.some((node) => !node)
    ) {
      return null;
    }

    return storySteps.map((_, index) => [
      titleNodes[index] as HTMLParagraphElement,
      eyebrowNodes[index] as HTMLParagraphElement,
      bodyNodes[index] as HTMLParagraphElement,
    ]);
  }, []);

  const clampStep = useCallback(
    (value: number) => Math.max(0, Math.min(STORY_STEP_COUNT - 1, value)),
    [],
  );

  const stopTransition = useCallback(() => {
    transitionRef.current?.kill();
    transitionRef.current = null;
  }, []);

  const setStepInstant = useCallback((step: number) => {
    const layers = getLayers();

    if (!layers) {
      return;
    }

    stopTransition();

    const nextIndex = clampStep(step);
    const allNodes = layers.flat();
    gsap.killTweensOf(allNodes);
    gsap.set(allNodes, { autoAlpha: 0, y: 0 });
    gsap.set(layers[nextIndex], { autoAlpha: 1, y: 0 });
    previousStepRef.current = nextIndex;
  }, [clampStep, getLayers, stopTransition]);

  const animateToStep = useCallback((step: number, onComplete?: () => void) => {
    const layers = getLayers();

    if (!layers) {
      return false;
    }

    const nextIndex = clampStep(step);
    const previousIndex = clampStep(previousStepRef.current);

    if (nextIndex === previousIndex) {
      return false;
    }

    stopTransition();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shiftY = reduceMotion ? 0 : STORY_SHIFT_Y;
    const transitionDuration = reduceMotion
      ? STORY_REDUCED_MOTION_DURATION
      : STORY_TRANSITION_DURATION;
    const ease = reduceMotion ? "none" : "power3.out";
    const previousLayer = layers[previousIndex];
    const nextLayer = layers[nextIndex];
    const allNodes = layers.flat();
    const hiddenNodes = allNodes.filter((node) => !previousLayer.includes(node) && !nextLayer.includes(node));

    gsap.killTweensOf(allNodes);
    gsap.set(hiddenNodes, { autoAlpha: 0, y: 0 });
    gsap.set(previousLayer, { autoAlpha: 1, y: 0 });
    gsap.set(nextLayer, { autoAlpha: 0, y: shiftY });

    transitionRef.current = gsap
      .timeline({
        defaults: { ease },
        onComplete: () => {
          transitionRef.current = null;
          onComplete?.();
        },
      })
      .to(
        previousLayer,
        {
          autoAlpha: 0,
          y: -shiftY,
          duration: transitionDuration * 0.92,
          force3D: true,
          overwrite: "auto",
        },
        0,
      )
      .to(
        nextLayer,
        {
          autoAlpha: 1,
          y: 0,
          duration: transitionDuration,
          force3D: true,
          overwrite: "auto",
        },
        STORY_ENTER_OFFSET,
      );

    previousStepRef.current = nextIndex;
    return true;
  }, [clampStep, getLayers, stopTransition]);

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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
      <div className="relative min-h-[clamp(8rem,19vw,12.5rem)]">
        {storySteps.map((step, index) => (
          <p
            key={`title-${step.eyebrow}`}
            ref={(node) => {
              titleRefs.current[index] = node;
            }}
            className="absolute inset-x-0 top-0 font-display [font-family:Paperozi,'Noto_Sans_KR',Aptos,'Segoe_UI',sans-serif] text-[clamp(4.2rem,11vw,10.8rem)] leading-[0.9] tracking-[-0.03em] text-ink will-change-transform"
          >
            {step.title}
          </p>
        ))}
      </div>

      <div className="relative min-h-[clamp(11rem,20vw,14rem)]">
        {storySteps.map((step, index) => (
          <div key={`copy-${step.eyebrow}`} className="absolute inset-x-0 top-0 space-y-4">
            <p
              ref={(node) => {
                eyebrowRefs.current[index] = node;
              }}
              className="eyebrow will-change-transform"
            >
              {step.eyebrow}
            </p>
            <p
              ref={(node) => {
                bodyRefs.current[index] = node;
              }}
              className="max-w-xl text-base leading-7 text-ink-muted will-change-transform md:text-lg"
            >
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const StoryScrollSection = forwardRef<StoryScrollSectionHandle, StoryScrollSectionProps>(StoryScrollSectionImpl);

export default StoryScrollSection;
