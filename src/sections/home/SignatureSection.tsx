"use client";

import { animate, createDrawable, type JSAnimation } from "animejs";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { getLenis } from "@/components/layout/SmoothScroll";

const steps = [
  {
    keyword: "품격",
    wordAsset: "/1st_word_stroke.svg",
    keywordScale: 1,
    headline: "첫 화면만으로도,\n브랜드의 수준은 조용히 전달됩니다.",
    body: "고객은 설명을 읽기 전에 분위기를 먼저 받아들입니다. 정제된 화면, 균형 잡힌 정보, 섬세한 디테일은 브랜드를 더 신뢰할 만한 선택으로 보이게 합니다.",
    points: ["말하지 않아도 브랜드의 인상이 먼저 전달되는 사이트", "나만의 브랜드 사이트를 만드는 경험", "처음 방문한 고객이 신뢰를 갖고 연락하게 되는 결과물"],
  },
  {
    keyword: "맞춤",
    wordAsset: "/2nd_word_stroke.svg",
    keywordScale: 1.1,
    headline: "브랜드의 결만 말씀해 주세요.\n나머지는 Gonish가 맞춥니다.",
    body: "기획서와 전문 용어 없이도 충분합니다. 원하는 분위기와 목표를 편하게 이야기하시면, 필요한 구조와 표현은 Gonish가 정교하게 맞춰드립니다.",
    points: ["내 브랜드의 분위기와 결이 그대로 담긴 사이트", "어색한 템플릿 느낌 없이 처음부터 내 것처럼 느껴지는 디자인", "원하는 방향을 맞춰가며 정확해지는 결과물"],
  },
  {
    keyword: "속도",
    wordAsset: "/3rd_word_stroke.svg",
    keywordScale: 1.11,
    headline: "늦지 않게, 가볍지 않게.\n완성도 높은 속도로 오픈합니다.",
    body: "런칭이 늦어질수록 기회도 함께 미뤄집니다. 빠른 초안과 명확한 진행 공유로 불확실성을 줄이고, 약속한 일정 안에서 품질을 놓치지 않는 제작을 지향합니다.",
    points: ["빠른 초안으로 시작부터 방향을 선명하게 확인", "투명한 진행으로 기대를 현실로 만드는 경험", "빠르게 만들었다는 티 없이 완성도까지 챙긴 결과물"],
  },
] as const;

const STEP_COUNT = steps.length;

// ── Orbit geometry ────────────────────────────────────────────────────────────
const VW = 700;
const VH = 490;
const CX = 350;
const CY = 175;
const ORBIT_RX = 270;
const ORBIT_RY = 98;
const ORBIT_ROT = -14;
const ROT_RAD = (ORBIT_ROT * Math.PI) / 180;

function getOrbitPoint(deg: number, offset = 0) {
  const rad = (deg * Math.PI) / 180;
  const lx = (ORBIT_RX + offset) * Math.cos(rad);
  const ly = (ORBIT_RY + offset * 0.4) * Math.sin(rad);
  return {
    x: CX + lx * Math.cos(ROT_RAD) - ly * Math.sin(ROT_RAD),
    y: CY + lx * Math.sin(ROT_RAD) + ly * Math.cos(ROT_RAD),
  };
}

function toPct(pt: { x: number; y: number }) {
  return { left: `${((pt.x / VW) * 100).toFixed(2)}%`, top: `${((pt.y / VH) * 100).toFixed(2)}%` };
}

const ARC_START = getOrbitPoint(0);
const ARC_END = getOrbitPoint(180);
const BACK_ARC = `M ${ARC_START.x} ${ARC_START.y} A ${ORBIT_RX} ${ORBIT_RY} ${ORBIT_ROT} 0 0 ${ARC_END.x} ${ARC_END.y}`;
const FRONT_ARC = `M ${ARC_START.x} ${ARC_START.y} A ${ORBIT_RX} ${ORBIT_RY} ${ORBIT_ROT} 0 1 ${ARC_END.x} ${ARC_END.y}`;
const ACTIVE_PT = getOrbitPoint(90);
const LEFT_PT   = getOrbitPoint(205);
const RIGHT_PT  = getOrbitPoint(335);
// ── Star layout — positions computed from orbit ring ─────────────────────────
type PlanetSlot = "active" | "left" | "right";

const ORBIT_STAR_SIZE = "clamp(2.55rem, 4.2vw, 2.95rem)";
const ORBIT_STICK_HEIGHT = "clamp(3.2rem, 5.4vw, 4rem)";

const PLANET_LAYOUT: Record<PlanetSlot, { left: string; top: string; zIndex: number; opacity: number; contentScale: number }> = {
  active: { ...toPct(getOrbitPoint(90)),  zIndex: 3, opacity: 1,    contentScale: 1 },
  left:   { ...toPct(getOrbitPoint(205)), zIndex: 2, opacity: 0.82, contentScale: 0.65 },
  right:  { ...toPct(getOrbitPoint(335)), zIndex: 1, opacity: 0.65, contentScale: 0.50 },
};

function getSlot(i: number, active: number): PlanetSlot {
  const diff = (i - active + STEP_COUNT) % STEP_COUNT;
  if (diff === 0) return "active";
  return diff === 1 ? "right" : "left";
}

type SignatureStep = (typeof steps)[number];
const svgMarkupCache = new Map<string, Promise<string>>();

