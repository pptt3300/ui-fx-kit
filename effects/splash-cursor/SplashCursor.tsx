import { useEffect, useRef } from "react";
import { useCanvasSetup, useParticles, useMousePosition } from "../../hooks";
import type { RGB } from "../../presets/colors";

interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: RGB;
  alpha: number;
  gravity: number;
}

interface SplashCursorProps {
  particleCount?: number;
  spread?: number;
  colors?: RGB[];
  className?: string;
}

const DEFAULT_COLORS: RGB[] = [
  [99, 102, 241],
  [139, 92, 246],
  [34, 211, 238],
  [244, 63, 94],
  [251, 191, 36],
];

export default function SplashCursor({
  particleCount = 15,
  spread = 360,
  colors = DEFAULT_COLORS,
  className = "",
}: SplashCursorProps) {
  const { canvasRef, startLoop } = useCanvasSetup();
  const { position } = useMousePosition({ scope: "window" });
  const prevPos = useRef({ x: -9999, y: -9999 });
  const colorsRef = useRef(colors);
  useEffect(() => { colorsRef.current = colors; });

  const particles = useParticles<SplashParticle>({
    spawn: () => {
      const mx = position.current.x;
      const my = position.current.y;
      const angle = (Math.random() * spread * Math.PI) / 180;
      const speed = 80 + Math.random() * 120;
      return {
        x: mx,
        y: my,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        color: colorsRef.current[Math.floor(Math.random() * colorsRef.current.length)],
        alpha: 0.8 + Math.random() * 0.2,
        gravity: 150 + Math.random() * 100,
      };
    },
    update: (p, dt) => {
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - 2 * dt;
      p.vy *= 1 - 2 * dt;
      p.alpha -= 0.6 * dt;
      p.radius -= 1.5 * dt;
      return p.alpha > 0.01 && p.radius > 0.1;
    },
    maxCount: 500,
  });

  useEffect(() => {
    return startLoop((ctx, dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);

      const mx = position.current.x;
      const my = position.current.y;
      const dx = mx - prevPos.current.x;
      const dy = my - prevPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 3) {
        const count = Math.min(Math.floor(dist * 0.3) + 1, particleCount);
        particles.emit(count);
        prevPos.current = { x: mx, y: my };
      }

      particles.tick(dt);
      particles.forEach(ctx, (ctx, p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.radius, 0.1), 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${p.color[0]},${p.color[1]},${p.color[2]})`;
        ctx.fill();
        ctx.restore();
      });
    });
  }, [startLoop, particles, position, particleCount, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-50 ${className}`}
    />
  );
}
