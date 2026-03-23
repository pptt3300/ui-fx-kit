import { useEffect, useRef } from "react";
import { useCanvasSetup, useMousePosition } from "../../hooks";
import type { RGB } from "../../presets";
import { resolvePalette } from "../../presets/resolve";

interface StarfieldWarpProps {
  count?: number;
  speed?: number;
  mouseReactive?: boolean;
  palette?: string;
  colors?: RGB[];
  className?: string;
}

interface Star {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
  color: RGB;
}

const DEFAULT_COLORS: RGB[] = [
  [255, 255, 255],
  [200, 210, 255],
  [180, 230, 255],
];

export default function StarfieldWarp({
  count = 800,
  speed = 2,
  mouseReactive = true,
  palette,
  colors,
  className,
}: StarfieldWarpProps) {
  const resolvedColors = colors ?? resolvePalette(palette, 'particles', DEFAULT_COLORS);
  const { canvasRef, startLoop, size } = useCanvasSetup();
  const { position: mousePos } = useMousePosition({ scope: "window" });
  const starsRef = useRef<Star[]>([]);

  const spawnStar = (w: number, h: number): Star => {
    const color = resolvedColors[Math.floor(Math.random() * resolvedColors.length)];
    return {
      x: (Math.random() - 0.5) * w * 2,
      y: (Math.random() - 0.5) * h * 2,
      z: Math.random() * w,
      prevX: 0,
      prevY: 0,
      color,
    };
  };

  // Initialize stars when size changes
  useEffect(() => {
    if (size.width === 0) return;
    starsRef.current = Array.from({ length: count }, () =>
      spawnStar(size.width, size.height),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, count]);

  useEffect(() => {
    return startLoop((ctx, dt) => {
      const w = ctx.canvas.width / 2;
      const h = ctx.canvas.height / 2;
      if (w === 0 || h === 0) return;

      const cx = w / 2;
      const cy = h / 2;

      // Speed multiplier from mouse position (horizontal = speed change)
      let speedMult = 1;
      if (mouseReactive) {
        const mx = mousePos.current.x;
        if (mx > -9000) {
          speedMult = 0.5 + (mx / w) * 1.5;
          speedMult = Math.max(0.1, Math.min(3, speedMult));
        }
      }

      const zDecrement = speed * speedMult * 300 * dt;

      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(0, 0, w, h);

      const stars = starsRef.current;
      for (const star of stars) {
        // Project current position
        const sx = (star.x / star.z) * cx + cx;
        const sy = (star.y / star.z) * cy + cy;

        star.prevX = sx;
        star.prevY = sy;

        star.z -= zDecrement;

        if (star.z < 1) {
          // Respawn
          const newStar = spawnStar(w, h);
          star.x = newStar.x;
          star.y = newStar.y;
          star.z = newStar.z;
          star.color = newStar.color;
          continue;
        }

        // Project new position
        const nx = (star.x / star.z) * cx + cx;
        const ny = (star.y / star.z) * cy + cy;

        // Skip off-screen stars
        if (nx < 0 || nx > w || ny < 0 || ny > h) {
          const newStar = spawnStar(w, h);
          star.x = newStar.x;
          star.y = newStar.y;
          star.z = w * Math.random();
          continue;
        }

        const brightness = 1 - star.z / w;
        const [r, g, b] = star.color;
        const alpha = Math.min(1, brightness * 1.5);
        const lineWidth = Math.max(0.5, brightness * 2);

        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(star.prevX, star.prevY);
        ctx.lineTo(nx, ny);
        ctx.stroke();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLoop, speed, mouseReactive, resolvedColors]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={className ? { background: "#000" } : { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", background: "#000" }}
    />
  );
}
