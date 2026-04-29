"use client";

import React from "react";

// Baked-in SVG noise — same pattern tiled and animated to simulate CRT static
const NOISE_SVG =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

interface Props {
  children: React.ReactNode;
}

export function TerminalScreen({ children }: Props) {
  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{
        background: "var(--t-bg)",
        animation: "flicker 9s ease-in-out infinite",
      }}
    >
      {/* ── Content (rendered below all overlays) ─────────────── */}
      <div className="relative h-full w-full" style={{ zIndex: 1 }}>
        {children}
      </div>

      {/* ── Scanlines ─────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.22) 3px, rgba(0,0,0,0.22) 4px)",
          pointerEvents: "none",
          zIndex: 9010,
          mixBlendMode: "multiply",
        }}
      />

      {/* ── Animated noise grain ──────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: "-20%",
          width: "140%",
          height: "140%",
          backgroundImage: `url("${NOISE_SVG}")`,
          backgroundSize: "200px 200px",
          opacity: 0.04,
          pointerEvents: "none",
          zIndex: 9011,
          animation: "noise-shift 0.2s steps(8) infinite",
          mixBlendMode: "screen",
        }}
      />

      {/* ── Barrel-distortion vignette ────────────────────────── */}
      {/* Approximates CRT screen curvature by darkening edges     */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 86% 80% at 50% 50%, transparent 52%, rgba(0,0,0,0.42) 80%, rgba(0,0,0,0.78) 100%)",
          pointerEvents: "none",
          zIndex: 9012,
        }}
      />

      {/* ── Horizontal phosphor glow-line (scan artifact) ─────── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          height: "3px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(224,149,16,0.06) 10%, rgba(224,149,16,0.14) 50%, rgba(224,149,16,0.06) 90%, transparent 100%)",
          filter: "blur(1.5px)",
          pointerEvents: "none",
          zIndex: 9013,
          animation: "glow-line 14s linear infinite",
        }}
      />

      {/* ── Screen bloom — warm outer glow ───────────────────── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          boxShadow: "inset 0 0 120px rgba(224,149,16,0.04)",
          pointerEvents: "none",
          zIndex: 9014,
        }}
      />
    </div>
  );
}
