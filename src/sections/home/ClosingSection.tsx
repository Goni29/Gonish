"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import BrandButton from "@/components/ui/BrandButton";
import SmartLineBreak from "@/components/ui/SmartLineBreak";

type OrbitItem = {
  title: string;
  description: string;
  to: string;
  /** 궤도 위 위치 (deg) */
  angle: number;
  /** 궤도 반지름 비율 (0~1, 컨테이너 대비) */
  radius: number;
};

const orbitItems: OrbitItem[] = [
  {
    title: "About",
    description: "브랜드를 어떤 기준으로, 어떤 순서로 설계하는지 확인해보세요.",
    to: "/about",
    angle: 225,
    radius: 0.42,
  },
  {
    title: "Portfolio",
    description: "업종별 무드와 전환 구조를 장면 중심으로 살펴볼 수 있습니다.",
    to: "/portfolio",
    angle: 330,
    radius: 0.44,
  },
  {
    title: "Estimate",
    description: "복잡한 용어 없이 필요한 제작 범위를 함께 정리해볼게요.",
    to: "/estimate",
    angle: 160,
    radius: 0.41,
  },
  {
    title: "Contact",
    description: "아이디어를 대화 속에서 다음 단계로 구조화해드립니다.",
    to: "/contact",
    angle: 45,
    radius: 0.29,
  },
];

