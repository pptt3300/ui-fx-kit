import { useRef } from "react";
import { useMousePosition, proximity } from "../hooks";

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
  const { position, handlers } = useMousePosition({ scope: "element", mode: "state" });
  const mousePos = position as { x: number; y: number };
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const chars = text.split("");

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
      onMouseMove={handlers.onMouseMove}
      onMouseLeave={handlers.onMouseLeave}
    >
      {chars.map((char, i) => {
        const el = charRefs.current[i];
        let weight = minWeight;
        let scale = 1;

        if (el && mousePos.x !== -9999) {
          const rect = el.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            // Position relative to container
            const charCenterX = rect.left - containerRect.left + rect.width / 2;
            const charCenterY = rect.top - containerRect.top + rect.height / 2;
            const result = proximity(
              mousePos,
              { x: charCenterX, y: charCenterY },
              { radius, easing: "quadratic" },
            );
            if (result.inRange) {
              weight = minWeight + result.force * (maxWeight - minWeight);
              scale = 1 + result.force * 0.15;
            }
          }
        }

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
