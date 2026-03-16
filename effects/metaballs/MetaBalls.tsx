import { useEffect, useCallback, useRef } from "react";
import { useWebGL, useMousePosition } from "../../hooks";
import type { RGB } from "../../presets";

interface MetaBallsProps {
  count?: number;
  radiusRange?: [number, number];
  mouseMode?: "attract" | "repel";
  colors?: RGB[];
  className?: string;
}

const DEFAULT_COLORS: RGB[] = [
  [99, 102, 241],
  [139, 92, 246],
  [236, 72, 153],
];

// Max balls the shader supports — must match uniform array size
const MAX_BALLS = 12;

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 u_balls[12];  // x, y, radius (all in pixels)
uniform float u_count;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;

void main() {
  vec2 px = gl_FragCoord.xy;
  // Flip Y so origin is top-left (matches mouse coords)
  px.y = u_resolution.y - px.y;

  // Metaball field: sum of radius^2 / dist^2
  float field = 0.0;
  for (int i = 0; i < 12; i++) {
    if (float(i) >= u_count) break;
    vec2 ballPos = u_balls[i].xy;
    float r = u_balls[i].z;
    vec2 d = px - ballPos;
    float dist2 = dot(d, d);
    field += (r * r) / (dist2 + 1.0);
  }

  // Threshold: inside=1, outside=0, with smooth edge
  float threshold = 1.0;
  float inside = smoothstep(threshold - 0.08, threshold + 0.08, field);

  if (inside < 0.01) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Color based on which ball is dominant
  vec3 col = vec3(0.0);
  float totalWeight = 0.0;
  for (int i = 0; i < 12; i++) {
    if (float(i) >= u_count) break;
    vec2 ballPos = u_balls[i].xy;
    float r = u_balls[i].z;
    vec2 d = px - ballPos;
    float w = (r * r) / (dot(d, d) + 1.0);
    vec3 ballColor;
    if (i == 0) ballColor = u_color1;
    else if (i == 1) ballColor = u_color2;
    else if (mod(float(i), 3.0) < 1.0) ballColor = u_color1;
    else if (mod(float(i), 3.0) < 2.0) ballColor = u_color2;
    else ballColor = u_color3;
    col += ballColor * w;
    totalWeight += w;
  }
  col /= (totalWeight + 0.001);

  // Slight highlight at field > 1.3 (center of balls)
  float highlight = smoothstep(1.3, 1.8, field) * 0.3;
  col = col + vec3(highlight);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), inside);
}
`;

export default function MetaBalls({
  count = 6,
  radiusRange = [30, 80],
  mouseMode = "attract",
  colors = DEFAULT_COLORS,
  className,
}: MetaBallsProps) {
  const { canvasRef, setUniform, startLoop } = useWebGL({ fragmentShader: FRAGMENT_SHADER });
  const { position } = useMousePosition({ scope: "window" });

  const clampedCount = Math.min(count, MAX_BALLS);

  // Ball state: positions and velocities
  const ballsRef = useRef<{ x: number; y: number; vx: number; vy: number; radius: number }[]>([]);

  // Initialize balls
  useEffect(() => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.getBoundingClientRect().width : 400;
    const h = canvas ? canvas.getBoundingClientRect().height : 300;
    ballsRef.current = Array.from({ length: clampedCount }, () => ({
      x: w * (0.2 + Math.random() * 0.6),
      y: h * (0.2 + Math.random() * 0.6),
      vx: (Math.random() - 0.5) * 60,
      vy: (Math.random() - 0.5) * 60,
      radius: radiusRange[0] + Math.random() * (radiusRange[1] - radiusRange[0]),
    }));
  }, [clampedCount, radiusRange, canvasRef]);

  // Update color uniforms
  const updateColors = useCallback(() => {
    const c1 = colors[0] ?? DEFAULT_COLORS[0];
    const c2 = colors[1] ?? DEFAULT_COLORS[1];
    const c3 = colors[2] ?? DEFAULT_COLORS[2];
    setUniform("u_color1", [c1[0] / 255, c1[1] / 255, c1[2] / 255]);
    setUniform("u_color2", [c2[0] / 255, c2[1] / 255, c2[2] / 255]);
    setUniform("u_color3", [c3[0] / 255, c3[1] / 255, c3[2] / 255]);
    setUniform("u_count", clampedCount);
  }, [colors, clampedCount, setUniform]);

  useEffect(() => {
    updateColors();
  }, [updateColors]);

  useEffect(() => startLoop(), [startLoop]);

  // Physics loop for ball positions
  useEffect(() => {
    let animId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(tick);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const mx = position.current.x - rect.left;
      const my = position.current.y - rect.top;

      const balls = ballsRef.current;
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];

        // Mouse interaction
        if (mx > 0 && my > 0) {
          const dx = mx - b.x;
          const dy = my - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 1;
          const forceMag = 5000 / (dist * dist);
          if (mouseMode === "attract") {
            b.vx += (dx / dist) * forceMag * dt;
            b.vy += (dy / dist) * forceMag * dt;
          } else {
            b.vx -= (dx / dist) * forceMag * dt;
            b.vy -= (dy / dist) * forceMag * dt;
          }
        }

        // Damping
        b.vx *= 0.98;
        b.vy *= 0.98;

        // Gentle sine drift to keep balls moving
        b.vx += Math.sin(now * 0.001 + i * 1.7) * 8 * dt;
        b.vy += Math.cos(now * 0.0013 + i * 2.3) * 8 * dt;

        // Speed cap
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const maxSpeed = 150;
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed;
          b.vy = (b.vy / speed) * maxSpeed;
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Bounce off walls
        const margin = b.radius * 0.5;
        if (b.x < margin) { b.x = margin; b.vx = Math.abs(b.vx); }
        if (b.x > w - margin) { b.x = w - margin; b.vx = -Math.abs(b.vx); }
        if (b.y < margin) { b.y = margin; b.vy = Math.abs(b.vy); }
        if (b.y > h - margin) { b.y = h - margin; b.vy = -Math.abs(b.vy); }
      }

      // Push ball uniforms (WebGL 1 doesn't support array uniform setter directly)
      // Flatten into individual vec3 uniforms via u_balls[i]
      // Use setUniform workaround: pass each ball as separate components
      for (let i = 0; i < Math.min(balls.length, MAX_BALLS); i++) {
        const b = balls[i];
        // Use the gl context directly from canvasRef
        const ctx = canvas.getContext("webgl");
        if (ctx) {
          const prog = ctx.getParameter(ctx.CURRENT_PROGRAM) as WebGLProgram;
          if (prog) {
            const loc = ctx.getUniformLocation(prog, `u_balls[${i}]`);
            if (loc) ctx.uniform3f(loc, b.x, b.y, b.radius);
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [position, mouseMode, canvasRef, setUniform]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "absolute inset-0 w-full h-full"}
    />
  );
}