export default function ClosingSection() {
  return (
    <section className="relative overflow-hidden py-[clamp(5rem,10vw,10rem)]">
      {/* 배경 글로우 */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[36rem] w-[36rem] rounded-full bg-brand/[0.06] blur-[140px]" />

      <div className="shell relative z-10">
        {/* 상단 타이포 */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 text-center space-y-4 md:mb-10"
        >
          <p className="eyebrow">Next orbit</p>
          <p className="mx-auto max-w-3xl font-display text-[clamp(2.2rem,4.5vw,4.8rem)] leading-[0.94] text-ink">
            <SmartLineBreak text="원하는 궤도를 선택해 다음 장면으로 이어가세요." />
          </p>
        </motion.div>

        {/* 궤도 시스템 */}
        <div className="relative mx-auto aspect-square w-full max-w-[520px] md:max-w-[600px]">

          {/* ── 궤도 링 1 (외부) — 상시 회전 ── */}
          <div className="pointer-events-none absolute inset-0 animate-[spin_60s_linear_infinite]">
            <svg viewBox="0 0 600 600" className="h-full w-full">
              <defs>
                <linearGradient id="cl-ring1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#CB6279" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="#D29BA7" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#E9B9C6" stopOpacity="0.65" />
                </linearGradient>
                <radialGradient id="cl-sparkle1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F0899E" />
                  <stop offset="100%" stopColor="#E9A5A9" />
                </radialGradient>
              </defs>
              <ellipse cx="300" cy="300" rx="275" ry="275" fill="none" stroke="url(#cl-ring1)" strokeWidth="1.6" strokeDasharray="8 16" />
              {/* 공전 위성 — planet_circle.svg 별 모양 */}
              <g transform="translate(300,25) scale(0.9)">
                <path d="M0,-14.3 L3.76,-4.8 L13.6,-0.3 L3.76,4.2 L0,14.3 L-4.06,4.2 L-14.24,-0.1 L-4.88,-4.3 Z" fill="url(#cl-sparkle1)">
                  <animate attributeName="opacity" values="0.85;1;0.85" dur="4s" repeatCount="indefinite" />
                  <animateTransform attributeName="transform" type="scale" values="0.85;1.15;0.85" dur="4s" repeatCount="indefinite" />
                </path>
              </g>
            </svg>
          </div>

          {/* ── 궤도 링 2 (중간) — 역방향 회전 ── */}
          <div className="pointer-events-none absolute inset-0 animate-[spin_45s_linear_infinite_reverse]">
            <svg viewBox="0 0 600 600" className="h-full w-full">
              <defs>
                <linearGradient id="cl-ring2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#CB6279" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#D29BA7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#E9A5A9" stopOpacity="0.55" />
                </linearGradient>
                <radialGradient id="cl-sparkle2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F0899E" />
                  <stop offset="100%" stopColor="#D29BA7" />
                </radialGradient>
              </defs>
              <ellipse cx="300" cy="300" rx="205" ry="205" fill="none" stroke="url(#cl-ring2)" strokeWidth="1.4" strokeDasharray="5 12" />
              {/* 공전 위성 — 별 모양 (작은 사이즈) */}
              <g transform="translate(300,95) scale(0.6)">
                <path d="M0,-14.3 L3.76,-4.8 L13.6,-0.3 L3.76,4.2 L0,14.3 L-4.06,4.2 L-14.24,-0.1 L-4.88,-4.3 Z" fill="url(#cl-sparkle2)">
                  <animate attributeName="opacity" values="0.75;1;0.75" dur="3s" repeatCount="indefinite" />
                  <animateTransform attributeName="transform" type="scale" values="0.8;1.1;0.8" dur="3s" repeatCount="indefinite" />
                </path>
              </g>
            </svg>
          </div>

          {/* ── 궤도 링 3 (내부) — 느린 회전 ── */}
          <div className="pointer-events-none absolute inset-0 animate-[spin_80s_linear_infinite]">
            <svg viewBox="0 0 600 600" className="h-full w-full">
              <ellipse cx="300" cy="300" rx="140" ry="140" fill="none" stroke="#CB6279" strokeOpacity="0.4" strokeWidth="1" />
            </svg>
          </div>

          {/* 스파클 */}
          <Sparkle cx="8%" cy="18%" size={10} delay={0} />
          <Sparkle cx="88%" cy="12%" size={8} delay={1.6} />
          <Sparkle cx="92%" cy="65%" size={9} delay={2.4} />
          <Sparkle cx="5%" cy="78%" size={7} delay={3.2} />

          {/* 유성 */}
          <svg viewBox="0 0 600 600" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <linearGradient id="cl-meteor" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDD4C6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#CB6279" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="80" y1="60" x2="130" y2="90" stroke="url(#cl-meteor)" strokeWidth="0.8" strokeLinecap="round">
              <animate attributeName="opacity" values="0;0.7;0" dur="7s" repeatCount="indefinite" begin="2s" />
              <animateTransform attributeName="transform" type="translate" values="0,0;40,25;0,0" dur="7s" repeatCount="indefinite" begin="2s" />
            </line>
          </svg>

          {/* 중심 행성 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.img
              src="/planet_circle.svg"
              alt=""
              className="h-[180px] w-[180px] md:h-[220px] md:w-[220px]"
              draggable={false}
              animate={{
                filter: [
                  "drop-shadow(0 0 28px rgba(243,29,91,0.15))",
                  "drop-shadow(0 0 44px rgba(243,29,91,0.26))",
                  "drop-shadow(0 0 28px rgba(243,29,91,0.15))",
                ],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* 궤도 위 타이틀 아이템들 */}
          {orbitItems.map((item) => (
            <OrbitLabel key={item.to} item={item} />
          ))}
        </div>

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center gap-4 md:mt-14"
        >
          <BrandButton to="/contact">프로젝트 상담 시작하기</BrandButton>
          <p className="max-w-md text-center text-sm leading-6 text-ink-muted">
            궤도 위의 항목을 선택하거나, 바로 상담을 시작하실 수 있습니다.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ── 궤도 위 라벨 ── */
function OrbitLabel({ item }: { item: OrbitItem }) {
  const [hovered, setHovered] = useState(false);
  const rad = (item.angle * Math.PI) / 180;
  const x = 50 + item.radius * 100 * Math.cos(rad);
  const y = 50 + item.radius * 100 * Math.sin(rad);

  const panelLeft = x > 50;

  return (
    <motion.div
      className="absolute z-20"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
    {/* 둥둥 떠다니는 래퍼 — CSS로 부드러운 부유 */}
    <div
      className="animate-[float_ease-in-out_infinite_alternate]"
      style={{
        animationDuration: `${3 + item.angle * 0.01}s`,
      }}
    >
      {/* 궤도 점 */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={hovered ? { scale: 1.6 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <div className="h-3 w-3 rounded-full bg-brand/30 transition-colors duration-300" />
        <div className="absolute inset-0 h-3 w-3 rounded-full bg-brand/10 animate-ping" />
      </motion.div>

      {/* 타이틀 */}
      <Link
        href={item.to}
        className="relative -translate-x-1/2 -translate-y-[calc(100%+12px)] block whitespace-nowrap"
      >
        <motion.span
          className="inline-block rounded-full border border-black/8 bg-white/76 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-ink backdrop-blur-xl transition-all duration-300 hover:border-brand/25 hover:text-brand"
          animate={hovered ? { y: -4, boxShadow: "0 12px 32px rgba(243,29,91,0.12)" } : { y: 0, boxShadow: "0 4px 16px rgba(20,16,20,0.06)" }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          {item.title}
        </motion.span>
      </Link>

      {/* 호버 설명 패널 */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className={[
              "absolute top-6 z-30 w-[200px] rounded-[1.2rem] border border-black/8 bg-white/80 p-4 backdrop-blur-xl shadow-[0_16px_48px_rgba(20,16,20,0.1)]",
              panelLeft ? "right-0 translate-x-[10%]" : "left-0 -translate-x-[10%]",
            ].join(" ")}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-sm leading-6 text-ink-muted">{item.description}</p>
            <Link
              href={item.to}
              className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brand transition-opacity hover:opacity-70"
            >
              살펴보기
              <span className="text-sm">→</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </motion.div>
  );
}

/* ── 스파클 ── */
function Sparkle({ cx, cy, size, delay }: { cx: string; cy: string; size: number; delay: number }) {
  const s = size;
  const h = s / 2;
  const d = `M${h},0 L${h * 1.15},${h * 0.85} L${s},${h} L${h * 1.15},${h * 1.15} L${h},${s} L${h * 0.85},${h * 1.15} L0,${h} L${h * 0.85},${h * 0.85} Z`;

  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: cx, top: cy }}
      animate={{ opacity: [0.06, 0.45, 0.06], scale: [0.6, 1.15, 0.6], rotate: [0, 12, 0] }}
      transition={{ duration: 5.5, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <defs>
          <radialGradient id={`cls-${delay}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFDFDF" />
            <stop offset="100%" stopColor="#FFDFDF" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        <path d={d} fill={`url(#cls-${delay})`} />
      </svg>
    </motion.div>
  );
}
