import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// npm run build puts the built studio in the repo's main folder, which GitHub Pages publishes
// (https://deltaowleyes.ca/bake-studio/). Relative paths keep it working in any folder.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { outDir: 'dist', emptyOutDir: true }
});
