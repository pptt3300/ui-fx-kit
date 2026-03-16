import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['test/cli.test.js', 'node_modules/**', 'demo/**'],
  },
});
