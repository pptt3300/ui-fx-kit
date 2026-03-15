import { useRef, useEffect, useState } from "react";
import { useGesture, useSpring } from "../hooks";

interface CircularGalleryProps {
  items: React.ReactNode[];
  radius?: number;
  autoSpeed?: number;
  draggable?: boolean;
  className?: string;
}

export default function CircularGallery({
  items,
  radius = 300,
  autoSpeed = 0.5,
  draggable = true,
  className = "",
}: CircularGalleryProps) {
  const angleRef = useRef(0);
  const autoSpeedRef = useRef(autoSpeed);
  autoSpeedRef.current = autoSpeed;
  const radiusRef = useRef(radius);
  radiusRef.current = radius;

  const velocitySpring = useSpring(0, { stiffness: 60, damping: 18 });
  const [, forceUpdate] = useState(0);
  const rafRef = useRef<number>(0);
  const lastTime = useRef(0);
  const isDragging = useRef(false);

  const gesture = useGesture({
    onDragStart: () => {
      isDragging.current = true;
      velocitySpring.target.current = 0;
    },
    onDragMove: (s) => {
      // Map dx to angle change — 1px = 0.3 degrees
      const dAngle = s.vx * 0.003;
      angleRef.current += dAngle;
      velocitySpring.set(dAngle * 60); // approximate velocity in deg/frame
    },
    onDragEnd: (s) => {
      isDragging.current = false;
      // Momentum from fling velocity
      const flingAngle = s.vx * 0.003;
      velocitySpring.set(flingAngle * 60);
      velocitySpring.target.current = 0;
    },
  });

  useEffect(() => {
    let running = true;

    const loop = (now: number) => {
      if (!running) return;
      const dt = lastTime.current ? Math.min((now - lastTime.current) / 1000, 0.05) : 0.016;
      lastTime.current = now;

      if (!isDragging.current) {
        // Auto rotate + momentum decay
        const vel = velocitySpring.tick(dt);
        angleRef.current += vel * dt + autoSpeedRef.current * dt;
      }

      forceUpdate((n) => n + 1);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [velocitySpring]);

  const count = items.length;

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: (radius * 2) + 200,
        height: (radius * 2) + 200,
        perspective: 1200,
        cursor: draggable ? "grab" : "default",
      }}
      {...(draggable ? gesture.handlers : {})}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
        }}
      >
        {items.map((item, i) => {
          const baseAngle = (i / count) * 360;
          const totalAngle = baseAngle + angleRef.current;
          const rad = (totalAngle * Math.PI) / 180;
          const x = Math.sin(rad) * radius;
          const z = Math.cos(rad) * radius;

          // Opacity based on z depth (front = 1, back = 0.2)
          const normalizedZ = (z + radius) / (2 * radius);
          const opacity = 0.2 + normalizedZ * 0.8;
          const scale = 0.7 + normalizedZ * 0.3;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) scale(${scale})`,
                opacity,
                transition: "opacity 0.1s ease",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}
