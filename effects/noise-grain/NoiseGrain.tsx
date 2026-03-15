import { useEffect, useCallback } from "react";
import { useCanvasSetup, useMousePosition } from "../../hooks";

type GrainColor = "mono" | "color";

interface NoiseGrainProps {
  intensity?: number;
  animated?: boolean;
  clearRadius?: number;
  color?: GrainColor;
  className?: string;
}

export default function NoiseGrain({
  intensity = 0.15,
  animated = true,
  clearRadius = 0,
  color = "mono",
  className,
}: NoiseGrainProps) {
  const { canvasRef, startLoop, size } = useCanvasSetup({ dpr: 1 });
  const { position } = useMousePosition({ scope: "window" });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = ctx.canvas;
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;
      const alpha = Math.round(intensity * 255);

      const mx = position.current.x;
      const my = position.current.y;
      // Convert window coords to canvas coords
      const canvas = canvasRef.current;
      let canvasMx = -1;
      let canvasMy = -1;
      if (canvas && clearRadius > 0 && mx > 0) {
        const rect = canvas.getBoundingClientRect();
        canvasMx = (mx - rect.left) * (canvas.width / rect.width);
        canvasMy = (my - rect.top) * (canvas.height / rect.height);
      }

      for (let i = 0; i < data.length; i += 4) {
        const pixelIdx = i / 4;
        const px = pixelIdx % width;
        const py = Math.floor(pixelIdx / width);

        // Clear radius around mouse
        if (clearRadius > 0 && canvasMx >= 0) {
          const dx = px - canvasMx;
          const dy = py - canvasMy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          // Scale clearRadius to canvas pixels
          const scaledRadius = clearRadius * (canvas ? canvas.width / canvas.getBoundingClientRect().width : 1);
          if (dist < scaledRadius) {
            const fade = dist / scaledRadius;
            const fadedAlpha = Math.round(alpha * fade * fade);
            if (color === "color") {
              data[i] = Math.random() * 255;
              data[i + 1] = Math.random() * 255;
              data[i + 2] = Math.random() * 255;
            } else {
              const v = Math.random() * 255;
              data[i] = data[i + 1] = data[i + 2] = v;
            }
            data[i + 3] = fadedAlpha;
            continue;
          }
        }

        if (color === "color") {
          data[i] = Math.random() * 255;
          data[i + 1] = Math.random() * 255;
          data[i + 2] = Math.random() * 255;
        } else {
          const v = Math.random() * 255;
          data[i] = data[i + 1] = data[i + 2] = v;
        }
        data[i + 3] = alpha;
      }

      ctx.putImageData(imgData, 0, 0);
    },
    [intensity, color, clearRadius, position, canvasRef],
  );

  // Static grain: draw once on mount or when props change
  useEffect(() => {
    if (animated) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    draw(ctx);
  }, [animated, draw, canvasRef, size]);

  // Animated grain: new noise every frame
  useEffect(() => {
    if (!animated) return;
    return startLoop((ctx) => draw(ctx));
  }, [animated, startLoop, draw]);

  return (
    <canvas
      ref={canvasRef}
      className={
        className ??
        "fixed inset-0 pointer-events-none z-40"
      }
      style={{ mixBlendMode: "overlay" }}
    />
  );
}
