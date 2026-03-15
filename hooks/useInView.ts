import { useRef, useState, useEffect, useCallback } from "react";

export interface UseInViewOptions {
  /** Trigger threshold 0..1 — default 0.1 */
  threshold?: number;
  /** Only trigger once — default true */
  once?: boolean;
  /** Root margin — default "0px" */
  rootMargin?: string;
}

/**
 * Intersection Observer wrapper for triggering effects on scroll-into-view.
 * Binary in/out detection — use useScrollProgress for continuous interpolation.
 *
 * Usage:
 * ```tsx
 * const { ref, inView } = useInView({ threshold: 0.2, once: true });
 * return <div ref={ref} style={{ opacity: inView ? 1 : 0 }}>Content</div>;
 * ```
 */
export function useInView(options: UseInViewOptions = {}) {
  const { threshold = 0.1, once = true, rootMargin = "0px" } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (once && triggered.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const isInView = entry.isIntersecting;
        if (isInView && once) {
          triggered.current = true;
          setInView(true);
          observer.disconnect();
        } else if (!once) {
          setInView(isInView);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  const reset = useCallback(() => {
    triggered.current = false;
    setInView(false);
  }, []);

  return { ref, inView, reset };
}
