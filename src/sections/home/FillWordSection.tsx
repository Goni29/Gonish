import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmartLineBreak from "@/components/ui/SmartLineBreak";

gsap.registerPlugin(ScrollTrigger);

/* ── wave config ─────────────────────────────────── */
const FILL_START_PROGRESS = 0.08;
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
  const prevLevelRef = useRef(100);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const fillText = fillTextRef.current;
    if (!section || !fillText) return undefined;

    const liquidState = { level: 100 };
    let rafId = 0;

    const updateWave = (time: number) => {
      const w = fillText.clientWidth;
      const h = fillText.clientHeight;
      if (w === 0 || h === 0) { rafId = requestAnimationFrame(updateWave); return; }

      const phase = time * WAVE_PHASE_SPEED;
      const level = liquidState.level;
      prevLevelRef.current = level;

      if (level >= EMPTY_LEVEL_THRESHOLD) {
        fillText.style.backgroundImage = "none";
        rafId = requestAnimationFrame(updateWave);
        return;
      }
      if (level <= FULL_LEVEL_THRESHOLD) {
        fillText.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg'><rect width='100%' height='100%' fill='${FC}'/></svg>`
        )}")`;
        rafId = requestAnimationFrame(updateWave);
        return;
      }

      /* wave fill polygon */
      let pathD = "";
      for (let i = 0; i <= WAVE_POINT_COUNT; i++) {
        const r = i / WAVE_POINT_COUNT;
        const x = r * w;
        const y = (getWaveY(r, level, phase) / 100) * h;
        pathD += i === 0 ? `M${f1(x)} ${f1(y)}` : `L${f1(x)} ${f1(y)}`;
      }
      pathD += `L${w} ${h}L0 ${h}Z`;

      /* surface highlight */
      let hlD = "";
      for (let i = 0; i <= WAVE_POINT_COUNT * 2; i++) {
        const r = i / (WAVE_POINT_COUNT * 2);
        const x = r * w;
        const y = (getWaveY(r, level, phase) / 100) * h;
        hlD += i === 0 ? `M${f1(x)} ${f1(y)}` : `L${f1(x)} ${f1(y)}`;
      }

      const svgStr = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><path d="${pathD}" fill="${FC}"/><path d="${hlD}" fill="none" stroke="white" stroke-width="1.2" opacity="0.18"/></svg>`;
      fillText.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svgStr)}")`;

      rafId = requestAnimationFrame(updateWave);
    };

    const gsapCtx = gsap.context(() => {
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
          pinType: "transform",
        },
      }).to(liquidState, {
        level: 0,
        duration: 1 - FILL_START_PROGRESS,
        ease: "none",
      }, FILL_START_PROGRESS);
    }, section);

    rafId = requestAnimationFrame(updateWave);

    return () => {
      cancelAnimationFrame(rafId);
      gsapCtx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[100svh] overflow-hidden">
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

          <div className="relative">
            <p className="text-outline font-display text-[clamp(3.8rem,11vw,9.5rem)] leading-[0.92] tracking-[-0.04em]">
              <SmartLineBreak text="Gonish와 완성하세요." maxCharsPerLine={10} autoFit={false} />
            </p>

            <p
              ref={fillTextRef}
              className="absolute inset-0 font-display text-[clamp(3.8rem,11vw,9.5rem)] leading-[0.92] tracking-[-0.04em]"
              style={{
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
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
