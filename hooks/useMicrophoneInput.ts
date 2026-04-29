"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export type MicStatus =
  | "off"
  | "requesting"
  | "live"
  | "permission-denied"
  | "unsupported"
  | "error";

export interface MicrophoneInput {
  enabled: boolean;
  status: MicStatus;
  level: number;
  samples: number[];
  start: () => Promise<void>;
  stop: () => void;
}

const SAMPLE_COUNT = 64;
const SMOOTHING = 0.85;

export function useMicrophoneInput(options?: {
  noiseGate?: number;
  sensitivity?: number;
  smoothing?: number;
}): MicrophoneInput {
  const noiseGate = options?.noiseGate ?? 0.006;
  const sensitivity = options?.sensitivity ?? 1.0;
  const smoothing = options?.smoothing ?? 0.72;

  const [status, setStatus] = useState<MicStatus>("off");
  const [level, setLevel] = useState(0);
  const [samples, setSamples] = useState<number[]>(Array(SAMPLE_COUNT).fill(0));

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const smoothedLevelRef = useRef(0);
  const timeDataRef = useRef<Float32Array<ArrayBuffer>>(new Float32Array(SAMPLE_COUNT) as Float32Array<ArrayBuffer>);
  const freqDataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(128) as Uint8Array<ArrayBuffer>);

  const poll = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    analyser.getFloatTimeDomainData(timeDataRef.current);
    analyser.getByteFrequencyData(freqDataRef.current);

    // RMS
    let sum = 0;
    for (let i = 0; i < timeDataRef.current.length; i++) {
      sum += timeDataRef.current[i] ** 2;
    }
    const rms = Math.sqrt(sum / timeDataRef.current.length);

    // Peak
    let peak = 0;
    for (let i = 0; i < timeDataRef.current.length; i++) {
      const abs = Math.abs(timeDataRef.current[i]);
      if (abs > peak) peak = abs;
    }

    const raw = Math.max(rms, peak * 0.5) * sensitivity;
    const gated = raw < noiseGate ? 0 : raw;
    smoothedLevelRef.current = smoothedLevelRef.current * smoothing + gated * (1 - smoothing);

    const finalLevel = Math.min(smoothedLevelRef.current * 2.5, 1);

    // Build waveform samples from time domain
    const step = Math.floor(timeDataRef.current.length / SAMPLE_COUNT);
    const newSamples: number[] = [];
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      newSamples.push(timeDataRef.current[i * step] ?? 0);
    }

    setLevel(finalLevel);
    setSamples(newSamples);

    rafRef.current = requestAnimationFrame(poll);
  }, [noiseGate, sensitivity, smoothing]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });

      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = SMOOTHING;
      source.connect(analyser);

      streamRef.current = stream;
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      timeDataRef.current = new Float32Array(analyser.fftSize) as Float32Array<ArrayBuffer>;
      freqDataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;

      setStatus("live");
      rafRef.current = requestAnimationFrame(poll);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setStatus("permission-denied");
      } else {
        setStatus("error");
      }
    }
  }, [poll]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close();
    streamRef.current = null;
    ctxRef.current = null;
    analyserRef.current = null;
    smoothedLevelRef.current = 0;
    setStatus("off");
    setLevel(0);
    setSamples(Array(SAMPLE_COUNT).fill(0));
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      ctxRef.current?.close();
    };
  }, []);

  return {
    enabled: status === "live",
    status,
    level,
    samples,
    start,
    stop,
  };
}
