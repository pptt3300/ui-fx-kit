import { useEffect, useCallback } from "react";
import { useWebGL } from "../../hooks";
import type { RGB } from "../../presets";
import { resolvePalette } from "../../presets/resolve";

interface LightRaysProps {
  rayCount?: number;
  palette?: string;
  color?: RGB;
  mouseReactive?: boolean;
  className?: string;
}

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_rayCount;
uniform vec3 u_color;
uniform float u_mouseReactive;

float hash(float n) {
  return fract(sin(n) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(i + vec2(1,0), vec2(127.1, 311.7))) * 43758.5453);
  float c = fract(sin(dot(i + vec2(0,1), vec2(127.1, 311.7))) * 43758.5453);
  float d = fract(sin(dot(i + vec2(1,1), vec2(127.1, 311.7))) * 43758.5453);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;

  // Light source position: mouse-reactive or top-center
  vec2 source;
  if (u_mouseReactive > 0.5) {
    source = u_mouse / u_resolution;
    source.y = 1.0 - source.y;
  } else {
    source = vec2(0.5, 0.0);
  }

  vec2 dir = uv - source;
  float dist = length(dir);
  float angle = atan(dir.y, dir.x);

  // Distance falloff
  float falloff = 1.0 / (1.0 + dist * dist * 4.0);

  // Angular modulation: create discrete rays
  float rays = 0.0;
  float count = u_rayCount;
  for (int i = 0; i < 24; i++) {
    if (float(i) >= count) break;
    float rayAngle = (float(i) / count) * 6.28318 + u_time * 0.05;
    float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);

    // Ray width with slight noise on edges
    float edgeNoise = noise(vec2(angle * 3.0 + float(i), u_time * 0.3)) * 0.1;
    float rayWidth = 0.08 + edgeNoise;
    float rayStrength = smoothstep(rayWidth, 0.0, angleDiff);

    // Vary brightness per ray
    rayStrength *= 0.5 + 0.5 * hash(float(i) * 3.7 + 1.0);

    rays += rayStrength;
  }

  rays = min(rays, 1.0);

  // Combine: falloff * rays
  float intensity = falloff * rays * 0.35;

  // Add soft radial glow at source
  float sourceGlow = smoothstep(0.15, 0.0, dist) * 0.2;
  intensity += sourceGlow;

  gl_FragColor = vec4(u_color * intensity, intensity);
}
`;

export default function LightRays({
  rayCount = 12,
  palette,
  color,
  mouseReactive = true,
  className,
}: LightRaysProps) {
  const resolvedColor = color ?? resolvePalette(palette, 'glow', [255, 240, 200] as RGB);
  const { canvasRef, setUniform, startLoop } = useWebGL({ fragmentShader: FRAGMENT_SHADER });

  const updateUniforms = useCallback(() => {
    const count = Math.max(1, Math.min(24, rayCount));
    setUniform("u_rayCount", count);
    setUniform("u_color", [resolvedColor[0] / 255, resolvedColor[1] / 255, resolvedColor[2] / 255]);
    setUniform("u_mouseReactive", mouseReactive ? 1 : 0);
  }, [rayCount, resolvedColor, mouseReactive, setUniform]);

  useEffect(() => {
    updateUniforms();
  }, [updateUniforms]);

  useEffect(() => {
    const cleanup = startLoop();
    return cleanup;
  }, [startLoop]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (mouseReactive) {
        const dpr = window.devicePixelRatio || 1;
        setUniform("u_mouse", [e.clientX * dpr, e.clientY * dpr]);
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseReactive, setUniform]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={className ? undefined : { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
