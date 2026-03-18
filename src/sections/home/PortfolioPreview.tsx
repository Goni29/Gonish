"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import BrandButton from "@/components/ui/BrandButton";

const portfolios = [
  {
    id: "law-firm",
    title: "법무법인",
    subtitle: "신뢰를 시각화하다",
    eyebrow: "Brand Website",
    tech: ["Flask", "Jinja2", "Bootstrap"],
  },
  {
    id: "hospital",
    title: "병원",
    subtitle: "안심을 설계하다",
    eyebrow: "Brand Website",
    tech: ["Flask", "Bootstrap", "Swiper.js"],
  },
  {
    id: "beauty-commerce",
    title: "하이엔드 뷰티 커머스",
    subtitle: "감각을 전시하다",
    eyebrow: "E-Commerce",
    tech: ["Next.js", "Tailwind CSS", "TypeScript"],
  },
];

export default function PortfolioPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const orbitRotate = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section ref={sectionRef} className="section-space relative overflow-hidden">
      {/* 배경 장식: 핑크 궤도 링 */}
      <motion.div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ rotate: orbitRotate }}
      >
        <div className="h-[600px] w-[600px] rounded-full border border-brand/8 md:h-[800px] md:w-[800px]" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ rotate: useTransform(orbitRotate, (v) => -v * 0.6) }}
      >
        <div className="h-[420px] w-[420px] rounded-full border border-brand/5 md:h-[560px] md:w-[560px]" />
      </motion.div>

      {/* 핑크 글로우 배경 */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-brand/[0.04] blur-[100px]" />

      <div className="shell relative z-10">
        <div className="mb-16 space-y-6">
          <p className="eyebrow">Selected works</p>
          <motion.h2
            className="font-display text-[clamp(2.3rem,4vw,4.6rem)] leading-[0.96] text-ink"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            완성한 프로젝트를 확인해보세요.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {portfolios.map((item, index) => (
            <PortfolioCard key={item.id} item={item} index={index} />
          ))}
        </div>

        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrandButton to="/portfolio" variant="ghost">
            전체 포트폴리오 보기
          </BrandButton>
        </motion.div>
      </div>
    </section>
  );
}

function PortfolioCard({
  item,
  index,
}: {
  item: (typeof portfolios)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="group relative rounded-[1.6rem] border border-black/10 bg-white/72 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-[0_20px_60px_rgba(243,29,91,0.08)]">
        {/* 궤도 장식 */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full border border-brand/8 transition-all duration-500 group-hover:scale-110 group-hover:border-brand/15" />
        <div className="pointer-events-none absolute -right-3 -top-3 h-3 w-3 rounded-full bg-brand/20 transition-all duration-500 group-hover:bg-brand/40" />

        {/* 넘버링 */}
        <p className="text-sm uppercase tracking-[0.28em] text-brand">
          0{index + 1}
        </p>

        {/* eyebrow */}
        <p className="eyebrow mt-4">{item.eyebrow}</p>

        {/* 타이틀 */}
        <h3 className="mt-3 font-display text-2xl tracking-tight text-ink">
          {item.title}
        </h3>

        {/* 서브타이틀 */}
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          {item.subtitle}
        </p>

        {/* 기술 스택 */}
        <div className="mt-5 flex flex-wrap gap-2">
          {item.tech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-black/8 bg-white/60 px-3 py-1 text-[10px] tracking-wider text-ink-muted"
            >
              {t}
            </span>
          ))}
        </div>

        {/* 하단 링크 */}
        <div className="mt-6">
          <BrandButton to={`/portfolio`} variant="ghost" className="w-full justify-center">
            자세히 보기
          </BrandButton>
        </div>
      </div>
    </motion.div>
  );
}
