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

async function loadEffectsMeta(tag) {
  const dirs = await readdir(EFFECTS_DIR, { withFileTypes: true });
  const effects = [];
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    try {
      const meta = JSON.parse(
        await readFile(join(EFFECTS_DIR, dir.name, "meta.json"), "utf-8"),
      );
      if (tag && !meta.tags?.includes(tag)) continue;
      effects.push({
        id: dir.name,
        name: meta.name,
        description: meta.description,
        usage: meta.usage || "",
        tags: meta.tags,
        dependencies: meta.dependencies,
        hooks: meta.hooks || [],
        presets: meta.presets || [],
        css: meta.css || [],
        files: meta.files,
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
  "List all available UI effect components with descriptions, tags, and dependencies",
  {
    tag: z
      .string()
      .optional()
      .describe("Filter by tag (e.g. 'canvas', 'mouse', '3d', 'scroll')"),
  },
  async ({ tag }) => {
    const effects = await loadEffectsMeta(tag);
    return {
      content: [{ type: "text", text: JSON.stringify(effects, null, 2) }],
    };
  },
);

function rewriteImports(code, baseDir) {
  if (!baseDir) return code;
  const base = baseDir.replace(/\/+$/, "");
  code = code.replace(/from\s+["']\.\.\/\.\.\/hooks(\/[^"']*)?["']/g, `from "${base}/hooks$1"`);
  code = code.replace(/from\s+["']\.\.\/\.\.\/presets(\/[^"']*)?["']/g, `from "${base}/presets$1"`);
  code = code.replace(/import\s+["']\.\.\/\.\.\/css\//g, `import "${base}/css/`);
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

    if (meta.dependencies?.length > 0) {
      result.push(
        `## Dependencies\nnpm install ${meta.dependencies.join(" ")}\n`,
      );
    }

    for (const file of meta.files) {
      let code = await readFile(join(EFFECTS_DIR, id, file), "utf-8");
      code = rewriteImports(code, baseDir);
      result.push(`## ${file}\n\`\`\`tsx\n${code}\n\`\`\``);
    }

    return {
      content: [{ type: "text", text: result.join("\n") }],
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
        const haystack = [e.name, e.description, ...(e.tags || [])].join(" ");
        if (matchQuery(haystack, query)) {
          results.push({
            type: "effect",
            id: e.id,
            name: e.name,
            description: e.description,
            tags: e.tags,
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

// ── Start ──────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
