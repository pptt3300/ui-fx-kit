import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { RGB } from "./colors";
import { hexToHSL, hslToRGB, tonalScale, complementary, analogous, hexToRGB } from "./colors";
import { PALETTES } from "./palettes";

/** Per-effect-type color mapping within a palette */
export interface PaletteColors {
  /** Colors for particle effects — array of colors particles pick from */
  particles: RGB[];
  /** Colors for background/aurora effects — gradient stops */
  background: RGB[];
  /** Color for glow/light effects */
  glow: RGB;
  /** UI colors */
  primary: RGB;
  secondary: RGB;
  accent: RGB;
  surface: RGB;
  text: RGB;
  muted: RGB;
}

export interface Theme {
  name: string;
  colors: PaletteColors;
}

/** Create theme from palette preset name */
export function createPaletteTheme(palette: string): Theme {
  const colors = PALETTES[palette] ?? PALETTES["default"];
  return { name: palette, colors };
}

/** Create theme from single color (monochromatic tonal scale) */
export function createColorTheme(hex: string): Theme {
  const [hue, sat] = hexToHSL(hex);
  const scale = tonalScale(hue, sat);
  const base = hexToRGB(hex);
  return {
    name: `color:${hex}`,
    colors: {
      particles: [scale.light, scale.base, scale.dark],
      background: [scale.dark, scale.darkest],
      glow: scale.base,
      primary: base,
      secondary: scale.light,
      accent: scale.lightest,
      surface: scale.darkest,
      text: scale.lightest,
      muted: scale.dark,
    },
  };
}

/** Create theme from brand color (color theory auto-generation) */
export function createBrandTheme(hex: string): Theme {
  const [hue, sat, lit] = hexToHSL(hex);
  const compHue = complementary(hue);
  const [ana1, ana2] = analogous(hue);
  const base = hexToRGB(hex);
  const comp = hslToRGB(compHue, sat, lit);
  const analog1 = hslToRGB(ana1, sat * 0.9, lit * 0.9 + 0.05);
  const analog2 = hslToRGB(ana2, sat * 0.9, lit * 0.9 + 0.05);
  const surface = hslToRGB(hue, sat * 0.3, 0.08);
  const textColor = hslToRGB(hue, sat * 0.15, 0.95);
  const mutedColor = hslToRGB(hue, sat * 0.4, 0.45);
  return {
    name: `brand:${hex}`,
    colors: {
      particles: [base, analog1, analog2],
      background: [base, comp],
      glow: base,
      primary: base,
      secondary: analog1,
      accent: comp,
      surface,
      text: textColor,
      muted: mutedColor,
    },
  };
}

/** React context for theme */
export const ThemeContext = createContext<Theme | null>(null);

/** Hook to read current theme colors for a specific effect type */
export function useThemeColors(effectType: "particles" | "background" | "glow"): RGB[] | null {
  const theme = useContext(ThemeContext);
  if (!theme) return null;
  if (effectType === "glow") return [theme.colors.glow];
  return theme.colors[effectType];
}

/** ThemeProvider component */
export function ThemeProvider(props: {
  palette?: string;
  color?: string;
  brand?: string;
  children: ReactNode;
}) {
  const { palette, color, brand, children } = props;

  const theme = useMemo<Theme>(() => {
    if (palette) return createPaletteTheme(palette);
    if (color) return createColorTheme(color);
    if (brand) return createBrandTheme(brand);
    return createPaletteTheme("default");
  }, [palette, color, brand]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}
