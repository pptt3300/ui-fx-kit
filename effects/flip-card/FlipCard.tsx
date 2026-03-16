import { useEffect, useRef, useState } from "react";
import { useSpring } from "../../hooks";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  trigger?: "hover" | "click";
  direction?: "horizontal" | "vertical";
  className?: string;
}

export default function FlipCard({
  front,
  back,
  trigger = "hover",
  direction = "horizontal",
  className = "",
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const spring = useSpring(0, { stiffness: 280, damping: 28 });
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    spring.setTarget(flipped ? 180 : 0);

    const loop = (now: number) => {
      const dt = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 1 / 60;
      lastTimeRef.current = now;

      const val = spring.tick(dt);
      if (innerRef.current) {
        if (direction === "horizontal") {
          innerRef.current.style.transform = `rotateY(${val}deg)`;
        } else {
          innerRef.current.style.transform = `rotateX(${val}deg)`;
        }
      }

      if (!spring.settled()) {
        animRef.current = requestAnimationFrame(loop);
      }
    };

    lastTimeRef.current = 0;
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [flipped, direction, spring]);

  const containerHandlers =
    trigger === "hover"
      ? {
          onMouseEnter: () => setFlipped(true),
          onMouseLeave: () => setFlipped(false),
        }
      : {
          onClick: () => setFlipped((f) => !f),
        };

  const backRotate = direction === "horizontal" ? "rotateY(180deg)" : "rotateX(180deg)";

  return (
    <div
      {...containerHandlers}
      className={className}
      style={{
        perspective: "1000px",
        cursor: trigger === "click" ? "pointer" : "default",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        ref={innerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Front */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {front}
        </div>

        {/* Back */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: backRotate,
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
}
