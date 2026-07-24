import * as THREE from 'three';

export const nebulaVertexShader = /* glsl */ `
attribute float aOrganic;
attribute float aSpecies;
attribute float aScale;

uniform float uMorph;
uniform float uTime;
uniform float uGridHalf;
uniform float uMorphSeed;

varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec3 vColor;
varying float vOrganic;
varying float vSpecies;
varying float vFresnel;

vec3 morphTorus(vec3 p) {
  float majorRadius = uGridHalf * 0.7;
  float minorRadius = uGridHalf * 0.24;
  float radius = length(p);
  float theta = atan(p.y, p.x);
  float phi = radius > 0.001
    ? acos(clamp(p.z / radius, -1.0, 1.0))
    : 1.5707963;
  float u = theta;
  float normalizedRadius = min(radius / uGridHalf, 1.0);
  float v = phi + normalizedRadius * 6.2831853;
  return vec3(
    (majorRadius + minorRadius * cos(v)) * cos(u),
    (majorRadius + minorRadius * cos(v)) * sin(u),
    minorRadius * sin(v)
  );
}

vec3 morphHelix(vec3 p) {
  float r = length(p.xz);
  float theta = atan(p.z, p.x);
  float turns = theta + p.y * 0.35;
  float helixR = mix(r, uGridHalf * 0.55, 0.65);
  return vec3(
    cos(turns) * helixR,
    p.y * 0.55 + sin(turns * 2.0) * 2.0,
    sin(turns) * helixR
  );
}

float bioHash(vec3 p, float seed) {
  return fract(sin(dot(p + seed, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
}

float bioHash1(float seed, float salt) {
  return fract(sin(seed * 127.1 + salt * 311.7) * 43758.5453);
}

// Sinoidal bio-evolution shell (radiolarian / budding organism)
vec3 morphBio(vec3 p) {
  float s = uMorphSeed;
  float r0 = length(p);
  float nr = min(r0 / max(uGridHalf, 0.001), 1.0);
  float theta = atan(p.y, p.x);
  float phi = r0 > 0.001
    ? acos(clamp(p.z / r0, -1.0, 1.0))
    : 1.5707963;

  // Global evolution genes from seed (shared by whole organism)
  float g1 = bioHash1(s, 1.0);
  float g2 = bioHash1(s, 2.0);
  float g3 = bioHash1(s, 3.0);
  float kTheta = 4.0 + floor(g1 * 5.0);
  float kPhi = 3.0 + floor(g2 * 4.0);
  float budCount = 2.0 + floor(g3 * 3.0);

  // Local tissue phase jitter
  float h = bioHash(p, s);
  float h2 = bioHash(p.yzx, s * 1.37 + 2.1);

  float sinoid =
    0.50 * sin(kTheta * theta + s * 6.2831853 + g3 * 4.0)
    + 0.32 * sin(kPhi * phi + kTheta * 0.45 * theta + g2 * 6.2831853)
    + 0.22 * sin((kTheta + kPhi) * 0.5 * (theta + phi) + s * 2.4)
    + 0.14 * sin(nr * 10.0 - phi * 2.5 + s * 1.7)
    + 0.08 * sin(theta * 2.0 + phi * 3.0 + h * 6.2831853);

  float budAxis = theta * (1.0 + g1) - phi * (1.5 + g2) + s;
  float buds = sin(budAxis * budCount) * cos(phi * 2.0 + s + h2);
  sinoid += 0.22 * buds;

  float radius = uGridHalf * (0.40 + 0.24 * nr) * (1.0 + 0.52 * sinoid);
  float stretch = 1.0 + 0.22 * (sin(phi * 3.0 + g1 * 6.2831853) * 0.5 + buds * 0.35);
  vec3 dir = vec3(
    sin(phi) * cos(theta),
    cos(phi) * stretch + 0.18 * sinoid * sin(phi + buds),
    sin(phi) * sin(theta)
  );
  float len = length(dir);
  if (len > 0.001) dir /= len;
  return dir * radius;
}

void main() {
  vColor = instanceColor;
  vOrganic = aOrganic;
  vSpecies = aSpecies;

  // Cube lattice position stored in instance translation (identity scale on CPU)
  vec3 cubePos = instanceMatrix[3].xyz;
  float t = clamp(uMorph, 0.0, 1.0);
  // 0→⅓ cube→torus, ⅓→⅔ torus→helix, ⅔→1 helix→bio
  float phase = t * 3.0;
  vec3 torusPos = morphTorus(cubePos);
  vec3 helixPos = morphHelix(cubePos);
  vec3 bioPos = morphBio(cubePos);
  vec3 worldCenter = phase < 1.0
    ? mix(cubePos, torusPos, phase)
    : phase < 2.0
      ? mix(torusPos, helixPos, phase - 1.0)
      : mix(helixPos, bioPos, phase - 2.0);

  float pulse = 1.0 + 0.08 * sin(uTime * 2.0 + cubePos.x + cubePos.y);
  float sScale = max(aScale, 0.0) * pulse;

  vec3 transformed = position * sScale + worldCenter;
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vWorldNormal = normalize(mat3(modelViewMatrix) * normal);
  vViewDir = normalize(-mvPosition.xyz);
  vFresnel = pow(1.0 - max(dot(vViewDir, vWorldNormal), 0.0), 2.5);
}
`;

