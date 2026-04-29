"use client";

import React from "react";
import { PRESETS } from "@/lib/presets";
import type { OrbConfig } from "@/lib/types";

interface PresetsPanelProps {
  config: OrbConfig;
  activePreset: string | null;
  micStatus: string;
  level: number;
  speaking: boolean;
  agentState: string;
  onPresetSelect: (name: string, config: OrbConfig) => void;
  onMicToggle: () => void;
  samples: number[];
  children?: React.ReactNode;
}

function LevelMeter({ level }: { level: number }) {
  const total = 16;
  const filled = Math.round(level * total);
  return (
    <span className="ph" style={{ letterSpacing: "0.05em", fontSize: 10 }}>
      {Array.from({ length: total }, (_, i) =>
        i < filled ? "█" : "░"
      ).join("")}
    </span>
  );
}

function SectionHeader({ label }: { label: string }) {
  const pad = 18 - label.length;
  const dashes = "─".repeat(Math.max(pad, 2));
  return (
    <div
      className="ph-mid"
      style={{ fontSize: 10, letterSpacing: "0.12em", marginBottom: 6 }}
    >
      ── {label.toUpperCase()} {dashes}
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  off:              "MIC: OFF",
  requesting:       "MIC: REQUESTING...",
  live:             "MIC: LIVE",
  "permission-denied": "MIC: DENIED",
  unsupported:      "MIC: UNSUPPORTED",
  error:            "MIC: ERROR",
};

export function PresetsPanel({
  config,
  activePreset,
  micStatus,
  level,
  speaking,
  agentState,
  onPresetSelect,
  onMicToggle,
  children,
}: PresetsPanelProps) {
  const micLive = micStatus === "live";

  const stateLabel =
    micLive && speaking
      ? "SPEAKING / ACTIVE"
      : micLive
      ? "LISTENING / STILL"
      : STATUS_LABEL[micStatus] ?? micStatus.toUpperCase();

  return (
    <div className="flex flex-col gap-0 h-full overflow-y-auto" style={{ paddingRight: 2 }}>

      {/* ── PRESETS ─────────────────────────────────── */}
      <SectionHeader label="PRESETS" />
      <div className="flex flex-col gap-px mb-4">
        {PRESETS.map((p) => {
          const isActive = activePreset === p.name;
          return (
            <button
              key={p.name}
              onClick={() => onPresetSelect(p.name, p.config)}
              style={{
                background: "transparent",
                border: "none",
                padding: "3px 0",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                fontSize: 11,
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              className={isActive ? "ph-hi" : "ph-lo"}
            >
              <span style={{ width: 10, flexShrink: 0 }}>{isActive ? "▶" : " "}</span>
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      <hr className="term-rule" />

      {/* ── MOTION STATE ───────────────────────────── */}
      <SectionHeader label="STATE" />
      <div className="mb-4" style={{ paddingLeft: 4 }}>
        <div
          className={agentState === "idle" ? "ph-lo" : "ph-hi"}
          style={{ fontSize: 11, letterSpacing: "0.08em" }}
        >
          {"> "}{agentState?.toUpperCase() ?? "IDLE"}
          {(agentState === "listening" || agentState === "speaking") && (
            <span style={{ animation: "cursor-blink 1s step-end infinite" }}>█</span>
          )}
        </div>
      </div>

      <hr className="term-rule" />

      {/* ── MICROPHONE ─────────────────────────────── */}
      <SectionHeader label="MICROPHONE" />
      <div className="flex flex-col gap-2 mb-4">
        <button
          onClick={onMicToggle}
          className={`term-btn ${micLive ? "danger" : "active"}`}
        >
          {micLive ? "[ STOP MIC ]" : "[ START MIC ]"}
        </button>

        <div
          className={micLive && speaking ? "ph-hi" : "ph-lo"}
          style={{ fontSize: 10, letterSpacing: "0.08em", transition: "color 0.35s ease" }}
        >
          {stateLabel}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="ph-lo" style={{ fontSize: 10 }}>LVL</span>
          <LevelMeter level={level} />
        </div>
      </div>

      <hr className="term-rule" />

      {/* ── EQUALIZER ──────────────────────────────── */}
      <SectionHeader label="EQ" />
      <div
        style={{
          background: "rgba(224,149,16,0.03)",
          border: "1px solid var(--t-fg-lo)",
          padding: "6px 4px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
