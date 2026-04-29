"use client";

import React, { useRef, useState, useCallback } from "react";
import { Orb } from "@/components/orb/Orb";
import { CRTOrbFrame } from "@/components/CRTOrbFrame";
import { Equalizer } from "@/components/Equalizer";
import { PresetsPanel } from "@/components/PresetsPanel";
import { ControlPanel } from "@/components/ControlPanel";
import { useMicrophoneInput } from "@/hooks/useMicrophoneInput";
import { DEFAULT_CONFIG } from "@/lib/presets";
import type { OrbConfig } from "@/lib/types";

export function OrbStudio() {
  const [config, setConfig] = useState<OrbConfig>({ ...DEFAULT_CONFIG });
  const [activePreset, setActivePreset] = useState<string | null>("CRT Cyan");

  const inputVolumeRef = useRef(0);
  const outputVolumeRef = useRef(0);

  const mic = useMicrophoneInput({
    noiseGate: config.noiseGate,
    sensitivity: config.micSensitivity,
    smoothing: config.smoothing,
  });

  // Keep ref in sync without re-render
  inputVolumeRef.current = mic.level;

  const agentState = mic.enabled
    ? mic.level > 0.03
      ? "speaking"
      : "listening"
    : null;

  const handleConfigChange = useCallback((partial: Partial<OrbConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    setActivePreset(null);
  }, []);

  const handlePresetSelect = useCallback((name: string, presetConfig: OrbConfig) => {
    setConfig({ ...presetConfig });
    setActivePreset(name);
  }, []);

  const handleMicToggle = useCallback(() => {
    if (mic.enabled || mic.status === "requesting") {
      mic.stop();
    } else {
      mic.start();
    }
  }, [mic]);

  const handleExport = useCallback(() => {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orb-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: "#080c14", color: "#e0e8f0" }}
    >
      {/* Left panel */}
      <div
        className="w-56 flex-shrink-0 p-4 border-r overflow-y-auto"
        style={{ borderColor: "#1a2030", background: "#0a0f1a" }}
      >
        <div className="mb-4">
          <span
            className="text-xs font-bold tracking-[0.2em] uppercase"
            style={{ color: "#4a9aba" }}
          >
            Orb Studio
          </span>
        </div>
        <PresetsPanel
          config={config}
          activePreset={activePreset}
          micStatus={mic.status}
          level={mic.level}
          agentState={agentState ?? "idle"}
          onPresetSelect={handlePresetSelect}
          onMicToggle={handleMicToggle}
          samples={mic.samples}
        >
          <Equalizer
            samples={mic.samples}
            level={mic.level}
            active={mic.enabled}
            color={config.colors[1]}
            width={168}
            height={50}
          />
        </PresetsPanel>
      </div>

      {/* Center — orb preview */}
      <div
        className="flex-1 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: config.background }}
      >
        <CRTOrbFrame config={config}>
          <Orb
            colors={config.colors}
            getInputVolume={() => inputVolumeRef.current}
            getOutputVolume={() => outputVolumeRef.current}
            agentState={agentState}
            seed={12345}
            size={config.size}
          />
        </CRTOrbFrame>

        {/* Status label */}
        <div
          className="mt-6 text-xs font-mono tracking-widest uppercase"
          style={{ color: mic.level > 0.03 ? config.colors[1] : "#2a3a4a" }}
        >
          {mic.status === "off"
            ? "Mic: off"
            : mic.level > 0.03
            ? "Speaking / Active"
            : "Listening / Still"}
        </div>
      </div>

      {/* Right panel */}
      <div
        className="w-60 flex-shrink-0 p-4 border-l overflow-y-auto"
        style={{ borderColor: "#1a2030", background: "#0a0f1a" }}
      >
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#4a9aba" }}>
          Controls
        </h2>
        <ControlPanel
          config={config}
          onChange={handleConfigChange}
          onExport={handleExport}
        />
      </div>
    </div>
  );
}
