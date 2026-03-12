import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  // Match Pixelated-Slot-Game behavior (Parcel publicUrl: "./")
  // so built asset paths are relative instead of absolute.
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

