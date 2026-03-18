"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import BrandButton from "@/components/ui/BrandButton";
import SmartLineBreak from "@/components/ui/SmartLineBreak";

const orbitCards = [
  {
    title: "About Me",
    description: "브랜드를 선택으로 연결하는 설계 기준과 협업 철학을 확인해보세요.",
    to: "/about",
  },
  {
    title: "Portfolio",
    description: "업종별 목표에 맞춰 메시지와 전환 여정을 정교하게 설계한 사례를 살펴보세요.",
    to: "/portfolio",
  },
  {
    title: "Contact Me",
    description: "목표와 일정만 공유해 주시면 필요한 범위와 다음 단계를 정제된 제안으로 안내드립니다.",
    to: "/contact",
  },
];

export default function ClosingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const outerRotate = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const innerRotate = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section ref={sectionRef} className="section-space relative overflow-hidden">
      <div className="shell relative z-10">
        <div className="panel relative rounded-[2.2rem] px-6 py-10 md:px-10 md:py-14 overflow-hidden">
          {/* 궤도 장식 — 패널 내부 */}
          <motion.div
            className="pointer-events-none absolute -right-20 -top-20 md:-right-10 md:-top-10"
            style={{ rotate: outerRotate }}
          >
            <div className="h-[320px] w-[320px] rounded-full border border-brand/10 md:h-[420px] md:w-[420px]" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute -right-10 -top-10 md:right-4 md:top-4"
            style={{ rotate: innerRotate }}
          >
            <div className="h-[200px] w-[200px] rounded-full border border-brand/6 md:h-[280px] md:w-[280px]" />
          </motion.div>

          {/* 행성 글로우 */}
          <div className="pointer-events-none absolute right-10 top-10 h-4 w-4 rounded-full bg-brand/25 blur-[2px]" />
          <div className="pointer-events-none absolute right-24 top-20 h-2 w-2 rounded-full bg-brand/15" />
          <div className="pointer-events-none absolute right-40 top-6 h-1.5 w-1.5 rounded-full bg-brand/10" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-end">
            {/* 좌측: 타이포 + CTA */}
            <div className="space-y-6">
              <p className="eyebrow">Next orbit</p>
              <p className="font-display text-[clamp(2.3rem,4vw,4.6rem)] leading-[0.96] text-ink">
                <SmartLineBreak text="다음 궤도에서 브랜드의 가능성을 확인해보세요." />
              </p>
              <BrandButton to="/contact" variant="ghost">
                프로젝트 상담 시작하기
              </BrandButton>
            </div>

            {/* 우측: 카드 */}
            <div className="grid gap-4 md:grid-cols-3">
              {orbitCards.map((card, index) => (
                <motion.div
                  key={card.to}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative rounded-[1.6rem] border border-black/10 bg-white/76 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/15"
                >
                  {/* 미니 궤도 점 */}
                  <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand/15 transition-colors duration-300 group-hover:bg-brand/30" />

                  <p className="text-sm uppercase tracking-[0.28em] text-brand">{card.title}</p>
                  <p className="mt-4 text-sm leading-6 text-ink-muted">{card.description}</p>
                  <BrandButton to={card.to} variant="ghost" className="mt-6 w-full justify-center">
                    살펴보기
                  </BrandButton>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
