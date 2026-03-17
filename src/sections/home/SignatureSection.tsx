import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StoryScrollSection, {
  STORY_STEP_COUNT,
  type StoryScrollSectionHandle,
} from "@/sections/home/StoryScrollSection";

gsap.registerPlugin(ScrollTrigger);

const PIN_SCROLL_DISTANCE = Math.max(1800, STORY_STEP_COUNT * 700);
const SCRUB_SMOOTHING = true;
const STEP_WINDOW_START = 0.08;
const STEP_WINDOW_END = 0.82;
const ANIMATION_FAILSAFE_MS = 900;
const LEAVE_SUPPRESS_MS = 620;
const REENTRY_PROGRESS_RELEASE = 0.14;
const PROGRESS_EPSILON = 0.0005;

type ScrollDirection = 1 | -1 | 0;
type InteractionMode = "inactive" | "active" | "leaving" | "suppressed";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toNormalizedProgress = (progress: number) =>
  clamp((progress - STEP_WINDOW_START) / (STEP_WINDOW_END - STEP_WINDOW_START), 0, 1);

const progressToStep = (progress: number) => {
  const lastStep = STORY_STEP_COUNT - 1;
  if (lastStep <= 0) return 0;
  const normalized = toNormalizedProgress(progress);
  return clamp(Math.round(normalized * lastStep), 0, lastStep);
};

export default function SignatureSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<StoryScrollSectionHandle | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  const modeRef = useRef<InteractionMode>("inactive");
  const leaveDirectionRef = useRef<ScrollDirection>(0);
  const suppressUntilRef = useRef(0);
  const resetOnNextEnterRef = useRef(false);
  const lastProgressRef = useRef(0);

  const currentStepRef = useRef(0);
  const targetStepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const animationTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    modeRef.current = "inactive";
    leaveDirectionRef.current = 0;
    suppressUntilRef.current = 0;
    resetOnNextEnterRef.current = false;
    lastProgressRef.current = 0;

    currentStepRef.current = 0;
    targetStepRef.current = 0;
    isAnimatingRef.current = false;
    storyRef.current?.setStepInstant(0);
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const clearAnimationTimer = () => {
      if (animationTimerRef.current) {
        window.clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };

    const setStepInstant = (step: number) => {
      const nextStep = clamp(step, 0, STORY_STEP_COUNT - 1);
      clearAnimationTimer();
      isAnimatingRef.current = false;
      currentStepRef.current = nextStep;
      targetStepRef.current = nextStep;
      storyRef.current?.setStepInstant(nextStep);
    };

    const flushStepQueue = () => {
      if (modeRef.current !== "active") return;
      if (!triggerRef.current?.isActive) return;
      if (isAnimatingRef.current) return;
      if (currentStepRef.current === targetStepRef.current) return;

      const direction = targetStepRef.current > currentStepRef.current ? 1 : -1;
      const nextStep = currentStepRef.current + direction;
      isAnimatingRef.current = true;

      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        clearAnimationTimer();
        currentStepRef.current = nextStep;
        isAnimatingRef.current = false;
        flushStepQueue();
      };

      clearAnimationTimer();
      animationTimerRef.current = window.setTimeout(settle, ANIMATION_FAILSAFE_MS);

      const didStart = storyRef.current?.animateToStep(nextStep, settle);
      if (!didStart) {
        settle();
      }
    };

    const startLeaveSuppression = (direction: Exclude<ScrollDirection, 0>) => {
      modeRef.current = "leaving";
      leaveDirectionRef.current = direction;
      suppressUntilRef.current = performance.now() + LEAVE_SUPPRESS_MS;
      resetOnNextEnterRef.current = true;

      // Leaving 중 잔여 애니메이션으로 step이 바뀌지 않게 즉시 고정.
      setStepInstant(currentStepRef.current);

      window.requestAnimationFrame(() => {
        if (modeRef.current === "leaving") {
          modeRef.current = "suppressed";
        }
      });
    };

    const shouldKeepSuppressed = (progress: number) => {
      if (modeRef.current !== "suppressed") return false;
      if (performance.now() < suppressUntilRef.current) return true;

      const leaveDirection = leaveDirectionRef.current;
      if (leaveDirection > 0 && progress > 1 - REENTRY_PROGRESS_RELEASE) return true;
      if (leaveDirection < 0 && progress < REENTRY_PROGRESS_RELEASE) return true;

      modeRef.current = "inactive";
      leaveDirectionRef.current = 0;
      return false;
    };

    const activateInteraction = (direction: Exclude<ScrollDirection, 0>) => {
      if (modeRef.current !== "inactive") return;
      modeRef.current = "active";

      if (resetOnNextEnterRef.current) {
        const entryStep = direction > 0 ? 0 : STORY_STEP_COUNT - 1;
        setStepInstant(entryStep);
        resetOnNextEnterRef.current = false;
      }
    };

    const context = gsap.context(() => {
      triggerRef.current = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${PIN_SCROLL_DISTANCE}`,
        pin: true,
        pinSpacing: true,
        scrub: SCRUB_SMOOTHING,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        fastScrollEnd: false,
        onEnter: (self) => {
          lastProgressRef.current = self.progress;
          if (modeRef.current === "leaving") return;
          if (modeRef.current === "suppressed" && shouldKeepSuppressed(self.progress)) return;
          activateInteraction(1);
        },
        onEnterBack: (self) => {
          lastProgressRef.current = self.progress;
          if (modeRef.current === "leaving") return;
          if (modeRef.current === "suppressed" && shouldKeepSuppressed(self.progress)) return;
          activateInteraction(-1);
        },
        onUpdate: (self) => {
          const progress = self.progress;
          const previousProgress = lastProgressRef.current;
          let direction: ScrollDirection = 0;
          if (progress > previousProgress + PROGRESS_EPSILON) direction = 1;
          if (progress < previousProgress - PROGRESS_EPSILON) direction = -1;
          lastProgressRef.current = progress;

          if (!self.isActive) return;
          if (modeRef.current === "suppressed" && shouldKeepSuppressed(progress)) return;
          if (modeRef.current === "leaving") return;

          if (modeRef.current === "inactive") {
            const entryDirection: Exclude<ScrollDirection, 0> =
              direction !== 0 ? direction : progress >= 0.5 ? -1 : 1;
            activateInteraction(entryDirection);
          }

          if (modeRef.current !== "active") return;

          const nextTargetStep = progressToStep(progress);
          if (nextTargetStep === targetStepRef.current) return;

          targetStepRef.current = nextTargetStep;
          flushStepQueue();
        },
        onLeave: (self) => {
          lastProgressRef.current = self.progress;
          startLeaveSuppression(1);
        },
        onLeaveBack: (self) => {
          lastProgressRef.current = self.progress;
          startLeaveSuppression(-1);
        },
        onRefresh: (self) => {
          lastProgressRef.current = self.progress;
        },
      });
    }, section);

    return () => {
      clearAnimationTimer();
      triggerRef.current?.kill();
      triggerRef.current = null;
      context.revert();
      modeRef.current = "inactive";
      isAnimatingRef.current = false;
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
