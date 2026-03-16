#!/usr/bin/env node

import { readdir, readFile, copyFile, mkdir, stat } from "fs/promises";
import { join, dirname, basename, resolve } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB_ROOT = resolve(__dirname, "..");
const EFFECTS_DIR = join(LIB_ROOT, "effects");
const HOOKS_DIR = join(LIB_ROOT, "hooks");
const CSS_DIR = join(LIB_ROOT, "css");
const PRESETS_DIR = join(LIB_ROOT, "presets");

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";

// ── Helpers ─────────────────────────────────────────────

async function loadMeta(effectId) {
  const metaPath = join(EFFECTS_DIR, effectId, "meta.json");
  return JSON.parse(await readFile(metaPath, "utf-8"));
}

async function listEffects() {
  const dirs = await readdir(EFFECTS_DIR, { withFileTypes: true });
  const effects = [];
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    try {
      const meta = await loadMeta(dir.name);
      effects.push({ id: dir.name, ...meta });
    } catch { /* skip */ }
  }
  return effects;
}

/** Scan a .tsx file for hook/CSS/preset imports and return dependency names */
async function scanDeps(filePath) {
  const code = await readFile(filePath, "utf-8");
  const hooks = [];
  const cssFiles = [];
  const presetFiles = [];

  // Match: import { useX, useY } from "../../hooks" or "./hooks"
  const hookImports = code.matchAll(/import\s+\{([^}]+)\}\s+from\s+["'][^"']*hooks["']/g);
  for (const m of hookImports) {
    const names = m[1].split(",").map(s => s.replace(/\s+as\s+\w+/, "").trim()).filter(Boolean);
    for (const name of names) {
      if (name.startsWith("use") || name === "proximity") hooks.push(name);
    }
  }

  // Match: import type { X } from "../../hooks" — skip these
  // Match: import "../../css/foo.css"
  const cssImports = code.matchAll(/import\s+["']([^"']*css\/([^"']+))["']/g);
  for (const m of cssImports) {
    cssFiles.push(m[2]);
  }

  // Match: import { X } from "../../presets/colors" or "../../presets"
  const presetImports = code.matchAll(/import\s+(?:type\s+)?(?:\{[^}]+\}|\w+)\s+from\s+["'][^"']*presets(?:\/(\w+))?["']/g);
  for (const m of presetImports) {
    const file = m[1] || "index";
    if (!presetFiles.includes(file)) presetFiles.push(file);
  }

  return { hooks, cssFiles, presetFiles };
}

/** Scan hook file for its own preset dependencies */
async function scanHookDeps(hookName) {
  const filePath = join(HOOKS_DIR, `${hookName}.ts`);
  try {
    const code = await readFile(filePath, "utf-8");
    const presetFiles = [];
    const presetImports = code.matchAll(/import\s+(?:type\s+)?(?:\{[^}]+\}|\w+)\s+from\s+["'][^"']*presets\/(\w+)["']/g);
    for (const m of presetImports) {
      if (!presetFiles.includes(m[1])) presetFiles.push(m[1]);
    }
    return presetFiles;
  } catch {
    return [];
  }
}

async function ensureDir(dir) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

async function copyWithLog(src, dest, label, { force = false, dryRun = false } = {}) {
  if (!force && existsSync(dest)) {
    console.log(`  ${DIM}~${RESET} ${label} ${DIM}(exists, skipped)${RESET}`);
    return false;
  }
  if (dryRun) {
    console.log(`  ${GREEN}+${RESET} ${label} ${DIM}(would copy)${RESET}`);
    return true;
  }
  await ensureDir(dirname(dest));
  await copyFile(src, dest);
  console.log(`  ${GREEN}+${RESET} ${label}`);
  return true;
}

// ── Commands ────────────────────────────────────────────

