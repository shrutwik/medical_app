# Medical Study Hub — project handbook

Single source of truth for humans and coding agents: product intent, architecture, data rules, workflows, and how to work effectively in this repo.

---

## 1. Product intent

- **What it is:** A production-oriented medical education app: **mobile-first** (React Native / Expo), **also on web**.
- **Learning shape:** Case-based curriculum: **System → Condition → Case → sections / resources / quiz** (and related content types in the dataset).
- **Scale:** Designed to grow to a full curriculum, not a single-module demo.

### Learner workflow (implemented)

1. **Home** — Resume recent activity or pick a study track (system).
2. **Track (system)** — Pick a condition; optional shortcut to first condition.
3. **Condition** — See cases; resume or start a case.
4. **Case** — Tabbed workspace (overview, clinical detail when present, sections, mechanisms, resources, quiz). Desktop web (viewport ≥ 1100px): app shell with **Home / Admin**, **breadcrumbs**, vertical **StudyNav** rail; **Track** jumps to parent system; last tab offers **next case in same condition** or **back to cases**.

### Agent / contributor rules (non-negotiable)

1. Do not generate unnecessary code or speculative features.
2. **Do not hardcode medical or case-specific copy in UI** — all learner-facing clinical content comes from data (Firestore, imported JSON, admin-loaded dataset).
3. All curriculum data is loaded **dynamically** via the content repository (local seed / AsyncStorage or Firebase when configured).
4. Build **only** what is requested; prefer small, reviewable diffs.
5. No fake APIs or placeholder “demo” logic beyond explicit local admin/demo paths.
6. If requirements are unclear, **ask** instead of guessing.

### Code quality

- One clear responsibility per file; avoid files over ~300 lines when practical.
- **UI** does not own business rules; **services** do not render UI.
- Reuse components and theme tokens; avoid duplicate layout magic numbers.
- No premature abstraction; no drive-by refactors outside the task.

---

## 2. Architecture

### Repository layout

```text
medical_app/
├── frontend/          # Expo app (Expo Router)
│   ├── app/           # Routes / screens
│   ├── components/    # Reusable UI
│   ├── services/      # Content, progress, storage, auth
│   ├── types/         # TypeScript models
│   ├── constants/     # Theme / layout tokens
│   ├── contexts/
│   ├── hooks/
│   ├── imports/       # Content batches (working / output / report)
│   └── scripts/       # import-content.mjs
├── backend/           # Reserved for future API (currently placeholders)
└── PROJECT.md         # This file
```

### Layers

| Layer | Location | Responsibility |
|--------|-----------|----------------|
| UI routes | `frontend/app/` | Screens, navigation |
| Components | `frontend/components/` | Cards, study UI, admin, layout |
| Services | `frontend/services/` | Firestore, local dataset, progress, storage |
| Types | `frontend/types/` | System, Case, Quiz, etc. |

**Rules:** Frontend and backend stay separate; all IO goes through **services**.

### Content source

- **Local mode (default):** Merged dataset in storage under `medical-app/content/v1`, seeded from `frontend/mock/*.json`.
- **Firebase mode:** When `EXPO_PUBLIC_FIREBASE_*` env vars are set, `getContentRepository()` uses Firestore collections aligned with the dataset shape.
- **Admin:** `/admin` — sign-in (Firebase or local demo on localhost / env); edit or replace dataset; load static import batches from the repo.

### Progress

- Stored locally (`medical-app/progress/v1`): tabs, section completion, quiz attempts, bookmarks, streak, recent activity. Not synced to Firestore in current code.

---

## 3. Data model (summary)

Flat, ID-linked entities (no deep nesting in one document):

- **System** — `id`, `name`
- **Condition** — `id`, `systemId`, `name`, summary, learning goals, …
- **Case** — `id`, `conditionId`, `title`, `shortDescription`, `difficulty`, `tags`, optional `publishStatus` (admin)
- **CaseDetail**, **Section**, **Mechanism**, **Resource**, **QuizQuestion**, **StudyCheckpoint** — keyed by `caseId` or own `id` per types

**Figures (optional, data-only):** Sections may include `illustrations[]` (`url`, `caption`) and/or `![caption](https://…)` in `content`. Mechanisms may include `diagramUrl` / `diagramCaption` and per-step `illustrationUrl`. Resources may include `thumbnailUrl`. The importer accepts `illustrations`, `illustrationUrl`, `diagramUrl`, `thumbnailUrl`, and step-level illustration fields on source items. All URLs must be `http(s)`; the app does not ship fixed medical images in code.

