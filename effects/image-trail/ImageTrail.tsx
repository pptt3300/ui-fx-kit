import { useState, useRef, useEffect, useCallback } from "react";
import { useMousePosition } from "../../hooks";

interface TrailImage {
  id: number;
  src: string;
  x: number;
  y: number;
  rotation: number;
  visible: boolean;
}

interface ImageTrailProps {
  images: string[];
  trailLength?: number;
  spawnDistance?: number;
  className?: string;
}

let idCounter = 0;

export default function ImageTrail({
  images,
  trailLength = 8,
  spawnDistance = 50,
  className = "",
}: ImageTrailProps) {
  const [items, setItems] = useState<TrailImage[]>([]);
  const { position } = useMousePosition({ scope: "window" });
  const lastSpawn = useRef({ x: -9999, y: -9999 });
  const imageIndex = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeItem = useCallback((id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, visible: false } : item)),
    );
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 400);
  }, []);

  useEffect(() => {
    const checkSpawn = () => {
      const mx = position.current.x;
      const my = position.current.y;
      const dx = mx - lastSpawn.current.x;
      const dy = my - lastSpawn.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= spawnDistance && images.length > 0) {
        lastSpawn.current = { x: mx, y: my };

        const src = images[imageIndex.current % images.length];
        imageIndex.current++;

        const id = idCounter++;
        const rotation = (Math.random() - 0.5) * 30;

        setItems((prev) => {
          const next = [...prev, { id, src, x: mx, y: my, rotation, visible: true }];
          // Keep max trailLength — schedule removal of oldest if over limit
          if (next.length > trailLength) {
            const oldest = next[0];
            return next.slice(1).concat();
          }
          return next;
        });

        // Schedule fade out
        const timer = setTimeout(() => {
          removeItem(id);
          timersRef.current.delete(id);
        }, 600);
        timersRef.current.set(id, timer);
      }

      requestAnimationFrame(checkSpawn);
    };

    const rafId = requestAnimationFrame(checkSpawn);
    return () => cancelAnimationFrame(rafId);
  }, [position, spawnDistance, images, trailLength, removeItem]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 overflow-hidden ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            left: item.x,
            top: item.y,
            transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.visible ? 1 : 0.6})`,
            opacity: item.visible ? 1 : 0,
            transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
            pointerEvents: "none",
          }}
        >
          <img
            src={item.src}
            alt=""
            style={{
              width: 80,
              height: 80,
              objectFit: "cover",
              borderRadius: 8,
              display: "block",
              userSelect: "none",
              draggable: false,
            } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  );
}
