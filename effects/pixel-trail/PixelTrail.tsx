import { useEffect, useRef } from "react";
import { useCanvasSetup, useMousePosition } from "../../hooks";
import type { RGB } from "../../presets/colors";
import { resolvePalette } from "../../presets/resolve";

interface TrailPixel {
  x: number;
  y: number;
  age: number;
}

interface PixelTrailProps {
  pixelSize?: number;
  trailLength?: number;
  fadeSpeed?: number;
  palette?: string;
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

export default function PixelTrail({
  pixelSize = 8,
  trailLength = 50,
  fadeSpeed = 0.05,
  palette,
  colors,
  className = "",
}: PixelTrailProps) {
  const resolvedColors = colors ?? resolvePalette(palette, 'particles', DEFAULT_COLORS);
  const { canvasRef, startLoop } = useCanvasSetup();
  const { position } = useMousePosition({ scope: "window" });
  const trail = useRef<TrailPixel[]>([]);
  const lastSnap = useRef({ x: -99999, y: -99999 });

  useEffect(() => {
    return startLoop((ctx, dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);

      const mx = position.current.x;
      const my = position.current.y;

      const snapX = Math.floor(mx / pixelSize) * pixelSize;
      const snapY = Math.floor(my / pixelSize) * pixelSize;

      if (snapX !== lastSnap.current.x || snapY !== lastSnap.current.y) {
        trail.current.unshift({ x: snapX, y: snapY, age: 0 });
        if (trail.current.length > trailLength) {
          trail.current.length = trailLength;
        }
        lastSnap.current = { x: snapX, y: snapY };
      }

      // Age all pixels
      for (const px of trail.current) {
        px.age += dt * fadeSpeed * 60;
      }

      // Remove fully faded
      trail.current = trail.current.filter((px) => px.age < 1);

      // Draw trail pixels
      for (let i = 0; i < trail.current.length; i++) {
        const px = trail.current[i];
        const alpha = Math.max(0, 1 - px.age);
        const colorIndex = i % resolvedColors.length;
        const col = resolvedColors[colorIndex];
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
        ctx.fillRect(px.x, px.y, pixelSize - 1, pixelSize - 1);
        ctx.restore();
      }
    });
  }, [startLoop, position, pixelSize, trailLength, fadeSpeed, resolvedColors, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={className ? undefined : { position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 50 }}
    />
  );
}
