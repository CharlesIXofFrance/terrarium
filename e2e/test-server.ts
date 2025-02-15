import { createServer } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export async function setupTestServer() {
  // Create a Vite server specifically for testing
  const server = await createServer({
    configFile: false, // Don't load the default config
    root: resolve(__dirname, '..'),
    server: {
      port: 3001, // Use a different port for tests
      strictPort: true,
      hmr: false, // Disable HMR for tests
      watch: {
        ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
      }
    },
    plugins: [
      react(),
      tsconfigPaths()
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, '../src'),
        '@components': resolve(__dirname, '../src/components'),
        '@features': resolve(__dirname, '../src/features'),
        '@hooks': resolve(__dirname, '../src/hooks'),
        '@utils': resolve(__dirname, '../src/utils'),
        '@services': resolve(__dirname, '../src/services'),
        '@stores': resolve(__dirname, '../src/stores'),
        '@types': resolve(__dirname, '../src/types')
      }
    }
  });

  await server.listen();
  
  return {
    port: 3001,
    close: () => server.close()
  };
}
