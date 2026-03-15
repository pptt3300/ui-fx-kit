import { useEffect, useRef } from "react";
import { useMousePosition, useSpring } from "../../hooks";
import "../../css/sticker-peel.css";

type Corner = "bottom-right" | "bottom-left" | "top-right" | "top-left";

interface StickerPeelProps {
  front: React.ReactNode;
  behind?: React.ReactNode;
  corner?: Corner;
  className?: string;
}

const PEEL_RADIUS = 100; // px from corner to trigger enhanced peel

function getCornerPos(corner: Corner, rect: DOMRect): { cx: number; cy: number } {
  return {
    cx: corner.includes("right") ? rect.width : 0,
    cy: corner.includes("bottom") ? rect.height : 0,
  };
}

function cornerToCSSVars(corner: Corner): {
  before: string;
  after: string;
} {
  const map: Record<Corner, { before: string; after: string }> = {
    "bottom-right": {
      before: "bottom: 0; right: 0;",
      after: "bottom: 0; right: 0;",
    },
    "bottom-left": {
      before: "bottom: 0; left: 0;",
      after: "bottom: 0; left: 0;",
    },
    "top-right": {
      before: "top: 0; right: 0;",
      after: "top: 0; right: 0;",
    },
    "top-left": {
      before: "top: 0; left: 0;",
      after: "top: 0; left: 0;",
    },
  };
  return map[corner];
}

export default function StickerPeel({
  front,
  behind,
  corner = "bottom-right",
  className = "",
}: StickerPeelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const peelRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const peelSize = useSpring(0, { stiffness: 300, damping: 28 });
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const { position, handlers: mouseHandlers } = useMousePosition({
    scope: "element",
    mode: "ref",
  });

  useEffect(() => {
    const loop = (now: number) => {
      const dt = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 1 / 60;
      lastTimeRef.current = now;

      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const pos = (position as React.MutableRefObject<{ x: number; y: number }>).current;
        const { cx, cy } = getCornerPos(corner, rect);
        const dist = Math.hypot((pos?.x ?? cx) - cx, (pos?.y ?? cy) - cy);
        const inside = dist < PEEL_RADIUS && pos?.x >= 0;
        const targetPeel = inside ? Math.max(40, PEEL_RADIUS - dist) : 0;
        peelSize.target.current = targetPeel;
      }

      const sz = peelSize.tick(dt);

      if (peelRef.current) {
        peelRef.current.style.width = `${sz}px`;
        peelRef.current.style.height = `${sz}px`;
      }
      if (shadowRef.current) {
        shadowRef.current.style.width = `${sz * 0.9}px`;
        shadowRef.current.style.height = `${sz * 0.9}px`;
      }

      animRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = 0;
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [corner]);

  const gradDir = {
    "bottom-right": "225deg",
    "bottom-left": "315deg",
    "top-right": "135deg",
    "top-left": "45deg",
  }[corner];

  const cornerStyle = cornerToCSSVars(corner);
  const positionProps = corner.includes("right")
    ? { right: 0 }
    : { left: 0 };
  const positionPropsV = corner.includes("bottom")
    ? { bottom: 0 }
    : { top: 0 };

  return (
    <div
      ref={containerRef}
      onMouseMove={mouseHandlers.onMouseMove}
      onMouseLeave={mouseHandlers.onMouseLeave}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
      }}
    >
      {/* Behind content */}
      {behind && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
          }}
        >
          {behind}
        </div>
      )}

      {/* Front content */}
      <div style={{ position: "relative", zIndex: 1 }}>{front}</div>

      {/* Peel fold shadow */}
      <div
        ref={shadowRef}
        style={{
          position: "absolute",
          ...positionProps,
          ...positionPropsV,
          width: 0,
          height: 0,
          boxShadow: `-3px -3px 8px rgba(0,0,0,0.2)`,
          pointerEvents: "none",
          zIndex: 9,
        }}
      />

      {/* Peel corner */}
      <div
        ref={peelRef}
        style={{
          position: "absolute",
          ...positionProps,
          ...positionPropsV,
          width: 0,
          height: 0,
          background: `linear-gradient(${gradDir}, transparent 50%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.12) 56%, rgba(255,255,255,0.92) 56%)`,
          pointerEvents: "none",
          zIndex: 10,
          transition: "none",
        }}
      />
    </div>
  );
}
