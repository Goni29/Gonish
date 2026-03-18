"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import ScrollToTop from "@/components/layout/ScrollToTop";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

gsap.registerPlugin(ScrollTrigger);

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

  useEffect(() => {
    ScrollTrigger.normalizeScroll(true);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

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
          <main className={isHome ? "pt-0" : "pt-24 md:pt-28"}>
            {children}
          </main>
        </motion.div>
      </AnimatePresence>
      <SiteFooter />
    </div>
  );
}
