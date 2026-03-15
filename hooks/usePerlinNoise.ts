import { useRef, useCallback } from "react";

export interface UsePerlinNoiseOptions {
  seed?: number;
  scale?: number;
}

/**
 * Perlin noise generator for flow fields and organic motion.
 * Returns a stable noise2D function that maps (x, y) → [-1, 1].
 *
 * Usage:
 * ```ts
 * const { noise2D } = usePerlinNoise({ scale: 0.005 });
 * const angle = noise2D(x, y + time * 0.5) * Math.PI * 2;
 * ```
 */
export function usePerlinNoise(options: UsePerlinNoiseOptions = {}) {
  const { seed = Math.random() * 65536, scale = 0.01 } = options;

  const perm = useRef<number[]>([]);
  if (perm.current.length === 0) {
    const p = Array.from({ length: 256 }, (_, i) => i);
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647;
      const j = s % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    perm.current = [...p, ...p];
  }

  const grad = useCallback((hash: number, x: number, y: number): number => {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }, []);

  const fade = useCallback((t: number): number => t * t * t * (t * (t * 6 - 15) + 10), []);

  const lerp = useCallback((a: number, b: number, t: number): number => a + t * (b - a), []);

  const noise2D = useCallback(
    (x: number, y: number): number => {
      const p = perm.current;
      const sx = x * scale;
      const sy = y * scale;
      const xi = Math.floor(sx) & 255;
      const yi = Math.floor(sy) & 255;
      const xf = sx - Math.floor(sx);
      const yf = sy - Math.floor(sy);
      const u = fade(xf);
      const v = fade(yf);
      const aa = p[p[xi] + yi];
      const ab = p[p[xi] + yi + 1];
      const ba = p[p[xi + 1] + yi];
      const bb = p[p[xi + 1] + yi + 1];
      return lerp(
        lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
        lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
        v,
      );
    },
    [scale, grad, fade, lerp],
  );

  const fbm = useCallback(
    (x: number, y: number, octaves = 4): number => {
      let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
      for (let i = 0; i < octaves; i++) {
        value += noise2D(x * frequency, y * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }
      return value / maxValue;
    },
    [noise2D],
  );

  return { noise2D, fbm };
}
