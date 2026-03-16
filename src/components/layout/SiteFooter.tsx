import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="section-space-tight">
      <div className="shell">
        <div className="panel flex flex-col gap-6 rounded-[2rem] px-6 py-8 md:flex-row md:items-end md:justify-between md:px-10">
          <div className="space-y-3">
            <p className="eyebrow">Gonish</p>
            <p className="max-w-xl font-display text-2xl leading-tight text-ink md:text-3xl">
              브랜드의 품격을 또렷하게 전달하고, 고객의 선택까지 우아하게 연결합니다.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm text-ink-muted">
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="transition-colors duration-300 hover:text-brand">
                Main
              </Link>
              <Link href="/about" className="transition-colors duration-300 hover:text-brand">
                About
              </Link>
              <Link
                href="/portfolio"
                className="transition-colors duration-300 hover:text-brand"
              >
                Portfolio
              </Link>
              <Link href="/contact" className="transition-colors duration-300 hover:text-brand">
                Contact
              </Link>
            </div>
            <p>© {new Date().getFullYear()} Gonish. Curated premium brand portfolio.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
