import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-tabs', 'lucide-react'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers/zod', 'zod'],
          'data-vendor': ['@tanstack/react-query', 'jotai'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'jotai',
      'lucide-react'
    ]
  },
  server: {
    watch: {
      usePolling: true
    }
  }
});