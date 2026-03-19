import { useEffect, useRef } from "react";
import { useMousePosition, useCanvasSetup, useParticles } from "../../hooks";
import type { RGB } from "../../presets";

interface Trail {
  x: number;
  y: number;
  age: number;
  vx: number;
  vy: number;
  size: number;
  color: RGB;
}

interface CursorGlowProps {
  colors?: RGB[];
  maxParticles?: number;
  className?: string;
}

const DEFAULT_COLORS: RGB[] = [
  [99, 102, 241],
  [139, 92, 246],
  [34, 211, 238],
  [167, 139, 250],
  [129, 140, 248],
];

export default function CursorGlow({ colors = DEFAULT_COLORS, maxParticles = 500, className }: CursorGlowProps) {
  const { position } = useMousePosition({ scope: "window" });
  const { canvasRef, startLoop } = useCanvasSetup({ dpr: 2 });
  const prevRef = useRef({ x: -100, y: -100 });
  const colorsRef = useRef(colors);
  useEffect(() => { colorsRef.current = colors; });

  const particles = useParticles<Trail>({
    spawn: () => {
      const c = colorsRef.current;
      const pos = position.current;
      const px = prevRef.current.x;
      const py = prevRef.current.y;
      const speed = Math.sqrt((pos.x - px) ** 2 + (pos.y - py) ** 2);
      const angle = Math.atan2(pos.y - py, pos.x - px) + (Math.random() - 0.5) * 2;
      const v = speed * 0.15 + Math.random() * 1.5;
      return {
        x: pos.x + (Math.random() - 0.5) * 4,
        y: pos.y + (Math.random() - 0.5) * 4,
        age: 0,
        vx: -Math.cos(angle) * v + (Math.random() - 0.5) * 0.5,
        vy: -Math.sin(angle) * v + (Math.random() - 0.5) * 0.5 - 0.3,
        size: 1.5 + Math.random() * 2.5,
        color: c[Math.floor(Math.random() * c.length)],
      };
    },
    update: (t) => {
      t.age += 1;
      t.x += t.vx;
      t.y += t.vy;
      t.vx *= 0.96;
      t.vy *= 0.96;
      t.size *= 0.985;
      return t.age <= 50 && t.size >= 0.2;
    },
    maxCount: maxParticles,
  });

  useEffect(() => {
    return startLoop((ctx) => {
      const w = ctx.canvas.width / 2;
      const h = ctx.canvas.height / 2;
      ctx.clearRect(0, 0, w, h);

      const pos = position.current;
      const mx = pos.x;
      const my = pos.y;
      const px = prevRef.current.x;
      const py = prevRef.current.y;
      const speed = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);

      const spawnCount = Math.min(Math.floor(speed * 0.4), 6);
      if (spawnCount > 0) particles.emit(spawnCount);

      prevRef.current = { x: mx, y: my };

      particles.tick(1);
      particles.forEach(ctx, (c, t) => {
        const life = 1 - t.age / 50;
        const alpha = life * life * 0.6;
        c.beginPath();
        c.arc(t.x, t.y, t.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(${t.color[0]},${t.color[1]},${t.color[2]},${alpha})`;
        c.fill();
      });

      if (mx > 0 && my > 0) {
        const c = colorsRef.current;
        const gc = c[1] ?? c[0]; // glow center color
        const gm = c[0] ?? gc;   // glow mid color
        const ge = c[2] ?? gc;   // glow edge color
        const glowRadius = 20 + Math.min(speed * 0.3, 15);
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, glowRadius);
        grad.addColorStop(0, `rgba(${gc[0]},${gc[1]},${gc[2]},0.15)`);
        grad.addColorStop(0.4, `rgba(${gm[0]},${gm[1]},${gm[2]},0.06)`);
        grad.addColorStop(1, `rgba(${ge[0]},${ge[1]},${ge[2]},0)`);
        ctx.beginPath();
        ctx.arc(mx, my, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mx, my, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fill();
      }
    });
  }, [startLoop, particles, position]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={className ? { mixBlendMode: "screen" } : { position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 50, mixBlendMode: "screen" }}
    />
  );
}
