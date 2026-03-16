import { useRef, useState, useCallback } from "react";
import type { RGB } from "../presets/colors";
import { rgba } from "../presets/colors";

export interface UseSpotlightOptions {
  /** Gradient radius in px — default 300 */
  radius?: number;
  /** Primary color — default indigo [99,102,241] */
  color?: RGB;
  /** Secondary color for conic mode — default violet [139,92,246] */
  secondaryColor?: RGB;
  /** Opacity at center — default 0.15 */
  intensity?: number;
}

/**
 * Cursor-tracking spotlight effect that returns CSS gradient strings.
 *
 * Usage:
 * ```tsx
 * const { ref, isHovered, spotlightBg, borderGlowBg, handlers } = useSpotlight();
 *
 * <div ref={ref} {...handlers}>
 *   {isHovered && <div style={{ background: spotlightBg }} className="absolute inset-0 pointer-events-none" />}
 *   <div style={{ background: borderGlowBg }} className="p-[1px] rounded-xl">
 *     <div className="bg-white rounded-xl">content</div>
 *   </div>
 * </div>
 * ```
 */
export function useSpotlight(options: UseSpotlightOptions = {}) {
  const {
    radius = 300,
    color = [99, 102, 241] as RGB,
    secondaryColor = [139, 92, 246] as RGB,
    intensity = 0.15,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [elWidth, setElWidth] = useState(400);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setElWidth(rect.width || 400);
  }, []);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  const { x, y } = mousePos;

  /** Radial spotlight overlay (inner glow) */
  const spotlightBg = isHovered
    ? `radial-gradient(${radius}px circle at ${x}px ${y}px, ${rgba(color, intensity)}, transparent 60%)`
    : "none";

  /** Radial border glow (for p-[1px] wrapper technique) */
  const borderGlowBg = isHovered
    ? `radial-gradient(${radius}px circle at ${x}px ${y}px, ${rgba(color, 1)}, ${rgba(secondaryColor, 0.5)} 30%, transparent 60%)`
    : "transparent";

  /** Conic rotating gradient border (for focused/active states) */
  const conicBorderBg = (() => {
    const w = elWidth;
    const deg = Math.round((x / w) * 360);
    return `conic-gradient(from ${deg}deg at ${x}px ${y}px, ${rgba(color, 1)}, ${rgba(secondaryColor, 1)}, ${rgba([34, 211, 238], 1)}, ${rgba(secondaryColor, 1)}, ${rgba(color, 1)})`;
  })();

  return {
    ref,
    mousePos,
    isHovered,
    spotlightBg,
    borderGlowBg,
    conicBorderBg,
    handlers: { onMouseMove, onMouseEnter, onMouseLeave },
  };
}
