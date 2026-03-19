import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import { caseStudies, type CaseStudy, type DeviceKey, type DevicePreview } from "@/data/siteContent";

const ease = [0.22, 1, 0.36, 1] as const;

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
        {/* ── Project selector (minimal text list) ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease }}
          className="mb-14 flex flex-wrap gap-x-10 gap-y-4"
        >
          {caseStudies.map((project) => {
            const isActive = project.id === selectedProject.id;

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setDevice("pc");
                }}
                className="group relative flex items-center gap-3 py-2 text-left transition-all duration-300"
              >
                {/* Accent dot */}
                <span
                  className="size-[10px] rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? project.accent : "transparent",
                    border: isActive ? "none" : `1.5px solid rgba(20,16,20,0.2)`,
                    boxShadow: isActive ? `0 0 14px ${project.accent}60` : "none",
                  }}
                />
                <span
                  className={[
                    "font-display text-xl transition-all duration-300 md:text-2xl",
                    isActive ? "text-ink" : "text-ink/35 group-hover:text-ink/60",
                  ].join(" ")}
                >
                  {project.title}
                </span>
                <span
                  className={[
                    "text-[10px] uppercase tracking-[0.28em] transition-all duration-300",
                    isActive ? "text-ink/45" : "text-ink/20",
                  ].join(" ")}
                >
                  {project.year}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* ── Project detail ── */}
        <AnimatePresence mode="wait">
          <motion.article
            key={selectedProject.id}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -22 }}
            transition={{ duration: 0.6, ease }}
            className="relative"
          >
            {/* Background accent glow */}
            <div
              className="pointer-events-none absolute -top-20 right-0 h-[400px] w-[500px] rounded-full opacity-[0.07] blur-[100px]"
              style={{ background: `radial-gradient(circle, ${selectedProject.accent}, transparent 70%)` }}
            />

            <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start xl:gap-16">
              {/* ── Left: Main content ── */}
              <div className="space-y-10">
                {/* Header */}
                <div className="space-y-5">
                  <p className="eyebrow">{selectedProject.role}</p>
                  <p className="font-display text-[clamp(2.4rem,4vw,4.2rem)] leading-[0.98] text-ink">
                    {selectedProject.title}
                  </p>
                  <p className="max-w-3xl text-base leading-7 text-ink-muted md:text-lg">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Outcomes — dot-separated text list */}
                <div className="space-y-3">
                  <p className="eyebrow mb-4">Outcomes</p>
                  {selectedProject.outcomes.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-[9px] size-[6px] shrink-0 rounded-full bg-brand/50" />
                      <p className="text-sm leading-7 text-ink-muted md:text-base">{item}</p>
                    </div>
                  ))}
                </div>

                {/* Device switcher */}
                <div className="space-y-8">
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(deviceLabels) as DeviceKey[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDevice(item)}
                        className={[
                          "relative rounded-full px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] transition-all duration-300",
                          device === item
                            ? "text-brand"
                            : "text-ink/40 hover:text-ink/65",
                        ].join(" ")}
                      >
                        {device === item && (
                          <motion.span
                            layoutId="device-indicator"
                            className="absolute inset-0 rounded-full border border-brand/20 bg-brand/[0.06]"
                            transition={{ duration: 0.35, ease }}
                          />
                        )}
                        <span className="relative">{deviceLabels[item]}</span>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedProject.id}-${device}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.45, ease }}
                    >
                      <DeviceShowcase
                        accent={selectedProject.accent}
                        device={device}
                        preview={selectedProject.devices[device]}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Right: Floating annotation ── */}
              <div className="lg:sticky lg:top-28">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease }}
                  className="space-y-6"
                >
                  <p className="eyebrow">About this project</p>
                  <p className="text-xs uppercase tracking-[0.28em] text-ink/35">{selectedProject.category}</p>
                  <div className="soft-divider" />
                  <p className="break-keep text-sm leading-7 text-ink-muted">
                    {selectedProject.summary}
                  </p>
                  <p className="font-display text-xl leading-tight text-ink">
                    <SmartLineBreak text="고객이 어디서 보든 같은 품격을 느끼도록." />
                  </p>
                  <p className="break-keep text-sm leading-7 text-ink-muted">
                    같은 프로젝트라도 기기에 따라 고객의 읽는 방식이 달라집니다. Gonish는 PC, 태블릿,
                    모바일 모두에서 핵심 메시지와 행동 버튼이 균형 있게 보이도록 조정합니다.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
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
    <div className="space-y-6">
      {/* Device frame */}
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

      {/* Floating annotation below device */}
      <div className="flex items-start gap-6 px-2">
        <div className="flex-1">
          <p className="eyebrow">{deviceLabels[device]}</p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{preview.highlight}</p>
        </div>
        <div className="hidden w-px self-stretch bg-gradient-to-b from-ink/10 to-transparent sm:block" />
        <div className="hidden flex-1 sm:block">
          <p className="eyebrow">Refined note</p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{preview.note}</p>
        </div>
      </div>
    </div>
  );
}
