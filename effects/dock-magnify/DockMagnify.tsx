import { useRef, useState, useCallback } from "react";
import { useMousePosition } from "../../hooks";

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
  const { handlers } = useMousePosition({ scope: "element", mode: "state" });
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [sizes, setSizes] = useState<number[]>(items.map(() => baseSize));

  // Sigma controls Gaussian spread — radius items each side
  const sigma = baseSize * radius * 0.6;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handlers.onMouseMove(e);
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const containerRect = containerEl.getBoundingClientRect();
    const mx = e.clientX - containerRect.left;
    const my = e.clientY - containerRect.top;
    const newSizes = items.map((_, index) => {
      const el = itemRefs.current[index];
      if (!el) return baseSize;
      const rect = el.getBoundingClientRect();
      const itemCenterX = rect.left - containerRect.left + rect.width / 2;
      const itemCenterY = rect.top - containerRect.top + rect.height / 2;
      const dist = Math.sqrt(Math.pow(mx - itemCenterX, 2) + Math.pow(my - itemCenterY, 2));
      const gaussian = Math.exp(-(dist * dist) / (2 * sigma * sigma));
      return baseSize + (maxSize - baseSize) * gaussian;
    });
    setSizes(newSizes);
  }, [items, baseSize, maxSize, sigma, handlers]);

  const handleMouseLeave = useCallback(() => {
    handlers.onMouseLeave();
    setSizes(items.map(() => baseSize));
  }, [items, baseSize, handlers]);

  return (
    <div
      ref={containerRef}
      className={`flex items-end gap-2 px-5 py-4 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/15 shadow-2xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {items.map((item, i) => {
        const size = sizes[i] ?? baseSize;
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
