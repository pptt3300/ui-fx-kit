import { useEffect, useRef, useState } from "react";
import { useSpring, usePerlinNoise, useMousePosition } from "../../hooks";
import type { RGB } from "../../presets";

interface GeometricMorphProps {
  shapes?: string[];
  duration?: number;
  color?: RGB;
  distortRadius?: number;
  className?: string;
}

const VERTEX_COUNT = 24;

function shapeVertices(shape: string, cx: number, cy: number, r: number): [number, number][] {
  const pts: [number, number][] = [];

  if (shape === "circle") {
    for (let i = 0; i < VERTEX_COUNT; i++) {
      const a = (i / VERTEX_COUNT) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return pts;
  }

  if (shape === "triangle") {
    // 3 sides, 8 points each
    const perSide = VERTEX_COUNT / 3;
    for (let s = 0; s < 3; s++) {
      const a0 = (s / 3) * Math.PI * 2 - Math.PI / 2;
      const a1 = ((s + 1) / 3) * Math.PI * 2 - Math.PI / 2;
      const x0 = cx + Math.cos(a0) * r;
      const y0 = cy + Math.sin(a0) * r;
      const x1 = cx + Math.cos(a1) * r;
      const y1 = cy + Math.sin(a1) * r;
      for (let j = 0; j < perSide; j++) {
        const t = j / perSide;
        pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
      }
    }
    return pts;
  }

  if (shape === "hexagon") {
    const sides = 6;
    const perSide = Math.floor(VERTEX_COUNT / sides);
    for (let s = 0; s < sides; s++) {
      const a0 = (s / sides) * Math.PI * 2 - Math.PI / 6;
      const a1 = ((s + 1) / sides) * Math.PI * 2 - Math.PI / 6;
      const x0 = cx + Math.cos(a0) * r;
      const y0 = cy + Math.sin(a0) * r;
      const x1 = cx + Math.cos(a1) * r;
      const y1 = cy + Math.sin(a1) * r;
      for (let j = 0; j < perSide; j++) {
        const t = j / perSide;
        pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
      }
    }
    // Fill remaining
    while (pts.length < VERTEX_COUNT) {
      const last = pts[pts.length - 1];
      pts.push([...last]);
    }
    return pts;
  }

  if (shape === "star") {
    // 5-pointed star, VERTEX_COUNT points
    const points = 5;
    const perPoint = VERTEX_COUNT / (points * 2);
    for (let s = 0; s < points * 2; s++) {
      const a0 = (s / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const a1 = ((s + 1) / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const r0 = s % 2 === 0 ? r : r * 0.4;
      const r1 = s % 2 === 0 ? r * 0.4 : r;
      const x0 = cx + Math.cos(a0) * r0;
      const y0 = cy + Math.sin(a0) * r0;
      const x1 = cx + Math.cos(a1) * r1;
      const y1 = cy + Math.sin(a1) * r1;
      for (let j = 0; j < perPoint; j++) {
        const t = j / perPoint;
        pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
      }
    }
    // Ensure exactly VERTEX_COUNT
    while (pts.length < VERTEX_COUNT) pts.push([...pts[pts.length - 1]]);
    return pts.slice(0, VERTEX_COUNT);
  }

  // Fallback: circle
  for (let i = 0; i < VERTEX_COUNT; i++) {
    const a = (i / VERTEX_COUNT) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function lerpPoints(
  a: [number, number][],
  b: [number, number][],
  t: number,
): [number, number][] {
  return a.map((pa, i) => [
    pa[0] + (b[i][0] - pa[0]) * t,
    pa[1] + (b[i][1] - pa[1]) * t,
  ]);
}

export default function GeometricMorph({
  shapes = ["circle", "triangle", "hexagon", "star"],
  duration = 2000,
  color = [139, 92, 246],
  distortRadius = 100,
  className,
}: GeometricMorphProps) {
  const SVG_SIZE = 300;
  const cx = SVG_SIZE / 2;
  const cy = SVG_SIZE / 2;
  const r = SVG_SIZE * 0.35;

  const [shapeIndex, setShapeIndex] = useState(0);
  const nextIndexRef = useRef(1 % shapes.length);

  const fromPointsRef = useRef<[number, number][]>(
    shapeVertices(shapes[0], cx, cy, r),
  );
  const toPointsRef = useRef<[number, number][]>(
    shapeVertices(shapes[1 % shapes.length], cx, cy, r),
  );

  // Spring for morph progress 0→1
  const spring = useSpring(0, { stiffness: 80, damping: 14 });
  const progressRef = useRef(0);
  const [points, setPoints] = useState<[number, number][]>(fromPointsRef.current);

  const { noise2D } = usePerlinNoise({ scale: 0.015 });
  const { position: mousePos } = useMousePosition({ scope: "window" });
  const svgRef = useRef<SVGSVGElement>(null);

  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    // Cycle shapes every `duration` ms
    const interval = setInterval(() => {
      fromPointsRef.current = shapeVertices(shapes[shapeIndex], cx, cy, r);
      nextIndexRef.current = (shapeIndex + 1) % shapes.length;
      toPointsRef.current = shapeVertices(
        shapes[nextIndexRef.current],
        cx,
        cy,
        r,
      );
      spring.set(0);
      spring.setTarget(1);
      setShapeIndex(nextIndexRef.current);
    }, duration);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapeIndex, shapes, duration]);

  // Initial target
  useEffect(() => {
    spring.setTarget(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt;

      const t = spring.tick(dt);
      progressRef.current = Math.max(0, Math.min(1, t));

      // Interpolated base points
      const base = lerpPoints(
        fromPointsRef.current,
        toPointsRef.current,
        progressRef.current,
      );

      // Mouse proximity distortion
      let mx = -9999;
      let my = -9999;
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        mx = mousePos.current.x - rect.left;
        my = mousePos.current.y - rect.top;
      }

      const distorted: [number, number][] = base.map(([px, py]) => {
        // Perlin noise distortion
        const nx =
          noise2D(px + timeRef.current * 30, py) * 8;
        const ny =
          noise2D(px, py + timeRef.current * 30) * 8;

        // Mouse proximity distortion
        let dx = 0;
        let dy = 0;
        if (mx > -9000) {
          const distToMouse = Math.hypot(px - mx, py - my);
          if (distToMouse < distortRadius && distToMouse > 0) {
            const strength =
              (1 - distToMouse / distortRadius) * distortRadius * 0.3;
            dx = ((px - mx) / distToMouse) * strength;
            dy = ((py - my) / distToMouse) * strength;
          }
        }

        return [px + nx + dx, py + ny + dy];
      });

      setPoints(distorted);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noise2D, distortRadius]);

  const pointsStr = points.map(([x, y]) => `${x},${y}`).join(" ");
  const [r_, g_, b_] = color;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className={className}
      style={className ? { display: "block" } : { width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <filter id="glow-morph">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon
        points={pointsStr}
        fill={`rgba(${r_},${g_},${b_},0.15)`}
        stroke={`rgba(${r_},${g_},${b_},0.8)`}
        strokeWidth="1.5"
        filter="url(#glow-morph)"
      />
    </svg>
  );
}
