import { NavLink } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="section-space-tight">
      <div className="shell">
        <div className="panel flex flex-col gap-6 rounded-[2rem] px-6 py-8 md:flex-row md:items-end md:justify-between md:px-10">
          <div className="space-y-3">
            <p className="eyebrow">Gonish</p>
            <p className="max-w-xl font-display text-2xl leading-tight text-ink md:text-3xl">
              빠르게, 정교하게, 그리고 한 사람의 결에 맞는 방식으로.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm text-ink-muted">
            <div className="flex flex-wrap gap-3">
              <NavLink to="/" className="transition-colors duration-300 hover:text-brand">
                Main
              </NavLink>
              <NavLink to="/about" className="transition-colors duration-300 hover:text-brand">
                About
              </NavLink>
              <NavLink
                to="/portfolio"
                className="transition-colors duration-300 hover:text-brand"
              >
                Portfolio
              </NavLink>
              <NavLink to="/contact" className="transition-colors duration-300 hover:text-brand">
                Contact
              </NavLink>
            </div>
            <p>© {new Date().getFullYear()} Gonish. Premium personal brand portfolio.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
