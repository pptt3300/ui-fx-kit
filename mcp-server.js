import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readdir, readFile } from "fs/promises";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EFFECTS_DIR = join(__dirname, "effects");
const HOOKS_DIR = join(__dirname, "hooks");
const CSS_DIR = join(__dirname, "css");
const PRESETS_DIR = join(__dirname, "presets");

const server = new McpServer({
  name: "ui-fx-kit",
  version: "2.0.0",
});

// ── Helpers ────────────────────────────────────────────────────────

async function loadEffectsMeta(category) {
  const dirs = await readdir(EFFECTS_DIR, { withFileTypes: true });
  const effects = [];
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    try {
      const meta = JSON.parse(
        await readFile(join(EFFECTS_DIR, dir.name, "meta.json"), "utf-8"),
      );
      if (category && !meta.category?.includes(category)) continue;
      effects.push({
        id: dir.name,
        name: meta.name,
        description: meta.description,
        category: meta.category || [],
        framework: meta.framework,
        runtime: meta.runtime || [],
        complexity: meta.complexity,
        performance_cost: meta.performance_cost,
        mobile_safe: meta.mobile_safe,
        accessibility_notes: meta.accessibility_notes || [],
        dependencies: meta.dependencies || [],
        hooks: meta.hooks || [],
        css: meta.css || [],
        files: meta.files,
        props_schema: meta.props_schema || {},
        use_cases: meta.use_cases || [],
        conflicts: meta.conflicts || [],
      });
    } catch {
      // skip dirs without meta.json
    }
  }
  return effects;
}

async function loadJsonArray(path) {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw);
}

function matchQuery(haystack, query) {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

// ── Effects ────────────────────────────────────────────────────────

server.tool(
  "list_effects",
  "List effects as compact summaries for browsing. Use find_effects for structured filtering, get_effect_bundle for full source code.",
  {
    category: z
      .string()
      .optional()
      .describe("Filter by category (e.g. 'background', 'text', 'card', 'cursor', 'shader', 'interactive')"),
  },
  async ({ category }) => {
    const effects = await loadEffectsMeta(category);
    const summary = effects.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      category: e.category,
      complexity: e.complexity,
      performance_cost: e.performance_cost,
      mobile_safe: e.mobile_safe,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
    };
  },
);

function rewriteImports(code, baseDir) {
  if (!baseDir) return code;
  const base = baseDir.replace(/\/+$/, "");
  code = code.replace(/from\s+["']\.\.\/\.\.\/hooks(\/[^"']*)?["']/g, `from "${base}/hooks$1"`);
  code = code.replace(/from\s+["']\.\.\/\.\.\/presets(\/[^"']*)?["']/g, `from "${base}/presets$1"`);
  code = code.replace(/import\s+["']\.\.\/\.\.\/css\/([^"']+)["']/g, `import "${base}/css/$1"`);
  return code;
}

server.tool(
  "get_effect",
  "Get the full source code of a UI effect by its ID. Use baseDir to rewrite internal import paths for your project.",
  {
    id: z
      .string()
      .describe(
        "Effect ID (directory name, e.g. 'particle-text', 'cursor-glow')",
      ),
    baseDir: z
      .string()
      .optional()
      .describe(
        "Base directory for import rewriting. Infer from tsconfig.json paths or existing import conventions in the user's project (e.g. '@/components/ui-fx'). When set, ../../hooks becomes {baseDir}/hooks, etc. If unknown, omit.",
      ),
  },
  async ({ id, baseDir }) => {
    const metaPath = join(EFFECTS_DIR, id, "meta.json");
    let meta;
    try {
      meta = JSON.parse(await readFile(metaPath, "utf-8"));
    } catch {
      return {
        content: [
          {
            type: "text",
            text: `Effect "${id}" not found. Use list_effects to see available effects.`,
          },
        ],
      };
    }

    const result = [`# ${meta.name}\n`, `${meta.description}\n`];

    if (meta.props_schema && Object.keys(meta.props_schema).length > 0) {
      result.push(`## Props\n\`\`\`json\n${JSON.stringify(meta.props_schema, null, 2)}\n\`\`\`\n`);
    }

    if (meta.dependencies?.length > 0) {
      result.push(
        `> ⚠️ **Run:** \`npm install ${meta.dependencies.join(" ")}\`\n`,
      );
    }

    if (meta.usage) {
      result.push(`## Usage\n\`\`\`tsx\n${meta.usage}\n\`\`\`\n`);
    }

    if (meta.hooks?.length > 0) {
      result.push(
        `## Internal Hooks\nRequires: ${meta.hooks.join(", ")}\nUse \`get_hook(name)\` to fetch each hook's source code.\n`,
      );
    }

    if (meta.presets?.length > 0) {
      result.push(
        `## Presets\nRequires: ${meta.presets.join(", ")}\nUse \`get_preset(name)\` to fetch preset source code.\n`,
      );
    }

    if (meta.css?.length > 0) {
      result.push(
        `## CSS\nRequires: ${meta.css.join(", ")}\nUse \`get_css(id)\` to fetch each CSS file. (Strip .css extension for the id)\n`,
      );
    }

    for (const file of meta.files) {
      let code = await readFile(join(EFFECTS_DIR, id, file), "utf-8");
      code = rewriteImports(code, baseDir);
      result.push(`## ${file}\n\`\`\`tsx\n${code}\n\`\`\``);
    }

    result.push(`\n## Install\n\`\`\`bash\nnpx ui-fx-kit add ${id} --target ./src\n\`\`\``);

    if (meta.dependencies?.length > 0) {
      result.push(`\nThen install npm dependencies:\n\`\`\`bash\nnpm install ${meta.dependencies.join(" ")}\n\`\`\``);
    }

    return {
      content: [{ type: "text", text: result.join("\n") }],
    };
  },
);

