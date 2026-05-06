import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        // webui transitively imports next-intl which imports the bare
        // `next/navigation` specifier — Node's strict ESM resolver can't
        // follow next's exports map for that path under .pnpm. Inlining
        // routes the chain through Vite so vi.mock applies and the alias
        // resolves correctly.
        inline: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
