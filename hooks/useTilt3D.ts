import { useRef, useCallback, useEffect } from "react";

export interface UseTilt3DOptions {
  /** Max rotation in degrees — default 15 */
  maxRotation?: number;
  /** Spring stiffness — default 300 */
  stiffness?: number;
  /** Spring damping — default 30 */
  damping?: number;
  /** Generate shine overlay — default true */
  shine?: boolean;
}

/**
 * 3D perspective tilt that follows cursor with spring physics.
 *
 * Usage:
 * ```tsx
 * const { ref, handlers } = useTilt3D({ maxRotation: 12 });
 *
 * <div ref={ref} {...handlers} style={{ perspective: 1000 }}>
 *   content
 * </div>
 * ```
 *
 * The hook applies transforms directly to the DOM element (no re-renders).
 * If `shine` is true, it also adds a pseudo-overlay via a child div
 * you can create with the returned `shineStyle`.
 */
export function useTilt3D(options: UseTilt3DOptions = {}) {
  const { maxRotation = 15, stiffness = 300, damping = 30, shine = true } = options;

  const ref = useRef<HTMLDivElement>(null);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const velX = useRef(0);
  const velY = useRef(0);
  const mouseNorm = useRef({ x: 0.5, y: 0.5 });
  const shineRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const animate = () => {
      if (!mountedRef.current) return;

      const fx = -stiffness * (currentX.current - targetX.current);
      const fy = -stiffness * (currentY.current - targetY.current);
      velX.current = (velX.current + fx * 0.001) * (1 - damping * 0.01);
      velY.current = (velY.current + fy * 0.001) * (1 - damping * 0.01);
      currentX.current += velX.current;
      currentY.current += velY.current;

      if (ref.current) {
        ref.current.style.transform = `perspective(1000px) rotateX(${currentY.current}deg) rotateY(${-currentX.current}deg)`;
        ref.current.style.transformStyle = "preserve-3d";
      }

      if (shine && shineRef.current) {
        const nx = mouseNorm.current.x;
        const ny = mouseNorm.current.y;
        shineRef.current.style.background = `radial-gradient(circle at ${nx * 100}% ${ny * 100}%, rgba(255,255,255,0.25) 0%, transparent 60%)`;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [stiffness, damping, shine]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      mouseNorm.current = { x: nx, y: ny };
      targetX.current = (nx - 0.5) * maxRotation * 2;
      targetY.current = (ny - 0.5) * maxRotation * 2;
    },
    [maxRotation],
  );

  const onMouseLeave = useCallback(() => {
    targetX.current = 0;
    targetY.current = 0;
    mouseNorm.current = { x: 0.5, y: 0.5 };
  }, []);

  return {
    ref,
    shineRef,
    handlers: { onMouseMove, onMouseLeave },
  };
}
