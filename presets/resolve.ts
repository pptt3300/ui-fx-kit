import { PALETTES } from "./palettes";
import type { RGB } from "./colors";
import type { PaletteColors } from "./palettes";

type ArraySlot = "particles" | "background";
type SingleSlot = "glow" | "primary" | "secondary" | "accent" | "surface" | "text" | "muted";

export function resolvePalette(palette: string | undefined, slot: ArraySlot, fallback: RGB[]): RGB[];
export function resolvePalette(palette: string | undefined, slot: SingleSlot, fallback: RGB): RGB;
export function resolvePalette(
  palette: string | undefined,
  slot: keyof PaletteColors,
  fallback: RGB | RGB[],
): RGB | RGB[] {
  const pal = palette ? PALETTES[palette] : undefined;
  if (!pal) return fallback;
  return pal[slot] ?? fallback;
}