// ── Effect Bundle (one call = everything) ─────────────────────────

server.tool(
  "get_effect_bundle",
  "Get effect source code + ALL dependency source code (hooks, css, presets) in a single call. Returns everything needed to drop the effect into a project.",
  {
    id: z
      .string()
      .describe("Effect ID (e.g. 'constellation-bg', 'cursor-glow')"),
    baseDir: z
      .string()
      .optional()
      .describe("Base directory for import rewriting. Infer from tsconfig.json paths or existing import conventions in the user's project. If unknown, omit."),
  },
  async ({ id, baseDir }) => {
    const metaPath = join(EFFECTS_DIR, id, "meta.json");
    let meta;
    try {
      meta = JSON.parse(await readFile(metaPath, "utf-8"));
    } catch {
      return {
        content: [{ type: "text", text: `Effect "${id}" not found. Use list_effects or find_effects to discover effects.` }],
      };
    }

    const sections = [`# ${meta.name}\n`, `${meta.description}\n`];

    // Props schema for quick reference
    if (meta.props_schema && Object.keys(meta.props_schema).length > 0) {
      sections.push(`## Props\n\`\`\`json\n${JSON.stringify(meta.props_schema, null, 2)}\n\`\`\`\n`);
    }

    if (meta.dependencies?.length > 0) {
      sections.push(`## npm install\n\`\`\`bash\nnpm install ${meta.dependencies.join(" ")}\n\`\`\`\n`);
    }

    // Effect source files
    for (const file of meta.files) {
      let code = await readFile(join(EFFECTS_DIR, id, file), "utf-8");
      code = rewriteImports(code, baseDir);
      sections.push(`## effects/${id}/${file}\n\`\`\`tsx\n${code}\n\`\`\``);
    }

    // Hook dependencies — inline source
    for (const hookName of meta.hooks || []) {
      try {
        let code = await readFile(join(HOOKS_DIR, `${hookName}.ts`), "utf-8");
        sections.push(`## hooks/${hookName}.ts\n\`\`\`ts\n${code}\n\`\`\``);
      } catch {
        // hook file not found
      }
    }

    // CSS dependencies — inline source
    for (const cssId of meta.css || []) {
      try {
        const code = await readFile(join(CSS_DIR, `${cssId}.css`), "utf-8");
        sections.push(`## css/${cssId}.css\n\`\`\`css\n${code}\n\`\`\``);
      } catch {
        // css file not found
      }
    }

    // Preset dependencies — detect from imports
    const needsColors = meta.imports?.some((i) => i.includes("presets/colors") || i.includes("presets"));
    const needsPalettes = meta.imports?.some((i) => i.includes("presets/palettes") || i.includes("presets"));
    if (needsColors) {
      try {
        const code = await readFile(join(PRESETS_DIR, "colors.ts"), "utf-8");
        sections.push(`## presets/colors.ts\n\`\`\`ts\n${code}\n\`\`\``);
      } catch {}
    }
    if (needsPalettes) {
      try {
        const code = await readFile(join(PRESETS_DIR, "palettes.ts"), "utf-8");
        sections.push(`## presets/palettes.ts\n\`\`\`ts\n${code}\n\`\`\``);
      } catch {}
    }

    sections.push(`\n## Install via CLI\n\`\`\`bash\nnpx ui-fx-kit add ${id} --target ./src\n\`\`\``);

    // Integration notes
    const notes = [];
    const isBackground = meta.category?.some((c) => ["background", "ambient"].includes(c));
    if (isBackground) {
      notes.push("**Layout:** This is a background effect. The parent container MUST have `position: relative` and the effect needs `position: absolute; inset: 0`. Content on top must have a higher z-index.");
      notes.push("**Visibility:** The parent/page background must be transparent or dark enough for the effect to show through. A solid opaque background will completely hide this effect.");
    }
    if (meta.category?.includes("cursor")) {
      notes.push("**Overlay:** This renders as a fixed full-page overlay with `pointer-events: none`. Just render it at the top level of your page.");
    }
    if (meta.hooks?.length > 0) {
      notes.push(`**Barrel export:** If the project has a hooks/index.ts barrel file, add: ${meta.hooks.map((h) => `\`export { ${h} } from "./${h}";\``).join(", ")}`);
    }
    if (meta.mobile_safe === false) {
      notes.push("**Mobile:** Not mobile-safe. Wrap in a responsive container: `<div className=\"hidden md:block\">...</div>`");
    }
    const needsPresets = meta.imports?.some((i) => i.includes("presets"));
    if (needsPresets) {
      notes.push("**Presets:** This effect imports from `presets/`. Make sure `presets/colors.ts` (and `palettes.ts` if using palette prop) are copied to the project.");
    }
    if (notes.length > 0) {
      sections.push(`\n## Integration Notes\n`);
      notes.forEach((n) => sections.push(`- ${n}`));
    }

    // Palette consistency hint
    if (meta.props_schema?.palette) {
      sections.push(`\n> **Palette tip:** If the project already uses other ui-fx-kit effects with a specific palette (e.g. \`palette="neon"\`), use the same palette here for visual consistency.`);
    }

    // Performance warning
    if (meta.performance_cost === "high") {
      sections.push(`\n> **Performance:** This effect has high GPU/CPU cost. Avoid stacking with other high-cost effects on the same page.`);
    }

    return {
      content: [{ type: "text", text: sections.join("\n") }],
    };
  },
);

