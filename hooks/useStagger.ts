import { useRef, useCallback } from "react";

export type StaggerPattern = "linear" | "center-out" | "edges-in" | "random";

export interface UseStaggerOptions {
  /** Total number of items to stagger */
  count: number;
  /** Total duration of stagger spread in ms — default 300 */
  duration?: number;
  /** Distribution pattern — default "linear" */
  pattern?: StaggerPattern;
}

export interface StaggerItem {
  /** Delay in ms before this item starts */
  delay: number;
  /** 0..1 normalized position in the stagger sequence */
  progress: number;
  /** Whether this item's animation has started (based on elapsed time) */
  active: boolean;
}

/**
 * Staggered animation orchestrator.
 * Computes delays for N items based on distribution pattern.
 *
 * Usage:
 * ```tsx
 * const stagger = useStagger({ count: 10, duration: 500, pattern: "center-out" });
 *
 * // Get delay for item at index
 * const delay = stagger.getDelay(3); // ms
 *
 * // In rAF loop, update elapsed time to compute active states
 * stagger.tick(dt);
 * const items = stagger.getItems();
 * ```
 */
export function useStagger(options: UseStaggerOptions) {
  const { count, duration = 300, pattern = "linear" } = options;
  const elapsed = useRef(0);
  const running = useRef(false);

  const computeDelays = useCallback((): number[] => {
    const delays: number[] = [];
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0;
      let mapped: number;
      switch (pattern) {
        case "center-out": {
          const center = (count - 1) / 2;
          mapped = Math.abs(i - center) / (center || 1);
          break;
        }
        case "edges-in": {
          const center = (count - 1) / 2;
          mapped = 1 - Math.abs(i - center) / (center || 1);
          break;
        }
        case "random":
          mapped = Math.random();
          break;
        case "linear":
        default:
          mapped = t;
      }
      delays.push(mapped * duration);
    }
    return delays;
  }, [count, duration, pattern]);

  const delaysRef = useRef(computeDelays());

  const getDelay = useCallback(
    (index: number): number => delaysRef.current[index] ?? 0,
    [],
  );

  const start = useCallback(() => {
    elapsed.current = 0;
    running.current = true;
    delaysRef.current = computeDelays();
  }, [computeDelays]);

  const tick = useCallback((dt: number) => {
    if (!running.current) return;
    elapsed.current += dt * 1000; // convert s to ms
  }, []);

  const getItems = useCallback((): StaggerItem[] => {
    return delaysRef.current.map((delay, i) => ({
      delay,
      progress: count > 1 ? i / (count - 1) : 0,
      active: elapsed.current >= delay,
    }));
  }, [count]);

  const reset = useCallback(() => {
    elapsed.current = 0;
    running.current = false;
  }, []);

  return { getDelay, getItems, start, tick, reset };
}
