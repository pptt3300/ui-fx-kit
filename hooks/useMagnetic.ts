import { useRef, useCallback, useEffect } from "react";
import type { SpringConfig } from "../presets/springs";

export interface UseMagneticOptions {
  /** Max displacement in pixels — default 40 */
  strength?: number;
  /** Spring config for return animation */
  spring?: Partial<SpringConfig>;
}

/**
 * Magnetic attraction effect — element follows cursor with spring physics.
 *
 * Usage:
 * ```tsx
 * const { ref, style, handlers } = useMagnetic({ strength: 30 });
 *
 * <div ref={ref} {...handlers} style={{ transform: `translate(${style.x}px, ${style.y}px)` }}>
 *   Magnetic element
 * </div>
 * ```
 */
export function useMagnetic(options: UseMagneticOptions = {}) {
  const { strength = 40, spring = {} } = options;
  const { stiffness = 200, damping = 20 } = spring;

  const ref = useRef<HTMLDivElement>(null);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const velX = useRef(0);
  const velY = useRef(0);
  const styleRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);
  const mountedRef = useRef(true);

  // Spring animation loop
  useEffect(() => {
    mountedRef.current = true;

    const animate = () => {
      if (!mountedRef.current) return;

      const forceX = -stiffness * (currentX.current - targetX.current);
      const forceY = -stiffness * (currentY.current - targetY.current);
      velX.current = (velX.current + forceX * 0.001) * (1 - damping * 0.01);
      velY.current = (velY.current + forceY * 0.001) * (1 - damping * 0.01);
      currentX.current += velX.current;
      currentY.current += velY.current;

      styleRef.current = { x: currentX.current, y: currentY.current };

      // Apply transform directly to avoid re-renders
      if (ref.current) {
        ref.current.style.transform = `translate(${currentX.current}px, ${currentY.current}px)`;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [stiffness, damping]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX.current = ((e.clientX - centerX) / rect.width) * strength;
      targetY.current = ((e.clientY - centerY) / rect.height) * strength;
    },
    [strength],
  );

  const onMouseLeave = useCallback(() => {
    targetX.current = 0;
    targetY.current = 0;
  }, []);

  return {
    ref,
    style: styleRef,
    handlers: { onMouseMove, onMouseLeave },
  };
}