// ── Hook Combination Suggestions ──────────────────────────────────

server.tool(
  "suggest_combination",
  "Given a desired behavior, suggest which hooks to combine and return a starter code template. Uses the combinesWith graph from hook metadata.",
  {
    hooks: z
      .array(z.string())
      .optional()
      .describe("Hook names you want to combine (e.g. ['useCanvasSetup', 'useParticles', 'useMousePosition'])"),
    intent: z
      .string()
      .optional()
      .describe("Describe what you want to build (e.g. 'cursor-reactive particle trail', 'scroll-triggered stagger animation')"),
  },
  async ({ hooks: requestedHooks, intent }) => {
    const allHooks = await loadJsonArray(join(HOOKS_DIR, "meta.json"));
    const hookMap = new Map(allHooks.map((h) => [h.name, h]));

    // If intent given, find relevant hooks by matching description and tags
    let selected = [];
    if (intent) {
      const query = intent.toLowerCase();
      selected = allHooks
        .filter((h) => {
          const haystack = [h.name, h.description, ...(h.tags || [])].join(" ").toLowerCase();
          return haystack.split(" ").some((w) => query.includes(w)) || query.split(" ").some((w) => haystack.includes(w));
        })
        .slice(0, 5);
    }

    if (requestedHooks?.length) {
      selected = requestedHooks.map((name) => hookMap.get(name)).filter(Boolean);
    }

    if (selected.length === 0) {
      return {
        content: [{ type: "text", text: "No matching hooks found. Use list_hooks to see all available hooks." }],
      };
    }

    // Build combination info
    const result = [`# Hook Combination\n`];

    result.push(`## Selected Hooks\n`);
    for (const h of selected) {
      result.push(`- **${h.name}** — ${h.description}`);
    }

    // Find compatible additions from combinesWith
    const selectedNames = new Set(selected.map((h) => h.name));
    const suggestions = new Set();
    for (const h of selected) {
      for (const c of h.combinesWith || []) {
        if (!selectedNames.has(c)) suggestions.add(c);
      }
    }
    if (suggestions.size > 0) {
      result.push(`\n## Also Combines Well With\n`);
      for (const name of suggestions) {
        const h = hookMap.get(name);
        if (h) result.push(`- **${name}** — ${h.description}`);
      }
    }

    // Include source code for selected hooks
    result.push(`\n## Source Code\n`);
    for (const h of selected) {
      try {
        const code = await readFile(join(HOOKS_DIR, `${h.name}.ts`), "utf-8");
        result.push(`### ${h.name}.ts\n\`\`\`ts\n${code}\n\`\`\`\n`);
      } catch {}
    }

    return {
      content: [{ type: "text", text: result.join("\n") }],
    };
  },
);

// ── Performance Budget ────────────────────────────────────────────

server.tool(
  "check_performance_budget",
  "Check if a set of effects can safely coexist on the same page. Returns warnings about performance stacking and runtime conflicts.",
  {
    effect_ids: z
      .array(z.string())
      .describe("Effect IDs currently on the page or being considered (e.g. ['constellation-bg', 'cursor-glow', 'particle-text'])"),
  },
  async ({ effect_ids }) => {
    const LEVEL = { low: 1, medium: 2, high: 3 };
    const effects = [];
    for (const id of effect_ids) {
      try {
        const meta = JSON.parse(await readFile(join(EFFECTS_DIR, id, "meta.json"), "utf-8"));
        effects.push({ id, ...meta });
      } catch {
        effects.push({ id, name: id, performance_cost: "unknown", runtime: [] });
      }
    }

    const warnings = [];
    const highCost = effects.filter((e) => e.performance_cost === "high");
    const mediumCost = effects.filter((e) => e.performance_cost === "medium");
    const canvasCount = effects.filter((e) => e.runtime?.includes("canvas")).length;
    const webglCount = effects.filter((e) => e.runtime?.includes("webgl")).length;
    const notMobileSafe = effects.filter((e) => e.mobile_safe === false);

    let totalCost = effects.reduce((sum, e) => sum + (LEVEL[e.performance_cost] || 0), 0);

    if (highCost.length >= 2) {
      warnings.push(`🔴 ${highCost.length} high-cost effects on one page (${highCost.map((e) => e.id).join(", ")}). This will cause jank on most devices.`);
    } else if (highCost.length === 1 && mediumCost.length >= 2) {
      warnings.push(`🟡 1 high-cost + ${mediumCost.length} medium-cost effects. May lag on lower-end devices.`);
    }

    if (canvasCount >= 3) {
      warnings.push(`🟡 ${canvasCount} canvas elements running concurrent animation loops. Consider reducing or using CSS-only alternatives.`);
    }

    if (webglCount >= 2) {
      warnings.push(`🔴 ${webglCount} WebGL contexts. Most browsers limit WebGL contexts to 8-16 per page. Each consumes significant GPU memory.`);
    }

    if (notMobileSafe.length > 0 && effects.length > 0) {
      warnings.push(`📱 Not mobile-safe: ${notMobileSafe.map((e) => e.id).join(", ")}. Consider find_effects(mobile_safe=true) for alternatives.`);
    }

    const summary = {
      effects: effects.map((e) => ({ id: e.id, performance_cost: e.performance_cost, runtime: e.runtime || [], mobile_safe: e.mobile_safe })),
      total_cost: totalCost,
      max_recommended: 6,
      warnings,
      verdict: warnings.some((w) => w.startsWith("🔴")) ? "reduce effects" : warnings.length > 0 ? "proceed with caution" : "ok",
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
    };
  },
);

