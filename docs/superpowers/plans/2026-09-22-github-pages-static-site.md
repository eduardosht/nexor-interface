# GitHub Pages Static Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar somente a experiência institucional da NEXOR ADVANCE como um site estático em GitHub Pages no domínio `https://nexoradvance.com.br/`.

**Architecture:** Separar a entrada institucional e o router público do código autenticado/administrativo. O build público usará `BrowserRouter`, `base: '/'`, fallback `404.html` e deploy automatizado para GitHub Pages via GitHub Actions.

**Tech Stack:** React 19, React Router, Vite 8, TypeScript, Vitest, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-22-github-pages-static-site-design.md`

## Global Constraints

- O domínio publicado será `https://nexoradvance.com.br/`.
- O site publicado conterá somente as rotas institucionais definidas na especificação.
- O build público não poderá depender de API, Supabase, autenticação ou variáveis operacionais de backend.
- O Vite deverá gerar assets relativos à raiz do domínio com `base: '/'`.
- O fallback de rotas deverá preservar `BrowserRouter` e não expor rotas protegidas.
- Arquivos de texto deverão permanecer UTF-8 sem BOM e sem mojibake.
- As alterações locais de copy existentes deverão ser preservadas.

## Review Focus

- Acesso direto a `/sobre`, `/biteplaner` e `/parceiros` deve funcionar após refresh; teste de navegação no shell público — Task 4.
- O bundle institucional não deve importar auth, Supabase ou API; teste de fronteira do entrypoint público — Task 2.
- O build deve funcionar sem `.env` operacional; teste de configuração pública — Task 3.
- O deploy deve publicar `dist/index.html` no nível superior do artefato; validação do workflow — Task 5.
- O domínio raiz, `www`, HTTPS e URLs canônicas não devem divergir; checklist de publicação — Task 6.

### Task 1: Definir a entrada institucional pública

**Files:**
- Create: `project/nexor/src/publicApp.tsx`
- Create: `project/nexor/src/routes/publicRouter.tsx`
- Modify: `project/nexor/src/main.tsx`
- Test: `project/nexor/src/routes/publicRouter.test.tsx`

**Interfaces:**
- `publicApp.tsx` monta o `Layout` institucional e renderiza o router público.
- `publicRouter.tsx` exporta `publicRouter` e contém somente as oito rotas públicas da especificação.
- `main.tsx` inicializa apenas a entrada pública no build MVP1.

- [ ] **Step 1: Write the failing test**

Adicionar testes que renderizem o router público em memória e confirmem a existência das rotas `/`, `/sobre`, `/biteplaner`, `/conheca-biteplaner`, `/parceiros`, `/privacidade`, `/termos` e `/cookies`, além da ausência de `/entrar` e `/painel/admin/home`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/routes/publicRouter.test.tsx`

Expected: FAIL because `publicRouter` and the public entrypoint do not exist.

- [ ] **Step 3: Write minimal implementation**

Extrair do router atual somente as rotas institucionais, mantendo `LazyRoute`, `ErrorBoundary` e o `Layout`. Remover do caminho de import público os módulos de auth, portal, admin e Supabase.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/routes/publicRouter.test.tsx`

Expected: PASS with the public route matrix green.

- [ ] **Step 5: Commit**

```bash
git add project/nexor/src/main.tsx project/nexor/src/publicApp.tsx project/nexor/src/routes/publicRouter.tsx project/nexor/src/routes/publicRouter.test.tsx
git commit -m "refactor: isolate public static site entrypoint"
```

### Task 2: Garantir isolamento de backend no bundle público

**Files:**
- Modify: `project/nexor/src/config/env.ts`
- Modify: `project/nexor/src/lib/supabase.ts`
- Modify: `project/nexor/vite.config.ts`
- Test: `project/nexor/src/config/env.test.ts`
- Test: `project/nexor/src/publicApp.test.tsx`

**Interfaces:**
- A configuração pública deve fornecer somente valores opcionais necessários às páginas institucionais.
- O entrypoint público não deve importar `useAuth`, `supabase`, `api` ou módulos de portal.

- [ ] **Step 1: Write the failing test**

Adicionar um teste que execute o parser de ambiente com `VITE_API_URL`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` ausentes, esperando configuração válida para o site público. Adicionar teste de fonte do entrypoint que rejeite imports de `../hooks/useAuth`, `../lib/supabase`, `../lib/api` e `../components/portal`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/config/env.test.ts src/publicApp.test.tsx`

Expected: FAIL because the current environment schema and entrypoint still support the operational application.

- [ ] **Step 3: Write minimal implementation**

Separar o parser público do parser operacional e manter as integrações operacionais fora da árvore importada por `main.tsx`. Não remover os módulos de backend futuros; somente impedir que sejam dependências do site estático.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/config/env.test.ts src/publicApp.test.tsx`

Expected: PASS without requiring an operational `.env`.

- [ ] **Step 5: Commit**

```bash
git add project/nexor/src/config/env.ts project/nexor/src/config/env.test.ts project/nexor/src/lib/supabase.ts project/nexor/src/publicApp.test.tsx project/nexor/vite.config.ts
git commit -m "refactor: make public build independent from backend"
```

### Task 3: Configurar raiz do domínio e metadados públicos

**Files:**
- Modify: `project/nexor/vite.config.ts`
- Modify: `project/nexor/index.html`
- Modify: `project/nexor/public/sitemap.xml`
- Modify: `project/nexor/public/robots.txt`
- Modify: `project/nexor/public/site.webmanifest`
- Test: `project/nexor/src/seo/staticMetadata.test.ts`

**Interfaces:**
- O build de produção usará `base: '/'`.
- Os metadados públicos usarão `https://nexoradvance.com.br` como origem canônica.

