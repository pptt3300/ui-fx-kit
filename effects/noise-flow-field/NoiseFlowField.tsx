import { useEffect } from "react";
import { useCanvasSetup, useParticles, usePerlinNoise } from "../../hooks";
import type { RGB } from "../../presets";
import { resolvePalette } from "../../presets/resolve";

interface NoiseFlowFieldProps {
  count?: number;
  noiseScale?: number;
  speed?: number;
  turbulence?: number;
  palette?: string;
  colors?: RGB[];
  className?: string;
}

interface FlowParticle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  speed: number;
  color: RGB;
}

const DEFAULT_COLORS: RGB[] = [
  [99, 102, 241],
  [139, 92, 246],
  [34, 211, 238],
  [244, 114, 182],
];

export default function NoiseFlowField({
  count = 2000,
  noiseScale = 0.005,
  speed = 1,
  turbulence = 3,
  palette,
  colors,
  className,
}: NoiseFlowFieldProps) {
  const resolvedColors = colors ?? resolvePalette(palette, 'particles', DEFAULT_COLORS);
  const { canvasRef, startLoop, size } = useCanvasSetup();
  const { noise2D } = usePerlinNoise({ scale: noiseScale });

  const particles = useParticles<FlowParticle>({
    spawn: () => {
      const w = size.width || 800;
      const h = size.height || 600;
      const color = resolvedColors[Math.floor(Math.random() * resolvedColors.length)];
      const x = Math.random() * w;
      const y = Math.random() * h;
      return { x, y, prevX: x, prevY: y, speed: 0.5 + Math.random() * 1.5, color };
    },
    update: () => true, // never auto-remove; we handle respawn manually
    maxCount: count,
  });

  // Seed initial particles
  useEffect(() => {
    if (size.width === 0) return;
    particles.clear();
    particles.emit(count);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, count]);

  useEffect(() => {
    let time = 0;

    return startLoop((ctx, dt) => {
      const w = ctx.canvas.width / 2;
      const h = ctx.canvas.height / 2;
      if (w === 0 || h === 0) return;

      time += dt;

      // Semi-transparent clear for trail effect
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      ctx.fillRect(0, 0, w, h);

      particles.forEach(ctx, (ctx, p) => {
        p.prevX = p.x;
        p.prevY = p.y;

        // Noise angle at this position + time offset
        const angle =
          noise2D(p.x, p.y + time * 50) * Math.PI * 2 * turbulence;

        p.x += Math.cos(angle) * p.speed * speed * 60 * dt;
        p.y += Math.sin(angle) * p.speed * speed * 60 * dt;

        // Respawn at random edge when out of bounds
        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          const edge = Math.floor(Math.random() * 4);
          if (edge === 0) { p.x = Math.random() * w; p.y = 0; }
          else if (edge === 1) { p.x = Math.random() * w; p.y = h; }
          else if (edge === 2) { p.x = 0; p.y = Math.random() * h; }
          else { p.x = w; p.y = Math.random() * h; }
          p.prevX = p.x;
          p.prevY = p.y;
          return;
        }

        const [r, g, b] = p.color;
        ctx.strokeStyle = `rgba(${r},${g},${b},0.4)`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
    });
  }, [startLoop, noise2D, turbulence, speed, particles]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={className ? { background: "#000" } : { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", background: "#000" }}
    />
  );
}
