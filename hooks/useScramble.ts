import { useRef, useState, useCallback, useEffect } from "react";

export interface UseScrambleOptions {
  text: string;
  charset?: string;
  speed?: number;
  revealPerTick?: number;
  autoStart?: boolean;
}

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

/**
 * Text character-by-character decode state machine.
 * Characters scramble through random glyphs before settling on the target.
 *
 * Usage:
 * ```tsx
 * const { displayText, start } = useScramble({ text: "HELLO WORLD", speed: 40 });
 * return <span onMouseEnter={start}>{displayText}</span>;
 * ```
 */
export function useScramble(options: UseScrambleOptions) {
  const { text, charset = DEFAULT_CHARSET, speed = 50, revealPerTick = 1, autoStart = true } = options;
  const [displayText, setDisplayText] = useState(autoStart ? "" : text);
  const revealedCount = useRef(0);
  const frameId = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (frameId.current !== null) { clearInterval(frameId.current); frameId.current = null; }
  }, []);

  const start = useCallback(() => {
    stop();
    revealedCount.current = 0;
    frameId.current = setInterval(() => {
      revealedCount.current = Math.min(revealedCount.current + revealPerTick, text.length);
      const revealed = text.slice(0, revealedCount.current);
      const remaining = text.length - revealedCount.current;
      const scrambled = Array.from({ length: remaining }, () =>
        charset[Math.floor(Math.random() * charset.length)]
      ).join("");
      setDisplayText(revealed + scrambled);
      if (revealedCount.current >= text.length) stop();
    }, speed);
  }, [text, charset, speed, revealPerTick, stop]);

  useEffect(() => {
    if (autoStart) start();
    return stop;
  }, [autoStart, start, stop]);

  return { displayText, start, stop, isComplete: revealedCount.current >= text.length };
}
