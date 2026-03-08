import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { NavLink, useLocation } from "react-router-dom";
import { navigation } from "@/data/siteContent";
import "./ClockSweepNav.css";

const desktopDialQuery = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
const hoverCloseDelay = 180;
const discOpenDelayMs = 332;
const menuEntryBaseDelayMs = 436;
const menuEntryStepDelayMs = 78;
const openTotalMs = 1140;
const closeTotalMs = 900;

type Phase = "closed" | "opening" | "open" | "closing";
type DialSlot = "main" | "about" | "portfolio" | "contact";
type ClockSweepNavProps = {
  isHeroThemeActive: boolean;
};

const slotMap: Record<string, DialSlot> = {
  Main: "main",
  About: "about",
  Portfolio: "portfolio",
  Contact: "contact",
};

const enterOrder: Record<DialSlot, number> = {
  main: 0,
  about: 1,
  portfolio: 2,
  contact: 3,
};

const exitOrder: Record<DialSlot, number> = {
  contact: 0,
  portfolio: 1,
  about: 2,
  main: 3,
};

const slotMotionMap: Record<
  DialSlot,
  { angle: number; radius: number; startAngle: number; startRadius: number }
> = {
  main: { angle: 248, radius: 130, startAngle: 0, startRadius: 88 },
  about: { angle: 209, radius: 126, startAngle: 0, startRadius: 88 },
  portfolio: { angle: 142, radius: 132, startAngle: 0, startRadius: 88 },
  contact: { angle: 104, radius: 122, startAngle: 0, startRadius: 88 },
};

const dialItems = navigation.map((item) => ({
  ...item,
  slot: slotMap[item.label] ?? "main",
}));

const logoMotionVariants = {
  closed: {
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
  },
  opening: {
    y: [0, -26, 14, -10, -4, -3],
    scaleX: [1, 1.02, 0.84, 1.04, 1.005, 1],
    scaleY: [1, 0.98, 1.17, 0.965, 1.006, 1],
    rotate: [0, -0.42, 0.3, -0.16, 0.05, 0],
  },
  open: {
    y: -3,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
  },
  closing: {
    y: [-3, -1.2, 0],
    scaleX: [1, 1.008, 1],
    scaleY: [1, 0.994, 1],
    rotate: [0, -0.08, 0],
  },
};

const reducedLogoMotionVariants = {
  closed: {
    y: 0,
    scale: 1,
    opacity: 0.96,
  },
  opening: {
    y: -2,
    scale: 1.015,
    opacity: 1,
  },
  open: {
    y: -2,
    scale: 1.015,
    opacity: 1,
  },
  closing: {
    y: 0,
    scale: 1,
    opacity: 0.96,
  },
};

const logoImpactVariants = {
  closed: {
    opacity: 0,
    scale: 0.6,
  },
  opening: {
    opacity: [0, 0, 0.56, 0],
    scale: [0.6, 0.64, 1.76, 1.12],
  },
  open: {
    opacity: 0,
    scale: 1,
  },
  closing: {
    opacity: 0,
    scale: 1,
  },
};

const reducedImpactVariants = {
  closed: {
    opacity: 0,
    scale: 1,
  },
  opening: {
    opacity: [0, 0.18, 0],
    scale: [0.98, 1.04, 1],
  },
  open: {
    opacity: 0,
    scale: 1,
  },
  closing: {
    opacity: 0,
    scale: 1,
  },
};

const logoOpenTransition = {
  duration: 0.72,
  ease: "linear" as const,
  times: [0, 0.2, 0.48, 0.72, 0.9, 1],
};

const logoCloseTransition = {
  duration: 0.4,
  ease: [0.32, 0, 0.24, 1] as const,
  times: [0, 0.62, 1],
};

const logoSteadyTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1] as const,
};

const reducedOpenTransition = {
  duration: 0.22,
  ease: [0.24, 1, 0.32, 1] as const,
};

const reducedCloseTransition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] as const,
};

const impactTransition = {
  duration: 0.72,
  ease: "linear" as const,
  times: [0, 0.44, 0.5, 1],
};

