"use client";

import { useRef } from "react";
import Link from "next/link";
import type { MotionValue } from "motion/react";
import { motion, useScroll, useTransform } from "motion/react";
import BrandButton from "@/components/ui/BrandButton";
import SmartLineBreak from "@/components/ui/SmartLineBreak";

type OrbitProject = {
  eyebrow: string;
  offsetClass: string;
  subtitle: string;
  summary: string;
  title: string;
  to: string;
};

const orbitProjects: OrbitProject[] = [
  {
    eyebrow: "Glow orbit",
    title: "Haute Beauty Commerce",
    subtitle: "감각을 전시하다",
    summary:
      "제품의 매력이 한눈에 전달되고, 탐색에서 결제까지 끊김 없이 이어지는 프리미엄 뷰티 커머스.",
    to: "/portfolio",
    offsetClass: "lg:ml-0",
  },
  {
    eyebrow: "Care orbit",
    title: "Private Dental Clinic",
    subtitle: "안심을 설계하다",
    summary:
      "처음 방문하는 환자도 진료 과목과 예약 방법을 바로 파악하고, 안심하고 예약까지 이어지는 병원 사이트.",
    to: "/portfolio",
    offsetClass: "lg:ml-16",
  },
  {
    eyebrow: "Trust orbit",
    title: "Prestige Law Firm",
    subtitle: "신뢰를 시각화하다",
    summary:
      "전문 분야와 성공사례가 명확히 읽히고, 상담 요청까지 자연스럽게 연결되는 법무법인 브랜드 사이트.",
    to: "/portfolio",
    offsetClass: "lg:ml-8",
  },
];

export default function PortfolioPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const ringReverse = useTransform(scrollYProgress, [0, 1], [0, -42]);
  const planetLift = useTransform(scrollYProgress, [0, 1], [-12, 18]);

  return (
    <section ref={sectionRef} className="section-space relative overflow-hidden">
      <motion.div
        className="pointer-events-none absolute left-[-8rem] top-20 h-[24rem] w-[24rem] rounded-full bg-brand/[0.08] blur-[120px]"
        style={{ y: planetLift }}
      />
      <motion.div
        className="pointer-events-none absolute right-[-12rem] top-16 h-[28rem] w-[28rem] rounded-full bg-brand/[0.08] blur-[130px]"
        style={{ y: ringRotate }}
      />

      <div className="shell relative z-10 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.24 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl space-y-5"
        >
          <p className="eyebrow">Orbit archive</p>
          <p className="font-display text-[clamp(2.6rem,5vw,5.8rem)] leading-[0.92] text-ink">
            <SmartLineBreak text="브랜드가 머무는 궤도마다, 다른 첫인상을 설계합니다." />
          </p>
          <p className="max-w-3xl text-base leading-7 text-ink-muted md:text-lg">
            결과물을 박스처럼 나열하기보다, 업종마다 어떤 감도와 신뢰의 장면을 만들었는지 하나의 핑크
            오비트 위에서 먼저 보여드립니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[3rem] border border-black/8 bg-white/[0.58] px-6 py-8 shadow-[0_28px_110px_rgba(20,16,20,0.08)] backdrop-blur-xl sm:px-8 sm:py-10 lg:px-10 lg:py-12"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(243,29,91,0.08),transparent_24%),radial-gradient(circle_at_76%_28%,rgba(255,194,216,0.4),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.08))]" />

          {/* 스파클 별 — planet.svg 스타일 */}
          <Sparkle cx="10%" cy="12%" size={14} delay={0} />
          <Sparkle cx="84%" cy="9%" size={10} delay={1.4} />
          <Sparkle cx="90%" cy="48%" size={12} delay={2.6} />
          <Sparkle cx="5%" cy="72%" size={9} delay={0.8} />
          <Sparkle cx="58%" cy="91%" size={11} delay={3} />
          <Sparkle cx="36%" cy="6%" size={8} delay={2} />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,0.98fr)_minmax(300px,0.82fr)] lg:items-center">
            <div className="space-y-8 lg:space-y-12">
              <p className="eyebrow">Selected works</p>

              {orbitProjects.map((project, index) => (
                <OrbitProjectLine key={project.title} project={project} index={index} />
              ))}

              <p className="max-w-xl text-sm leading-6 text-ink-muted">
                홈에서는 각 프로젝트의 분위기와 방향만 먼저 보여드립니다. 상세 케이스에서는 구조와 전환
                장치를 더 깊게 이어서 확인하실 수 있습니다.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <OrbitStage ringReverse={ringReverse} ringRotate={ringRotate} planetLift={planetLift} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <p className="max-w-3xl font-display text-[clamp(1.8rem,3vw,3rem)] leading-[0.98] text-ink">
            <SmartLineBreak text="업종이 달라도, 브랜드를 선택으로 연결하는 설계 기준은 같습니다." />
          </p>
          <BrandButton to="/portfolio" variant="ghost">
            전체 포트폴리오 보기
          </BrandButton>
        </motion.div>
      </div>
    </section>
  );
}