Firestore-style collection names used in code: `systems`, `conditions`, `cases`, `caseDetails`, `sections`, `mechanisms`, `resources`, `quizzes`, `checkpoints`.

**Rules:** Prefer flat documents and IDs over deep trees; schema stays extensible for new section/media types.

---

## 4. Roadmap (documentation vs code)

**Original MVP doc:** system, condition, case list, case detail with sections and quiz.

**Current code** also includes local progress, streaks, bookmarks, admin workspace, content import pipeline, and desktop shell — the **implementation is ahead** of the oldest roadmap bullets. When adding features, still prefer **minimal, requested scope** and avoid shipping flashcards, complex animations, product analytics, or full auth unless explicitly planned.

---

## 5. Content import workflow

Use when raw material must be grouped into systems, conditions, and cases.

### Batch folder (`frontend/imports/<batch-name>/`)

| Folder | Purpose |
|--------|---------|
| `source/` | Raw inputs (docs, sheets, exports) |
| `working/` | JSON mapping sheets the importer reads |
| `output/` | Generated `content-dataset.json` and per-entity JSON |
| `report/` | `import-report.json` and regenerated `import-report.md` (from `npm run import:content`) |

### Required `working/` files

- `import_batch.json`, `systems.json`, `conditions.json`, `cases.json`, `case_details.json`, `source_items.json`

`source_items.json` maps items into sections, quizzes, checkpoints, resources, mechanisms.

### Commands

```bash
cd frontend
npm run import:content -- imports/<batch-name>
# optional: npm run import:content -- imports/<batch-name> --sync-mock
```

### Mapping rules (short)

- Per-item `caseRef` when tied to one case; omit `caseRef` for condition-only items (importer may attach to foundation case).
- Unresolved items land in the report.
- Resources v1: metadata-first; use `externalUrl` / `assetKey` until assets are hosted.

After a successful run, review `output/content-dataset.json` and `report/import-report.md`, then load via admin or sync mock if desired.

---

## 6. UI / UX principles

- **Mobile-first:** Touch-friendly targets, readable type, vertical flow by default.
- **Desktop web:** Max-width content, centered column or split home layout; persistent shell and breadcrumbs when width ≥ 1100px.
- **Navigation:** Clear back links, breadcrumb trail on desktop, minimal depth.
- **Performance:** Lazy-friendly data loading; avoid unnecessary re-renders (no premature optimization theater).
- **Motion:** `react-native-reanimated` drives short entrance animations (staggered topic lists, study nav segments, case tab content fades). Keep durations modest; prefer layout-preserving fades over distracting loops.
- **Figures:** `expo-image` renders remote HTTPS illustrations from the dataset; failed loads show a neutral fallback. Related PDFs/links for a section type appear as an inline “Related sources” strip on that section tab.

Design tokens live in `frontend/constants/theme.ts` (`colors`, `layout`, `shadows`, `typography`). Motion wrappers live in `frontend/components/motion/`. Media helpers live in `frontend/components/media/` and `frontend/services/content/sectionMedia.ts`.

---

## 7. Prompting agents (effective habits)

**Do**

- Point to a specific file or screen.
- One feature or bug per request.
- Ask for the smallest change that satisfies the requirement.

**Avoid**

- “Build the whole app” / “add everything” / vague “make it advanced.”

**If an agent drifts**

> Follow PROJECT.md strictly. Remove unnecessary code and stay within scope.

**If unsure**

> What is the minimal implementation for this?

---

## 8. Runbook

```bash
cd frontend
npm install
npm start          # Expo dev server
npm run web        # Web
npm run ios        # iOS simulator
npm run android    # Android emulator
```

Firebase: set `EXPO_PUBLIC_FIREBASE_*` variables. Admin demo password: `EXPO_PUBLIC_ADMIN_DEMO_PASSWORD` or localhost defaults per `frontend/services/auth/firebase.ts`.

---

## 9. Document maintenance

- **This file** replaces former split docs (`AGENTS.md`, `ARCHITECTURE.md`, `PROJECT_RULES.md`, `DATA_MODEL.md`, `ROADMAP.md`, `PROMPT_RULES.md`, `frontend/imports/README.md`).
- Import batches may regenerate **`report/import-report.md`** when you run the importer; that file is **generated**, not hand-edited policy.
- When process or architecture changes, update **this file** in the same PR as the code change.
