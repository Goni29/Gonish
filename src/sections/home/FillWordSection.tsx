import { useLayoutEffect, useRef } from "react";
import SmartLineBreak from "@/components/ui/SmartLineBreak";

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

type FillProgressDetail = {
  level?: number;
  progress?: number;
};

export default function FillWordSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sceneViewportRef = useRef<HTMLDivElement | null>(null);
  const fillTextRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const fillText = fillTextRef.current;
    if (!section || !fillText) return undefined;

    const liquidState = { level: 100 };
    const fillState = { progress: 0 };
    const sectionMetrics = { start: 0, range: 1 };
    let hasAppliedProgress = false;
    let waveRafId = 0;
    let scrollRafId: number | null = null;
    let metricsRafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const applyFillProgress = (progress: number) => {
      const nextProgress = clamp(progress, 0, 1);
      if (hasAppliedProgress && Math.abs(nextProgress - fillState.progress) < 0.0005) return;

      hasAppliedProgress = true;
      fillState.progress = nextProgress;
      liquidState.level = clamp(100 - fillState.progress * 100, 0, 100);
      fillText.dataset.fillLevel = liquidState.level.toFixed(2);
    };

    const updateSectionMetrics = () => {
      sectionMetrics.start = section.getBoundingClientRect().top + window.scrollY;
      sectionMetrics.range = Math.max(section.offsetHeight - window.innerHeight, 1);
    };

    const syncFillProgressToScroll = () => {
      const nextProgress = (window.scrollY - sectionMetrics.start) / sectionMetrics.range;
      applyFillProgress(nextProgress);
    };

    const scheduleProgressSync = () => {
      if (scrollRafId !== null) return;
      scrollRafId = window.requestAnimationFrame(() => {
        scrollRafId = null;
        syncFillProgressToScroll();
      });
    };

    const scheduleMetricsRefresh = () => {
      if (metricsRafId !== null) return;
      metricsRafId = window.requestAnimationFrame(() => {
        metricsRafId = null;
        updateSectionMetrics();
        syncFillProgressToScroll();
      });
    };

    const handleFillProgressRequest = (event: Event) => {
      const detail = (event as CustomEvent<FillProgressDetail>).detail;
      if (!detail) return;

      if (typeof detail.level === "number") {
        applyFillProgress(1 - clamp(detail.level, 0, 100) / 100);
        return;
      }

      if (typeof detail.progress === "number") {
        applyFillProgress(detail.progress);
      }
    };

    const updateWave = (time: number) => {
      const phase = time * WAVE_PHASE_SPEED;
      const level = liquidState.level;

      if (level >= EMPTY_LEVEL_THRESHOLD) {
        const emptyClip = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
        fillText.style.clipPath = emptyClip;
        fillText.style.setProperty("-webkit-clip-path", emptyClip);
        waveRafId = requestAnimationFrame(updateWave);
        return;
      }

      if (level <= FULL_LEVEL_THRESHOLD) {
        const fullClip = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
        fillText.style.clipPath = fullClip;
        fillText.style.setProperty("-webkit-clip-path", fullClip);
        waveRafId = requestAnimationFrame(updateWave);
        return;
      }

      const polygonPoints: string[] = [];
      for (let i = 0; i <= WAVE_POINT_COUNT; i++) {
        const ratio = i / WAVE_POINT_COUNT;
        const xPct = ratio * 100;
        const yPct = getWaveY(ratio, level, phase);
        polygonPoints.push(`${f1(xPct)}% ${f1(yPct)}%`);
      }

      const clipPath = `polygon(${polygonPoints.join(", ")}, 100% 100%, 0% 100%)`;
      fillText.style.clipPath = clipPath;
      fillText.style.setProperty("-webkit-clip-path", clipPath);
      waveRafId = requestAnimationFrame(updateWave);
    };

    section.addEventListener("gonish:fill-progress", handleFillProgressRequest as EventListener);
    updateSectionMetrics();
    syncFillProgressToScroll();
    waveRafId = requestAnimationFrame(updateWave);
    window.addEventListener("scroll", scheduleProgressSync, { passive: true });
    window.addEventListener("resize", scheduleMetricsRefresh);

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        scheduleMetricsRefresh();
      });
      resizeObserver.observe(section);
    }

    return () => {
      cancelAnimationFrame(waveRafId);
      section.removeEventListener("gonish:fill-progress", handleFillProgressRequest as EventListener);
      window.removeEventListener("scroll", scheduleProgressSync);
      window.removeEventListener("resize", scheduleMetricsRefresh);
      resizeObserver?.disconnect();
      if (scrollRafId !== null) window.cancelAnimationFrame(scrollRafId);
      if (metricsRafId !== null) window.cancelAnimationFrame(metricsRafId);
    };
  }, []);

  return (
    <section ref={sectionRef} data-home-section="fill-word" className="fill-word-section relative isolate h-[200svh]">
      <div ref={sceneViewportRef} className="fill-word-section__scene-viewport sticky top-0 h-[100svh] overflow-hidden">
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
