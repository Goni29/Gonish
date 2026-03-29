"use client";

import { animate, createDrawable, type JSAnimation } from "animejs";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "@/components/layout/SmoothScroll";

gsap.registerPlugin(ScrollTrigger, Observer);

const steps = [
  {
    keyword: "품격",
    wordAsset: "/1st_word_stroke.svg",
    keywordScale: 1,
    headline: "첫 화면만으로도,\n브랜드의 수준은 조용히 전달됩니다.",
    body: "고객은 설명을 읽기 전에 분위기를 먼저 받아들입니다. 정제된 화면, 균형 잡힌 정보, 섬세한 디테일은 브랜드를 더 신뢰할 만한 선택으로 보이게 합니다.",
    points: ['"여기는 다르다"는 조용한 확신', "가격보다 가치가 먼저 느껴지는 인상", "오래 기억되고 다시 찾게 되는 브랜드"],
  },
  {
    keyword: "맞춤",
    wordAsset: "/2nd_word_stroke.svg",
    keywordScale: 1.1,
    headline: "브랜드의 결만 말씀해 주세요.\n나머지는 Gonish가 맞춥니다.",
    body: "기획서와 전문 용어 없이도 충분합니다. 원하는 분위기와 목표를 편하게 이야기하시면, 필요한 구조와 표현은 Gonish가 정교하게 맞춰드립니다.",
    points: ["어려운 용어 없이도 자연스러운 진행", "취향과 목표가 세심하게 반영되는 과정", "피드백이 가볍고 매끄럽게 이어지는 경험"],
  },
  {
    keyword: "속도",
    wordAsset: "/3rd_word_stroke.svg",
    keywordScale: 1.11,
    headline: "늦지 않게, 가볍지 않게.\n완성도 높은 속도로 오픈합니다.",
    body: "런칭이 늦어질수록 기회도 함께 미뤄집니다. 빠른 초안과 명확한 진행 공유로 불확실성을 줄이고, 약속한 일정 안에서 품질을 놓치지 않는 제작을 지향합니다.",
    points: ["빠른 초안으로 초반 감도를 먼저 확인", "과정이 투명해 일정이 흔들리지 않는 진행", "오픈 이후까지 안정감을 남기는 마무리"],
  },
] as const;

const STEP_COUNT = steps.length;
const PIN_SCROLL = STEP_COUNT * 380;

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
// Planet sizes in SVG units at reference container (700px = VW)
// clamp(14rem,30vw,22rem) → 352px at 700px container → 352 SVG units
// clamp(4rem,7vw,5.5rem)  →  88px at 700px container →  88 SVG units
const ACTIVE_HALF = 176;
const SMALL_HALF  = 44;

// ── Planet layout — positions computed from orbit ring ────────────────────────
type PlanetSlot = "active" | "left" | "right";