- [ ] **Step 1: Write the failing test**

Criar teste de conteúdo que valide o título NEXOR ADVANCE, a descrição institucional, ausência de `/nexor-interface/` e presença de URLs `https://nexoradvance.com.br` no sitemap.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/seo/staticMetadata.test.ts`

Expected: FAIL because `index.html`, sitemap e assets ainda refletem a configuração anterior.

- [ ] **Step 3: Write minimal implementation**

Atualizar `base`, title, description, Open Graph, sitemap, robots e manifest. Substituir referências absolutas incompatíveis com o domínio próprio por caminhos ou URLs canônicas corretas.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/seo/staticMetadata.test.ts`

Expected: PASS without mojibake.

- [ ] **Step 5: Commit**

```bash
git add project/nexor/vite.config.ts project/nexor/index.html project/nexor/public/sitemap.xml project/nexor/public/robots.txt project/nexor/public/site.webmanifest project/nexor/src/seo/staticMetadata.test.ts
git commit -m "feat: configure Nexor public metadata for custom domain"
```

### Task 4: Implementar fallback do BrowserRouter

**Files:**
- Create: `project/nexor/public/404.html`
- Modify: `project/nexor/src/routes/publicRouter.tsx`
- Test: `project/nexor/src/routes/publicRouter.test.tsx`
- Test: `project/nexor/scripts/verify-static-routes.mjs`

**Interfaces:**
- `404.html` deve carregar o shell público sem encaminhar para login ou portal.
- O verificador de rotas deve checar todas as rotas públicas e rejeitar rotas operacionais.

- [ ] **Step 1: Write the failing test**

Adicionar teste que verifique a existência de `public/404.html`, a referência ao shell público e a ausência de `/entrar` e `/painel` no fallback. Criar um verificador que percorra as oito rotas públicas declaradas.

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/verify-static-routes.mjs`

Expected: FAIL because the fallback e o verificador ainda não existem.

- [ ] **Step 3: Write minimal implementation**

Adicionar fallback compatível com o build Vite e documentar a estratégia de restauração de caminho para `BrowserRouter`. Garantir que o fallback não tente renderizar áreas protegidas.

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/verify-static-routes.mjs`

Expected: PASS for all public paths and FAIL for protected paths when intentionally probed.

- [ ] **Step 5: Commit**

```bash
git add project/nexor/public/404.html project/nexor/src/routes/publicRouter.tsx project/nexor/src/routes/publicRouter.test.tsx project/nexor/scripts/verify-static-routes.mjs
git commit -m "feat: support public BrowserRouter paths on GitHub Pages"
```

### Task 5: Criar workflow do GitHub Pages

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `project/nexor/package.json`
- Test: `.github/workflows/deploy-pages.test.mjs`

**Interfaces:**
- O workflow executará a partir da raiz do repositório e trabalhará em `project/nexor`.
- O artefato publicado será `project/nexor/dist` com `index.html` no nível superior.

- [ ] **Step 1: Write the failing test**

Criar teste que leia o workflow e exija `npm ci`, `npm run typecheck`, `npm run test:run`, `npm run build`, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`, `pages: write` e `id-token: write`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node .github/workflows/deploy-pages.test.mjs`

Expected: FAIL because o workflow não existe.

- [ ] **Step 3: Write minimal implementation**

Criar workflow para push na branch principal e dispatch manual, configurar Node/npm, executar validações e publicar somente `project/nexor/dist`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node .github/workflows/deploy-pages.test.mjs`

Expected: PASS with the required Pages permissions and artifact path.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy-pages.yml .github/workflows/deploy-pages.test.mjs project/nexor/package.json
git commit -m "ci: deploy public site to GitHub Pages"
```

### Task 6: Configurar domínio e executar verificação final

**Files:**
- Modify: `project/nexor/public/sitemap.xml`
- Create: `docs/operations/github-pages.md`
- Test: `project/nexor/scripts/verify-static-release.mjs`

**Interfaces:**
- A documentação operacional deverá registrar o domínio, DNS recomendado, configuração do GitHub Pages e rollback.
- O verificador final deverá validar build, arquivos públicos, rotas, metadados e ausência de mojibake.

- [ ] **Step 1: Write the failing test**

Criar verificador que falhe quando `dist/index.html`, `dist/404.html`, `dist/robots.txt`, `dist/sitemap.xml` ou `dist/site.webmanifest` estiverem ausentes, ou quando o bundle contiver referências públicas a `/entrar`, `/cadastro`, `/painel`, API ou Supabase.

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/verify-static-release.mjs`

Expected: FAIL until the static build and documentation are complete.

- [ ] **Step 3: Write minimal implementation**

Documentar a configuração DNS do domínio apex, `www`, verificação de domínio, HTTPS, publicação e rollback. Executar build e validar o conteúdo final de `dist`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run typecheck`

Run: `npm run test:run`

Run: `npm run build`

Run: `node scripts/verify-static-release.mjs`

Expected: build e verificador estático PASS; qualquer falha pré-existente fora do escopo deverá ser registrada antes do deploy.

- [ ] **Step 5: Commit**

```bash
git add docs/operations/github-pages.md project/nexor/public/sitemap.xml project/nexor/scripts/verify-static-release.mjs
git commit -m "docs: document static site release and domain operations"
```
