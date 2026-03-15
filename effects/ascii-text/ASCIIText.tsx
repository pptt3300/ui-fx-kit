import { useEffect, useRef } from "react";
import { useCanvasSetup, useMousePosition } from "../../hooks";

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ASCIITextProps {
  text: string;
  fontSize?: number;
  charset?: string;
  revealRadius?: number;
  color?: RGB;
  className?: string;
}

const DEFAULT_CHARSET = " .,:;i1tfLCG08@";
const DEFAULT_COLOR: RGB = { r: 100, g: 220, b: 100 };

export default function ASCIIText({
  text,
  fontSize = 10,
  charset = DEFAULT_CHARSET,
  revealRadius = 80,
  color = DEFAULT_COLOR,
  className,
}: ASCIITextProps) {
  const { canvasRef, startLoop } = useCanvasSetup({ dpr: 1 });
  const { position, handlers } = useMousePosition({ scope: "element" });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create offscreen canvas to render large text
    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d")!;
    const bigFont = fontSize * 8;
    offCtx.font = `bold ${bigFont}px monospace`;
    const metrics = offCtx.measureText(text);
    const textW = Math.ceil(metrics.width) + bigFont;
    const textH = bigFont * 1.4;
    offscreen.width = textW;
    offscreen.height = textH;

    offCtx.clearRect(0, 0, textW, textH);
    offCtx.fillStyle = "#ffffff";
    offCtx.font = `bold ${bigFont}px monospace`;
    offCtx.textBaseline = "alphabetic";
    offCtx.fillText(text, bigFont / 2, bigFont);

    const pixelData = offCtx.getImageData(0, 0, textW, textH);

    // Set canvas display size
    const cols = Math.floor(textW / bigFont * (bigFont / fontSize));
    const rows = Math.floor(textH / bigFont * (bigFont / (fontSize * 1.4)));

    canvas.style.width = `${cols * fontSize * 0.6}px`;
    canvas.style.height = `${rows * fontSize}px`;

    const cleanup = startLoop((ctx: CanvasRenderingContext2D) => {
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const mousePos = (position as React.MutableRefObject<{ x: number; y: number }>).current;
      const mx = mousePos.x;
      const my = mousePos.y;

      const charW = fontSize * 0.6;
      const charH = fontSize;

      // Sample grid: map canvas pixels back to offscreen pixels
      const scaleX = textW / cw;
      const scaleY = textH / ch;

      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = "top";

      for (let row = 0; row * charH < ch; row++) {
        for (let col = 0; col * charW < cw; col++) {
          const px = Math.floor((col * charW + charW / 2) * scaleX);
          const py = Math.floor((row * charH + charH / 2) * scaleY);
          const idx = (py * textW + px) * 4;
          const alpha = pixelData.data[idx + 3] ?? 0;
          const brightness = alpha / 255;

          if (brightness < 0.05) continue;

          const charX = col * charW;
          const charY = row * charH;

          // Distance to mouse
          const dist = Math.sqrt((charX - mx) ** 2 + (charY - my) ** 2);
          const inReveal = dist < revealRadius && mx !== -9999;

          if (inReveal) {
            // Smooth edge: blend ASCII ↔ solid
            const t = dist / revealRadius;
            const edgeBlend = t > 0.8 ? (t - 0.8) / 0.2 : 0;
            if (edgeBlend < 0.5) {
              // Solid colored text in reveal zone
              ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${brightness})`;
              // Render a filled block
              ctx.fillRect(charX, charY, charW, charH);
            } else {
              // ASCII near edge
              const charIdx = Math.floor(brightness * (charset.length - 1));
              const ch2 = charset[charIdx] ?? " ";
              ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${brightness * (1 - edgeBlend + 0.3)})`;
              ctx.fillText(ch2, charX, charY);
            }
          } else {
            // ASCII mode
            const charIdx = Math.floor(brightness * (charset.length - 1));
            const ch2 = charset[charIdx] ?? " ";
            ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${brightness * 0.85})`;
            ctx.fillText(ch2, charX, charY);
          }
        }
      }
    });

    return cleanup;
  }, [text, fontSize, charset, revealRadius, color, startLoop, position]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ display: "inline-block", position: "relative" }}
      onMouseMove={handlers.onMouseMove}
      onMouseLeave={handlers.onMouseLeave}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
