import { NavLink, useLocation } from "react-router-dom";
import { navigation } from "@/data/siteContent";

export default function SiteHeader() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    [
      "relative inline-flex items-center whitespace-nowrap py-1 text-[11px] uppercase leading-none tracking-[0.1em] transition-colors duration-300 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:opacity-80 after:transition-transform after:duration-300 sm:text-[11px] sm:tracking-[0.14em] md:text-[12px] md:tracking-[0.18em]",
      isActive
        ? isHome
          ? "text-[#F31D5B] after:scale-x-100"
          : "text-brand after:scale-x-100"
        : isHome
          ? "text-[rgba(58,32,40,0.72)] hover:text-[#F31D5B] hover:after:scale-x-100"
          : "text-ink/62 hover:text-ink hover:after:scale-x-100",
    ].join(" ");

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 py-3 sm:py-4">
      <div className="shell pointer-events-auto">
        <div
          className={[
            "relative flex min-h-[3.3rem] items-center justify-between gap-4 rounded-[1.4rem] px-4 py-2.5 md:min-h-[3.5rem] md:px-5",
            isHome
              ? "border border-[rgba(255,255,255,0.28)] bg-[rgba(248,239,242,0.78)] shadow-[0_16px_40px_rgba(20,16,20,0.12)]"
              : "border border-black/10 bg-white/78 shadow-panel backdrop-blur-xl",
          ].join(" ")}
        >
          <NavLink
            to="/"
            className="relative z-[1] inline-flex shrink-0 items-center transition-opacity duration-300 hover:opacity-80"
            aria-label="Gonish home"
          >
            <span className="relative block h-[1.28rem] w-[3.58rem] overflow-hidden sm:h-[1.36rem] sm:w-[3.8rem] md:h-[1.52rem] md:w-[4.24rem]">
              <img
                src="/Gonish.png"
                alt="Gonish"
                className="absolute max-w-none select-none"
                style={{ height: "658.6%", left: "-64.5%", top: "-266.9%" }}
                loading="eager"
                draggable={false}
              />
            </span>
          </NavLink>

          <nav className="relative z-[1] ml-auto min-w-0 py-0.5 md:w-[min(34rem,46vw)] lg:w-[min(37rem,50vw)]">
            <ul className="flex items-center justify-end gap-4 sm:gap-5 md:w-full md:justify-end md:gap-8 lg:gap-10">
              {navigation.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={linkClasses} end={item.to === "/"}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
