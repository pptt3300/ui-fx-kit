import { useRef, useEffect, useCallback, useState } from "react";

export interface MouseState {
  x: number;
  y: number;
}

export interface UseMousePositionOptions {
  /** 'element' = relative to ref element, 'window' = global viewport coords */
  scope?: "element" | "window";
  /** 'ref' = no re-renders (for canvas/rAF), 'state' = reactive (for CSS) */
  mode?: "ref" | "state";
  /** Value when mouse is outside — default { x: -9999, y: -9999 } */
  outOfBounds?: MouseState;
}

const DEFAULT_OOB: MouseState = { x: -9999, y: -9999 };

/**
 * Track mouse position relative to an element or the window.
 *
 * - mode='ref' (default): returns a MutableRefObject — no re-renders, ideal for rAF loops
 * - mode='state': returns reactive state — triggers re-renders, ideal for CSS-driven effects
 */
export function useMousePosition(options: UseMousePositionOptions & { mode: "state" }): {
  position: MouseState;
  handlers: { onMouseMove: (e: React.MouseEvent) => void; onMouseLeave: () => void };
};
export function useMousePosition(options?: UseMousePositionOptions): {
  position: React.MutableRefObject<MouseState>;
  handlers: { onMouseMove: (e: React.MouseEvent) => void; onMouseLeave: () => void };
};
export function useMousePosition(options: UseMousePositionOptions = {}) {
  const { scope = "element", mode = "ref", outOfBounds = DEFAULT_OOB } = options;

  // ref mode
  const posRef = useRef<MouseState>({ ...outOfBounds });

  // state mode
  const [posState, setPosState] = useState<MouseState>({ ...outOfBounds });

  const set = useCallback(
    (s: MouseState) => {
      if (mode === "state") setPosState(s);
      else posRef.current = s;
    },
    [mode],
  );

  // Element-scoped handlers
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (scope === "window") return; // handled by useEffect
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      set({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [scope, set],
  );

  const onMouseLeave = useCallback(() => {
    set({ ...outOfBounds });
  }, [outOfBounds, set]);

  // Window-scoped listener
  useEffect(() => {
    if (scope !== "window") return;
    const handler = (e: globalThis.MouseEvent) => {
      set({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [scope, set]);

  return {
    position: mode === "state" ? posState : posRef,
    handlers: { onMouseMove, onMouseLeave },
  };
}
