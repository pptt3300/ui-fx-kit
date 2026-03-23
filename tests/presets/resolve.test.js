import { test } from "node:test";
import assert from "node:assert/strict";
import { resolvePalette } from "../../presets/resolve.ts";

test("returns fallback when palette is undefined", () => {
  const result = resolvePalette(undefined, "accent", [255, 0, 0]);
  assert.deepEqual(result, [255, 0, 0]);
});

test("returns fallback when palette name is invalid", () => {
  const result = resolvePalette("nonexistent", "accent", [255, 0, 0]);
  assert.deepEqual(result, [255, 0, 0]);
});

test("returns palette accent for valid palette", () => {
  const result = resolvePalette("neon", "accent", [255, 0, 0]);
  // neon accent is [57, 255, 20] per palettes.ts line 36
  assert.deepEqual(result, [57, 255, 20]);
});

test("returns palette particles array for array slot", () => {
  const result = resolvePalette("neon", "particles", [[0,0,0]]);
  assert.ok(Array.isArray(result));
  assert.ok(result.length >= 2);
});

test("returns palette background array for background slot", () => {
  const result = resolvePalette("default", "background", [[0,0,0]]);
  assert.ok(Array.isArray(result));
});
