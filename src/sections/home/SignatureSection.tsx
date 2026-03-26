import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "@/components/layout/SmoothScroll";
import ProcessCards, {
  type ProcessCardsHandle,
} from "@/sections/home/ProcessCards";
import StoryScrollSection, {
  STORY_STEP_COUNT,
  type StoryScrollSectionHandle,
} from "@/sections/home/StoryScrollSection";

gsap.registerPlugin(ScrollTrigger, Observer);

const LAST_STEP = STORY_STEP_COUNT - 1;
const PIN_SCROLL_DISTANCE = STORY_STEP_COUNT * 320;

export default function SignatureSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<StoryScrollSectionHandle | null>(null);
  const cardsRef = useRef<ProcessCardsHandle | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    let currentStep = 0;
    let isAnimating = false;
    let trigger: ScrollTrigger;

    storyRef.current?.setStepInstant(0);
    cardsRef.current?.setStepInstant(0);

    const goToStep = (step: number) => {
      if (step === currentStep) return;

      isAnimating = true;
      currentStep = step;
      storyRef.current?.animateToStep(step, () => {
        isAnimating = false;
      });
      cardsRef.current?.animateToStep(step);
    };

    const setStepInstant = (step: number) => {
      currentStep = step;
      isAnimating = false;
      storyRef.current?.setStepInstant(step);
      cardsRef.current?.setStepInstant(step);
    };

    const scrollToImmediate = (position: number) => {
      const lenis = getLenis();

      if (lenis) {
        lenis.scrollTo(position, { immediate: true });
      } else {
        window.scrollTo(0, position);
      }

      ScrollTrigger.update();
    };

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const observer = Observer.create({
      type: "wheel,touch",
      preventDefault: !isTouchDevice,
      tolerance: isTouchDevice ? 30 : 10,
      onDown: () => {
        if (isAnimating) return;

        if (currentStep >= LAST_STEP) {
          observer.disable();
          scrollToImmediate(trigger.end + 1);
          return;
        }

        goToStep(currentStep + 1);
      },
      onUp: () => {
        if (isAnimating) return;

        if (currentStep <= 0) {
          observer.disable();
          scrollToImmediate(Math.max(trigger.start - 1, 0));
          return;
        }

        goToStep(currentStep - 1);
      },
    });
    observer.disable();

    const context = gsap.context(() => {
      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${PIN_SCROLL_DISTANCE}`,
        pin: true,
        pinSpacing: true,
        pinType: "transform",
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: () => {
          setStepInstant(0);
          observer.enable();
        },
        onEnterBack: () => {
          setStepInstant(LAST_STEP);
          observer.enable();
        },
        onLeave: () => {
          setStepInstant(LAST_STEP);
          observer.disable();
        },
        onLeaveBack: () => {
          setStepInstant(0);
          observer.disable();
        },
      });
    }, section);

    return () => {
      observer.kill();
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate h-[100svh] overflow-hidden">
      {/* ── Background — ScrollSection.png ── */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/ScrollSection.png')] bg-cover bg-center bg-no-repeat" />

      {/* ── Content ── */}
      <div className="shell relative z-10 flex h-full flex-col py-4 lg:py-5">
        {/* Header — compact */}
        <div className="shrink-0 pb-2">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-brand/40" />
            <p className="eyebrow">Why Gonish</p>
            <p className="font-script text-[clamp(1.8rem,5vw,3rem)] leading-none text-brand/80">
              Gonish
            </p>
          </div>

          <p className="mt-2 max-w-2xl font-display text-[clamp(1.3rem,2.6vw,2.2rem)] leading-[1.14] tracking-[-0.035em] text-ink">
            브랜드의 선택 이유를 첫 화면에서 완성합니다.
          </p>
        </div>

        {/* Soft divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-ink/10 to-transparent" />

        {/* Main story area */}
        <div className="mt-2 min-h-0 flex-1">
          <StoryScrollSection ref={storyRef} />
        </div>

        {/* Soft divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-ink/10 to-transparent" />

        {/* Process orbital flow */}
        <div className="shrink-0 pt-3">
          <div className="mb-2 flex items-center gap-3">
            <span className="h-px w-10 bg-brand/30" />
            <p className="eyebrow">How it works</p>
          </div>

          <div className="h-[110px] sm:h-[120px]">
            <ProcessCards ref={cardsRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
