#!/usr/bin/env node
/**
 * Offline visual generation contract (scaffolding).
 * Future: plug in an image/animation provider; for now writes/validates manifest shape
 * and can merge `output` hints into source_items-style JSON for import-content.
 *
 * Usage:
 *   node scripts/generate-visual-manifest.mjs [--init path/to/visual_manifest.json]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, value) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`);
}

function createEmptyManifest() {
  return {
    manifestVersion: 1,
    generatedAt: new Date().toISOString(),
    provider: 'custom',
    items: [],
  };
}

function main() {
  const args = process.argv.slice(2);
  const initIdx = args.indexOf('--init');
  const outPath =
    initIdx !== -1 && args[initIdx + 1]
      ? path.resolve(args[initIdx + 1])
      : path.join(ROOT, 'mock', 'visual_manifest.sample.json');

  if (initIdx !== -1 || !fs.existsSync(outPath)) {
    const sample = createEmptyManifest();
    sample.items.push({
      target: { kind: 'sectionIllustration', id: 'asthma_pathology_section', caseId: 'asthma_foundation_case', illustrationIndex: 0 },
      prompt: 'Educational diagram: mast cell activation in allergic response, labels for IgE and mediators.',
      output: {
        imageUrl: 'https://example.com/placeholder.png',
        hotspots: [
          {
            id: 'mast_cell',
            label: 'Mast cell',
            description: 'IgE receptor cross-linking triggers degranulation.',
            shape: 'rect',
            rect: { x: 0.2, y: 0.25, w: 0.25, h: 0.35 },
          },
        ],
      },
    });
    writeJson(outPath, sample);
    console.log(`Wrote sample manifest: ${outPath}`);
    console.log('Schema: frontend/scripts/visual-manifest.schema.json');
    return;
  }

  const manifest = readJson(outPath, null);
  if (!manifest?.manifestVersion || !Array.isArray(manifest.items)) {
    console.error('Invalid manifest: expected manifestVersion and items[]');
    process.exit(1);
  }
  console.log(`Manifest OK: ${manifest.items.length} item(s) at ${outPath}`);
}

main();
