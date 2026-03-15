import { useRef, useCallback } from "react";

export interface GestureState {
  /** Current drag offset from start */
  dx: number;
  dy: number;
  /** Velocity of drag */
  vx: number;
  vy: number;
  /** Whether currently dragging */
  dragging: boolean;
  /** Start position */
  startX: number;
  startY: number;
}

export interface UseGestureOptions {
  /** Called on drag start */
  onDragStart?: (state: GestureState) => void;
  /** Called on each drag move */
  onDragMove?: (state: GestureState) => void;
  /** Called on drag end — includes final velocity for fling detection */
  onDragEnd?: (state: GestureState) => void;
  /** Lock to axis after initial movement — default false */
  lockAxis?: boolean;
}

const INITIAL: GestureState = {
  dx: 0, dy: 0, vx: 0, vy: 0,
  dragging: false, startX: 0, startY: 0,
};

/**
 * Unified drag/swipe gesture handling via pointer events.
 * Zero-dependency — no gesture library needed.
 *
 * Usage:
 * ```tsx
 * const gesture = useGesture({
 *   onDragMove: (s) => { transform.current = `translateX(${s.dx}px)` },
 *   onDragEnd: (s) => { if (Math.abs(s.vx) > 500) dismiss() },
 * });
 *
 * return <div {...gesture.handlers} />;
 * ```
 */
export function useGesture(options: UseGestureOptions = {}) {
  const { onDragStart, onDragMove, onDragEnd, lockAxis = false } = options;
  const state = useRef<GestureState>({ ...INITIAL });
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const axis = useRef<"x" | "y" | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      state.current = {
        ...INITIAL,
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
      };
      lastPos.current = { x: e.clientX, y: e.clientY };
      lastTime.current = performance.now();
      axis.current = null;
      onDragStart?.(state.current);
    },
    [onDragStart],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!state.current.dragging) return;
      const now = performance.now();
      const dtSec = (now - lastTime.current) / 1000 || 1 / 60;

      let dx = e.clientX - state.current.startX;
      let dy = e.clientY - state.current.startY;

      if (lockAxis && !axis.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis.current === "x") dy = 0;
      if (axis.current === "y") dx = 0;

      const vx = (e.clientX - lastPos.current.x) / dtSec;
      const vy = (e.clientY - lastPos.current.y) / dtSec;

      state.current = { ...state.current, dx, dy, vx, vy };
      lastPos.current = { x: e.clientX, y: e.clientY };
      lastTime.current = now;
      onDragMove?.(state.current);
    },
    [onDragMove, lockAxis],
  );

  const onPointerUp = useCallback(
    (_e: React.PointerEvent) => {
      state.current = { ...state.current, dragging: false };
      onDragEnd?.(state.current);
    },
    [onDragEnd],
  );

  const handlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    style: { touchAction: "none" as const },
  };

  return { state, handlers };
}
