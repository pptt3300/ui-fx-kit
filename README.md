# ui-fx-kit

64 composable React UI effects. Hooks · CSS · Components.

[Live Demo & Playground](https://pptt3300.github.io/ui-fx-kit/) · [中文文档](./README.zh.md)

## Try Before You Install

Every effect on the [demo site](https://pptt3300.github.io/ui-fx-kit/) has a **Playground panel** — adjust speed, colors, intensity, and other props in real-time. When you're happy with the result, the Install tab gives you the exact CLI command and JSX usage with your tuned props.

```
1. Browse effects → click "Playground" button
2. Tune sliders, toggle switches, pick colors
3. Switch to "Install" tab → copy the CLI command
4. The Usage snippet reflects your settings
```

No copy-pasting walls of code. One CLI command, one JSX line.

## Get Started

### Option 1: CLI (recommended)

```bash
# Use directly with npx (no install needed)
npx ui-fx-kit add holographic-card --target ./src

# Or install globally for faster repeated use
npm install -g ui-fx-kit
ui-fx-kit add holographic-card --target ./src

# Add multiple effects at once
ui-fx-kit add gradient-mesh silk-waves cursor-glow --target ./src
```

The CLI copies effect source code + hook dependencies + CSS into your project. You own the code, no runtime dependency on ui-fx-kit.

### Option 2: MCP Server (for Claude Code users)

Add to your Claude Code MCP settings:

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

Then just tell Claude what you want:

```
"Add a holographic card effect to my landing page"
"I need a matrix rain background"
"Give me a cursor glow trail"
```

Claude will pick the right effect, copy the source code into your project, and wire up the imports.

### Option 3: Manual copy

```
# Copy what you need
cp -r ui-fx-kit/effects/holographic-card/ your-project/src/effects/
cp ui-fx-kit/hooks/useTilt3D.ts your-project/src/hooks/
cp ui-fx-kit/css/holographic.css your-project/src/css/
```

## CLI Commands

```bash
# List all 64 effects
npx ui-fx-kit list

# Filter by category
npx ui-fx-kit list background

# See effect details before adding
npx ui-fx-kit info silk-waves

# Add to your project
npx ui-fx-kit add silk-waves --target ./src
```

## What's Inside

### Effects (64)

| Category | Count | Examples |
|----------|-------|---------|
| Background | 14 | aurora-bg, gradient-mesh, matrix-rain, silk-waves, plasma-shader, liquid-chrome |
| Text | 10 | scramble-text, split-flap, morphing-text, glitch-text, text-pressure |
| Card | 9 | holographic-card, flip-card, stack-swipe, bento-grid, reflective-card |
| Cursor | 6 | cursor-glow, blob-cursor, splash-cursor, pixel-trail, ghost-cursor |
| Shader | 8 | metallic-paint, iridescence, liquid-ether, metaballs, noise-grain |
| Interactive | 17 | dock-magnify, confetti-burst, drag-reorder, counter-ticker, parallax-hero |

### Hooks (19)

Each hook is zero-dependency and works standalone:

| Hook | What it does |
|------|-------------|
| `useWebGL` | WebGL shader pipeline — compile, render loop, uniforms |
| `useSpring` | Spring physics for smooth animations |
| `useMousePosition` | Mouse tracking (ref mode for canvas, state mode for CSS) |
| `useParticles` | Particle system with spawn/update/render |
| `usePerlinNoise` | Perlin noise + FBM for organic motion |
| `useGesture` | Drag/swipe via pointer events |
| `useTilt3D` | 3D perspective tilt following cursor |
| `useCanvasSetup` | DPI-aware canvas with rAF loop |
| `useStagger` | Staggered animation timing |
| `useInView` | Intersection Observer for scroll triggers |

[Full hook list →](./hooks/)

## Compose Your Own Effect

The hooks layer is designed for composition. Mix and match hooks to create custom effects without starting from scratch.

**Example: Custom cursor trail**

```tsx
import { useMousePosition, useCanvasSetup, useParticles } from "./hooks";

// Three hooks → a complete cursor effect
const { position } = useMousePosition({ scope: "window" });
const { canvasRef, startLoop } = useCanvasSetup({ dpr: 2 });
const particles = useParticles({
  spawn: () => ({ x: position.current.x, y: position.current.y, alpha: 1 }),
  update: (p) => { p.alpha *= 0.95; return p.alpha > 0.01; },
});
```

**Example: Tilt card with spotlight**

```tsx
import { useTilt3D, useSpotlight } from "./hooks";

// Two hooks → 3D tilt + cursor-tracking light
const { ref, shineRef, handlers: tiltHandlers } = useTilt3D({ maxRotation: 12 });
const { spotlightBg, handlers: spotHandlers } = useSpotlight({ radius: 400 });
```

**Example: Proximity-reactive grid**

```tsx
import { useCanvasSetup, useMousePosition } from "./hooks";
import { proximity } from "./hooks";

// Canvas + mouse + math → interactive force field
const { canvasRef, startLoop } = useCanvasSetup({ dpr: 2 });
const { position, handlers } = useMousePosition({ scope: "element" });
// In draw loop: proximity(mouse, dot, { radius: 120 }) → displacement
```

### Common Combinations

| Hooks | What You Get |
|-------|-------------|
| `useCanvasSetup` + `useParticles` + `useMousePosition` | Cursor-reactive particle effects |
| `useTilt3D` + `useSpotlight` | 3D cards with dynamic lighting |
| `useCanvasSetup` + `useMousePosition` + `proximity` | Interactive force-field grids |
| `useScrollProgress` + `useStagger` | Scroll-triggered staggered animations |
| `useCanvasSetup` + `usePerlinNoise` | Organic generative backgrounds |
| `useWebGL` + `useMousePosition` | GPU shader effects with cursor interaction |

### CSS Snippets (13)

Drop-in animation classes: `glass-card`, `holographic`, `shimmer`, `neon-glow`, `glitch-effect`, `sticker-peel`, `iridescent`, `stagger-presets`, and more.

### Color Palettes (13)

Curated color sets you can pass as props: `default`, `neon`, `pastel`, `warm`, `arctic`, `mono`, `stripe`, `vercel`, `linear`, `supabase`, `figma`, `discord`, `spotify`.

## Architecture

```
effects/     → Complete React components (each in its own directory)
  ├── holographic-card/
  │   ├── HolographicCard.tsx
  │   └── meta.json
  ├── gradient-mesh/
  └── ...
hooks/       → Reusable React hooks (physics, gestures, WebGL)
css/         → Standalone CSS animation snippets
presets/     → Color palettes and spring configs
bin/         → CLI tool
mcp-server.js → MCP server for Claude Code
```

Effects import from `hooks/` and `css/`. The CLI resolves these dependencies automatically when you `add` an effect.

## Tech Stack

- React 18+, TypeScript
- WebGL (shader effects)
- framer-motion (optional, some effects)
- Zero runtime dependencies for hooks

## License

MIT
