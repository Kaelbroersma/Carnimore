import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion': ['framer-motion'],
          'ui': ['lucide-react', 'react-day-picker', 'react-virtualized'],
          'store': ['zustand'],
          'three': ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    },
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      }
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    reportCompressedSize: false
  },
  base: '/',
  publicDir: 'public',
  preview: {
    port: 4173,
  }
});