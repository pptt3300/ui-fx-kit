import { useRef } from "react";
import { useMousePosition, proximity } from "../../hooks";
import type { RGB } from "../../presets/colors";

interface DockMagnifyProps {
  items: Array<{ icon: React.ReactNode; label?: string }>;
  baseSize?: number;
  maxSize?: number;
  radius?: number;
  className?: string;
}

export default function DockMagnify({
  items,
  baseSize = 48,
  maxSize = 80,
  radius = 3,
  className = "",
}: DockMagnifyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { position, handlers } = useMousePosition({ scope: "element", mode: "state" });
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Sigma controls Gaussian spread — radius items each side
  const sigma = baseSize * radius * 0.6;

  const getScale = (index: number): number => {
    if (!containerRef.current) return baseSize;
    const el = itemRefs.current[index];
    if (!el) return baseSize;
    const rect = el.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const itemCenterX = rect.left - containerRect.left + rect.width / 2;
    const itemCenterY = rect.top - containerRect.top + rect.height / 2;

    const { inRange, distance } = proximity(
      { x: position.x, y: position.y },
      { x: itemCenterX, y: itemCenterY },
      { radius: baseSize * (radius + 1) },
    );

    if (!inRange && distance > baseSize * (radius + 1)) return baseSize;

    const dist = Math.sqrt(
      Math.pow(position.x - itemCenterX, 2) + Math.pow(position.y - itemCenterY, 2),
    );
    const gaussian = Math.exp(-(dist * dist) / (2 * sigma * sigma));
    return baseSize + (maxSize - baseSize) * gaussian;
  };

  return (
    <div
      ref={containerRef}
      className={`flex items-end gap-2 px-5 py-4 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/15 shadow-2xl ${className}`}
      {...handlers}
    >
      {items.map((item, i) => {
        const size = getScale(i);
        return (
          <div
            key={i}
            ref={(el) => { itemRefs.current[i] = el; }}
            className="relative flex flex-col items-center group"
            style={{ transition: "all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          >
            {item.label && (
              <div
                className="absolute bottom-full mb-2 px-2 py-1 rounded-md text-xs font-medium bg-gray-900 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{ transition: "opacity 0.15s ease" }}
              >
                {item.label}
              </div>
            )}
            <div
              style={{
                width: size,
                height: size,
                transition: "width 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: size * 0.22,
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              {item.icon}
            </div>
          </div>
        );
      })}
    </div>
  );
}
