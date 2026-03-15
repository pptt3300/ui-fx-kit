# ui-fx-kit

64 composable React UI effects. Hooks · CSS · Components.

## What is this?

A three-layer architecture for UI effects:

| Layer | Count | What it does |
|-------|-------|-------------|
| **Hooks** | 19 | Zero-dependency physics, gestures, noise, WebGL, particles |
| **CSS** | 13 | Standalone animation snippets — glass, glow, shimmer, glitch |
| **Effects** | 64 | Complete React components ready to drop in |

Each layer is independently usable. Use a hook to build your own effect. Use CSS for quick styling. Use an effect for instant results.

## Quick Start

### With Claude Code (recommended)

Add the MCP server to your Claude Code settings:

```json
{
  "mcpServers": {
    "ui-fx-kit": {
      "command": "node",
      "args": ["/path/to/ui-fx-kit/mcp-server.js"]
    }
  }
}
```

Then ask:

```
Add holographic-card to my project
```

Claude will fetch the effect source, its hook dependencies, and any CSS — then integrate it into your codebase.

### Manual

Copy any effect directory into your project:

```
effects/holographic-card/
  HolographicCard.tsx    # The component
  meta.json              # Metadata
```

Then copy the hooks it depends on from `hooks/` and any CSS from `css/`.

## Effects

### Background (14)

aurora-bg · constellation-bg · gradient-mesh · matrix-rain · ripple-wave · starfield-warp · geometric-morph · noise-flow-field · silk-waves · plasma-shader · lightning-bolts · light-rays · grid-distortion · liquid-chrome

### Text (10)

typewriter-text · text-reveal · scramble-text · split-flap · morphing-text · staggered-chars · glitch-text · ascii-text · text-pressure · circular-text

### Card & Container (9)

spotlight-cards · physics-cards · holographic-card · flip-card · stack-swipe · bento-grid · parallax-depth-card · sticker-peel · reflective-card

### Cursor (6)

cursor-glow · blob-cursor · splash-cursor · pixel-trail · image-trail · ghost-cursor

### Shader & Material (8)

liquid-glass · 3d-hero · metallic-paint · iridescence · liquid-ether · prism-refraction · metaballs · noise-grain

### Interactive & Scroll (17)

magnetic-button · spotlight-input · interactive-dot-grid · scroll-velocity · particle-text · dock-magnify · confetti-burst · ripple-button · drag-reorder · click-spark · parallax-hero · horizontal-scroll · counter-ticker · circular-gallery · shimmer-skeleton · page-transition · stagger-list

## Hooks

| Hook | Description |
|------|-------------|
| `useMousePosition` | Mouse tracking (ref or state mode, element or window scope) |
| `useSpring` | Spring physics for single numeric value |
| `useTilt3D` | 3D perspective tilt with spring physics |
| `useMagnetic` | Magnetic cursor attraction |
| `useCanvasSetup` | DPI-aware canvas + rAF loop |
| `useParticles` | Generic particle system manager |
| `useProximity` | Distance-based force field math |
| `useScrollProgress` | Scroll progress + velocity tracking |
| `useSpotlight` | Cursor-tracking spotlight gradients |
| `useTypewriter` | Typewriter text state machine |
| `useInView` | Intersection Observer wrapper |
| `useStagger` | Staggered animation orchestrator |
| `useGesture` | Unified drag/swipe via pointer events |
| `useScramble` | Text decode scramble state machine |
| `useSplitFlap` | Split-flap display state machine |
| `useMorphText` | Blur-fade text morph cycle |
| `usePerlinNoise` | Perlin noise with FBM |
| `useGradientMesh` | Animated gradient blob system |
| `useWebGL` | WebGL shader pipeline |

## Theme System

Four modes to control colors across all effects:

```tsx
import { ThemeProvider } from "./presets";

// Mode 1: Curated palette (13 built-in)
<ThemeProvider palette="neon">

// Mode 2: Single color → monochromatic scale
<ThemeProvider color="#6366f1">

// Mode 3: Brand color → auto-generated complementary palette
<ThemeProvider brand="#1DB954">

// Mode 4: No provider → effects use their defaults
```

**Built-in palettes:** default · neon · pastel · warm · arctic · mono · stripe · vercel · linear · supabase · figma · discord · spotify

## Architecture

```
┌─────────────────────────────────────┐
│          Effects (64)               │
│  Complete React components          │
│  Each self-contained in own dir     │
├─────────────────────────────────────┤
│          CSS (13)                   │
│  Standalone animation snippets      │
│  Import and use anywhere            │
├─────────────────────────────────────┤
│          Hooks (19)                 │
│  Zero-dependency primitives         │
│  Physics, gestures, WebGL, noise    │
└─────────────────────────────────────┘
```

Effects compose hooks + CSS. Hooks are standalone. CSS is standalone. Use any layer independently.

## Tech Stack

- React 19
- TypeScript
- framer-motion (optional, per effect)
- WebGL (shader effects)
- Zero runtime dependencies for hooks

## License

MIT