export const nebulaFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uExpand;

varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec3 vColor;
varying float vOrganic;
varying float vSpecies;
varying float vFresnel;

void main() {
  vec3 base = vColor;
  // Species tint overlays
  if (vSpecies > 1.5) {
    base = mix(base, vec3(0.7, 0.35, 1.0), 0.35);
  } else if (vSpecies > 0.5) {
    base = mix(base, vec3(1.0, 0.7, 0.2), 0.35);
  } else {
    base = mix(base, vec3(0.2, 0.9, 1.0), 0.2);
  }

  float rim = vFresnel;
  vec3 emissive = base * (0.15 + 0.55 * vOrganic + 0.35 * rim);
  emissive += vec3(0.1, 0.4, 0.6) * rim * (0.5 + 0.5 * uExpand);

  float light = 0.35 + 0.65 * max(dot(vWorldNormal, normalize(vec3(0.4, 0.8, 0.3))), 0.0);
  vec3 color = base * light + emissive;

  // Bloom-friendly boost for organic cores
  color += base * vOrganic * 0.8;

  gl_FragColor = vec4(color, 1.0);
}
`;

export const hazeVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const hazeFragmentShader = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uExpand;
uniform float uPopulation;
uniform float uStrength;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec4 texel = texture2D(tDiffuse, vUv);
  vec2 centered = vUv - 0.5;
  float dist = length(centered);
  float vignette = smoothstep(0.95, 0.25, dist);

  float n = hash(vUv * 3.0 + uTime * 0.05);
  vec3 hazeTint = mix(
    vec3(0.02, 0.08, 0.18),
    vec3(0.08, 0.02, 0.16),
    uExpand
  );
  hazeTint += vec3(0.05, 0.12, 0.2) * uPopulation * 0.15;

  vec3 color = texel.rgb;
  color = mix(color, color + hazeTint * n, uStrength * 0.35);
  color *= mix(0.75, 1.0, vignette);
  color += hazeTint * (1.0 - vignette) * uStrength * 0.4;

  gl_FragColor = vec4(color, texel.a);
}
`;

export function createNebulaMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uGridHalf: { value: 25 },
      uExpand: { value: 1 },
      uMorphSeed: { value: 1.0 },
    },
    vertexShader: nebulaVertexShader,
    fragmentShader: nebulaFragmentShader,
  });
}

export function createHazeUniforms() {
  return {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uExpand: { value: 1 },
    uPopulation: { value: 0.1 },
    uStrength: { value: 1 },
  };
}
