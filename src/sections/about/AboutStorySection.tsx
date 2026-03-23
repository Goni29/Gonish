import { motion } from "motion/react";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import { aboutMilestones, aboutPrinciples, aboutStats } from "@/data/siteContent";

const ease = [0.22, 1, 0.36, 1] as const;

export default function AboutStorySection() {
  return (
    <section className="section-space relative">
      <div className="shell relative z-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)] lg:items-start xl:gap-20">
          {/* ── Left column ── */}
          <div className="space-y-20">
            {/* ── Narrative ── */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, ease }}
              className="space-y-7"
            >
              <p className="font-display text-[clamp(2.2rem,4vw,4rem)] leading-[1] text-ink">
                <SmartLineBreak text="보여주는 소개를 넘어, 선택이 일어나는 흐름을 만듭니다." />
              </p>
              <div className="space-y-5 text-base leading-7 text-ink-muted md:text-lg">
                <p>
                  사이트는 브랜드를 처음 만나는 자리이자 신뢰가 형성되는 가장 빠른 순간입니다.
                  Gonish는 그 짧은 시간 안에 브랜드의 결이 또렷하게 읽히고, 다음 행동이 자연스럽게
                  떠오르도록 화면과 문장을 함께 설계합니다.
                </p>
                <p>
                  업종과 목적은 달라도 기준은 같습니다. 고객이 궁금해할 정보를 먼저 보이게 하고,
                  문의나 예약으로 이어질 동선을 매끄럽게 정리해 오래 남는 첫인상과 실제 전환이 함께
                  일어나도록 만듭니다.
                </p>
              </div>
            </motion.div>

            {/* ── Orbit Strip (stats) ── */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease }}
              className="relative"
            >
              {/* Orbit line */}
              <div className="absolute left-4 right-4 top-[14px] hidden h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent md:block" />

              <div className="grid gap-10 md:grid-cols-3">
                {aboutStats.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: index * 0.1, ease }}
                    className="relative"
                  >
                    {/* Glowing dot */}
                    <div className="relative mb-5 flex items-center">
                      <span className="relative z-10 size-[10px] rounded-full bg-brand shadow-[0_0_16px_rgba(243,29,91,0.5)]" />
                      <span className="absolute left-[5px] size-[22px] -translate-x-1/2 -translate-y-0 rounded-full bg-brand/10" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.32em] text-brand">{item.label}</p>
                    <p className="mt-3 break-keep text-sm leading-7 text-ink-muted">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── Principles (numbered editorial) ── */}
            <div className="space-y-0">
              {aboutPrinciples.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.28 }}
                  transition={{ duration: 0.7, delay: index * 0.08, ease }}
                >
                  {index > 0 && <div className="soft-divider my-8" />}
                  <div className="flex gap-6 md:gap-8">
                    <span className="font-display text-[clamp(3rem,5vw,4.5rem)] leading-none text-brand/15">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 pt-2">
                      <p className="font-display text-xl leading-tight text-ink md:text-2xl">
                        {item.title}
                      </p>
                      <p className="mt-3 break-keep text-sm leading-7 text-ink-muted md:text-base">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Orbital Timeline (milestones) ── */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease }}
            >
              <p className="eyebrow mb-8">Working rhythm</p>
              <div className="relative pl-8">
                {/* Vertical orbit line */}
                <div className="absolute bottom-2 left-[4px] top-2 w-px bg-gradient-to-b from-brand/30 via-brand/15 to-transparent" />

                <div className="space-y-8">
                  {aboutMilestones.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.6, delay: index * 0.1, ease }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <span className="absolute -left-8 top-[7px] size-[9px] rounded-full border-2 border-brand/40 bg-paper" />
                      <p className="break-keep text-base leading-7 text-ink-muted">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right column: Portrait aside ── */}
          <motion.aside
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease }}
            className="lg:sticky lg:top-28"
          >
            <div className="relative">
              {/* Planetary glow */}
              <div className="absolute -inset-8 rounded-full bg-brand/[0.06] blur-[60px]" />

              <div className="panel relative overflow-hidden rounded-[2.2rem] p-4 sm:p-5">
                <div className="overflow-hidden rounded-[1.8rem] border border-black/10 bg-[#f4eded]">
                  <img
                    src="/Gonish_about.png"
                    alt="Gonish portrait photo"
                    className="w-full object-cover"
                  />
                </div>
                <div className="space-y-4 px-2 pb-2 pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">Brand direction</p>
                      <p className="mt-3 font-display text-3xl leading-none text-ink">Gonish</p>
                    </div>
                    <p className="max-w-[12rem] text-right text-xs uppercase tracking-[0.28em] text-ink/45">
                      <SmartLineBreak
                        text="premium trust fast solution"
                        maxCharsPerLine={13}
                        maxLines={3}
                        minCharsPerLine={6}
                      />
                    </p>
                  </div>
                  <p className="break-keep text-sm leading-6 text-ink-muted">
                    Gonish는 프리미엄 완성도로 브랜드의 첫인상을 끌어올리고, 신뢰를 만드는 정보 구조로
                    고객의 결정을 돕습니다. 빠른 해결이 필요한 순간에도 핵심을 정확히 짚어, 짧은 시간 안에
                    실행 가능한 결과를 제안합니다.
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
