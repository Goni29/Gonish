"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type ShootingStarConfig = {
  delay: string;
  duration: string;
  left: string;
  opacity: number;
  scale: number;
  top: string;
  travelX: string;
  travelY: string;
  width: string;
};

const BASE_SHOOTING_STARS: ShootingStarConfig[] = [
  { left: "4%", top: "30%", width: "9.5rem", duration: "5.4s", delay: "-12.4s", scale: 1.08, travelX: "-3.7rem", travelY: "5rem", opacity: 0.76 },
  { left: "13%", top: "64%", width: "8.75rem", duration: "4.8s", delay: "-4.2s", scale: 0.92, travelX: "-3.4rem", travelY: "4.5rem", opacity: 0.58 },
  { left: "22%", top: "18%", width: "7.75rem", duration: "4.4s", delay: "-8.4s", scale: 0.8, travelX: "-3rem", travelY: "4rem", opacity: 0.52 },
  { left: "28%", top: "78%", width: "10.25rem", duration: "6.1s", delay: "-14.8s", scale: 1.18, travelX: "-4.4rem", travelY: "6rem", opacity: 0.54 },
  { left: "39%", top: "28%", width: "8.5rem", duration: "5s", delay: "-2.6s", scale: 0.88, travelX: "-3.4rem", travelY: "4.5rem", opacity: 0.48 },
  { left: "48%", top: "58%", width: "9rem", duration: "5.7s", delay: "-10.2s", scale: 1, travelX: "-3.9rem", travelY: "5.25rem", opacity: 0.44 },
  { left: "56%", top: "12%", width: "7.5rem", duration: "4s", delay: "-6.8s", scale: 0.76, travelX: "-2.7rem", travelY: "3.75rem", opacity: 0.5 },
  { left: "63%", top: "74%", width: "10.75rem", duration: "6.4s", delay: "-15.5s", scale: 1.2, travelX: "-4.6rem", travelY: "6.25rem", opacity: 0.42 },
  { left: "71%", top: "34%", width: "8.25rem", duration: "4.7s", delay: "-5.4s", scale: 0.86, travelX: "-3.2rem", travelY: "4.25rem", opacity: 0.56 },
  { left: "79%", top: "16%", width: "7.25rem", duration: "4.2s", delay: "-1.8s", scale: 0.72, travelX: "-2.5rem", travelY: "3.5rem", opacity: 0.46 },
  { left: "84%", top: "60%", width: "9.25rem", duration: "5.5s", delay: "-11.1s", scale: 0.98, travelX: "-3.6rem", travelY: "5rem", opacity: 0.52 },
  { left: "90%", top: "40%", width: "8rem", duration: "4.9s", delay: "-7.7s", scale: 0.84, travelX: "-3.2rem", travelY: "4.25rem", opacity: 0.45 },
];

const SHOOTING_TRAIL = [
  { position: "14%", size: "0.56rem", opacity: 0.42 },
  { position: "29%", size: "0.44rem", opacity: 0.34 },
  { position: "44%", size: "0.34rem", opacity: 0.29 },
  { position: "60%", size: "0.28rem", opacity: 0.24 },
  { position: "76%", size: "0.22rem", opacity: 0.19 },
  { position: "90%", size: "0.16rem", opacity: 0.14 },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function jitterPercent(value: string, spread: number, min: number, max: number) {
  const numericValue = Number.parseFloat(value);
  const jitteredValue = clamp(numericValue + (Math.random() * 2 - 1) * spread, min, max);
  return `${jitteredValue.toFixed(1)}%`;
}

function randomizeStarPosition(star: ShootingStarConfig, index: number) {
  return {
    ...star,
    left: jitterPercent(star.left, 9, 3, 94),
    top: jitterPercent(star.top, index % 3 === 0 ? 12 : 9, 8, 82),
  };
}

function parseSeconds(value: string) {
  return Number.parseFloat(value.replace("s", ""));
}

function createRandomStar(baseStar: ShootingStarConfig, index: number) {
  return randomizeStarPosition(baseStar, index);
}

function createInitialWaitMs(baseStar: ShootingStarConfig) {
  const durationMs = parseSeconds(baseStar.duration) * 1000;
  const delayMs = Math.abs(parseSeconds(baseStar.delay)) * 1000;
  return delayMs % durationMs;
}

function createCycleGapMs() {
  return Math.round(220 + Math.random() * 920);
}

function FooterMeteor({ baseStar, index }: { baseStar: ShootingStarConfig; index: number }) {
  const [star, setStar] = useState(baseStar);
  const [isActive, setIsActive] = useState(false);
  const [cycleGapMs, setCycleGapMs] = useState(() => createInitialWaitMs(baseStar));

  useEffect(() => {
    if (isActive) return;

    const timeout = window.setTimeout(() => {
      setIsActive(true);
    }, cycleGapMs);

    return () => window.clearTimeout(timeout);
  }, [cycleGapMs, isActive]);

  useEffect(() => {
    setStar(createRandomStar(baseStar, index));
    setCycleGapMs(createInitialWaitMs(baseStar));
    setIsActive(false);
  }, [baseStar, index]);

  return (
    <span
      className="footer-shooting-star"
      style={
        {
          left: star.left,
          top: star.top,
          width: star.width,
          "--meteor-opacity": star.opacity,
        } as CSSProperties
      }
    >
      <span
        className="footer-shooting-star__motion"
        onAnimationEnd={() => {
          setIsActive(false);
          setStar(createRandomStar(baseStar, index));
          setCycleGapMs(createCycleGapMs());
        }}
        style={
          {
            animationName: isActive ? "footerMeteorDrift" : "none",
            animationDuration: star.duration,
            animationIterationCount: 1,
            "--meteor-scale": star.scale,
            "--meteor-travel-x": star.travelX,
            "--meteor-travel-y": star.travelY,
          } as CSSProperties
        }
      >
        <span className="footer-shooting-star__lane">
          <span className="footer-shooting-star__glow" />
          <span className="footer-shooting-star__cross" />
          {SHOOTING_TRAIL.map((dot) => (
            <span
              key={`${dot.position}-${dot.size}`}
              className="footer-shooting-star__dot"
              style={{
                left: dot.position,
                width: dot.size,
                height: dot.size,
                opacity: dot.opacity,
              }}
            />
          ))}
        </span>
      </span>
    </span>
  );
}

export default function FooterMeteorField() {
  return (
    <>
      {BASE_SHOOTING_STARS.map((star, index) => (
        <FooterMeteor key={index} baseStar={star} index={index} />
      ))}
    </>
  );
}