// ── Structured Search ─────────────────────────────────────────────

server.tool(
  "find_effects",
  "Find effects by structured criteria: category, mobile safety, complexity, performance cost, runtime requirements. More precise than keyword search.",
  {
    category: z.string().optional().describe("Category filter (e.g. 'background', 'text', 'card', 'cursor', 'shader', 'interactive')"),
    mobile_safe: z.boolean().optional().describe("Only return mobile-safe effects"),
    max_complexity: z.enum(["low", "medium", "high"]).optional().describe("Maximum complexity level"),
    max_performance_cost: z.enum(["low", "medium", "high"]).optional().describe("Maximum performance cost"),
    requires_runtime: z.array(z.string()).optional().describe("Required runtime features (e.g. ['canvas'])"),
    excludes_runtime: z.array(z.string()).optional().describe("Excluded runtime features (e.g. ['webgl'])"),
  },
  async ({ category, mobile_safe, max_complexity, max_performance_cost, requires_runtime, excludes_runtime }) => {
    const LEVEL = { low: 1, medium: 2, high: 3 };
    const all = await loadEffectsMeta();
    const filtered = all.filter((e) => {
      if (category && !e.category.includes(category)) return false;
      if (mobile_safe !== undefined && e.mobile_safe !== mobile_safe) return false;
      if (max_complexity && LEVEL[e.complexity] > LEVEL[max_complexity]) return false;
      if (max_performance_cost && LEVEL[e.performance_cost] > LEVEL[max_performance_cost]) return false;
      if (requires_runtime?.length && !requires_runtime.every((r) => e.runtime.includes(r))) return false;
      if (excludes_runtime?.length && excludes_runtime.some((r) => e.runtime.includes(r))) return false;
      return true;
    });

    const summary = filtered.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      category: e.category,
      complexity: e.complexity,
      performance_cost: e.performance_cost,
      mobile_safe: e.mobile_safe,
      props_schema: e.props_schema,
      use_cases: e.use_cases,
    }));

    return {
      content: [{
        type: "text",
        text: summary.length > 0
          ? JSON.stringify(summary, null, 2)
          : "No effects match the given criteria.",
      }],
    };
  },
);

// ── Hooks ──────────────────────────────────────────────────────────

server.tool(
  "list_hooks",
  "List all available React hooks with descriptions and tags",
  {
    tag: z
      .string()
      .optional()
      .describe(
        "Filter by tag (e.g. 'mouse', 'physics', 'canvas', 'scroll')",
      ),
  },
  async ({ tag }) => {
    const hooks = await loadJsonArray(join(HOOKS_DIR, "meta.json"));
    const filtered = tag
      ? hooks.filter((h) => h.tags?.includes(tag))
      : hooks;
    return {
      content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
    };
  },
);

server.tool(
  "get_hook",
  "Get the full source code of a hook by name",
  {
    name: z
      .string()
      .describe("Hook name (e.g. 'useMousePosition', 'useSpring')"),
  },
  async ({ name }) => {
    const filePath = join(HOOKS_DIR, `${name}.ts`);
    try {
      const code = await readFile(filePath, "utf-8");

      // Find description from meta.json
      let description = "";
      try {
        const hooks = await loadJsonArray(join(HOOKS_DIR, "meta.json"));
        const meta = hooks.find((h) => h.name === name);
        if (meta) description = meta.description;
      } catch {
        // meta not required for source delivery
      }

      const result = [`# ${name}\n`];
      if (description) result.push(`${description}\n`);
      result.push(`\`\`\`ts\n${code}\n\`\`\``);

      return {
        content: [{ type: "text", text: result.join("\n") }],
      };
    } catch {
      return {
        content: [
          {
            type: "text",
            text: `Hook "${name}" not found. Use list_hooks to see available hooks.`,
          },
        ],
      };
    }
  },
);

// ── CSS Snippets ───────────────────────────────────────────────────

