import { useEffect, useRef, useState } from "react";
import { useSpring } from "../hooks";

interface CircularTextProps {
  text: string;
  radius?: number;
  speed?: number;
  reverseOnHover?: boolean;
  className?: string;
}

export default function CircularText({
  text,
  radius = 100,
  speed = 30,
  reverseOnHover = true,
  className,
}: CircularTextProps) {
  const angle = useRef(0);
  const [rotation, setRotation] = useState(0);
  const hoveredRef = useRef(false);
  const springSpeed = useSpring(speed, { stiffness: 80, damping: 18 });
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);

  const size = (radius + 20) * 2;
  const cx = size / 2;
  const cy = size / 2;

  // SVG circle path for textPath
  const pathId = useRef(`circ-${Math.random().toString(36).slice(2)}`).current;
  const d = `M ${cx},${cy - radius} A ${radius},${radius} 0 1 1 ${cx - 0.001},${cy - radius}`;

  useEffect(() => {
    const loop = (now: number) => {
      const dt = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = now;

      const targetSpeed = hoveredRef.current && reverseOnHover ? -speed : speed;
      springSpeed.target.current = targetSpeed;
      const currentSpeed = springSpeed.tick(dt);

      angle.current += currentSpeed * dt;
      setRotation(angle.current % 360);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, reverseOnHover]);

  return (
    <div
      className={className}
      style={{ display: "inline-block", width: size, height: size }}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <path id={pathId} d={d} />
        </defs>
        <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
          <text
            style={{
              fontSize: 14,
              fontFamily: "monospace",
              fill: "currentColor",
              letterSpacing: "0.1em",
            }}
          >
            <textPath href={`#${pathId}`} startOffset="0%">
              {text}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
}
