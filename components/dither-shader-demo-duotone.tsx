"use client";

import { useRef, useState } from "react";
import { DitherShader } from "@/components/ui/dither-shader";

export default function DitherShaderDemoDuotone() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const slide = {
    primary: "#1e3a5f",
    secondary: "#f0e68c",
    text: "#fffbea",
    buttonText: "#1e3a5f",
    overlay: "rgba(8, 20, 38, 0.22)",
  };

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: "#000000" }}
    >
      <video
        src="/bg1.mp4"
        autoPlay
        muted
        loop
        playsInline
        ref={videoRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="absolute inset-0 h-full w-full scale-[1.08] object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-[1] overflow-hidden shadow-2xl">
        <DitherShader
          videoSrc="/bg1.mp4"
          gridSize={2}
          ditherMode="bayer"
          colorMode="custom"
          primaryColor={slide.primary}
          secondaryColor={slide.secondary}
          customPalette={[slide.primary, slide.secondary, "#f28f3b", "#fffbea"]}
          threshold={0.45}
          processingScale={0.5}
          cropScale={1.08}
          adaptivePalette
          paletteUpdateInterval={1500}
          className="h-full w-full rounded-3xl"
        />
      </div>
      <div
        className="absolute inset-0 z-10 transition-colors duration-1000"
        style={{ backgroundColor: slide.overlay }}
      />
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center font-[family-name:var(--font-poppins)] transition-colors duration-1000"
        style={{ color: slide.text }}
      >
        <p
          className="mb-4 text-sm font-medium uppercase tracking-[0.45em] transition-colors duration-1000 sm:text-base"
          style={{ color: slide.secondary }}
        >
          Music in sync
        </p>
        <h1 className="text-7xl font-bold tracking-[-0.06em] drop-shadow-2xl sm:text-9xl">
          Sync
        </h1>
        <p
          className="mt-5 max-w-md text-base leading-7 opacity-85 transition-colors duration-1000 sm:text-lg"
          style={{ color: slide.text }}
        >
          Create a room, invite your people, and listen together.
        </p>
        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="/session?mode=create"
            className="rounded-full px-7 py-3.5 font-semibold shadow-lg transition-all duration-1000 hover:scale-[1.03]"
            style={{ backgroundColor: slide.secondary, color: slide.buttonText }}
          >
            Create Session
          </a>
          <a
            href="/session?mode=join"
            className="rounded-full border px-7 py-3.5 font-semibold backdrop-blur-sm transition-all duration-1000 hover:bg-white hover:text-[#1e3a5f]"
            style={{ borderColor: slide.text, color: slide.text }}
          >
            Join Session
          </a>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/15 bg-black/50 p-3 font-[family-name:var(--font-poppins)] text-white shadow-2xl backdrop-blur-xl sm:bottom-8">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <div className="flex items-end gap-0.5" aria-hidden="true">
            <span className="h-2 w-1 rounded-full bg-[#f0e68c]" />
            <span className="h-4 w-1 rounded-full bg-[#f0e68c]" />
            <span className="h-3 w-1 rounded-full bg-[#f0e68c]" />
            <span className="h-5 w-1 rounded-full bg-[#f0e68c]" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f0e68c]" />
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
              Currently playing
            </p>
          </div>
          <p className="mt-0.5 truncate text-sm font-semibold">Sync Session Mix</p>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs transition-colors hover:bg-white/20"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            if (video.paused) {
              void video.play();
              setIsPlaying(true);
            } else {
              video.pause();
              setIsPlaying(false);
            }
          }}
        >
          {isPlaying ? "Ⅱ" : "▶"}
        </button>
        <button
          type="button"
          className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={isMuted ? "Enable audio" : "Mute audio"}
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            video.muted = !video.muted;
            setIsMuted(video.muted);
            if (!video.muted) void video.play();
          }}
        >
          {isMuted ? "Enable sound" : "Mute"}
        </button>
      </div>
    </section>
  );
}
