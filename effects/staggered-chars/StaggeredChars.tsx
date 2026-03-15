import { useEffect, useRef, useState } from "react";
import "../../css/stagger-presets.css";
import { useStagger, useInView } from "../hooks";

type Variant = "wave" | "bounce" | "rotate" | "fade" | "scale";
type Pattern = "linear" | "center-out" | "edges-in" | "random";

interface StaggeredCharsProps {
  text: string;
  variant?: Variant;
  pattern?: Pattern;
  duration?: number;
  trigger?: "mount" | "hover" | "inView";
  className?: string;
}

export default function StaggeredChars({
  text,
  variant = "wave",
  pattern = "linear",
  duration = 500,
  trigger = "mount",
  className,
}: StaggeredCharsProps) {
  const chars = text.split("");
  const stagger = useStagger({ count: chars.length, duration, pattern });
  const { ref: inViewRef, inView } = useInView({ threshold: 0.1, once: true });
  const [playing, setPlaying] = useState(trigger === "mount");
  const startedRef = useRef(false);

  useEffect(() => {
    if (trigger === "mount") {
      stagger.start();
    }
  }, []);

  useEffect(() => {
    if (trigger === "inView" && inView && !startedRef.current) {
      startedRef.current = true;
      stagger.start();
      setPlaying(true);
    }
  }, [trigger, inView]);

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      stagger.start();
      setPlaying(true);
    }
  };

  // Variant keyframe name map
  const animationMap: Record<Variant, string> = {
    wave: "fx-stagger-wave",
    bounce: "fx-stagger-bounce",
    rotate: "fx-stagger-flip",
    fade: "fx-stagger-slide-up",
    scale: "fx-stagger-scale",
  };

  const animName = animationMap[variant];

  const wrapStyle: React.CSSProperties = {
    display: "inline-block",
  };

  return (
    <span
      ref={inViewRef as React.RefObject<HTMLSpanElement>}
      className={className}
      style={{ display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
    >
      {chars.map((char, i) => {
        const delay = stagger.getDelay(i);
        const isSpace = char === " ";

        if (isSpace) {
          return <span key={i} style={{ display: "inline-block", width: "0.3em" }} />;
        }

        return (
          <span
            key={i}
            className={`fx-stagger-item ${playing ? "fx-active" : ""}`}
            style={{
              ...wrapStyle,
              animationName: playing ? animName : undefined,
              animationDelay: playing ? `${delay}ms` : undefined,
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
