import { useRef, useCallback, useEffect } from "react";

export interface ParticleConfig<T> {
  /** Factory function to create a new particle */
  spawn: () => T;
  /** Update a particle each frame. Return `false` to remove it. */
  update: (particle: T, dt: number) => boolean;
  /** Maximum particle count — oldest are culled when exceeded. Default 2000. */
  maxCount?: number;
}

/**
 * Generic particle system manager.
 *
 * Usage:
 * ```ts
 * const particles = useParticles<MyParticle>({
 *   spawn: () => ({ x: 0, y: 0, vx: rand(), vy: rand(), alpha: 1 }),
 *   update: (p, dt) => { p.x += p.vx; p.alpha *= 0.95; return p.alpha > 0.01; },
 * });
 *
 * // Emit 10 particles
 * particles.emit(10);
 *
 * // In rAF loop:
 * particles.tick(dt);
 * particles.forEach(ctx, (ctx, p) => {
 *   ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
 * });
 * ```
 */
export function useParticles<T>(config: ParticleConfig<T>) {
  const { maxCount = 2000 } = config;
  const items = useRef<T[]>([]);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; });

  /** Emit `count` new particles using the current spawn function */
  const emit = useCallback(
    (count: number) => {
      const cfg = configRef.current;
      for (let i = 0; i < count; i++) {
        items.current.push(cfg.spawn());
      }
      // cull oldest if over limit
      if (items.current.length > maxCount) {
        items.current.splice(0, items.current.length - maxCount);
      }
    },
    [maxCount],
  );

  /** Emit particles with a custom spawner (one-off, doesn't replace config.spawn) */
  const emitWith = useCallback(
    (count: number, spawner: () => T) => {
      for (let i = 0; i < count; i++) {
        items.current.push(spawner());
      }
      if (items.current.length > maxCount) {
        items.current.splice(0, items.current.length - maxCount);
      }
    },
    [maxCount],
  );

  /** Run update on all particles, removing dead ones. Call once per frame. */
  const tick = useCallback(
    (dt: number) => {
      const cfg = configRef.current;
      for (let i = items.current.length - 1; i >= 0; i--) {
        if (!cfg.update(items.current[i], dt)) {
          items.current.splice(i, 1);
        }
      }
    },
    [],
  );

  /** Iterate all particles with a canvas context for drawing */
  const forEach = useCallback(
    (ctx: CanvasRenderingContext2D, renderer: (ctx: CanvasRenderingContext2D, p: T) => void) => {
      for (const p of items.current) {
        renderer(ctx, p);
      }
    },
    [],
  );

  /** Clear all particles */
  const clear = useCallback(() => {
    items.current.length = 0;
  }, []);

  return { items, emit, emitWith, tick, forEach, clear };
}
