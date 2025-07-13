import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ['dev.rubberducktarot.app'],
  },
  plugins: [
    react(),
    ViteImageOptimizer({
      png: {
        quality: 80,
        compressionLevel: 9,
        force: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  // Asset handling
  build: {
    assetsInlineLimit: 4096, // Inline small assets (4KB), keep larger ones separate
    rollupOptions: {
      output: {
        // Organize assets by type
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/mp4|webm|gif|jpg|jpeg|png|svg/.test(ext || '')) {
            return `assets/media/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
});
