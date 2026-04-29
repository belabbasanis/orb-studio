export const vertexShader = /* glsl */ `
  uniform float u_time;
  uniform float u_inputVolume;
  uniform float u_outputVolume;
  uniform float u_seed;
  uniform float u_shellAmplitude;
  uniform float u_shellSpeed;
  uniform float u_turbAmplitude;
  uniform float u_turbSpeed;
  uniform float u_pressureCurve;
  uniform float u_phaseSpread;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplace;
  varying float vPressure;

  // 3D Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    float volume = max(u_inputVolume, u_outputVolume);

    // Pressure: non-linear mapping so quiet audio still registers
    float pressure = pow(clamp(volume, 0.0, 1.0), u_pressureCurve);

    float seedOffset = u_seed * 0.001;

    // ── SHELL: slow, constant, no audio coupling ─────────────────────────────
    // Two low-frequency noise layers for gentle ambient breathing.
    // Speed is fixed — audio never touches it.
    float t_shell = u_time * u_shellSpeed;
    float s1 = snoise(position * 1.2 + vec3(t_shell          + seedOffset));
    float s2 = snoise(position * 2.2 + vec3(t_shell * 0.7    + seedOffset + 1.9));
    float shellDisp = (s1 * 0.6 + s2 * 0.4) * u_shellAmplitude;

    // ── INTERNAL TURBULENCE: audio-driven, phase-offset per region ───────────
    // Phase is derived from the vertex's position on the unit sphere using a
    // golden-ratio-weighted dot product. No two antipodal regions share a phase,
    // so blobs interfere rather than pulse in sync (prevents the spinning look).
    vec3 normPos = normalize(position);
    float phase = dot(normPos, vec3(0.618, 0.382, 0.500)) * u_phaseSpread + seedOffset;

    float t_turb = u_time * u_turbSpeed;
    float t1 = snoise(position * 3.8  + vec3(t_turb           + phase));
    float t2 = snoise(position * 7.0  + vec3(t_turb * 0.65    + phase + 2.094));
    float t3 = snoise(position * 11.0 + vec3(t_turb * 0.40    + phase + 4.189));

    // Relative weights keep the three frequencies in ~4:2:1 ratio.
    // u_turbAmplitude is the overall ceiling; pressure gates how much fires.
    float blobDisp = (t1 * 0.57 + t2 * 0.29 + t3 * 0.14) * u_turbAmplitude * pressure;

    float displacement = shellDisp + blobDisp;

    vec3 newPosition = position + normal * displacement;

    // Pass only the audio-driven part to the fragment shader for coloring
    vDisplace  = blobDisp;
    vPressure  = pressure;
    vNormal    = normalize(normalMatrix * normal);
    vPosition  = newPosition;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3  u_color1;
  uniform vec3  u_color2;
  uniform float u_time;
  uniform float u_coreBrightness;

  varying vec3  vNormal;
  varying vec3  vPosition;
  varying float vDisplace;
  varying float vPressure;

  void main() {
    vec3  viewDir = normalize(cameraPosition - vPosition);
    float NdotV   = max(dot(vNormal, viewDir), 0.0);

    // Fresnel rim — edge glow tightens and brightens under pressure
    float fresnel      = pow(1.0 - NdotV, 2.5);
    float fresnelBoost = 1.0 + vPressure * 0.8;
    vec3  fresnelColor = mix(u_color2, vec3(1.0), 0.5) * fresnel * fresnelBoost;

    // Base color driven by internal blob displacement — slow ambient sine keeps
    // it alive even at silence, pressure shifts it toward secondary hue
    float blend     = clamp(vDisplace * 8.0 + 0.5 + sin(u_time * 0.2) * 0.08, 0.0, 1.0);
    vec3  baseColor = mix(u_color1, u_color2, blend);

    // Core inner glow — amplified by pressure, not by a flat audio add
    float coreShape  = pow(NdotV, 4.0);
    float coreBoost  = 1.0 + vPressure * 1.2;
    vec3  coreColor  = u_color1 * coreShape * coreBoost * 0.5;

    float brightness = u_coreBrightness / 100.0;
    vec3  finalColor = (baseColor + fresnelColor + coreColor) * brightness;

    // Gentle overall brightening under pressure — not a linear volume add
    finalColor *= 1.0 + vPressure * 0.25;

    gl_FragColor = vec4(finalColor, 0.95);
  }
`;
