import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navigation } from "@/data/siteContent";
import "./ClockSweepNav.css";

const desktopDialQuery = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
const hoverCloseDelayBase = 208;
const hoverCloseDelayOutward = 184;
const hoverCloseDelayInward = 236;
const cornerHoldEdgePx = 24;
const cornerReleaseDistancePx = 84;
const cornerHoldZoneMinPx = 240;
const slowExitDwellMs = 540;
const slowExitOutwardMs = 260;
const slowExitAwayMs = 220;
const slowExitDistanceGainPx = 34;
const slowExitTickMs = 140;
const discOpenDelayMs = 332;
const menuEntryBaseDelayMs = 436;
const menuEntryStepDelayMs = 78;
const openTotalMs = 1140;
const closeTotalMs = 900;

type Phase = "closed" | "opening" | "open" | "closing";
type DialSlot = "main" | "about" | "portfolio" | "estimate" | "contact";
type SlowExitTrend = {
  awayMs: number;
  lastDistance: number;
  lastTs: number;
  outwardMs: number;
  startDistance: number;
  startTs: number;
};
type ClockSweepNavProps = {
  isHeroThemeActive: boolean;
};

const slotMap: Record<string, DialSlot> = {
  Main: "main",
  About: "about",
  Portfolio: "portfolio",
  Estimate: "estimate",
  Contact: "contact",
};

const enterOrder: Record<DialSlot, number> = {
  main: 0,
  about: 1,
  estimate: 2,
  portfolio: 3,
  contact: 4,
};

const exitOrder: Record<DialSlot, number> = {
  contact: 0,
  portfolio: 1,
  estimate: 2,
  about: 3,
  main: 4,
};

const slotMotionMap: Record<
  DialSlot,
  { angle: number; radius: number; startAngle: number; startRadius: number }
> = {
  main: { angle: 302, radius: 126, startAngle: -14, startRadius: 82 },
  about: { angle: 14, radius: 130, startAngle: 10, startRadius: 84 },
  estimate: { angle: 86, radius: 134, startAngle: 44, startRadius: 88 },
  contact: { angle: 158, radius: 126, startAngle: 92, startRadius: 88 },
  portfolio: { angle: 230, radius: 136, startAngle: 140, startRadius: 94 },
};

