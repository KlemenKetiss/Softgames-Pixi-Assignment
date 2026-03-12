import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: '/Softgames-Pixi-Assignment/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

