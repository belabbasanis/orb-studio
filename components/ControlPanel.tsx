"use client";

import React from "react";
import type { OrbConfig } from "@/lib/types";

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  unit?: string;
}

function SliderRow({ label, value, min, max, step = 1, onChange, unit = "" }: SliderRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-mono">
          {typeof value === "number" ? value.toFixed(step < 1 ? 2 : 0) : value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500"
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
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-400">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-6 rounded cursor-pointer border border-slate-700 bg-transparent"
        />
      </div>
    </div>
  );
}

interface ControlPanelProps {
  config: OrbConfig;
  onChange: (partial: Partial<OrbConfig>) => void;
  onExport: () => void;
}

export function ControlPanel({ config, onChange, onExport }: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Fluid Controls
        </h2>
        <div className="flex flex-col gap-3">
          <SliderRow
            label="Orb Size"
            value={config.size}
            min={120}
            max={380}
            onChange={(v) => onChange({ size: v })}
            unit="px"
          />
          <SliderRow
            label="Mic Sensitivity"
            value={config.micSensitivity}
            min={0.1}
            max={3.0}
            step={0.1}
            onChange={(v) => onChange({ micSensitivity: v })}
          />
          <SliderRow
            label="Noise Gate"
            value={config.noiseGate}
            min={0}
            max={0.05}
            step={0.001}
            onChange={(v) => onChange({ noiseGate: v })}
          />
          <SliderRow
            label="Smoothing"
            value={config.smoothing}
            min={0}
            max={0.99}
            step={0.01}
            onChange={(v) => onChange({ smoothing: v })}
          />
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          CRT Rendering
        </h2>
        <div className="flex flex-col gap-3">
          <ColorRow
            label="Primary Color"
            value={config.colors[0]}
            onChange={(v) => onChange({ colors: [v, config.colors[1]] })}
          />
          <ColorRow
            label="Secondary Color"
            value={config.colors[1]}
            onChange={(v) => onChange({ colors: [config.colors[0], v] })}
          />
          <ColorRow
            label="Background"
            value={config.background}
            onChange={(v) => onChange({ background: v })}
          />
          <SliderRow
            label="Core Brightness"
            value={config.coreBrightness}
            min={50}
            max={150}
            onChange={(v) => onChange({ coreBrightness: v })}
            unit="%"
          />
          <SliderRow
            label="Bloom Radius"
            value={config.bloomRadius}
            min={0}
            max={100}
            onChange={(v) => onChange({ bloomRadius: v })}
          />
          <SliderRow
            label="Bloom Intensity"
            value={config.bloomIntensity}
            min={0}
            max={100}
            onChange={(v) => onChange({ bloomIntensity: v })}
          />
          <SliderRow
            label="Phosphor Decay"
            value={config.phosphorDecay}
            min={0}
            max={100}
            onChange={(v) => onChange({ phosphorDecay: v })}
          />
          <SliderRow
            label="Aberration"
            value={config.aberration}
            min={0}
            max={10}
            step={0.1}
            onChange={(v) => onChange({ aberration: v })}
            unit="px"
          />
          <SliderRow
            label="Scanlines"
            value={config.scanlines}
            min={0}
            max={0.8}
            step={0.01}
            onChange={(v) => onChange({ scanlines: v })}
          />
          <SliderRow
            label="Scan Frequency"
            value={config.scanFrequency}
            min={1}
            max={12}
            onChange={(v) => onChange({ scanFrequency: v })}
          />
          <SliderRow
            label="Grain"
            value={config.grain}
            min={0}
            max={0.9}
            step={0.01}
            onChange={(v) => onChange({ grain: v })}
          />
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4 mt-auto">
        <button
          onClick={onExport}
          className="w-full px-4 py-2.5 rounded text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors border border-slate-600"
        >
          Export Config JSON
        </button>
      </div>
    </div>
  );
}