const slotOrbitMap: Record<DialSlot, { duration: number }> = {
  main: { duration: 112 },
  about: { duration: 126 },
  estimate: { duration: 132 },
  portfolio: { duration: 118 },
  contact: { duration: 104 },
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
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const navId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const logoLayerRef = useRef<HTMLDivElement | null>(null);
  const panelCropRef = useRef<HTMLDivElement | null>(null);
  const corridorRef = useRef<HTMLDivElement | null>(null);
  const interactionZoneRef = useRef<HTMLDivElement | null>(null);
  const suppressNextFocusOpenRef = useRef(false);
  const pendingCloseAfterOpenRef = useRef(false);
  const pointerVectorRef = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const phaseRef = useRef<Phase>("closed");
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeMonitorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slowExitTrendRef = useRef<SlowExitTrend | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLogoHoveredRef = useRef(false);
  const isDiscHoveredRef = useRef(false);
  const isCorridorHoveredRef = useRef(false);
  const isFocusWithinRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const [supportsHoverDial, setSupportsHoverDial] = useState(false);
  const [isSmallDesktop, setIsSmallDesktop] = useState(false);
  const [isTabletDial, setIsTabletDial] = useState(false);
  const [isMobileDial, setIsMobileDial] = useState(false);
  const [isSmallMobileDial, setIsSmallMobileDial] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isDiscHovered, setIsDiscHovered] = useState(false);
  const [isCorridorHovered, setIsCorridorHovered] = useState(false);
  const [isDesktopOpenRequested, setIsDesktopOpenRequested] = useState(false);
  const [isTapOpen, setIsTapOpen] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [phase, setPhase] = useState<Phase>("closed");
  const phaseOpenTotalMs = prefersReducedMotion ? 140 : openTotalMs;
  const phaseCloseTotalMs = prefersReducedMotion ? 120 : closeTotalMs;

  phaseRef.current = phase;
  isLogoHoveredRef.current = isLogoHovered;
  isDiscHoveredRef.current = isDiscHovered;
  isCorridorHoveredRef.current = isCorridorHovered;
  isFocusWithinRef.current = isFocusWithin;

  const clearHoverTimer = () => {
    if (hoverTimerRef.current !== null) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const clearCloseMonitor = () => {
    if (closeMonitorTimerRef.current !== null) {
      clearTimeout(closeMonitorTimerRef.current);
      closeMonitorTimerRef.current = null;
    }
  };

  const resetSlowExitTrend = () => {
    slowExitTrendRef.current = null;
  };

  const clearPhaseTimer = () => {
    if (phaseTimerRef.current !== null) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  };

  const hasDesktopKeepAlive = () =>
    isLogoHoveredRef.current ||
    isDiscHoveredRef.current ||
    isCorridorHoveredRef.current ||
    isFocusWithinRef.current;

  const updatePointerVector = (x: number, y: number) => {
    const previous = pointerVectorRef.current;

    if (!previous) {
      pointerVectorRef.current = { x, y, dx: 0, dy: 0 };
      return;
    }

    pointerVectorRef.current = {
      x,
      y,
      dx: x - previous.x,
      dy: y - previous.y,
    };
  };

  const getCurrentPointerPosition = () => {
    const pointer = pointerVectorRef.current;

    if (!pointer) {
      return null;
    }

    return { x: pointer.x, y: pointer.y };
  };

  const isPointInsideRect = (
    point: { x: number; y: number },
    rect: DOMRect | null | undefined,
    expand = 0,
  ) => {
    if (!rect) {
      return false;
    }

    return (
      point.x >= rect.left - expand &&
      point.x <= rect.right + expand &&
      point.y >= rect.top - expand &&
      point.y <= rect.bottom + expand
    );
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(
      target.closest(
        ".clock-sweep-nav__logoLayer, .clock-sweep-nav__panelCrop, .clock-sweep-nav__menuLayer, .clock-sweep-nav__hoverBridge, .clock-sweep-nav__interactionZone",
      ),
    );
  };

  const getInteractionAnchorMetrics = (point: { x: number; y: number }) => {
    const interactionRect = interactionZoneRef.current?.getBoundingClientRect();

    if (!interactionRect) {
      return null;
    }

    const centerX = interactionRect.left + interactionRect.width / 2;
    const centerY = interactionRect.top + interactionRect.height / 2;
    const radius = interactionRect.width / 2;
    const distanceFromCenter = Math.hypot(point.x - centerX, point.y - centerY);
    const outsideDistance = Math.max(0, distanceFromCenter - radius);

    return { centerX, centerY, outsideDistance };
  };

  const isInsideCoreKeepZones = (point: { x: number; y: number }) =>
    isPointInsideRect(point, logoLayerRef.current?.getBoundingClientRect(), 10) ||
    isPointInsideRect(point, corridorRef.current?.getBoundingClientRect(), 16) ||
    isPointInsideRect(point, panelCropRef.current?.getBoundingClientRect(), 28);

  const updateSlowExitTrendAndShouldClose = (point: { x: number; y: number }) => {
    const anchor = getInteractionAnchorMetrics(point);

    if (!anchor) {
      resetSlowExitTrend();
      return false;
    }

    const now = performance.now();
    const currentTrend = slowExitTrendRef.current;

    if (!currentTrend) {
      slowExitTrendRef.current = {
        awayMs: 0,
        lastDistance: anchor.outsideDistance,
        lastTs: now,
        outwardMs: 0,
        startDistance: anchor.outsideDistance,
        startTs: now,
      };
      return false;
    }

    const deltaMs = Math.max(0, Math.min(140, now - currentTrend.lastTs));
    const distanceDelta = anchor.outsideDistance - currentTrend.lastDistance;

    if (distanceDelta > 0.35) {
      currentTrend.outwardMs += deltaMs;
    } else if (distanceDelta < -0.35) {
      currentTrend.outwardMs = Math.max(0, currentTrend.outwardMs - deltaMs * 0.9);
    }

    const pointerVector = pointerVectorRef.current;

    if (pointerVector) {
      const awayDot =
        pointerVector.dx * (point.x - anchor.centerX) + pointerVector.dy * (point.y - anchor.centerY);

      if (awayDot > 0.5) {
        currentTrend.awayMs += deltaMs;
      } else if (awayDot < -0.4) {
        currentTrend.awayMs = Math.max(0, currentTrend.awayMs - deltaMs);
      }
    }

    currentTrend.lastDistance = anchor.outsideDistance;
    currentTrend.lastTs = now;

    const dwellMs = now - currentTrend.startTs;
    const distanceGain = anchor.outsideDistance - currentTrend.startDistance;

    return (
      dwellMs >= slowExitDwellMs &&
      distanceGain >= slowExitDistanceGainPx &&
      currentTrend.outwardMs >= slowExitOutwardMs &&
      currentTrend.awayMs >= slowExitAwayMs
    );
  };

  const shouldKeepOpenAtCorner = (point: { x: number; y: number }) => {
    if (typeof window === "undefined") {
      return false;
    }

    const nearRightEdge = point.x >= window.innerWidth - cornerHoldEdgePx;
    const nearBottomEdge = point.y >= window.innerHeight - cornerHoldEdgePx;

    if (!nearRightEdge && !nearBottomEdge) {
      return false;
    }

    const rootRect = rootRef.current?.getBoundingClientRect();
    const zoneWidth = Math.max(cornerHoldZoneMinPx, (rootRect?.width ?? 0) + 48);
    const zoneHeight = Math.max(cornerHoldZoneMinPx, (rootRect?.height ?? 0) + 48);
    const isInsideCornerZone =
      point.x >= window.innerWidth - zoneWidth && point.y >= window.innerHeight - zoneHeight;

    if (!isInsideCornerZone) {
      return false;
    }

    const movedLeftEnough = point.x <= window.innerWidth - cornerReleaseDistancePx;
    const movedUpEnough = point.y <= window.innerHeight - cornerReleaseDistancePx;

    return !(movedLeftEnough || movedUpEnough);
  };

  const getPointerKeepDecision = () => {
    const point = getCurrentPointerPosition();

    if (!point) {
      resetSlowExitTrend();
      return { keepOpen: false, monitorSlowExit: false };
    }

    if (isInsideCoreKeepZones(point)) {
      resetSlowExitTrend();
      return { keepOpen: true, monitorSlowExit: false };
    }

    const inExtendedZone = isPointInsideRect(point, interactionZoneRef.current?.getBoundingClientRect(), 0);
    const inCornerHold = shouldKeepOpenAtCorner(point);

    if (!inExtendedZone && !inCornerHold) {
      resetSlowExitTrend();
      return { keepOpen: false, monitorSlowExit: false };
    }

    if (updateSlowExitTrendAndShouldClose(point)) {
      resetSlowExitTrend();
      return { keepOpen: false, monitorSlowExit: false };
    }

    return { keepOpen: true, monitorSlowExit: true };
  };

  const closeWithIntent = () => {
    if (phaseRef.current === "opening") {
      pendingCloseAfterOpenRef.current = true;
      return;
    }

    setIsDesktopOpenRequested(false);
  };

  const scheduleSlowExitMonitor = (delayMs = slowExitTickMs) => {
    if (!supportsHoverDial || phaseRef.current !== "open") {
      return;
    }

    if (closeMonitorTimerRef.current !== null) {
      return;
    }

    closeMonitorTimerRef.current = setTimeout(() => {
      closeMonitorTimerRef.current = null;

      if (hasDesktopKeepAlive()) {
        resetSlowExitTrend();
        return;
      }

      const decision = getPointerKeepDecision();

      if (!decision.keepOpen) {
        closeWithIntent();
        return;
      }

      if (decision.monitorSlowExit) {
        scheduleSlowExitMonitor(slowExitTickMs);
      }
    }, delayMs);
  };

  const getDirectionalCloseDelay = (event: ReactPointerEvent<HTMLElement>) => {
    const pointerVector = pointerVectorRef.current;
    const rootBounds = rootRef.current?.getBoundingClientRect();
    const pointerPoint = { x: event.clientX, y: event.clientY };

    if (shouldKeepOpenAtCorner(pointerPoint)) {
      return hoverCloseDelayInward;
    }

    if (!pointerVector || !rootBounds) {
      return hoverCloseDelayBase;
    }

    const dockX = rootBounds.right - 26;
    const dockY = rootBounds.bottom - 26;
    const toDockX = dockX - event.clientX;
    const toDockY = dockY - event.clientY;
    const dot = pointerVector.dx * toDockX + pointerVector.dy * toDockY;

    if (dot < -28) {
      return hoverCloseDelayOutward;
    }

    if (dot > 18) {
      return hoverCloseDelayInward;
    }

    return hoverCloseDelayBase;
  };

  const scheduleDesktopClose = (event?: ReactPointerEvent<HTMLElement>) => {
    if (!supportsHoverDial) {
      return;
    }

    clearHoverTimer();
    clearCloseMonitor();

    const delay = event ? getDirectionalCloseDelay(event) : hoverCloseDelayBase;
    hoverTimerRef.current = setTimeout(() => {
      hoverTimerRef.current = null;

      if (hasDesktopKeepAlive()) {
        resetSlowExitTrend();
        return;
      }

      const decision = getPointerKeepDecision();

      if (decision.keepOpen) {
        if (decision.monitorSlowExit) {
          scheduleSlowExitMonitor(slowExitTickMs);
        }
        return;
      }

      closeWithIntent();
    }, delay);
  };

  const closeRequest = () => {
    clearHoverTimer();
    clearCloseMonitor();
    pendingCloseAfterOpenRef.current = false;
    resetSlowExitTrend();
    setIsLogoHovered(false);
    setIsDiscHovered(false);
    setIsCorridorHovered(false);
    setIsDesktopOpenRequested(false);
    setIsTapOpen(false);
    setIsFocusWithin(false);
  };

  const closeImmediately = () => {
    clearHoverTimer();
    clearCloseMonitor();
    clearPhaseTimer();
    pendingCloseAfterOpenRef.current = false;
    resetSlowExitTrend();
    setIsLogoHovered(false);
    setIsDiscHovered(false);
    setIsCorridorHovered(false);
    setIsDesktopOpenRequested(false);
    setIsTapOpen(false);
    setIsFocusWithin(false);
    setPhase("closed");
  };

  const openFromLogoHover = () => {
    if (!supportsHoverDial) {
      return;
    }

    clearHoverTimer();
    clearCloseMonitor();
    pendingCloseAfterOpenRef.current = false;
    resetSlowExitTrend();
    setIsDesktopOpenRequested(true);
  };

  const onLogoPointerEnter = () => {
    if (!supportsHoverDial) {
      return;
    }

    setIsLogoHovered(true);
    openFromLogoHover();
  };

  const onLogoPointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    if (!supportsHoverDial) {
      return;
    }

    setIsLogoHovered(false);
    updatePointerVector(event.clientX, event.clientY);
    const nextTarget = event.relatedTarget;

    if (isInteractiveTarget(nextTarget)) {
      return;
    }

    scheduleDesktopClose(event);
  };

  const onDiscPointerEnter = () => {
    if (!supportsHoverDial) {
      return;
    }

    clearHoverTimer();
    clearCloseMonitor();
    resetSlowExitTrend();
    setIsDiscHovered(true);

    if (phaseRef.current === "open" || phaseRef.current === "opening") {
      setIsDesktopOpenRequested(true);
    }
  };

  const onDiscPointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    if (!supportsHoverDial) {
      return;
    }

    setIsDiscHovered(false);
    updatePointerVector(event.clientX, event.clientY);
    const nextTarget = event.relatedTarget;

    if (isInteractiveTarget(nextTarget)) {
      return;
    }

    scheduleDesktopClose(event);
  };

  const onCorridorPointerEnter = () => {
    if (!supportsHoverDial) {
      return;
    }

    clearHoverTimer();
    clearCloseMonitor();
    resetSlowExitTrend();
    setIsCorridorHovered(true);

    if (phaseRef.current === "open" || phaseRef.current === "opening") {
      setIsDesktopOpenRequested(true);
    }
  };

  const onCorridorPointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    if (!supportsHoverDial) {
      return;
    }

    setIsCorridorHovered(false);
    updatePointerVector(event.clientX, event.clientY);
    const nextTarget = event.relatedTarget;

    if (isInteractiveTarget(nextTarget)) {
      return;
    }

    scheduleDesktopClose(event);
  };

  const trackPointerVector = (event: ReactPointerEvent<HTMLDivElement>) => {
    updatePointerVector(event.clientX, event.clientY);
  };

  const isRequestedOpen =
    (supportsHoverDial ? isDesktopOpenRequested : isTapOpen) || isFocusWithin;
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const smallDesktopQuery = window.matchMedia("(max-width: 1459px)");
    const tabletQuery = window.matchMedia("(max-width: 1023px)");
    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const smallMobileQuery = window.matchMedia("(max-width: 359px)");
    const updateSmallDesktop = () => setIsSmallDesktop(smallDesktopQuery.matches);
    const updateTablet = () => setIsTabletDial(tabletQuery.matches);
    const updateMobile = () => setIsMobileDial(mobileQuery.matches);
    const updateSmallMobile = () => setIsSmallMobileDial(smallMobileQuery.matches);

    updateSmallDesktop();
    updateTablet();
    updateMobile();
    updateSmallMobile();

    if (typeof smallDesktopQuery.addEventListener === "function") {
      smallDesktopQuery.addEventListener("change", updateSmallDesktop);
      tabletQuery.addEventListener("change", updateTablet);
      mobileQuery.addEventListener("change", updateMobile);
      smallMobileQuery.addEventListener("change", updateSmallMobile);
      return () => {
        smallDesktopQuery.removeEventListener("change", updateSmallDesktop);
        tabletQuery.removeEventListener("change", updateTablet);
        mobileQuery.removeEventListener("change", updateMobile);
        smallMobileQuery.removeEventListener("change", updateSmallMobile);
      };
    }

    smallDesktopQuery.addListener(updateSmallDesktop);
    tabletQuery.addListener(updateTablet);
    mobileQuery.addListener(updateMobile);
    smallMobileQuery.addListener(updateSmallMobile);
    return () => {
      smallDesktopQuery.removeListener(updateSmallDesktop);
      tabletQuery.removeListener(updateTablet);
      mobileQuery.removeListener(updateMobile);
      smallMobileQuery.removeListener(updateSmallMobile);
    };
  }, []);

  useEffect(() => () => {
    clearHoverTimer();
    clearCloseMonitor();
    clearPhaseTimer();
  }, []);

  useEffect(() => {
    if (!supportsHoverDial) {
      return;
    }

    const syncPointerVector = (event: PointerEvent) => {
      updatePointerVector(event.clientX, event.clientY);
    };

    document.addEventListener("pointermove", syncPointerVector, { passive: true });
    return () => document.removeEventListener("pointermove", syncPointerVector);
  }, [supportsHoverDial]);

  // Route change should force-close the dial immediately. We intentionally scope this
  // effect to route and interaction-mode changes to avoid extra close cycles.
  useEffect(() => {
    closeImmediately();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, supportsHoverDial]);

  useEffect(() => {
    if (isRequestedOpen) {
      if (phaseRef.current === "open" || phaseRef.current === "opening") {
        return;
      }

      clearPhaseTimer();
      setPhase("opening");
      phaseTimerRef.current = setTimeout(() => {
        setPhase("open");
        phaseTimerRef.current = null;
      }, phaseOpenTotalMs);

      return;
    }

    if (phaseRef.current === "opening") {
      pendingCloseAfterOpenRef.current = true;
      return;
    }

    if (phaseRef.current === "closed" || phaseRef.current === "closing") {
      return;
    }

    clearPhaseTimer();
    setPhase("closing");
    phaseTimerRef.current = setTimeout(() => {
      setPhase("closed");
      phaseTimerRef.current = null;
    }, phaseCloseTotalMs);
  }, [isRequestedOpen, phaseCloseTotalMs, phaseOpenTotalMs]);

  // Keep-open/slow-exit decisions are intentionally sampled only when phase/mode changes.
  useEffect(() => {
    if (!supportsHoverDial || phase !== "open" || !pendingCloseAfterOpenRef.current) {
      return;
    }

    pendingCloseAfterOpenRef.current = false;

    if (hasDesktopKeepAlive()) {
      return;
    }

    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => {
      hoverTimerRef.current = null;

      if (hasDesktopKeepAlive()) {
        resetSlowExitTrend();
        return;
      }

      const decision = getPointerKeepDecision();

      if (!decision.keepOpen) {
        setIsDesktopOpenRequested(false);
        return;
      }

      if (decision.monitorSlowExit) {
        scheduleSlowExitMonitor(slowExitTickMs);
      }
    }, hoverCloseDelayOutward);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, supportsHoverDial]);

  useEffect(() => {
    if (phase === "open") {
      return;
    }

    clearCloseMonitor();
    resetSlowExitTrend();
  }, [phase]);

  // Outside pointer close is re-registered only when mount/mode state changes.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, supportsHoverDial]);

  // Escape handling intentionally tracks only mounted state.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      onPointerMoveCapture={trackPointerVector}
      onFocusCapture={() => {
        if (suppressNextFocusOpenRef.current) {
          suppressNextFocusOpenRef.current = false;
          return;
        }

        clearHoverTimer();
        clearCloseMonitor();
        resetSlowExitTrend();
        setIsFocusWithin(true);

        if (supportsHoverDial) {
          pendingCloseAfterOpenRef.current = false;
          setIsDesktopOpenRequested(true);
        }
      }}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;

        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setIsFocusWithin(false);

          if (supportsHoverDial) {
            scheduleDesktopClose();
          }
        }
      }}
    >
      {/* Disc and logo are sibling layers to avoid clipping from dial masks/overflow contexts. */}
      <div className="clock-sweep-nav__discLayer">
        <div aria-hidden="true" className="clock-sweep-nav__nub" />

        {isMounted ? (
          <nav id={navId} className="clock-sweep-nav__overlay" aria-label="Primary navigation">
            <div className="clock-sweep-nav__panelShell">
              <div
                aria-hidden="true"
                ref={interactionZoneRef}
                className="clock-sweep-nav__interactionZone"
                onPointerEnter={onDiscPointerEnter}
                onPointerLeave={onDiscPointerLeave}
              />

              <div
                aria-hidden="true"
                ref={corridorRef}
                className="clock-sweep-nav__hoverBridge"
                onPointerEnter={onCorridorPointerEnter}
                onPointerLeave={onCorridorPointerLeave}
              />

              <div
                ref={panelCropRef}
                className="clock-sweep-nav__panelCrop"
                onPointerEnter={onDiscPointerEnter}
                onPointerLeave={onDiscPointerLeave}
              >
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

              <ul
                className="clock-sweep-nav__menuLayer"
                onPointerEnter={onDiscPointerEnter}
                onPointerLeave={onDiscPointerLeave}
              >
                {dialItems.map((item) => {
                  const motion = slotMotionMap[item.slot];
                  const orbitMotion = slotOrbitMap[item.slot];
                  const radiusScale = isSmallMobileDial ? 0.74 : isMobileDial ? 0.81 : isTabletDial ? 0.95 : isSmallDesktop ? 0.93 : 1;
                  const isActive =
                    item.to === "/"
                      ? pathname === "/"
                      : pathname === item.to || pathname.startsWith(`${item.to}/`);

                  const style = {
                    "--enter-delay": `${menuEntryBaseDelayMs + enterOrder[item.slot] * menuEntryStepDelayMs}ms`,
                    "--exit-delay": `${exitOrder[item.slot] * 56}ms`,
                    "--item-angle": `${motion.angle}deg`,
                    "--item-radius": `${motion.radius * radiusScale}px`,
                    "--item-start-angle": `${motion.startAngle}deg`,
                    "--item-start-radius": `${motion.startRadius * radiusScale}px`,
                    "--orbit-duration": `${orbitMotion.duration}s`,
                  } as CSSProperties;

                  return (
                    <li
                      key={item.to}
                      className={`clock-sweep-nav__item clock-sweep-nav__item--${item.slot}`}
                      style={style}
                    >
                      <div className="clock-sweep-nav__itemMotion">
                        <span className="clock-sweep-nav__itemFloatX">
                          <span className="clock-sweep-nav__itemFloatY">
                            <Link
                              href={item.to}
                              className={
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
                            </Link>
                          </span>
                        </span>
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
        ref={logoLayerRef}
        className="clock-sweep-nav__logoLayer"
        onPointerEnter={onLogoPointerEnter}
        onPointerLeave={onLogoPointerLeave}
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
            if (isMounted) {
              closeRequest();
              router.push("/");
              return;
            }

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
