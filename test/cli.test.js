import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { existsSync } from "node:fs";

const exec = promisify(execFile);
const CLI = join(import.meta.dirname, "..", "bin", "cli.js");

function run(args) {
  return exec("node", [CLI, ...args], { timeout: 10000 });
}

// ── list ────────────────────────────────────────────────

describe("list", () => {
  it("lists effects", async () => {
    const { stdout } = await run(["list"]);
    assert.match(stdout, /holographic-card/);
    assert.match(stdout, /cursor-glow/);
  });

  it("filters by tag", async () => {
    const { stdout } = await run(["list", "canvas"]);
    assert.match(stdout, /aurora-bg/);
  });
});

// ── info ────────────────────────────────────────────────

describe("info", () => {
  it("shows effect details with hooks and CSS", async () => {
    const { stdout } = await run(["info", "holographic-card"]);
    assert.match(stdout, /Holographic Card/);
    assert.match(stdout, /useTilt3D/);
    assert.match(stdout, /holographic\.css/);
  });

  it("fails for unknown effect", async () => {
    await assert.rejects(() => run(["info", "nonexistent"]), /not found/);
  });
});

// ── add ─────────────────────────────────────────────────

describe("add", () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "uifx-test-"));
  });

  after(async () => {
    // cleanup handled per test
  });

  it("requires --target", async () => {
    await assert.rejects(() => run(["add", "aurora-bg"]), /--target is required/);
  });

  it("fails for unknown effect", async () => {
    await assert.rejects(() => run(["add", "nonexistent", "--target", tmpDir]), /not found/);
  });

  it("adds effect with hooks and CSS", async () => {
    await run(["add", "holographic-card", "--target", tmpDir]);

    // Effect files exist
    assert.ok(existsSync(join(tmpDir, "effects", "holographic-card", "HolographicCard.tsx")));
    assert.ok(existsSync(join(tmpDir, "effects", "holographic-card", "meta.json")));

    // Hooks copied
    assert.ok(existsSync(join(tmpDir, "hooks", "useTilt3D.ts")));
    assert.ok(existsSync(join(tmpDir, "hooks", "useMousePosition.ts")));
    assert.ok(existsSync(join(tmpDir, "hooks", "useCanvasSetup.ts")));
    assert.ok(existsSync(join(tmpDir, "hooks", "useParticles.ts")));

    // hooks/index.ts has exports
    const index = await readFile(join(tmpDir, "hooks", "index.ts"), "utf-8");
    assert.match(index, /export.*useTilt3D/);
    assert.match(index, /export.*useMousePosition/);

    // CSS copied
    assert.ok(existsSync(join(tmpDir, "css", "holographic.css")));

    await rm(tmpDir, { recursive: true });
  });

  it("rewrites import paths correctly", async () => {
    await run(["add", "holographic-card", "--target", tmpDir]);

    const code = await readFile(
      join(tmpDir, "effects", "holographic-card", "HolographicCard.tsx"),
      "utf-8"
    );
    // Should have ../../hooks (from effects/holographic-card/ to hooks/)
    assert.match(code, /from\s+["']\.\.\/\.\.\/hooks["']/);

    await rm(tmpDir, { recursive: true });
  });

  it("--target ending with effects/ does not double-nest", async () => {
    const effectsDir = join(tmpDir, "effects");
    await mkdir(effectsDir, { recursive: true });
    await run(["add", "aurora-bg", "--target", effectsDir]);

    // Should be at tmpDir/effects/aurora-bg, not tmpDir/effects/effects/aurora-bg
    assert.ok(existsSync(join(tmpDir, "effects", "aurora-bg", "AuroraBg.tsx")));
    assert.ok(!existsSync(join(tmpDir, "effects", "effects")));

    await rm(tmpDir, { recursive: true });
  });

  it("--target with trailing slash works", async () => {
    await run(["add", "aurora-bg", "--target", tmpDir + "/"]);

    assert.ok(existsSync(join(tmpDir, "effects", "aurora-bg", "AuroraBg.tsx")));

    await rm(tmpDir, { recursive: true });
  });

  it("hooks are idempotent — second add skips existing hooks", async () => {
    await run(["add", "aurora-bg", "--target", tmpDir]);
    const hookBefore = await readFile(join(tmpDir, "hooks", "useCanvasSetup.ts"), "utf-8");

    // Modify the hook file
    await writeFile(join(tmpDir, "hooks", "useCanvasSetup.ts"), "// user modified\n" + hookBefore);

    // Add another effect that uses the same hook
    await run(["add", "cursor-glow", "--target", tmpDir]);

    // Hook should NOT be overwritten
    const hookAfter = await readFile(join(tmpDir, "hooks", "useCanvasSetup.ts"), "utf-8");
    assert.ok(hookAfter.startsWith("// user modified"));

    await rm(tmpDir, { recursive: true });
  });

  it("hooks/index.ts merge preserves existing content", async () => {
    // Create existing index.ts with custom content
    await mkdir(join(tmpDir, "hooks"), { recursive: true });
    await writeFile(
      join(tmpDir, "hooks", "index.ts"),
      'export { useSpring } from "./useSpring";\nexport type { SpringConfig } from "./useSpring";\n'
    );

    await run(["add", "aurora-bg", "--target", tmpDir]);

    const index = await readFile(join(tmpDir, "hooks", "index.ts"), "utf-8");
    // Original content preserved
    assert.match(index, /export.*useSpring/);
    assert.match(index, /export type.*SpringConfig/);
    // New export appended
    assert.match(index, /export.*useCanvasSetup/);

    await rm(tmpDir, { recursive: true });
  });

  it("creates .ui-fx-kit.json manifest on add", async () => {
    await writeFile(join(tmpDir, "package.json"), '{"name":"test"}');
    await run(["add", "cursor-glow", "--target", join(tmpDir, "src")]);
    const manifest = JSON.parse(
      await readFile(join(tmpDir, ".ui-fx-kit.json"), "utf-8")
    );
    assert.equal(manifest.version, 1);
    assert.ok(manifest.effects["cursor-glow"]);
    assert.equal(typeof manifest.effects["cursor-glow"].fromPackageVersion, "string");
    assert.equal(typeof manifest.effects["cursor-glow"].installedAt, "string");
    assert.ok(Array.isArray(manifest.effects["cursor-glow"].hooks));

    await rm(tmpDir, { recursive: true });
  });

  it("merges manifest when adding second effect", async () => {
    await writeFile(join(tmpDir, "package.json"), '{"name":"test"}');
    await run(["add", "cursor-glow", "--target", join(tmpDir, "src")]);
    await run(["add", "glitch-text", "--target", join(tmpDir, "src")]);
    const manifest = JSON.parse(
      await readFile(join(tmpDir, ".ui-fx-kit.json"), "utf-8")
    );
    assert.ok(manifest.effects["cursor-glow"]);
    assert.ok(manifest.effects["glitch-text"]);

    await rm(tmpDir, { recursive: true });
  });

  it("--force overwrites existing hook files", async () => {
    await run(["add", "cursor-glow", "--target", tmpDir]);
    // Modify a hook file
    const hookPath = join(tmpDir, "hooks", "useMousePosition.ts");
    await writeFile(hookPath, "// user modified");
    // Re-add with --force
    await run(["add", "cursor-glow", "--target", tmpDir, "--force"]);
    const content = await readFile(hookPath, "utf-8");
    assert.notEqual(content, "// user modified");

    await rm(tmpDir, { recursive: true });
  });

  it("injects 'use client' when next.config.js exists", async () => {
    await mkdir(tmpDir, { recursive: true });
    await writeFile(join(tmpDir, "package.json"), '{"name":"test"}');
    await writeFile(join(tmpDir, "next.config.js"), "module.exports = {}");
    await run(["add", "cursor-glow", "--target", join(tmpDir, "src")]);
    const effectFile = (await readdir(join(tmpDir, "src", "effects", "cursor-glow")))
      .find(f => f.endsWith(".tsx"));
    const content = await readFile(
      join(tmpDir, "src", "effects", "cursor-glow", effectFile), "utf-8"
    );
    assert.match(content, /^['"]use client['"];?\s*\n/);

    await rm(tmpDir, { recursive: true });
  });

  it("does NOT inject 'use client' without next.config", async () => {
    await run(["add", "cursor-glow", "--target", tmpDir]);
    const effectFile = (await readdir(join(tmpDir, "effects", "cursor-glow")))
      .find(f => f.endsWith(".tsx"));
    const content = await readFile(
      join(tmpDir, "effects", "cursor-glow", effectFile), "utf-8"
    );
    assert.doesNotMatch(content, /use client/);

    await rm(tmpDir, { recursive: true });
  });

  it("batch add works", async () => {
    await run(["add", "aurora-bg", "typewriter-text", "--target", tmpDir]);

    assert.ok(existsSync(join(tmpDir, "effects", "aurora-bg", "AuroraBg.tsx")));
    assert.ok(existsSync(join(tmpDir, "effects", "typewriter-text", "TypewriterText.tsx")));

    await rm(tmpDir, { recursive: true });
  });
});

// ── dry-run ─────────────────────────────────────────────

describe("dry-run", () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "uifx-dry-"));
  });

  it("does not create any files", async () => {
    await run(["add", "holographic-card", "--target", tmpDir, "--dry-run"]);

    assert.ok(!existsSync(join(tmpDir, "effects")));
    assert.ok(!existsSync(join(tmpDir, "hooks")));
    assert.ok(!existsSync(join(tmpDir, "css")));

    await rm(tmpDir, { recursive: true });
  });

  it("output says dry run", async () => {
    const { stdout } = await run(["add", "aurora-bg", "--target", tmpDir, "--dry-run"]);
    assert.match(stdout, /dry run/i);
    assert.match(stdout, /would copy/);

    await rm(tmpDir, { recursive: true });
  });
});

