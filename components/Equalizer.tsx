"use client";

import React, { useMemo } from "react";

interface EqualizerProps {
  samples: number[];
  level: number;
  active: boolean;
  color?: string;
  width?: number;
  height?: number;
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";

  const d: string[] = [];
  d.push(`M ${points[0].x} ${points[0].y}`);

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const cp1x = prev.x + (curr.x - prev.x) * 0.5;
    const cp1y = prev.y;
    const cp2x = curr.x - (next.x - prev.x) * 0.2;
    const cp2y = curr.y;

    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`);
  }

  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  const cpx = secondLast.x + (last.x - secondLast.x) * 0.5;
  d.push(`Q ${cpx} ${secondLast.y}, ${last.x} ${last.y}`);

  return d.join(" ");
}

export function Equalizer({
  samples,
  level,
  active,
  color = "#00AFFF",
  width = 280,
  height = 60,
}: EqualizerProps) {
  const midY = height / 2;

  const pathData = useMemo(() => {
    if (!active || level < 0.002) {
      return `M 0 ${midY} L ${width} ${midY}`;
    }

    const step = width / (samples.length - 1);
    const amplitude = midY * 0.85 * Math.min(level * 2.5, 1);

    const points = samples.map((s, i) => ({
      x: i * step,
      y: midY - s * amplitude,
    }));

    return buildSmoothPath(points);
  }, [samples, level, active, width, midY]);

  const glowId = `eq-glow-${color.replace("#", "")}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* glow copy */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
        filter={`url(#${glowId})`}
      />

      {/* main path */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={active && level > 0.002 ? 0.9 : 0.4}
      />
    </svg>
  );
}
