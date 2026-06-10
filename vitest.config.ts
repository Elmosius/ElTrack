import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    env: loadEnv('', process.cwd(), ''),
  },
});
