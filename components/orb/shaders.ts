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
    float pressure = pow(clamp(volume, 0.0, 1.0), u_pressureCurve);
    float seedOffset = u_seed * 0.001;

    float t_shell = u_time * u_shellSpeed;
    float s1 = snoise(position * 1.2 + vec3(t_shell          + seedOffset));
    float s2 = snoise(position * 2.2 + vec3(t_shell * 0.7    + seedOffset + 1.9));
    float shellDisp = (s1 * 0.6 + s2 * 0.4) * u_shellAmplitude;

    vec3 normPos = normalize(position);
    float phase = dot(normPos, vec3(0.618, 0.382, 0.500)) * u_phaseSpread + seedOffset;

    float t_turb = u_time * u_turbSpeed;
    float t1 = snoise(position * 3.8  + vec3(t_turb           + phase));
    float t2 = snoise(position * 7.0  + vec3(t_turb * 0.65    + phase + 2.094));
    float t3 = snoise(position * 11.0 + vec3(t_turb * 0.40    + phase + 4.189));

    float blobDisp = (t1 * 0.57 + t2 * 0.29 + t3 * 0.14) * u_turbAmplitude * pressure;

    float dispGain = 1.85;
    float shellDispScaled = shellDisp * dispGain;
    float blobDispScaled = blobDisp * dispGain;
    float displacement = shellDispScaled + blobDispScaled;

    vec3 newPosition = position + normal * displacement;

    vDisplace  = blobDispScaled;
    vPressure  = pressure;
    vNormal    = normalize(normalMatrix * normal);
    vPosition  = newPosition;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3  u_color0;
  uniform vec3  u_color1;
  uniform vec3  u_color2;
  uniform vec3  u_color3;
  uniform float u_time;
  uniform float u_seed;
  uniform float u_coreBrightness;
  uniform float u_shaderFilmGrain;
  uniform float u_innerBloom;
  uniform float u_rimPower;
  uniform float u_rimIntensity;
  uniform float u_rimDarken;

  varying vec3  vNormal;
  varying vec3  vPosition;
  varying float vDisplace;
  varying float vPressure;

  vec3 sampleSpectrum(float t) {
    t = clamp(t, 0.0, 1.0);
    if (t < 0.3333333) {
      float k = t * 3.0;
      return mix(u_color0, u_color1, smoothstep(0.0, 1.0, k));
    }
    if (t < 0.6666666) {
      float k = (t - 0.3333333) * 3.0;
      return mix(u_color1, u_color2, smoothstep(0.0, 1.0, k));
    }
    float k = (t - 0.6666666) * 3.0;
    return mix(u_color2, u_color3, smoothstep(0.0, 1.0, k));
  }

  void main() {
    vec3  viewDir = normalize(cameraPosition - vPosition);
    float NdotV   = max(dot(vNormal, viewDir), 0.0);

    float fresnelRaw = 1.0 - NdotV;
    float fresnel    = pow(fresnelRaw, u_rimPower);
    float rimBand    = fresnel * smoothstep(0.12, 0.92, fresnelRaw);
    float fresnelBoost = 1.0 + vPressure * 0.8;

    float blend = clamp(vDisplace * 8.0 + 0.5 + sin(u_time * 0.2) * 0.08, 0.0, 1.0);
    float tSpec = clamp(
      blend * 0.45 + NdotV * 0.22 + fresnelRaw * 0.38 + sin(u_time * 0.15) * 0.04,
      0.0,
      1.0
    );
    vec3 baseColor = sampleSpectrum(tSpec);
    baseColor *= (1.0 - u_rimDarken * rimBand);

    vec3 rimColor = mix(u_color2, u_color3, 0.55) * rimBand * u_rimIntensity * fresnelBoost;

    float coreBoost = 1.0 + vPressure * 1.2;
    float innerMix = u_innerBloom * (0.32 + vPressure * 0.68);
    float innerWide  = pow(NdotV, 1.65) * innerMix * 0.42;
    float innerTight = pow(NdotV, 11.0) * innerMix * 1.35;
    vec3 coreWide  = sampleSpectrum(0.12) * innerWide * coreBoost;
    vec3 coreTight = sampleSpectrum(0.28) * innerTight * coreBoost * 1.1;

    float brightness = u_coreBrightness / 100.0;
    vec3 finalColor = (baseColor + rimColor + coreWide + coreTight) * brightness;
    finalColor *= 1.0 + vPressure * 0.25;

    float tFilm = floor(u_time * 20.0);
    vec2 fgc = gl_FragCoord.xy + vec2(u_seed * 0.01, u_seed * 0.007) + tFilm * 0.5;
    float filmHash = fract(sin(dot(fgc, vec2(12.9898, 78.233))) * 43758.5453);
    finalColor += (filmHash - 0.5) * u_shaderFilmGrain;
    finalColor = max(finalColor, 0.0);

    gl_FragColor = vec4(finalColor, 0.95);
  }
`;
