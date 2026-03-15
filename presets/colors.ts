export type RGB = [number, number, number];

export const PALETTE = {
  indigo:     [99, 102, 241] as RGB,
  violet:     [139, 92, 246] as RGB,
  cyan:       [34, 211, 238] as RGB,
  lavender:   [167, 139, 250] as RGB,
  periwinkle: [129, 140, 248] as RGB,
  white:      [255, 255, 255] as RGB,
};

/** Format RGB tuple to `rgba(r,g,b,a)` string */
export function rgba(color: RGB, alpha: number): string {
  return `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
}

/** Format RGB tuple to `rgb(r,g,b)` string */
export function rgb(color: RGB): string {
  return `rgb(${color[0]},${color[1]},${color[2]})`;
}

/** Lerp between two RGB colors */
export function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/**
 * 3-stop gradient interpolation.
 * t=0 → left, t=0.5 → mid, t=1 → right
 *
 * Default stops: indigo → violet → cyan
 */
export function gradientColor(
  t: number,
  stops: [RGB, RGB, RGB] = [PALETTE.indigo, PALETTE.violet, PALETTE.cyan],
): RGB {
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped < 0.5) return lerpColor(stops[0], stops[1], clamped * 2);
  return lerpColor(stops[1], stops[2], (clamped - 0.5) * 2);
}

/**
 * Position-based color with vertical warmth shift.
 * Horizontal: left=indigo → mid=violet → right=cyan
 * Vertical: top=cooler, bottom=warmer
 */
export function colorAtPosition(
  x: number,
  y: number,
  w: number,
  h: number,
): RGB {
  const tx = w > 0 ? x / w : 0;
  const ty = h > 0 ? y / h : 0;
  const [r, g, b] = gradientColor(tx);
  return [
    Math.round(Math.max(0, Math.min(255, r + ty * 30 - 15))),
    Math.round(Math.max(0, Math.min(255, g - ty * 20 + 10))),
    Math.round(Math.max(0, Math.min(255, b))),
  ];
}
