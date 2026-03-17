import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
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
        "Base directory for import rewriting (e.g. '@/lib/ui-fx' or '../shared'). When set, ../../hooks becomes {baseDir}/hooks, etc.",
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
      .describe("Base directory for import rewriting (e.g. '@/lib/ui-fx')"),
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
  "Check if installed effects have upstream updates available. Pass the contents of the project's .ui-fx-kit.json manifest.",
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

// ── Start ──────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