server.tool(
  "list_css",
  "List all available CSS snippets with descriptions and tags",
  {
    tag: z
      .string()
      .optional()
      .describe(
        "Filter by tag (e.g. 'glass', 'animation', 'gradient', 'glow')",
      ),
  },
  async ({ tag }) => {
    const snippets = await loadJsonArray(join(CSS_DIR, "meta.json"));
    const filtered = tag
      ? snippets.filter((s) => s.tags?.includes(tag))
      : snippets;
    return {
      content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
    };
  },
);

server.tool(
  "get_css",
  "Get the full CSS source of a snippet by ID",
  {
    id: z
      .string()
      .describe("CSS snippet ID (e.g. 'glass-card', 'text-gradient')"),
  },
  async ({ id }) => {
    const filePath = join(CSS_DIR, `${id}.css`);
    try {
      const code = await readFile(filePath, "utf-8");

      // Find description from meta.json
      let name = id;
      let description = "";
      try {
        const snippets = await loadJsonArray(join(CSS_DIR, "meta.json"));
        const meta = snippets.find((s) => s.id === id);
        if (meta) {
          name = meta.name;
          description = meta.description;
        }
      } catch {
        // meta not required for source delivery
      }

      const result = [`# ${name}\n`];
      if (description) result.push(`${description}\n`);
      result.push(`\`\`\`css\n${code}\n\`\`\``);

      return {
        content: [{ type: "text", text: result.join("\n") }],
      };
    } catch {
      return {
        content: [
          {
            type: "text",
            text: `CSS snippet "${id}" not found. Use list_css to see available snippets.`,
          },
        ],
      };
    }
  },
);

// ── Presets ─────────────────────────────────────────────────────────

server.tool(
  "get_preset",
  "Get preset source code (color utilities, spring configs, or curated palettes)",
  {
    name: z
      .enum(["colors", "springs", "palettes"])
      .describe("Preset name: 'colors', 'springs', or 'palettes'"),
  },
  async ({ name }) => {
    // Try .ts first, then .tsx
    let filePath = join(PRESETS_DIR, `${name}.ts`);
    let ext = "ts";
    try {
      await readFile(filePath, "utf-8");
    } catch {
      filePath = join(PRESETS_DIR, `${name}.tsx`);
      ext = "tsx";
    }
    try {
      const code = await readFile(filePath, "utf-8");
      return {
        content: [
          {
            type: "text",
            text: `# presets/${name}.${ext}\n\n\`\`\`${ext}\n${code}\n\`\`\``,
          },
        ],
      };
    } catch {
      return {
        content: [
          {
            type: "text",
            text: `Preset "${name}" not found. Available presets: colors, springs, palettes.`,
          },
        ],
      };
    }
  },
);

// ── Unified Search ─────────────────────────────────────────────────

server.tool(
  "search",
  "Search across all asset types (effects, hooks, css) by keyword in name, description, or tags",
  {
    query: z.string().describe("Search keyword"),
    type: z
      .enum(["effects", "hooks", "css"])
      .optional()
      .describe("Limit search to a specific asset type"),
  },
  async ({ query, type }) => {
    const results = [];

    // Search effects
    if (!type || type === "effects") {
      const effects = await loadEffectsMeta();
      for (const e of effects) {
        const haystack = [e.name, e.description, ...(e.category || []), ...(e.use_cases || [])].join(" ");
        if (matchQuery(haystack, query)) {
          results.push({
            type: "effect",
            id: e.id,
            name: e.name,
            description: e.description,
            category: e.category,
            performance_cost: e.performance_cost,
            mobile_safe: e.mobile_safe,
            install: `npx ui-fx-kit add ${e.id} --target ./src`,
          });
        }
      }
    }

    // Search hooks
    if (!type || type === "hooks") {
      try {
        const hooks = await loadJsonArray(join(HOOKS_DIR, "meta.json"));
        for (const h of hooks) {
          const haystack = [h.name, h.description, ...(h.tags || [])].join(" ");
          if (matchQuery(haystack, query)) {
            results.push({
              type: "hook",
              name: h.name,
              description: h.description,
              tags: h.tags,
            });
          }
        }
      } catch {
        // hooks meta not available
      }
    }

    // Search CSS
    if (!type || type === "css") {
      try {
        const snippets = await loadJsonArray(join(CSS_DIR, "meta.json"));
        for (const s of snippets) {
          const haystack = [s.name, s.description, ...(s.tags || [])].join(" ");
          if (matchQuery(haystack, query)) {
            results.push({
              type: "css",
              id: s.id,
              name: s.name,
              description: s.description,
              tags: s.tags,
            });
          }
        }
      } catch {
        // css meta not available
      }
    }

    return {
      content: [
        {
          type: "text",
          text:
            results.length > 0
              ? JSON.stringify(results, null, 2)
              : `No results found for "${query}"${type ? ` in ${type}` : ""}.`,
        },
      ],
    };
  },
);

