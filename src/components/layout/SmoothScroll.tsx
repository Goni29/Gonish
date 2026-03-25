"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    /* ── 모바일 안정화 설정 (클라이언트 전용) ── */
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const lenis = new Lenis({
      lerp: 0.1,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    /* gsap.ticker 기반 동기화 — 수동 RAF보다 GSAP과 정확히 동기 */
    const tickHandler = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickHandler);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
