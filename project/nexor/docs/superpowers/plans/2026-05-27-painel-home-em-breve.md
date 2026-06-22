# Painel Home Em Breve Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/painel/home` main content with a faithful "Em breve" Biteplaner hero while preserving functional quick action cards.

**Architecture:** Keep `PainelHome` as the feature owner because existing state, API loading, and card navigation already live there. Replace the rendered sections and styled-components names in place, avoiding route/layout changes. Add one project asset for the new hero product image and keep button behavior wired to the current handlers.

**Tech Stack:** React, TypeScript, styled-components, lucide-react, Vitest, Testing Library, Vite.

---

### Task 1: Lock Hero And Quick Action Structure With Tests

**Files:**
- Modify: `src/pages/painel/PainelHome/index.test.tsx`

- [ ] **Step 1: Write failing tests for the new hero copy and retained quick actions**

Add assertions to existing render tests so the page must show:

```tsx
expect(screen.getByRole('heading', { name: /em breve no nosso site/i })).toBeInTheDocument();
expect(screen.getByText(/a compra do biteplaner estará disponível em breve/i)).toBeInTheDocument();
expect(screen.getByText(/fique ligado/i)).toBeInTheDocument();
expect(screen.getByText(/tecnologia/i)).toBeInTheDocument();
expect(screen.getByRole('heading', { name: /ações rápidas/i })).toBeInTheDocument();
expect(screen.getByText(/atalhos para otimizar sua rotina no biteplaner/i)).toBeInTheDocument();
```

Update old assertions that expect "Informações da conta" or the old product banner to expect those elements are absent.

- [ ] **Step 2: Run focused test and verify RED**

Run: `npm run test:run -- src/pages/painel/PainelHome/index.test.tsx`

Expected: FAIL because the new hero copy/subtitle does not exist yet and old content is still rendered.

### Task 2: Generate And Add Hero Product Asset

**Files:**
- Create: `src/assets/biteplaner-coming-soon-product.png`

- [ ] **Step 1: Generate image asset**

Use the built-in image generation tool with this prompt:

```text
Use case: product-mockup
Asset type: dashboard hero product render
Primary request: premium render of a black athletic dental mouthguard/Biteplaner appliance floating in space, angled slightly toward the viewer, with subtle embossed "NEXOR" and bright white "BITEPLANER" branding on the front band.
Scene/backdrop: transparent-friendly dark studio render on a clean black/green background, easy to blend into a dark green dashboard hero.
Subject: one curved black mouthguard appliance, realistic molded material, premium product photography.
Style/medium: photorealistic 3D product render.
Composition/framing: wide landscape product, centered with generous padding, shadow beneath product, no hands, no people.
Lighting/mood: dramatic soft green rim light, dark premium sports technology mood.
Color palette: black, graphite, deep green glow, white branding.
Text (verbatim): "NEXOR" and "BITEPLANER"
Constraints: no extra labels, no watermark, no packaging, no people, no duplicate products.
```

Save the selected generated image in `src/assets/biteplaner-coming-soon-product.png`.

### Task 3: Implement New `PainelHome` Markup

**Files:**
- Modify: `src/pages/painel/PainelHome/index.tsx`

- [ ] **Step 1: Replace old main sections**

Remove the current page header, product hero, security banner, and old section wrappers from the rendered JSX. Keep:

```tsx
const { demoPersona, isMockMode, session } = useAuth();
const rolesByKey = useMemo(...);
const shouldTrackOrder = ...;
const activeOrPendingOperationalRole = ...;
activateCustomer();
trackOrder();
ROLE_ACTIONS.map(...);
```

Add:

```tsx
<S.ComingSoonHero data-testid="biteplaner-coming-soon-hero">
  <S.HeroCopy>
    <S.HeroBadge><Clock3 ... />EM BREVE</S.HeroBadge>
    <S.HeroTitle>Em breve<br />no nosso <span>site.</span></S.HeroTitle>
    <S.HeroDescription>A compra do Biteplaner estará disponível em breve.</S.HeroDescription>
    <S.HeroAccentLine />
    <S.HeroNotice>...</S.HeroNotice>
  </S.HeroCopy>
  <S.HeroProductImage src={biteplanerComingSoonProduct} alt="" aria-hidden="true" />
  <S.HeroSignature>TECNOLOGIA • PERFORMANCE • PROTEÇÃO</S.HeroSignature>
</S.ComingSoonHero>
```

Keep demo/error banners if present, but render them between the hero and quick actions.

- [ ] **Step 2: Keep quick action behavior intact**

Render the same `ROLE_ACTIONS.map` with the same disabled and navigation logic, but target new styled-components:

```tsx
<S.QuickActionsSection>
  <S.QuickActionsHeader>
    <S.SectionTitle>Ações rápidas</S.SectionTitle>
    <S.SectionSubtitle>Atalhos para otimizar sua rotina no Biteplaner.</S.SectionSubtitle>
  </S.QuickActionsHeader>
  ...
</S.QuickActionsSection>
```

### Task 4: Implement New Styles

**Files:**
- Modify: `src/pages/painel/PainelHome/styles.ts`

- [ ] **Step 1: Add hero styles**

Implement styled-components for:

```ts
Page
ComingSoonHero
HeroCopy
HeroBadge
HeroTitle
HeroDescription
HeroAccentLine
HeroNotice
HeroNoticeIcon
HeroNoticeTitle
HeroNoticeText
HeroProductImage
HeroSignature
```

Use dark green/black gradients, a radial green glow behind the product, subtle concentric rings via pseudo-elements, generous desktop height, and mobile-safe stacking.

- [ ] **Step 2: Restyle quick action cards**

Update:

```ts
QuickActionsSection
QuickActionsHeader
SectionTitle
SectionSubtitle
RoleActionsGrid
RoleActionCard
RoleCardIcon
RoleActionTitle
RoleActionMeta
RoleStatusPill
RoleActionButton
```

Match the second reference: white cards, 8px radius, soft border/shadow, top icon circle, top-right status pill, strong title, small green rule, description, bottom divider, text button with arrow.

- [ ] **Step 3: Remove unused old styles**

Delete old styles no longer referenced by `PainelHome`, including account field styles, product hero styles, secondary links, and security banner styles.

### Task 5: Verify Tests And Build

**Files:**
- Modify only if tests reveal a real mismatch.

- [ ] **Step 1: Run focused page tests**

Run: `npm run test:run -- src/pages/painel/PainelHome/index.test.tsx`

Expected: PASS.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS.

### Task 6: Visual QA

**Files:**
- Modify only if screenshots show visual drift.

- [ ] **Step 1: Start local app**

Run: `npm run dev`

Expected: Vite prints a local URL.

- [ ] **Step 2: Open `/painel/home` and inspect desktop/mobile**

Use the Browser plugin if available. Verify:

- Hero shows exact approved copy.
- Product image is visible, not covering text.
- Dark hero resembles the first reference.
- Quick cards resemble the second reference.
- Existing quick action interactions still navigate or submit as before.
- Mobile has no overlapping text or horizontal overflow.
