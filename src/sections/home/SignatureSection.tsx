import { motion } from "motion/react";

export default function SignatureSection() {
  return (
    <section className="section-space-tight">
      <div className="shell">
        <div className="soft-divider" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-10 py-12"
        >
          <div className="font-script text-[clamp(5rem,17vw,12rem)] leading-none text-brand/95 [text-shadow:0_18px_48px_rgba(243,29,91,0.12)]">
            Gonish
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <p className="font-display text-[clamp(2rem,4vw,3.9rem)] leading-[0.98] text-ink">
              보기 좋은 화면을 넘어서,
              <br />
              사람의 결이 느껴지는 브랜드 경험을 지향합니다.
            </p>
            <p className="max-w-xl text-base leading-7 text-ink-muted md:text-lg">
              단정한 구성 안에 분명한 감정을 남기고 싶습니다. 그래서 Gonish의 작업은 화려함보다
              오래 남는 인상, 빠른 결과보다 더 섬세한 완성도를 목표로 합니다.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
