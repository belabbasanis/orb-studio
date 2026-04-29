"use client";

import React, { CSSProperties } from "react";
import type { OrbConfig } from "@/lib/types";

/** Scanlines + grain over the orb preview column only (`position: absolute` fills the positioned parent). */
export function GlobalCRTOverlay({ config }: { config: OrbConfig }) {
  const { scanlines, scanFrequency, grain } = config;

  const wrapper: CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 3,
    isolation: "isolate",
  };

  const scanlineStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage: `repeating-linear-gradient(
      0deg,
      transparent,
      transparent ${(1 / scanFrequency) * 2}px,
      rgba(0,0,0,${scanlines}) ${(1 / scanFrequency) * 2}px,
      rgba(0,0,0,${scanlines}) ${1 / scanFrequency + (1 / scanFrequency) * 2}px
    )`,
    backgroundSize: `100% ${1 / scanFrequency + (1 / scanFrequency) * 2}px`,
    mixBlendMode: "multiply",
  };

  const grainStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    opacity: grain,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundSize: "120px 120px",
    mixBlendMode: "overlay",
  };

  return (
    <div aria-hidden style={wrapper}>
      <div style={scanlineStyle} />
      <div style={grainStyle} />
    </div>
  );
}
