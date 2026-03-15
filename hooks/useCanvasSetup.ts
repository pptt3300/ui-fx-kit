import { useRef, useEffect, useCallback, useState } from "react";

export interface UseCanvasSetupOptions {
  /** Device pixel ratio multiplier — default 2 */
  dpr?: number;
  /** Called after each resize with context and logical dimensions */
  onResize?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

/**
 * DPI-aware canvas setup with automatic resize handling and rAF loop management.
 *
 * Usage:
 * ```tsx
 * const { canvasRef, startLoop } = useCanvasSetup();
 *
 * useEffect(() => {
 *   return startLoop((ctx, dt) => {
 *     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
 *     // draw...
 *   });
 * }, [startLoop]);
 * ```
 */
export function useCanvasSetup(options: UseCanvasSetupOptions = {}) {
  const { dpr = 2, onResize } = options;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Resize handler
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxRef.current = ctx;
    setSize({ width: rect.width, height: rect.height });
    onResize?.(ctx, rect.width, rect.height);
  }, [dpr, onResize]);

  // Auto-resize on mount + window resize
  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  /**
   * Start a requestAnimationFrame loop.
   * Returns a cleanup function that stops the loop.
   *
   * `draw(ctx, deltaTime)` is called every frame.
   */
  const startLoop = useCallback(
    (draw: (ctx: CanvasRenderingContext2D, dt: number) => void) => {
      let animId = 0;
      let lastTime = performance.now();

      const loop = (now: number) => {
        const ctx = ctxRef.current;
        if (!ctx) {
          animId = requestAnimationFrame(loop);
          return;
        }
        const dt = (now - lastTime) / 1000; // seconds
        lastTime = now;
        draw(ctx, dt);
        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animId);
    },
    [],
  );

  return { canvasRef, ctx: ctxRef, size, startLoop, resize };
}