export default function ClockSweepNav({ isHeroThemeActive }: ClockSweepNavProps) {
  const location = useLocation();
  const navId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const suppressNextFocusOpenRef = useRef(false);
  const phaseRef = useRef<Phase>("closed");
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [supportsHoverDial, setSupportsHoverDial] = useState(false);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [isTapOpen, setIsTapOpen] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [phase, setPhase] = useState<Phase>("closed");
  const phaseOpenTotalMs = prefersReducedMotion ? 140 : openTotalMs;
  const phaseCloseTotalMs = prefersReducedMotion ? 120 : closeTotalMs;

  phaseRef.current = phase;

  const clearHoverTimer = () => {
    if (hoverTimerRef.current !== null) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const clearPhaseTimer = () => {
    if (phaseTimerRef.current !== null) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  };

  const closeRequest = () => {
    clearHoverTimer();
    setIsPointerInside(false);
    setIsTapOpen(false);
    setIsFocusWithin(false);
  };

  const closeImmediately = () => {
    clearHoverTimer();
    clearPhaseTimer();
    setIsPointerInside(false);
    setIsTapOpen(false);
    setIsFocusWithin(false);
    setPhase("closed");
  };

  const openForPointer = () => {
    if (!supportsHoverDial) {
      return;
    }

    clearHoverTimer();
    setIsPointerInside(true);
  };

  const schedulePointerClose = (event: ReactPointerEvent<HTMLElement>) => {
    if (!supportsHoverDial) {
      return;
    }

    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && rootRef.current?.contains(nextTarget)) {
      return;
    }

    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => {
      setIsPointerInside(false);
      hoverTimerRef.current = null;
    }, hoverCloseDelay);
  };

  const isRequestedOpen = (supportsHoverDial ? isPointerInside : isTapOpen) || isFocusWithin;
  const isMounted = phase !== "closed";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(desktopDialQuery);
    const updateInteractionMode = () => setSupportsHoverDial(mediaQuery.matches);

    updateInteractionMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateInteractionMode);
      return () => mediaQuery.removeEventListener("change", updateInteractionMode);
    }

    mediaQuery.addListener(updateInteractionMode);
    return () => mediaQuery.removeListener(updateInteractionMode);
  }, []);

  useEffect(() => () => {
    clearHoverTimer();
    clearPhaseTimer();
  }, []);

  useEffect(() => {
    closeImmediately();
  }, [location.pathname, supportsHoverDial]);

  useEffect(() => {
    clearPhaseTimer();

    if (isRequestedOpen) {
      if (phaseRef.current === "open" || phaseRef.current === "opening") {
        return;
      }

      setPhase("opening");
      phaseTimerRef.current = setTimeout(() => {
        setPhase("open");
        phaseTimerRef.current = null;
      }, phaseOpenTotalMs);

      return;
    }

    if (phaseRef.current === "closed" || phaseRef.current === "closing") {
      return;
    }

    setPhase("closing");
    phaseTimerRef.current = setTimeout(() => {
      setPhase("closed");
      phaseTimerRef.current = null;
    }, phaseCloseTotalMs);
  }, [isRequestedOpen, phaseCloseTotalMs, phaseOpenTotalMs]);

  useEffect(() => {
    if (supportsHoverDial || !isMounted) {
      return;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!rootRef.current?.contains(target)) {
        closeRequest();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [isMounted, supportsHoverDial]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      closeRequest();
      suppressNextFocusOpenRef.current = true;
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMounted]);

  const navStyle = {
    "--disc-open-delay": `${prefersReducedMotion ? 0 : discOpenDelayMs}ms`,
  } as CSSProperties;

  const logoTransition = prefersReducedMotion
    ? phase === "opening" || phase === "open"
      ? reducedOpenTransition
      : reducedCloseTransition
    : phase === "opening"
      ? logoOpenTransition
      : phase === "closing"
        ? logoCloseTransition
        : logoSteadyTransition;

  return (
    <div
      ref={rootRef}
      className={`clock-sweep-nav clock-sweep-nav__navDock clock-sweep-nav--${phase}`}
      data-phase={phase}
      style={navStyle}
      onFocusCapture={() => {
        if (suppressNextFocusOpenRef.current) {
          suppressNextFocusOpenRef.current = false;
          return;
        }

        clearHoverTimer();
        setIsFocusWithin(true);

        if (supportsHoverDial) {
          setIsPointerInside(true);
        }
      }}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;

        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setIsFocusWithin(false);

          if (supportsHoverDial) {
            clearHoverTimer();
            hoverTimerRef.current = setTimeout(() => {
              setIsPointerInside(false);
              hoverTimerRef.current = null;
            }, hoverCloseDelay);
          }
        }
      }}
    >
      {/* Disc and logo are sibling layers to avoid clipping from dial masks/overflow contexts. */}
      <div className="clock-sweep-nav__discLayer">
        <div aria-hidden="true" className="clock-sweep-nav__nub" />

        {isMounted ? (
          <nav
            id={navId}
            className="clock-sweep-nav__overlay"
            aria-label="Primary navigation"
            onPointerEnter={openForPointer}
            onPointerLeave={schedulePointerClose}
          >
            <div className="clock-sweep-nav__panelShell">
              <div aria-hidden="true" className="clock-sweep-nav__hoverBridge" />

              <div className="clock-sweep-nav__panelCrop">
                <div className="clock-sweep-nav__dialStage">
                  <div className="clock-sweep-nav__sweepLayer">
                    <div className="clock-sweep-nav__dialRotor">
                      <div className="clock-sweep-nav__dialSurface" />
                      <div className="clock-sweep-nav__dialRings" />
                      <div className="clock-sweep-nav__dialSheen" />
                    </div>
                  </div>
                </div>
              </div>

              <ul className="clock-sweep-nav__menuLayer">
                {dialItems.map((item) => {
                  const motion = slotMotionMap[item.slot];

                  const style = {
                    "--enter-delay": `${menuEntryBaseDelayMs + enterOrder[item.slot] * menuEntryStepDelayMs}ms`,
                    "--exit-delay": `${exitOrder[item.slot] * 56}ms`,
                    "--item-angle": `${motion.angle}deg`,
                    "--item-radius": `${motion.radius}px`,
                    "--item-start-angle": `${motion.startAngle}deg`,
                    "--item-start-radius": `${motion.startRadius}px`,
                  } as CSSProperties;

                  return (
                    <li
                      key={item.to}
                      className={`clock-sweep-nav__item clock-sweep-nav__item--${item.slot}`}
                      style={style}
                    >
                      <div className="clock-sweep-nav__itemMotion">
                        <NavLink
                          to={item.to}
                          end={item.to === "/"}
                          className={({ isActive }) =>
                            [
                              "clock-sweep-nav__link",
                              isActive ? "clock-sweep-nav__link--active" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")
                          }
                          onClick={closeRequest}
                        >
                          {item.label}
                        </NavLink>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        ) : null}
      </div>

      <div
        className="clock-sweep-nav__logoLayer"
        onPointerEnter={openForPointer}
        onPointerLeave={schedulePointerClose}
      >
        <motion.button
          ref={triggerRef}
          type="button"
          aria-controls={navId}
          aria-expanded={isMounted}
          aria-haspopup="true"
          aria-label={isMounted ? "Close navigation" : "Open navigation"}
          className={[
            "clock-sweep-nav__logoButton",
            isHeroThemeActive
              ? "clock-sweep-nav__logoButton--hero"
              : "clock-sweep-nav__logoButton--light",
          ].join(" ")}
          initial={false}
          animate={phase}
          variants={prefersReducedMotion ? reducedLogoMotionVariants : logoMotionVariants}
          transition={logoTransition}
          onClick={() => {
            if (!supportsHoverDial) {
              setIsTapOpen((current) => {
                const next = !current;

                if (!next) {
                  setIsFocusWithin(false);
                  window.requestAnimationFrame(() => triggerRef.current?.blur());
                }

                return next;
              });
            }
          }}
        >
          {/* Impact pulse synced with the landing frame to make the logo-disc coupling read clearly. */}
          <motion.span
            aria-hidden="true"
            className="clock-sweep-nav__logoImpact"
            initial={false}
            animate={phase}
            variants={prefersReducedMotion ? reducedImpactVariants : logoImpactVariants}
            transition={prefersReducedMotion ? reducedOpenTransition : impactTransition}
          />
          <span aria-hidden="true" className="clock-sweep-nav__logoGlow" />
          <span className="clock-sweep-nav__logoFrame">
            <img
              src="/Gonish.png"
              alt="Gonish"
              className="clock-sweep-nav__logoImage"
              loading="eager"
              draggable={false}
            />
          </span>
        </motion.button>
      </div>
    </div>
  );
}
