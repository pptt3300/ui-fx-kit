import { useState, useEffect, useRef } from "react";

interface Props {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export default function TypewriterText({
  phrases,
  typingSpeed = 60,
  deletingSpeed = 35,
  pauseDuration = 2000,
}: Props) {
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const current = phrases[phraseIdx];

    if (!isDeleting) {
      if (displayed.length < current.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1));
        }, typingSpeed + Math.random() * 40);
      } else if (phrases.length > 1) {
        // Multiple phrases: pause then delete to cycle
        timeoutRef.current = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
      // Single phrase: stay put, cursor keeps blinking
    } else {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setPhraseIdx((phraseIdx + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timeoutRef.current);
  }, [displayed, isDeleting, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className="inline-flex items-center">
      <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
        {displayed}
      </span>
      <span
        className="inline-block w-[2px] h-[1.1em] ml-0.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500"
        style={{
          animation: "cursor-blink 0.8s ease-in-out infinite",
        }}
      />
    </span>
  );
}
