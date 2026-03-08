import type { CSSProperties } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navigation } from "@/data/siteContent";
import "./ClockSweepNav.css";

const desktopDialQuery = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
const hoverCloseDelay = 120;
const openTotalMs = 820;
const closeTotalMs = 920;

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

export default function ClockSweepNav({ isHeroThemeActive }: ClockSweepNavProps) {
  const location = useLocation();
  const navId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const phaseRef = useRef<Phase>("closed");
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [supportsHoverDial, setSupportsHoverDial] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTapOpen, setIsTapOpen] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [phase, setPhase] = useState<Phase>("closed");

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
    setIsHovered(false);
    setIsTapOpen(false);
    setIsFocusWithin(false);
  };

  const closeImmediately = () => {
    clearHoverTimer();
    clearPhaseTimer();
    setIsHovered(false);
    setIsTapOpen(false);
    setIsFocusWithin(false);
    setPhase("closed");
  };

  const openForHover = () => {
    if (!supportsHoverDial) {
      return;
    }

    clearHoverTimer();
    setIsHovered(true);
  };

  const scheduleHoverClose = () => {
    if (!supportsHoverDial) {
      return;
    }

    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      hoverTimerRef.current = null;
    }, hoverCloseDelay);
  };

  const isRequestedOpen = supportsHoverDial ? isHovered || isFocusWithin : isTapOpen;
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
      }, openTotalMs);

      return;
    }

    if (phaseRef.current === "closed" || phaseRef.current === "closing") {
      return;
    }

    setPhase("closing");
    phaseTimerRef.current = setTimeout(() => {
      setPhase("closed");
      phaseTimerRef.current = null;
    }, closeTotalMs);
  }, [isRequestedOpen]);

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
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMounted]);

  return (
    <div
      ref={rootRef}
      className={`clock-sweep-nav clock-sweep-nav--${phase}`}
      data-phase={phase}
      onFocusCapture={() => {
        clearHoverTimer();
        setIsFocusWithin(true);

        if (supportsHoverDial) {
          setIsHovered(true);
        }
      }}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;

        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setIsFocusWithin(false);

          if (supportsHoverDial) {
            setIsHovered(false);
          }
        }
      }}
    >
      <div aria-hidden="true" className="clock-sweep-nav__nub" />

      <div
        className="clock-sweep-nav__logoLayer"
        onMouseEnter={openForHover}
        onMouseLeave={scheduleHoverClose}
      >
        <button
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
          onClick={() => {
            if (!supportsHoverDial) {
              setIsTapOpen((current) => !current);
            }
          }}
        >
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
        </button>
      </div>

      {isMounted ? (
        <nav
          id={navId}
          className="clock-sweep-nav__overlay"
          aria-label="Primary navigation"
          onMouseEnter={openForHover}
          onMouseLeave={scheduleHoverClose}
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
                  "--enter-delay": `${220 + enterOrder[item.slot] * 86}ms`,
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
  );
}
