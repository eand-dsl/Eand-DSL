import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// e& Design System playground — Subzero-style catalog. Renders the real web-React
// components as live previews and shows the native (SwiftUI/Compose) + React code.
export default defineConfig({
  root: __dirname,
  base: './',
  plugins: [react()],
  server: { fs: { allow: [resolve(__dirname, '../../..')] } },
  build: { outDir: 'dist', emptyOutDir: true },
});
