import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standalone app build of the demo Home screen (renders the package components).
export default defineConfig({
  root: __dirname,
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
});
