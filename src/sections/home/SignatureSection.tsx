import { useLayoutEffect, useRef } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StoryScrollSection, {
  STORY_SCENE_SCROLL_DISTANCE,
  type StoryScrollSectionHandle,
  STORY_STEP_COUNT,
} from "@/sections/home/StoryScrollSection";

gsap.registerPlugin(ScrollTrigger);

const STEP_ANIMATION_LOCK_MS = 560;
const WHEEL_DELTA_THRESHOLD = 42;
const SCENE_EDGE_SNAP_OFFSET_PX = 2;
const SCENE_EDGE_READY_THRESHOLD_PX = 28;
const MIN_STEP_DWELL_MS = 700;

const clampStep = (value: number) => Math.max(0, Math.min(STORY_STEP_COUNT - 1, value));
const getStepFromProgress = (progress: number) => clampStep(Math.floor(progress * STORY_STEP_COUNT));

const jumpToScrollInstant = (top: number) => {
  const root = document.documentElement;
  const previousInlineBehavior = root.style.scrollBehavior;

  // Override global smooth scrolling for internal scene handoff/snap.
  root.style.scrollBehavior = "auto";
  window.scrollTo({ top, behavior: "auto" });
  root.style.scrollBehavior = previousInlineBehavior;
};

const getStepAnchorPosition = (trigger: ScrollTrigger, step: number) => {
  const innerStart = trigger.start + SCENE_EDGE_SNAP_OFFSET_PX;
  const innerEnd = Math.max(innerStart, trigger.end - SCENE_EDGE_SNAP_OFFSET_PX);
  const innerRange = innerEnd - innerStart;

  if (STORY_STEP_COUNT <= 1 || innerRange === 0) {
    return innerStart;
  }

  const slot = innerRange / STORY_STEP_COUNT;
  const centeredAnchor = innerStart + slot * (step + 0.5);

  return Math.min(innerEnd, Math.max(innerStart, centeredAnchor));
};

const getBoundaryReadyPosition = (trigger: ScrollTrigger, direction: 1 | -1) =>
  direction > 0
    ? Math.max(trigger.start + SCENE_EDGE_SNAP_OFFSET_PX, trigger.end - SCENE_EDGE_SNAP_OFFSET_PX)
    : trigger.start + SCENE_EDGE_SNAP_OFFSET_PX;

