import { useRef, useState, useEffect, useCallback } from "react";

export interface UseMorphTextOptions {
  texts: string[];
  holdDuration?: number;
  morphDuration?: number;
}

export interface MorphTextState {
  current: string;
  next: string;
  progress: number;
  morphing: boolean;
}

/**
 * Text morph cycle — blur-fade transitions between an array of words.
 *
 * Usage:
 * ```tsx
 * const morph = useMorphText({ texts: ["Build", "Ship", "Scale"] });
 * return (
 *   <span style={{
 *     filter: `blur(${morph.morphing ? morph.progress * 8 : 0}px)`,
 *     opacity: morph.morphing ? 1 - morph.progress * 0.5 : 1,
 *   }}>
 *     {morph.morphing && morph.progress > 0.5 ? morph.next : morph.current}
 *   </span>
 * );
 * ```
 */
export function useMorphText(options: UseMorphTextOptions) {
  const { texts, holdDuration = 2000, morphDuration = 600 } = options;
  const index = useRef(0);
  const [state, setState] = useState<MorphTextState>({
    current: texts[0] ?? "",
    next: texts[1] ?? texts[0] ?? "",
    progress: 0,
    morphing: false,
  });
  const animId = useRef(0);
  const cycleRef = useRef<(() => (() => void)) | null>(null);

  const cycle = useCallback((): (() => void) => {
    const nextIndex = (index.current + 1) % texts.length;
    const currentText = texts[index.current] ?? "";
    const nextText = texts[nextIndex] ?? "";
    setState({ current: currentText, next: nextText, progress: 0, morphing: false });

    const holdTimer = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / morphDuration, 1);
        setState({ current: currentText, next: nextText, progress, morphing: true });
        if (progress < 1) {
          animId.current = requestAnimationFrame(animate);
        } else {
          index.current = nextIndex;
          cycleRef.current?.();
        }
      };
      animId.current = requestAnimationFrame(animate);
    }, holdDuration);

    return () => { clearTimeout(holdTimer); cancelAnimationFrame(animId.current); };
  }, [texts, holdDuration, morphDuration]);

  useEffect(() => {
    cycleRef.current = cycle;
  });

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const id = requestAnimationFrame(() => {
      cleanup = cycle();
    });
    return () => { cancelAnimationFrame(id); cleanup?.(); cancelAnimationFrame(animId.current); };
  }, [cycle]);

  return state;
}