// ── remove ──────────────────────────────────────────────

describe("remove", () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "uifx-rm-"));
  });

  it("removes effect directory", async () => {
    await run(["add", "aurora-bg", "--target", tmpDir]);
    assert.ok(existsSync(join(tmpDir, "effects", "aurora-bg")));

    await run(["remove", "aurora-bg", "--target", tmpDir]);
    assert.ok(!existsSync(join(tmpDir, "effects", "aurora-bg")));

    await rm(tmpDir, { recursive: true });
  });

  it("cleans unused hook exports from index.ts", async () => {
    await run(["add", "aurora-bg", "--target", tmpDir]);
    const indexBefore = await readFile(join(tmpDir, "hooks", "index.ts"), "utf-8");
    assert.match(indexBefore, /useCanvasSetup/);

    await run(["remove", "aurora-bg", "--target", tmpDir]);
    const indexAfter = await readFile(join(tmpDir, "hooks", "index.ts"), "utf-8");
    assert.ok(!indexAfter.includes("useCanvasSetup"));

    await rm(tmpDir, { recursive: true });
  });

  it("keeps shared hook exports when other effects use them", async () => {
    await run(["add", "cursor-glow", "holographic-card", "--target", tmpDir]);
    // Both use useCanvasSetup, useMousePosition, useParticles

    await run(["remove", "cursor-glow", "--target", tmpDir]);
    const index = await readFile(join(tmpDir, "hooks", "index.ts"), "utf-8");
    // These are still used by holographic-card
    assert.match(index, /useCanvasSetup/);
    assert.match(index, /useMousePosition/);
    assert.match(index, /useParticles/);

    await rm(tmpDir, { recursive: true });
  });

  it("remove --dry-run does not delete files", async () => {
    await run(["add", "aurora-bg", "--target", tmpDir]);
    await run(["remove", "aurora-bg", "--target", tmpDir, "--dry-run"]);

    // Should still exist
    assert.ok(existsSync(join(tmpDir, "effects", "aurora-bg")));

    await rm(tmpDir, { recursive: true });
  });

  it("fails for effect not installed", async () => {
    await assert.rejects(
      () => run(["remove", "aurora-bg", "--target", tmpDir]),
      /not found/
    );

    await rm(tmpDir, { recursive: true });
  });

  it("requires --target", async () => {
    await assert.rejects(() => run(["remove", "aurora-bg"]), /--target is required/);
  });

  it("removes effect from manifest on remove", async () => {
    await writeFile(join(tmpDir, "package.json"), '{"name":"test"}');
    await run(["add", "cursor-glow", "--target", join(tmpDir, "src")]);
    await run(["add", "glitch-text", "--target", join(tmpDir, "src")]);
    await run(["remove", "cursor-glow", "--target", join(tmpDir, "src")]);
    const manifest = JSON.parse(
      await readFile(join(tmpDir, ".ui-fx-kit.json"), "utf-8")
    );
    assert.equal(manifest.effects["cursor-glow"], undefined);
    assert.ok(manifest.effects["glitch-text"]);

    await rm(tmpDir, { recursive: true });
  });
});

// ── status ──────────────────────────────────────────────

describe("status", () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "uifx-test-"));
  });

  it("shows installed effects from manifest", async () => {
    await writeFile(join(tmpDir, "package.json"), '{"name":"test"}');
    await run(["add", "cursor-glow", "--target", join(tmpDir, "src")]);
    const { stdout } = await run(["status", "--target", join(tmpDir, "src")]);
    assert.match(stdout, /cursor-glow/);

    await rm(tmpDir, { recursive: true });
  });

  it("reports no manifest found", async () => {
    const { stdout } = await run(["status", "--target", tmpDir]);
    assert.match(stdout, /No effects installed/i);

    await rm(tmpDir, { recursive: true });
  });
});
