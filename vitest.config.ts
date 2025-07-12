import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['src/**/*.test.{js,ts,tsx}'],
    typecheck: {
      tsconfig: 'tsconfig.test.json',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
