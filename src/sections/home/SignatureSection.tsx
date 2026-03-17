import { useLayoutEffect, useRef } from "react";
import { motion } from "motion/react";
import StoryScrollSection, {
  STORY_STEP_COUNT,
  type StoryScrollSectionHandle,
} from "@/sections/home/StoryScrollSection";

const STEP_ANIMATION_LOCK_MS = 520;
const WHEEL_GESTURE_IDLE_MS = 170;
const WHEEL_NOISE_THRESHOLD = 8;
const ENTRY_TOP_TOLERANCE_PX = 3;
const REENTRY_RELEASE_OFFSET_PX = 260;

const clampStep = (value: number) => Math.max(0, Math.min(STORY_STEP_COUNT - 1, value));
const getSectionAbsoluteTop = (section: HTMLElement) =>
  window.scrollY + section.getBoundingClientRect().top;
const isSectionVisible = (rect: DOMRect) => rect.bottom > 0 && rect.top < window.innerHeight;

export default function SignatureSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<StoryScrollSectionHandle | null>(null);

  const activeStepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const isStepModeActiveRef = useRef(false);
  const boundaryExitArmedRef = useRef(false);
  const reentryBlockedDirectionRef = useRef<1 | -1 | 0>(0);
  const gestureLockRef = useRef(false);
  const gestureIdleTimerRef = useRef<number | null>(null);
  const animationTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    activeStepRef.current = 0;
    isAnimatingRef.current = false;
    isStepModeActiveRef.current = false;
    boundaryExitArmedRef.current = false;
    reentryBlockedDirectionRef.current = 0;
    gestureLockRef.current = false;
    storyRef.current?.setStepInstant(0);

    return () => {
      if (gestureIdleTimerRef.current) window.clearTimeout(gestureIdleTimerRef.current);
      if (animationTimerRef.current) window.clearTimeout(animationTimerRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    const clearGestureIdleTimer = () => {
      if (gestureIdleTimerRef.current) {
        window.clearTimeout(gestureIdleTimerRef.current);
        gestureIdleTimerRef.current = null;
      }
    };

    const clearAnimationTimer = () => {
      if (animationTimerRef.current) {
        window.clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };

    const scheduleGestureUnlock = () => {
      clearGestureIdleTimer();
      gestureIdleTimerRef.current = window.setTimeout(() => {
        gestureLockRef.current = false;
        gestureIdleTimerRef.current = null;
      }, WHEEL_GESTURE_IDLE_MS);
    };

    const lockSectionToTop = (section: HTMLElement) => {
      const top = section.getBoundingClientRect().top;
      if (Math.abs(top) <= ENTRY_TOP_TOLERANCE_PX) return;
      window.scrollTo({ top: getSectionAbsoluteTop(section), behavior: "auto" });
    };

    const enterStepMode = (section: HTMLElement, direction: 1 | -1) => {
      lockSectionToTop(section);
      isStepModeActiveRef.current = true;
      isAnimatingRef.current = false;
      boundaryExitArmedRef.current = false;
      gestureLockRef.current = true;

      const startStep = direction > 0 ? 0 : STORY_STEP_COUNT - 1;
      activeStepRef.current = startStep;
      storyRef.current?.setStepInstant(startStep);
      scheduleGestureUnlock();
    };

    const leaveStepMode = (direction: 1 | -1) => {
      isStepModeActiveRef.current = false;
      isAnimatingRef.current = false;
      boundaryExitArmedRef.current = false;
      gestureLockRef.current = false;
      reentryBlockedDirectionRef.current = direction;
      clearGestureIdleTimer();
      clearAnimationTimer();
    };

    const moveStep = (direction: 1 | -1) => {
      const currentStep = activeStepRef.current;
      const nextStep = clampStep(currentStep + direction);

      if (nextStep === currentStep) return;

      isAnimatingRef.current = true;
      boundaryExitArmedRef.current = false;
      activeStepRef.current = nextStep;
      storyRef.current?.animateToStep(nextStep);

      clearAnimationTimer();
      animationTimerRef.current = window.setTimeout(() => {
        isAnimatingRef.current = false;
        animationTimerRef.current = null;
      }, STEP_ANIMATION_LOCK_MS);
    };

    const onWheel = (event: WheelEvent) => {
      const section = sectionRef.current;
      if (!section) return;

      const deltaY = event.deltaY;
      if (Math.abs(deltaY) < WHEEL_NOISE_THRESHOLD) return;

      const direction: 1 | -1 = deltaY > 0 ? 1 : -1;
      const rect = section.getBoundingClientRect();
      const projectedTop = rect.top - deltaY;
      const atTop = Math.abs(rect.top) <= ENTRY_TOP_TOLERANCE_PX;
      const crossingTop =
        (direction > 0 && rect.top > ENTRY_TOP_TOLERANCE_PX && projectedTop <= ENTRY_TOP_TOLERANCE_PX) ||
        (direction < 0 && rect.top < -ENTRY_TOP_TOLERANCE_PX && projectedTop >= -ENTRY_TOP_TOLERANCE_PX);

      if (
        reentryBlockedDirectionRef.current !== 0 &&
        (direction !== reentryBlockedDirectionRef.current ||
          Math.abs(rect.top) > REENTRY_RELEASE_OFFSET_PX)
      ) {
        reentryBlockedDirectionRef.current = 0;
      }

      if (!isStepModeActiveRef.current) {
        if (!isSectionVisible(rect)) return;
        if (!atTop && !crossingTop) return;
        if (reentryBlockedDirectionRef.current === direction) return;

        event.preventDefault();
        enterStepMode(section, direction);
        return;
      }

      if (!isSectionVisible(rect)) {
        leaveStepMode(direction);
        return;
      }

      const currentStep = activeStepRef.current;
      const isOutwardBoundaryScroll =
        (direction > 0 && currentStep === STORY_STEP_COUNT - 1) ||
        (direction < 0 && currentStep === 0);
      const shouldLeaveOnThisGesture =
        isOutwardBoundaryScroll &&
        boundaryExitArmedRef.current &&
        !gestureLockRef.current &&
        !isAnimatingRef.current;

      if (shouldLeaveOnThisGesture) {
        leaveStepMode(direction);
        return;
      }

      event.preventDefault();
      lockSectionToTop(section);
      scheduleGestureUnlock();

      if (gestureLockRef.current || isAnimatingRef.current) return;

      gestureLockRef.current = true;

      if (isOutwardBoundaryScroll) {
        boundaryExitArmedRef.current = true;
        return;
      }

      moveStep(direction);
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      clearGestureIdleTimer();
      clearAnimationTimer();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-space-tight relative overflow-hidden bg-[url('/ScrollSection.png')] bg-cover bg-top bg-no-repeat"
    >
      <div className="shell relative z-10">
        <div className="soft-divider" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-10 py-12"
        >
          <div className="font-script text-[clamp(5rem,17vw,12rem)] leading-none text-brand/95 [text-shadow:0_18px_48px_rgba(243,29,91,0.12)]">
            Gonish
          </div>

          <StoryScrollSection ref={storyRef} />
        </motion.div>
      </div>
    </section>
  );
}
