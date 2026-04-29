"use client";

import React from "react";
import { PRESETS } from "@/lib/presets";
import type { OrbConfig } from "@/lib/types";

interface PresetsPanelProps {
  config: OrbConfig;
  activePreset: string | null;
  micStatus: string;
  level: number;
  agentState: string;
  onPresetSelect: (name: string, config: OrbConfig) => void;
  onMicToggle: () => void;
  samples: number[];
  children?: React.ReactNode; // equalizer slot
}

const STATUS_LABELS: Record<string, string> = {
  off: "Mic: off",
  requesting: "Requesting...",
  live: "Listening",
  "permission-denied": "Permission denied",
  unsupported: "Not supported",
  error: "Error",
};

export function PresetsPanel({
  config,
  activePreset,
  micStatus,
  level,
  agentState,
  onPresetSelect,
  onMicToggle,
  children,
}: PresetsPanelProps) {
  const micLive = micStatus === "live";
  const statusLabel =
    micLive && level > 0.03
      ? "Speaking / Active"
      : micLive
      ? "Listening / Still"
      : STATUS_LABELS[micStatus] ?? micStatus;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Presets
        </h2>
        <div className="flex flex-col gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => onPresetSelect(p.name, p.config)}
              className={`text-left px-3 py-2 rounded text-sm transition-all ${
                activePreset === p.name
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Motion State
        </h2>
        <div
          className={`px-3 py-2 rounded text-sm border ${
            agentState === "listening" || agentState === "speaking"
              ? "border-cyan-700 text-cyan-300 bg-cyan-950/40"
              : "border-slate-700 text-slate-500"
          }`}
        >
          {agentState ?? "idle"}
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Microphone
        </h2>
        <button
          onClick={onMicToggle}
          className={`w-full px-3 py-2 rounded text-sm font-medium transition-all ${
            micLive
              ? "bg-red-900/60 border border-red-700 text-red-300 hover:bg-red-900"
              : "bg-cyan-900/50 border border-cyan-700 text-cyan-300 hover:bg-cyan-900"
          }`}
        >
          {micLive ? "Stop Mic" : "Start Mic"}
        </button>
        <div
          className={`mt-2 text-xs px-1 ${
            level > 0.03 ? "text-cyan-400" : "text-slate-500"
          }`}
        >
          {statusLabel}
        </div>

        {/* Level meter */}
        <div className="mt-2 h-1.5 bg-slate-800 rounded overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-75"
            style={{ width: `${level * 100}%` }}
          />
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4 flex-1">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Equalizer
        </h2>
        <div className="bg-slate-900/60 rounded p-2">{children}</div>
      </div>
    </div>
  );
}
