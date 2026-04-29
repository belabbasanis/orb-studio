import type { Preset } from "./types";

export const DEFAULT_CONFIG = {
  size: 220,
  colors: ["#EFFFFF", "#00AFFF"] as [string, string],
  background: "#02050b",
  micSensitivity: 1.0,
  noiseGate: 0.006,
  smoothing: 0.72,
  bloomRadius: 82,
  bloomIntensity: 78,
  phosphorDecay: 68,
  grain: 0.34,
  scanlines: 0.28,
  scanFrequency: 5,
  aberration: 2.6,
  coreBrightness: 96,
};

export const PRESETS: Preset[] = [
  {
    name: "CRT Cyan",
    config: { ...DEFAULT_CONFIG },
  },
  {
    name: "Phosphor Green",
    config: {
      ...DEFAULT_CONFIG,
      colors: ["#EFFFEF", "#00FF7F"],
      background: "#010a03",
      bloomIntensity: 90,
      phosphorDecay: 80,
      grain: 0.42,
      scanlines: 0.35,
    },
  },
  {
    name: "Amber Monitor",
    config: {
      ...DEFAULT_CONFIG,
      colors: ["#FFF8E7", "#FF8C00"],
      background: "#0a0500",
      bloomIntensity: 72,
      phosphorDecay: 55,
      grain: 0.28,
      scanlines: 0.22,
      aberration: 1.8,
    },
  },
  {
    name: "Deep Void",
    config: {
      ...DEFAULT_CONFIG,
      colors: ["#E0E8FF", "#4040FF"],
      background: "#000008",
      bloomRadius: 95,
      bloomIntensity: 85,
      phosphorDecay: 90,
      grain: 0.18,
      scanlines: 0.12,
      aberration: 3.5,
    },
  },
  {
    name: "Magenta Burst",
    config: {
      ...DEFAULT_CONFIG,
      colors: ["#FFE0FF", "#FF00AA"],
      background: "#080004",
      bloomRadius: 75,
      bloomIntensity: 88,
      phosphorDecay: 60,
      grain: 0.38,
      scanlines: 0.30,
      aberration: 2.2,
    },
  },
];
