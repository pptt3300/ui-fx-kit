# ui-fx-kit

64 composable React UI effects. Hooks · CSS · Components.

[Live Demo](https://pptt3300.github.io/ui-fx-kit/) · [中文文档](./README.zh.md)

## Get Started

### Option 1: CLI (recommended)

```bash
# Clone the toolkit
git clone https://github.com/pptt3300/ui-fx-kit.git

# Add an effect to your project
node ui-fx-kit/bin/cli.js add holographic-card --target ./src

# Add multiple effects at once
node ui-fx-kit/bin/cli.js add gradient-mesh silk-waves cursor-glow --target ./src
```

The CLI automatically copies the effect + its hook dependencies + CSS. No npm install needed for the toolkit itself.

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
node ui-fx-kit/bin/cli.js list

# Filter by category
node ui-fx-kit/bin/cli.js list background

# See effect details before adding
node ui-fx-kit/bin/cli.js info silk-waves

# Add to your project
node ui-fx-kit/bin/cli.js add silk-waves --target ./src
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

Apache-2.0
