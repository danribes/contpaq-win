import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Set root to src/renderer where index.html is located
  root: path.resolve(__dirname, 'src/renderer'),

  // Base path for production builds
  base: './',

  build: {
    // Output to dist/renderer relative to project root
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,

    // Generate sourcemaps for debugging
    sourcemap: true,

    rollupOptions: {
      // Externalize electron and node modules
      external: ['electron', 'better-sqlite3'],
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@main': path.resolve(__dirname, 'src/main'),
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    exclude: ['electron', 'better-sqlite3'],
  },

  // Server configuration for development
  server: {
    port: 5173,
    strictPort: true,
  },
});
