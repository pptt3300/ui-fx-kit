export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass?: number;
  precision?: number;
}

export const SPRING_PRESETS = {
  /** Snappy button/icon response */
  snappy:   { stiffness: 400, damping: 17 } as SpringConfig,
  /** Smooth card transitions */
  smooth:   { stiffness: 300, damping: 30 } as SpringConfig,
  /** Gentle floating motion */
  gentle:   { stiffness: 100, damping: 20 } as SpringConfig,
  /** Particle return-to-origin */
  particle: { stiffness: 45,  damping: 12 } as SpringConfig,
  /** Magnetic cursor pull */
  magnetic: { stiffness: 200, damping: 20 } as SpringConfig,
} as const;
