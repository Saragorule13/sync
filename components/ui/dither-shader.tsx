"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type DitheringMode = "bayer" | "halftone" | "noise" | "crosshatch";
type ColorMode = "original" | "grayscale" | "duotone" | "custom";

interface DitherShaderProps {
  src?: string;
  videoSrc?: string;
  gridSize?: number;
  ditherMode?: DitheringMode;
  colorMode?: ColorMode;
  invert?: boolean;
  pixelRatio?: number;
  primaryColor?: string;
  secondaryColor?: string;
  customPalette?: string[];
  brightness?: number;
  contrast?: number;
  backgroundColor?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
  threshold?: number;
  animated?: boolean;
  animationSpeed?: number;
  processingScale?: number;
  cropScale?: number;
  adaptivePalette?: boolean;
  paletteUpdateInterval?: number;
  className?: string;
}

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function parseColor(color: string): [number, number, number] {
  const value = color.replace("#", "");
  if (value.length === 3) {
    return [
      parseInt(value[0] + value[0], 16),
      parseInt(value[1] + value[1], 16),
      parseInt(value[2] + value[2], 16),
    ];
  }
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function DitherShader({
  src = "",
  videoSrc,
  gridSize = 4,
  ditherMode = "bayer",
  colorMode = "original",
  invert = false,
  pixelRatio = 1,
  primaryColor = "#000000",
  secondaryColor = "#ffffff",
  customPalette = ["#000000", "#ffffff"],
  brightness = 0,
  contrast = 1,
  backgroundColor = "transparent",
  objectFit = "cover",
  threshold = 0.5,
  animated = false,
  animationSpeed = 0.02,
  processingScale = 1,
  cropScale = 1,
  adaptivePalette = false,
  paletteUpdateInterval = 1500,
  className,
}: DitherShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const frameRef = useRef<number | null>(null);
  const paletteTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeRef = useRef(0);
  const paletteRef = useRef(customPalette);
  const [detectedPalette, setDetectedPalette] = useState<string[]>([]);

  useEffect(() => {
    paletteRef.current = detectedPalette.length > 0 ? detectedPalette : customPalette;
  }, [customPalette, detectedPalette]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cancelled = false;
    let width = 0;
    let height = 0;
    const video = videoSrc ? document.createElement("video") : null;
    const offscreen = document.createElement("canvas");
    const offscreenContext = offscreen.getContext("2d");

    const render = (time = 0) => {
      const ctx = canvas.getContext("2d");
      const imageData = imageDataRef.current;
      if (!ctx || !imageData || !width || !height) return;

      if (backgroundColor === "transparent") ctx.clearRect(0, 0, width, height);
      else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }

      const primary = parseColor(primaryColor);
      const secondary = parseColor(secondaryColor);
      const palette = paletteRef.current.map(parseColor);
      const sourceWidth = imageData.width;
      const sourceHeight = imageData.height;
      const outputScaleX = width / sourceWidth;
      const outputScaleY = height / sourceHeight;
      const step = Math.max(1, Math.floor(gridSize * pixelRatio));

      for (let y = 0; y < sourceHeight; y += step) {
        for (let x = 0; x < sourceWidth; x += step) {
          const index = (y * sourceWidth + x) * 4;
          let r = imageData.data[index] ?? 0;
          let g = imageData.data[index + 1] ?? 0;
          let b = imageData.data[index + 2] ?? 0;
          const alpha = imageData.data[index + 3] ?? 0;
          if (alpha < 10) continue;

          r = clamp((r - 128) * contrast + 128 + brightness * 255, 0, 255);
          g = clamp((g - 128) * contrast + 128 + brightness * 255, 0, 255);
          b = clamp((b - 128) * contrast + 128 + brightness * 255, 0, 255);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          const matrixX = Math.floor(x / Math.max(gridSize, 1)) % 4;
          const matrixY = Math.floor(y / Math.max(gridSize, 1)) % 4;
          let pattern = BAYER_4[matrixY][matrixX] / 16;

          if (ditherMode === "noise") {
            const noise = Math.sin(x * 12.9898 + y * 78.233 + time * 100) * 43758.5453;
            pattern = noise - Math.floor(noise);
          } else if (ditherMode === "halftone") {
            pattern =
              (Math.sin((x + y) / (gridSize * 2)) +
                Math.sin((x - y) / (gridSize * 2)) +
                2) /
              4;
          } else if (ditherMode === "crosshatch") {
            pattern =
              ((x + y) % (gridSize * 2) < gridSize ? 1 : 0) * 0.5 +
              ((x - y + gridSize * 4) % (gridSize * 2) < gridSize ? 1 : 0) * 0.5;
          }

          const cutoff = pattern * (1 - threshold) + threshold * 0.5;
          let color: [number, number, number];
          if (colorMode === "grayscale") {
            color = luminance < cutoff ? [0, 0, 0] : [255, 255, 255];
          } else if (colorMode === "duotone") {
            color = luminance < cutoff ? primary : secondary;
          } else if (colorMode === "custom") {
            const paletteIndex = Math.min(
              palette.length - 1,
              Math.floor(clamp(luminance + (cutoff - 0.5) * 0.5, 0, 1) * palette.length),
            );
            color = palette[paletteIndex] ?? secondary;
          } else {
            color = [
              Math.round(clamp(r + (cutoff - 0.5) * 64, 0, 255) / 64) * 64,
              Math.round(clamp(g + (cutoff - 0.5) * 64, 0, 255) / 64) * 64,
              Math.round(clamp(b + (cutoff - 0.5) * 64, 0, 255) / 64) * 64,
            ];
          }

          if (invert) {
            color = color.map((channel) => 255 - channel) as [number, number, number];
          }
          ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
          ctx.fillRect(
            x * outputScaleX,
            y * outputScaleY,
            step * outputScaleX,
            step * outputScaleY,
          );
        }
      }
    };

    const processImage = (image: HTMLImageElement) => {
      if (cancelled || !width || !height) return;
      const renderWidth = Math.max(1, Math.floor(width * processingScale));
      const renderHeight = Math.max(1, Math.floor(height * processingScale));
      const offscreen = document.createElement("canvas");
      offscreen.width = renderWidth;
      offscreen.height = renderHeight;
      const context = offscreen.getContext("2d");
      if (!context) return;

      const scale =
        objectFit === "contain"
          ? Math.min(renderWidth / image.naturalWidth, renderHeight / image.naturalHeight)
          : Math.max(renderWidth / image.naturalWidth, renderHeight / image.naturalHeight) * cropScale;
      const drawWidth = objectFit === "fill" ? renderWidth : image.naturalWidth * scale;
      const drawHeight = objectFit === "fill" ? renderHeight : image.naturalHeight * scale;
      const drawX = (renderWidth - drawWidth) / 2;
      const drawY = (renderHeight - drawHeight) / 2;
      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      imageDataRef.current = context.getImageData(0, 0, renderWidth, renderHeight);
      render();
    };

    const processVideoFrame = () => {
      if (!video || !offscreenContext || cancelled || !width || !height) return;
      const renderWidth = Math.max(1, Math.floor(width * processingScale));
      const renderHeight = Math.max(1, Math.floor(height * processingScale));
      const videoWidth = video.videoWidth || width;
      const videoHeight = video.videoHeight || height;
      const scale =
        objectFit === "contain"
          ? Math.min(renderWidth / videoWidth, renderHeight / videoHeight)
          : Math.max(renderWidth / videoWidth, renderHeight / videoHeight) * cropScale;
      const drawWidth = objectFit === "fill" ? renderWidth : videoWidth * scale;
      const drawHeight = objectFit === "fill" ? renderHeight : videoHeight * scale;
      const drawX = (renderWidth - drawWidth) / 2;
      const drawY = (renderHeight - drawHeight) / 2;

      offscreen.width = renderWidth;
      offscreen.height = renderHeight;
      offscreenContext.clearRect(0, 0, renderWidth, renderHeight);
      offscreenContext.drawImage(video, drawX, drawY, drawWidth, drawHeight);
      imageDataRef.current = offscreenContext.getImageData(0, 0, renderWidth, renderHeight);
      render(timeRef.current);
    };

    const sampleVideoPalette = () => {
      const imageData = imageDataRef.current;
      if (!video || !imageData) return;

      const buckets = new Map<string, { count: number; color: [number, number, number] }>();
      for (let i = 0; i < imageData.data.length; i += 16) {
        const color: [number, number, number] = [
          Math.round((imageData.data[i] ?? 0) / 32) * 32,
          Math.round((imageData.data[i + 1] ?? 0) / 32) * 32,
          Math.round((imageData.data[i + 2] ?? 0) / 32) * 32,
        ];
        const key = color.join(",");
        const bucket = buckets.get(key);
        if (bucket) bucket.count += 1;
        else buckets.set(key, { count: 1, color });
      }

      const palette = [...buckets.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
        .map(({ color }) =>
          `#${color.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`,
        );

      if (palette.length >= 2) setDetectedPalette(palette);
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      width = Math.max(1, Math.floor(entry.contentRect.width));
      height = Math.max(1, Math.floor(entry.contentRect.height));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.getContext("2d")?.scale(dpr, dpr);

      if (videoSrc) return;

      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => processImage(image);
      image.onerror = () => console.warn(`DitherShader image could not load: ${src}`);
      image.src = src;
    });
    resizeObserver.observe(container);

    if (video) {
      video.src = videoSrc ?? "";
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = "auto";
      video.addEventListener("canplay", () => {
        void video.play().catch(() => undefined);
      });

      const animateVideo = () => {
        if (cancelled) return;
        processVideoFrame();
        if ("requestVideoFrameCallback" in video) {
          video.requestVideoFrameCallback(() => animateVideo());
        } else {
          frameRef.current = requestAnimationFrame(animateVideo);
        }
      };
      video.load();
      frameRef.current = requestAnimationFrame(animateVideo);
      paletteTimerRef.current = adaptivePalette
        ? setInterval(sampleVideoPalette, paletteUpdateInterval)
        : null;

      if (paletteTimerRef.current) {
        sampleVideoPalette();
      }
    }

    const animate = () => {
      if (cancelled) return;
      timeRef.current += animationSpeed;
      render(timeRef.current);
      frameRef.current = requestAnimationFrame(animate);
    };
    if (animated && !video) frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (paletteTimerRef.current) clearInterval(paletteTimerRef.current);
      paletteTimerRef.current = null;
    };
  }, [
    src,
    videoSrc,
    gridSize,
    ditherMode,
    colorMode,
    invert,
    pixelRatio,
    primaryColor,
    secondaryColor,
    customPalette,
    brightness,
    contrast,
    backgroundColor,
    objectFit,
    threshold,
    animated,
    animationSpeed,
    processingScale,
    cropScale,
    adaptivePalette,
    paletteUpdateInterval,
  ]);

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Dithered image"
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

export default DitherShader;
