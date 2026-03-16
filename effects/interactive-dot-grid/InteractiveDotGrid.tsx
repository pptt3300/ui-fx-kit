import { useEffect, useRef } from "react";
import { useCanvasSetup, useMousePosition } from "../../hooks";
import { proximity } from "../../hooks";

interface InteractiveDotGridProps {
  gap?: number;
  influenceRadius?: number;
  maxDisplacement?: number;
  className?: string;
}

export default function InteractiveDotGrid({
  gap = 28,
  influenceRadius = 120,
  maxDisplacement = 14,
  className,
}: InteractiveDotGridProps) {
  const { canvasRef, startLoop, size } = useCanvasSetup({ dpr: 2 });
  const { position, handlers } = useMousePosition({ scope: "element" });

  const dotRadius = 1.5;
  const propsRef = useRef({ gap, influenceRadius, maxDisplacement });
  propsRef.current = { gap, influenceRadius, maxDisplacement };

  useEffect(() => {
    return startLoop((ctx) => {
      const { gap: g, influenceRadius: ir, maxDisplacement: md } = propsRef.current;
      const w = size.width || ctx.canvas.width / 2;
      const h = size.height || ctx.canvas.height / 2;
      ctx.clearRect(0, 0, w, h);

      const mouse = position.current;
      const cols = Math.floor(w / g);
      const rows = Math.floor(h / g);
      const offsetX = (w - (cols - 1) * g) / 2;
      const offsetY = (h - (rows - 1) * g) / 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = offsetX + col * g;
          const baseY = offsetY + row * g;

          const result = proximity(mouse, { x: baseX, y: baseY }, { radius: ir, easing: "quadratic" });

          let drawX = baseX;
          let drawY = baseY;
          let scale = 1;
          let alpha = 0.2;

          if (result.inRange) {
            drawX -= Math.cos(result.angle) * result.force * md;
            drawY -= Math.sin(result.angle) * result.force * md;
            scale = 1 + result.force * 2;
            alpha = 0.2 + result.force * 0.8;
          }

          const hue = 240 + (col / cols) * 40 + (row / rows) * 20;

          ctx.beginPath();
          ctx.arc(drawX, drawY, dotRadius * scale, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
          ctx.fill();

          if (result.inRange && col < cols - 1) {
            const nx = offsetX + (col + 1) * g;
            const nResult = proximity(mouse, { x: nx, y: baseY }, { radius: ir, easing: "quadratic" });
            if (nResult.inRange) {
              const nnx = nx - Math.cos(nResult.angle) * nResult.force * md;
              const nny = baseY - Math.sin(nResult.angle) * nResult.force * md;
              ctx.beginPath();
              ctx.moveTo(drawX, drawY);
              ctx.lineTo(nnx, nny);
              ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${Math.min(alpha, 0.15)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }
    });
  }, [startLoop, position, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "absolute inset-0 w-full h-full cursor-crosshair"}
      onMouseMove={handlers.onMouseMove}
      onMouseLeave={handlers.onMouseLeave}
    />
  );
}
