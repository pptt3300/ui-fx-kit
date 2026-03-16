import { useScrollProgress } from "../../hooks";

interface HorizontalScrollProps {
  items: React.ReactNode[];
  cardWidth?: number;
  gap?: number;
  className?: string;
}

export default function HorizontalScroll({
  items,
  cardWidth = 300,
  gap = 24,
  className = "",
}: HorizontalScrollProps) {
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;

  const totalWidth = items.length * (cardWidth + gap) - gap;
  const scrollDistance = Math.max(0, totalWidth - viewportWidth);

  // Container needs to be tall enough so the scroll distance equals content overflow
  const containerHeight = `calc(100vh + ${scrollDistance}px)`;

  const { ref, progress } = useScrollProgress({ scope: "element", steps: 200 });

  const translateX = -(progress * scrollDistance);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{ height: containerHeight }}
    >
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: "100vh", display: "flex", alignItems: "center" }}
      >
        <div
          style={{
            display: "flex",
            gap,
            paddingLeft: 40,
            paddingRight: 40,
            transform: `translateX(${translateX}px)`,
            willChange: "transform",
            transition: "none",
          }}
        >
          {items.map((item, i) => {
            // Center card: whichever is closest to 0.5 progress
            const normalizedPos = totalWidth > 0
              ? (i * (cardWidth + gap)) / totalWidth
              : 0;
            const distanceFromCenter = Math.abs(normalizedPos - progress);
            const scale = Math.max(0.85, 1 - distanceFromCenter * 0.8);

            return (
              <div
                key={i}
                style={{
                  width: cardWidth,
                  flexShrink: 0,
                  transform: `scale(${scale})`,
                  transition: "transform 0.2s ease",
                  willChange: "transform",
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
