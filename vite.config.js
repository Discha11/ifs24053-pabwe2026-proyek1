import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'disable-304-cache',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          delete req.headers['if-none-match'];
          delete req.headers['if-modified-since'];
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          next();
        });
      }
    },
    {
      name: 'inline-css-plugin',
      enforce: 'post',
      generateBundle(options, bundle) {
        let cssCode = '';
        for (const [fileName, asset] of Object.entries(bundle)) {
          if (fileName.endsWith('.css') && asset.type === 'asset') {
            cssCode += asset.source;
          }
        }
        const htmlAsset = bundle['index.html'];
        if (htmlAsset && cssCode) {
          htmlAsset.source = htmlAsset.source.replace(
            /<link rel="stylesheet"[^>]*href="[^"]+\.css"[^>]*>/g,
            `<style>${cssCode}</style>`
          );
        }
      }
    }
  ],
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
    }
  },
  server: {
    port: 5173,
    host: true,
    cors: true
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', 'frontend/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**'],
      exclude: ['src/main.jsx', 'src/**/*.test.{js,jsx}', 'frontend/**']
    }
  }
});
