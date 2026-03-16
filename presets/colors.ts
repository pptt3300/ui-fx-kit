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
  stops?: [RGB, RGB, RGB],
): RGB {
  const tx = w > 0 ? x / w : 0;
  const ty = h > 0 ? y / h : 0;
  const [r, g, b] = gradientColor(tx, stops);
  return [
    Math.round(Math.max(0, Math.min(255, r + ty * 30 - 15))),
    Math.round(Math.max(0, Math.min(255, g - ty * 20 + 10))),
    Math.round(Math.max(0, Math.min(255, b))),
  ];
}

/** Convert hex string to HSL — returns [hue(0-360), saturation(0-1), lightness(0-1)] */
export function hexToHSL(hex: string): [number, number, number] {
  const [r, g, b] = hexToRGB(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;
  if (delta === 0) return [0, 0, l];
  const s = delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === rn) h = ((gn - bn) / delta + 6) % 6;
  else if (max === gn) h = (bn - rn) / delta + 2;
  else h = (rn - gn) / delta + 4;
  return [h * 60, s, l];
}

/** Convert HSL (h: 0-360, s: 0-1, l: 0-1) to RGB */
export function hslToRGB(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/** Convert hex string to RGB */
export function hexToRGB(hex: string): RGB {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const n = parseInt(full, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/** Complementary hue (+180°) */
export function complementary(hue: number): number {
  return (hue + 180) % 360;
}

/** Analogous hues (±30°) */
export function analogous(hue: number): [number, number] {
  return [(hue + 30) % 360, (hue - 30 + 360) % 360];
}

/** Generate 5-level tonal scale from a single hue */
export function tonalScale(
  hue: number,
  saturation: number,
): { lightest: RGB; light: RGB; base: RGB; dark: RGB; darkest: RGB } {
  return {
    lightest: hslToRGB(hue, saturation * 0.3, 0.92),
    light:    hslToRGB(hue, saturation * 0.6, 0.70),
    base:     hslToRGB(hue, saturation,       0.55),
    dark:     hslToRGB(hue, saturation * 0.9, 0.40),
    darkest:  hslToRGB(hue, saturation * 0.7, 0.15),
  };
}
