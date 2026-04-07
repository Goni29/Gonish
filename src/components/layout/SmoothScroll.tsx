"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let globalLenis: Lenis | null = null;
let dragScrollLockCount = 0;
type ScrollNormalizerController = {
  disable: () => void;
  enable: () => unknown;
};

let nativeDragScrollLockNormalizer: ScrollNormalizerController | null = null;
let nativeDragScrollLockObserver: ReturnType<typeof ScrollTrigger.observe> | null = null;
let nativeDragScrollLockSnapshot: {
  htmlOverflow: string;
  scrollY: number;
} | null = null;

function clearLenisClasses() {
  document.documentElement.classList.remove(
    "lenis",
    "lenis-smooth",
    "lenis-stopped",
    "lenis-scrolling",
    "lenis-locked",
  );
}

function setScrollMode(mode: "native" | "lenis" | null) {
  if (mode) {
    document.documentElement.dataset.scrollMode = mode;
    return;
  }

  delete document.documentElement.dataset.scrollMode;
}

function isScrollNormalizerController(value: unknown): value is ScrollNormalizerController {
  return (
    typeof value === "object" &&
    value !== null &&
    "disable" in value &&
    typeof value.disable === "function" &&
    "enable" in value &&
    typeof value.enable === "function"
  );
}

export function getLenis(): Lenis | null {
  return globalLenis;
}

export function lockPageScrollForDrag() {
  dragScrollLockCount += 1;
  if (dragScrollLockCount > 1) return;

  if (globalLenis) {
    globalLenis.stop();
    return;
  }

  nativeDragScrollLockSnapshot = {
    htmlOverflow: document.documentElement.style.overflow,
    scrollY: window.scrollY,
  };

  const activeNormalizer = ScrollTrigger.normalizeScroll();
  nativeDragScrollLockNormalizer = isScrollNormalizerController(activeNormalizer)
    ? activeNormalizer
    : null;
  nativeDragScrollLockNormalizer?.disable();

  document.documentElement.style.overflow = "hidden";
  nativeDragScrollLockObserver = ScrollTrigger.observe({
    allowClicks: true,
    debounce: false,
    preventDefault: true,
    target: window,
    type: "touch,wheel,scroll",
    onChangeY: () => {
      if (!nativeDragScrollLockSnapshot) return;
      window.scrollTo({ top: nativeDragScrollLockSnapshot.scrollY, behavior: "instant" });
    },
  });
}

export function unlockPageScrollForDrag() {
  if (dragScrollLockCount === 0) return;

  dragScrollLockCount -= 1;
  if (dragScrollLockCount > 0) return;

  if (globalLenis) {
    globalLenis.start();
    return;
  }

  nativeDragScrollLockObserver?.kill();
  nativeDragScrollLockObserver = null;
  nativeDragScrollLockNormalizer?.enable();
  nativeDragScrollLockNormalizer = null;

  if (!nativeDragScrollLockSnapshot) return;

  const { htmlOverflow, scrollY } = nativeDragScrollLockSnapshot;
  nativeDragScrollLockSnapshot = null;

  document.documentElement.style.overflow = htmlOverflow;
  window.scrollTo({ top: scrollY, behavior: "instant" });
}

export function isIosTouchDevice() {
  const platform = navigator.platform ?? "";
  const userAgent = navigator.userAgent ?? "";
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;
  const isAppleMobile =
    /iP(ad|hone|od)/.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1);

  return isAppleMobile && window.matchMedia("(pointer: coarse)").matches;
}

export function shouldUseNativeTouchScroll() {
  return window.matchMedia("(pointer: coarse)").matches || isIosTouchDevice();
}

type SmoothScrollProps = {
  restoreLegacyTouchMode?: boolean;
};

export default function SmoothScroll({ restoreLegacyTouchMode = false }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    const useNativeScroll = restoreLegacyTouchMode
      ? isIosTouchDevice()
      : shouldUseNativeTouchScroll();

    if (restoreLegacyTouchMode) {
      ScrollTrigger.normalizeScroll(true);
    }

    if (useNativeScroll) {
      if (!restoreLegacyTouchMode) {
        ScrollTrigger.normalizeScroll(false);
        clearLenisClasses();
      }
      setScrollMode("native");
      globalLenis = null;
      lenisRef.current = null;

      const refreshId = window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        window.cancelAnimationFrame(refreshId);
        ScrollTrigger.normalizeScroll(false);
        setScrollMode(null);
        globalLenis = null;
      };
    }

    if (!restoreLegacyTouchMode) {
      ScrollTrigger.normalizeScroll(true);
    }
    setScrollMode("lenis");

    const lenis = new Lenis({
      allowNestedScroll: true,
      lerp: 0.1,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;
    globalLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickHandler = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickHandler);
      lenis.destroy();
      ScrollTrigger.normalizeScroll(false);
      lenisRef.current = null;
      globalLenis = null;
      clearLenisClasses();
      setScrollMode(null);
    };
  }, [restoreLegacyTouchMode]);

  return null;
}
