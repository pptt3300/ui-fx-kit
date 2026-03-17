#!/usr/bin/env node

import { readdir, readFile, copyFile, mkdir, stat, writeFile } from "fs/promises";
import { join, dirname, basename, resolve, relative } from "path";
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

  // Match runtime imports from hooks (skip `import type`)
  const hookImports = code.matchAll(/import\s+\{([^}]+)\}\s+from\s+["'][^"']*hooks["']/g);
  for (const m of hookImports) {
    // Skip if this is an `import type` statement
    if (/import\s+type\s+\{/.test(m[0])) continue;
    const names = m[1].split(",").map(s => s.replace(/\s+as\s+\w+/, "").trim()).filter(Boolean);
    for (const name of names) {
      if (name.startsWith("use") || name === "proximity") hooks.push(name);
    }
  }

  // Match: import "../../css/foo.css"
  const cssImports = code.matchAll(/import\s+["']([^"']*css\/([^"']+))["']/g);
  for (const m of cssImports) {
    cssFiles.push(m[2]);
  }

  // Match runtime imports from presets (skip `import type`)
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

async function copyWithLog(src, dest, label, { force = false, dryRun = false } = {}) {
  if (!force && existsSync(dest)) {
    console.log(`  ${DIM}~${RESET} ${label} ${DIM}(exists, skipped)${RESET}`);
    return false;
  }
  if (dryRun) {
    console.log(`  ${GREEN}+${RESET} ${label} ${DIM}(would copy)${RESET}`);
    return true;
  }
  const overwriting = force && existsSync(dest);
  await mkdir(dirname(dest), { recursive: true });
  await copyFile(src, dest);
  console.log(`  ${GREEN}+${RESET} ${label}${overwriting ? ` ${YELLOW}(overwritten)${RESET}` : ""}`);
  return true;
}

/** Walk up from dir to find project root (has package.json) */
function findProjectRoot(dir) {
  let current = resolve(dir);
  while (current !== dirname(current)) {
    if (existsSync(join(current, "package.json"))) return current;
    current = dirname(current);
  }
  return null;
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

async function cmdAdd(effectId, targetDir, { dryRun = false, force = false } = {}) {
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
  // Strip trailing slashes, then check if target ends with a known subdirectory
  const normalized = target.replace(/\/+$/, "");
  const base = basename(normalized);
  const root = ["effects", "hooks", "css", "presets"].includes(base) ? dirname(normalized) : normalized;
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
        await copyWithLog(src, join(hooksTarget, hookFile), `hooks/${hookFile}`, { force, dryRun });
      }
    }
    // Merge hooks/index.ts — append new exports without destroying existing content
    const indexPath = join(hooksTarget, "index.ts");

    let existingContent = "";
    let existingExportNames = new Set();
    if (existsSync(indexPath)) {
      existingContent = await readFile(indexPath, "utf-8");
      // Collect all exported names (both value and type exports)
      const exportMatches = existingContent.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g);
      for (const m of exportMatches) {
        const names = m[1].split(",").map(s => s.replace(/\s+as\s+\w+/, "").trim()).filter(Boolean);
        names.forEach(n => existingExportNames.add(n));
      }
    }

    const newHooks = Array.from(allHooks).filter(h => !existingExportNames.has(h));
    if (newHooks.length > 0 || !existsSync(indexPath)) {
      if (dryRun) {
        console.log(`  ${GREEN}+${RESET} hooks/index.ts ${DIM}(would ${newHooks.length > 0 ? "merge " + newHooks.length + " new exports" : "create"})${RESET}`);
      } else {
        await mkdir(hooksTarget, { recursive: true });
        // Append new export lines to existing content instead of overwriting
        const newLines = newHooks.map(h => {
          const file = h === "proximity" ? "useProximity" : h;
          return `export { ${h} } from "./${file}";`;
        });
        if (existingContent) {
          const appended = existingContent.trimEnd() + "\n" + newLines.join("\n") + "\n";
          await writeFile(indexPath, appended);
        } else {
          await writeFile(indexPath, newLines.join("\n") + "\n");
        }
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
        await copyWithLog(src, join(cssTarget, cssFile), `css/${cssFile}`, { force, dryRun });
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
        await copyWithLog(src, join(presetsTarget, tsFile), `presets/${tsFile}`, { force, dryRun });
      }
    }
  }

  // 7. Check for npm dependencies (from meta.json + source scanning as fallback)
  const npmDeps = new Set(meta.dependencies || []);
  for (const file of effectFiles) {
    const code = await readFile(join(effectDir, file), "utf-8");
    if (code.includes("framer-motion")) npmDeps.add("framer-motion");
    if (code.includes("@react-three/fiber")) npmDeps.add("@react-three/fiber");
    if (code.includes("@react-three/drei")) npmDeps.add("@react-three/drei");
    if (code.includes("from \"three\"") || code.includes("from 'three'")) npmDeps.add("three");
  }
  const uniqueDeps = [...npmDeps];

  // 8. Fix import paths in copied effect files
  if (dryRun) {
    console.log(`\n${BOLD}Imports:${RESET}`);
    console.log(`  ${GREEN}✓${RESET} Import paths ${DIM}(would adjust)${RESET}`);
  } else {
    console.log(`\n${BOLD}Fixing imports...${RESET}`);
    // Compute actual relative paths from effect dir to hooks/presets/css dirs
    const relHooks = relative(effectsTarget, hooksTarget).replace(/\\/g, "/");
    const relPresets = relative(effectsTarget, presetsTarget).replace(/\\/g, "/");
    const relCss = relative(effectsTarget, cssTarget).replace(/\\/g, "/");
    for (const file of effectFiles) {
      const destPath = join(effectsTarget, file);
      let code = await readFile(destPath, "utf-8");
      code = code.replace(/from\s+["']\.\.\/\.\.\/hooks(\/[^"']*)?["']/g, `from "${relHooks}$1"`);
      code = code.replace(/from\s+["']\.\.\/\.\.\/presets\/(\w+)["']/g, `from "${relPresets}/$1"`);
      code = code.replace(/from\s+["']\.\.\/\.\.\/presets["']/g, `from "${relPresets}"`);
      code = code.replace(/import\s+["']\.\.\/\.\.\/css\/([^"']+)["']/g, `import "${relCss}/$1"`);
      await writeFile(destPath, code);
    }
    console.log(`  ${GREEN}✓${RESET} Import paths adjusted`);
  }

  // Detect Next.js / Remix — inject 'use client' if needed
  const projectRoot2 = findProjectRoot(root);
  let isNextOrRemix = false;
  if (projectRoot2) {
    isNextOrRemix = existsSync(join(projectRoot2, "next.config.js")) ||
      existsSync(join(projectRoot2, "next.config.mjs")) ||
      existsSync(join(projectRoot2, "next.config.ts"));
    if (!isNextOrRemix) {
      try {
        const projPkg = JSON.parse(await readFile(join(projectRoot2, "package.json"), "utf-8"));
        const allDeps = { ...projPkg.dependencies, ...projPkg.devDependencies };
        isNextOrRemix = Object.keys(allDeps).some(d => d.startsWith("@remix-run/"));
      } catch { /* no package.json or parse error */ }
    }
  }

  if (isNextOrRemix && !dryRun) {
    for (const file of effectFiles) {
      if (!file.endsWith(".tsx") && !file.endsWith(".ts")) continue;
      const destPath = join(effectsTarget, file);
      let code = await readFile(destPath, "utf-8");
      if (!code.startsWith("'use client'") && !code.startsWith('"use client"')) {
        code = "'use client';\n\n" + code;
        await writeFile(destPath, code);
      }
    }
    console.log(`  ${GREEN}✓${RESET} Added 'use client' ${DIM}(Next.js detected)${RESET}`);
  }

  // Write manifest to project root (where package.json lives)
  if (!dryRun) {
    const projectRoot = findProjectRoot(root);
    const manifestDir = projectRoot || root;
    const manifestPath = join(manifestDir, ".ui-fx-kit.json");
    let manifest = { version: 1, effects: {} };
    if (existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
      } catch { /* start fresh */ }
    }
    const pkgJson = JSON.parse(await readFile(join(LIB_ROOT, "package.json"), "utf-8"));
    manifest.effects[effectId] = {
      fromPackageVersion: pkgJson.version,
      installedAt: new Date().toISOString(),
      hooks: [...allHooks],
      css: [...allCss],
    };
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
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
  const ext = effectFiles[0]?.match(/\.\w+$/)?.[0] || ".tsx";
  console.log(`  import ${componentName} from "./effects/${effectId}/${effectFiles[0]?.replace(ext, "")}";`);
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
  console.log(`${BOLD}CSS:${RESET}      ${meta.css?.join(", ") || "none"}`);
  console.log(`${BOLD}Presets:${RESET}   ${meta.presets?.join(", ") || "none"}`);
  console.log(`${BOLD}Files:${RESET}    ${meta.files?.join(", ") || "none"}`);

  if (meta.dependencies?.length > 0) {
    console.log(`${BOLD}npm deps:${RESET} ${meta.dependencies.join(", ")}`);
  }
  console.log();
}

async function cmdRemove(effectId, targetDir, { dryRun = false } = {}) {
  // Validate effect exists in library (for meta info)
  let meta;
  try {
    meta = await loadMeta(effectId);
  } catch {
    console.error(`\n${RED}Error:${RESET} Effect "${effectId}" not found in library.`);
    process.exit(1);
  }

  const target = resolve(targetDir);
  const normalized = target.replace(/\/+$/, "");
  const base = basename(normalized);
  const root = ["effects", "hooks", "css", "presets"].includes(base) ? dirname(normalized) : normalized;
  const effectsTarget = join(root, "effects", effectId);

  if (!existsSync(effectsTarget)) {
    console.error(`\n${RED}Error:${RESET} Effect "${effectId}" not found at ${effectsTarget}\n`);
    process.exit(1);
  }

  console.log(`\n${BOLD}ui-fx-kit remove${RESET} ${CYAN}${meta.name}${RESET}${dryRun ? ` ${YELLOW}(dry run)${RESET}` : ""}\n`);

  // 1. Remove effect directory
  const { rm } = await import("fs/promises");
  const effectFiles = await readdir(effectsTarget);
  for (const file of effectFiles) {
    console.log(`  ${RED}-${RESET} effects/${effectId}/${file}`);
  }
  if (!dryRun) {
    await rm(effectsTarget, { recursive: true });
  }

  // Clean manifest
  const projectRoot = findProjectRoot(root);
  const manifestDir = projectRoot || root;
  const manifestPath = join(manifestDir, ".ui-fx-kit.json");
  if (existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
      delete manifest.effects[effectId];
      if (!dryRun) {
        await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
      }
    } catch { /* ignore */ }
  }

  // 2. Check which hooks are still needed by remaining effects
  const remainingEffectsDir = join(root, "effects");
  if (existsSync(remainingEffectsDir)) {
    const remainingDirs = await readdir(remainingEffectsDir, { withFileTypes: true });
    const stillUsedHooks = new Set();
    for (const dir of remainingDirs) {
      if (!dir.isDirectory()) continue;
      const metaPath = join(remainingEffectsDir, dir.name, "meta.json");
      try {
        const m = JSON.parse(await readFile(metaPath, "utf-8"));
        (m.hooks || []).forEach(h => stillUsedHooks.add(h));
      } catch { /* skip */ }
    }

    // Clean hooks/index.ts — remove exports for hooks no longer used
    const indexPath = join(root, "hooks", "index.ts");
    if (existsSync(indexPath)) {
      const content = await readFile(indexPath, "utf-8");
      const removedHooks = (meta.hooks || []).filter(h => !stillUsedHooks.has(h));
      if (removedHooks.length > 0) {
        let newContent = content;
        for (const hook of removedHooks) {
          const file = hook === "proximity" ? "useProximity" : hook;
          const re = new RegExp(`^export\\s+\\{\\s*${hook}\\s*\\}\\s+from\\s+[\"']./${file}[\"'];?\\n?`, "m");
          newContent = newContent.replace(re, "");
        }
        if (newContent !== content) {
          console.log(`\n${BOLD}Hooks index:${RESET}`);
          for (const h of removedHooks) {
            console.log(`  ${RED}-${RESET} export { ${h} } ${DIM}(no longer used)${RESET}`);
          }
          if (!dryRun) {
            await writeFile(indexPath, newContent);
          }
        }
      }
    }
  }

  if (dryRun) {
    console.log(`\n${YELLOW}${BOLD}Dry run complete.${RESET} No files were deleted.\n`);
  } else {
    console.log(`\n${GREEN}${BOLD}Removed.${RESET}\n`);
  }
}

async function cmdStatus(targetDir) {
  const target = resolve(targetDir || ".");
  const normalized = target.replace(/\/+$/, "");
  const base = basename(normalized);
  const root = ["effects", "hooks", "css", "presets"].includes(base) ? dirname(normalized) : normalized;
  const projectRoot = findProjectRoot(root);
  const manifestDir = projectRoot || root;
  const manifestPath = join(manifestDir, ".ui-fx-kit.json");

  if (!existsSync(manifestPath)) {
    console.log(`\n${DIM}No effects installed (no .ui-fx-kit.json found).${RESET}\n`);
    return;
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
  const effects = Object.entries(manifest.effects || {});

  if (effects.length === 0) {
    console.log(`\n${DIM}No effects installed.${RESET}\n`);
    return;
  }

  // Get latest version from npm
  let latestVersion = null;
  try {
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(execFile);
    const { stdout: ver } = await execAsync("npm", ["view", "ui-fx-kit", "version"], { timeout: 5000 });
    latestVersion = ver.trim();
  } catch {
    latestVersion = null;
  }

  console.log(`\n${BOLD}ui-fx-kit status${RESET}\n`);

  if (latestVersion) {
    console.log(`${DIM}Latest version: ${latestVersion}${RESET}\n`);
  }

  for (const [id, info] of effects) {
    const fromVer = info.fromPackageVersion || "unknown";
    const hasUpdate = latestVersion && fromVer !== latestVersion;
    const arrow = hasUpdate ? ` ${YELLOW}→ ${latestVersion} ⬆${RESET}` : ` ${GREEN}✓${RESET}`;
    console.log(`  ${BOLD}${id}${RESET}  ${DIM}${fromVer}${RESET}${arrow}`);
  }

  console.log();
  if (latestVersion && effects.some(([, info]) => info.fromPackageVersion !== latestVersion)) {
    console.log(`${DIM}Run ${CYAN}npx ui-fx-kit add <effect> --target <dir> --force${RESET}${DIM} to update.${RESET}\n`);
  }
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
  ${CYAN}add${RESET} <name> [--target dir] [--force] [--dry-run]  Add an effect to your project
  ${CYAN}remove${RESET} <name> --target dir [--dry-run]  Remove an effect from your project
  ${CYAN}info${RESET} <name>                   Show effect details and dependencies
  ${CYAN}status${RESET} [--target dir]              Show installed effects and available updates

${BOLD}Examples:${RESET}
  npx ui-fx-kit list
  npx ui-fx-kit list background
  npx ui-fx-kit add holographic-card
  npx ui-fx-kit add gradient-mesh --target ./src
  npx ui-fx-kit add scramble-text --target ./src --dry-run
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
  if (!flags.target) {
    console.error(`\n${RED}Error:${RESET} --target is required.`);
    console.log(`Use: npx ui-fx-kit add ${effectNames[0]} --target ./src\n`);
    process.exit(1);
  }
  const targetDir = flags.target;
  if (targetDir.startsWith("-")) {
    console.error(`\n${RED}Error:${RESET} Invalid target directory "${targetDir}".`);
    console.log(`Use: npx ui-fx-kit add ${effectNames[0]} --target ./src\n`);
    process.exit(1);
  }
  const dryRun = flags["dry-run"] === true;
  const force = flags["force"] === true;
  for (const name of effectNames) {
    await cmdAdd(name, targetDir, { dryRun, force });
    if (effectNames.length > 1) console.log(`${DIM}${"─".repeat(50)}${RESET}\n`);
  }
} else if (command === "remove" || command === "rm") {
  if (!positional[1]) {
    console.error(`\n${RED}Usage:${RESET} npx ui-fx-kit remove <effect-name> --target dir\n`);
    process.exit(1);
  }
  if (!flags.target) {
    console.error(`\n${RED}Error:${RESET} --target is required.`);
    console.log(`Use: npx ui-fx-kit remove ${positional[1]} --target ./src\n`);
    process.exit(1);
  }
  const dryRun = flags["dry-run"] === true;
  await cmdRemove(positional[1], flags.target, { dryRun });
} else if (command === "status") {
  await cmdStatus(flags.target);
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
