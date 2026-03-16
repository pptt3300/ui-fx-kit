import { useEffect } from "react";
import { useCanvasSetup, useMousePosition } from "../../hooks";
import { proximity } from "../../hooks";

export default function InteractiveDotGrid() {
  const { canvasRef, startLoop, size } = useCanvasSetup({ dpr: 2 });
  const { position, handlers } = useMousePosition({ scope: "element" });

  const gap = 28;
  const dotRadius = 1.5;
  const influenceRadius = 120;
  const maxDisplacement = 14;

  useEffect(() => {
    return startLoop((ctx) => {
      const w = size.width || ctx.canvas.width / 2;
      const h = size.height || ctx.canvas.height / 2;
      ctx.clearRect(0, 0, w, h);

      const mouse = position.current;
      const cols = Math.floor(w / gap);
      const rows = Math.floor(h / gap);
      const offsetX = (w - (cols - 1) * gap) / 2;
      const offsetY = (h - (rows - 1) * gap) / 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = offsetX + col * gap;
          const baseY = offsetY + row * gap;

          const result = proximity(mouse, { x: baseX, y: baseY }, { radius: influenceRadius, easing: "quadratic" });

          let drawX = baseX;
          let drawY = baseY;
          let scale = 1;
          let alpha = 0.2;

          if (result.inRange) {
            drawX -= Math.cos(result.angle) * result.force * maxDisplacement;
            drawY -= Math.sin(result.angle) * result.force * maxDisplacement;
            scale = 1 + result.force * 2;
            alpha = 0.2 + result.force * 0.8;
          }

          const hue = 240 + (col / cols) * 40 + (row / rows) * 20;

          ctx.beginPath();
          ctx.arc(drawX, drawY, dotRadius * scale, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
          ctx.fill();

          if (result.inRange && col < cols - 1) {
            const nx = offsetX + (col + 1) * gap;
            const nResult = proximity(mouse, { x: nx, y: baseY }, { radius: influenceRadius, easing: "quadratic" });
            if (nResult.inRange) {
              const nnx = nx - Math.cos(nResult.angle) * nResult.force * maxDisplacement;
              const nny = baseY - Math.sin(nResult.angle) * nResult.force * maxDisplacement;
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
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-mono text-indigo-500 mb-2 tracking-widest uppercase">05 / Interactive Grid</h2>
        <p className="text-slate-500 mb-8 max-w-lg">
          A grid of dots that reacts to cursor proximity. Each dot is displaced away from the cursor with quadratic easing, and connecting lines form between nearby affected dots.
        </p>
        <div className="rounded-2xl bg-slate-950 overflow-hidden shadow-xl">
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair"
            style={{ height: 400 }}
            onMouseMove={handlers.onMouseMove}
            onMouseLeave={handlers.onMouseLeave}
          />
        </div>
      </div>
    </section>
  );
}
