import { useRef, useCallback } from "react";
import type { SpringConfig } from "../presets/springs";

const DEFAULTS: Required<SpringConfig> = {
  stiffness: 200,
  damping: 20,
  mass: 1,
  precision: 0.01,
};

/**
 * Zero-dependency spring physics for a single numeric value.
 * Ideal for Canvas animation loops where framer-motion isn't available.
 *
 * Usage:
 * ```ts
 * const spring = useSpring(0, { stiffness: 300, damping: 25 });
 *
 * // In rAF loop:
 * spring.target.current = 100;       // set goal
 * const current = spring.tick(dt);    // advance physics
 * ```
 */
export function useSpring(initial: number, config?: Partial<SpringConfig>) {
  const cfg = { ...DEFAULTS, ...config };
  const value = useRef(initial);
  const velocity = useRef(0);
  const target = useRef(initial);

  const tick = useCallback(
    (dt: number): number => {
      const displacement = value.current - target.current;
      const springForce = -cfg.stiffness * displacement;
      const dampingForce = -cfg.damping * velocity.current;
      const acceleration = (springForce + dampingForce) / cfg.mass;

      velocity.current += acceleration * dt;
      value.current += velocity.current * dt;

      // Settle check
      if (
        Math.abs(velocity.current) < cfg.precision &&
        Math.abs(displacement) < cfg.precision
      ) {
        velocity.current = 0;
        value.current = target.current;
      }

      return value.current;
    },
    [cfg.stiffness, cfg.damping, cfg.mass, cfg.precision],
  );

  const settled = useCallback((): boolean => {
    const displacement = Math.abs(value.current - target.current);
    return displacement < cfg.precision && Math.abs(velocity.current) < cfg.precision;
  }, [cfg.precision]);

  const set = useCallback((v: number) => {
    value.current = v;
    velocity.current = 0;
  }, []);

  return { value, velocity, target, tick, settled, set };
}
