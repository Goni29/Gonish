import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ClockSweepNav from "@/components/layout/ClockSweepNav";

export default function SiteHeader() {
  const location = useLocation();
  const [isHeroThemeActive, setIsHeroThemeActive] = useState(true);

  useEffect(() => {
    const isHome = location.pathname === "/";

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
  }, [location.pathname]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 py-3 sm:py-4">
      <div className="shell pointer-events-none">
        <ClockSweepNav isHeroThemeActive={isHeroThemeActive} />
      </div>
    </header>
  );
}
