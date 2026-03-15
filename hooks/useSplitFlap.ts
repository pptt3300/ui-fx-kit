import { useRef, useState, useCallback, useEffect } from "react";

export interface UseSplitFlapOptions {
  text: string;
  charset?: string;
  flipSpeed?: number;
  stagger?: number;
  autoStart?: boolean;
}

export interface FlapChar {
  current: string;
  flipping: boolean;
  flipProgress: number;
}

const DEFAULT_CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:!?-";

/**
 * Split-flap display state machine.
 * Each column cycles through charset until it reaches the target character.
 *
 * Usage:
 * ```tsx
 * const { chars, start } = useSplitFlap({ text: "DEPARTING 10:45" });
 * return chars.map((c, i) => (
 *   <span key={i} className={c.flipping ? "flipping" : ""}>{c.current}</span>
 * ));
 * ```
 */
export function useSplitFlap(options: UseSplitFlapOptions) {
  const { text, charset = DEFAULT_CHARSET, flipSpeed = 60, stagger = 30, autoStart = true } = options;
  const [chars, setChars] = useState<FlapChar[]>(() =>
    Array.from(text, () => ({ current: " ", flipping: false, flipProgress: 0 }))
  );
  const targets = useRef<number[]>([]);
  const frameId = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);

  const stop = useCallback(() => {
    if (frameId.current !== null) { clearInterval(frameId.current); frameId.current = null; }
  }, []);

  const start = useCallback(() => {
    stop();
    targets.current = Array.from(text, (ch) => {
      const idx = charset.indexOf(ch.toUpperCase());
      return idx >= 0 ? idx : 0;
    });
    startTime.current = performance.now();
    frameId.current = setInterval(() => {
      const elapsed = performance.now() - startTime.current;
      let allDone = true;
      const newChars: FlapChar[] = [];
      for (let i = 0; i < text.length; i++) {
        const columnStart = i * stagger;
        const columnElapsed = elapsed - columnStart;
        if (columnElapsed < 0) {
          newChars.push({ current: " ", flipping: false, flipProgress: 0 });
          allDone = false;
          continue;
        }
        const target = targets.current[i];
        const stepsElapsed = Math.floor(columnElapsed / flipSpeed);
        const pos = Math.min(stepsElapsed, target);
        const done = pos >= target;
        newChars.push({
          current: charset[pos] ?? " ",
          flipping: !done,
          flipProgress: done ? 1 : (columnElapsed % flipSpeed) / flipSpeed,
        });
        if (!done) allDone = false;
      }
      setChars(newChars);
      if (allDone) stop();
    }, flipSpeed / 2);
  }, [text, charset, flipSpeed, stagger, stop]);

  useEffect(() => {
    if (autoStart) start();
    return stop;
  }, [autoStart, start, stop]);

  return { chars, start, stop };
}
