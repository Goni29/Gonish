import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ClockSweepNav from "@/components/layout/ClockSweepNav";

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [isHeroThemeActive, setIsHeroThemeActive] = useState(true);

  useEffect(() => {
    const isHome = pathname === "/";

    if (!isHome) {
      setIsHeroThemeActive(false);
      return;
    }

    let frame = 0;

    const updateHeroTheme = () => {
      const hero = document.getElementById("home-hero");

      if (!hero) {
        setIsHeroThemeActive(false);
        return;
      }

      const rect = hero.getBoundingClientRect();
      const nextIsHeroThemeActive =
        rect.top < window.innerHeight * 0.92 && rect.bottom > 104;

      setIsHeroThemeActive((current) =>
        current === nextIsHeroThemeActive ? current : nextIsHeroThemeActive,
      );
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateHeroTheme();
      });
    };

    updateHeroTheme();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [pathname]);

  return (
    <header className="site-header--dock-bottom-right pointer-events-none fixed bottom-3 right-3 z-50 p-3 sm:bottom-6 sm:right-6 sm:p-4">
      <div className="pointer-events-none">
        <ClockSweepNav isHeroThemeActive={isHeroThemeActive} />
      </div>
    </header>
  );
}
