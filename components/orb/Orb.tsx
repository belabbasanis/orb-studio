"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders";

export interface OrbFluidConfig {
  shellAmplitude: number;
  shellSpeed: number;
  turbAmplitude: number;
  turbSpeed: number;
  pressureCurve: number;
  phaseSpread: number;
  coreBrightness: number;
}

interface OrbMeshProps {
  colors: [string, string];
  getInputVolume: () => number;
  getOutputVolume: () => number;
  seed: number;
  fluid: OrbFluidConfig;
}

function OrbMesh({ colors, getInputVolume, getOutputVolume, seed, fluid }: OrbMeshProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const color1 = useMemo(() => new THREE.Color(colors[0]), [colors[0]]);
  const color2 = useMemo(() => new THREE.Color(colors[1]), [colors[1]]);

  const uniforms = useMemo(
    () => ({
      u_time:          { value: 0 },
      u_inputVolume:   { value: 0 },
      u_outputVolume:  { value: 0 },
      u_color1:        { value: new THREE.Color(colors[0]) },
      u_color2:        { value: new THREE.Color(colors[1]) },
      u_seed:          { value: seed },
      u_coreBrightness:{ value: fluid.coreBrightness },
      u_shellAmplitude:{ value: fluid.shellAmplitude },
      u_shellSpeed:    { value: fluid.shellSpeed },
      u_turbAmplitude: { value: fluid.turbAmplitude },
      u_turbSpeed:     { value: fluid.turbSpeed },
      u_pressureCurve: { value: fluid.pressureCurve },
      u_phaseSpread:   { value: fluid.phaseSpread },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;

    u.u_time.value         += delta;
    u.u_inputVolume.value   = getInputVolume();
    u.u_outputVolume.value  = getOutputVolume();

    // Sync color and fluid config every frame (ref updates, no re-render)
    u.u_color1.value.set(color1);
    u.u_color2.value.set(color2);
    u.u_seed.value           = seed;
    u.u_coreBrightness.value = fluid.coreBrightness;
    u.u_shellAmplitude.value = fluid.shellAmplitude;
    u.u_shellSpeed.value     = fluid.shellSpeed;
    u.u_turbAmplitude.value  = fluid.turbAmplitude;
    u.u_turbSpeed.value      = fluid.turbSpeed;
    u.u_pressureCurve.value  = fluid.pressureCurve;
    u.u_phaseSpread.value    = fluid.phaseSpread;
  });

  return (
    <mesh>
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
  fluid?: OrbFluidConfig;
}

const DEFAULT_FLUID: OrbFluidConfig = {
  shellAmplitude: 0.025,
  shellSpeed:     0.15,
  turbAmplitude:  0.10,
  turbSpeed:      1.4,
  pressureCurve:  0.6,
  phaseSpread:    6.28,
  coreBrightness: 96,
};

export function Orb({
  colors          = ["#EFFFFF", "#00AFFF"],
  getInputVolume  = () => 0,
  getOutputVolume = () => 0,
  seed            = 12345,
  size            = 220,
  fluid           = DEFAULT_FLUID,
}: OrbProps) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <OrbMesh
          colors={colors}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
          seed={seed}
          fluid={fluid}
        />
      </Canvas>
    </div>
  );
}
