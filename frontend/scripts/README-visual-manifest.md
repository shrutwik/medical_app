# Offline AI visual manifest

- **Schema:** [`visual-manifest.schema.json`](./visual-manifest.schema.json) — describes targets (section illustration, mechanism diagram, etc.), prompts, and optional `output` (image URL, hotspots, animation metadata).
- **Scaffold:** [`generate-visual-manifest.mjs`](./generate-visual-manifest.mjs) — `node scripts/generate-visual-manifest.mjs --init` writes a sample under `mock/visual_manifest.sample.json`.

**Workflow (intended):**

1. Author or generate a manifest with `output` filled by your chosen AI/offline pipeline.
2. Merge results into curriculum JSON (`sections.json` / `source_items.json`) or import batches using the same hotspot/animation fields as [`import-content.mjs`](./import-content.mjs).
3. App reads `SectionIllustration` / `Mechanism` types with optional `hotspots` and `animation`.

Provider-specific API calls are intentionally **not** included; swap in your generator behind the manifest contract.
