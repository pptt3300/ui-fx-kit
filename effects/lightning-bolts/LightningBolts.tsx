import { useEffect, useRef, useCallback } from "react";
import { useCanvasSetup } from "../../hooks";
import type { RGB } from "../../presets";

interface LightningBoltsProps {
  interval?: number;
  branchChance?: number;
  color?: RGB;
  glowIntensity?: number;
  className?: string;
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
  width: number;
}

interface Bolt {
  segments: Segment[];
  createdAt: number;
  duration: number;
}

function generateBolt(
  x1: number, y1: number,
  x2: number, y2: number,
  offset: number,
  depth: number,
  branchChance: number,
  baseWidth: number,
  baseAlpha: number,
  segments: Segment[],
) {
  if (depth <= 0 || offset < 1) {
    segments.push({ x1, y1, x2, y2, alpha: baseAlpha, width: baseWidth });
    return;
  }

  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * offset * 2;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * offset * 0.3;

  generateBolt(x1, y1, mx, my, offset * 0.5, depth - 1, branchChance, baseWidth, baseAlpha, segments);
  generateBolt(mx, my, x2, y2, offset * 0.5, depth - 1, branchChance, baseWidth, baseAlpha, segments);

  // Branch
  if (Math.random() < branchChance) {
    const bx = mx + (Math.random() - 0.5) * offset * 4;
    const by = my + offset * 2 + Math.random() * offset * 2;
    generateBolt(mx, my, bx, by, offset * 0.4, depth - 2, branchChance * 0.5, baseWidth * 0.5, baseAlpha * 0.6, segments);
  }
}

export default function LightningBolts({
  interval = 3000,
  branchChance = 0.3,
  color = [34, 211, 238],
  glowIntensity = 1,
  className,
}: LightningBoltsProps) {
  const { canvasRef, startLoop, size } = useCanvasSetup();
  const boltsRef = useRef<Bolt[]>([]);
  const lastBoltTime = useRef(0);

  const spawnBolt = useCallback((startX?: number, startY?: number) => {
    const w = size.width || window.innerWidth;
    const h = size.height || window.innerHeight;

    const x1 = startX ?? Math.random() * w;
    const y1 = startY ?? 0;
    const x2 = x1 + (Math.random() - 0.5) * w * 0.4;
    const y2 = startY != null ? h : h;

    const segments: Segment[] = [];
    generateBolt(x1, y1, x2, y2, w * 0.06, 7, branchChance, 2, 1, segments);

    boltsRef.current.push({
      segments,
      createdAt: performance.now(),
      duration: 200,
    });
  }, [size.width, size.height, branchChance]);

  // Auto-spawn interval
  useEffect(() => {
    if (interval === 0) return;
    const id = setInterval(() => {
      spawnBolt();
    }, interval);
    return () => clearInterval(id);
  }, [interval, spawnBolt]);

  // Click handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      spawnBolt(e.clientX - rect.left, e.clientY - rect.top);
    };
    canvas.addEventListener("click", handler);
    return () => canvas.removeEventListener("click", handler);
  }, [canvasRef, spawnBolt]);

  useEffect(() => {
    return startLoop((ctx) => {
      const w = ctx.canvas.width / 2;
      const h = ctx.canvas.height / 2;
      ctx.clearRect(0, 0, w, h);

      const now = performance.now();
      const [r, g, b] = color;

      // Remove expired bolts
      boltsRef.current = boltsRef.current.filter(
        (bolt) => now - bolt.createdAt < bolt.duration + 100
      );

      for (const bolt of boltsRef.current) {
        const elapsed = now - bolt.createdAt;
        const fade = elapsed < bolt.duration
          ? 1
          : 1 - (elapsed - bolt.duration) / 100;

        if (fade <= 0) continue;

        for (const seg of bolt.segments) {
          const alpha = seg.alpha * fade;

          // Glow passes
          const glowPasses = [
            { width: seg.width * 8 * glowIntensity, a: alpha * 0.05 },
            { width: seg.width * 4 * glowIntensity, a: alpha * 0.15 },
            { width: seg.width * 2, a: alpha * 0.4 },
            { width: seg.width, a: alpha },
          ];

          for (const pass of glowPasses) {
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.strokeStyle = `rgba(${r},${g},${b},${pass.a})`;
            ctx.lineWidth = pass.width;
            ctx.lineCap = "round";
            ctx.stroke();
          }

          // White core
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.7})`;
          ctx.lineWidth = seg.width * 0.3;
          ctx.stroke();
        }
      }
    });
  }, [startLoop, color, glowIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"}
    />
  );
}
