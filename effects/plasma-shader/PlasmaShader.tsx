import { useEffect, useCallback } from "react";
import { useWebGL } from "../../hooks";
import type { RGB } from "../../presets";

interface PlasmaShaderProps {
  speed?: number;
  intensity?: number;
  colors?: RGB[];
  className?: string;
}

const DEFAULT_COLORS: RGB[] = [
  [99, 102, 241],
  [139, 92, 246],
  [34, 211, 238],
];

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_intensity;
uniform vec3 u_color0;
uniform vec3 u_color1;
uniform vec3 u_color2;

vec3 palette(float t) {
  // 3-stop gradient
  vec3 c;
  if (t < 0.5) {
    c = mix(u_color0, u_color1, t * 2.0);
  } else {
    c = mix(u_color1, u_color2, (t - 0.5) * 2.0);
  }
  return c;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = uv;
  p.x *= aspect;

  vec2 mouseUV = u_mouse / u_resolution;
  mouseUV.x *= aspect;
  float t = u_time * u_speed;

  // Mouse shifts phase slightly
  float mousePhase = length(p - mouseUV) * 2.0;

  float v = 0.0;
  v += sin(p.x * 10.0 + t + mousePhase * 0.5);
  v += sin(p.y * 10.0 + t * 1.1);
  v += sin((p.x + p.y) * 10.0 + t * 0.9);
  v += sin(sqrt(p.x * p.x + p.y * p.y) * 10.0 + t * 1.3);

  // Normalize to [0,1]
  float n = (v / 4.0 + 1.0) * 0.5;
  n = mix(0.5, n, u_intensity);

  vec3 col = palette(fract(n));
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function PlasmaShader({
  speed = 1,
  intensity = 0.5,
  colors = DEFAULT_COLORS,
  className,
}: PlasmaShaderProps) {
  const { canvasRef, setUniform, startLoop } = useWebGL({ fragmentShader: FRAGMENT_SHADER });

  const updateUniforms = useCallback(() => {
    setUniform("u_speed", speed);
    setUniform("u_intensity", intensity);

    const c0 = colors[0] ?? DEFAULT_COLORS[0];
    const c1 = colors[1] ?? DEFAULT_COLORS[1];
    const c2 = colors[2] ?? DEFAULT_COLORS[2];
    setUniform("u_color0", [c0[0] / 255, c0[1] / 255, c0[2] / 255]);
    setUniform("u_color1", [c1[0] / 255, c1[1] / 255, c1[2] / 255]);
    setUniform("u_color2", [c2[0] / 255, c2[1] / 255, c2[2] / 255]);
  }, [speed, intensity, colors, setUniform]);

  useEffect(() => {
    updateUniforms();
  }, [updateUniforms]);

  useEffect(() => {
    const cleanup = startLoop();
    return cleanup;
  }, [startLoop]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setUniform("u_mouse", [e.clientX, e.clientY]);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [setUniform]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "absolute inset-0 w-full h-full pointer-events-none"}
    />
  );
}
