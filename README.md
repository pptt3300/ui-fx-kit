# ui-fx-kit

64 composable React UI effects. Source code delivery, not npm dependency.

[Live Demo & Playground](https://pptt3300.github.io/ui-fx-kit/) · [中文文档](./README.zh.md)

## How It Works

You describe what you want. AI picks the effect, grabs the source code, and wires it into your project. You own the code — no runtime dependency.

### Setup (one time)

Add to your Claude Code MCP settings (`~/.claude.json` or project `.mcp.json`):

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

### Tell AI What You Want

**Specific effects:**

```
"Add a starfield background to my hero section, use neon palette"
"Add a holographic card effect to the pricing section"
"I need a typewriter effect on the homepage title"
```

**By intent:**

```
"I need a subtle background effect for a SaaS dashboard — low performance, mobile safe"
"Add something to emphasize the pricing card, but keep it classy"
"I need loading state feedback while content fetches"
```

**With constraints:**

```
"Add a background effect — must be mobile safe, low performance, no WebGL"
"I need a cursor effect that works on touch devices"
"Add some texture to my cards, keep it simple, CSS only"
```

**Compose custom effects:**

```
"Combine useCanvasSetup + useParticles + useMousePosition into a cursor particle trail"
"Combine spring physics with 3D tilt for a card interaction"
```

### What AI Does Behind the Scenes

```
Your prompt
  → find_effects (structured filtering by category/performance/mobile)
  → get_effect_bundle (source code + all dependencies in one call)
  → writes files into your project
```

One prompt, one round trip, complete source code.

## AI Tool Reference

The MCP server exposes 16 tools. You don't need to call them directly — AI picks the right one based on your prompt. But knowing what's available helps you write better prompts.

| Tool | What AI uses it for |
|------|-------------------|
| `find_effects` | Filter by intent + target (e.g. `'button emphasis'`, `'background ambient'`), mobile_safe, performance_cost. Returns usage_tip for each match |
| `get_effect_bundle` | Get effect + all hook/CSS/preset dependencies in one call |
| `suggest_combination` | Describe an intent → get hook combination with source code |
| `check_performance_budget` | Verify multiple effects can coexist on one page |
| `list_effects` | Browse all effects with usage_tip guidance. Supports multi-category AND filter |
| `search` | Keyword search across effects, hooks, and CSS |
| `list_css` | Browse CSS snippets (quick wins — just add a class) |
| `get_css` | Get a CSS snippet source |
| `list_hooks` | Browse hooks with combinesWith graph |
| `get_hook` | Get a hook's source code |
| `get_preset` | Get color palettes or spring configs |
| `get_effect` | Get a single effect's source (use bundle for full deps) |
| `get_examples` | Get complete, runnable usage examples for an effect |
| `audit_install` | Post-install checklist — verify files, imports, deps, a11y |
| `get_project_status` | Analyze installed effects — hook sharing, perf risks, update hints |
| `check_updates` | Check if installed effects have upstream updates available |

## Prompt Tips

| Situation | Good prompt | Why it works |
|-----------|------------|--------------|
| Browsing | "What mobile-safe background effects are available?" | Maps to `find_effects(category="background", mobile_safe=true)` |
| Specific need | "Replace hero background with a fluid gradient" | AI searches "fluid gradient background" → silk-waves or gradient-mesh |
| Quick texture | "Add a glass texture to my cards, don't change the component" | AI picks CSS snippet `glass-card` — just a class name |
| Performance | "I already have 3 canvas effects on this page, can I add more?" | AI calls `check_performance_budget` |
| Custom | "Combine particles + mouse tracking + canvas into a custom effect" | AI calls `suggest_combination` with hook list |
| Theming | "Use spotify palette for all effects" | AI passes `palette="spotify"` to each effect |
| Intent-based | "I need something to draw attention to the CTA button" | AI queries `find_effects(category="button emphasis")` → gets magnetic-button, ripple-button with usage_tips |

**Avoid vague prompts** like "add some effects" or "use ui-fx-kit" — AI needs to know what kind of effect and where.

## Color Palettes

13 curated palettes. Pass `palette="name"` to any effect that supports it:

`default` · `neon` · `pastel` · `warm` · `arctic` · `mono` · `stripe` · `vercel` · `linear` · `supabase` · `figma` · `discord` · `spotify`

When using multiple effects on one page, use the same palette for visual consistency.

## Also Works Without AI

### CLI

```bash
npx ui-fx-kit add holographic-card --target ./src
npx ui-fx-kit add gradient-mesh silk-waves --target ./src
npx ui-fx-kit add holographic-card --target ./src --force  # re-install latest version
npx ui-fx-kit status --target ./src                        # check for updates
npx ui-fx-kit list background
npx ui-fx-kit info silk-waves
```

### Playground

Every effect on the [demo site](https://pptt3300.github.io/ui-fx-kit/) has a Playground panel — tune props in real-time, then copy the CLI command with your settings.

### Manual copy

```bash
cp -r ui-fx-kit/effects/holographic-card/ your-project/src/effects/
```

## What's Inside

| Layer | Count | Purpose |
|-------|-------|---------|
| Effects | 64 | Complete React components (background, text, card, cursor, shader, interactive) |
| Hooks | 19 | Zero-dependency building blocks (physics, gestures, WebGL, canvas, particles) |
| CSS | 13 | Drop-in animation classes (glass, holographic, neon, shimmer) |
| Palettes | 13 | Curated color sets |

Effects are built from hooks. Hooks are composable. AI knows which hooks combine well via the `combinesWith` graph.

## Architecture

```
effects/      → React components (source code, not compiled)
hooks/        → Composable React hooks
css/          → Standalone CSS classes
presets/      → Color palettes + spring configs
bin/          → CLI tool
mcp-server.js → AI tool interface (16 tools)
```

Source code delivery: the CLI and MCP server copy files into your project. You own and can modify everything.

## License

MIT
