import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import { getLenis } from "@/components/layout/SmoothScroll";

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
  const sceneViewportRef = useRef<HTMLDivElement | null>(null);
  const fillTextRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const sceneViewport = sceneViewportRef.current;
    const fillText = fillTextRef.current;
    if (!section || !sceneViewport || !fillText) return undefined;

    const isCompactTouch = window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 640;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const progressStep = isCompactTouch ? 0.34 : isCoarsePointer ? 0.3 : 0.26;
    const liquidState = { level: 100 };
    const fillState = { progress: 0 };
    let rafId = 0;
    let progressTween: gsap.core.Tween | null = null;
    let isBusy = false;
    let isStepping = false;
    let isLocked = false;
    let lastScrollY = window.scrollY;
    let touchStartY = 0;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;
    let cooldownTimer: ReturnType<typeof setTimeout> | null = null;
    let wheelIdleTimer: ReturnType<typeof setTimeout> | null = null;
    let scrollRafId: number | null = null;
    let syncRafId: number | null = null;
    let wheelDelta = 0;
    let wheelGestureConsumed = false;
    let suppressLockUntil = 0;

    const COOLDOWN_MS = 440;
    const SAFETY_MS = 760;
    const LOCK_TRIGGER_SLOP_PX = 2;
    const LOCK_APPROACH_SLOP_PX = 6;
    const WHEEL_THRESHOLD = 40;
    const WHEEL_IDLE_MS = 160;
    const EXIT_SUPPRESSION_MS = 900;
    const captureOnly = { capture: true };
    const capturePassive = { capture: true, passive: true };
    const captureActive = { capture: true, passive: false };

    const clearSafety = () => {
      if (safetyTimer) clearTimeout(safetyTimer);
    };

    const clearCooldown = () => {
      if (cooldownTimer) clearTimeout(cooldownTimer);
    };

    const clearWheelGesture = () => {
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      wheelIdleTimer = null;
      wheelDelta = 0;
      wheelGestureConsumed = false;
    };

    const applyFillProgress = (progress: number) => {
      fillState.progress = clamp(progress, 0, 1);
      liquidState.level = clamp(100 - fillState.progress * 100, 0, 100);
      fillText.dataset.fillLevel = liquidState.level.toFixed(2);
    };

    const stopProgressTween = () => {
      progressTween?.kill();
      progressTween = null;
      isBusy = false;
    };

    const setFillProgressInstant = (progress: number) => {
      stopProgressTween();
      applyFillProgress(progress);
      if (isLocked) syncLockedScroll();
    };

    const getSectionTop = () => Math.round(section.getBoundingClientRect().top + window.scrollY);

    const syncLockedScroll = () => {
      if (!isLocked) return;
      const targetScroll = getSectionTop();
      if (Math.abs(window.scrollY - targetScroll) > 1) {
        if (syncRafId !== null) window.cancelAnimationFrame(syncRafId);
        syncRafId = window.requestAnimationFrame(() => {
          syncRafId = null;
          window.scrollTo({ top: targetScroll, behavior: "instant" });
        });
      }
    };

    const setLockState = (locked: boolean, mode: "idle" | "locked") => {
      section.dataset.sceneLocked = locked ? "true" : "false";
      section.dataset.sceneMode = mode;
      sceneViewport.dataset.locked = locked ? "true" : "false";
    };

    const startCooldown = () => {
      isStepping = true;
      clearCooldown();
      clearSafety();
      cooldownTimer = setTimeout(() => {
        isStepping = false;
      }, COOLDOWN_MS);
      safetyTimer = setTimeout(() => {
        isBusy = false;
        isStepping = false;
      }, SAFETY_MS);
    };

    const scheduleWheelReset = () => {
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      wheelIdleTimer = setTimeout(() => {
        wheelDelta = 0;
        wheelGestureConsumed = false;
      }, WHEEL_IDLE_MS);
    };

    const normalizeWheelDelta = (event: WheelEvent) => {
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
      return event.deltaY;
    };

    const enableScrollLock = () => {
      if (isLocked) return;
      isLocked = true;
      setLockState(true, "locked");
      section.style.touchAction = "none";
      getLenis()?.stop();
      clearWheelGesture();
      syncLockedScroll();
      document.addEventListener("wheel", onWheel, captureActive);
      document.addEventListener("touchstart", onTouchStart, capturePassive);
      document.addEventListener("touchmove", onTouchMove, captureActive);
      document.addEventListener("touchend", onTouchEnd, capturePassive);
      document.addEventListener("touchcancel", onTouchCancel, capturePassive);
    };

    const transitionToProgress = (targetProgress: number) => {
      const nextProgress = clamp(targetProgress, 0, 1);
      if (Math.abs(nextProgress - fillState.progress) < 0.001 || progressTween || isBusy) return false;

      isBusy = true;
      progressTween = gsap.to(fillState, {
        progress: nextProgress,
        duration: isCoarsePointer ? 0.36 : 0.3,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => {
          applyFillProgress(fillState.progress);
        },
        onComplete: () => {
          applyFillProgress(nextProgress);
          progressTween = null;
          isBusy = false;
          clearSafety();
          if (isLocked) syncLockedScroll();
        },
        onInterrupt: () => {
          progressTween = null;
          isBusy = false;
          clearSafety();
        },
      });

      return true;
    };

    const disableScrollLock = () => {
      if (!isLocked) return;
      isLocked = false;
      setLockState(false, "idle");
      if (syncRafId !== null) {
        window.cancelAnimationFrame(syncRafId);
        syncRafId = null;
      }
      clearSafety();
      clearCooldown();
      clearWheelGesture();
      isStepping = false;
      isBusy = false;
      section.style.touchAction = "";
      document.removeEventListener("wheel", onWheel, captureOnly);
      document.removeEventListener("touchstart", onTouchStart, captureOnly);
      document.removeEventListener("touchmove", onTouchMove, captureOnly);
      document.removeEventListener("touchend", onTouchEnd, captureOnly);
      document.removeEventListener("touchcancel", onTouchCancel, captureOnly);
    };

    const releaseExitScroll = (target: number) => {
      const lenis = getLenis();
      if (!lenis) {
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }

      lenis.start();
      lenis.scrollTo(target, {
        immediate: true,
        force: true,
      });
    };

    const exitScene = (direction: "forward" | "backward", impulse = 0) => {
      suppressLockUntil = performance.now() + EXIT_SUPPRESSION_MS;
      disableScrollLock();

      const signedImpulse = direction === "forward" ? 1 : -1;
      const rawCarry = Math.abs(impulse) > 0 ? Math.abs(impulse) : window.innerHeight * 0.18;
      const carryDistance = Math.min(rawCarry, window.innerHeight * 0.75);
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const target = Math.max(0, Math.min(maxScroll, Math.round(window.scrollY + carryDistance * signedImpulse)));

      releaseExitScroll(target);
    };

    const lockScene = (entryDirection: "forward" | "backward") => {
      enableScrollLock();
      const sectionTop = getSectionTop();
      window.scrollTo({ top: sectionTop, behavior: "instant" });
      lastScrollY = sectionTop;

      if (entryDirection === "forward") {
        setFillProgressInstant(0);
        return;
      }

      setFillProgressInstant(1);
    };

    const stepFillDirection = (direction: "forward" | "backward", impulse = 0) => {
      if (!isLocked || isStepping || isBusy) return;

      if (direction === "forward") {
        if (fillState.progress >= 0.999) {
          exitScene("forward", impulse);
          return;
        }

        const started = transitionToProgress(fillState.progress + progressStep);
        if (started) startCooldown();
        return;
      }

      if (fillState.progress <= 0.001) {
        exitScene("backward", impulse);
        return;
      }

      const started = transitionToProgress(fillState.progress - progressStep);
      if (started) startCooldown();
    };

    const handleFillProgressRequest = (event: Event) => {
      const detail = (event as CustomEvent<{ level?: number; progress?: number; direction?: "forward" | "backward" }>).detail;
      if (!detail) return;

      if (detail.direction === "forward" || detail.direction === "backward") {
        stepFillDirection(detail.direction);
        return;
      }

      if (typeof detail.level === "number") {
        setFillProgressInstant(1 - clamp(detail.level, 0, 100) / 100);
      } else if (typeof detail.progress === "number") {
        setFillProgressInstant(detail.progress);
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

    const onWheel = (event: WheelEvent) => {
      if (!isLocked) return;
      if (event.cancelable) event.preventDefault();

      const delta = normalizeWheelDelta(event);
      if (Math.abs(delta) < 0.5) return;

      scheduleWheelReset();
      wheelDelta += delta;

      if (wheelGestureConsumed || Math.abs(wheelDelta) < WHEEL_THRESHOLD) return;
      wheelGestureConsumed = true;
      stepFillDirection(wheelDelta > 0 ? "forward" : "backward", Math.abs(wheelDelta));
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
    };

    const onTouchEnd = (event: TouchEvent) => {
      const delta = touchStartY - event.changedTouches[0].clientY;
      touchStartY = 0;
      if (Math.abs(delta) < (isCoarsePointer ? 15 : 5)) return;
      stepFillDirection(delta > 0 ? "forward" : "backward", Math.abs(delta));
    };

    const onTouchCancel = () => {
      touchStartY = 0;
    };

    const maybeLockScene = () => {
      const currentY = window.scrollY;

      if (isLocked) {
        syncLockedScroll();
        lastScrollY = getSectionTop();
        return;
      }

      if (performance.now() < suppressLockUntil) {
        lastScrollY = currentY;
        return;
      }

      const direction =
        currentY > lastScrollY
          ? "forward"
          : currentY < lastScrollY
            ? "backward"
            : null;
      const sectionTop = getSectionTop();
      const rect = section.getBoundingClientRect();
      const sectionVisible = rect.bottom > 0 && rect.top < window.innerHeight;
      const crossedFromAbove =
        direction === "forward" &&
        lastScrollY < sectionTop - LOCK_TRIGGER_SLOP_PX &&
        currentY >= sectionTop - LOCK_TRIGGER_SLOP_PX;
      const crossedFromBelow =
        direction === "backward" &&
        lastScrollY > sectionTop + LOCK_TRIGGER_SLOP_PX &&
        currentY <= sectionTop + LOCK_TRIGGER_SLOP_PX;
      const enteredForwardLockZone =
        direction === "forward" &&
        lastScrollY < sectionTop &&
        currentY >= sectionTop - LOCK_APPROACH_SLOP_PX;
      const enteredBackwardLockZone =
        direction === "backward" &&
        lastScrollY > sectionTop &&
        currentY <= sectionTop + LOCK_APPROACH_SLOP_PX;

      if (sectionVisible && (crossedFromAbove || crossedFromBelow || enteredForwardLockZone || enteredBackwardLockZone)) {
        const fallbackDirection = currentY >= sectionTop ? "forward" : "backward";
        lockScene(direction ?? fallbackDirection);
        return;
      }

      lastScrollY = currentY;
    };

    const handleWindowScroll = () => {
      if (isLocked) {
        syncLockedScroll();
        lastScrollY = getSectionTop();
        return;
      }

      if (scrollRafId !== null) return;
      scrollRafId = window.requestAnimationFrame(() => {
        scrollRafId = null;
        maybeLockScene();
      });
    };

    const handleResize = () => {
      if (isLocked) {
        syncLockedScroll();
        return;
      }
      lastScrollY = window.scrollY;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLocked) return;
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        stepFillDirection("forward");
      } else if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        stepFillDirection("backward");
      }
    };

    section.addEventListener("gonish:fill-progress", handleFillProgressRequest as EventListener);
    applyFillProgress(0);
    rafId = requestAnimationFrame(updateWave);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    setLockState(false, "idle");
    maybeLockScene();

    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener("gonish:fill-progress", handleFillProgressRequest as EventListener);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleWindowScroll);
      window.removeEventListener("resize", handleResize);
      clearSafety();
      clearCooldown();
      clearWheelGesture();
      stopProgressTween();
      disableScrollLock();
      if (scrollRafId !== null) window.cancelAnimationFrame(scrollRafId);
      if (syncRafId !== null) window.cancelAnimationFrame(syncRafId);
      setLockState(false, "idle");
      section.style.touchAction = "";
      getLenis()?.start();
    };
  }, []);

  return (
    <section ref={sectionRef} data-home-section="fill-word" className="fill-word-section relative isolate h-[100svh] overflow-hidden">
      <div ref={sceneViewportRef} className="fill-word-section__scene-viewport absolute inset-0">
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
      </div>
    </section>
  );
}
