import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import { getLenis, isIosTouchDevice } from "@/components/layout/SmoothScroll";

gsap.registerPlugin(ScrollTrigger, Observer);

/* ── wave config ─────────────────────────────────── */
const WAVE_POINT_COUNT = 24;
const WAVE_AMPLITUDE = 10;
const PRIMARY_WAVE_CYCLES = 1.45;
const SECONDARY_WAVE_CYCLES = 2.7;
const TERTIARY_WAVE_CYCLES = 4.2;
const WAVE_PHASE_SPEED = 0.003;
const SECONDARY_WAVE_RATIO = 0.42;
const TERTIARY_WAVE_RATIO = 0.18;
const EMPTY_LEVEL_THRESHOLD = 99.8;
const FULL_LEVEL_THRESHOLD = 0.2;
const FC = "#f31d5b";
const OUTLINE_COLOR = "rgba(20, 16, 20, 0.24)";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const f1 = (n: number) => n.toFixed(1);

/* ── wave helper ─────────────────────────────────── */
function getWaveY(xRatio: number, level: number, phase: number) {
  const primary =
    Math.sin(xRatio * Math.PI * 2 * PRIMARY_WAVE_CYCLES + phase) * WAVE_AMPLITUDE;
  const secondary =
    Math.sin(xRatio * Math.PI * 2 * SECONDARY_WAVE_CYCLES - phase * 1.25 + 1.4) *
    (WAVE_AMPLITUDE * SECONDARY_WAVE_RATIO);
  const tertiary =
    Math.sin(xRatio * Math.PI * 2 * TERTIARY_WAVE_CYCLES + phase * 0.8 + 2.6) *
    (WAVE_AMPLITUDE * TERTIARY_WAVE_RATIO);
  return clamp(level + primary + secondary + tertiary, 0, 100);
}

