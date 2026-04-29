"use client";

import React, { CSSProperties } from "react";
import type { OrbConfig } from "@/lib/types";

interface CRTOrbFrameProps {
  children: React.ReactNode;
  config: OrbConfig;
}

export function CRTOrbFrame({ children, config }: CRTOrbFrameProps) {
  const {
    bloomRadius,
    bloomIntensity,
    phosphorDecay,
    grain,
    scanlines,
    scanFrequency,
    aberration,
    coreBrightness,
    background,
    colors,
    size,
  } = config;

  const bloomPx = Math.round((bloomRadius / 100) * 60);
  const bloomAlpha = bloomIntensity / 100;
  const phosphorAlpha = phosphorDecay / 100;
  const grainOpacity = grain;
  const scanlineOpacity = scanlines;
  const aberrationPx = aberration;
  const brightnessVal = coreBrightness / 100;
  const color2 = colors[1];

  const frameStyle: CSSProperties = {
    width: size + 80,
    height: size + 80,
    background: background,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    overflow: "hidden",
  };

  // Phosphor bloom layer behind orb
  const bloomStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse ${size * 0.9}px ${size * 0.7}px at 50% 55%, ${color2}${Math.round(bloomAlpha * 40).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
    filter: `blur(${bloomPx}px)`,
    mixBlendMode: "screen",
    pointerEvents: "none",
    zIndex: 1,
  };

  // Phosphor decay afterglow
  const phosphorStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse ${size}px ${size}px at 50% 50%, ${color2}${Math.round(phosphorAlpha * 20).toString(16).padStart(2, "0")} 0%, transparent 60%)`,
    filter: `blur(${bloomPx * 0.4}px)`,
    mixBlendMode: "screen",
    pointerEvents: "none",
    zIndex: 2,
    animation: "phosphorPulse 4s ease-in-out infinite",
  };

  // Scanlines
  const scanlineStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage: `repeating-linear-gradient(
      0deg,
      transparent,
      transparent ${(1 / scanFrequency) * 2}px,
      rgba(0,0,0,${scanlineOpacity}) ${(1 / scanFrequency) * 2}px,
      rgba(0,0,0,${scanlineOpacity}) ${1 / scanFrequency + (1 / scanFrequency) * 2}px
    )`,
    backgroundSize: `100% ${1 / scanFrequency + (1 / scanFrequency) * 2}px`,
    pointerEvents: "none",
    zIndex: 10,
    mixBlendMode: "multiply",
  };

  // Grain
  const grainStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    opacity: grainOpacity,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundSize: "120px 120px",
    pointerEvents: "none",
    zIndex: 11,
    mixBlendMode: "overlay",
  };

  // Horizontal glow band
  const glowBandStyle: CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    top: "calc(50% - 2px)",
    height: "4px",
    background: `linear-gradient(90deg, transparent 0%, ${color2}66 20%, ${color2}99 50%, ${color2}66 80%, transparent 100%)`,
    filter: "blur(6px)",
    pointerEvents: "none",
    zIndex: 3,
    opacity: 0.4,
  };

  // Chromatic aberration overlay using CSS
  const aberrationStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 4,
    mixBlendMode: "screen",
    background: `
      radial-gradient(circle at calc(50% + ${aberrationPx}px) 50%, rgba(255,0,0,0.04), transparent 55%),
      radial-gradient(circle at calc(50% - ${aberrationPx}px) 50%, rgba(0,0,255,0.04), transparent 55%)
    `,
  };

  // Vignette
  const vignetteStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)",
    pointerEvents: "none",
    zIndex: 9,
  };

  // Orb wrapper with brightness and aberration filter
  const orbWrapperStyle: CSSProperties = {
    position: "relative",
    zIndex: 5,
    filter: `brightness(${brightnessVal}) drop-shadow(0 0 ${bloomPx * 0.5}px ${color2}88)`,
    // CSS-only chromatic aberration on the orb itself
    isolation: "isolate",
  };

  return (
    <>
      <style>{`
        @keyframes phosphorPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
      <div style={frameStyle}>
        <div style={bloomStyle} />
        <div style={phosphorStyle} />
        <div style={glowBandStyle} />
        <div style={aberrationStyle} />
        <div style={orbWrapperStyle}>{children}</div>
        <div style={vignetteStyle} />
        <div style={scanlineStyle} />
        <div style={grainStyle} />
      </div>
    </>
  );
}
