import { useEffect, useRef, useState } from "react";
import HeroFilmCanvas from "@/sections/home/HeroFilmCanvas";

export default function HeroSection() {
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || videoFailed) {
      return;
    }

    const tryPlay = () => {
      video.play().catch(() => {
        setVideoFailed(true);
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
      return;
    }

    video.addEventListener("loadeddata", tryPlay, { once: true });

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
    };
  }, [videoFailed]);

  return (
    <section className="relative overflow-hidden bg-black">
      <div className="relative min-h-[100svh]">
        {!videoFailed ? (
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover object-center brightness-[0.92] contrast-[1.08] saturate-[1.05]"
            autoPlay
            loop
            muted
            defaultMuted
            playsInline
            preload="auto"
            aria-hidden="true"
            disablePictureInPicture
            onError={() => setVideoFailed(true)}
          >
            <source src="/videos/gonish-hero-web.mp4?v=20260306b" type="video/mp4" />
          </video>
        ) : null}

        {videoFailed ? <HeroFilmCanvas /> : null}
      </div>
    </section>
  );
}
