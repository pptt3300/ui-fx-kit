import { useEffect, useRef } from "react";
import { useCanvasSetup, useMousePosition } from "../../hooks";
import type { RGB } from "../../presets";
import { resolvePalette } from "../../presets/resolve";

interface GridDistortionProps {
  gridSize?: number;
  radius?: number;
  strength?: number;
  palette?: string;
  color?: RGB;
  className?: string;
}

interface PointSpring {
  value: number;
  velocity: number;
  target: number;
}

interface GridPoint {
  baseX: number;
  baseY: number;
  sx: PointSpring;
  sy: PointSpring;
}

function tickSpring(s: PointSpring, dt: number, stiffness: number, damping: number) {
  const disp = s.value - s.target;
  s.velocity += (-stiffness * disp - damping * s.velocity) * dt;
  s.value += s.velocity * dt;
}

export default function GridDistortion({
  gridSize = 20,
  radius = 150,
  strength = 30,
  palette,
  color,
  className,
}: GridDistortionProps) {
  const resolvedColor = color ?? resolvePalette(palette, 'accent', [255, 255, 255] as RGB);
  const { canvasRef, startLoop, size } = useCanvasSetup();
  const { position: mousePos, handlers } = useMousePosition({ scope: "element" });
  const gridRef = useRef<GridPoint[]>([]);
  const gridDimsRef = useRef({ cols: 0, rows: 0 });

  // Rebuild flat grid array when canvas size changes
  useEffect(() => {
    const { width, height } = size;
    if (width === 0 || height === 0) return;

    const cols = Math.ceil(width / gridSize);
    const rows = Math.ceil(height / gridSize);
    gridDimsRef.current = { cols, rows };

    const pts: GridPoint[] = [];
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const bx = col * gridSize;
        const by = row * gridSize;
        pts.push({
          baseX: bx,
          baseY: by,
          sx: { value: bx, velocity: 0, target: bx },
          sy: { value: by, velocity: 0, target: by },
        });
      }
    }
    gridRef.current = pts;
  }, [size, gridSize]);

  useEffect(() => {
    const stiffness = 200;
    const damping = 20;

    return startLoop((ctx, dt) => {
      const w = ctx.canvas.width / 2;
      const h = ctx.canvas.height / 2;
      ctx.clearRect(0, 0, w, h);

      const grid = gridRef.current;
      if (grid.length === 0) return;

      const { cols, rows } = gridDimsRef.current;
      const mouse = (mousePos as React.MutableRefObject<{ x: number; y: number }>).current;
      const mouseActive = mouse.x !== -9999;
      const [r, g, b] = resolvedColor;

      // Update spring targets and tick physics
      for (const pt of grid) {
        if (mouseActive) {
          const dx = pt.baseX - mouse.x;
          const dy = pt.baseY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius && dist > 0) {
            const force = (1 - dist / radius) * strength;
            const angle = Math.atan2(dy, dx);
            pt.sx.target = pt.baseX + Math.cos(angle) * force;
            pt.sy.target = pt.baseY + Math.sin(angle) * force;
          } else {
            pt.sx.target = pt.baseX;
            pt.sy.target = pt.baseY;
          }
        } else {
          pt.sx.target = pt.baseX;
          pt.sy.target = pt.baseY;
        }
        tickSpring(pt.sx, dt, stiffness, damping);
        tickSpring(pt.sy, dt, stiffness, damping);
      }

      const stride = cols + 1;
      ctx.lineWidth = 0.5;

      // Draw horizontal lines
      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * stride + col;
          const j = i + 1;
          const a = grid[i];
          const bPt = grid[j];
          if (!a || !bPt) continue;
          const disp = Math.sqrt((a.sx.value - a.baseX) ** 2 + (a.sy.value - a.baseY) ** 2);
          const opacity = 0.15 + Math.min(disp / strength, 1) * 0.35;
          ctx.beginPath();
          ctx.moveTo(a.sx.value, a.sy.value);
          ctx.lineTo(bPt.sx.value, bPt.sy.value);
          ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
          ctx.stroke();
        }
      }

      // Draw vertical lines
      for (let col = 0; col <= cols; col++) {
        for (let row = 0; row < rows; row++) {
          const i = row * stride + col;
          const j = i + stride;
          const a = grid[i];
          const bPt = grid[j];
          if (!a || !bPt) continue;
          const disp = Math.sqrt((a.sx.value - a.baseX) ** 2 + (a.sy.value - a.baseY) ** 2);
          const opacity = 0.15 + Math.min(disp / strength, 1) * 0.35;
          ctx.beginPath();
          ctx.moveTo(a.sx.value, a.sy.value);
          ctx.lineTo(bPt.sx.value, bPt.sy.value);
          ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
          ctx.stroke();
        }
      }
    });
  }, [startLoop, mousePos, gridSize, radius, strength, resolvedColor]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onMouseMove={handlers.onMouseMove}
      onMouseLeave={handlers.onMouseLeave}
      style={className ? { pointerEvents: "auto" } : { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "auto" }}
    />
  );
}