async function cmdList(tag) {
  const effects = await listEffects();
  const filtered = tag ? effects.filter(e => e.tags?.includes(tag)) : effects;

  console.log(`\n${BOLD}ui-fx-kit${RESET} ${DIM}— ${filtered.length} effects${tag ? ` (tag: ${tag})` : ""}${RESET}\n`);

  const categories = {};
  for (const e of filtered) {
    const cat = e.tags?.[0] || "other";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(e);
  }

  for (const [cat, items] of Object.entries(categories)) {
    console.log(`  ${CYAN}${cat}${RESET}`);
    for (const e of items) {
      console.log(`    ${BOLD}${e.id}${RESET} ${DIM}— ${e.description?.slice(0, 60)}${RESET}`);
    }
    console.log();
  }
}

async function cmdAdd(effectId, targetDir, { dryRun = false } = {}) {
  // Validate effect exists
  let meta;
  try {
    meta = await loadMeta(effectId);
  } catch {
    console.error(`\n${RED}Error:${RESET} Effect "${effectId}" not found.`);
    console.log(`Run ${CYAN}npx ui-fx-kit list${RESET} to see available effects.\n`);
    process.exit(1);
  }

  const target = resolve(targetDir || ".");

  console.log(`\n${BOLD}ui-fx-kit add${RESET} ${CYAN}${meta.name}${RESET}${dryRun ? ` ${YELLOW}(dry run)${RESET}` : ""}\n`);
  console.log(`${DIM}${meta.description}${RESET}\n`);

  // 1. Scan effect source for actual dependencies
  const effectDir = join(EFFECTS_DIR, effectId);
  const effectFiles = meta.files || [];
  let allHooks = new Set();
  let allCss = new Set();
  let allPresets = new Set();

  for (const file of effectFiles) {
    const deps = await scanDeps(join(effectDir, file));
    deps.hooks.forEach(h => allHooks.add(h));
    deps.cssFiles.forEach(c => allCss.add(c));
    deps.presetFiles.forEach(p => allPresets.add(p));
  }

  // Also scan hooks for their preset dependencies
  for (const hook of allHooks) {
    const hookPresets = await scanHookDeps(hook);
    hookPresets.forEach(p => allPresets.add(p));
  }

  // Always include colors.ts if any presets needed (it has the RGB type)
  if (allPresets.size > 0 || allHooks.has("useSpotlight")) {
    allPresets.add("colors");
  }

  // 2. Determine target structure
  // If target already ends with effects/, hooks/, css/, or presets/, use parent as root
  const base = basename(target);
  const root = ["effects", "hooks", "css", "presets"].includes(base) ? dirname(target) : target;
  const effectsTarget = join(root, "effects", effectId);
  const hooksTarget = join(root, "hooks");
  const cssTarget = join(root, "css");
  const presetsTarget = join(root, "presets");

  // 3. Copy effect files (always overwrite — user explicitly asked for this effect)
  console.log(`${BOLD}Effect:${RESET}`);
  for (const file of effectFiles) {
    await copyWithLog(join(effectDir, file), join(effectsTarget, file), `effects/${effectId}/${file}`, { force: true, dryRun });
  }
  await copyWithLog(join(effectDir, "meta.json"), join(effectsTarget, "meta.json"), `effects/${effectId}/meta.json`, { force: true, dryRun });

  // 4. Copy hooks (skip if already exists — don't overwrite user modifications)
  if (allHooks.size > 0) {
    console.log(`\n${BOLD}Hooks:${RESET}`);
    for (const hook of allHooks) {
      const hookFile = hook === "proximity" ? "useProximity.ts" : `${hook}.ts`;
      const src = join(HOOKS_DIR, hookFile);
      if (existsSync(src)) {
        await copyWithLog(src, join(hooksTarget, hookFile), `hooks/${hookFile}`, { dryRun });
      }
    }
    // Merge hooks/index.ts — add new exports without removing existing ones
    const indexPath = join(hooksTarget, "index.ts");
    if (!dryRun) await ensureDir(hooksTarget);
    const { writeFile } = await import("fs/promises");

    let existingExports = new Set();
    if (existsSync(indexPath)) {
      const existing = await readFile(indexPath, "utf-8");
      const matches = existing.matchAll(/export\s+\{\s*(\w+)\s*\}/g);
      for (const m of matches) existingExports.add(m[1]);
    }

    const newHooks = Array.from(allHooks).filter(h => !existingExports.has(h));
    if (newHooks.length > 0 || !existsSync(indexPath)) {
      if (dryRun) {
        console.log(`  ${GREEN}+${RESET} hooks/index.ts ${DIM}(would ${newHooks.length > 0 ? "merge " + newHooks.length + " new exports" : "create"})${RESET}`);
      } else {
        const allExports = new Set([...existingExports, ...allHooks]);
        const indexLines = Array.from(allExports).map(h => {
          const file = h === "proximity" ? "useProximity" : h;
          return `export { ${h} } from "./${file}";`;
        });
        await writeFile(indexPath, indexLines.join("\n") + "\n");
        console.log(`  ${GREEN}+${RESET} hooks/index.ts ${DIM}(${newHooks.length > 0 ? "merged " + newHooks.length + " new exports" : "created"})${RESET}`);
      }
    } else {
      console.log(`  ${DIM}~${RESET} hooks/index.ts ${DIM}(no new exports needed)${RESET}`);
    }
  }

  // 5. Copy CSS
  if (allCss.size > 0) {
    console.log(`\n${BOLD}CSS:${RESET}`);
    for (const cssFile of allCss) {
      const src = join(CSS_DIR, cssFile);
      if (existsSync(src)) {
        await copyWithLog(src, join(cssTarget, cssFile), `css/${cssFile}`, { dryRun });
      }
    }
  }

  // 6. Copy presets
  if (allPresets.size > 0) {
    console.log(`\n${BOLD}Presets:${RESET}`);
    for (const preset of allPresets) {
      const tsFile = `${preset}.ts`;
      const src = join(PRESETS_DIR, tsFile);
      if (existsSync(src)) {
        await copyWithLog(src, join(presetsTarget, tsFile), `presets/${tsFile}`, { dryRun });
      }
    }
  }

  // 7. Check for npm dependencies
  const npmDeps = [];
  for (const file of effectFiles) {
    const code = await readFile(join(effectDir, file), "utf-8");
    if (code.includes("framer-motion")) npmDeps.push("framer-motion");
    if (code.includes("@react-three/fiber")) npmDeps.push("@react-three/fiber");
    if (code.includes("@react-three/drei")) npmDeps.push("@react-three/drei");
    if (code.includes("from \"three\"")) npmDeps.push("three");
  }
  const uniqueDeps = [...new Set(npmDeps)];

  // 8. Fix import paths in copied effect files
  if (dryRun) {
    console.log(`\n${BOLD}Imports:${RESET}`);
    console.log(`  ${GREEN}✓${RESET} Import paths ${DIM}(would adjust)${RESET}`);
  } else {
    console.log(`\n${BOLD}Fixing imports...${RESET}`);
    for (const file of effectFiles) {
      const destPath = join(effectsTarget, file);
      let code = await readFile(destPath, "utf-8");
      code = code.replace(/from\s+["']\.\.\/\.\.\/hooks["']/g, 'from "../../hooks"');
      code = code.replace(/from\s+["']\.\.\/\.\.\/presets\/(\w+)["']/g, 'from "../../presets/$1"');
      code = code.replace(/from\s+["']\.\.\/\.\.\/presets["']/g, 'from "../../presets"');
      code = code.replace(/import\s+["']\.\.\/\.\.\/css\//g, 'import "../../css/');
      const { writeFile } = await import("fs/promises");
      await writeFile(destPath, code);
    }
    console.log(`  ${GREEN}✓${RESET} Import paths adjusted`);
  }

  // 9. Summary
  if (dryRun) {
    console.log(`\n${YELLOW}${BOLD}Dry run complete.${RESET} No files were written.\n`);
    console.log(`${BOLD}Would write to:${RESET} ${CYAN}${resolve(effectsTarget)}${RESET}\n`);
  } else {
    console.log(`\n${GREEN}${BOLD}Done!${RESET}\n`);
    console.log(`${BOLD}Files written to:${RESET} ${CYAN}${resolve(effectsTarget)}${RESET}\n`);
  }

  if (uniqueDeps.length > 0) {
    console.log(`${YELLOW}Install required dependencies:${RESET}`);
    console.log(`  npm install ${uniqueDeps.join(" ")}\n`);
  }

  console.log(`${BOLD}Usage:${RESET}`);
  const componentName = meta.name.replace(/\s+/g, "");
  const importPath = resolve(effectsTarget, effectFiles[0]?.replace(".tsx", "") || "");
  console.log(`  import ${componentName} from "./effects/${effectId}/${effectFiles[0]?.replace(".tsx", "")}";`);
  console.log(`  <${componentName} />\n`);
}

async function cmdInfo(effectId) {
  let meta;
  try {
    meta = await loadMeta(effectId);
  } catch {
    console.error(`\n${RED}Error:${RESET} Effect "${effectId}" not found.\n`);
    process.exit(1);
  }

  console.log(`\n${BOLD}${meta.name}${RESET}`);
  console.log(`${DIM}${meta.description}${RESET}\n`);
  console.log(`${BOLD}Tags:${RESET}     ${meta.tags?.join(", ") || "none"}`);
  console.log(`${BOLD}Hooks:${RESET}    ${meta.hooks?.join(", ") || "none"}`);
  console.log(`${BOLD}Files:${RESET}    ${meta.files?.join(", ") || "none"}`);

  if (meta.dependencies?.length > 0) {
    console.log(`${BOLD}npm deps:${RESET} ${meta.dependencies.join(", ")}`);
  }
  console.log();
}

// ── Arg parsing ─────────────────────────────────────────

function parseArgs(argv) {
  const raw = argv.slice(2);
  const positional = [];
  const flags = {};
  let wantsHelp = false;

  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i];
    if (arg === "--help" || arg === "-h") {
      wantsHelp = true;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = raw[i + 1];
      if (next && !next.startsWith("-")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith("-")) {
      // skip unknown short flags
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags, wantsHelp };
}

const { positional, flags, wantsHelp } = parseArgs(process.argv);
const command = positional[0];

function showHelp() {
  console.log(`
${BOLD}ui-fx-kit${RESET} — 64 composable React UI effects

${BOLD}Commands:${RESET}
  ${CYAN}list${RESET} [tag]                    List all effects (optionally filter by tag)
  ${CYAN}add${RESET} <name> [--target dir] [--dry-run]  Add an effect to your project
  ${CYAN}info${RESET} <name>                   Show effect details and dependencies

${BOLD}Examples:${RESET}
  npx ui-fx-kit list
  npx ui-fx-kit list background
  npx ui-fx-kit add holographic-card
  npx ui-fx-kit add gradient-mesh --target ./src
  npx ui-fx-kit info silk-waves
`);
}

if (wantsHelp || command === "help" || !command) {
  showHelp();
} else if (command === "list" || command === "ls") {
  await cmdList(positional[1]);
} else if (command === "add") {
  const effectNames = positional.slice(1);
  if (effectNames.length === 0) {
    console.error(`\n${RED}Usage:${RESET} npx ui-fx-kit add <effect-name> [effect2 ...] [--target dir]\n`);
    console.log(`${DIM}Examples:${RESET}`);
    console.log(`  npx ui-fx-kit add holographic-card`);
    console.log(`  npx ui-fx-kit add gradient-mesh silk-waves cursor-glow --target ./src\n`);
    process.exit(1);
  }
  const targetDir = flags.target || ".";
  if (targetDir.startsWith("-")) {
    console.error(`\n${RED}Error:${RESET} Invalid target directory "${targetDir}".`);
    console.log(`Use: npx ui-fx-kit add ${effectNames[0]} --target ./src\n`);
    process.exit(1);
  }
  const dryRun = flags["dry-run"] === true;
  for (const name of effectNames) {
    await cmdAdd(name, targetDir, { dryRun });
    if (effectNames.length > 1) console.log(`${DIM}${"─".repeat(50)}${RESET}\n`);
  }
} else if (command === "info") {
  if (!positional[1]) {
    console.error(`\n${RED}Usage:${RESET} npx ui-fx-kit info <effect-name>\n`);
    process.exit(1);
  }
  await cmdInfo(positional[1]);
} else {
  console.error(`\n${RED}Unknown command:${RESET} ${command}`);
  console.log(`Run ${CYAN}npx ui-fx-kit --help${RESET} for usage.\n`);
  process.exit(1);
}
