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

/* ── particle config ─────────────────────────────── */
const MAX_DROPLETS = 24;
const MAX_SPLASHES = 18;
const MAX_BUBBLES = 12;
const DROPLET_SPAWN_RATE = 0.45;
const SPLASH_SPAWN_RATE = 0.35;
const BUBBLE_SPAWN_RATE = 0.22;
const FC = "#f31d5b";          // fill color
const FC_L = "rgba(243,29,91,0.45)"; // fill light

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const f1 = (n: number) => n.toFixed(1);
const f2 = (n: number) => n.toFixed(2);

/* ── particle types ──────────────────────────────── */
interface Droplet {
  x: number; y: number; vx: number; vy: number;
  radius: number; opacity: number; life: number; maxLife: number;
}
interface Splash {
  x: number; y: number; vx: number; vy: number;
  radius: number; opacity: number; life: number; maxLife: number; gravity: number;
}
interface Bubble {
  x: number; y: number; radius: number; opacity: number;
  wobblePhase: number; wobbleSpeed: number; riseSpeed: number;
  life: number; maxLife: number;
}

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

  const dropletsRef = useRef<Droplet[]>([]);
  const splashesRef = useRef<Splash[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);
  const prevLevelRef = useRef(100);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const fillText = fillTextRef.current;
    if (!section || !fillText) return undefined;

    const liquidState = { level: 100 };
    let rafId = 0;

    /* ── spawn helpers (coords in px relative to fillText) ── */
    const spawnDroplet = (w: number, h: number, level: number, phase: number) => {
      if (dropletsRef.current.length >= MAX_DROPLETS) return;
      const xr = rand(0.05, 0.95);
      const sy = (getWaveY(xr, level, phase) / 100) * h;
      dropletsRef.current.push({
        x: xr * w, y: sy,
        vx: rand(-1.5, 1.5), vy: rand(-5, -2),
        radius: rand(1.5, 4.5), opacity: rand(0.6, 1),
        life: 0, maxLife: rand(25, 55),
      });
    };

    const spawnSplash = (w: number, h: number, level: number, phase: number) => {
      if (splashesRef.current.length >= MAX_SPLASHES) return;
      const xr = rand(0.08, 0.92);
      const sy = (getWaveY(xr, level, phase) / 100) * h;
      splashesRef.current.push({
        x: xr * w, y: sy,
        vx: rand(-3, 3), vy: rand(-7, -2.5),
        radius: rand(1, 3.5), opacity: rand(0.6, 1),
        life: 0, maxLife: rand(20, 45), gravity: rand(0.12, 0.25),
      });
    };

    const spawnBubble = (w: number, h: number, level: number, phase: number) => {
      if (bubblesRef.current.length >= MAX_BUBBLES) return;
      const xr = rand(0.1, 0.9);
      const sy = (getWaveY(xr, level, phase) / 100) * h;
      bubblesRef.current.push({
        x: xr * w, y: Math.min(sy + rand(10, 50), h - 2),
        radius: rand(2, 5.5), opacity: rand(0.25, 0.55),
        wobblePhase: rand(0, Math.PI * 2), wobbleSpeed: rand(0.04, 0.1),
        riseSpeed: rand(0.3, 1), life: 0, maxLife: rand(50, 120),
      });
    };

    /* ── animation loop ── */
    const updateWave = (time: number) => {
      const w = fillText.clientWidth;
      const h = fillText.clientHeight;
      if (w === 0 || h === 0) { rafId = requestAnimationFrame(updateWave); return; }

      const phase = time * WAVE_PHASE_SPEED;
      const level = liquidState.level;
      const fillSpeed = Math.abs(prevLevelRef.current - level);
      prevLevelRef.current = level;

      /* ── empty / full shortcuts ── */
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

      /* ── spawn particles ── */
      const spawnIntensity = clamp(fillSpeed * 14, 0, 1);
      if (spawnIntensity > 0.02) {
        if (Math.random() < DROPLET_SPAWN_RATE * spawnIntensity) spawnDroplet(w, h, level, phase);
        if (Math.random() < SPLASH_SPAWN_RATE * spawnIntensity) spawnSplash(w, h, level, phase);
        if (Math.random() < BUBBLE_SPAWN_RATE * spawnIntensity) spawnBubble(w, h, level, phase);
      }

      /* ── build SVG string ── */
      const svg: string[] = [];

      /* wave fill polygon */
      let d = "";
      for (let i = 0; i <= WAVE_POINT_COUNT; i++) {
        const r = i / WAVE_POINT_COUNT;
        const x = r * w;
        const y = (getWaveY(r, level, phase) / 100) * h;
        d += i === 0 ? `M${f1(x)} ${f1(y)}` : `L${f1(x)} ${f1(y)}`;
      }
      d += `L${w} ${h}L0 ${h}Z`;
      svg.push(`<path d="${d}" fill="${FC}"/>`);

      /* surface foam line */
      let foamD = "";
      for (let i = 0; i <= WAVE_POINT_COUNT * 2; i++) {
        const r = i / (WAVE_POINT_COUNT * 2);
        const x = r * w;
        const y = (getWaveY(r, level, phase) / 100) * h;
        const fo = Math.sin(r * 28 + phase * 2) * 1.5;
        foamD += i === 0 ? `M${f1(x)} ${f1(y + fo)}` : `L${f1(x)} ${f1(y + fo)}`;
      }
      const foamAlpha = clamp(spawnIntensity * 2.5, 0.06, 0.3);
      svg.push(`<path d="${foamD}" fill="none" stroke="white" stroke-width="1.5" opacity="${f2(foamAlpha)}"/>`);

      /* droplets */
      const droplets = dropletsRef.current;
      for (let i = droplets.length - 1; i >= 0; i--) {
        const p = droplets[i];
        p.life++; p.vy += 0.18; p.x += p.vx; p.y += p.vy;
        const lr = p.life / p.maxLife;
        const a = p.opacity * (1 - lr * lr);
        if (p.life > p.maxLife || a < 0.01 || p.y > h + 10) { droplets.splice(i, 1); continue; }
        const rr = p.radius * (1 - lr * 0.3);
        svg.push(`<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(rr)}" fill="${FC}" opacity="${f2(a)}"/>`);
        svg.push(`<circle cx="${f1(p.x - rr * 0.3)}" cy="${f1(p.y - rr * 0.3)}" r="${f1(rr * 0.35)}" fill="white" opacity="${f2(a * 0.6)}"/>`);
      }

      /* splashes */
      const splashes = splashesRef.current;
      for (let i = splashes.length - 1; i >= 0; i--) {
        const p = splashes[i];
        p.life++; p.vy += p.gravity; p.x += p.vx; p.y += p.vy;
        const lr = p.life / p.maxLife;
        const a = p.opacity * (1 - lr);
        if (p.life > p.maxLife || a < 0.01) { splashes.splice(i, 1); continue; }
        const rr = p.radius * lerp(1, 0.3, lr);
        svg.push(`<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(rr)}" fill="${FC}" opacity="${f2(a)}"/>`);
      }

      /* bubbles */
      const bubbles = bubblesRef.current;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.life++; b.y -= b.riseSpeed;
        b.x += Math.sin(b.wobblePhase + b.life * b.wobbleSpeed) * 0.5;
        const lr = b.life / b.maxLife;
        const surfY = (getWaveY(clamp(b.x / w, 0, 1), level, phase) / 100) * h;

        if (b.life > b.maxLife || b.y < surfY) {
          if (b.y < surfY + 5 && splashes.length < MAX_SPLASHES) {
            for (let j = 0; j < 2; j++) {
              splashes.push({
                x: b.x + rand(-3, 3), y: surfY,
                vx: rand(-2, 2), vy: rand(-3.5, -1),
                radius: rand(1, 2), opacity: 0.7,
                life: 0, maxLife: rand(15, 30), gravity: 0.15,
              });
            }
          }
          bubbles.splice(i, 1);
          continue;
        }

        const a = b.opacity * (1 - lr * 0.5);
        svg.push(`<circle cx="${f1(b.x)}" cy="${f1(b.y)}" r="${f1(b.radius)}" fill="none" stroke="${FC_L}" stroke-width="1" opacity="${f2(a)}"/>`);
        svg.push(`<circle cx="${f1(b.x)}" cy="${f1(b.y)}" r="${f1(b.radius * 0.85)}" fill="${FC_L}" opacity="${f2(a * 0.2)}"/>`);
        svg.push(`<circle cx="${f1(b.x - b.radius * 0.3)}" cy="${f1(b.y - b.radius * 0.3)}" r="${f1(b.radius * 0.3)}" fill="white" opacity="${f2(a * 0.5)}"/>`);
      }

      /* set as background — background-clip: text does the glyph masking */
      const svgStr = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>${svg.join("")}</svg>`;
      fillText.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svgStr)}")`;

      rafId = requestAnimationFrame(updateWave);
    };

    /* ── GSAP scroll ── */
    const gsapCtx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=1800",
          scrub: true,
          pin: true,
          anticipatePin: 0,
          invalidateOnRefresh: true,
          fastScrollEnd: false,
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
      dropletsRef.current = [];
      splashesRef.current = [];
      bubblesRef.current = [];
      gsapCtx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[url('/FillWordSection.png')] bg-cover bg-center bg-no-repeat" />

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
            {/* outline text — always visible */}
            <p className="text-outline font-display text-[clamp(3.8rem,11vw,9.5rem)] leading-[0.92] tracking-[-0.04em]">
              <SmartLineBreak text="Gonish와 완성하세요." maxCharsPerLine={10} autoFit={false} />
            </p>

            {/* filled text — background-clip:text masks SVG to glyph shapes */}
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