export default function FillWordSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const fillTextRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const fillText = fillTextRef.current;
    if (!section || !fillText) return undefined;

    const prefersFixedPin = isIosTouchDevice();
    const isCompactTouch = window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 640;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const progressStep = isCompactTouch ? 0.24 : isCoarsePointer ? 0.2 : 0.16;
    const fillPinDistance = Math.max(window.innerHeight * (isCoarsePointer ? 1.08 : 1.18), isCoarsePointer ? 720 : 860);
    const liquidState = { level: 100 };
    const fillState = { progress: 0 };
    let rafId = 0;
    let trigger: ScrollTrigger | null = null;
    let preventScrollObserver: Observer | null = null;
    let wheelObserver: Observer | null = null;
    let progressTween: gsap.core.Tween | null = null;
    let exitTween: gsap.core.Tween | null = null;
    let observersEnabled = false;
    let gestureConsumed = false;
    let touchStartY: number | null = null;
    let savedScroll = 0;
    let exitDirection: "forward" | "backward" | null = null;
    let lockBias = 0.12;
    let lockSettling = false;
    let lockSettleFrame = 0;

    const scrollToPosition = (position: number) => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(position, { immediate: true });
      else window.scrollTo(0, position);
      ScrollTrigger.update();
    };

    const setSavedScroll = (position: number) => {
      savedScroll = Math.max(0, position);
    };

    const clearGesture = () => {
      gestureConsumed = false;
    };

    const applyFillProgress = (progress: number) => {
      fillState.progress = clamp(progress, 0, 1);
      liquidState.level = clamp(100 - fillState.progress * 100, 0, 100);
      fillText.dataset.fillLevel = liquidState.level.toFixed(2);
    };

    const getLockScroll = () => {
      if (!trigger) return window.scrollY;

      const safeStart = trigger.start + 2;
      const safeEnd = Math.max(safeStart, trigger.end - 2);
      const lockPosition = trigger.start + (trigger.end - trigger.start) * lockBias;
      return clamp(lockPosition, safeStart, safeEnd);
    };

    const getActiveScrollBounds = () => {
      if (!trigger) {
        return { start: window.scrollY, end: window.scrollY };
      }

      const span = trigger.end - trigger.start;
      const edgeBuffer = Math.min(span * 0.16, Math.max(window.innerHeight * 0.12, 84));
      return {
        start: trigger.start + edgeBuffer,
        end: trigger.end - edgeBuffer,
      };
    };

    const getLockBiasForProgress = (progress: number) => {
      if (progress <= 0.001) return 0.12;
      if (progress >= 0.999) return 0.88;
      return 0.5;
    };

    const syncLockedScroll = (mode: "lock" | "preserve" = "lock") => {
      if (mode === "preserve") {
        setSavedScroll(window.scrollY);
        return;
      }

      const targetScroll = getLockScroll();
      setSavedScroll(targetScroll);
      if (Math.abs(window.scrollY - targetScroll) > 1) {
        scrollToPosition(targetScroll);
      }
    };

    const settleLock = () => {
      lockSettling = true;
      if (lockSettleFrame !== 0) {
        window.cancelAnimationFrame(lockSettleFrame);
      }

      lockSettleFrame = window.requestAnimationFrame(() => {
        lockSettleFrame = window.requestAnimationFrame(() => {
          lockSettling = false;
          lockSettleFrame = 0;
        });
      });
    };

    const disableInputObservers = () => {
      if (!observersEnabled) return;
      preventScrollObserver?.disable();
      wheelObserver?.disable();
      observersEnabled = false;
      section.style.touchAction = "";
    };

    const transitionToProgress = (targetProgress: number) => {
      const nextProgress = clamp(targetProgress, 0, 1);
      if (Math.abs(nextProgress - fillState.progress) < 0.001 || progressTween) return;

      progressTween = gsap.to(fillState, {
        progress: nextProgress,
        duration: isCoarsePointer ? 0.46 : 0.4,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => {
          applyFillProgress(fillState.progress);
        },
        onComplete: () => {
          applyFillProgress(nextProgress);
          lockBias = getLockBiasForProgress(nextProgress);
          if (observersEnabled) syncLockedScroll("lock");
          progressTween = null;
        },
      });
    };

    const releasePinnedControl = (direction: "forward" | "backward", impulse = 0) => {
      if (!trigger) return;

      const bounds = getActiveScrollBounds();
      const nudge = Math.max(14, Math.min(impulse * 0.45, 56));
      const targetScroll = direction === "forward"
        ? Math.min(trigger.end - 2, bounds.end + nudge)
        : Math.max(trigger.start + 2, bounds.start - nudge);

      clearGesture();
      touchStartY = null;
      exitDirection = direction;
      disableInputObservers();
      setSavedScroll(targetScroll);
      scrollToPosition(targetScroll);
      applyFillProgress(direction === "forward" ? 1 : 0);
    };

    const stepFillDirection = (direction: "forward" | "backward", impulse = 0) => {
      if (progressTween || exitTween) return;

      if (direction === "forward") {
        if (fillState.progress >= 0.999) {
          releasePinnedControl("forward", impulse);
          return;
        }
        transitionToProgress(fillState.progress + progressStep);
        return;
      }

      if (fillState.progress <= 0.001) {
        releasePinnedControl("backward", impulse);
        return;
      }

      transitionToProgress(fillState.progress - progressStep);
    };

    const maybeEnableInputObservers = () => {
      if (observersEnabled || !trigger || progressTween || exitTween) return;

      const bounds = getActiveScrollBounds();
      if (window.scrollY < bounds.start || window.scrollY > bounds.end) {
        setSavedScroll(window.scrollY);
        return;
      }

      exitDirection = null;
      enableInputObservers(fillState.progress, getLockBiasForProgress(fillState.progress), true);
    };

    const handleFillProgressRequest = (event: Event) => {
      const detail = (event as CustomEvent<{ level?: number; progress?: number; direction?: "forward" | "backward" }>).detail;
      if (!detail) return;

      if (detail.direction === "forward" || detail.direction === "backward") {
        stepFillDirection(detail.direction);
        return;
      }

      if (typeof detail.level === "number") {
        applyFillProgress(1 - clamp(detail.level, 0, 100) / 100);
      } else if (typeof detail.progress === "number") {
        applyFillProgress(detail.progress);
      }
    };

    const updateWave = (time: number) => {
      const w = fillText.clientWidth;
      const h = fillText.clientHeight;
      if (w === 0 || h === 0) { rafId = requestAnimationFrame(updateWave); return; }

      const phase = time * WAVE_PHASE_SPEED;
      const level = liquidState.level;
      fillText.dataset.fillLevel = level.toFixed(2);

      if (level >= EMPTY_LEVEL_THRESHOLD) {
        const emptyClip = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
        fillText.style.clipPath = emptyClip;
        fillText.style.setProperty("-webkit-clip-path", emptyClip);
        rafId = requestAnimationFrame(updateWave);
        return;
      }
      if (level <= FULL_LEVEL_THRESHOLD) {
        const fullClip = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
        fillText.style.clipPath = fullClip;
        fillText.style.setProperty("-webkit-clip-path", fullClip);
        rafId = requestAnimationFrame(updateWave);
        return;
      }

      const polygonPoints: string[] = [];
      for (let i = 0; i <= WAVE_POINT_COUNT; i++) {
        const r = i / WAVE_POINT_COUNT;
        const xPct = r * 100;
        const yPct = getWaveY(r, level, phase);
        polygonPoints.push(`${f1(xPct)}% ${f1(yPct)}%`);
      }
      const clipPath = `polygon(${polygonPoints.join(", ")}, 100% 100%, 0% 100%)`;
      fillText.style.clipPath = clipPath;
      fillText.style.setProperty("-webkit-clip-path", clipPath);

      rafId = requestAnimationFrame(updateWave);
    };

    const enableInputObservers = (
      progress: number,
      nextLockBias = getLockBiasForProgress(progress),
      preserveScroll = false
    ) => {
      exitTween?.kill();
      exitTween = null;
      exitDirection = null;
      progressTween?.kill();
      progressTween = null;
      lockBias = nextLockBias;
      applyFillProgress(progress);
      clearGesture();
      touchStartY = null;
      section.style.touchAction = "none";

      if (!observersEnabled) {
        preventScrollObserver?.enable();
        wheelObserver?.enable();
        observersEnabled = true;
      }

      syncLockedScroll(preserveScroll ? "preserve" : "lock");
      if (preserveScroll) {
        lockSettling = false;
        if (lockSettleFrame !== 0) {
          window.cancelAnimationFrame(lockSettleFrame);
          lockSettleFrame = 0;
        }
      } else {
        settleLock();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (!observersEnabled) return;
      touchStartY = event.touches[0]?.clientY ?? null;
      clearGesture();
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!observersEnabled) return;

      const currentY = event.touches[0]?.clientY;
      if (currentY === undefined) return;

      if (event.cancelable) event.preventDefault();

      if (touchStartY === null) {
        touchStartY = currentY;
        clearGesture();
        return;
      }

      const deltaY = touchStartY - currentY;
      if (Math.abs(deltaY) < 22 || gestureConsumed) return;

      gestureConsumed = true;
      stepFillDirection(deltaY > 0 ? "forward" : "backward", Math.abs(deltaY));
    };

    const handleTouchEnd = () => {
      touchStartY = null;
      clearGesture();
    };

    const handleRefresh = () => {
      if (observersEnabled) {
        syncLockedScroll("preserve");
        return;
      }
      maybeEnableInputObservers();
    };

    const gsapCtx = gsap.context(() => {
      preventScrollObserver = Observer.create({
        target: window,
        type: "wheel,scroll",
        preventDefault: true,
        allowClicks: true,
        onEnable: (self) => {
          document.documentElement.style.overscrollBehavior = "none";
          if (ScrollTrigger.isTouch) self.event?.preventDefault?.();
        },
        onDisable: () => {
          document.documentElement.style.overscrollBehavior = "";
        },
        onPress: (self) => {
          if (ScrollTrigger.isTouch) self.event?.preventDefault?.();
        },
        onChangeY: () => {
          if (Math.abs(window.scrollY - savedScroll) > 1) {
            scrollToPosition(savedScroll);
          }
        },
      });
      preventScrollObserver.disable();

      wheelObserver = Observer.create({
        target: window,
        type: "wheel",
        preventDefault: true,
        allowClicks: true,
        tolerance: 12,
        onChangeY: (self) => {
          if (self.deltaY > 0) stepFillDirection("forward", Math.abs(self.deltaY));
          else if (self.deltaY < 0) stepFillDirection("backward", Math.abs(self.deltaY));
        },
      });
      wheelObserver.disable();

      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${fillPinDistance}`,
        pin: true,
        pinType: prefersFixedPin ? "fixed" : "transform",
        pinReparent: prefersFixedPin,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        fastScrollEnd: false,
        onUpdate: () => {
          if (!observersEnabled) maybeEnableInputObservers();
        },
        onEnter: () => {
          exitDirection = null;
          disableInputObservers();
          applyFillProgress(0);
          setSavedScroll(window.scrollY);
          maybeEnableInputObservers();
        },
        onEnterBack: () => {
          exitDirection = null;
          disableInputObservers();
          applyFillProgress(1);
          setSavedScroll(window.scrollY);
          maybeEnableInputObservers();
        },
        onLeave: () => {
          exitDirection = null;
          disableInputObservers();
          applyFillProgress(1);
        },
        onLeaveBack: () => {
          exitDirection = null;
          disableInputObservers();
          applyFillProgress(0);
        },
      });
    }, section);

    if (isCoarsePointer) {
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd, { passive: true });
      window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    }

    ScrollTrigger.addEventListener("refresh", handleRefresh);
    section.addEventListener("gonish:fill-progress", handleFillProgressRequest as EventListener);
    applyFillProgress(0);
    rafId = requestAnimationFrame(updateWave);

    return () => {
      cancelAnimationFrame(rafId);
      ScrollTrigger.removeEventListener("refresh", handleRefresh);
      section.removeEventListener("gonish:fill-progress", handleFillProgressRequest as EventListener);
      if (isCoarsePointer) {
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("touchcancel", handleTouchEnd);
      }
      progressTween?.kill();
      exitTween?.kill();
      if (lockSettleFrame !== 0) {
        window.cancelAnimationFrame(lockSettleFrame);
      }
      disableInputObservers();
      preventScrollObserver?.kill();
      wheelObserver?.kill();
      document.documentElement.style.overscrollBehavior = "";
      section.style.touchAction = "";
      gsapCtx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} data-home-section="fill-word" className="relative h-[100svh] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/FillWordSection.png')" }}
      />

      <div className="shell relative z-10 flex h-full items-center">
        <div className="w-full space-y-12">
          <div className="max-w-xl space-y-4">
            <p className="eyebrow">Signature invitation</p>
            <p className="text-base leading-7 text-ink-muted md:text-lg">
              브랜드가 가장 빛나는 순간, 그 느낌을 놓치지 않도록.
              Gonish가 당신의 브랜드를 완성해드릴게요.
            </p>
          </div>

          <div className="relative isolate">
            <p
              aria-hidden="true"
              className="select-none font-display text-[clamp(3.8rem,11vw,9.5rem)] leading-[0.92] tracking-[-0.04em] opacity-0"
            >
              <SmartLineBreak text="Gonish와 완성하세요." maxCharsPerLine={10} autoFit={false} />
            </p>

            <p
              ref={fillTextRef}
              data-fill-layer="water"
              className="absolute inset-0 z-10 font-display text-[clamp(3.8rem,11vw,9.5rem)] leading-[0.92] tracking-[-0.04em]"
              style={{
                color: FC,
                WebkitTextFillColor: FC,
                clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
                WebkitClipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
                willChange: "clip-path",
              }}
            >
              <SmartLineBreak text="Gonish와 완성하세요." maxCharsPerLine={10} autoFit={false} />
            </p>

            <p
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-30 font-display text-[clamp(3.8rem,11vw,9.5rem)] leading-[0.92] tracking-[-0.04em]"
              style={{
                color: "transparent",
                WebkitTextFillColor: "transparent",
                WebkitTextStroke: `1.35px ${OUTLINE_COLOR}`,
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                willChange: "transform",
              }}
            >
              <SmartLineBreak text="Gonish와 완성하세요." maxCharsPerLine={10} autoFit={false} />
            </p>
          </div>

          <div className="max-w-2xl rounded-[1.8rem] border border-black/10 bg-white/72 p-6 backdrop-blur-xl">
            <p className="font-display text-2xl leading-tight text-ink md:text-3xl">
              <SmartLineBreak text="한 번 스쳐 가는 화면보다, 오래 남는 첫인상을 설계합니다." />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
