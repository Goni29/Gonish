import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmartLineBreak from "@/components/ui/SmartLineBreak";

gsap.registerPlugin(ScrollTrigger);

const FILL_START_PROGRESS = 0.08;
const WAVE_POINT_COUNT = 18;
const WAVE_AMPLITUDE = 8.2;
const PRIMARY_WAVE_CYCLES = 1.45;
const SECONDARY_WAVE_CYCLES = 2.7;
const WAVE_PHASE_SPEED = 0.0022;
const SECONDARY_WAVE_RATIO = 0.42;
const EMPTY_LEVEL_THRESHOLD = 99.8;
const FULL_LEVEL_THRESHOLD = 0.2;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function getWaveClipPath(level: number, phase: number) {
  const points: string[] = [];

  for (let index = 0; index <= WAVE_POINT_COUNT; index += 1) {
    const ratio = index / WAVE_POINT_COUNT;
    const x = ratio * 100;
    const primary =
      Math.sin(ratio * Math.PI * 2 * PRIMARY_WAVE_CYCLES + phase) * WAVE_AMPLITUDE;
    const secondary =
      Math.sin(ratio * Math.PI * 2 * SECONDARY_WAVE_CYCLES - phase * 1.25 + 1.4) *
      (WAVE_AMPLITUDE * SECONDARY_WAVE_RATIO);
    const y = clamp(level + primary + secondary, 0, 100);

    points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }

  return `polygon(${points.join(", ")}, 100% 100%, 0% 100%)`;
}

export default function FillWordSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const fillMaskRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const fillMask = fillMaskRef.current;

    if (!section || !fillMask) {
      return undefined;
    }

    const liquidState = { level: 100 };
    let rafId = 0;

    const updateWave = (time: number) => {
      let clipPath = "";

      if (liquidState.level >= EMPTY_LEVEL_THRESHOLD) {
        clipPath = "inset(100% 0% 0% 0%)";
      } else if (liquidState.level <= FULL_LEVEL_THRESHOLD) {
        clipPath = "inset(0% 0% 0% 0%)";
      } else {
        const phase = time * WAVE_PHASE_SPEED;
        clipPath = getWaveClipPath(liquidState.level, phase);
      }

      fillMask.style.setProperty("clip-path", clipPath);
      fillMask.style.setProperty("-webkit-clip-path", clipPath);
      rafId = window.requestAnimationFrame(updateWave);
    };

    const context = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=1800",
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: false,
        },
      })
        .to(liquidState, {
          level: 0,
          duration: 1 - FILL_START_PROGRESS,
          ease: "none",
        }, FILL_START_PROGRESS);
    }, section);

    rafId = window.requestAnimationFrame(updateWave);

    return () => {
      window.cancelAnimationFrame(rafId);
      fillMask.style.removeProperty("clip-path");
      fillMask.style.removeProperty("-webkit-clip-path");
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[100svh] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/FillWordSection.png')] bg-cover bg-center bg-no-repeat"
      />

      <div className="shell relative z-10 flex h-full items-center">
        <div className="w-full space-y-12">
          <div className="max-w-xl space-y-4">
            <p className="eyebrow">Signature invitation</p>
            <p className="text-base leading-7 text-ink-muted md:text-lg">
              브랜드의 제안을 가장 선명한 순간에 제시해, 방문자의 결심이 자연스럽게 다음 행동으로
              이어지도록 구성한 장면입니다.
            </p>
          </div>

          <div className="relative">
            <p className="text-outline font-display text-[clamp(3.8rem,11vw,9.5rem)] leading-[0.92] tracking-[-0.04em]">
              <SmartLineBreak text="Gonish와 완성하세요." maxCharsPerLine={10} autoFit={false} />
            </p>

            <div ref={fillMaskRef} className="absolute inset-0 overflow-hidden">
              <p className="font-display text-[clamp(3.8rem,11vw,9.5rem)] leading-[0.92] tracking-[-0.04em] text-[#f31d5b]">
                <SmartLineBreak text="Gonish와 완성하세요." maxCharsPerLine={10} autoFit={false} />
              </p>
            </div>
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
