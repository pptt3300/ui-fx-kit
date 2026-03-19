import { useEffect, useRef } from "react";
import { useCanvasSetup } from "../../hooks";
import type { RGB } from "../../presets";

const CHARSETS = {
  katakana:
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
  latin: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  binary: "01",
};

interface MatrixRainProps {
  charset?: "katakana" | "latin" | "binary" | string;
  speed?: number;
  density?: number;
  color?: RGB;
  className?: string;
}

interface Column {
  y: number;
  speed: number;
  length: number;
}

export default function MatrixRain({
  charset = "katakana",
  speed = 1,
  density = 0.7,
  color = [34, 211, 153],
  className,
}: MatrixRainProps) {
  const { canvasRef, startLoop, size } = useCanvasSetup();
  const columnsRef = useRef<Column[]>([]);
  const charsetStr =
    charset in CHARSETS ? CHARSETS[charset as keyof typeof CHARSETS] : charset;

  // Rebuild columns when size changes
  useEffect(() => {
    if (size.width === 0) return;
    const fontSize = 14;
    const colCount = Math.floor(size.width / fontSize);
    columnsRef.current = Array.from({ length: colCount }, () => ({
      y: Math.random() * -size.height,
      speed: (0.5 + Math.random()) * speed * fontSize,
      length: 5 + Math.floor(Math.random() * 20),
    }));
  }, [size.width, size.height, speed]);

  useEffect(() => {
    return startLoop((ctx, dt) => {
      const { width: w, height: h } = ctx.canvas.getBoundingClientRect
        ? { width: ctx.canvas.width / 2, height: ctx.canvas.height / 2 }
        : { width: ctx.canvas.width, height: ctx.canvas.height };

      // Semi-transparent fade
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, w, h);

      const fontSize = 14;
      ctx.font = `${fontSize}px monospace`;

      const [r, g, b] = color;
      const columns = columnsRef.current;

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];

        // Skip sparse columns based on density
        if (Math.random() > density * 0.1 && col.y > 0) {
          // only draw when active
        }

        // Draw head character brighter
        const x = i * fontSize;
        const headY = col.y;

        if (headY > 0 && headY < h + fontSize) {
          // Head: bright white-green
          ctx.fillStyle = `rgba(200,255,220,0.95)`;
          const headChar =
            charsetStr[Math.floor(Math.random() * charsetStr.length)];
          ctx.fillText(headChar, x, headY);

          // Trail characters
          for (let j = 1; j < col.length; j++) {
            const trailY = headY - j * fontSize;
            if (trailY < 0) break;
            const alpha = (1 - j / col.length) * 0.8;
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            const trailChar =
              charsetStr[Math.floor(Math.random() * charsetStr.length)];
            ctx.fillText(trailChar, x, trailY);
          }
        }

        col.y += col.speed * dt;

        // Respawn when column fully exits bottom
        if (col.y - col.length * fontSize > h) {
          if (Math.random() < density) {
            col.y = -fontSize * col.length;
            col.speed = (0.5 + Math.random()) * speed * fontSize;
            col.length = 5 + Math.floor(Math.random() * 20);
          } else {
            col.y = -fontSize * col.length - Math.random() * h;
          }
        }
      }
    });
  }, [startLoop, color, charsetStr, density, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={className ? { background: "#000" } : { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", background: "#000" }}
    />
  );
}
