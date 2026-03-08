import { motion } from "motion/react";
import BrandButton from "@/components/ui/BrandButton";

const cards = [
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
  return (
    <section className="section-space">
      <div className="shell">
        <div className="panel rounded-[2.2rem] px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-end">
            <div className="space-y-6">
              <p className="eyebrow">Continue the story</p>
              <p className="font-display text-[clamp(2.3rem,4vw,4.6rem)] leading-[0.96] text-ink">
                원하는 페이지에서
                <br />
                브랜드의 다음 장면을 확인해보세요.
              </p>
              <BrandButton to="/contact" variant="ghost">
                프로젝트 상담 시작하기
              </BrandButton>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {cards.map((card, index) => (
                <motion.div
                  key={card.to}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-[1.6rem] border border-black/10 bg-white/76 p-5"
                >
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
