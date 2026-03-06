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
                실무 경험보다 먼저,
                <br />
                태도와 감도를 키웠습니다.
              </p>
              <div className="space-y-5 text-base leading-7 text-ink-muted md:text-lg">
                <p>
                  아직 시작 단계에 있는 개발자이지만, 그렇기 때문에 더 빠르게 배우고 더 진지하게
                  다듬습니다. 6개월 부트캠프를 거치며 기본기를 단단히 쌓았고, 지금은 결과물의 밀도를
                  끌어올리는 과정에 깊이 집중하고 있습니다.
                </p>
                <p>
                  Gonish의 강점은 완성형 이력보다 성장의 방향이 분명하다는 데 있습니다. 사람마다 다른
                  취향과 목적을 읽고, 그에 맞는 구조와 인상을 하나씩 맞춰가는 1:1 작업 방식에 더
                  가깝습니다.
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
                  사진 자리에 놓인 이 에디토리얼 아트워크는 Gonish의 현재 톤을 담은 시각적
                  초상입니다. 이후 실제 사진으로 교체해도 레이아웃과 무드는 그대로 유지됩니다.
                </p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
