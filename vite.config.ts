import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Add React Refresh for better development experience
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
        ],
      },
    }),
    // Support for TypeScript path aliases
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@features': resolve(__dirname, './src/features'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@services': resolve(__dirname, './src/services'),
      '@stores': resolve(__dirname, './src/stores'),
      '@types': resolve(__dirname, './src/types'),
    },
  },
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
    // Enable source maps for production builds
    sourcemap: true,
    // Improve build performance
    target: 'esnext',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Enable asset optimization
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'jotai',
      'lucide-react',
      '@radix-ui/react-tabs',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'chart.js',
      'react-chartjs-2',
    ],
    // Enable dependency optimization for development
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    // Enable HMR
    hmr: {
      overlay: true,
    },
    // Configure port
    port: 3000,
    // Enable CORS
    cors: true,
  },
  // Enable test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
