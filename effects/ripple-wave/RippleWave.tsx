import { useEffect, useRef } from "react";
import { useCanvasSetup } from "../../hooks";
import type { RGB } from "../../presets";
import { resolvePalette } from "../../presets/resolve";

const DEFAULT_RIPPLE_COLORS: RGB[] = [
  [99, 102, 241],
  [139, 92, 246],
  [34, 211, 238],
];

interface RippleWaveProps {
  source?: "center" | "click";
  waveSpeed?: number;
  gridSize?: number;
  palette?: string;
  colors?: RGB[];
  className?: string;
}

export default function RippleWave({
  source = "click",
  waveSpeed = 200,
  gridSize = 40,
  palette,
  colors,
  className,
}: RippleWaveProps) {
  const resolvedColors = colors ?? resolvePalette(palette, 'particles', DEFAULT_RIPPLE_COLORS);
  const { canvasRef, startLoop, size } = useCanvasSetup();

  // Grid state: current height, previous height
  const gridRef = useRef<{ cur: Float32Array; prev: Float32Array } | null>(
    null,
  );
  const colsRef = useRef(0);
  const rowsRef = useRef(0);

  // Rebuild grid when size changes
  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;
    const cols = Math.ceil(size.width / gridSize) + 1;
    const rows = Math.ceil(size.height / gridSize) + 1;
    colsRef.current = cols;
    rowsRef.current = rows;
    gridRef.current = {
      cur: new Float32Array(cols * rows),
      prev: new Float32Array(cols * rows),
    };

    if (source === "center") {
      // Seed center
      const cx = Math.floor(cols / 2);
      const cy = Math.floor(rows / 2);
      gridRef.current.cur[cy * cols + cx] = 1.0;
    }
  }, [size.width, size.height, gridSize, source]);

  // Click handler
  useEffect(() => {
    if (source !== "click") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const col = Math.round(px / gridSize);
      const row = Math.round(py / gridSize);
      const grid = gridRef.current;
      const cols = colsRef.current;
      const rows = rowsRef.current;
      if (!grid || col < 0 || col >= cols || row < 0 || row >= rows) return;
      grid.cur[row * cols + col] = 1.0;
    };

    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [canvasRef, source, gridSize]);

  // Periodic center pulse for "center" mode
  const pulseTimerRef = useRef(0);

  useEffect(() => {
    return startLoop((ctx, dt) => {
      const grid = gridRef.current;
      const cols = colsRef.current;
      const rows = rowsRef.current;
      if (!grid || cols === 0 || rows === 0) return;

      const { cur, prev } = grid;

      // Center pulse every 2 seconds
      if (source === "center") {
        pulseTimerRef.current += dt;
        if (pulseTimerRef.current > 2) {
          pulseTimerRef.current = 0;
          const cx = Math.floor(cols / 2);
          const cy = Math.floor(rows / 2);
          cur[cy * cols + cx] = 1.0;
        }
      }

      const damping = 1 - 0.008 * waveSpeed * dt;
      const propagation = Math.min(waveSpeed * dt * 0.4, 0.49);
      const next = new Float32Array(cols * rows);

      for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          const idx = r * cols + c;
          const neighbors =
            cur[(r - 1) * cols + c] +
            cur[(r + 1) * cols + c] +
            cur[r * cols + (c - 1)] +
            cur[r * cols + (c + 1)];
          next[idx] =
            (neighbors * propagation + cur[idx] * (1 - propagation * 2) - prev[idx]) *
            damping;
        }
      }

      grid.prev = grid.cur;
      grid.cur = next;

      // Draw
      const w = ctx.canvas.width / 2;
      const h = ctx.canvas.height / 2;
      ctx.clearRect(0, 0, w, h);

      const dotRadius = gridSize * 0.15;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = Math.max(-1, Math.min(1, grid.cur[r * cols + c]));
          const x = c * gridSize;
          const y = r * gridSize;

          // Pick color based on val
          const t = (val + 1) / 2;
          const ci = Math.floor(t * (resolvedColors.length - 1));
          const cf = t * (resolvedColors.length - 1) - ci;
          const c0 = resolvedColors[Math.min(ci, resolvedColors.length - 1)];
          const c1 = resolvedColors[Math.min(ci + 1, resolvedColors.length - 1)];
          const [rr, gg, bb] = [
            c0[0] + (c1[0] - c0[0]) * cf,
            c0[1] + (c1[1] - c0[1]) * cf,
            c0[2] + (c1[2] - c0[2]) * cf,
          ];

          const alpha = 0.3 + Math.abs(val) * 0.7;
          const radius = dotRadius + Math.abs(val) * dotRadius;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rr | 0},${gg | 0},${bb | 0},${alpha})`;
          ctx.fill();
        }
      }
    });
  }, [startLoop, waveSpeed, gridSize, resolvedColors, source]);

  return (
    <canvas
      ref={canvasRef}
      className={
        className ??
        "absolute inset-0 w-full h-full" +
          (source === "click" ? " cursor-crosshair" : " pointer-events-none")
      }
    />
  );
}
