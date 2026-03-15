import { useState, useCallback, useRef } from "react";
import type { RGB } from "../../presets/colors";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface RippleButtonProps {
  children: React.ReactNode;
  rippleColor?: RGB;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

let nextId = 0;

export default function RippleButton({
  children,
  rippleColor = [255, 255, 255],
  onClick,
  className = "",
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2.5;
      const id = nextId++;

      setRipples((prev) => [...prev, { id, x, y, size }]);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);

      onClick?.(e);
    },
    [onClick],
  );

  const [r, g, b] = rippleColor;

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      style={{ isolation: "isolate" }}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            position: "absolute",
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            borderRadius: "50%",
            background: `rgba(${r},${g},${b},0.35)`,
            transform: "scale(0)",
            animation: "fx-ripple-expand 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            pointerEvents: "none",
          }}
        />
      ))}
      <style>{`
        @keyframes fx-ripple-expand {
          0% { transform: scale(0); opacity: 1; }
          80% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.1); opacity: 0; }
        }
      `}</style>
    </button>
  );
}
