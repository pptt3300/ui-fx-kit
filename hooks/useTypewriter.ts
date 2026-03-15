import { useState, useEffect, useRef } from "react";

export interface UseTypewriterOptions {
  /** Array of phrases to cycle through */
  phrases: string[];
  /** Typing speed in ms per character — default 60 */
  typingSpeed?: number;
  /** Deleting speed in ms per character — default 35 */
  deletingSpeed?: number;
  /** Pause duration at full text in ms — default 2000 */
  pauseDuration?: number;
  /** Whether to loop through phrases — default true. If false, stops after first phrase. */
  loop?: boolean;
}

export interface TypewriterState {
  /** Currently displayed text */
  text: string;
  /** Current phase */
  phase: "typing" | "pausing" | "deleting";
  /** Index of current phrase */
  phraseIndex: number;
  /** Whether typing is complete (only relevant when loop=false) */
  done: boolean;
}

/**
 * Pure state machine for typewriter text effect.
 * No DOM involvement — returns text state that you can render however you want.
 *
 * Usage:
 * ```tsx
 * const { text, phase } = useTypewriter({
 *   phrases: ["Hello", "World"],
 * });
 *
 * return <span>{text}<span className={phase !== 'done' ? 'animate-blink' : ''}>|</span></span>;
 * ```
 */
export function useTypewriter(options: UseTypewriterOptions): TypewriterState {
  const {
    phrases,
    typingSpeed = 60,
    deletingSpeed = 35,
    pauseDuration = 2000,
    loop = true,
  } = options;

  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (done) return;
    const current = phrases[phraseIdx];

    if (phase === "typing") {
      if (text.length < current.length) {
        timeoutRef.current = setTimeout(() => {
          setText(current.slice(0, text.length + 1));
        }, typingSpeed + Math.random() * 40);
      } else {
        // Full text reached
        if (!loop && phrases.length === 1) {
          setDone(true);
          setPhase("pausing");
          return;
        }
        setPhase("pausing");
        timeoutRef.current = setTimeout(() => {
          if (!loop && phraseIdx === phrases.length - 1) {
            setDone(true);
          } else {
            setPhase("deleting");
          }
        }, pauseDuration);
      }
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setText(text.slice(0, -1));
        }, deletingSpeed);
      } else {
        setPhase("typing");
        setPhraseIdx((phraseIdx + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timeoutRef.current);
  }, [text, phase, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseDuration, loop, done]);

  return { text, phase, phraseIndex: phraseIdx, done };
}
