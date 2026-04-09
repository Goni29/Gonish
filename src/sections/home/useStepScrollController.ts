"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { getLenis } from "@/components/layout/SmoothScroll";

export type StepDirection = "forward" | "backward";

export type StepScrollControllerState = {
  currentStep: number;
  targetStep: number | null;
  isAnimating: boolean;
  direction: StepDirection | null;
  queuedDirection: StepDirection | null;
  isLocked: boolean;
};

type StepScrollControllerOptions = {
  stepCount: number;
  sectionRef: RefObject<HTMLElement | null>;
  viewportRef: RefObject<HTMLElement | null>;
  activationSlopPx?: number;
  animationSafetyMs?: number;
  exitCarryPx?: number;
  lockAnchorMode?: "current-scroll" | "section-boundary";
  queueDuringAnimation?: boolean;
  touchThreshold?: number;
  wheelIdleMs?: number;
  wheelThreshold?: number;
};

const CAPTURE_ONLY = { capture: true } as const;
const CAPTURE_PASSIVE = { capture: true, passive: true } as const;
const CAPTURE_ACTIVE = { capture: true, passive: false } as const;
const EXIT_SUPPRESSION_MS = 900;

function normalizeWheelDelta(event: WheelEvent) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

export function useStepScrollController({
  stepCount,
  sectionRef,
  viewportRef,
  activationSlopPx = 18,
  animationSafetyMs = 900,
  exitCarryPx = 108,
  lockAnchorMode = "current-scroll",
  queueDuringAnimation = true,
  touchThreshold = 28,
  wheelIdleMs = 150,
  wheelThreshold = 52,
}: StepScrollControllerOptions) {
  const [state, setState] = useState<StepScrollControllerState>({
    currentStep: 0,
    targetStep: null,
    isAnimating: false,
    direction: null,
    queuedDirection: null,
    isLocked: false,
  });

  const stateRef = useRef(state);
  const requestDirectionalStepRef = useRef<(direction: StepDirection, impulse?: number) => boolean>(() => false);
  const jumpToStepRef = useRef<(step: number) => boolean>(() => false);
  const completeAnimationRef = useRef<() => void>(() => {});

  const syncState = useCallback((next: StepScrollControllerState) => {
    stateRef.current = next;
    setState(next);
    return next;
  }, []);

  const updateState = useCallback((recipe: (prev: StepScrollControllerState) => StepScrollControllerState) => {
    const next = recipe(stateRef.current);
    stateRef.current = next;
    setState(next);
    return next;
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    if (!section || !viewport) return undefined;

    const clampStep = (value: number) => Math.max(0, Math.min(stepCount - 1, value));
    const getSectionTop = () => Math.round(section.getBoundingClientRect().top + window.scrollY);
    const getSectionBottom = () => getSectionTop() + section.offsetHeight;

    let lastScrollY = window.scrollY;
    let lockAnchorY = window.scrollY;
    let touchStartY = 0;
    let wheelAccum = 0;
    let wheelGestureConsumed = false;
    let wheelIdleTimer: ReturnType<typeof setTimeout> | null = null;
    let animationSafetyTimer: ReturnType<typeof setTimeout> | null = null;
    let syncRafId: number | null = null;
    let scrollRafId: number | null = null;
    let suppressLockUntil = 0;
    let suppressedExitDirection: StepDirection | null = null;
    let lockedListenersAttached = false;
    let lockGestureGuardUntil = 0;

    const clearWheelGesture = () => {
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      wheelIdleTimer = null;
      wheelAccum = 0;
      wheelGestureConsumed = false;
    };

    const scheduleWheelReset = () => {
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      wheelIdleTimer = setTimeout(() => {
        wheelAccum = 0;
        wheelGestureConsumed = false;
      }, wheelIdleMs);
    };

    const clearAnimationSafety = () => {
      if (animationSafetyTimer) clearTimeout(animationSafetyTimer);
      animationSafetyTimer = null;
    };

    const syncLockedScroll = () => {
      if (!stateRef.current.isLocked) return;

      if (syncRafId !== null) window.cancelAnimationFrame(syncRafId);
      syncRafId = window.requestAnimationFrame(() => {
        syncRafId = null;
        if (Math.abs(window.scrollY - lockAnchorY) <= 1) return;
        window.scrollTo({ top: lockAnchorY, behavior: "instant" });
      });
    };

    const setStepInstant = (step: number) => {
      clearAnimationSafety();
      updateState((prev) => ({
        ...prev,
        currentStep: clampStep(step),
        targetStep: null,
        isAnimating: false,
        direction: null,
        queuedDirection: null,
      }));
    };

    const releaseToScroll = (target: number) => {
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

    const onWheel = (event: WheelEvent) => {
      if (!stateRef.current.isLocked) return;
      if (event.cancelable) event.preventDefault();
      if (performance.now() < lockGestureGuardUntil) return;

      const delta = normalizeWheelDelta(event);
      if (Math.abs(delta) < 0.5) return;

      scheduleWheelReset();
      wheelAccum += delta;

      if (wheelGestureConsumed || Math.abs(wheelAccum) < wheelThreshold) return;
      wheelGestureConsumed = true;
      requestDirectionalStepRef.current(wheelAccum > 0 ? "forward" : "backward", Math.abs(wheelAccum));
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!stateRef.current.isLocked) return;
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!stateRef.current.isLocked) return;
      if (event.cancelable) event.preventDefault();
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!stateRef.current.isLocked) return;
      if (performance.now() < lockGestureGuardUntil) return;

      const endY = event.changedTouches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - endY;
      touchStartY = 0;

      if (Math.abs(delta) < touchThreshold) return;
      requestDirectionalStepRef.current(delta > 0 ? "forward" : "backward", Math.abs(delta));
    };

    const onTouchCancel = () => {
      touchStartY = 0;
    };

    const removeLockedInputListeners = () => {
      if (!lockedListenersAttached) return;
      lockedListenersAttached = false;
      document.removeEventListener("wheel", onWheel, CAPTURE_ONLY);
      document.removeEventListener("touchstart", onTouchStart, CAPTURE_ONLY);
      document.removeEventListener("touchmove", onTouchMove, CAPTURE_ONLY);
      document.removeEventListener("touchend", onTouchEnd, CAPTURE_ONLY);
      document.removeEventListener("touchcancel", onTouchCancel, CAPTURE_ONLY);
    };

    const addLockedInputListeners = () => {
      if (lockedListenersAttached) return;
      lockedListenersAttached = true;
      document.addEventListener("wheel", onWheel, CAPTURE_ACTIVE);
      document.addEventListener("touchstart", onTouchStart, CAPTURE_PASSIVE);
      document.addEventListener("touchmove", onTouchMove, CAPTURE_ACTIVE);
      document.addEventListener("touchend", onTouchEnd, CAPTURE_PASSIVE);
      document.addEventListener("touchcancel", onTouchCancel, CAPTURE_PASSIVE);
    };

    const disableLock = (resumeLenis: boolean) => {
      removeLockedInputListeners();
      clearWheelGesture();
      clearAnimationSafety();
      touchStartY = 0;

      if (syncRafId !== null) {
        window.cancelAnimationFrame(syncRafId);
        syncRafId = null;
      }

      updateState((prev) => ({
        ...prev,
        isLocked: false,
        targetStep: prev.isAnimating ? prev.targetStep : null,
        direction: prev.isAnimating ? prev.direction : null,
        queuedDirection: prev.isAnimating ? prev.queuedDirection : null,
      }));

      if (resumeLenis) getLenis()?.start();
    };

    const exitScene = (direction: StepDirection, impulse = 0) => {
      const sectionTop = getSectionTop();
      const sectionBottom = getSectionBottom();
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const carry = Math.max(exitCarryPx, Math.abs(impulse));

      suppressLockUntil = performance.now() + EXIT_SUPPRESSION_MS;
      suppressedExitDirection = direction;

      disableLock(false);

      if (direction === "forward") {
        const forwardExitTarget = Math.max(lockAnchorY + carry, sectionBottom - window.innerHeight + exitCarryPx);
        const target = Math.min(maxScroll, Math.round(forwardExitTarget));
        lastScrollY = target;
        releaseToScroll(target);
        return;
      }

      const backwardExitTarget = Math.min(lockAnchorY - carry, sectionTop - exitCarryPx);
      const target = Math.max(0, Math.round(backwardExitTarget));
      lastScrollY = target;
      releaseToScroll(target);
    };

    const startAnimationSafety = () => {
      clearAnimationSafety();
      animationSafetyTimer = setTimeout(() => {
        completeAnimationRef.current();
      }, animationSafetyMs);
    };

    const beginTransition = (nextStep: number, direction: StepDirection) => {
      const snapshot = stateRef.current;
      const index = clampStep(nextStep);
      if (snapshot.isAnimating || index === snapshot.currentStep) return false;

      updateState((prev) => ({
        ...prev,
        targetStep: index,
        isAnimating: true,
        direction,
        queuedDirection: null,
      }));

      startAnimationSafety();
      return true;
    };

    completeAnimationRef.current = () => {
      clearAnimationSafety();

      const snapshot = stateRef.current;
      if (!snapshot.isAnimating || snapshot.targetStep === null) return;

      const queuedDirection = snapshot.queuedDirection;

      updateState((prev) => ({
        ...prev,
        currentStep: prev.targetStep ?? prev.currentStep,
        targetStep: null,
        isAnimating: false,
        direction: null,
        queuedDirection: null,
      }));

      if (queuedDirection) {
        window.requestAnimationFrame(() => {
          requestDirectionalStepRef.current(queuedDirection);
        });
      } else if (wheelGestureConsumed && wheelIdleTimer === null) {
        scheduleWheelReset();
      }
    };

    jumpToStepRef.current = (step: number) => {
      const snapshot = stateRef.current;
      const index = clampStep(step);

      if (snapshot.isAnimating || index === snapshot.currentStep) return false;

      const direction: StepDirection = index > snapshot.currentStep ? "forward" : "backward";
      return beginTransition(index, direction);
    };

    requestDirectionalStepRef.current = (direction: StepDirection, impulse = 0) => {
      const snapshot = stateRef.current;
      if (!snapshot.isLocked) return false;

      if (snapshot.isAnimating) {
        if (queueDuringAnimation && snapshot.queuedDirection === null) {
          updateState((prev) => ({ ...prev, queuedDirection: direction }));
        }
        return false;
      }

      const nextStep =
        direction === "forward"
          ? snapshot.currentStep + 1
          : snapshot.currentStep - 1;

      if (nextStep < 0 || nextStep >= stepCount) {
        exitScene(direction, impulse);
        return false;
      }

      return beginTransition(nextStep, direction);
    };

    const lockScene = (entryDirection: StepDirection, seededDirection: StepDirection | null = null) => {
      const sectionTop = getSectionTop();
      const sectionBottom = getSectionBottom();
      const boundaryY = entryDirection === "forward"
        ? sectionTop
        : Math.max(sectionTop, sectionBottom - window.innerHeight);

      suppressLockUntil = 0;
      suppressedExitDirection = null;
      clearWheelGesture();

      lockAnchorY = lockAnchorMode === "section-boundary" ? boundaryY : window.scrollY;
      window.scrollTo({ top: lockAnchorY, behavior: "instant" });
      lastScrollY = lockAnchorY;

      getLenis()?.stop();
      addLockedInputListeners();

      syncState({
        ...stateRef.current,
        isLocked: true,
        targetStep: null,
        isAnimating: false,
        direction: null,
        queuedDirection: null,
      });

      if (entryDirection === "forward") {
        if (stateRef.current.currentStep !== 0) {
          setStepInstant(0);
        }
      } else if (stateRef.current.currentStep !== stepCount - 1) {
        setStepInstant(stepCount - 1);
      }

      syncLockedScroll();

      if (seededDirection) {
        lockGestureGuardUntil = performance.now() + 520;
        wheelAccum = 0;
        wheelGestureConsumed = true;
        window.requestAnimationFrame(() => {
          if (!stateRef.current.isLocked || stateRef.current.isAnimating) return;
          requestDirectionalStepRef.current(seededDirection, wheelThreshold);
        });
      }
    };

    const maybeLockScene = () => {
      const currentY = window.scrollY;
      const direction =
        currentY > lastScrollY
          ? "forward"
          : currentY < lastScrollY
            ? "backward"
            : null;

      if (stateRef.current.isLocked) {
        syncLockedScroll();
        lastScrollY = lockAnchorY;
        return;
      }

      if (performance.now() < suppressLockUntil) {
        if (!direction || direction === suppressedExitDirection) {
          lastScrollY = currentY;
          return;
        }
      } else if (suppressedExitDirection) {
        suppressedExitDirection = null;
      }

      const sectionTop = getSectionTop();
      const sectionBottom = getSectionBottom();
      const bottomLockY = Math.max(sectionTop, sectionBottom - window.innerHeight);
      const rect = section.getBoundingClientRect();
      const sectionVisible = rect.bottom > 0 && rect.top < window.innerHeight;

      const crossedFromAbove =
        direction === "forward" &&
        lastScrollY < sectionTop - activationSlopPx &&
        currentY >= sectionTop - activationSlopPx;

      const enteredForwardLockZone =
        direction === "forward" &&
        lastScrollY < sectionTop &&
        currentY >= sectionTop - activationSlopPx;

      const crossedFromBelow =
        direction === "backward" &&
        lastScrollY > bottomLockY + activationSlopPx &&
        currentY <= bottomLockY + activationSlopPx;

      const enteredBackwardLockZone =
        direction === "backward" &&
        lastScrollY > bottomLockY &&
        currentY <= bottomLockY + activationSlopPx;

      if (sectionVisible && (crossedFromAbove || enteredForwardLockZone || crossedFromBelow || enteredBackwardLockZone)) {
        const shouldSeedForwardStep =
          suppressedExitDirection === "backward" &&
          direction === "forward";

        suppressLockUntil = 0;
        suppressedExitDirection = null;
        lockScene(direction ?? (currentY >= sectionTop ? "forward" : "backward"), shouldSeedForwardStep ? "forward" : null);
        return;
      }

      lastScrollY = currentY;
    };

    const handleWindowScroll = () => {
      if (stateRef.current.isLocked) {
        syncLockedScroll();
        lastScrollY = lockAnchorY;
        return;
      }

      if (scrollRafId !== null) return;
      scrollRafId = window.requestAnimationFrame(() => {
        scrollRafId = null;
        maybeLockScene();
      });
    };

    const handleResize = () => {
      if (stateRef.current.isLocked) {
        syncLockedScroll();
        return;
      }

      lastScrollY = window.scrollY;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!stateRef.current.isLocked) return;

      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        requestDirectionalStepRef.current("forward");
      }

      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        requestDirectionalStepRef.current("backward");
      }
    };

    setStepInstant(0);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    maybeLockScene();

    return () => {
      clearWheelGesture();
      clearAnimationSafety();
      removeLockedInputListeners();
      if (scrollRafId !== null) window.cancelAnimationFrame(scrollRafId);
      if (syncRafId !== null) window.cancelAnimationFrame(syncRafId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleWindowScroll);
      window.removeEventListener("resize", handleResize);
      getLenis()?.start();
    };
  }, [
    activationSlopPx,
    animationSafetyMs,
    exitCarryPx,
    lockAnchorMode,
    queueDuringAnimation,
    sectionRef,
    stepCount,
    syncState,
    touchThreshold,
    updateState,
    viewportRef,
    wheelIdleMs,
    wheelThreshold,
  ]);

  const requestDirectionalStep = useCallback((direction: StepDirection, impulse?: number) => {
    return requestDirectionalStepRef.current(direction, impulse);
  }, []);

  const jumpToStep = useCallback((step: number) => {
    return jumpToStepRef.current(step);
  }, []);

  const completeAnimation = useCallback(() => {
    completeAnimationRef.current();
  }, []);

  return {
    state,
    displayStep: state.targetStep ?? state.currentStep,
    completeAnimation,
    jumpToStep,
    requestDirectionalStep,
  };
}
