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

const SPARK_COLORS: [number, number, number][] = [
  [99, 102, 241],   // indigo
  [139, 92, 246],   // violet
  [34, 211, 238],   // cyan
  [167, 139, 250],  // lavender
  [255, 255, 255],  // white
];

interface Props {
  onSubmit: (value: string) => void;
  onFocusChange?: (focused: boolean) => void;
  placeholder?: string;
  buttonLabel?: string;
  loading?: boolean;
}

export default function SpotlightInput({
  onSubmit,
  onFocusChange,
  placeholder = "Type here...",
  buttonLabel = "Submit",
  loading = false,
}: Props) {
  const [value, setValue] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sparkCanvasRef = useRef<HTMLCanvasElement>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const sparkAnimRef = useRef<number>(0);

  const spawnShockwave = useCallback(() => {
    const canvas = sparkCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const cx = containerRect.right - canvasRect.left - 50;
    const cy = containerRect.top - canvasRect.top + containerRect.height / 2;

    for (let i = 0; i < 3; i++) {
      shockwavesRef.current.push({
        x: cx, y: cy, radius: 5 + i * 3,
        maxRadius: 200 + i * 80, alpha: 0.5 - i * 0.1,
        color: SPARK_COLORS[i % SPARK_COLORS.length],
      });
    }
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.3;
      const speed = 3 + Math.random() * 6;
      sparklesRef.current.push({
        x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5, alpha: 0.9,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
      });
    }
  }, []);

  const spawnSparkles = useCallback((x: number, y: number) => {
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 1.5 + Math.random() * 3;
      sparklesRef.current.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.5,
        size: 1 + Math.random() * 2, alpha: 0.8 + Math.random() * 0.2,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
      });
    }
  }, []);

  useEffect(() => {
    const canvas = sparkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
    };
    resize();
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const sparks = sparklesRef.current;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy;
        s.vy += 0.06; s.vx *= 0.97; s.alpha *= 0.94; s.size *= 0.98;
        if (s.alpha < 0.02 || s.size < 0.2) { sparks.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${s.alpha * 0.15})`; ctx.fill();
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${s.alpha})`; ctx.fill();
      }
      const waves = shockwavesRef.current;
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        w.radius += (w.maxRadius - w.radius) * 0.06; w.alpha *= 0.96;
        if (w.alpha < 0.01) { waves.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${w.color[0]},${w.color[1]},${w.color[2]},${w.alpha})`; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${w.color[0]},${w.color[1]},${w.color[2]},${w.alpha * 0.3})`; ctx.lineWidth = 6; ctx.stroke();
      }
      sparkAnimRef.current = requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(sparkAnimRef.current); window.removeEventListener("resize", resize); };
  }, []);

  const handleKeyDown = () => {
    const input = inputRef.current; const canvas = sparkCanvasRef.current;
    if (!input || !canvas) return;
    const inputRect = input.getBoundingClientRect(); const canvasRect = canvas.getBoundingClientRect();
    const selStart = input.selectionStart ?? value.length;
    const cursorX = inputRect.left - canvasRect.left + 20 + selStart * 9.5;
    const cursorY = inputRect.top - canvasRect.top + inputRect.height / 2;
    spawnSparkles(cursorX, cursorY);
  };

  const handleMouse = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const borderBg = isFocused
    ? `conic-gradient(from ${Math.round((mousePos.x / (containerRef.current?.offsetWidth || 400)) * 360)}deg at ${mousePos.x}px ${mousePos.y}px, #6366f1, #8b5cf6, #22d3ee, #a78bfa, #6366f1)`
    : isHovered
      ? `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, #6366f1, #8b5cf6 30%, transparent 60%)`
      : "#e2e8f0";

  const innerGlow = isHovered
    ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.04), rgba(139,92,246,0.02) 40%, transparent 60%)`
    : "none";

  return (
    <div className="relative">
      <canvas ref={sparkCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ height: "100%" }} />
      <form onSubmit={(e) => { e.preventDefault(); if (value.trim()) { spawnShockwave(); onSubmit(value.trim()); } }}>
        <div ref={containerRef} onMouseMove={handleMouse} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
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
