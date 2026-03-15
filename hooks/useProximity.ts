export type EasingType = "linear" | "quadratic" | "cubic";

export interface ProximityResult {
  /** Raw distance in pixels */
  distance: number;
  /** 0..1, how close (1 = on top, 0 = out of radius) */
  proximity: number;
  /** Eased proximity value */
  force: number;
  /** Angle from target to source in radians */
  angle: number;
  /** Whether source is within radius */
  inRange: boolean;
}

const EASING: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  quadratic: (t) => t * t,
  cubic: (t) => t * t * t,
};

/**
 * Pure computation: distance-based force field between two points.
 * Not a React hook — no state, no effects. Just math.
 *
 * Usage:
 * ```ts
 * const result = proximity(mouse, dot, { radius: 120, easing: 'quadratic' });
 * if (result.inRange) {
 *   dot.x -= Math.cos(result.angle) * result.force * maxDisplacement;
 * }
 * ```
 */
export function proximity(
  source: { x: number; y: number },
  target: { x: number; y: number },
  options: { radius: number; easing?: EasingType },
): ProximityResult {
  const { radius, easing = "quadratic" } = options;
  const dx = source.x - target.x;
  const dy = source.y - target.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const inRange = distance < radius && distance > 0;
  const raw = inRange ? 1 - distance / radius : 0;

  return {
    distance,
    proximity: raw,
    force: EASING[easing](raw),
    angle: Math.atan2(dy, dx),
    inRange,
  };
}