server.tool(
  "check_updates",
  "Check if installed effects have upstream updates available. Pass the contents of the project's .ui-fx-kit.json manifest. See also get_project_status for a complete project overview including hook sharing and performance hints.",
  {
    manifest: z.object({
      version: z.number(),
      effects: z.record(z.object({
        fromPackageVersion: z.string(),
        installedAt: z.string().optional(),
        hooks: z.array(z.string()).optional(),
        css: z.array(z.string()).optional(),
      })),
    }).describe("Contents of the project's .ui-fx-kit.json file"),
  },
  async ({ manifest }) => {
    const pkgJson = JSON.parse(
      await readFile(join(__dirname, "package.json"), "utf-8")
    );
    const currentVersion = pkgJson.version;

    const updatesAvailable = [];
    const upToDate = [];

    for (const [id, info] of Object.entries(manifest.effects)) {
      if (info.fromPackageVersion !== currentVersion) {
        updatesAvailable.push({
          id,
          fromVersion: info.fromPackageVersion,
          latestVersion: currentVersion,
          installedAt: info.installedAt,
        });
      } else {
        upToDate.push(id);
      }
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          currentVersion,
          updatesAvailable,
          upToDate,
          hint: updatesAvailable.length > 0
            ? "Tell the user which effects have updates. They can re-install with: npx ui-fx-kit add <effect> --target <dir> --force"
            : "All effects are up to date.",
        }, null, 2),
      }],
    };
  }
);

// ── Project Status ────────────────────────────────────────────────

