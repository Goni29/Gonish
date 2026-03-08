import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { caseStudies, type CaseStudy, type DeviceKey, type DevicePreview } from "@/data/siteContent";

const deviceLabels: Record<DeviceKey, string> = {
  pc: "PC version",
  tablet: "Tablet version",
  mobile: "Mobile version",
};

export default function PortfolioShowcase() {
  const [selectedProjectId, setSelectedProjectId] = useState(caseStudies[0].id);
  const [device, setDevice] = useState<DeviceKey>("pc");

  const selectedProject = useMemo(
    () => caseStudies.find((project) => project.id === selectedProjectId) ?? caseStudies[0],
    [selectedProjectId],
  );

  return (
    <section className="section-space">
      <div className="shell">
        <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-4">
            {caseStudies.map((project, index) => {
              const isActive = project.id === selectedProject.id;

              return (
                <motion.button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setDevice("pc");
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={[
                    "w-full rounded-[1.8rem] border p-5 text-left backdrop-blur-xl transition-all duration-300",
                    isActive
                      ? "border-brand/25 bg-white shadow-[0_28px_68px_rgba(243,29,91,0.12)]"
                      : "border-black/10 bg-white/72 hover:-translate-y-0.5 hover:border-black/15",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.28em] text-brand">{project.category}</p>
                      <p className="font-display text-2xl leading-none text-ink">{project.title}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.24em] text-ink/45">{project.year}</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-ink-muted">{project.summary}</p>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.article
              key={selectedProject.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -22 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="panel rounded-[2.2rem] px-6 py-6 sm:px-8 sm:py-8"
            >
              <div className="grid gap-10 xl:grid-cols-[minmax(0,0.96fr)_minmax(280px,0.64fr)]">
                <div className="space-y-7">
                  <div className="space-y-4">
                    <p className="eyebrow">{selectedProject.role}</p>
                    <p className="font-display text-[clamp(2.4rem,4vw,4.2rem)] leading-[0.98] text-ink">
                      {selectedProject.title}
                    </p>
                    <p className="max-w-3xl text-base leading-7 text-ink-muted md:text-lg">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {selectedProject.outcomes.map((item) => (
                      <div key={item} className="rounded-[1.5rem] border border-black/10 bg-white/78 p-4">
                        <p className="text-sm leading-6 text-ink-muted">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.8rem] border border-black/10 bg-[#171118] p-6 text-white">
                  <p className="eyebrow text-white/55">Curation note</p>
                  <p className="font-display text-3xl leading-tight">
                    고객이 어디서 보든
                    <br />
                    같은 품격을 느끼도록.
                  </p>
                  <p className="text-sm leading-6 text-white/72">
                    같은 프로젝트라도 기기에 따라 고객의 읽는 방식이 달라집니다. Gonish는 PC, 태블릿,
                    모바일 모두에서 핵심 메시지와 행동 버튼이 균형 있게 보이도록 조정합니다.
                  </p>
                </div>
              </div>

              <div className="mt-10 space-y-6">
                <div className="inline-flex flex-wrap gap-2 rounded-full border border-black/10 bg-white/78 p-2 backdrop-blur-xl">
                  {(Object.keys(deviceLabels) as DeviceKey[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDevice(item)}
                      className={[
                        "rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.28em] transition-all duration-300",
                        device === item
                          ? "bg-brand text-white shadow-[0_16px_32px_rgba(243,29,91,0.24)]"
                          : "text-ink/60 hover:text-ink",
                      ].join(" ")}
                    >
                      {deviceLabels[item]}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedProject.id}-${device}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-6"
                  >
                    <DeviceShowcase
                      accent={selectedProject.accent}
                      device={device}
                      preview={selectedProject.devices[device]}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function DeviceShowcase({
  accent,
  device,
  preview,
}: {
  accent: CaseStudy["accent"];
  device: DeviceKey;
  preview: DevicePreview;
}) {
  const frameClasses =
    device === "pc"
      ? "w-full rounded-[2.2rem] p-4"
      : device === "tablet"
        ? "mx-auto w-full max-w-[760px] rounded-[2.4rem] p-4"
        : "mx-auto w-full max-w-[360px] rounded-[2.2rem] p-3";

  const screenPadding = device === "mobile" ? "p-4" : "p-6";
  const blockGrid = device === "mobile" ? "grid gap-3" : "grid gap-3 md:grid-cols-2";

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
      <div
        className={[
          frameClasses,
          "border border-black/10 bg-[#181217] shadow-[0_32px_120px_rgba(20,16,20,0.18)]",
        ].join(" ")}
      >
        <div className={`rounded-[1.8rem] bg-[#fffaf9] ${screenPadding}`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#ff817d]" />
            <span className="size-2 rounded-full bg-[#ffd76b]" />
            <span className="size-2 rounded-full bg-[#58d17d]" />
          </div>

          <div
            className="rounded-[1.6rem] px-5 py-5 text-white"
            style={{
              background: `linear-gradient(145deg, ${accent} 0%, rgba(20,16,20,0.98) 120%)`,
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/58">{preview.eyebrow}</p>
            <p className="mt-4 font-display text-[clamp(1.8rem,4vw,3rem)] leading-[0.96]">
              {preview.title}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/76">{preview.description}</p>
          </div>

          <div className={`mt-4 ${blockGrid}`}>
            {preview.blocks.map((block) => (
              <div key={block.label} className="rounded-[1.3rem] border border-black/10 bg-white p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-ink/42">{block.label}</p>
                <p className="mt-3 font-display text-xl leading-none text-ink">{block.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[1.8rem] border border-black/10 bg-white/76 p-5 backdrop-blur-xl">
          <p className="eyebrow">View note</p>
          <p className="mt-4 font-display text-3xl leading-tight text-ink">{deviceLabels[device]}</p>
          <p className="mt-4 text-sm leading-6 text-ink-muted">{preview.highlight}</p>
        </div>

        <div className="rounded-[1.8rem] border border-black/10 bg-white/76 p-5 backdrop-blur-xl">
          <p className="eyebrow">Refined note</p>
          <p className="mt-4 text-sm leading-6 text-ink-muted">{preview.note}</p>
        </div>
      </div>
    </div>
  );
}
