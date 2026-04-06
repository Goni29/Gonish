import Link from "next/link";
import FooterMeteorField from "@/components/layout/FooterMeteorField";
import BrandButton from "@/components/ui/BrandButton";
import { navigation } from "@/data/siteContent";

const sparkleDots = [
  { left: "6%", top: "18%", size: "0.28rem", delay: "-1.4s" },
  { left: "11%", top: "52%", size: "0.22rem", delay: "-2.7s" },
  { left: "18%", top: "10%", size: "0.2rem", delay: "-4.1s" },
  { left: "24%", top: "44%", size: "0.26rem", delay: "-0.8s" },
  { left: "31%", top: "72%", size: "0.22rem", delay: "-3.9s" },
  { left: "37%", top: "16%", size: "0.18rem", delay: "-1.1s" },
  { left: "45%", top: "82%", size: "0.26rem", delay: "-4.9s" },
  { left: "52%", top: "30%", size: "0.24rem", delay: "-2.1s" },
  { left: "60%", top: "54%", size: "0.18rem", delay: "-5.6s" },
  { left: "67%", top: "8%", size: "0.22rem", delay: "-0.3s" },
  { left: "74%", top: "74%", size: "0.28rem", delay: "-2.8s" },
  { left: "82%", top: "22%", size: "0.2rem", delay: "-3.4s" },
  { left: "88%", top: "50%", size: "0.24rem", delay: "-1.9s" },
  { left: "94%", top: "14%", size: "0.2rem", delay: "-4.4s" },
] as const;

export default function SiteFooter() {
  return (
    <footer className="mt-auto pt-1">
      <div className="footer-sky relative isolate min-h-[clamp(22rem,50vh,30rem)] overflow-hidden border-t border-black/8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-6 h-56 w-56 rounded-full bg-white/85 blur-3xl" />
          <div className="absolute right-[-3.5rem] top-[-2.5rem] h-72 w-72 rounded-full bg-[#ffdbe7]/65 blur-3xl" />
          <div className="absolute bottom-[-5rem] left-1/4 h-48 w-64 -translate-x-1/2 rounded-full bg-[#ffeaf1]/90 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/70 to-transparent" />

          {sparkleDots.map((sparkle, index) => (
            <span
              key={`${sparkle.left}-${sparkle.top}-${index}`}
              className="footer-sky__sparkle"
              style={{
                left: sparkle.left,
                top: sparkle.top,
                width: sparkle.size,
                height: sparkle.size,
                animationDelay: sparkle.delay,
              }}
            />
          ))}

          <FooterMeteorField />
        </div>

        <div className="shell relative z-10">
          <div className="flex min-h-[clamp(22rem,50vh,30rem)] flex-col justify-center gap-6 py-7 sm:gap-7 sm:py-8 lg:gap-8 lg:py-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-brand/34" />
                  <p className="eyebrow footer-sky__copy-shadow">Gonish</p>
                </div>

                <p
                  className="footer-title-font footer-sky__copy-shadow text-[clamp(2rem,3.7vw,3.45rem)] leading-[1.15] text-ink"
                  style={{ fontFamily: '"Ridibatang", "Noto Sans KR", "Aptos", "Segoe UI", sans-serif' }}
                >
                  당신의 브랜드가
                  <br />
                  당신의 생각보다 더 빛나도록
                </p>
              </div>

              <div className="flex max-w-xl flex-col items-start gap-5 lg:items-end lg:self-center">
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem] font-medium text-ink-muted lg:justify-end">
                  {navigation.map((link) => (
                    <Link
                      key={link.label}
                      href={link.to}
                      className="footer-sky__copy-shadow inline-flex min-h-11 min-w-11 items-center justify-center px-2 py-2 transition-colors duration-300 hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <BrandButton
                  to="/contact"
                  variant="ghost"
                  className="min-h-12 min-w-11 border-black/12 bg-white/86 px-6 py-3 shadow-[0_16px_40px_rgba(243,29,91,0.1)]"
                >
                  프로젝트 이야기하기
                </BrandButton>
              </div>
            </div>

            <div className="soft-divider" />

            <div className="flex flex-col gap-2 text-sm text-ink-muted lg:flex-row lg:items-center lg:justify-between">
              <p className="footer-title-font footer-sky__copy-shadow text-[0.92rem]">브랜드의 가치를 더 빛나게 설계해드립니다.</p>
              <p className="footer-sky__copy-shadow text-xs text-ink-soft">© {new Date().getFullYear()} Gonish. Brand-focused web studio.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
