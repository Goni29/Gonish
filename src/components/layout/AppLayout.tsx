"use client";

import type { ReactNode } from "react";
import { useContext, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ScrollToTop from "@/components/layout/ScrollToTop";
import SmoothScroll from "@/components/layout/SmoothScroll";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

gsap.registerPlugin(ScrollTrigger);

function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

const pageTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as const,
};

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname() ?? "/";
  const isHome = pathname === "/";
  const isAdminRoute = pathname.startsWith("/admin/");

  useEffect(() => {
    if (isAdminRoute) return;
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [isAdminRoute, pathname]);

  if (isAdminRoute) {
    return (
      <div className="min-h-screen">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            className="min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={pageTransition}
          >
            <FrozenRouter>
              <main>{children}</main>
            </FrozenRouter>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnalyticsTracker />
      <ScrollToTop />
      <SmoothScroll restoreLegacyTouchMode={isHome} />
      <SiteHeader />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          className="flex flex-1 flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={pageTransition}
        >
          <FrozenRouter>
            <main className={isHome ? "flex-1 pt-0" : "flex-1 pt-24 md:pt-28"}>
              {children}
            </main>
          </FrozenRouter>
        </motion.div>
      </AnimatePresence>
      <SiteFooter />
    </div>
  );
}
