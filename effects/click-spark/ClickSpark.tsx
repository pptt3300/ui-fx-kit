import { useEffect, useRef } from "react";
import { useCanvasSetup, useParticles } from "../../hooks";
import type { RGB } from "../../presets/colors";
import { resolvePalette } from "../../presets/resolve";

interface SparkParticle {
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface ClickSparkProps {
  count?: number;
  palette?: string;
  color?: RGB;
  length?: number;
  className?: string;
}

export default function ClickSpark({
  count = 8,
  palette,
  color,
  length = 15,
  className = "",
}: ClickSparkProps) {
  const resolvedColor = color ?? resolvePalette(palette, 'accent', [255, 200, 50] as RGB);
  const { canvasRef, startLoop } = useCanvasSetup();
  const colorRef = useRef(resolvedColor);
  const countRef = useRef(count);
  const lengthRef = useRef(length);
  useEffect(() => {
    colorRef.current = resolvedColor;
    countRef.current = count;
    lengthRef.current = length;
  });

  const pendingBursts = useRef<Array<{ x: number; y: number }>>([]);

  const particles = useParticles<SparkParticle>({
    spawn: () => ({
      x: 0,
      y: 0,
      angle: 0,
      speed: 0,
      length: 0,
      alpha: 1,
      life: 0,
      maxLife: 0.3,
    }),
    update: (p, dt) => {
      p.life += dt;
      const t = p.life / p.maxLife;
      p.alpha = 1 - t;
      p.length = lengthRef.current * (1 - t * 0.7);
      p.x += Math.cos(p.angle) * p.speed * dt;
      p.y += Math.sin(p.angle) * p.speed * dt;
      p.speed *= 1 - 4 * dt;
      return p.life < p.maxLife;
    },
    maxCount: 1000,
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      pendingBursts.current.push({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    return startLoop((ctx, dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Emit from pending clicks
      for (const burst of pendingBursts.current) {
        const n = countRef.current;
        particles.emitWith(n, () => ({
          x: burst.x,
          y: burst.y,
          angle: Math.random() * Math.PI * 2,
          speed: 80 + Math.random() * 120,
          length: lengthRef.current,
          alpha: 1,
          life: 0,
          maxLife: 0.25 + Math.random() * 0.1,
        }));
      }
      pendingBursts.current.length = 0;

      particles.tick(dt);

      const [r, g, b] = colorRef.current;
      particles.forEach(ctx, (ctx, p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(
          p.x + Math.cos(p.angle) * p.length,
          p.y + Math.sin(p.angle) * p.length,
        );
        ctx.stroke();
        ctx.restore();
      });
    });
  }, [startLoop, particles, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={className ? undefined : { position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9998 }}
    />
  );
}
