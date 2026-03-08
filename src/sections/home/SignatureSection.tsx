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
              단정한 미감을 넘어,
              <br />
              선택받는 브랜드 경험을 완성합니다.
            </p>
            <p className="max-w-xl text-base leading-7 text-ink-muted md:text-lg">
              첫 화면에서 브랜드의 결을 또렷하게 전달하고, 필요한 정보와 문의 동선이 매끄럽게
              이어지도록 구성합니다. Gonish는 감도와 성과가 함께 남는 결과를 지향합니다.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
