#!/usr/bin/env node
/**
 * Extracts the OHIF viewer bundle into public/ohif/ if not already present.
 * Skips entirely if public/ohif/index.html already exists (bundle already extracted).
 * If ohif-bundle.tar.gz exists in the repo root, that local copy is used instead of
 * downloading from S3 — handy for testing a bundle before it's published.
 * Run via: npm run download-ohif
 */
import { existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const ohifDir = join(root, 'public', 'ohif');
const bundleUrl = 'https://myradimages-public-559947224974-us-east-2-an.s3.us-east-2.amazonaws.com/ohif/ohif-bundle.tar.gz';
const localTarPath = join(root, 'ohif-bundle.tar.gz');
const downloadedTarPath = join(root, 'public', 'ohif-bundle.tar.gz');

if (existsSync(join(ohifDir, 'index.html'))) {
  console.log('[download-ohif] OHIF bundle already present, skipping download.');
  process.exit(0);
}

mkdirSync(ohifDir, { recursive: true });

const useLocal = existsSync(localTarPath);
const tarPath = useLocal ? localTarPath : downloadedTarPath;

try {
  if (useLocal) {
    console.log('[download-ohif] Using local ohif-bundle.tar.gz from repo root.');
  } else {
    console.log('[download-ohif] Downloading OHIF bundle from S3...');
    execSync(`curl -fL --retry 3 --retry-delay 2 -o "${tarPath}" "${bundleUrl}"`, { stdio: 'inherit' });
  }
  console.log('[download-ohif] Extracting bundle...');
  // Extract into public/ — the tarball contains an ohif/ directory
  execSync(`tar -xzf "${tarPath}" -C "${join(root, 'public')}"`, { stdio: 'inherit' });
  if (!useLocal) {
    execSync(`rm -f "${tarPath}"`);
  }
  console.log('[download-ohif] OHIF bundle ready.');
} catch (err) {
  console.error('[download-ohif] Failed:', err.message);
  process.exit(1);
}
