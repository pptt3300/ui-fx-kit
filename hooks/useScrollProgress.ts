import { useRef, useState, useEffect } from "react";

export interface UseScrollProgressOptions {
  /** 'element' = track element visibility, 'page' = track page scroll */
  scope?: "element" | "page";
  /** Intersection observer threshold step count — default 100 */
  steps?: number;
}

export interface ScrollState {
  /** 0..1 scroll progress */
  progress: number;
  /** Scroll velocity (px/frame, smoothed) */
  velocity: number;
  /** Scroll direction: 1 = down, -1 = up, 0 = idle */
  direction: 1 | -1 | 0;
}

/**
 * Track scroll progress and velocity.
 *
 * - scope='element': 0 when element enters viewport, 1 when fully past
 * - scope='page': 0 at top, 1 at bottom
 *
 * Usage:
 * ```tsx
 * const { ref, progress, velocity, direction } = useScrollProgress({ scope: 'element' });
 * const opacity = progress; // fade in as scrolled into view
 * ```
 */
export function useScrollProgress(options: UseScrollProgressOptions = {}) {
  const { scope = "element", steps = 100 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ScrollState>({ progress: 0, velocity: 0, direction: 0 });
  const prevScroll = useRef(0);
  const smoothVel = useRef(0);

  // Page-level scroll
  useEffect(() => {
    if (scope !== "page") return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      const rawVel = scrollY - prevScroll.current;
      smoothVel.current = smoothVel.current * 0.8 + rawVel * 0.2;
      prevScroll.current = scrollY;

      setState({
        progress: Math.max(0, Math.min(1, progress)),
        velocity: smoothVel.current,
        direction: rawVel > 0 ? 1 : rawVel < 0 ? -1 : 0,
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scope]);

  // Element-level scroll via IntersectionObserver
  useEffect(() => {
    if (scope !== "element" || !ref.current) return;
    const el = ref.current;

    const thresholds = Array.from({ length: steps + 1 }, (_, i) => i / steps);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setState((prev) => ({
          progress: entry.intersectionRatio,
          velocity: prev.velocity,
          direction: entry.intersectionRatio > prev.progress ? 1 : entry.intersectionRatio < prev.progress ? -1 : 0,
        }));
      },
      { threshold: thresholds },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [scope, steps]);

  return { ref, ...state };
}
