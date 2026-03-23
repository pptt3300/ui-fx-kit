/**
 * Spotlight Input — Input with cursor-tracking border glow, typing sparkles, and submit shockwave.
 *
 * Features:
 * - Hover: radial gradient border follows cursor
 * - Focus: rotating conic gradient rainbow border + outer glow shadow
 * - Typing: sparkle particles burst from cursor position on each keypress
 * - Submit: expanding shockwave rings + particle explosion from button
 *
 * Usage:
 *   <SpotlightInput
 *     placeholder="Enter URL..."
 *     buttonLabel="Go"
 *     onSubmit={(value) => console.log(value)}
 *   />
 *
 * Adapt: swap Tailwind classes, colors in SPARK_COLORS, border gradient stops.
 * The cn() helper is just clsx+tailwind-merge — replace with your own or inline.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useCanvasSetup, useParticles, useSpotlight } from "../../hooks";
import type { RGB } from "../../presets/colors";
import { resolvePalette } from "../../presets/resolve";

interface Sparkle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; alpha: number;
  color: [number, number, number];
}

interface Shockwave {
  x: number; y: number;
  radius: number; maxRadius: number;
  alpha: number;
  color: [number, number, number];
}

const DEFAULT_SPARK_COLORS: RGB[] = [
  [99, 102, 241],
  [139, 92, 246],
  [34, 211, 238],
  [167, 139, 250],
  [255, 255, 255],
];

interface Props {
  onSubmit: (value: string) => void;
  onFocusChange?: (focused: boolean) => void;
  placeholder?: string;
  buttonLabel?: string;
  loading?: boolean;
  palette?: string;
}

export default function SpotlightInput({
  onSubmit,
  onFocusChange,
  placeholder = "Type here...",
  buttonLabel = "Submit",
  loading = false,
  palette,
}: Props) {
  const sparkColors = resolvePalette(palette, 'particles', DEFAULT_SPARK_COLORS);
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { ref: containerRef, isHovered, spotlightBg, borderGlowBg, conicBorderBg, handlers: spotlightHandlers } = useSpotlight();
  const { canvasRef, startLoop } = useCanvasSetup({ dpr: 2 });

  const sparkles = useParticles<Sparkle>({
    spawn: () => ({
      x: 0, y: 0, vx: 0, vy: 0,
      size: 1 + Math.random() * 2, alpha: 0.8 + Math.random() * 0.2,
      color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
    }),
    update: (s) => {
      s.x += s.vx; s.y += s.vy;
      s.vy += 0.06; s.vx *= 0.97; s.alpha *= 0.94; s.size *= 0.98;
      return s.alpha >= 0.02 && s.size >= 0.2;
    },
    maxCount: 200,
  });

  const shockwaves = useParticles<Shockwave>({
    spawn: () => ({
      x: 0, y: 0, radius: 5, maxRadius: 200, alpha: 0.5,
      color: sparkColors[0],
    }),
    update: (w) => {
      w.radius += (w.maxRadius - w.radius) * 0.06;
      w.alpha *= 0.96;
      return w.alpha >= 0.01;
    },
    maxCount: 10,
  });

  const spawnShockwave = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const cx = containerRect.right - canvasRect.left - 50;
    const cy = containerRect.top - canvasRect.top + containerRect.height / 2;

    for (let i = 0; i < 3; i++) {
      shockwaves.emitWith(1, () => ({
        x: cx, y: cy, radius: 5 + i * 3,
        maxRadius: 200 + i * 80, alpha: 0.5 - i * 0.1,
        color: sparkColors[i % sparkColors.length],
      }));
    }
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.3;
      const speed = 3 + Math.random() * 6;
      sparkles.emitWith(1, () => ({
        x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5, alpha: 0.9,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
      }));
    }
  }, [canvasRef, containerRef, sparkles, shockwaves]);

  const spawnSparkles = useCallback((x: number, y: number) => {
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 1.5 + Math.random() * 3;
      sparkles.emitWith(1, () => ({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.5,
        size: 1 + Math.random() * 2, alpha: 0.8 + Math.random() * 0.2,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
      }));
    }
  }, [sparkles]);

  useEffect(() => {
    return startLoop((ctx) => {
      const w = ctx.canvas.width / 2;
      const h = ctx.canvas.height / 2;
      ctx.clearRect(0, 0, w, h);

      sparkles.tick(1);
      sparkles.forEach(ctx, (c, s) => {
        c.beginPath(); c.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
        c.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${s.alpha * 0.15})`; c.fill();
        c.beginPath(); c.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${s.alpha})`; c.fill();
      });

      shockwaves.tick(1);
      shockwaves.forEach(ctx, (c, w) => {
        c.beginPath(); c.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        c.strokeStyle = `rgba(${w.color[0]},${w.color[1]},${w.color[2]},${w.alpha})`; c.lineWidth = 2; c.stroke();
        c.beginPath(); c.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        c.strokeStyle = `rgba(${w.color[0]},${w.color[1]},${w.color[2]},${w.alpha * 0.3})`; c.lineWidth = 6; c.stroke();
      });
    });
  }, [startLoop, sparkles, shockwaves]);

  const handleKeyDown = () => {
    const input = inputRef.current; const canvas = canvasRef.current;
    if (!input || !canvas) return;
    const inputRect = input.getBoundingClientRect(); const canvasRect = canvas.getBoundingClientRect();
    const selStart = input.selectionStart ?? value.length;
    const cursorX = inputRect.left - canvasRect.left + 20 + selStart * 9.5;
    const cursorY = inputRect.top - canvasRect.top + inputRect.height / 2;
    spawnSparkles(cursorX, cursorY);
  };

  const borderBg = isFocused
    ? conicBorderBg
    : isHovered
      ? borderGlowBg
      : "#e2e8f0";

  const innerGlow = isHovered ? spotlightBg : "none";

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ height: "100%" }} />
      <form onSubmit={(e) => { e.preventDefault(); if (value.trim()) { spawnShockwave(); onSubmit(value.trim()); } }}>
        <div ref={containerRef} {...spotlightHandlers}
          className={`relative rounded-2xl p-[1px] transition-shadow duration-300 ${isFocused ? "shadow-[0_0_30px_-5px_rgba(99,102,241,0.3),0_0_60px_-10px_rgba(139,92,246,0.15)]" : ""}`}
          style={{ background: borderBg }}>
          <div className="relative rounded-2xl bg-white overflow-hidden">
            {isHovered && <div className="absolute inset-0 pointer-events-none transition-opacity duration-300" style={{ background: innerGlow }} />}
            <div className="relative p-1.5">
              <input ref={inputRef} type="text" value={value} onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { setIsFocused(true); onFocusChange?.(true); }}
                onBlur={() => { setIsFocused(false); onFocusChange?.(false); }}
                placeholder={placeholder} disabled={loading}
                className="w-full rounded-xl bg-transparent px-5 py-4 pr-32 text-base placeholder:text-gray-400 focus:outline-none disabled:opacity-50 transition-all duration-200"
              />
              <button type="submit" disabled={loading || !value.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40 transition-all duration-300 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 hover:from-indigo-400 hover:via-violet-400 hover:to-cyan-400 shadow-md hover:shadow-lg">
                {buttonLabel}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
