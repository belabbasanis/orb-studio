"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders";

interface OrbMeshProps {
  colors: [string, string];
  getInputVolume: () => number;
  getOutputVolume: () => number;
  agentState: "idle" | "listening" | "speaking" | null;
  seed: number;
}

function OrbMesh({ colors, getInputVolume, getOutputVolume, agentState, seed }: OrbMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const color1 = useMemo(() => new THREE.Color(colors[0]), [colors[0]]);
  const color2 = useMemo(() => new THREE.Color(colors[1]), [colors[1]]);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_inputVolume: { value: 0 },
      u_outputVolume: { value: 0 },
      u_color1: { value: color1 },
      u_color2: { value: color2 },
      u_coreBrightness: { value: 96 },
      u_seed: { value: seed },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // keep colors in sync without re-creating uniforms
  uniforms.u_color1.value = color1;
  uniforms.u_color2.value = color2;
  uniforms.u_seed.value = seed;

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.u_time.value += delta;
    u.u_inputVolume.value = getInputVolume();
    u.u_outputVolume.value = getOutputVolume();
  });

  const isActive = agentState === "listening" || agentState === "speaking";

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

export interface OrbProps {
  colors?: [string, string];
  getInputVolume?: () => number;
  getOutputVolume?: () => number;
  agentState?: "idle" | "listening" | "speaking" | null;
  seed?: number;
  size?: number;
}

export function Orb({
  colors = ["#EFFFFF", "#00AFFF"],
  getInputVolume = () => 0,
  getOutputVolume = () => 0,
  agentState = null,
  seed = 12345,
  size = 220,
}: OrbProps) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        <OrbMesh
          colors={colors}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
          agentState={agentState}
          seed={seed}
        />
      </Canvas>
    </div>
  );
}
