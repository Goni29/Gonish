import { motion } from "motion/react";
import BrandButton from "@/components/ui/BrandButton";

const cards = [
  {
    title: "About Me",
    description: "성장 과정과 작업 태도를 에디토리얼 레이아웃으로 담았습니다.",
    to: "/about",
  },
  {
    title: "Portfolio",
    description: "프로젝트를 고르고, 디바이스 뷰까지 깊게 살펴볼 수 있습니다.",
    to: "/portfolio",
  },
  {
    title: "Contact Me",
    description: "가볍게 문의를 남겨도 브랜드 방향부터 함께 정리할 수 있습니다.",
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
                Gonish의 브랜드 경험은
                <br />
                각 페이지에서도 같은 밀도로 이어집니다.
              </p>
              <BrandButton to="/contact" variant="ghost">
                프로젝트 문의하기
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
                    열어보기
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
