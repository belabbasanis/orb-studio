"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DEFAULT_CONFIG } from "@/lib/presets";
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

export interface OrbLookConfig {
  shaderFilmGrain: number;
  innerBloom: number;
  rimPower: number;
  rimIntensity: number;
  rimDarken: number;
}

interface OrbMeshProps {
  colors: [string, string, string, string];
  look: OrbLookConfig;
  getInputVolume: () => number;
  getOutputVolume: () => number;
  seed: number;
  fluid: OrbFluidConfig;
}

function OrbMesh({
  colors,
  look,
  getInputVolume,
  getOutputVolume,
  seed,
  fluid,
}: OrbMeshProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const c0 = useMemo(() => new THREE.Color(colors[0]), [colors[0]]);
  const c1 = useMemo(() => new THREE.Color(colors[1]), [colors[1]]);
  const c2 = useMemo(() => new THREE.Color(colors[2]), [colors[2]]);
  const c3 = useMemo(() => new THREE.Color(colors[3]), [colors[3]]);

  const uniforms = useMemo(
    () => ({
      u_time:           { value: 0 },
      u_inputVolume:    { value: 0 },
      u_outputVolume:   { value: 0 },
      u_color0:         { value: new THREE.Color(colors[0]) },
      u_color1:         { value: new THREE.Color(colors[1]) },
      u_color2:         { value: new THREE.Color(colors[2]) },
      u_color3:         { value: new THREE.Color(colors[3]) },
      u_seed:           { value: seed },
      u_coreBrightness: { value: fluid.coreBrightness },
      u_shellAmplitude: { value: fluid.shellAmplitude },
      u_shellSpeed:     { value: fluid.shellSpeed },
      u_turbAmplitude:  { value: fluid.turbAmplitude },
      u_turbSpeed:      { value: fluid.turbSpeed },
      u_pressureCurve:  { value: fluid.pressureCurve },
      u_phaseSpread:    { value: fluid.phaseSpread },
      u_shaderFilmGrain:{ value: look.shaderFilmGrain },
      u_innerBloom:     { value: look.innerBloom },
      u_rimPower:       { value: look.rimPower },
      u_rimIntensity:   { value: look.rimIntensity },
      u_rimDarken:      { value: look.rimDarken },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;

    u.u_time.value          += delta;
    u.u_inputVolume.value    = getInputVolume();
    u.u_outputVolume.value   = getOutputVolume();

    u.u_color0.value.set(c0);
    u.u_color1.value.set(c1);
    u.u_color2.value.set(c2);
    u.u_color3.value.set(c3);
    u.u_seed.value            = seed;
    u.u_coreBrightness.value  = fluid.coreBrightness;
    u.u_shellAmplitude.value  = fluid.shellAmplitude;
    u.u_shellSpeed.value      = fluid.shellSpeed;
    u.u_turbAmplitude.value   = fluid.turbAmplitude;
    u.u_turbSpeed.value       = fluid.turbSpeed;
    u.u_pressureCurve.value   = fluid.pressureCurve;
    u.u_phaseSpread.value     = fluid.phaseSpread;
    u.u_shaderFilmGrain.value = look.shaderFilmGrain;
    u.u_innerBloom.value      = look.innerBloom;
    u.u_rimPower.value        = look.rimPower;
    u.u_rimIntensity.value    = look.rimIntensity;
    u.u_rimDarken.value       = look.rimDarken;
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
  colors?: [string, string, string, string];
  look?: Partial<OrbLookConfig>;
  getInputVolume?: () => number;
  getOutputVolume?: () => number;
  seed?: number;
  size?: number;
  fluid?: OrbFluidConfig;
}

const DEFAULT_FLUID: OrbFluidConfig = {
  shellAmplitude: 0.159,
  shellSpeed:     0.18,
  turbAmplitude:  0.42,
  turbSpeed:      1.5,
  pressureCurve:  0.3,
  phaseSpread:    8.8,
  coreBrightness: 96,
};

/** One layout box = canvas size so flex/grid reserve full paint area (no nested clip boxes). */
const VIEW_BLEED = 1.58;
/** Frustum margin for heavy shell + turb displacement. */
const CAMERA_Z = 3.72;
const CAMERA_FOV = 54;

export function Orb({
  colors: colorsProp,
  look: lookProp,
  getInputVolume  = () => 0,
  getOutputVolume = () => 0,
  seed            = 12345,
  size            = 220,
  fluid           = DEFAULT_FLUID,
}: OrbProps) {
  const colors = colorsProp ?? DEFAULT_CONFIG.colors;
  const look: OrbLookConfig = {
    shaderFilmGrain: lookProp?.shaderFilmGrain ?? DEFAULT_CONFIG.shaderFilmGrain,
    innerBloom:     lookProp?.innerBloom ?? DEFAULT_CONFIG.innerBloom,
    rimPower:       lookProp?.rimPower ?? DEFAULT_CONFIG.rimPower,
    rimIntensity:   lookProp?.rimIntensity ?? DEFAULT_CONFIG.rimIntensity,
    rimDarken:      lookProp?.rimDarken ?? DEFAULT_CONFIG.rimDarken,
  };

  const canvasPx = Math.round(size * VIEW_BLEED);

  return (
    <div
      style={{
        width: canvasPx,
        height: canvasPx,
        position: "relative",
        flexShrink: 0,
      }}
      className="relative"
    >
      <Canvas
        camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}
        gl={{ antialias: true, alpha: true }}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: "transparent",
        }}
      >
        <OrbMesh
          colors={colors}
          look={look}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
          seed={seed}
          fluid={fluid}
        />
      </Canvas>
    </div>
  );
}
