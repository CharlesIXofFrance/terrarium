import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Connect } from 'vite';

// https://vitejs.dev/config/
import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define environment variables for TypeScript
declare global {
  interface ImportMetaEnv {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    [key: string]: string;
  }
}

// Custom middleware types
type CustomMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction
) => void;

// Security headers middleware
const securityHeaders: CustomMiddleware = (_req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  next();
};

// Platform subdomain middleware
const platformMiddleware: CustomMiddleware = (req, _res, next) => {
  const host = req.headers.host || '';
  const isPlatformSubdomain =
    host.startsWith('platform.') ||
    (req.url &&
      new URL(req.url, `http://${host}`).searchParams.get('subdomain') ===
        'platform');

  if (isPlatformSubdomain) {
    // Add platform flag to the request
    (req as any).isPlatform = true;
  }
  next();
};

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: true,
    watch: {
      usePolling: true,
    },
    strictPort: true,
    cors: true,
    proxy: {
      // Proxy API requests to Supabase
      '^/auth/v1/.*': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Preserve original headers
            proxyReq.setHeader('X-Forwarded-Host', req.headers.host || '');
            if ((req as any).isPlatform) {
              proxyReq.setHeader('X-Platform', 'true');
            }
          });
        },
      },
      '^/rest/v1/.*': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '^/storage/v1/.*': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Handle platform subdomain
      '^/platform/.*': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/platform/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('X-Forwarded-Host', req.headers.host || '');
            if ((req as any).isPlatform) {
              proxyReq.setHeader('X-Platform', 'true');
            }
          });
        },
      },
    },
  },
  define: {
    __DEFINES__: {},
    'process.env': process.env,
  },
  plugins: [
    {
      name: 'log-server',
      configureServer(server) {
        // Add platform middleware first
        server.middlewares.use(platformMiddleware);
        // Add security headers
        server.middlewares.use(securityHeaders);

        // Add logging endpoint
        server.middlewares.use('/api/__log', (req, res) => {
          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => {
              const data = JSON.parse(Buffer.concat(chunks).toString());
              fs.appendFileSync(path.join(logsDir, 'browser.log'), data.entry);
              res.end('ok');
            });
          } else {
            res.statusCode = 405;
            res.end('method not allowed');
          }
        });
      },
    },
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
        ],
      },
    }),
    tsconfigPaths(),
  ],
  css: {
    postcss: './postcss.config.js',
    modules: {
      localsConvention: 'camelCase',
    },
  },
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
    sourcemap: true,
    target: 'esnext',
    cssCodeSplit: true,
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
    esbuildOptions: {
      target: 'esnext',
    },
  },
});
