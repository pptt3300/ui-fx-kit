import { useEffect, useCallback } from "react";
import { useWebGL, useMousePosition } from "../../hooks";
import type { RGB } from "../../presets";

interface LiquidEtherProps {
  speed?: number;
  mouseStrength?: number;
  colors?: RGB[];
  className?: string;
}

const DEFAULT_COLORS: RGB[] = [
  [30, 10, 60],
  [80, 20, 120],
  [20, 60, 100],
];

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_mouse_strength;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;

// Permutation polynomial for Perlin noise
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = dot(hash2(i) * 2.0 - 1.0, f);
  float b = dot(hash2(i + vec2(1.0, 0.0)) * 2.0 - 1.0, f - vec2(1.0, 0.0));
  float c = dot(hash2(i + vec2(0.0, 1.0)) * 2.0 - 1.0, f - vec2(0.0, 1.0));
  float d = dot(hash2(i + vec2(1.0, 1.0)) * 2.0 - 1.0, f - vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 0.5 + 0.5;
}

float fbm(vec2 p) {
  float val = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    val += amp * noise(p);
    p *= 2.1;
    amp *= 0.48;
  }
  return val;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  float t = u_time * u_speed;

  vec2 p = vec2(uv.x * aspect, uv.y);

  // Mouse vortex distortion
  vec2 mouseUV = vec2(u_mouse.x / u_resolution.x * aspect, u_mouse.y / u_resolution.y);
  vec2 toMouse = p - mouseUV;
  float mouseDist = length(toMouse);
  vec2 vortex = vec2(-toMouse.y, toMouse.x) * u_mouse_strength / (mouseDist * mouseDist + 0.05);
  vec2 distortedP = p + vortex * 0.08;

  // Layered noise at different scales and speeds
  float n1 = fbm(distortedP * 1.5 + vec2(t * 0.3, t * 0.2));
  float n2 = fbm(distortedP * 2.8 - vec2(t * 0.2, t * 0.4) + vec2(5.2, 1.3));
  float n3 = fbm(distortedP * 4.5 + vec2(t * 0.1, t * 0.35) + vec2(2.4, 8.7));

  // Combined noise for color thresholds
  float blendNoise = n1 * 0.5 + n2 * 0.35 + n3 * 0.15;

  // Color mixing based on noise thresholds
  vec3 col;
  if (blendNoise < 0.4) {
    col = mix(u_color1, u_color2, blendNoise / 0.4);
  } else if (blendNoise < 0.7) {
    col = mix(u_color2, u_color3, (blendNoise - 0.4) / 0.3);
  } else {
    col = mix(u_color3, u_color1, (blendNoise - 0.7) / 0.3);
  }

  // Smoky luminance variation
  float lum = 0.6 + n2 * 0.6 + n3 * 0.3;
  col = col * lum;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export default function LiquidEther({
  speed = 0.3,
  mouseStrength = 0.5,
  colors = DEFAULT_COLORS,
  className,
}: LiquidEtherProps) {
  const { canvasRef, setUniform, startLoop } = useWebGL({ fragmentShader: FRAGMENT_SHADER });
  const { position } = useMousePosition({ scope: "window" });

  const updateUniforms = useCallback(() => {
    setUniform("u_speed", speed);
    setUniform("u_mouse_strength", mouseStrength);

    const c1 = colors[0] ?? DEFAULT_COLORS[0];
    const c2 = colors[1] ?? DEFAULT_COLORS[1];
    const c3 = colors[2] ?? DEFAULT_COLORS[2];
    setUniform("u_color1", [c1[0] / 255, c1[1] / 255, c1[2] / 255]);
    setUniform("u_color2", [c2[0] / 255, c2[1] / 255, c2[2] / 255]);
    setUniform("u_color3", [c3[0] / 255, c3[1] / 255, c3[2] / 255]);
  }, [speed, mouseStrength, colors, setUniform]);

  useEffect(() => {
    updateUniforms();
  }, [updateUniforms]);

  useEffect(() => startLoop(), [startLoop]);

  useEffect(() => {
    let animId = 0;
    const tick = () => {
      const pos = position.current;
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      const mx = pos.x < 0 ? (canvas ? canvas.width * 0.5 : 0) : pos.x * dpr;
      const my = pos.y < 0 ? (canvas ? canvas.height * 0.5 : 0) : pos.y * dpr;
      setUniform("u_mouse", [mx, my]);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [position, setUniform]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "absolute inset-0 w-full h-full pointer-events-none"}
    />
  );
}
