import { useTilt3D, useStagger, useInView } from "../../hooks";

interface BentoItem {
  content: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
}

interface BentoGridProps {
  items: BentoItem[];
  columns?: number;
  gap?: number;
  className?: string;
}

function BentoCell({ content, delay }: { content: React.ReactNode; delay: number }) {
  const { ref, shineRef, handlers } = useTilt3D({ maxRotation: 8, stiffness: 200, damping: 25 });

  return (
    <div
      ref={ref}
      {...handlers}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
        animationName: "bento-scale-in",
        animationDuration: "500ms",
        animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        width: "100%",
        height: "100%",
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        willChange: "transform",
      }}
    >
      <div
        ref={shineRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          borderRadius: "inherit",
        }}
      />
      <div style={{ position: "relative", zIndex: 2, width: "100%", height: "100%" }}>
        {content}
      </div>
    </div>
  );
}

export default function BentoGrid({
  items,
  columns = 4,
  gap = 16,
  className = "",
}: BentoGridProps) {
  const { ref, inView } = useInView({ threshold: 0.1, once: true });
  const stagger = useStagger({ count: items.length, duration: 400, pattern: "center-out" });

  if (inView) {
    stagger.start();
  }

  return (
    <>
      <style>{`
        @keyframes bento-scale-in {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0px); }
        }
      `}</style>
      <div
        ref={ref}
        className={className}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              gridColumn: item.colSpan ? `span ${item.colSpan}` : undefined,
              gridRow: item.rowSpan ? `span ${item.rowSpan}` : undefined,
              opacity: inView ? undefined : 0,
            }}
          >
            <BentoCell content={item.content} delay={inView ? stagger.getDelay(i) : 0} />
          </div>
        ))}
      </div>
    </>
  );
}
