import Link from "next/link";

const navLinks = [
  { label: "Main", href: "/" },
  { label: "About", href: "/about" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact", href: "/contact" },
];

export default function SiteFooter() {
  return (
    <footer className="section-space-tight">
      <div className="shell">
        <div className="panel relative overflow-hidden rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
          {/* 궤도 장식 */}
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-[240px] w-[240px] rounded-full border border-brand/8 md:h-[320px] md:w-[320px]" />
          <div className="pointer-events-none absolute -right-8 -bottom-8 h-[140px] w-[140px] rounded-full border border-brand/5 md:h-[200px] md:w-[200px]" />
          <div className="pointer-events-none absolute right-12 bottom-12 h-2.5 w-2.5 rounded-full bg-brand/20" />
          <div className="pointer-events-none absolute right-28 bottom-6 h-1.5 w-1.5 rounded-full bg-brand/12" />

          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            {/* 좌측: 브랜드 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-brand/30" />
                <p className="eyebrow">Gonish</p>
              </div>
              <p className="max-w-xl font-display text-2xl leading-tight text-ink md:text-3xl">
                브랜드의 품격을 또렷하게 전달하고,
                <br />
                고객의 선택까지 우아하게 연결합니다.
              </p>
            </div>

            {/* 우측: 네비 + 카피라이트 */}
            <div className="flex flex-col gap-4 text-sm text-ink-muted">
              <div className="flex flex-wrap gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="transition-colors duration-300 hover:text-brand"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="soft-divider" />
              <p className="text-xs text-ink-soft">
                © {new Date().getFullYear()} Gonish. Premium web studio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
