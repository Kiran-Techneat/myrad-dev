import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Serves the self-contained OHIF viewer bundle (in public/ohif/) alongside the
// app. The viewer is a separate SPA loaded in an iframe at /ohif/viewer/...:
//  - dev: rewrite extension-less /ohif/* requests to /ohif/index.html so the
//    viewer's client-side routes resolve; also expose the in-memory manifest
//    store/get endpoints used during local testing.
//  - build: copy the OHIF config + branding + serve.json rewrites into dist/.
const manifestCache = new Map<string, string>();

const ohifRedirectPlugin = (): Plugin => ({
  name: 'ohif-redirect-plugin',
  closeBundle() {
    const distOhif = path.join(__dirname, 'dist/ohif');
    const copies: [string, string][] = [
      ['src/ohif/serve.json', 'dist/serve.json'],
      ['src/ohif/logo.png', `${distOhif}/logo.png`],
      ['src/ohif/app-config.js', `${distOhif}/app-config.js`],
    ];
    for (const [src, dest] of copies) {
      const srcPath = path.join(__dirname, src);
      if (fs.existsSync(srcPath)) fs.copyFileSync(srcPath, dest);
    }
  },
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url) {
        // Store manifest (dev testing helper)
        if (req.url.startsWith('/ohif-store-manifest')) {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            const urlObj = new URL(req.url!, `http://${req.headers.host}`);
            const id = urlObj.searchParams.get('id');
            if (id) {
              manifestCache.set(id, body);
            }
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ success: true }));
          });
          return;
        }

        // Retrieve manifest (dev testing helper)
        if (req.url.startsWith('/ohif-get-manifest')) {
          const urlObj = new URL(req.url, `http://${req.headers.host}`);
          const id = urlObj.searchParams.get('id');
          const manifest = id ? manifestCache.get(id) : null;
          if (manifest) {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            });
            res.end(manifest);
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Manifest not found');
          }
          return;
        }

        // 1. Extension-less /ohif/* paths are OHIF client-side routes → serve the
        //    viewer's index.html so its router can take over.
        if (req.url.startsWith('/ohif/')) {
          const urlWithoutParams = req.url.split('?')[0];
          const hasExtension = /\.[a-zA-Z0-9]+$/.test(urlWithoutParams);
          if (!hasExtension) {
            req.url = '/ohif/index.html' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
            next();
            return;
          }
        }

        // 2. Root-relative asset requested by the viewer (e.g. /assets/…) that
        //    actually lives under public/ohif/ → rewrite to the /ohif/ prefix.
        const urlWithoutParams = req.url.split('?')[0];
        if (urlWithoutParams !== '/' && urlWithoutParams !== '/index.html' && !urlWithoutParams.startsWith('/ohif/')) {
          const ohifFilePath = path.join(__dirname, 'public', 'ohif', urlWithoutParams);
          if (fs.existsSync(ohifFilePath)) {
            req.url = '/ohif' + req.url;
          }
        }
      }
      next();
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ohifRedirectPlugin()],
  assetsInclude: ['**/*.DCM', '**/*.dcm'],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Make design tokens available to every SCSS module without an explicit @use.
        additionalData: `@use "@/styles/abstracts" as *;\n`,
      },
    },
  },
});