function loadSvgMarkup(src: string) {
  const cached = svgMarkupCache.get(src);
  if (cached) return cached;
  const request = fetch(src).then(async (res) => {
    if (!res.ok) throw new Error(`Failed to load SVG: ${src}`);
    return res.text();
  });
  svgMarkupCache.set(src, request);
  return request;
}

type SignatureKeywordMarkProps = {
  ariaHidden?: boolean;
  asset: SignatureStep["wordAsset"];
  className?: string;
  fallbackClassName?: string;
  fallbackStyle?: CSSProperties;
  isActive: boolean;
  keyword: SignatureStep["keyword"];
  replayToken: number;
  scale?: number;
  style?: CSSProperties;
};

function SignatureKeywordMark({
  ariaHidden = true,
  asset,
  className,
  fallbackClassName,
  fallbackStyle,
  isActive,
  keyword,
  replayToken,
  scale = 1,
  style,
}: SignatureKeywordMarkProps) {
  const markupRef = useRef<HTMLSpanElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const drawAnimationsRef = useRef<JSAnimation[]>([]);
  const blendAnimationRef = useRef<JSAnimation | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [fillSvgMarkup, setFillSvgMarkup] = useState<string | null>(null);
  const fillAsset = asset.endsWith("_stroke.svg") ? asset.replace("_stroke.svg", ".svg") : asset;

  useEffect(() => {
    let alive = true;
    Promise.all([
      loadSvgMarkup(asset).catch(() => null),
      fillAsset === asset ? Promise.resolve<string | null>(null) : loadSvgMarkup(fillAsset).catch(() => null),
    ]).then(([drawMarkup, fillMarkup]) => {
      if (!alive) return;
      setSvgMarkup(drawMarkup);
      setFillSvgMarkup(fillMarkup);
    });
    return () => { alive = false; };
  }, [asset, fillAsset]);

  useLayoutEffect(() => {
    const node = markupRef.current;
    if (!node || !svgMarkup) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldAnimate = isActive && !reduceMotion && replayToken !== 0;
    const parser = new DOMParser();
    const parseViewport = (svgEl: SVGSVGElement) => {
      const viewBoxValue = svgEl.getAttribute("viewBox");
      if (viewBoxValue) {
        const values = viewBoxValue
          .trim()
          .split(/[\s,]+/)
          .map((part) => Number.parseFloat(part));
        if (values.length === 4 && values.every((value) => Number.isFinite(value))) {
          return { x: values[0], y: values[1], width: values[2], height: values[3] };
        }
      }
      const width = Number.parseFloat(svgEl.getAttribute("width") ?? "0") || 0;
      const height = Number.parseFloat(svgEl.getAttribute("height") ?? "0") || 0;
      return { x: 0, y: 0, width, height };
    };
    const nearlyEqual = (left: number, right: number) => Math.abs(left - right) <= 0.01;

    let shouldUseFillMarkup = false;
    let parsedFillPaths: SVGPathElement[] = [];
    const drawDoc = parser.parseFromString(svgMarkup, "image/svg+xml");
    const drawSvg = drawDoc.querySelector("svg");
    if (drawSvg instanceof SVGSVGElement && fillSvgMarkup) {
      const fillDoc = parser.parseFromString(fillSvgMarkup, "image/svg+xml");
      const fillSvg = fillDoc.querySelector("svg");
      if (fillSvg instanceof SVGSVGElement) {
        const drawViewport = parseViewport(drawSvg);
        const fillViewport = parseViewport(fillSvg);
        shouldUseFillMarkup =
          drawViewport.width > 0 &&
          fillViewport.width > 0 &&
          nearlyEqual(drawViewport.x, fillViewport.x) &&
          nearlyEqual(drawViewport.y, fillViewport.y) &&
          nearlyEqual(drawViewport.width, fillViewport.width) &&
          nearlyEqual(drawViewport.height, fillViewport.height);
        if (shouldUseFillMarkup) {
          parsedFillPaths = Array.from(fillDoc.querySelectorAll<SVGPathElement>("path"));
        }
      }
    }

    const stopAnimations = () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      drawAnimationsRef.current.forEach((animation) => animation.cancel());
      blendAnimationRef.current?.cancel();
      drawAnimationsRef.current = [];
      blendAnimationRef.current = null;
    };

    stopAnimations();

    // 애니메이션 없이 완성 상태로 표시
    if (!shouldAnimate) {
      node.innerHTML = shouldUseFillMarkup ? (fillSvgMarkup ?? svgMarkup) : svgMarkup;
      const staticSvg = node.querySelector("svg");
      if (!(staticSvg instanceof SVGSVGElement)) return stopAnimations;

      const staticPaths = Array.from(staticSvg.querySelectorAll<SVGPathElement>("path"));
      if (!staticPaths.length) return stopAnimations;

      staticSvg.setAttribute("focusable", "false");
      staticSvg.setAttribute("aria-hidden", "true");
      staticSvg.style.cssText = "display:block;width:100%;height:auto;overflow:visible";

      const staticFillPaths = staticPaths.filter((path) => {
        const fill = path.getAttribute("fill");
        return Boolean(fill && fill.toLowerCase() !== "none");
      });
      const visiblePaths = staticFillPaths.length ? staticFillPaths : staticPaths;

      staticPaths.forEach((path) => {
        const isFillPath = visiblePaths.includes(path);
        path.setAttribute("fill", isFillPath ? "currentColor" : "none");
        path.setAttribute("stroke", "none");
        path.style.fillOpacity = isFillPath ? "1" : "0";
        path.style.strokeOpacity = "0";
      });
      return stopAnimations;
    }

    node.innerHTML = svgMarkup;
    const svg = node.querySelector("svg");
    if (!(svg instanceof SVGSVGElement)) return stopAnimations;

    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
    if (!paths.length) return stopAnimations;

    svg.setAttribute("focusable", "false");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "display:block;width:100%;height:auto;overflow:visible";

    const fillSourcePaths = paths.filter((path) => {
      const fill = path.getAttribute("fill");
      return Boolean(fill && fill.toLowerCase() !== "none");
    });
    const strokeSourcePaths = paths.filter((path) => {
      const stroke = path.getAttribute("stroke");
      const fill = path.getAttribute("fill");
      return Boolean(stroke && stroke.toLowerCase() !== "none" && (!fill || fill.toLowerCase() === "none"));
    });
    const drawSourcePaths = strokeSourcePaths.length ? strokeSourcePaths : (fillSourcePaths.length ? fillSourcePaths : paths);
    let finalFillPaths: SVGPathElement[] = fillSourcePaths.length ? fillSourcePaths : paths;

    if (shouldUseFillMarkup && parsedFillPaths.length) {
      const fillOnlyPaths = parsedFillPaths.filter((path) => {
        const fill = path.getAttribute("fill");
        return Boolean(fill && fill.toLowerCase() !== "none");
      });
      finalFillPaths = fillOnlyPaths.length ? fillOnlyPaths : parsedFillPaths;
    }

    const svgNamespace = "http://www.w3.org/2000/svg";
    const viewBox = svg.viewBox?.baseVal;
    const viewWidth =
      viewBox?.width && viewBox.width > 0 ? viewBox.width : Number.parseFloat(svg.getAttribute("width") ?? "50") || 50;
    const viewHeight =
      viewBox?.height && viewBox.height > 0 ? viewBox.height : Number.parseFloat(svg.getAttribute("height") ?? "30") || 30;
    const maskX = viewBox?.x ?? 0;
    const maskY = viewBox?.y ?? 0;
    const perStrokeDuration = 170;
    const perStrokeGap = 60;
    const drawDelay = 0;
    const maskId = `signature-ink-mask-${replayToken}`;
    const isDualStartWord = asset.endsWith("_stroke.svg");
    const splitX = maskX + viewWidth * 0.5;

    const defs = svg.querySelector("defs") ?? document.createElementNS(svgNamespace, "defs");
    if (!defs.parentNode) svg.insertBefore(defs, svg.firstChild);

    const mask = document.createElementNS(svgNamespace, "mask");
    mask.setAttribute("id", maskId);
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.setAttribute("maskContentUnits", "userSpaceOnUse");
    mask.setAttribute("x", `${maskX}`);
    mask.setAttribute("y", `${maskY}`);
    mask.setAttribute("width", `${viewWidth}`);
    mask.setAttribute("height", `${viewHeight}`);

    const maskBackground = document.createElementNS(svgNamespace, "rect");
    maskBackground.setAttribute("x", `${maskX}`);
    maskBackground.setAttribute("y", `${maskY}`);
    maskBackground.setAttribute("width", `${viewWidth}`);
    maskBackground.setAttribute("height", `${viewHeight}`);
    maskBackground.setAttribute("fill", "white");
    maskBackground.setAttribute("fill-opacity", "0");
    mask.appendChild(maskBackground);

    const fillGroup = document.createElementNS(svgNamespace, "g");
    fillGroup.setAttribute("mask", `url(#${maskId})`);
    fillGroup.setAttribute("opacity", "1");

    const maskEntries: Array<{ path: SVGPathElement; lane: 0 | 1 }> = [];

    finalFillPaths.forEach((sourcePath) => {
      const fillPath = sourcePath.cloneNode(true) as SVGPathElement;
      fillPath.setAttribute("fill", "currentColor");
      fillPath.setAttribute("stroke", "none");
      fillGroup.appendChild(fillPath);

    });

    drawSourcePaths.forEach((sourcePath) => {
      const strokeWidth = Number.parseFloat(sourcePath.getAttribute("stroke-width") ?? "1") || 1;
      const brushWidth = Math.max(strokeWidth * 18, viewWidth * 0.24);
      let lane: 0 | 1 = 0;

      if (isDualStartWord) {
        try {
          const bbox = sourcePath.getBBox();
          const centerX = bbox.x + bbox.width / 2;
          lane = centerX >= splitX ? 1 : 0;
        } catch {
          lane = 0;
        }
      }

      const maskPath = sourcePath.cloneNode(true) as SVGPathElement;
      maskPath.setAttribute("fill", "none");
      maskPath.setAttribute("stroke", "white");
      maskPath.setAttribute("stroke-width", `${brushWidth}`);
      maskPath.setAttribute("stroke-linecap", "round");
      maskPath.setAttribute("stroke-linejoin", "round");
      maskPath.setAttribute("vector-effect", "non-scaling-stroke");
      mask.appendChild(maskPath);
      maskEntries.push({ path: maskPath, lane });
    });

    paths.forEach((path) => path.remove());
    defs.appendChild(mask);
    svg.appendChild(fillGroup);

    const maskPaths = maskEntries.map((entry) => entry.path);
    const maskDrawables = createDrawable(maskPaths, 0, 0);
    const laneSteps: [number, number] = [0, 0];
    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      drawAnimationsRef.current = maskDrawables.map((maskDrawable, index) => {
        const lane = maskEntries[index]?.lane ?? 0;
        const delay = isDualStartWord
          ? drawDelay + laneSteps[lane] * perStrokeGap
          : drawDelay + index * perStrokeGap;
        if (isDualStartWord) laneSteps[lane] += 1;

        return animate(maskDrawable, {
          draw: "0 1",
          ease: "outQuad",
          duration: perStrokeDuration,
          delay,
        });
      });
    });

    return stopAnimations;
  }, [fillSvgMarkup, isActive, keyword, replayToken, svgMarkup]);

  const baseStyle: CSSProperties = scale === 1
    ? (style ?? {})
    : {
      ...(style ?? {}),
      transform: `${style?.transform ? `${style.transform} ` : ""}scale(${scale})`,
      transformOrigin: "left center",
    };

  return (
    <span aria-hidden={ariaHidden} className={className} style={baseStyle}>
      {svgMarkup ? (
        <span ref={markupRef} className="block w-full" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
      ) : (
        <span className={fallbackClassName} style={fallbackStyle}>{keyword}</span>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SignatureSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sceneViewportRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const planetRefs = useRef<Array<HTMLDivElement | null>>([]);
  const prevStepRef = useRef(0);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const currentStepRef = useRef(0);
  const isBusyRef = useRef(false);
  const pendingStepRef = useRef<number | null>(null);
  const isCoarsePointerRef = useRef(false);
  const onStepSettledRef = useRef<((step: number) => void) | null>(null);
  const replayHistoryRef = useRef<{ step: number; at: number }>({ step: -1, at: Number.NEGATIVE_INFINITY });
  const [activeStep, setActiveStep] = useState(0);
  const [wordReplay, setWordReplay] = useState<{ step: number; token: number }>({ step: -1, token: 0 });

  const replayKeyword = useCallback((step: number) => {
    setWordReplay((prev) => ({ step, token: prev.token + 1 }));
  }, []);

  const fireKeywordReplay = useCallback((stepHint?: number) => {
    const step = stepHint ?? currentStepRef.current;
    const now = performance.now();
    const recent = replayHistoryRef.current;
    if (recent.step === step && now - recent.at < 420) return false;
    replayHistoryRef.current = { step, at: now };
    replayKeyword(step);
    return true;
  }, [replayKeyword]);

  const stopTl = useCallback(() => {
    tlRef.current?.kill();
    tlRef.current = null;
  }, []);

  const clamp = useCallback((value: number) => Math.max(0, Math.min(STEP_COUNT - 1, value)), []);

  const setStepInstant = useCallback((step: number, replayWord = false) => {
    stopTl();
    const index = clamp(step);
    contentRefs.current.forEach((node, i) => {
      if (node) gsap.set(node, { autoAlpha: i === index ? 1 : 0, y: 0 });
    });
    currentStepRef.current = index;
    prevStepRef.current = index;
    if (replayWord) fireKeywordReplay(index);
    setActiveStep(index);
  }, [clamp, fireKeywordReplay, stopTl]);

  const animateToStep = useCallback((step: number, onComplete?: () => void) => {
    const index = clamp(step);
    const previous = prevStepRef.current;
    if (index === previous) return false;

    stopTl();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const direction = index > previous ? 1 : -1;
    const previousNode = contentRefs.current[previous];
    const nextNode = contentRefs.current[index];
    if (!previousNode || !nextNode) return false;

    contentRefs.current.forEach((node, i) => {
      if (node && i !== previous && i !== index) gsap.set(node, { autoAlpha: 0 });
    });

    gsap.set(nextNode, { autoAlpha: 0, y: reducedMotion ? 0 : 20 * direction });
    fireKeywordReplay(index);
    setActiveStep(index);
    prevStepRef.current = index;

    tlRef.current = gsap.timeline({
      defaults: { ease: reducedMotion ? "none" : "power3.out", force3D: true, overwrite: "auto" },
      onComplete: () => { tlRef.current = null; onComplete?.(); },
    });

    tlRef.current
      .to(previousNode, { autoAlpha: 0, y: reducedMotion ? 0 : -14 * direction, duration: reducedMotion ? 0.1 : 0.3 }, 0)
      .to(nextNode, { autoAlpha: 1, y: 0, duration: reducedMotion ? 0.1 : 0.52 }, reducedMotion ? 0 : 0.08);

    return true;
  }, [clamp, fireKeywordReplay, stopTl]);

  const transitionToStep = useCallback((step: number) => {
    const index = clamp(step);
    if (index === currentStepRef.current) {
      pendingStepRef.current = null;
      return false;
    }

    if (isBusyRef.current) {
      pendingStepRef.current = index;
      return false;
    }

    const completeTransition = () => {
      const queuedStep = pendingStepRef.current;
      pendingStepRef.current = null;

      if (queuedStep !== null && queuedStep !== currentStepRef.current) {
        currentStepRef.current = queuedStep;
        const startedQueuedAnimation = animateToStep(queuedStep, completeTransition);
        if (startedQueuedAnimation) return;
      }

      onStepSettledRef.current?.(currentStepRef.current);
      isBusyRef.current = false;
    };

    isBusyRef.current = true;
    currentStepRef.current = index;

    const startedAnimation = animateToStep(index, completeTransition);
    if (!startedAnimation) {
      pendingStepRef.current = null;
      isBusyRef.current = false;
    }

    return startedAnimation;
  }, [animateToStep, clamp]);

  const handlePlanetClick = useCallback((targetStep: number) => {
    const index = clamp(targetStep);
    if (index === currentStepRef.current) return;

    transitionToStep(index);
  }, [clamp, transitionToStep]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const sceneViewport = sceneViewportRef.current;
    if (!section || !sceneViewport) return;

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    isCoarsePointerRef.current = isCoarsePointer;
    currentStepRef.current = 0;
    isBusyRef.current = false;
    pendingStepRef.current = null;
    setStepInstant(0);

    const COOLDOWN_MS = 520;
    const SAFETY_MS = 900;
    const LOCK_TRIGGER_SLOP_PX = 2;
    const WHEEL_THRESHOLD = 40;
    const WHEEL_IDLE_MS = 160;
    const EXIT_SUPPRESSION_MS = 900;
    let isStepping = false;
    let isLocked = false;
    let lastScrollY = window.scrollY;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;
    let cooldownTimer: ReturnType<typeof setTimeout> | null = null;
    let wheelIdleTimer: ReturnType<typeof setTimeout> | null = null;
    let scrollRafId: number | null = null;
    let syncRafId: number | null = null;
    let exitRafId: number | null = null;
    let wheelDelta = 0;
    let wheelGestureConsumed = false;
    let suppressLockUntil = 0;
    const clearSafety = () => { if (safetyTimer) clearTimeout(safetyTimer); };
    const clearCooldown = () => { if (cooldownTimer) clearTimeout(cooldownTimer); };
    const captureOnly = { capture: true };
    const capturePassive = { capture: true, passive: true };
    const captureActive = { capture: true, passive: false };
    const clearWheelGesture = () => {
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      wheelIdleTimer = null;
      wheelDelta = 0;
      wheelGestureConsumed = false;
    };
    const getSectionTop = () => Math.round(section.getBoundingClientRect().top + window.scrollY);
    const getSectionBottom = () => getSectionTop() + section.offsetHeight;
    const setLockState = (locked: boolean, mode: "idle" | "locked") => {
      section.dataset.sceneLocked = locked ? "true" : "false";
      section.dataset.sceneMode = mode;
      sceneViewport.dataset.locked = locked ? "true" : "false";
    };
    const cancelExitAnimation = () => {
      if (exitRafId !== null) {
        window.cancelAnimationFrame(exitRafId);
        exitRafId = null;
      }
    };

    const startCooldown = () => {
      isStepping = true;
      clearCooldown();
      clearSafety();
      cooldownTimer = setTimeout(() => { isStepping = false; }, COOLDOWN_MS);
      safetyTimer = setTimeout(() => {
        isBusyRef.current = false;
        pendingStepRef.current = null;
        isStepping = false;
      }, SAFETY_MS);
    };

    let touchStartY = 0;
    const scheduleWheelReset = () => {
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      wheelIdleTimer = setTimeout(() => {
        wheelDelta = 0;
        wheelGestureConsumed = false;
      }, WHEEL_IDLE_MS);
    };
    const normalizeWheelDelta = (event: WheelEvent) => {
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
      return event.deltaY;
    };
    const syncLockedScroll = () => {
      if (!isLocked) return;
      const target = getSectionTop();
      if (Math.abs(window.scrollY - target) <= 1) return;
      if (syncRafId !== null) window.cancelAnimationFrame(syncRafId);
      syncRafId = window.requestAnimationFrame(() => {
        syncRafId = null;
        window.scrollTo({ top: target, behavior: "instant" });
      });
    };
    const enableScrollLock = () => {
      if (isLocked) return;
      isLocked = true;
      setLockState(true, "locked");
      getLenis()?.stop();
      clearWheelGesture();
      syncLockedScroll();
      document.addEventListener("wheel", onWheel, captureActive);
      document.addEventListener("touchstart", onTouchStart, capturePassive);
      document.addEventListener("touchmove", onTouchMove, captureActive);
      document.addEventListener("touchend", onTouchEnd, capturePassive);
      document.addEventListener("touchcancel", onTouchCancel, capturePassive);
    };
    const disableScrollLock = () => {
      if (!isLocked) return;
      isLocked = false;
      setLockState(false, "idle");
      if (syncRafId !== null) {
        window.cancelAnimationFrame(syncRafId);
        syncRafId = null;
      }
      clearSafety();
      clearCooldown();
      clearWheelGesture();
      isStepping = false;
      isBusyRef.current = false;
      pendingStepRef.current = null;
      document.removeEventListener("wheel", onWheel, captureOnly);
      document.removeEventListener("touchstart", onTouchStart, captureOnly);
      document.removeEventListener("touchmove", onTouchMove, captureOnly);
      document.removeEventListener("touchend", onTouchEnd, captureOnly);
      document.removeEventListener("touchcancel", onTouchCancel, captureOnly);
    };
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const animateExitScroll = (target: number) => {
      cancelExitAnimation();

      const startScroll = window.scrollY;
      const delta = target - startScroll;
      if (Math.abs(delta) <= 1) {
        window.scrollTo({ top: target, behavior: "instant" });
        getLenis()?.start();
        return;
      }

      const startedAt = performance.now();
      const durationMs = 720;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / durationMs);
        const eased = easeOutCubic(progress);
        const nextScroll = Math.round(startScroll + delta * eased);
        window.scrollTo({ top: nextScroll, behavior: "instant" });

        if (progress < 1) {
          exitRafId = window.requestAnimationFrame(tick);
          return;
        }

        exitRafId = null;
        window.scrollTo({ top: target, behavior: "instant" });
        getLenis()?.start();
      };

      exitRafId = window.requestAnimationFrame(tick);
    };
    const exitScene = (direction: "forward" | "backward", impulse = 0) => {
      suppressLockUntil = performance.now() + EXIT_SUPPRESSION_MS;
      disableScrollLock();

      const signedImpulse = direction === "forward" ? 1 : -1;
      const rawCarry = Math.abs(impulse) > 0 ? Math.abs(impulse) : window.innerHeight * 0.18;
      const carryDistance = Math.min(rawCarry, window.innerHeight * 0.75);
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const target = Math.max(0, Math.min(maxScroll, Math.round(window.scrollY + carryDistance * signedImpulse)));

      animateExitScroll(target);
    };
    const lockScene = (entryDirection: "forward" | "backward") => {
      enableScrollLock();
      const sectionTop = getSectionTop();
      window.scrollTo({ top: sectionTop, behavior: "instant" });
      lastScrollY = sectionTop;

      if (entryDirection === "forward") {
        if (currentStepRef.current !== 0) setStepInstant(0, false);
        return;
      }

      if (currentStepRef.current !== STEP_COUNT - 1) setStepInstant(STEP_COUNT - 1, false);
    };

    const onWheel = (e: WheelEvent) => {
      if (!isLocked) return;
      if (e.cancelable) e.preventDefault();

      const delta = normalizeWheelDelta(e);
      if (Math.abs(delta) < 0.5) return;

      scheduleWheelReset();
      wheelDelta += delta;

      if (wheelGestureConsumed || Math.abs(wheelDelta) < WHEEL_THRESHOLD) return;
      wheelGestureConsumed = true;
      stepScene(wheelDelta > 0 ? "forward" : "backward", Math.abs(wheelDelta));
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY - e.changedTouches[0].clientY;
      touchStartY = 0;
      if (Math.abs(delta) < (isCoarsePointer ? 15 : 5)) return;
      stepScene(delta > 0 ? "forward" : "backward", Math.abs(delta));
    };
    const onTouchCancel = () => {
      touchStartY = 0;
    };
    const stepScene = (direction: "forward" | "backward", impulse = 0) => {
      if (!isLocked || isStepping || isBusyRef.current) return;

      const next =
        direction === "forward"
          ? currentStepRef.current + 1
          : currentStepRef.current - 1;

      if (next < 0 || next > STEP_COUNT - 1) {
        exitScene(direction, impulse);
        return;
      }

      const started = transitionToStep(next);
      if (started) startCooldown();
    };
    const maybeLockScene = () => {
      const currentY = window.scrollY;

      if (isLocked) {
        syncLockedScroll();
        lastScrollY = getSectionTop();
        return;
      }

      if (performance.now() < suppressLockUntil) {
        lastScrollY = currentY;
        return;
      }

      const direction =
        currentY > lastScrollY + 1
          ? "forward"
          : currentY < lastScrollY - 1
            ? "backward"
            : null;
      const sectionTop = getSectionTop();
      const rect = section.getBoundingClientRect();
      const sectionVisible = rect.bottom > 0 && rect.top < window.innerHeight;
      const crossedFromAbove =
        direction === "forward" &&
        lastScrollY < sectionTop - LOCK_TRIGGER_SLOP_PX &&
        currentY >= sectionTop - LOCK_TRIGGER_SLOP_PX;
      const crossedFromBelow =
        direction === "backward" &&
        lastScrollY > sectionTop + LOCK_TRIGGER_SLOP_PX &&
        currentY <= sectionTop + LOCK_TRIGGER_SLOP_PX;

      if (sectionVisible && (crossedFromAbove || crossedFromBelow)) {
        const fallbackDirection = currentY >= sectionTop ? "forward" : "backward";
        lockScene(direction ?? fallbackDirection);
        return;
      }

      lastScrollY = currentY;
    };
    const handleWindowScroll = () => {
      if (isLocked) {
        syncLockedScroll();
        lastScrollY = getSectionTop();
        return;
      }

      if (scrollRafId !== null) return;
      scrollRafId = window.requestAnimationFrame(() => {
        scrollRafId = null;
        maybeLockScene();
      });
    };
    const handleResize = () => {
      if (isLocked) {
        syncLockedScroll();
        return;
      }
      lastScrollY = window.scrollY;
    };

    const handleSignatureStepRequest = (event: Event) => {
      const detail = (event as CustomEvent<{ step?: number; direction?: "forward" | "backward" }>).detail;
      if (!detail) return;
      if (typeof detail.step === "number") { transitionToStep(clamp(detail.step)); return; }
      if (detail.direction === "forward" || detail.direction === "backward") stepScene(detail.direction);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLocked) return;
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        stepScene("forward");
      } else if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        stepScene("backward");
      }
    };

    section.addEventListener("gonish:signature-step", handleSignatureStepRequest as EventListener);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    onStepSettledRef.current = () => {};
    setLockState(false, "idle");
    maybeLockScene();

    return () => {
      clearSafety();
      clearCooldown();
      clearWheelGesture();
      cancelExitAnimation();
      onStepSettledRef.current = null;
      isCoarsePointerRef.current = false;
      disableScrollLock();
      if (scrollRafId !== null) window.cancelAnimationFrame(scrollRafId);
      if (syncRafId !== null) window.cancelAnimationFrame(syncRafId);
      section.removeEventListener("gonish:signature-step", handleSignatureStepRequest as EventListener);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleWindowScroll);
      window.removeEventListener("resize", handleResize);
      setLockState(false, "idle");
      getLenis()?.start();
      pendingStepRef.current = null;
    };
  }, [animateToStep, clamp, setStepInstant, transitionToStep]);


  return (
    <section ref={sectionRef} data-active-step={activeStep} data-home-section="signature" className="signature-section relative isolate h-[100svh] overflow-hidden">
      <div ref={sceneViewportRef} className="signature-section__scene-viewport absolute inset-0">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 55% at 50% 48%, rgba(243,29,91,0.06) 0%, transparent 100%), radial-gradient(ellipse 35% 30% at 82% 75%, rgba(255,173,197,0.09) 0%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ backgroundImage: "url('/ScrollSection.png')" }}
          />
        </div>

        <div className="signature-section__shell shell relative z-10 flex h-full flex-col lg:py-7">
        {/* Header */}
        <div className="shrink-0 flex items-center gap-3 pb-3">
          <span className="h-px w-10 bg-brand/40" />
          <p className="eyebrow">
            Why{" "}
            <span
              style={{
                fontFamily: "'Snell Roundhand', 'Segoe Script', 'Brush Script MT', 'Apple Chancery', cursive",
                color: "#F31D5B",
                fontSize: "1.8em",
                letterSpacing: "0.01em",
                textTransform: "none",
                opacity: 0.9,
              }}
            >
              Gonish
            </span>
          </p>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-ink/[0.07] to-transparent" />

        {/* Two-column layout */}
        <div className="signature-section__layout flex min-h-0 flex-1 flex-col items-center lg:mt-3 lg:flex-row lg:items-center lg:gap-12 xl:gap-16">

          {/* ── Left: Planet stage ── */}
          <div className="signature-section__stage-shell relative w-full shrink-0 self-center lg:w-[min(100%,min(58vw,700px))] lg:max-w-none lg:pb-0">
            <div ref={stageRef} className="signature-section__stage relative" style={{ aspectRatio: `${VW} / ${VH}` }}>

              {/* Orbit ring SVG */}
              <svg
                viewBox={`0 0 ${VW} ${VH}`}
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <g>
                  <ellipse
                    cx={CX} cy={CY}
                    rx={ORBIT_RX + 38} ry={ORBIT_RY + 20}
                    fill="none" stroke="rgba(243,29,91,0.04)" strokeWidth="28"
                    transform={`rotate(${ORBIT_ROT} ${CX} ${CY})`}
                  />

                  <path d={BACK_ARC} fill="none" stroke="rgba(243,29,91,0.07)" strokeWidth="8" />
                  <path
                    d={BACK_ARC} fill="none"
                    stroke="rgba(243,29,91,0.16)" strokeWidth="1.5"
                    strokeDasharray="9 6" strokeLinecap="round"
                    style={{ animation: "orbitRingFlow 32s linear infinite" }}
                  />

                  <path d={FRONT_ARC} fill="none" stroke="rgba(243,29,91,0.11)" strokeWidth="9" />
                  <path
                    d={FRONT_ARC} fill="none"
                    stroke="rgba(243,29,91,0.30)" strokeWidth="2"
                    strokeDasharray="9 6" strokeLinecap="round"
                    style={{ animation: "orbitRingFlow 32s linear infinite" }}
                  />
                </g>

              </svg>

              {/* Stars — CSS absolute positioned on orbit ring */}
              {steps.map((step, i) => {
                const slot = getSlot(i, activeStep);
                const layout = PLANET_LAYOUT[slot];
                const isActive = slot === "active";
                const floatClass = slot === "right" ? "star-text-float-slow" : "star-text-float";

                return (
                  <div
                    key={step.keyword}
                    ref={(node) => { planetRefs.current[i] = node; }}
                    data-step-target={i}
                    className={`absolute${!isActive ? " cursor-pointer" : ""}`}
                    style={{
                      left: layout.left,
                      top: layout.top,
                      width: ORBIT_STAR_SIZE,
                      height: ORBIT_STAR_SIZE,
                      zIndex: layout.zIndex,
                      opacity: layout.opacity,
                      transform: "translate(-50%, -50%)",
                      transition: "left 0.7s cubic-bezier(0.22,1,0.36,1), top 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.7s cubic-bezier(0.22,1,0.36,1)",
                    }}
                    onClick={!isActive ? () => handlePlanetClick(i) : undefined}
                  >
                    {/* Content scale wrapper — handles perspective + active growth */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        transform: `scale(${layout.contentScale})`,
                        transformOrigin: "center center",
                        transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)",
                      }}
                    >
                      {/* Text centering wrapper — slides up when stick appears */}
                      <span
                        style={{
                          position: "absolute",
                          bottom: isActive ? `calc(100% + ${ORBIT_STICK_HEIGHT} + 0.375rem)` : "calc(100% + 0.75rem)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          transition: "bottom 0.7s cubic-bezier(0.22,1,0.36,1)",
                        }}
                      >
                        <span
                          className={`signature-section__star-label font-display text-[1.65rem] font-bold sm:text-[2.2rem]${!isActive ? ` ${floatClass}` : ""}`}
                          style={{
                            display: "block",
                            lineHeight: 1,
                            letterSpacing: "-0.04em",
                            color: "#F31D5B",
                            textShadow: isActive
                              ? "0 0 24px rgba(243,29,91,0.5), 0 0 8px rgba(255,255,255,0.35)"
                              : "0 0 14px rgba(243,29,91,0.32)",
                            whiteSpace: "nowrap",
                            transition: "text-shadow 0.5s ease",
                          }}
                        >
                          {step.keyword}
                        </span>
                      </span>

                      {/* Shooting-star stick — grows from bottom when active */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "100%",
                          left: "50%",
                          marginLeft: "-0.75px",
                          width: "1.5px",
                          height: ORBIT_STICK_HEIGHT,
                          background: "linear-gradient(to top, rgba(243,29,91,0.55), rgba(243,29,91,0.06))",
                          borderRadius: "1px",
                          transformOrigin: "bottom center",
                          transform: `scaleY(${isActive ? 1 : 0})`,
                          opacity: isActive ? 1 : 0,
                          transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease",
                        }}
                      />

                      {/* Star SVG — center is exactly at orbit point */}
                      <svg
                        viewBox="-20 -20 40 40"
                        style={{
                          width: ORBIT_STAR_SIZE,
                          height: ORBIT_STAR_SIZE,
                          display: "block",
                          overflow: "visible",
                          filter: isActive
                            ? "drop-shadow(0 0 12px rgba(243,29,91,0.8)) drop-shadow(0 0 4px rgba(255,255,255,0.5))"
                            : "drop-shadow(0 0 7px rgba(243,29,91,0.55))",
                          transition: "filter 0.7s ease",
                        }}
                        aria-hidden="true"
                      >
                        <path d="M0,-15 C2.5,-3.5 3.5,-2.5 15,0 C3.5,2.5 2.5,3.5 0,15 C-2.5,3.5 -3.5,2.5 -15,0 C-3.5,-2.5 -2.5,-3.5 0,-15 Z" fill="#F31D5B" />
                        <circle cx="0" cy="0" r="3" fill="rgba(255,240,245,0.9)" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Content panel ── */}
          <div className="signature-section__content-panel relative w-full flex-1 self-center lg:pb-0">
            {steps.map((step, i) => (
              <div
                key={step.keyword}
                ref={(node) => { contentRefs.current[i] = node; }}
                className="signature-section__content-step absolute inset-0 flex flex-col will-change-transform"
              >
                <div className="text-ink/80">
                  <SignatureKeywordMark
                    asset={step.wordAsset}
                    className="signature-section__keyword-mark block w-[clamp(7.8rem,18vw,14.2rem)] max-w-full"
                    fallbackClassName="font-display font-bold leading-none tracking-[-0.04em]"
                    fallbackStyle={{ fontSize: "clamp(3.8rem, 9vw, 8rem)" }}
                    isActive={i === activeStep}
                    keyword={step.keyword}
                    replayToken={i === activeStep && wordReplay.step === i ? wordReplay.token : 0}
                    scale={step.keywordScale}
                    style={{ color: "rgba(20,16,20,0.82)" }}
                  />
                </div>

                <h2
                  className="signature-section__headline mt-3 whitespace-pre-line font-display leading-[1.1] tracking-[-0.04em] text-ink"
                  style={{ fontSize: "clamp(1.15rem, 2.1vw, 2rem)" }}
                >
                  {step.headline}
                </h2>

                <p className="signature-section__body mt-3 max-w-lg text-[0.87rem] leading-[1.78] text-ink-muted sm:text-[0.92rem]">
                  {step.body}
                </p>

                <div className="signature-section__points mt-4 flex flex-col gap-2">
                  {step.points.map((point) => (
                    <div key={point} className="flex items-start gap-2.5">
                      <span className="mt-[0.38rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand/55" />
                      <p className="signature-section__point text-[0.80rem] leading-[1.5] text-ink/50">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Progress dots — right edge ── */}
        <div className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-4 lg:flex xl:right-7">
          {steps.map((step, i) => {
            const isActive = i === activeStep;
            return (
              <div key={step.keyword} className="flex items-center gap-2.5">
                <span
                  className="text-[0.68rem] uppercase tracking-[0.22em] transition-all duration-500"
                  style={{ color: isActive ? "#F31D5B" : "rgba(20,16,20,0.20)" }}
                >
                  {step.keyword}
                </span>
                <div className="relative">
                  <div
                    className="h-1.5 w-1.5 rounded-full transition-all duration-500"
                    style={{
                      background: isActive ? "#F31D5B" : "rgba(20,16,20,0.12)",
                      boxShadow: isActive ? "0 0 10px rgba(243,29,91,0.45)" : "none",
                      transform: isActive ? "scale(1.4)" : "scale(1)",
                    }}
                  />
                  {isActive && <div className="absolute inset-0 h-1.5 w-1.5 animate-ping rounded-full bg-brand/25" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Mobile progress dots ── */}
        <div className="signature-section__mobile-progress pointer-events-none absolute left-0 right-0 flex justify-center gap-2 lg:hidden">
          {steps.map((step, i) => (
            <div
              key={step.keyword}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === activeStep ? "1.5rem" : "0.32rem",
                height: "0.32rem",
                background: i === activeStep ? "#F31D5B" : "rgba(20,16,20,0.14)",
              }}
            />
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
