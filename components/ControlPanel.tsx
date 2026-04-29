"use client";

import React from "react";
import type { OrbConfig } from "@/lib/types";

/* ── Primitives ─────────────────────────────────────────────────── */

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  unit?: string;
  decimals?: number;
}

function SliderRow({ label, value, min, max, step = 1, onChange, unit = "", decimals }: SliderRowProps) {
  const dp = decimals ?? (step < 0.01 ? 3 : step < 1 ? 2 : 0);
  const display = value.toFixed(dp) + unit;

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 3,
          alignItems: "baseline",
        }}
      >
        <span className="ph-mid" style={{ fontSize: 10, letterSpacing: "0.06em" }}>
          {">"} {label.toUpperCase()}
        </span>
        <span
          className="ph"
          style={{
            fontSize: 10,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.04em",
            background: "rgba(224,149,16,0.05)",
            border: "1px solid var(--t-fg-lo)",
            padding: "0 4px",
            minWidth: 52,
            textAlign: "right",
          }}
        >
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function ColorRow({ label, value, onChange }: ColorRowProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <span className="ph-mid" style={{ fontSize: 10, letterSpacing: "0.06em" }}>
        {">"} {label.toUpperCase()}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span className="ph" style={{ fontSize: 10, letterSpacing: "0.04em" }}>
          {value.toUpperCase()}
        </span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 22, height: 16 }}
        />
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  const pad = 16 - label.length;
  const dashes = "─".repeat(Math.max(pad, 2));
  return (
    <div
      className="ph-mid"
      style={{ fontSize: 10, letterSpacing: "0.12em", marginBottom: 8, marginTop: 2 }}
    >
      ── {label.toUpperCase()} {dashes}
    </div>
  );
}

/* ── Main panel ─────────────────────────────────────────────────── */

interface ControlPanelProps {
  config: OrbConfig;
  onChange: (partial: Partial<OrbConfig>) => void;
  onExport: () => void;
}

export function ControlPanel({ config, onChange, onExport }: ControlPanelProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ gap: 0 }}>

      {/* ── INPUT ────────────────────────────────────── */}
      <SectionHeader label="INPUT" />
      <SliderRow label="Orb Size"         value={config.size}           min={120}  max={380}  onChange={(v) => onChange({ size: v })}           unit="px" />
      <SliderRow label="Mic Sensitivity"  value={config.micSensitivity} min={0.1}  max={3.0}  step={0.1}   onChange={(v) => onChange({ micSensitivity: v })} />
      <SliderRow label="Noise Gate"       value={config.noiseGate}      min={0}    max={0.05} step={0.001} onChange={(v) => onChange({ noiseGate: v })} />
      <SliderRow label="Smoothing"        value={config.smoothing}      min={0}    max={0.99} step={0.01}  onChange={(v) => onChange({ smoothing: v })} />

      <hr className="term-rule" />

      {/* ── FLUID DYNAMICS ───────────────────────────── */}
      <SectionHeader label="FLUID DYN" />
      <SliderRow label="Shell Amplitude"  value={config.shellAmplitude} min={0}    max={0.10} step={0.001} onChange={(v) => onChange({ shellAmplitude: v })} />
      <SliderRow label="Shell Speed"      value={config.shellSpeed}     min={0.02} max={0.5}  step={0.01}  onChange={(v) => onChange({ shellSpeed: v })} />
      <SliderRow label="Turb Amplitude"   value={config.turbAmplitude}  min={0}    max={0.20} step={0.005} onChange={(v) => onChange({ turbAmplitude: v })} />
      <SliderRow label="Turb Speed"       value={config.turbSpeed}      min={0.3}  max={3.0}  step={0.1}   onChange={(v) => onChange({ turbSpeed: v })} />
      <SliderRow label="Pressure Curve"   value={config.pressureCurve}  min={0.2}  max={1.0}  step={0.05}  onChange={(v) => onChange({ pressureCurve: v })} />
      <SliderRow label="Phase Spread"     value={config.phaseSpread}    min={0}    max={12.0} step={0.1}   onChange={(v) => onChange({ phaseSpread: v })} />

      <hr className="term-rule" />

      {/* ── CRT RENDER ───────────────────────────────── */}
      <SectionHeader label="CRT RENDER" />
      <ColorRow label="Primary"    value={config.colors[0]}   onChange={(v) => onChange({ colors: [v, config.colors[1]] })} />
      <ColorRow label="Secondary"  value={config.colors[1]}   onChange={(v) => onChange({ colors: [config.colors[0], v] })} />
      <ColorRow label="Background" value={config.background}  onChange={(v) => onChange({ background: v })} />
      <SliderRow label="Core Bright"     value={config.coreBrightness} min={50}  max={150} onChange={(v) => onChange({ coreBrightness: v })} unit="%" />
      <SliderRow label="Bloom Radius"    value={config.bloomRadius}    min={0}   max={100} onChange={(v) => onChange({ bloomRadius: v })} />
      <SliderRow label="Bloom Intensity" value={config.bloomIntensity} min={0}   max={100} onChange={(v) => onChange({ bloomIntensity: v })} />
      <SliderRow label="Phosphor Decay"  value={config.phosphorDecay}  min={0}   max={100} onChange={(v) => onChange({ phosphorDecay: v })} />
      <SliderRow label="Aberration"      value={config.aberration}     min={0}   max={10}  step={0.1} onChange={(v) => onChange({ aberration: v })} unit="px" />
      <SliderRow label="Scanlines"       value={config.scanlines}      min={0}   max={0.8} step={0.01} onChange={(v) => onChange({ scanlines: v })} />
      <SliderRow label="Scan Freq"       value={config.scanFrequency}  min={1}   max={12}  onChange={(v) => onChange({ scanFrequency: v })} />
      <SliderRow label="Grain"           value={config.grain}          min={0}   max={0.9} step={0.01} onChange={(v) => onChange({ grain: v })} />

      <hr className="term-rule" />

      {/* ── EXPORT ───────────────────────────────────── */}
      <button onClick={onExport} className="term-btn" style={{ marginTop: 4, marginBottom: 16 }}>
        [ EXPORT CONFIG.JSON ]
      </button>
    </div>
  );
}
