import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, type ForwardedRef } from "react";
import gsap from "gsap";

type StoryStep = {
  eyebrow: string;
  title: string;
  body: string;
};

const storySteps: StoryStep[] = [
  {
    eyebrow: "SIGNATURE STORY",
    title: "품격있게",
    body: "핵심 가치, 신뢰 포인트, 다음 행동을 세 단계로 정리해 스크롤 흐름 안에서 고객의 결심이 자연스럽게 이어지도록 설계했습니다.",
  },
  {
    eyebrow: "BRAND MESSAGE",
    title: "설득력있게",
    body: "브랜드의 강점을 단순 나열하지 않고, 고객이 바로 이해할 수 있는 언어와 구조로 재배치합니다.",
  },
  {
    eyebrow: "USER FLOW",
    title: "부드럽게",
    body: "시선의 흐름과 정보 우선순위를 정리해 이탈 없이 다음 섹션으로 연결되도록 구성합니다.",
  },
  {
    eyebrow: "CONVERSION",
    title: "빠르게",
    body: "핵심 문장과 행동 유도를 정교하게 배치해 짧은 순간 안에 결정을 끌어낼 수 있게 만듭니다.",
  },
];

export const STORY_STEP_COUNT = storySteps.length;
export const STORY_SCROLL_PER_STEP = 450;
export const STORY_SCENE_SCROLL_DISTANCE = STORY_STEP_COUNT * STORY_SCROLL_PER_STEP;

export type StoryScrollSectionHandle = {
  animateToStep: (step: number) => void;
  setStepInstant: (step: number) => void;
};

type StoryScrollSectionProps = {};

function StoryScrollSectionImpl(_: StoryScrollSectionProps, ref: ForwardedRef<StoryScrollSectionHandle>) {
  const titleRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const eyebrowRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const bodyRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const previousStepRef = useRef(0);

  const getLayers = () => {
    const titleNodes = titleRefs.current.filter(Boolean) as HTMLParagraphElement[];
    const eyebrowNodes = eyebrowRefs.current.filter(Boolean) as HTMLParagraphElement[];
    const bodyNodes = bodyRefs.current.filter(Boolean) as HTMLParagraphElement[];

    if (titleNodes.length !== STORY_STEP_COUNT || eyebrowNodes.length !== STORY_STEP_COUNT || bodyNodes.length !== STORY_STEP_COUNT) {
      return null;
    }

    return storySteps.map((_, index) => [titleNodes[index], eyebrowNodes[index], bodyNodes[index]]);
  };

  const clampStep = (value: number) => Math.max(0, Math.min(STORY_STEP_COUNT - 1, value));

  const setStepInstant = (step: number) => {
    const layers = getLayers();

    if (!layers) {
      return;
    }

    const nextIndex = clampStep(step);
    gsap.set(layers.flat(), { autoAlpha: 0, y: 0 });
    gsap.set(layers[nextIndex], { autoAlpha: 1, y: 0 });
    previousStepRef.current = nextIndex;
  };

  const animateToStep = (step: number) => {
    const layers = getLayers();

    if (!layers) {
      return;
    }

    const nextIndex = clampStep(step);
    const previousIndex = clampStep(previousStepRef.current);

    if (nextIndex === previousIndex) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shiftY = reduceMotion ? 0 : 12;
    const transitionDuration = reduceMotion ? 0.14 : 0.5;

    gsap
      .timeline({ defaults: { ease: "power2.out" } })
      .to(
        layers[previousIndex],
        {
          autoAlpha: 0,
          y: -shiftY,
          duration: transitionDuration,
        },
        0,
      )
      .fromTo(
        layers[nextIndex],
        {
          autoAlpha: 0,
          y: shiftY,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: transitionDuration,
        },
        0,
      );

    previousStepRef.current = nextIndex;
  };

  useImperativeHandle(
    ref,
    () => ({
      animateToStep,
      setStepInstant,
    }),
    [],
  );

  useLayoutEffect(() => {
    setStepInstant(0);
  }, []);

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
              className="eyebrow"
            >
              {step.eyebrow}
            </p>
            <p
              ref={(node) => {
                bodyRefs.current[index] = node;
              }}
              className="max-w-xl text-base leading-7 text-ink-muted md:text-lg"
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