export default function SignatureSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const storyRef = useRef<StoryScrollSectionHandle | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const activeStepRef = useRef(0);
  const stepEnteredAtRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const isInputLockedRef = useRef(false);
  const wheelAccumulatorRef = useRef(0);
  const lockTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const scene = sceneRef.current;

    if (!section || !stage || !scene) {
      return undefined;
    }

    const syncStageHeight = () => {
      const sceneHeight = Math.ceil(scene.getBoundingClientRect().height);
      stage.style.minHeight = `${sceneHeight + STORY_SCENE_SCROLL_DISTANCE}px`;
    };

    const releaseInputState = () => {
      isAnimatingRef.current = false;
      isInputLockedRef.current = false;
      wheelAccumulatorRef.current = 0;

      if (lockTimerRef.current) {
        window.clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
    };

    const markStepEntered = (step: number) => {
      activeStepRef.current = step;
      stepEnteredAtRef.current = window.performance.now();
    };

    const context = gsap.context(() => {
      syncStageHeight();

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${STORY_SCENE_SCROLL_DISTANCE}`,
        invalidateOnRefresh: true,
        onRefreshInit: syncStageHeight,
        onRefresh: syncStageHeight,
        onUpdate: (self) => {
          const progress = gsap.utils.clamp(0, 1, self.progress);
          const syncedStep = getStepFromProgress(progress);

          if (syncedStep === activeStepRef.current) {
            return;
          }

          markStepEntered(syncedStep);
          storyRef.current?.setStepInstant(syncedStep);
          releaseInputState();
        },
        onEnter: () => {
          markStepEntered(0);
          storyRef.current?.setStepInstant(0);
        },
        onEnterBack: () => {
          const lastStep = STORY_STEP_COUNT - 1;
          markStepEntered(lastStep);
          storyRef.current?.setStepInstant(lastStep);
        },
        onLeave: () => {
          const lastStep = STORY_STEP_COUNT - 1;
          markStepEntered(lastStep);
          storyRef.current?.setStepInstant(lastStep);
          releaseInputState();
        },
        onLeaveBack: () => {
          markStepEntered(0);
          storyRef.current?.setStepInstant(0);
          releaseInputState();
        },
      });

      triggerRef.current = trigger;
    }, section);

    window.addEventListener("resize", syncStageHeight);

    return () => {
      window.removeEventListener("resize", syncStageHeight);

      if (lockTimerRef.current) {
        window.clearTimeout(lockTimerRef.current);
      }
      triggerRef.current = null;
      context.revert();
    };
  }, []);

  useLayoutEffect(() => {
    const releaseInputLock = () => {
      isAnimatingRef.current = false;
      isInputLockedRef.current = false;
      wheelAccumulatorRef.current = 0;
    };

    const moveStep = (direction: 1 | -1) => {
      const currentStep = activeStepRef.current;
      const nextStep = clampStep(currentStep + direction);

      if (nextStep === currentStep) {
        return;
      }

      isAnimatingRef.current = true;
      isInputLockedRef.current = true;
      activeStepRef.current = nextStep;
      stepEnteredAtRef.current = window.performance.now();
      storyRef.current?.animateToStep(nextStep);

      const trigger = triggerRef.current;
      if (trigger) {
        const stepAnchorPosition = getStepAnchorPosition(trigger, nextStep);
        jumpToScrollInstant(stepAnchorPosition);
        ScrollTrigger.update();
      }

      if (lockTimerRef.current) {
        window.clearTimeout(lockTimerRef.current);
      }

      lockTimerRef.current = window.setTimeout(() => {
        releaseInputLock();
      }, STEP_ANIMATION_LOCK_MS);
    };

    const handoffAtBoundary = (direction: 1 | -1) => {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      isInputLockedRef.current = true;
      isAnimatingRef.current = false;
      wheelAccumulatorRef.current = 0;

      const targetScroll =
        direction > 0
          ? trigger.end + SCENE_EDGE_SNAP_OFFSET_PX
          : Math.max(0, trigger.start - SCENE_EDGE_SNAP_OFFSET_PX);
      jumpToScrollInstant(targetScroll);
      ScrollTrigger.update();

      window.setTimeout(() => {
        isInputLockedRef.current = false;
      }, 120);
    };

    const onWheel = (event: WheelEvent) => {
      const trigger = triggerRef.current;

      if (!trigger || !trigger.isActive) {
        return;
      }

      const deltaY = event.deltaY;

      if (deltaY === 0) {
        return;
      }

      const direction = deltaY > 0 ? 1 : -1;
      const currentStep = activeStepRef.current;
      const now = window.performance.now();
      const hasMetMinDwell = now - stepEnteredAtRef.current >= MIN_STEP_DWELL_MS;
      const isOutwardBoundaryScroll =
        (direction > 0 && currentStep === STORY_STEP_COUNT - 1) ||
        (direction < 0 && currentStep === 0);

      if (isOutwardBoundaryScroll) {
        event.preventDefault();

        if (isInputLockedRef.current) {
          return;
        }

        if (!hasMetMinDwell) {
          const stayPosition = getStepAnchorPosition(trigger, currentStep);
          isInputLockedRef.current = true;
          jumpToScrollInstant(stayPosition);
          ScrollTrigger.update();

          window.setTimeout(() => {
            isInputLockedRef.current = false;
          }, 120);
          return;
        }

        const boundaryReadyPosition = getBoundaryReadyPosition(trigger, direction);
        const distanceToReadyEdge = Math.abs(window.scrollY - boundaryReadyPosition);

        // First outward intent at boundary snaps to the exit-ready edge.
        // A following outward scroll hands off to the next section.
        if (distanceToReadyEdge > SCENE_EDGE_READY_THRESHOLD_PX) {
          isInputLockedRef.current = true;
          jumpToScrollInstant(boundaryReadyPosition);
          ScrollTrigger.update();

          window.setTimeout(() => {
            isInputLockedRef.current = false;
          }, 120);
          return;
        }

        handoffAtBoundary(direction);
        return;
      }

      event.preventDefault();

      if (isInputLockedRef.current || isAnimatingRef.current) {
        return;
      }

      if (!hasMetMinDwell) {
        return;
      }

      wheelAccumulatorRef.current += deltaY;

      if (Math.abs(wheelAccumulatorRef.current) < WHEEL_DELTA_THRESHOLD) {
        return;
      }

      const stepDirection = wheelAccumulatorRef.current > 0 ? 1 : -1;
      wheelAccumulatorRef.current = 0;
      moveStep(stepDirection);
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);

      if (lockTimerRef.current) {
        window.clearTimeout(lockTimerRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="section-space-tight">
      <div className="shell">
        <div className="soft-divider" />
        <div ref={stageRef} className="relative" style={{ minHeight: `calc(100svh + ${STORY_SCENE_SCROLL_DISTANCE}px)` }}>
          <motion.div
            ref={sceneRef}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-0 space-y-10 py-12"
          >
            <div className="font-script text-[clamp(5rem,17vw,12rem)] leading-none text-brand/95 [text-shadow:0_18px_48px_rgba(243,29,91,0.12)]">
              Gonish
            </div>

            <StoryScrollSection ref={storyRef} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
