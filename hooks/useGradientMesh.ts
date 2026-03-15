import { useRef, useCallback } from "react";

export type RGB = [number, number, number];

export interface GradientBlob {
  x: number; y: number;
  vx: number; vy: number;
  color: [number, number, number];
  radius: number;
}

export interface UseGradientMeshOptions {
  count?: number;
  colors?: [number, number, number][];
  speed?: number;
}

const DEFAULT_COLORS: [number, number, number][] = [
  [99, 102, 241], [139, 92, 246], [34, 211, 238], [244, 114, 182],
];

/**
 * Animated gradient mesh with drifting radial blobs.
 *
 * Usage:
 * ```tsx
 * const mesh = useGradientMesh({ count: 4, speed: 0.2 });
 * // In rAF: mesh.tick(dt); element.style.background = mesh.toCSS();
 * ```
 */
export function useGradientMesh(options: UseGradientMeshOptions = {}) {
  const { count = 4, colors = DEFAULT_COLORS, speed = 0.3 } = options;

  const blobs = useRef<GradientBlob[]>([]);
  if (blobs.current.length === 0) {
    blobs.current = Array.from({ length: count }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * speed * 0.01,
      vy: (Math.random() - 0.5) * speed * 0.01,
      color: colors[i % colors.length],
      radius: 0.25 + Math.random() * 0.15,
    }));
  }

  const tick = useCallback((dt: number) => {
    for (const blob of blobs.current) {
      blob.x += blob.vx * dt;
      blob.y += blob.vy * dt;
      if (blob.x < -0.1 || blob.x > 1.1) blob.vx *= -1;
      if (blob.y < -0.1 || blob.y > 1.1) blob.vy *= -1;
      blob.vx += (Math.random() - 0.5) * speed * 0.001;
      blob.vy += (Math.random() - 0.5) * speed * 0.001;
      const maxVel = speed * 0.02;
      blob.vx = Math.max(-maxVel, Math.min(maxVel, blob.vx));
      blob.vy = Math.max(-maxVel, Math.min(maxVel, blob.vy));
    }
  }, [speed]);

  const toCSS = useCallback((opacity = 0.4): string => {
    const gradients = blobs.current.map((b) => {
      const [r, g, b_] = b.color;
      return `radial-gradient(ellipse at ${b.x * 100}% ${b.y * 100}%, rgba(${r},${g},${b_},${opacity}) 0%, transparent ${b.radius * 100}%)`;
    });
    return gradients.join(", ");
  }, []);

  return { blobs, tick, toCSS };
}
