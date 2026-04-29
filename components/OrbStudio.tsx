"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Orb } from "@/components/orb/Orb";
import { Equalizer } from "@/components/Equalizer";
import { PresetsPanel } from "@/components/PresetsPanel";
import { ControlPanel } from "@/components/ControlPanel";
import { GlobalCRTOverlay } from "@/components/GlobalCRTOverlay";
import { TerminalScreen } from "@/components/TerminalScreen";
import { useMicrophoneInput } from "@/hooks/useMicrophoneInput";
import { DEFAULT_CONFIG } from "@/lib/presets";
import { normalizeOrbConfig, normalizeOrbColors } from "@/lib/orbConfigNormalize";
import { SPEAKING_THRESHOLD, SPEAKING_LEVEL_RELEASE } from "@/lib/micUiThresholds";
import type { OrbConfig } from "@/lib/types";

/* ── Blink cursor used in header ─────────────────────────────────── */
function BlinkCursor() {
  return (
    <span
      className="ph"
      style={{ animation: "cursor-blink 1.1s step-end infinite", marginLeft: 2 }}
    >
      █
    </span>
  );
}

export function OrbStudio() {
  const [config, setConfig] = useState<OrbConfig>(() => normalizeOrbConfig(DEFAULT_CONFIG));
  const [activePreset, setActivePreset] = useState<string | null>("CRT Cyan");

  const inputVolumeRef = useRef(0);
  const outputVolumeRef = useRef(0);

  const mic = useMicrophoneInput({
    noiseGate:   config.noiseGate,
    sensitivity: config.micSensitivity,
    smoothing:   config.smoothing,
  });

  inputVolumeRef.current = mic.level;

  /** Hysteresis for SPEAKING / LISTENING labels only — does not affect `mic.level` or the orb. */
  const uiSpeakingRef = useRef(false);
  const [uiSpeaking, setUiSpeaking] = useState(false);

  useEffect(() => {
    if (!mic.enabled) {
      if (uiSpeakingRef.current) {
        uiSpeakingRef.current = false;
        setUiSpeaking(false);
      }
      return;
    }
    const lv = mic.level;
    let next = uiSpeakingRef.current;
    if (lv >= SPEAKING_THRESHOLD) next = true;
    else if (lv <= SPEAKING_LEVEL_RELEASE) next = false;
    if (next !== uiSpeakingRef.current) {
      uiSpeakingRef.current = next;
      setUiSpeaking(next);
    }
  }, [mic.enabled, mic.level]);

  const agentState = mic.enabled
    ? uiSpeaking ? "speaking" : "listening"
    : null;

  const handleConfigChange = useCallback((partial: Partial<OrbConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      if (partial.colors !== undefined) {
        next.colors = normalizeOrbColors(partial.colors);
      }
      return next;
    });
    setActivePreset(null);
  }, []);

  const handlePresetSelect = useCallback((name: string, presetConfig: OrbConfig) => {
    setConfig(normalizeOrbConfig(presetConfig));
    setActivePreset(name);
  }, []);

  const handleMicToggle = useCallback(() => {
    if (mic.enabled || mic.status === "requesting") mic.stop();
    else mic.start();
  }, [mic]);

  const handleExport = useCallback(() => {
    const json = JSON.stringify(normalizeOrbConfig(config), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orb-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  return (
    <TerminalScreen>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
        }}
      >
        {/* ── Header bar ──────────────────────────────────────────── */}
        <div
          style={{
            flexShrink: 0,
            borderBottom: "1px solid var(--t-fg-lo)",
            padding: "5px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(224,149,16,0.02)",
          }}
        >
          <span className="ph-hi" style={{ fontSize: 11, letterSpacing: "0.22em" }}>
            ORB-STUDIO <span className="ph-lo">v1.0</span>
          </span>

          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <span
              className={mic.enabled && uiSpeaking ? "ph-hi" : "ph-lo"}
              style={{ fontSize: 10, letterSpacing: "0.12em" }}
            >
              {mic.enabled && uiSpeaking ? "◉ SPEAKING" : mic.enabled ? "○ LISTENING" : "○ IDLE"}
            </span>
            <span className="ph-lo" style={{ fontSize: 10, letterSpacing: "0.1em" }}>
              PRESET: <span className="ph-mid">{activePreset ?? "CUSTOM"}</span>
            </span>
            <span className="ph-lo" style={{ fontSize: 10 }}>
              {new Date().toISOString().slice(0, 10)}
            </span>
          </div>

          <span className="ph-lo" style={{ fontSize: 10, letterSpacing: "0.1em" }}>
            AUDIO-REACTIVE CRT ORB<BlinkCursor />
          </span>
        </div>

        {/* ── Three-column body ────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", overflow: "visible", minHeight: 0 }}>

          {/* ── Left panel ──────────────────────────────────────── */}
          <div
            style={{
              width: 200,
              flexShrink: 0,
              borderRight: "1px solid var(--t-fg-lo)",
              padding: "12px 12px 12px 14px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              background: "rgba(224,149,16,0.015)",
            }}
          >
            {/* Panel chrome header */}
            <div
              className="ph-lo"
              style={{ fontSize: 10, letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--t-fg-lo)" }}
            >
              ┌── CONTROL ────────┐
            </div>

            <PresetsPanel
              config={config}
              activePreset={activePreset}
              micStatus={mic.status}
              level={mic.level}
              speaking={uiSpeaking}
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
                width={162}
                height={44}
              />
            </PresetsPanel>
          </div>

          {/* ── Center — orb preview ─────────────────────────────── */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "visible",
              background: config.background,
              position: "relative",
              padding: "16px 32px 24px",
            }}
          >
            <Orb
              colors={config.colors}
              look={{
                shaderFilmGrain: config.shaderFilmGrain,
                innerBloom:      config.innerBloom,
                rimPower:        config.rimPower,
                rimIntensity:    config.rimIntensity,
                rimDarken:       config.rimDarken,
              }}
              getInputVolume={() => inputVolumeRef.current}
              getOutputVolume={() => outputVolumeRef.current}
              seed={12345}
              size={config.size}
              fluid={{
                shellAmplitude: config.shellAmplitude,
                shellSpeed:     config.shellSpeed,
                turbAmplitude:  config.turbAmplitude,
                turbSpeed:      config.turbSpeed,
                pressureCurve:  config.pressureCurve,
                phaseSpread:    config.phaseSpread,
                coreBrightness: config.coreBrightness,
              }}
            />

            {/* Status readout */}
            <div
              style={{
                marginTop: 20,
                fontSize: 10,
                letterSpacing: "0.22em",
                fontFamily: "inherit",
                color: mic.enabled && uiSpeaking ? config.colors[1] : "rgba(255,255,255,0.12)",
                textShadow: mic.enabled && uiSpeaking
                  ? `0 0 6px ${config.colors[1]}, 0 0 16px ${config.colors[1]}66`
                  : "none",
                transition: "color 0.35s ease, text-shadow 0.35s ease",
              }}
            >
              {mic.status === "off"
                ? "── MIC OFF ──"
                : mic.enabled && uiSpeaking
                ? "◉ SPEAKING / ACTIVE"
                : "○ LISTENING / STILL"}
            </div>

            {/* Corner markers — CRT targeting reticle feel */}
            {(["tl","tr","bl","br"] as const).map((pos) => (
              <div
                key={pos}
                aria-hidden
                style={{
                  position: "absolute",
                  width: 12,
                  height: 12,
                  zIndex: 4,
                  ...(pos.includes("t") ? { top: 12 } : { bottom: 12 }),
                  ...(pos.includes("l") ? { left: 16 } : { right: 16 }),
                  borderTop: pos.includes("t") ? "1px solid rgba(255,255,255,0.08)" : "none",
                  borderBottom: pos.includes("b") ? "1px solid rgba(255,255,255,0.08)" : "none",
                  borderLeft: pos.includes("l") ? "1px solid rgba(255,255,255,0.08)" : "none",
                  borderRight: pos.includes("r") ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              />
            ))}

            <GlobalCRTOverlay config={config} />
          </div>

          {/* ── Right panel ─────────────────────────────────────── */}
          <div
            style={{
              width: 216,
              flexShrink: 0,
              borderLeft: "1px solid var(--t-fg-lo)",
              padding: "12px 14px 12px 12px",
              overflowY: "auto",
              background: "rgba(224,149,16,0.015)",
            }}
          >
            {/* Panel chrome header */}
            <div
              className="ph-lo"
              style={{ fontSize: 10, letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--t-fg-lo)" }}
            >
              ┌── PARAMETERS ─────┐
            </div>

            <ControlPanel
              config={config}
              onChange={handleConfigChange}
              onExport={handleExport}
            />
          </div>
        </div>

        {/* ── Footer bar ──────────────────────────────────────────── */}
        <div
          style={{
            flexShrink: 0,
            borderTop: "1px solid var(--t-fg-lo)",
            padding: "4px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(224,149,16,0.02)",
          }}
        >
          <span className="ph-lo" style={{ fontSize: 9, letterSpacing: "0.1em" }}>
            THREE.JS WEBGL SHADER  ·  WEB AUDIO API  ·  NEXT.JS {" "}16
          </span>
          <span className="ph-lo" style={{ fontSize: 9, letterSpacing: "0.08em" }}>
            SHELL AMP {config.shellAmplitude.toFixed(3)}  ·  TURB {config.turbAmplitude.toFixed(3)}  ·  CURVE {config.pressureCurve.toFixed(2)}
          </span>
          <span className="ph-lo" style={{ fontSize: 9, letterSpacing: "0.1em" }}>
            SIZE {config.size}PX  ·  PRESET: {activePreset ?? "CUSTOM"}
          </span>
        </div>
      </div>
    </TerminalScreen>
  );
}
