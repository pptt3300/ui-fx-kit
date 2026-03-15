import { useMorphText } from "../hooks";

interface MorphingTextProps {
  texts: string[];
  holdDuration?: number;
  morphDuration?: number;
  className?: string;
}

export default function MorphingText({
  texts,
  holdDuration = 2000,
  morphDuration = 600,
  className,
}: MorphingTextProps) {
  const morph = useMorphText({ texts, holdDuration, morphDuration });

  // First half of morph: blur/fade out current → at 0.5 swap → blur/fade in next
  const isFirstHalf = morph.progress <= 0.5;
  const displayed = morph.morphing && morph.progress > 0.5 ? morph.next : morph.current;

  let blur: number;
  let opacity: number;

  if (!morph.morphing) {
    blur = 0;
    opacity = 1;
  } else if (isFirstHalf) {
    // fade out: 0→0.5 progress, blur 0→8, opacity 1→0.5
    const t = morph.progress * 2;
    blur = t * 8;
    opacity = 1 - t * 0.5;
  } else {
    // fade in: 0.5→1 progress
    const t = (morph.progress - 0.5) * 2;
    blur = (1 - t) * 8;
    opacity = 0.5 + t * 0.5;
  }

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        filter: `blur(${blur}px)`,
        opacity,
        transition: "none",
        willChange: "filter, opacity",
      }}
    >
      {displayed}
    </span>
  );
}
