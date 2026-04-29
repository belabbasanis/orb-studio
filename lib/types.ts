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
  /** Spectral stops along 0→1: shadow/deep → mid → bright → rim accent */
  colors: [string, string, string, string];
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
  /** In-shader film grain strength (0…~0.15); separate from CRT overlay Grain */
  shaderFilmGrain: number;
  /** Dual-lobe inner glow strength (buried soft-body core) */
  innerBloom: number;
  /** Fresnel rim exponent (~1.5–6); higher = tighter silhouette */
  rimPower: number;
  /** Rim highlight multiplier */
  rimIntensity: number;
  /** Darkens base color at grazing angles (0–~0.5) for sharper shape read */
  rimDarken: number;
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
