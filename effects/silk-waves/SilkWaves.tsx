import { useEffect, useCallback } from "react";
import { useWebGL, useMousePosition } from "../../hooks";
import type { RGB } from "../../presets";

interface SilkWavesProps {
  strandCount?: number;
  amplitude?: number;
  mouseReactive?: boolean;
  colors?: RGB[];
  className?: string;
}

const DEFAULT_COLORS: RGB[] = [
  [99, 102, 241],
  [139, 92, 246],
  [34, 211, 238],
  [167, 139, 250],
  [244, 114, 182],
];

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform int u_strandCount;
uniform float u_amplitude;
uniform vec3 u_colors[5];
uniform float u_mouseReactive;

// Simple hash-based pseudo-noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;

  vec2 mouseUV = u_mouse / u_resolution;
  mouseUV.y = 1.0 - mouseUV.y;

  vec3 color = vec3(0.0);
  float totalAlpha = 0.0;

  int count = u_strandCount < 1 ? 1 : (u_strandCount > 5 ? 5 : u_strandCount);

  for (int i = 0; i < 5; i++) {
    if (i >= count) break;

    float fi = float(i);
    float t = fi / float(count - 1 < 1 ? 1 : count - 1);

    float yBase = 0.1 + t * 0.8;
    float freq = 2.5 + fi * 0.8;
    float speed = 0.3 + fi * 0.15;
    float noiseScale = 3.0 + fi * 0.5;
    float thickness = 0.04 + fi * 0.005;

    float n = noise(vec2(uv.x * noiseScale + u_time * 0.2, fi * 10.0)) * 2.0 - 1.0;

    // Mouse distortion
    float mouseDist = distance(uv, mouseUV);
    float mouseInfluence = u_mouseReactive * smoothstep(0.3, 0.0, mouseDist) * 0.08;
    float mousePush = (uv.y - mouseUV.y) * mouseInfluence;

    float y = yBase
      + sin(uv.x * freq + u_time * speed) * u_amplitude * 0.5
      + sin(uv.x * freq * 0.6 + u_time * speed * 0.7 + 1.5) * u_amplitude * 0.25
      + n * u_amplitude * 0.3
      + mousePush;

    float dist = abs(uv.y - y);
    float alpha = smoothstep(thickness, 0.0, dist);
    alpha *= 0.6 + 0.4 * sin(uv.x * 3.0 + u_time * 0.5 + fi);

    color += u_colors[i] * alpha;
    totalAlpha += alpha;
  }

  color = color / max(totalAlpha, 0.001) * min(totalAlpha, 1.0);
  gl_FragColor = vec4(color, min(totalAlpha * 0.8, 0.85));
}
`;

export default function SilkWaves({
  strandCount = 5,
  amplitude = 50,
  mouseReactive = true,
  colors = DEFAULT_COLORS,
  className,
}: SilkWavesProps) {
  const { canvasRef, setUniform, startLoop } = useWebGL({ fragmentShader: FRAGMENT_SHADER });
  const { position: mousePos } = useMousePosition({ scope: "window" });

  const updateUniforms = useCallback(() => {
    const count = Math.max(1, Math.min(5, strandCount));
    setUniform("u_strandCount", count);
    setUniform("u_amplitude", amplitude / 600);
    setUniform("u_mouseReactive", mouseReactive ? 1 : 0);

    const colorArray = Array.from({ length: 5 }, (_, i) => {
      const c = colors[i % colors.length];
      return [c[0] / 255, c[1] / 255, c[2] / 255];
    });
    for (let i = 0; i < 5; i++) {
      setUniform(`u_colors[${i}]`, colorArray[i]);
    }
  }, [strandCount, amplitude, mouseReactive, colors, setUniform]);

  useEffect(() => {
    updateUniforms();
  }, [updateUniforms]);

  useEffect(() => {
    const cleanup = startLoop();
    return cleanup;
  }, [startLoop]);

  // Update mouse uniform each frame via event-driven approach
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const dpr = window.devicePixelRatio || 1;
      setUniform("u_mouse", [e.clientX * dpr, e.clientY * dpr]);
    };
    if (mouseReactive) {
      window.addEventListener("mousemove", handler);
    }
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseReactive, setUniform]);

  void mousePos;

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "absolute inset-0 w-full h-full pointer-events-none"}
    />
  );
}
