import { useEffect, useRef } from "react";
import { useMousePosition, useSpring } from "../../hooks";
import type { RGB } from "../../presets/colors";

interface GhostCursorProps {
  count?: number;
  stiffness?: number;
  color?: RGB;
  size?: number;
  className?: string;
}

export default function GhostCursor({
  count = 5,
  stiffness = 100,
  color = [255, 255, 255],
  size = 20,
  className = "",
}: GhostCursorProps) {
  const { position } = useMousePosition({ scope: "window" });
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);

  // Spring X/Y for each ghost
  const springsX = Array.from({ length: count }, () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSpring(-9999, { stiffness, damping: 2 * Math.sqrt(stiffness) * 0.75 }),
  );
  const springsY = Array.from({ length: count }, () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSpring(-9999, { stiffness, damping: 2 * Math.sqrt(stiffness) * 0.75 }),
  );

  useEffect(() => {
    let animId = 0;
    let last = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Ghost 0 targets mouse
      springsX[0].target.current = position.current.x;
      springsY[0].target.current = position.current.y;

      // Each subsequent ghost targets previous spring's value
      for (let i = 1; i < count; i++) {
        springsX[i].target.current = springsX[i - 1].value.current;
        springsY[i].target.current = springsY[i - 1].value.current;
      }

      // Tick all springs and update DOM
      for (let i = 0; i < count; i++) {
        const x = springsX[i].tick(dt);
        const y = springsY[i].tick(dt);
        const el = dotsRef.current[i];
        if (el) {
          el.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  // springsX/springsY are stable refs — deps intentionally minimal
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, size, position]);

  const ghosts = Array.from({ length: count }, (_, i) => {
    const opacity = 1 - i / count;
    const scale = 1 - (i / count) * 0.5;
    return (
      <div
        key={i}
        ref={(el) => {
          if (el) dotsRef.current[i] = el;
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size * scale,
          height: size * scale,
          borderRadius: "50%",
          backgroundColor: `rgba(${color[0]},${color[1]},${color[2]},${opacity})`,
          pointerEvents: "none",
          willChange: "transform",
          marginTop: (size - size * scale) / 2,
          marginLeft: (size - size * scale) / 2,
        }}
      />
    );
  });

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-50 overflow-hidden ${className}`}
    >
      {ghosts}
    </div>
  );
}
