import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Keep primitive checks in a browser-like DOM without coupling the test setup
 * to public-site routes or application-wide providers.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(process.cwd()),
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxInject: "import React from 'react';",
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.{js,jsx}'],
  },
});