const PLANET_LAYOUT: Record<PlanetSlot, { left: string; top: string; size: string; zIndex: number; opacity: number }> = {
  active: { ...toPct(getOrbitPoint(90)),  size: "clamp(14rem, 30vw, 22rem)", zIndex: 3, opacity: 1 },
  left:   { ...toPct(getOrbitPoint(205)), size: "clamp(4rem, 7vw, 5.5rem)",  zIndex: 2, opacity: 0.88 },
  right:  { ...toPct(getOrbitPoint(335)), size: "clamp(4rem, 7vw, 5.5rem)",  zIndex: 2, opacity: 0.88 },
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

  const mergedStyle: CSSProperties = scale === 1
    ? (style ?? {})
    : {
      ...(style ?? {}),
      transform: `${style?.transform ? `${style.transform} ` : ""}scale(${scale})`,
      transformOrigin: "left center",
    };

  return (
    <span aria-hidden={ariaHidden} className={className} style={mergedStyle}>
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
  const stageRef = useRef<HTMLDivElement | null>(null);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const planetRefs = useRef<Array<HTMLDivElement | null>>([]);
  const maskPlanetRefs = useRef<Array<SVGImageElement | null>>([]);
  const prevStepRef = useRef(0);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const currentStepRef = useRef(0);
  const isBusyRef = useRef(false);
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

  const handlePlanetClick = useCallback((targetStep: number) => {
    if (isBusyRef.current || targetStep === currentStepRef.current) return;
    isBusyRef.current = true;
    currentStepRef.current = targetStep;
    animateToStep(targetStep, () => { isBusyRef.current = false; });
  }, [animateToStep]);

  const syncOrbitMaskToPlanets = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const stageRect = stage.getBoundingClientRect();
    if (!stageRect.width || !stageRect.height) return;

    planetRefs.current.forEach((planet, index) => {
      const maskPlanet = maskPlanetRefs.current[index];
      if (!planet || !maskPlanet) return;

      const rect = planet.getBoundingClientRect();
      const x = ((rect.left - stageRect.left) / stageRect.width) * VW;
      const y = ((rect.top - stageRect.top) / stageRect.height) * VH;
      const width = (rect.width / stageRect.width) * VW;
      const height = (rect.height / stageRect.height) * VH;

      maskPlanet.setAttribute("x", x.toFixed(3));
      maskPlanet.setAttribute("y", y.toFixed(3));
      maskPlanet.setAttribute("width", width.toFixed(3));
      maskPlanet.setAttribute("height", height.toFixed(3));
    });
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    currentStepRef.current = 0;
    isBusyRef.current = false;
    let trigger: ScrollTrigger;

    setStepInstant(0);

    const goTo = (step: number) => {
      if (step === currentStepRef.current) return;
      isBusyRef.current = true;
      currentStepRef.current = step;
      animateToStep(step, () => { isBusyRef.current = false; });
    };

    const snapTo = (step: number) => {
      currentStepRef.current = step;
      isBusyRef.current = false;
      setStepInstant(step, true);
    };

    const scrollTo = (position: number) => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(position, { immediate: true });
      else window.scrollTo(0, position);
      ScrollTrigger.update();
    };

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const observer = Observer.create({
      type: "wheel,touch",
      preventDefault: !isTouch,
      tolerance: isTouch ? 30 : 10,
      onDown: () => {
        if (isBusyRef.current) return;
        if (currentStepRef.current >= STEP_COUNT - 1) { observer.disable(); scrollTo(trigger.end + 1); return; }
        goTo(currentStepRef.current + 1);
      },
      onUp: () => {
        if (isBusyRef.current) return;
        if (currentStepRef.current <= 0) { observer.disable(); scrollTo(Math.max(trigger.start - 1, 0)); return; }
        goTo(currentStepRef.current - 1);
      },
    });
    observer.disable();

    const context = gsap.context(() => {
      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${PIN_SCROLL}`,
        pin: true,
        pinSpacing: true,
        pinType: "transform",
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: () => { snapTo(0); observer.enable(); },
        onEnterBack: () => { snapTo(STEP_COUNT - 1); observer.enable(); },
        onLeave: () => { setStepInstant(STEP_COUNT - 1); observer.disable(); },
        onLeaveBack: () => { setStepInstant(0); observer.disable(); },
      });
    }, section);

    return () => {
      observer.kill();
      context.revert();
    };
  }, [animateToStep, setStepInstant]);

  useLayoutEffect(() => {
    let frame = 0;
    let start = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 180 : 900;

    syncOrbitMaskToPlanets();

    const tick = (timestamp: number) => {
      if (!start) start = timestamp;
      syncOrbitMaskToPlanets();
      if (timestamp - start < duration) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [activeStep, syncOrbitMaskToPlanets]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;

    let frame = 0;
    const queueSync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncOrbitMaskToPlanets);
    };

    const observer = new ResizeObserver(queueSync);
    observer.observe(stage);
    queueSync();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [syncOrbitMaskToPlanets]);

  return (
    <section ref={sectionRef} className="relative isolate h-[100svh] overflow-hidden">
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

      <div className="shell relative z-10 flex h-full flex-col py-5 lg:py-7">
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
        <div className="mt-3 flex min-h-0 flex-1 flex-col items-center gap-5 lg:flex-row lg:items-center lg:gap-12 xl:gap-16">

          {/* ── Left: Planet stage ── */}
          <div
            className="relative shrink-0 self-center pb-4 lg:pb-0"
            style={{ width: "min(100%, min(58vw, 700px))" }}
          >
            <div ref={stageRef} className="relative" style={{ aspectRatio: `${VW} / ${VH}` }}>

              {/* Orbit ring SVG */}
              <svg
                viewBox={`0 0 ${VW} ${VH}`}
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <defs>
                  <mask
                    id="orbit-planet-mask"
                    maskUnits="userSpaceOnUse"
                    maskContentUnits="userSpaceOnUse"
                    style={{ maskType: "luminance" }}
                  >
                    <rect x="0" y="0" width={VW} height={VH} fill="white" />
                    {steps.map((step, index) => (
                      <image
                        key={`orbit-mask-${step.keyword}`}
                        ref={(node) => { maskPlanetRefs.current[index] = node; }}
                        href="/Planet_main_black.png"
                        width="0"
                        height="0"
                        preserveAspectRatio="none"
                      />
                    ))}
                  </mask>
                </defs>

                <g mask="url(#orbit-planet-mask)">
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

              {/* Planets — CSS absolute positioned on orbit ring */}
              {steps.map((step, i) => {
                const slot = getSlot(i, activeStep);
                const layout = PLANET_LAYOUT[slot];
                const isActive = slot === "active";

                return (
                  <div
                    key={step.keyword}
                    ref={(node) => { planetRefs.current[i] = node; }}
                    className={`absolute transition-[left,top,width,height,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]${!isActive ? " cursor-pointer" : ""}`}
                    style={{
                      left: layout.left,
                      top: layout.top,
                      width: layout.size,
                      height: layout.size,
                      opacity: layout.opacity,
                      transform: "translate(-50%, -50%)",
                      containerType: "inline-size",
                      zIndex: layout.zIndex,
                    }}
                    onClick={!isActive ? () => handlePlanetClick(i) : undefined}
                  >
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span
                          className="font-display font-bold leading-none tracking-[-0.04em]"
                          style={{
                            fontSize: "14.5cqw",
                            color: "#F31D5B",
                            textShadow: isActive
                              ? "0 0 18px rgba(243,29,91,0.35), 0 0 6px rgba(255,255,255,0.5)"
                              : "0 0 6px rgba(243,29,91,0.25)",
                            transition: "text-shadow 0.7s cubic-bezier(0.22,1,0.36,1)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {step.keyword}
                        </span>
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/Planet_main.svg"
                      alt=""
                      className="pointer-events-none h-full w-full"
                      style={{
                        filter: isActive
                          ? "drop-shadow(0 0 28px rgba(243,29,91,0.28)) drop-shadow(0 6px 16px rgba(243,29,91,0.18))"
                          : "drop-shadow(0 0 8px rgba(243,29,91,0.12))",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Content panel ── */}
          <div className="relative w-full flex-1 self-center" style={{ minHeight: "clamp(220px, 38vh, 360px)" }}>
            {steps.map((step, i) => (
              <div
                key={step.keyword}
                ref={(node) => { contentRefs.current[i] = node; }}
                className="absolute inset-0 flex flex-col justify-center will-change-transform"
              >
                <div className="text-ink/80">
                  <SignatureKeywordMark
                    asset={step.wordAsset}
                    className="block w-[clamp(7.8rem,18vw,14.2rem)] max-w-full"
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
                  className="mt-3 whitespace-pre-line font-display leading-[1.1] tracking-[-0.04em] text-ink"
                  style={{ fontSize: "clamp(1.15rem, 2.1vw, 2rem)" }}
                >
                  {step.headline}
                </h2>

                <p className="mt-3 max-w-lg text-[0.87rem] leading-[1.78] text-ink-muted sm:text-[0.92rem]">
                  {step.body}
                </p>

                <div className="mt-4 space-y-2">
                  {step.points.map((point) => (
                    <div key={point} className="flex items-start gap-2.5">
                      <span className="mt-[0.38rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand/55" />
                      <p className="text-[0.80rem] leading-[1.5] text-ink/50">{point}</p>
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
        <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-2 lg:hidden">
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
    </section>
  );
}
