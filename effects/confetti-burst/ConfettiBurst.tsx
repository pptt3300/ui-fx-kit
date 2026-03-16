import { useEffect, useRef, useCallback } from "react";
import { useCanvasSetup, useParticles } from "../../hooks";
import type { RGB } from "../../presets/colors";

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: RGB;
  alpha: number;
  shape: "rect" | "circle";
}

interface ConfettiBurstProps {
  triggerRef?: React.MutableRefObject<(() => void) | null>;
  autoTrigger?: boolean;
  count?: number;
  spread?: number;
  colors?: RGB[];
  className?: string;
}

const DEFAULT_COLORS: RGB[] = [
  [255, 59, 92],
  [255, 193, 7],
  [100, 220, 120],
  [64, 160, 255],
  [180, 100, 255],
  [255, 130, 50],
];

export default function ConfettiBurst({
  triggerRef,
  autoTrigger = false,
  count = 100,
  spread = 90,
  colors = DEFAULT_COLORS,
  className = "",
}: ConfettiBurstProps) {
  const { canvasRef, startLoop } = useCanvasSetup();
  const colorsRef = useRef(colors);
  const spreadRef = useRef(spread);
  const countRef = useRef(count);
  useEffect(() => {
    colorsRef.current = colors;
    spreadRef.current = spread;
    countRef.current = count;
  });

  const particles = useParticles<ConfettiParticle>({
    spawn: () => {
      const canvas = canvasRef.current;
      const cx = canvas ? canvas.width / 2 : window.innerWidth / 2;
      const cy = canvas ? canvas.height / 2 : window.innerHeight / 2;
      const halfSpread = (spreadRef.current / 2) * (Math.PI / 180);
      const baseAngle = -Math.PI / 2; // upward
      const angle = baseAngle - halfSpread + Math.random() * halfSpread * 2;
      const speed = 400 + Math.random() * 600;
      const c = colorsRef.current[Math.floor(Math.random() * colorsRef.current.length)];
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
        width: 6 + Math.random() * 10,
        height: 4 + Math.random() * 6,
        color: c,
        alpha: 1,
        shape: Math.random() < 0.3 ? "circle" : "rect",
      };
    },
    update: (p, dt) => {
      p.vy += 500 * dt; // gravity
      p.vx *= 1 - 0.5 * dt; // air resistance x
      p.vy *= 1 - 0.2 * dt; // air resistance y
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotationSpeed * dt;
      // Start fading after halfway through life
      if (p.vy > 100) p.alpha -= 0.8 * dt;
      return p.alpha > 0.01 && p.y < (canvasRef.current?.height ?? window.innerHeight) + 100;
    },
    maxCount: 500,
  });

  const burst = useCallback(() => {
    particles.emitWith(countRef.current, () => {
      const canvas = canvasRef.current;
      const cx = canvas ? canvas.width / 2 : window.innerWidth / 2;
      const cy = canvas ? canvas.height / 2 : window.innerHeight / 2;
      const halfSpread = (spreadRef.current / 2) * (Math.PI / 180);
      const baseAngle = -Math.PI / 2;
      const angle = baseAngle - halfSpread + Math.random() * halfSpread * 2;
      const speed = 400 + Math.random() * 600;
      const c = colorsRef.current[Math.floor(Math.random() * colorsRef.current.length)];
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
        width: 6 + Math.random() * 10,
        height: 4 + Math.random() * 6,
        color: c,
        alpha: 1,
        shape: (Math.random() < 0.3 ? "circle" : "rect") as "circle" | "rect",
      };
    });
  }, [particles, canvasRef]);

  // Expose burst fn via triggerRef
  useEffect(() => {
    if (triggerRef) triggerRef.current = burst;
    return () => { if (triggerRef) triggerRef.current = null; };
  }, [triggerRef, burst]);

  // Auto trigger on mount
  useEffect(() => {
    if (autoTrigger) {
      const timer = setTimeout(burst, 100);
      return () => clearTimeout(timer);
    }
  }, [autoTrigger, burst]);

  useEffect(() => {
    return startLoop((ctx, dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.tick(dt);
      particles.forEach(ctx, (ctx, p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = `rgb(${p.color[0]},${p.color[1]},${p.color[2]})`;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        }
        ctx.restore();
      });
    });
  }, [startLoop, particles, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-[9999] ${className}`}
    />
  );
}