server.tool(
  "get_project_status",
  "Analyze the user's installed effects and return a structured project overview with actionable hints. Pass the contents of the project's .ui-fx-kit.json manifest. Use this BEFORE suggesting new effects to understand what the user already has.",
  {
    manifest: z.object({
      version: z.number(),
      effects: z.record(z.object({
        fromPackageVersion: z.string(),
        installedAt: z.string().optional(),
        hooks: z.array(z.string()).optional(),
        css: z.array(z.string()).optional(),
      })),
    }).describe("Contents of the project's .ui-fx-kit.json file"),
  },
  async ({ manifest }) => {
    const pkgJson = JSON.parse(
      await readFile(join(__dirname, "package.json"), "utf-8")
    );
    const currentVersion = pkgJson.version;

    const effects = [];
    const allCategories = new Set();
    const allHooks = new Set();
    const hookUsageMap = {};
    const hints = [];

    for (const [id, info] of Object.entries(manifest.effects || {})) {
      let meta;
      try {
        meta = JSON.parse(
          await readFile(join(EFFECTS_DIR, id, "meta.json"), "utf-8")
        );
      } catch {
        meta = null;
      }

      const hooks = info.hooks || [];
      const hasUpdate = info.fromPackageVersion !== currentVersion;

      if (meta) {
        (meta.category ?? []).forEach((c) => allCategories.add(c));
        effects.push({
          id,
          name: meta.name,
          category: meta.category ?? [],
          hooks,
          performance_cost: meta.performance_cost ?? "unknown",
          mobile_safe: meta.mobile_safe ?? null,
          installedAt: info.installedAt,
          hasUpdate,
        });
      } else {
        hints.push(`❓ ${id} not found in current registry. May have been removed or renamed.`);
        effects.push({
          id,
          name: id,
          category: [],
          hooks,
          performance_cost: "unknown",
          mobile_safe: null,
          installedAt: info.installedAt,
          hasUpdate: false,
        });
      }

      for (const hook of hooks) {
        allHooks.add(hook);
        if (!hookUsageMap[hook]) hookUsageMap[hook] = [];
        hookUsageMap[hook].push(id);
      }
    }

    if (effects.length === 0) {
      hints.push("No effects installed. Use find_effects or list_effects to discover effects.");
    }

    const highCost = effects.filter((e) => e.performance_cost === "high");
    if (highCost.length >= 2) {
      hints.push(`⚠️ ${highCost.length} high-perf-cost effects co-exist (${highCost.map((e) => e.id).join(", ")}). Run check_performance_budget to evaluate.`);
    }

    for (const [hook, ids] of Object.entries(hookUsageMap)) {
      if (ids.length >= 2) {
        hints.push(`🔗 ${hook} is shared by ${ids.join(", ")}. Verify before removing any of these effects.`);
      }
    }

    const notMobileSafe = effects.filter((e) => e.mobile_safe === false);
    if (notMobileSafe.length > 0) {
      hints.push(`📱 ${notMobileSafe.map((e) => e.id).join(", ")} are not mobile-safe. Add responsive fallbacks.`);
    }

    const updatable = effects.filter((e) => e.hasUpdate);
    if (updatable.length > 0) {
      hints.push(`🔄 ${updatable.length} effects have updates available.`);
    }

    const result = {
      summary: {
        totalEffects: effects.length,
        totalHooks: allHooks.size,
        categories: [...allCategories].sort(),
      },
      effects,
      hookUsageMap,
      hints,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
);

// ── Examples ──────────────────────────────────────────────────────

server.tool(
  "get_examples",
  "Get complete, runnable usage examples for an effect. Returns full integration code showing how to import, compose with layout, and configure props. Use after get_effect to understand how to wire it into a real page.",
  {
    id: z.string().describe("Effect ID (e.g. 'aurora-bg', 'cursor-glow')"),
    baseDir: z.string().optional().describe("Import base path for the user's project. Infer from tsconfig.json paths or existing import conventions in the project (e.g. '@/components/ui-fx', '@/lib/effects'). If unknown, omit and examples will use relative paths."),
  },
  async ({ id, baseDir }) => {
    const metaPath = join(EFFECTS_DIR, id, "meta.json");
    let meta;
    try {
      meta = JSON.parse(await readFile(metaPath, "utf-8"));
    } catch {
      return {
        content: [{ type: "text", text: `Effect "${id}" not found. Use list_effects to see available effects.` }],
      };
    }

    // Derive component name from main file
    const mainFile = meta.files[0];
    const componentName = mainFile.replace(/\.(tsx|ts|jsx|js)$/, "");
    const importBase = baseDir ? `${baseDir.replace(/\/+$/, "")}/effects/${id}` : `./effects/${id}`;

    const sections = [`# Examples: ${meta.name}\n`];

    // Basic usage
    sections.push(`## Basic Usage\n\`\`\`tsx\nimport ${componentName} from "${importBase}/${componentName}";\n`);
    if (meta.usage) {
      sections.push(`${meta.usage}\n\`\`\`\n`);
    } else {
      // Generate from props_schema
      const defaultProps = Object.entries(meta.props_schema || {})
        .filter(([, v]) => v.default !== undefined && v.type !== "string")
        .map(([k, v]) => `${k}={${JSON.stringify(v.default)}}`)
        .join(" ");
      sections.push(`<${componentName} ${defaultProps} />\n\`\`\`\n`);
    }

    // Full page integration based on category
    const isBackground = meta.category?.some((c) => ["background", "ambient"].includes(c));
    const isCursor = meta.category?.includes("cursor");
    const isText = meta.category?.includes("text");
    const isCard = meta.category?.includes("card");

    sections.push(`## Full Page Integration\n\`\`\`tsx\n"use client";\n\nimport ${componentName} from "${importBase}/${componentName}";\n`);

    if (isBackground) {
      sections.push(`export default function Page() {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* No className needed — default style fills the container */}
      <${componentName} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 700, color: "#fff" }}>Your Content</h1>
      </div>
    </div>
  );
}\n\`\`\`\n`);
    } else if (isCursor) {
      sections.push(`export default function Page() {
  return (
    <>
      <${componentName} />
      <main style={{ minHeight: "100vh" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 700 }}>Your Content</h1>
        <p>The cursor effect renders as a fixed overlay.</p>
      </main>
    </>
  );
}\n\`\`\`\n`);
    } else if (isText) {
      sections.push(`export default function Page() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <${componentName}>Hello World</${componentName}>
    </div>
  );
}\n\`\`\`\n`);
    } else if (isCard) {
      sections.push(`export default function Page() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", padding: "3rem" }}>
      <${componentName}>Card content</${componentName}>
      <${componentName}>Card content</${componentName}>
      <${componentName}>Card content</${componentName}>
    </div>
  );
}\n\`\`\`\n`);
    } else {
      sections.push(`export default function Page() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <${componentName} />
    </div>
  );
}\n\`\`\`\n`);
    }

    // Props reference with recommended values
    if (meta.props_schema && Object.keys(meta.props_schema).length > 0) {
      sections.push(`## Props Reference\n`);
      for (const [prop, schema] of Object.entries(meta.props_schema)) {
        let line = `- **${prop}**`;
        if (schema.type) line += ` (${schema.type})`;
        if (schema.default !== undefined) line += ` — default: \`${JSON.stringify(schema.default)}\``;
        if (schema.range) line += `, range: ${schema.range[0]}–${schema.range[1]}`;
        if (schema.options) line += `, options: ${schema.options.map((o) => `\`"${o}"\``).join(", ")}`;
        if (schema.description) line += ` — ${schema.description}`;
        sections.push(line);
      }
      sections.push("");
    }

    // Gotchas based on meta
    const tips = [];
    if (isBackground) tips.push("The effect fills its container by default (position:absolute + inset:0). Just make sure the parent has `position: relative`.");
    if (meta.mobile_safe === false) tips.push("Not mobile-safe. Hide on mobile with a media query or conditional rendering.");
    if (meta.accessibility_notes?.length > 0) tips.push(...meta.accessibility_notes.map((n) => `A11y: ${n}`));
    if (meta.conflicts?.length > 0) tips.push(...meta.conflicts);
    if (meta.hooks?.length > 0) tips.push(`Requires hooks: ${meta.hooks.join(", ")}. These must be copied alongside the effect.`);
    if (meta.dependencies?.length > 0) tips.push(`Run: \`npm install ${meta.dependencies.join(" ")}\``);

    if (tips.length > 0) {
      sections.push(`## Tips & Gotchas\n`);
      tips.forEach((t) => sections.push(`- ${t}`));
    }

    return {
      content: [{ type: "text", text: sections.join("\n") }],
    };
  },
);

// ── Audit Checklist ──────────────────────────────────────────────

server.tool(
  "audit_install",
  "Run after adding an effect to a user's project. Returns a checklist of things to verify. The AI agent should go through each item and fix any issues found.",
  {
    id: z.string().describe("Effect ID that was just installed"),
    targetDir: z.string().describe("Absolute path where the effect was installed (e.g. '/Users/me/project/src')"),
    framework: z.enum(["nextjs", "vite", "remix", "other"]).optional().describe("User's framework, affects specific checks"),
  },
  async ({ id, targetDir, framework }) => {
    const metaPath = join(EFFECTS_DIR, id, "meta.json");
    let meta;
    try {
      meta = JSON.parse(await readFile(metaPath, "utf-8"));
    } catch {
      return {
        content: [{ type: "text", text: `Effect "${id}" not found.` }],
      };
    }

    // Normalize targetDir — strip trailing known subdirs to get the root
    const normalized = targetDir.replace(/\/+$/, "");
    const tail = basename(normalized);
    const root = ["effects", "hooks", "css", "presets"].includes(tail) ? dirname(normalized) : normalized;

    const checks = [];

    // 1. File existence checks
    for (const file of meta.files) {
      checks.push({
        check: `Effect file exists: ${id}/${file}`,
        verify: `Check that ${join(root, "effects", id, file)} exists`,
      });
    }

    for (const hook of meta.hooks || []) {
      checks.push({
        check: `Hook dependency exists: hooks/${hook}.ts`,
        verify: `Check that ${join(root, "hooks", hook + ".ts")} exists. If missing, copy from registry with get_hook("${hook}")`,
      });
    }

    for (const css of meta.css || []) {
      checks.push({
        check: `CSS dependency exists: css/${css}.css`,
        verify: `Check that ${join(root, "css", css + ".css")} exists and is imported`,
      });
    }

    // 2. "use client" directive
    if (framework === "nextjs" || framework === "remix") {
      for (const file of meta.files) {
        checks.push({
          check: `"use client" directive in ${file}`,
          verify: `Verify first line of ${join(root, "effects", id, file)} is "use client";. The CLI auto-injects this on \`add\` when ${framework} is detected (skipped in dry-run).`,
        });
      }
    }

    // 3. npm dependencies
    if (meta.dependencies?.length > 0) {
      checks.push({
        check: `npm dependencies installed: ${meta.dependencies.join(", ")}`,
        verify: `Run: npm install ${meta.dependencies.join(" ")}`,
      });
    }

    // 4. Import path correctness
    checks.push({
      check: "Import paths resolve correctly",
      verify: `Open the effect file and verify all relative imports (../../hooks, ../../presets) have been rewritten to match the project's directory structure. Common fix: adjust paths or use baseDir param in get_effect.`,
    });

    // 4b. Barrel export (hooks/index.ts)
    if ((meta.hooks || []).length > 0) {
      const hookExports = (meta.hooks || []).map((h) => `export { ${h} } from "./${h}";`).join("\\n");
      checks.push({
        check: "hooks/index.ts barrel exports include all required hooks",
        verify: `Check ${join(root, "hooks", "index.ts")} exists and re-exports: ${(meta.hooks || []).join(", ")}. If the effect imports from the barrel ("../hooks" or "hooks/index"), missing exports will cause build errors. Add these lines if missing:\n${hookExports}`,
      });
    }

    // 5. Presets dependency
    const needsPresets = meta.imports?.some((i) => i.includes("presets"));
    if (needsPresets) {
      checks.push({
        check: "Preset files exist (colors.ts / palettes.ts)",
        verify: `Check that ${join(root, "presets")} directory contains the needed preset files. Use get_preset("colors") or get_preset("palettes") to fetch them.`,
      });
    }

    // 6. Performance
    if (meta.performance_cost === "high") {
      checks.push({
        check: "Performance budget",
        verify: `This effect has HIGH performance cost. Check if the page already has other heavy effects using check_performance_budget.`,
      });
    }

    // 7. Mobile safety
    if (meta.mobile_safe === false) {
      checks.push({
        check: "Mobile fallback",
        verify: `This effect is NOT mobile-safe. Add responsive hiding (e.g. className="hidden md:block") or provide a lightweight fallback.`,
      });
    }

    // 8. Accessibility
    for (const note of meta.accessibility_notes || []) {
      checks.push({
        check: `Accessibility: ${note}`,
        verify: `Ensure this is addressed in the implementation.`,
      });
    }

    // 9. Visual integration
    const isBackground = meta.category?.some((c) => ["background", "ambient"].includes(c));
    if (isBackground) {
      checks.push({
        check: "Background effect visibility",
        verify: "Background effects need: (1) parent container with position:relative, (2) the effect with position:absolute + inset:0 + negative z-index, (3) parent/page background must NOT be opaque — use transparent or semi-transparent background so the effect shows through.",
      });
    }

    // 10. CSS import check
    if (meta.css?.length > 0) {
      checks.push({
        check: "CSS imported in layout/page",
        verify: `Verify that ${meta.css.map((c) => `css/${c}.css`).join(", ")} is imported in the page or global layout file.`,
      });
    }

    const output = [`# Audit: ${meta.name} (${id})\n`, `## Checklist (${checks.length} items)\n`];
    checks.forEach((c, i) => {
      output.push(`### ${i + 1}. ${c.check}`);
      output.push(`${c.verify}\n`);
    });

    output.push(`## After all checks pass`);
    output.push(`Tell the user: "${meta.name}" is installed and ready. Run the dev server to verify visually.`);

    return {
      content: [{ type: "text", text: output.join("\n") }],
    };
  },
);

// ── Start ──────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
