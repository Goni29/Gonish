import { motion } from "motion/react";
import portraitArtwork from "@/assets/portrait-editorial.svg";
import { aboutMilestones, aboutPrinciples, aboutStats } from "@/data/siteContent";

export default function AboutStorySection() {
  return (
    <section className="section-space">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-start xl:gap-20">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-7"
            >
              <p className="font-display text-[clamp(2.2rem,4vw,4rem)] leading-[1] text-ink">
                브랜드를 소개하는 데서 멈추지 않고,
                <br />
                선택받는 흐름까지 완성합니다.
              </p>
              <div className="space-y-5 text-base leading-7 text-ink-muted md:text-lg">
                <p>
                  고객은 사이트에 들어오는 순간 짧은 시간 안에 브랜드의 가치와 신뢰도를 판단합니다.
                  Gonish는 그 첫 판단이 긍정적인 선택으로 이어지도록 핵심 메시지와 신뢰 장치를
                  우선적으로 설계합니다.
                </p>
                <p>
                  프로젝트의 업종과 목적은 달라도 기준은 같습니다. 이해하기 쉬운 정보 구조, 행동하기
                  편한 문의 동선, 인상이 오래 남는 톤앤매너를 하나의 서사로 정돈해 브랜드 경험의
                  완성도를 높입니다.
                </p>
              </div>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              {aboutStats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="panel rounded-[1.8rem] p-5"
                >
                  <p className="text-xs uppercase tracking-[0.32em] text-brand">{item.label}</p>
                  <p className="mt-4 text-sm leading-6 text-ink-muted">{item.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              {aboutPrinciples.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.28 }}
                  transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-[1.8rem] border border-black/10 bg-white/72 p-6 backdrop-blur-xl"
                >
                  <p className="font-display text-2xl text-ink">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-ink-muted md:text-base">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="rounded-[2rem] border border-black/10 bg-[#161116] px-6 py-8 text-white md:px-8">
              <p className="eyebrow text-white/55">Looking ahead</p>
              <div className="mt-6 space-y-4">
                {aboutMilestones.map((item) => (
                  <p key={item} className="text-base leading-7 text-white/74">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28"
          >
            <div className="panel overflow-hidden rounded-[2.2rem] p-4 sm:p-5">
              <div className="overflow-hidden rounded-[1.8rem] border border-black/10 bg-[#f4eded]">
                <img src={portraitArtwork} alt="Gonish portrait artwork" className="w-full object-cover" />
              </div>
              <div className="space-y-4 px-2 pb-2 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Editorial portrait</p>
                    <p className="mt-3 font-display text-3xl leading-none text-ink">Gonish</p>
                  </div>
                  <p className="max-w-[12rem] text-right text-xs uppercase tracking-[0.28em] text-ink/45">
                    sincere growth
                    <br />
                    tailored work
                    <br />
                    polished detail
                  </p>
                </div>
                <p className="text-sm leading-6 text-ink-muted">
                  현재는 브랜드 무드를 전달하기 위한 에디토리얼 아트워크를 사용하고 있습니다. 추후 실제
                  사진으로 교체하더라도 전체 인상과 톤이 흔들리지 않도록 구조를 정교하게 맞춰두었습니다.
                </p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
