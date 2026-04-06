import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { lockPageScrollForDrag, unlockPageScrollForDrag } from "@/components/layout/SmoothScroll";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import { aboutMilestones, aboutPrinciples, aboutStats } from "@/data/siteContent";

const ease = [0.22, 1, 0.36, 1] as const;
const compactPanelId = "about-floating-profile-panel";
const aboutArtworkSrc = "/Gonish_about.png";
const COMPACT_PANEL_ANIMATION_MS = 260;
const COMPACT_PANEL_TOUCH_GUARD_MS = 420;

type CompactPanelPhase = "closed" | "closing" | "open" | "opening";

export default function AboutStorySection() {
  const [compactPanelPhase, setCompactPanelPhase] = useState<CompactPanelPhase>("closed");
  const compactPanelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compactPanelScrollLockedRef = useRef(false);
  const compactPanelTouchGuardUntilRef = useRef(0);

  const clearCompactPanelTimer = useCallback(() => {
    if (!compactPanelTimerRef.current) return;
    clearTimeout(compactPanelTimerRef.current);
    compactPanelTimerRef.current = null;
  }, []);

  const releaseCompactPanelScrollLock = useCallback(() => {
    if (!compactPanelScrollLockedRef.current) return;
    compactPanelScrollLockedRef.current = false;
    unlockPageScrollForDrag();
  }, []);

  const openCompactPanel = useCallback(() => {
    clearCompactPanelTimer();

    if (!compactPanelScrollLockedRef.current) {
      compactPanelScrollLockedRef.current = true;
      lockPageScrollForDrag();
    }

    setCompactPanelPhase("opening");
    compactPanelTimerRef.current = setTimeout(() => {
      setCompactPanelPhase("open");
      compactPanelTimerRef.current = null;
    }, COMPACT_PANEL_ANIMATION_MS);
  }, [clearCompactPanelTimer]);

  const closeCompactPanel = useCallback(() => {
    clearCompactPanelTimer();
    setCompactPanelPhase("closing");
    compactPanelTimerRef.current = setTimeout(() => {
      setCompactPanelPhase("closed");
      compactPanelTimerRef.current = null;
      releaseCompactPanelScrollLock();
    }, COMPACT_PANEL_ANIMATION_MS);
  }, [clearCompactPanelTimer, releaseCompactPanelScrollLock]);

  const toggleCompactPanel = useCallback(() => {
    if (compactPanelPhase === "open" || compactPanelPhase === "opening") {
      closeCompactPanel();
      return;
    }

    openCompactPanel();
  }, [closeCompactPanel, compactPanelPhase, openCompactPanel]);

  const handleCompactPanelToggleTouchEnd = useCallback(() => {
    compactPanelTouchGuardUntilRef.current = Date.now() + COMPACT_PANEL_TOUCH_GUARD_MS;
    toggleCompactPanel();
  }, [toggleCompactPanel]);

  const handleCompactPanelToggleClick = useCallback(() => {
    if (Date.now() < compactPanelTouchGuardUntilRef.current) return;
    toggleCompactPanel();
  }, [toggleCompactPanel]);

  const compactPanelVisible = compactPanelPhase !== "closed";
  const compactPanelExpanded = compactPanelPhase === "open" || compactPanelPhase === "opening";

  useEffect(() => {
    return () => {
      clearCompactPanelTimer();
      releaseCompactPanelScrollLock();
    };
  }, [clearCompactPanelTimer, releaseCompactPanelScrollLock]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        clearCompactPanelTimer();
        setCompactPanelPhase("closed");
        releaseCompactPanelScrollLock();
      }
    };

    mediaQuery.addEventListener("change", handleBreakpointChange);
    return () => mediaQuery.removeEventListener("change", handleBreakpointChange);
  }, [clearCompactPanelTimer, releaseCompactPanelScrollLock]);

  useEffect(() => {
    if (compactPanelPhase === "closed") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeCompactPanel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeCompactPanel, compactPanelPhase]);

  return (
    <section className="section-space relative">
      <div className="shell relative z-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)] lg:items-start xl:gap-20">
          <div className="space-y-20">
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

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease }}
              className="relative"
            >
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

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease }}
            >
              <p className="eyebrow mb-8">Working rhythm</p>
              <div className="relative pl-8">
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
                      <span className="absolute -left-8 top-[7px] size-[9px] rounded-full border-2 border-brand/40 bg-paper" />
                      <p className="break-keep text-base leading-7 text-ink-muted">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease }}
            className="hidden lg:block lg:h-[100svh] lg:w-full lg:max-w-[34rem] lg:self-start lg:justify-self-end lg:py-3 lg:sticky lg:top-0 xl:max-w-[36rem]"
          >
            <div className="relative lg:h-full">
              <div className="absolute -inset-6 rounded-full bg-brand/[0.06] blur-[60px] lg:-inset-10" />
              <AboutProfileCard />
            </div>
          </motion.aside>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 z-[70] lg:hidden md:bottom-6 md:left-6">
        <motion.button
          type="button"
          aria-controls={compactPanelId}
          aria-expanded={compactPanelExpanded}
          aria-haspopup="dialog"
          data-testid="about-floating-panel-toggle"
          onClick={handleCompactPanelToggleClick}
          onTouchEnd={handleCompactPanelToggleTouchEnd}
          whileTap={{ scale: 0.96 }}
          className="group relative block text-left"
        >
          <div className="absolute inset-[0.2rem] rounded-full bg-brand/[0.2] blur-xl" />
          <div className="relative size-[5.35rem] overflow-hidden rounded-full border border-white/60 shadow-[0_20px_52px_rgba(20,16,20,0.18)] sm:size-[5.85rem]">
            <Image
              src={aboutArtworkSrc}
              alt="Gonish portrait shortcut"
              fill
              className="object-cover object-center scale-[1.16] transition-transform duration-300 group-hover:scale-[1.2]"
              sizes="(min-width: 640px) 5.85rem, 5.35rem"
            />
          </div>
        </motion.button>
      </div>

      {compactPanelVisible ? (
        <div
          className={[
            "estimate-compact-summary-overlay fixed inset-0 z-[60] lg:hidden",
            `estimate-compact-summary-overlay--${compactPanelPhase}`,
          ].join(" ")}
        >
          <button
            type="button"
            aria-label="Close about profile panel"
            onClick={closeCompactPanel}
            className="absolute inset-0 h-full w-full cursor-default"
          />

          <div
            id={compactPanelId}
            className={[
              "estimate-compact-summary-shell absolute bottom-[6.75rem] left-4 right-4 md:bottom-[8rem] md:left-6 md:right-auto md:w-[min(26rem,calc(100vw-3rem))]",
              `estimate-compact-summary-shell--${compactPanelPhase}`,
            ].join(" ")}
            style={{ transformOrigin: "bottom left" }}
          >
            <div role="dialog" aria-modal="true" aria-labelledby="about-floating-panel-title">
              <AboutProfileCard compact />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

type AboutProfileCardProps = {
  compact?: boolean;
};

function AboutProfileCard({ compact = false }: AboutProfileCardProps) {
  return (
    <div
      data-lenis-prevent={compact ? true : undefined}
      data-lenis-prevent-touch={compact ? true : undefined}
      data-lenis-prevent-wheel={compact ? true : undefined}
      className={[
        "panel relative overflow-hidden rounded-[2rem]",
        compact
          ? "estimate-compact-summary-surface max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain p-0"
          : "p-3 sm:p-4 lg:flex lg:h-full lg:max-h-full lg:flex-col",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(243,29,91,0.14),transparent_72%)]" />

      <div
        className={[
          "relative overflow-hidden bg-[#f4eded]",
          compact
            ? "h-[13.5rem] border-b border-black/8 sm:h-[15rem]"
            : "rounded-[1.7rem] border border-black/10 sm:aspect-[4/5] lg:min-h-0 lg:flex-1 lg:aspect-auto",
        ].join(" ")}
      >
        {compact ? (
          <Image
            src={aboutArtworkSrc}
            alt="Gonish brand artwork"
            fill
            className="h-full w-full object-cover object-center"
            sizes="(min-width: 768px) 26rem, calc(100vw - 2rem)"
          />
        ) : (
          <Image
            src={aboutArtworkSrc}
            alt="Gonish portrait photo"
            width={1200}
            height={1500}
            className="h-auto w-full object-cover lg:h-full"
            sizes="(min-width: 1280px) 36rem, (min-width: 1024px) 34rem, (min-width: 640px) 70vw, 92vw"
          />
        )}
      </div>
      <div className={compact ? "space-y-4 px-5 pb-5 pt-5" : "space-y-4 px-2 pb-2 pt-5 sm:pt-6 lg:shrink-0 lg:space-y-3 lg:pt-4"}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Brand direction</p>
            <p id={compact ? "about-floating-panel-title" : undefined} className="mt-3 font-display text-3xl leading-none text-ink">
              Gonish
            </p>
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
  );
}
