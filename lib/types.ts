export type AgentState = "idle" | "listening" | "speaking" | null;

export interface OrbColors {
  primary: string;
  secondary: string;
}

export interface CRTConfig {
  hue: number;
  secondaryHue: number;
  coreBrightness: number;
  bloomRadius: number;
  bloomIntensity: number;
  phosphorDecay: number;
  aberration: number;
  rgbShiftAxis: number;
  scanlines: number;
  scanFrequency: number;
  grain: number;
  background: string;
}

export interface OrbConfig {
  size: number;
  colors: [string, string];
  background: string;
  micSensitivity: number;
  noiseGate: number;
  smoothing: number;
  bloomRadius: number;
  bloomIntensity: number;
  phosphorDecay: number;
  grain: number;
  scanlines: number;
  scanFrequency: number;
  aberration: number;
  coreBrightness: number;
  // fluid dynamics
  shellAmplitude: number;
  shellSpeed: number;
  turbAmplitude: number;
  turbSpeed: number;
  pressureCurve: number;
  phaseSpread: number;
}

export interface Preset {
  name: string;
  config: OrbConfig;
}
