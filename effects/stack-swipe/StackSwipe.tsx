import { useRef, useState, useEffect } from "react";
import { useGesture, useSpring } from "../../hooks";

interface StackSwipeProps {
  items: React.ReactNode[];
  onSwipe?: (direction: "left" | "right", index: number) => void;
  stackDepth?: number;
  className?: string;
}

const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 400;

export default function StackSwipe({
  items,
  onSwipe,
  stackDepth = 3,
  className = "",
}: StackSwipeProps) {
  const [topIndex, setTopIndex] = useState(0);
  const [dismissed, setDismissed] = useState<{ index: number; dir: number } | null>(null);

  const translateX = useSpring(0, { stiffness: 350, damping: 30 });
  const rotation = useSpring(0, { stiffness: 350, damping: 30 });

  const topCardRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const dragging = useRef(false);

  // rAF loop for top card spring
  useEffect(() => {
    const loop = (now: number) => {
      const dt = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 1 / 60;
      lastTimeRef.current = now;

      const tx = translateX.tick(dt);
      const rot = rotation.tick(dt);

      if (topCardRef.current) {
        topCardRef.current.style.transform = `translateX(${tx}px) rotate(${rot}deg)`;
      }

      // Check if we've left the screen
      if (dismissed && Math.abs(tx) > 400) {
        const dir = dismissed.dir;
        const idx = dismissed.index;
        setTopIndex((i) => i + 1);
        setDismissed(null);
        translateX.set(0);
        rotation.set(0);
        onSwipe?.(dir > 0 ? "right" : "left", idx);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = 0;
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [dismissed, onSwipe, rotation, translateX]);

  const gesture = useGesture({
    onDragStart: () => {
      dragging.current = true;
    },
    onDragMove: (s) => {
      translateX.setTarget(s.dx);
      rotation.setTarget(s.dx * 0.08);
    },
    onDragEnd: (s) => {
      dragging.current = false;
      const shouldDismiss =
        Math.abs(s.dx) > SWIPE_THRESHOLD || Math.abs(s.vx) > VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        const dir = s.dx > 0 || s.vx > 0 ? 1 : -1;
        translateX.setTarget(dir * 600);
        rotation.setTarget(dir * 25);
        setDismissed({ index: topIndex, dir });
      } else {
        translateX.setTarget(0);
        rotation.setTarget(0);
      }
    },
  });

  const visibleItems = items.slice(topIndex, topIndex + stackDepth);

  if (visibleItems.length === 0) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          color: "rgba(255,255,255,0.4)",
          fontSize: "14px",
        }}
      >
        No more cards
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        userSelect: "none",
      }}
    >
      {visibleItems
        .slice()
        .reverse()
        .map((item, revIdx) => {
          const stackIdx = visibleItems.length - 1 - revIdx;
          const isTop = stackIdx === 0;
          const scale = 1 - stackIdx * 0.05;
          const yOffset = stackIdx * 10;

          return (
            <div
              key={topIndex + stackIdx}
              ref={isTop ? topCardRef : undefined}
              {...(isTop ? gesture.handlers : {})}
              style={{
                position: "absolute",
                inset: 0,
                transform: isTop
                  ? undefined
                  : `translateY(${yOffset}px) scale(${scale})`,
                transformOrigin: "center bottom",
                transition: isTop ? undefined : "transform 0.3s ease",
                zIndex: visibleItems.length - stackIdx,
                cursor: isTop ? "grab" : "default",
                willChange: "transform",
              }}
            >
              {item}
            </div>
          );
        })}
    </div>
  );
}
