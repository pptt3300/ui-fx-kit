import { useRef, useState, useCallback } from "react";
import { useMousePosition, proximity } from "../../hooks";

interface TextPressureProps {
  text: string;
  radius?: number;
  minWeight?: number;
  maxWeight?: number;
  fontFamily?: string;
  className?: string;
}

export default function TextPressure({
  text,
  radius = 150,
  minWeight = 100,
  maxWeight = 900,
  fontFamily = "Inter",
  className,
}: TextPressureProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const { handlers } = useMousePosition({ scope: "element", mode: "state" });
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const chars = text.split("");
  const [charStyles, setCharStyles] = useState<{ weight: number; scale: number }[]>(
    chars.map(() => ({ weight: minWeight, scale: 1 })),
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handlers.onMouseMove(e);
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const containerRect = containerEl.getBoundingClientRect();
    const mx = e.clientX - containerRect.left;
    const my = e.clientY - containerRect.top;
    const newStyles = chars.map((_, i) => {
      const el = charRefs.current[i];
      if (!el) return { weight: minWeight, scale: 1 };
      const rect = el.getBoundingClientRect();
      const charCenterX = rect.left - containerRect.left + rect.width / 2;
      const charCenterY = rect.top - containerRect.top + rect.height / 2;
      const result = proximity(
        { x: mx, y: my },
        { x: charCenterX, y: charCenterY },
        { radius, easing: "quadratic" },
      );
      if (result.inRange) {
        return {
          weight: minWeight + result.force * (maxWeight - minWeight),
          scale: 1 + result.force * 0.15,
        };
      }
      return { weight: minWeight, scale: 1 };
    });
    setCharStyles(newStyles);
  }, [chars, minWeight, maxWeight, radius, handlers]);

  const handleMouseLeave = useCallback(() => {
    handlers.onMouseLeave();
    setCharStyles(chars.map(() => ({ weight: minWeight, scale: 1 })));
  }, [chars, minWeight, handlers]);

  return (
    <span
      ref={containerRef}
      className={className}
      style={{
        display: "inline-block",
        fontFamily,
        cursor: "default",
        userSelect: "none",
        position: "relative",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {chars.map((char, i) => {
        const { weight, scale } = charStyles[i] ?? { weight: minWeight, scale: 1 };
        return (
          <span
            key={i}
            ref={(el) => { charRefs.current[i] = el; }}
            style={{
              display: "inline-block",
              fontVariationSettings: `"wght" ${Math.round(weight)}`,
              fontWeight: Math.round(weight),
              transform: `scale(${scale})`,
              transition: "font-variation-settings 0.1s ease, transform 0.1s ease",
              willChange: "font-variation-settings, transform",
            }}
          >
            {char === " " ? "\u00a0" : char}
          </span>
        );
      })}
    </span>
  );
}
