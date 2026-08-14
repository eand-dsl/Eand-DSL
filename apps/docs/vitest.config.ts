import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Node-environment unit tests for the docs app's own logic (the finder engine). The
// component library has its own suite; this one exists because the finder moved here and
// would otherwise be covered by nothing — it is the live site's search.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
});
