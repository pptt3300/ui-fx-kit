import { useEffect, useRef } from "react";
import { useWebGL, useMousePosition } from "../hooks";
import type { RGB } from "../presets/colors";

interface BlobCursorProps {
  radius?: number;
  stiffness?: number;
  color?: RGB;
  className?: string;
}

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec2 u_target;
  uniform float u_radius;
  uniform vec3 u_color;
  uniform float u_squish;

  float metaball(vec2 p, vec2 center, float r) {
    float d = length(p - center);
    return r / (d * d + 0.001);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.y = 1.0 - uv.y;
    vec2 px = uv * u_resolution;

    float r = u_radius;

    // squish deformation: flatten on click
    float squishX = 1.0 + u_squish * 0.4;
    float squishY = 1.0 - u_squish * 0.2;

    vec2 m1 = u_mouse;
    vec2 m2 = u_target;

    vec2 d1 = px - m1;
    d1.x /= squishX;
    d1.y /= squishY;
    float f1 = (r * r) / (dot(d1, d1) + 0.001);

    float f2 = metaball(px, m2, r * r * 0.7);

    float field = f1 + f2;
    float threshold = 1.0;

    float alpha = smoothstep(threshold - 0.15, threshold + 0.15, field);

    vec3 col = u_color / 255.0;
    gl_FragColor = vec4(col * alpha, alpha * 0.85);
  }
`;

export default function BlobCursor({
  radius = 30,
  stiffness = 150,
  color = [99, 102, 241],
  className = "",
}: BlobCursorProps) {
  const { canvasRef, setUniform, startLoop } = useWebGL({ fragmentShader: FRAGMENT_SHADER });
  const { position } = useMousePosition({ scope: "window" });

  // Spring state for lagging blob
  const lagPos = useRef({ x: -9999, y: -9999 });
  const lagVel = useRef({ x: 0, y: 0 });
  const squish = useRef(0);
  const squishVel = useRef(0);

  useEffect(() => {
    setUniform("u_radius", radius);
    setUniform("u_color", color);
    setUniform("u_squish", 0);
    setUniform("u_target", [-9999, -9999]);

    const onClick = () => {
      squish.current = 1.0;
      squishVel.current = 0;
    };
    window.addEventListener("click", onClick);

    const cleanup = startLoop();

    // Override startLoop with custom loop that also updates spring
    let animId = 0;
    let last = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const mx = position.current.x;
      const my = position.current.y;

      // Spring physics for lagging blob
      const damping = 2 * Math.sqrt(stiffness) * 0.8;
      const ax = -stiffness * (lagPos.current.x - mx) - damping * lagVel.current.x;
      const ay = -stiffness * (lagPos.current.y - my) - damping * lagVel.current.y;
      lagVel.current.x += ax * dt;
      lagVel.current.y += ay * dt;
      lagPos.current.x += lagVel.current.x * dt;
      lagPos.current.y += lagVel.current.y * dt;

      // Squish spring decay
      const sqK = 300;
      const sqD = 2 * Math.sqrt(sqK) * 0.9;
      const sqA = -sqK * squish.current - sqD * squishVel.current;
      squishVel.current += sqA * dt;
      squish.current += squishVel.current * dt;
      if (Math.abs(squish.current) < 0.001) squish.current = 0;

      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        setUniform("u_mouse", [mx, h - my]);
        setUniform("u_target", [lagPos.current.x, h - lagPos.current.y]);
      }
      setUniform("u_squish", squish.current);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cleanup?.();
      cancelAnimationFrame(animId);
      window.removeEventListener("click", onClick);
    };
  }, [startLoop, setUniform, radius, stiffness, color, position, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-50 ${className}`}
      style={{ mixBlendMode: "screen" }}
    />
  );
}