/* ── 스파클 (planet.svg 스타일 4포인트 별) ── */
function Sparkle({ cx, cy, size, delay }: { cx: string; cy: string; size: number; delay: number }) {
  const s = size;
  const h = s / 2;
  const d = `M${h},0 L${h * 1.15},${h * 0.85} L${s},${h} L${h * 1.15},${h * 1.15} L${h},${s} L${h * 0.85},${h * 1.15} L0,${h} L${h * 0.85},${h * 0.85} Z`;

  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: cx, top: cy }}
      animate={{ opacity: [0.08, 0.5, 0.08], scale: [0.6, 1.1, 0.6], rotate: [0, 15, 0] }}
      transition={{ duration: 5, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <defs>
          <radialGradient id={`sp-${delay}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFDFDF" />
            <stop offset="100%" stopColor="#FFDFDF" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        <path d={d} fill={`url(#sp-${delay})`} />
      </svg>
    </motion.div>
  );
}

/* ── 프로젝트 라인 ── */
function OrbitProjectLine({
  project,
  index,
}: {
  project: OrbitProject;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.75, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={["space-y-3 border-l border-brand/14 pl-5", project.offsetClass].join(" ")}
    >
      <p className="text-[10px] uppercase tracking-[0.34em] text-brand/72">{project.eyebrow}</p>
      <div className="space-y-2">
        <p className="font-display text-[clamp(2rem,3vw,3.1rem)] leading-[0.94] text-ink">{project.title}</p>
        <p className="text-base leading-7 text-ink-muted">{project.subtitle}</p>
      </div>
      <p className="max-w-xl text-sm leading-6 text-ink-muted">{project.summary}</p>
      <Link
        href={project.to}
        className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-ink-muted transition-colors duration-300 hover:text-brand"
      >
        자세히 보기
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 bg-white/70 text-base leading-none text-brand">
          +
        </span>
      </Link>
    </motion.div>
  );
}

/* ── 오비트 스테이지 — planet.svg 에셋 활용 ── */
function OrbitStage({
  ringReverse,
  ringRotate,
  planetLift,
}: {
  ringReverse: MotionValue<number>;
  ringRotate: MotionValue<number>;
  planetLift: MotionValue<number>;
}) {
  return (
    <div className="relative aspect-square w-full max-w-[320px] md:max-w-[380px]">
      {/* 외부 타원 궤도 — planet_circle.svg 컬러 (#D29BA7 → #F7C9D8) */}
      <motion.svg
        viewBox="0 0 400 400"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ rotate: ringRotate }}
      >
        <defs>
          <linearGradient id="po-orbit1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D29BA7" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#E9B9C6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#F7C9D8" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <ellipse cx="200" cy="200" rx="192" ry="162" fill="none" stroke="url(#po-orbit1)" strokeWidth="1" strokeDasharray="8 14" transform="rotate(-12 200 200)" />
        {/* 궤도 위성 */}
        <circle cx="200" cy="38" r="3.5">
          <animate attributeName="fill" values="#F0899E;#FDD4C6;#F0899E" dur="4s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="22s" repeatCount="indefinite" />
          <animate attributeName="r" values="3;4.2;3" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="38" cy="200" r="2" fill="#FDD4C6" stroke="#F0899E" strokeWidth="0.5" strokeOpacity="0.4">
          <animateTransform attributeName="transform" type="rotate" from="90 200 200" to="450 200 200" dur="22s" repeatCount="indefinite" />
        </circle>
      </motion.svg>

      {/* 중간 타원 궤도 */}
      <motion.svg
        viewBox="0 0 400 400"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ rotate: ringReverse }}
      >
        <defs>
          <linearGradient id="po-orbit2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E9A5A9" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#F9C4C7" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#FFDADD" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <ellipse cx="200" cy="200" rx="142" ry="120" fill="none" stroke="url(#po-orbit2)" strokeWidth="0.8" strokeDasharray="4 10" transform="rotate(8 200 200)" />
        <circle cx="200" cy="80" r="2.8" fill="#CB6279" fillOpacity="0.4">
          <animateTransform attributeName="transform" type="rotate" from="180 200 200" to="540 200 200" dur="16s" repeatCount="indefinite" />
        </circle>
      </motion.svg>

      {/* 내부 궤도 */}
      <motion.svg
        viewBox="0 0 400 400"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ rotate: ringRotate }}
      >
        <ellipse cx="200" cy="200" rx="90" ry="80" fill="none" stroke="#D9A4B0" strokeOpacity="0.15" strokeWidth="0.5" transform="rotate(-6 200 200)" />
      </motion.svg>

      {/* 별자리 연결선 */}
      <svg viewBox="0 0 400 400" className="pointer-events-none absolute inset-0 h-full w-full">
        <line x1="48" y1="96" x2="110" y2="72" stroke="#E9A5A9" strokeOpacity="0.12" strokeWidth="0.4" />
        <line x1="110" y1="72" x2="148" y2="128" stroke="#E9A5A9" strokeOpacity="0.08" strokeWidth="0.4" />
        <line x1="270" y1="292" x2="326" y2="252" stroke="#E9A5A9" strokeOpacity="0.1" strokeWidth="0.4" />
        <line x1="326" y1="252" x2="348" y2="298" stroke="#E9A5A9" strokeOpacity="0.07" strokeWidth="0.4" />
      </svg>

      {/* 중심 행성 — planet.svg 사용 */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ y: planetLift }}
      >
        <motion.img
          src="/planet.svg"
          alt=""
          className="h-[160px] w-[160px] md:h-[180px] md:w-[180px]"
          draggable={false}
          animate={{ filter: ["drop-shadow(0 0 24px rgba(243,29,91,0.18))", "drop-shadow(0 0 36px rgba(243,29,91,0.28))", "drop-shadow(0 0 24px rgba(243,29,91,0.18))"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* 위성 — planet.svg 컬러 기반 미니 행성 */}
      <motion.div
        className="pointer-events-none absolute left-[12%] top-[24%]"
        style={{ y: ringReverse }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32">
          <defs>
            <radialGradient id="po-sat1" cx="38%" cy="34%" r="58%">
              <stop offset="0%" stopColor="#FDD4C6" />
              <stop offset="65%" stopColor="#F0899E" />
              <stop offset="100%" stopColor="#CB6279" stopOpacity="0.6" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="12" fill="url(#po-sat1)" />
          <ellipse cx="13" cy="13" rx="4.5" ry="3" fill="rgba(255,255,255,0.22)" />
        </svg>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute right-[14%] bottom-[20%]"
        style={{ y: planetLift }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22">
          <defs>
            <radialGradient id="po-sat2" cx="40%" cy="36%" r="56%">
              <stop offset="0%" stopColor="#FDE7EA" />
              <stop offset="47%" stopColor="#F5A6C3" />
              <stop offset="100%" stopColor="#D36582" stopOpacity="0.5" />
            </radialGradient>
          </defs>
          <circle cx="11" cy="11" r="8" fill="url(#po-sat2)" />
          <ellipse cx="9" cy="9" rx="3" ry="2" fill="rgba(255,255,255,0.18)" />
        </svg>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[10px] uppercase tracking-[0.34em] text-ink-soft">
        Pink orbit selection
      </div>
    </div>
  );
}
