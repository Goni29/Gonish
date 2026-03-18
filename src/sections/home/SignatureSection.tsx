import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import StoryScrollSection, {
  STORY_STEP_COUNT,
  type StoryScrollSectionHandle,
} from "@/sections/home/StoryScrollSection";

gsap.registerPlugin(ScrollTrigger, Observer);

const LAST_STEP = STORY_STEP_COUNT - 1;
const PIN_SCROLL_DISTANCE = STORY_STEP_COUNT * 700;

export default function SignatureSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<StoryScrollSectionHandle | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    let currentStep = 0;
    let isAnimating = false;
    let trigger: ScrollTrigger;

    storyRef.current?.setStepInstant(0);

    const goToStep = (step: number) => {
      if (step === currentStep) return;
      isAnimating = true;
      currentStep = step;
      storyRef.current?.animateToStep(step, () => {
        isAnimating = false;
      });
    };

    const setStepInstant = (step: number) => {
      currentStep = step;
      isAnimating = false;
      storyRef.current?.setStepInstant(step);
    };

    // Observer: 휠/터치 한 번 = 한 스텝. preventDefault로 실제 스크롤 차단.
    const obs = Observer.create({
      type: "wheel,touch",
      preventDefault: true,
      tolerance: 10,
      onDown: () => {
        if (isAnimating) return;
        if (currentStep >= LAST_STEP) {
          // 마지막 스텝 → 다음 섹션으로 이동
          obs.disable();
          trigger.scroll(trigger.end + 1);
          return;
        }
        goToStep(currentStep + 1);
      },
      onUp: () => {
        if (isAnimating) return;
        if (currentStep <= 0) {
          // 첫 스텝 → 이전 섹션으로 이동
          obs.disable();
          trigger.scroll(Math.max(trigger.start - 1, 0));
          return;
        }
        goToStep(currentStep - 1);
      },
    });
    obs.disable();

    const context = gsap.context(() => {
      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${PIN_SCROLL_DISTANCE}`,
        pin: true,
        pinSpacing: true,
        onEnter: () => {
          setStepInstant(0);
          obs.enable();
        },
        onEnterBack: () => {
          setStepInstant(LAST_STEP);
          obs.enable();
        },
        onLeave: () => {
          setStepInstant(LAST_STEP);
          obs.disable();
        },
        onLeaveBack: () => {
          setStepInstant(0);
          obs.disable();
        },
      });
    }, section);

    return () => {
      obs.kill();
      context.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] overflow-hidden bg-[url('/ScrollSection.png')] bg-cover bg-top bg-no-repeat"
    >
      <div className="shell relative z-10 h-full">
        <div className="soft-divider" />
        <div className="space-y-10 py-12">
          <div className="font-script text-[clamp(5rem,17vw,12rem)] leading-none text-brand/95 [text-shadow:0_18px_48px_rgba(243,29,91,0.12)]">
            Gonish
          </div>

          <StoryScrollSection ref={storyRef} />
        </div>
      </div>
    </section>
  );
}
