import { useEffect, useRef } from "react";
import { useScramble, useInView } from "../../hooks";

interface ScrambleTextProps {
  text: string;
  trigger?: "mount" | "hover" | "inView";
  speed?: number;
  charset?: string;
  className?: string;
}

export default function ScrambleText({
  text,
  trigger = "mount",
  speed = 50,
  charset,
  className,
}: ScrambleTextProps) {
  const autoStart = trigger === "mount";
  const { displayText, start } = useScramble({ text, speed, charset, autoStart });
  const { ref: inViewRef, inView } = useInView({ threshold: 0.1, once: true });
  const startedRef = useRef(false);

  useEffect(() => {
    if (trigger === "inView" && inView && !startedRef.current) {
      startedRef.current = true;
      start();
    }
  }, [trigger, inView, start]);

  if (trigger === "hover") {
    return (
      <span
        className={className}
        onMouseEnter={start}
        style={{ cursor: "default", fontFamily: "monospace" }}
      >
        {displayText}
      </span>
    );
  }

  if (trigger === "inView") {
    return (
      <span
        ref={inViewRef as React.RefObject<HTMLSpanElement>}
        className={className}
        style={{ fontFamily: "monospace" }}
      >
        {displayText}
      </span>
    );
  }

  return (
    <span className={className} style={{ fontFamily: "monospace" }}>
      {displayText}
    </span>
  );
}
