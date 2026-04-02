"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let globalLenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return globalLenis;
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

export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    const useNativeScroll = isIosTouchDevice();
    ScrollTrigger.normalizeScroll(true);

    if (useNativeScroll) {
      globalLenis = null;
      lenisRef.current = null;

      const refreshId = window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        window.cancelAnimationFrame(refreshId);
        ScrollTrigger.normalizeScroll(false);
        globalLenis = null;
      };
    }

    const lenis = new Lenis({
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
    };
  }, []);

  return null;
}
