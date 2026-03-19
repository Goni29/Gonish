import Link from "next/link";
import BrandButton from "@/components/ui/BrandButton";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import { navigation } from "@/data/siteContent";

export default function SiteFooter() {
  return (
    <footer className="section-space-tight pt-2">
      <div className="shell">
        <div className="relative">
          <div className="pointer-events-none absolute -left-20 -top-14 h-56 w-56 sm:-left-16 sm:-top-12 sm:h-64 sm:w-64">
            <div className="absolute inset-0 rounded-full border border-brand/12" />
            <div className="absolute inset-7 rounded-full border border-brand/10 sm:inset-8" />
          </div>
          <div className="pointer-events-none absolute -bottom-16 -right-20 h-56 w-56 sm:-bottom-12 sm:-right-16 sm:h-64 sm:w-64">
            <div className="absolute inset-0 rounded-full border border-brand/12" />
            <div className="absolute inset-7 rounded-full border border-brand/10 sm:inset-8" />
          </div>
          <div className="pointer-events-none absolute left-[12%] top-[14%] h-1.5 w-1.5 rounded-full bg-brand/28" />
          <div className="pointer-events-none absolute right-[16%] bottom-[12%] h-1 w-1 rounded-full bg-brand/24" />

          <div className="relative overflow-hidden rounded-[2.4rem] border border-black/8 bg-white/[0.66] px-5 py-6 shadow-[0_22px_72px_rgba(20,16,20,0.08)] backdrop-blur-xl sm:px-6 sm:py-7 lg:px-8 lg:py-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(243,29,91,0.06),transparent_22%),radial-gradient(circle_at_82%_76%,rgba(255,194,216,0.26),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.08))]" />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-brand/34" />
                    <p className="eyebrow">Gonish</p>
                  </div>

                  <p className="font-display text-[clamp(1.9rem,3.4vw,3.1rem)] leading-[0.95] text-ink">
                    <SmartLineBreak
                      text="브랜드의 품격을 또렷하게 전하고, 선택까지 우아하게 잇습니다."
                      maxCharsPerLine={18}
                      maxLines={2}
                    />
                  </p>
                </div>

                <div className="flex flex-col items-start gap-4 lg:items-end">
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem] text-ink-muted lg:justify-end">
                    {navigation.map((link) => (
                      <Link
                        key={link.label}
                        href={link.to}
                        className="transition-colors duration-300 hover:text-brand"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <BrandButton to="/contact" variant="ghost" className="px-5 py-2.5">
                    프로젝트 문의
                  </BrandButton>
                </div>
              </div>

              <div className="soft-divider" />

              <div className="flex flex-col gap-2 text-sm text-ink-muted lg:flex-row lg:items-center lg:justify-between">
                <p className="text-[0.92rem]">밝은 첫인상과 자연스러운 전환을 설계하는 프리미엄 웹 스튜디오.</p>
                <p className="text-xs text-ink-soft">
                  © {new Date().getFullYear()} Gonish. Premium web studio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
