export interface SectionDef {
  id: string;
  label: string;
  category: string;
}

export const SECTION_REGISTRY: SectionDef[] = [
  // Background (14)
  { id: "aurora-bg", label: "Aurora Background", category: "Background" },
  { id: "constellation-bg", label: "Constellation", category: "Background" },
  { id: "gradient-mesh", label: "Gradient Mesh", category: "Background" },
  { id: "matrix-rain", label: "Matrix Rain", category: "Background" },
  { id: "ripple-wave", label: "Ripple Wave", category: "Background" },
  { id: "starfield-warp", label: "Starfield Warp", category: "Background" },
  { id: "geometric-morph", label: "Geometric Morph", category: "Background" },
  { id: "noise-flow-field", label: "Noise Flow Field", category: "Background" },
  { id: "silk-waves", label: "Silk Waves", category: "Background" },
  { id: "plasma-shader", label: "Plasma Shader", category: "Background" },
  { id: "lightning-bolts", label: "Lightning Bolts", category: "Background" },
  { id: "light-rays", label: "Light Rays", category: "Background" },
  { id: "grid-distortion", label: "Grid Distortion", category: "Background" },
  { id: "liquid-chrome", label: "Liquid Chrome", category: "Background" },

  // Text (10)
  { id: "typewriter-text", label: "Typewriter Text", category: "Text" },
  { id: "text-reveal", label: "Text Reveal", category: "Text" },
  { id: "scramble-text", label: "Scramble Text", category: "Text" },
  { id: "split-flap", label: "Split Flap", category: "Text" },
  { id: "morphing-text", label: "Morphing Text", category: "Text" },
  { id: "staggered-chars", label: "Staggered Chars", category: "Text" },
  { id: "glitch-text", label: "Glitch Text", category: "Text" },
  { id: "ascii-text", label: "ASCII Text", category: "Text" },
  { id: "text-pressure", label: "Text Pressure", category: "Text" },
  { id: "circular-text", label: "Circular Text", category: "Text" },

  // Card (9)
  { id: "spotlight-cards", label: "Spotlight Cards", category: "Card" },
  { id: "physics-cards", label: "Physics Cards", category: "Card" },
  { id: "holographic-card", label: "Holographic Card", category: "Card" },
  { id: "flip-card", label: "Flip Card", category: "Card" },
  { id: "stack-swipe", label: "Stack Swipe", category: "Card" },
  { id: "bento-grid", label: "Bento Grid", category: "Card" },
  { id: "parallax-depth-card", label: "Parallax Depth Card", category: "Card" },
  { id: "sticker-peel", label: "Sticker Peel", category: "Card" },
  { id: "reflective-card", label: "Reflective Card", category: "Card" },

  // Cursor (6)
  { id: "cursor-glow", label: "Cursor Glow", category: "Cursor" },
  { id: "blob-cursor", label: "Blob Cursor", category: "Cursor" },
  { id: "splash-cursor", label: "Splash Cursor", category: "Cursor" },
  { id: "pixel-trail", label: "Pixel Trail", category: "Cursor" },
  { id: "image-trail", label: "Image Trail", category: "Cursor" },
  { id: "ghost-cursor", label: "Ghost Cursor", category: "Cursor" },

  // Shader (8)
  { id: "liquid-glass", label: "Liquid Glass", category: "Shader" },
  { id: "3d-hero", label: "3D Hero", category: "Shader" },
  { id: "metallic-paint", label: "Metallic Paint", category: "Shader" },
  { id: "iridescence", label: "Iridescence", category: "Shader" },
  { id: "liquid-ether", label: "Liquid Ether", category: "Shader" },
  { id: "prism-refraction", label: "Prism Refraction", category: "Shader" },
  { id: "metaballs", label: "Metaballs", category: "Shader" },
  { id: "noise-grain", label: "Noise Grain", category: "Shader" },

  // Interactive (17)
  { id: "magnetic-button", label: "Magnetic Button", category: "Interactive" },
  { id: "spotlight-input", label: "Spotlight Input", category: "Interactive" },
  { id: "interactive-dot-grid", label: "Interactive Dot Grid", category: "Interactive" },
  { id: "scroll-velocity", label: "Scroll Velocity", category: "Interactive" },
  { id: "particle-text", label: "Particle Text", category: "Interactive" },
  { id: "dock-magnify", label: "Dock Magnify", category: "Interactive" },
  { id: "confetti-burst", label: "Confetti Burst", category: "Interactive" },
  { id: "ripple-button", label: "Ripple Button", category: "Interactive" },
  { id: "drag-reorder", label: "Drag Reorder", category: "Interactive" },
  { id: "click-spark", label: "Click Spark", category: "Interactive" },
  { id: "parallax-hero", label: "Parallax Hero", category: "Interactive" },
  { id: "horizontal-scroll", label: "Horizontal Scroll", category: "Interactive" },
  { id: "counter-ticker", label: "Counter Ticker", category: "Interactive" },
  { id: "circular-gallery", label: "Circular Gallery", category: "Interactive" },
  { id: "shimmer-skeleton", label: "Shimmer Skeleton", category: "Interactive" },
  { id: "page-transition", label: "Page Transition", category: "Interactive" },
  { id: "stagger-list", label: "Stagger List", category: "Interactive" },
];
