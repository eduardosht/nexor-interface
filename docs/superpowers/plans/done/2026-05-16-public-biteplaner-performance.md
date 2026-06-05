# Public Biteplaner Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use Markdown checkbox syntax for tracking.

**Goal:** Reduce public Home and `/biteplaner` initial payload by automating image optimization and lazy-loading public route modules.

**Architecture:** Add a deterministic image optimization script that generates AVIF/WebP variants for the assets used by Home and `/biteplaner`. Consume generated assets through a small manifest module, then switch public routes to `React.lazy` so panel/admin code no longer ships in the public entry chunk.

**Tech Stack:** Vite, React, TypeScript, styled-components, Vitest, Sharp.

---

### Task 1: Optimized Asset Pipeline

**Files:**
- Create: `project/nexor/scripts/optimize-public-images.mjs`
- Create: `project/nexor/src/assets/publicOptimizedImages.ts`
- Modify: `project/nexor/package.json`
- Test: `project/nexor/src/assets/publicOptimizedImages.test.ts`

- [x] Write a failing Vitest test that verifies the public image manifest exposes AVIF/WebP URLs for Home and Biteplaner assets.
- [x] Add `sharp` and an `optimize:images` npm script.
- [x] Implement `scripts/optimize-public-images.mjs` with explicit source files, output widths, and formats.
- [x] Run `npm run optimize:images` and commit generated assets under `src/assets/generated/public`.
- [x] Run the manifest test and verify it passes.

### Task 2: Use Optimized Assets

**Files:**
- Modify: `project/nexor/src/sections/Hero/Hero.tsx`
- Modify: `project/nexor/src/sections/Hero/styles.ts`
- Modify: `project/nexor/src/sections/QuemSomos/styles.ts`
- Modify: `project/nexor/src/sections/Produtos/Produtos.tsx`
- Modify: `project/nexor/src/sections/Produtos/styles.ts`
- Modify: `project/nexor/src/sections/Depoimentos/Depoimentos.tsx`
- Modify: `project/nexor/src/sections/BiteplanerCard/BiteplanerCard.tsx`
- Modify: `project/nexor/src/pages/BiteplanerPage/index.tsx`
- Modify: `project/nexor/src/pages/BiteplanerPage/styles.ts`

- [x] Replace original PNG imports on Home and `/biteplaner` with manifest URLs.
- [x] Use responsive `image-set(...)` for CSS backgrounds.
- [x] Add explicit dimensions/loading hints to image elements.
- [x] Keep the Home hero video source unchanged, but add an optimized poster image.

### Task 3: Lazy Public Routes

**Files:**
- Modify: `project/nexor/src/routes/index.tsx`
- Test: `project/nexor/src/routes/index.test.tsx`

- [x] Write a failing test that verifies public page imports are lazy.
- [x] Convert public page imports to `React.lazy`.
- [x] Wrap public route elements in `Suspense`.
- [x] Run route tests.

### Task 4: Verification

**Files:**
- Verify only.

- [x] Run `npm run test:run`.
- [x] Run `npm run build`.
- [x] Compare asset/chunk sizes from build output against the original baseline.

**Status 2026-06-04:** Plano validado e movido para `done`. `npm run optimize:images` atualizou os assets gerados; `npm run verify:images` reportou diff porque esses binários ainda precisam ser aceitos no worktree. Testes focados e build passaram.
