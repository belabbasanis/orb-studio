import { DEFAULT_CONFIG } from "@/lib/presets";
import type { OrbConfig } from "@/lib/types";

/** Old exports used 2 color stops; expand to 4 for spectral ramp: deep → mid → bright → rim. */
export function normalizeOrbColors(input: unknown): [string, string, string, string] {
  if (!Array.isArray(input) || input.length < 2) {
    return [...DEFAULT_CONFIG.colors] as [string, string, string, string];
  }
  const a = String(input[0] ?? DEFAULT_CONFIG.colors[0]);
  const b = String(input[1] ?? DEFAULT_CONFIG.colors[1]);
  if (input.length >= 4) {
    return [String(input[0]), String(input[1]), String(input[2]), String(input[3])];
  }
  return [a, b, b, a];
}

/** Merge partial / legacy JSON into a full OrbConfig with safe defaults. */
export function normalizeOrbConfig(raw: unknown): OrbConfig {
  const d = DEFAULT_CONFIG;
  if (!raw || typeof raw !== "object") return { ...d };
  const o = raw as Partial<OrbConfig>;

  return {
    ...d,
    ...o,
    colors: normalizeOrbColors(o.colors),
    shaderFilmGrain:
      typeof o.shaderFilmGrain === "number" ? o.shaderFilmGrain : d.shaderFilmGrain,
    innerBloom: typeof o.innerBloom === "number" ? o.innerBloom : d.innerBloom,
    rimPower: typeof o.rimPower === "number" ? o.rimPower : d.rimPower,
    rimIntensity:
      typeof o.rimIntensity === "number" ? o.rimIntensity : d.rimIntensity,
    rimDarken: typeof o.rimDarken === "number" ? o.rimDarken : d.rimDarken,
  };
}
