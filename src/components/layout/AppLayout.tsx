"use client";

import type { ReactNode } from "react";
import { useContext, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import ScrollToTop from "@/components/layout/ScrollToTop";
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
    ScrollTrigger.normalizeScroll(true);
  }, [isAdminRoute]);

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
    <div className="min-h-screen">
      <ScrollToTop />
      <SiteHeader />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={pageTransition}
        >
          <FrozenRouter>
            <main className={isHome ? "pt-0" : "pt-24 md:pt-28"}>
              {children}
            </main>
          </FrozenRouter>
        </motion.div>
      </AnimatePresence>
      <SiteFooter />
    </div>
  );
}
