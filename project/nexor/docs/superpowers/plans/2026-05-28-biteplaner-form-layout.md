# Biteplaner Form Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Biteplaner onboarding and operational registration forms with a shared premium form layout inspired by the provided reference image.

**Architecture:** Create reusable form-layout primitives for hero, progress, section header, step tabs, form surface, field grid, and action bar. Apply those primitives first to `/painel/biteplaner/onboarding`, then adapt `CadastroPerfilBiteplaner` for partner, dentist, and laboratory requests without changing existing payload behavior.

**Tech Stack:** React, TypeScript, styled-components, lucide-react, @nexor/design-system, Vitest, Testing Library.

---

## Files

- Modify: `src/pages/painel/components/WorkflowFormsPanel.tsx`
- Modify: `src/pages/painel/components/WorkflowFormsPanel.styles.ts`
- Modify: `src/pages/painel/CadastroUsuarioBiteplaner/index.tsx`
- Modify: `src/pages/painel/CadastroUsuarioBiteplaner/index.test.tsx`
- Modify: `src/pages/painel/CadastroPerfilBiteplaner/index.tsx`
- Modify: `src/pages/painel/CadastroPerfilBiteplaner/styles.ts`
- Modify: `src/pages/painel/CadastroPerfilBiteplaner/index.test.tsx`
- Optional create: `src/pages/painel/components/BiteplanerFormShell.tsx`
- Optional create: `src/pages/painel/components/BiteplanerFormShell.styles.ts`

## Visual Target

- Large white rounded page shell with subtle border and shadow.
- Top hero with icon, title, description, informational callout, and right-side clipboard/security illustration area.
- Dedicated progress card with numbered step rail.
- Current section card with icon, section count, title, description, progress percentage, and trust badges.
- Horizontal step tabs repeated inside the form card.
- Clean field groups with section icons, divider line, and dense responsive grid.
- Bottom action area with privacy notice, optional draft action if supported later, and primary green next/submit button.
- Mobile: collapse to a simple single-column layout, hide decorative illustration, keep progress compact.

## Responsive Rules

- Desktop >= 1024px: hero two columns, field grid up to 3 columns, action bar split left/right.
- Tablet 768-1023px: hero one column or reduced illustration, field grid 2 columns.
- Mobile < 768px: one-column fields, compact progress labels, no decorative illustration, buttons full width.
- No fixed viewport-based font scaling. Use stable spacing, min-width protections, and wrapped labels.

## Task 1: Shared Onboarding Layout Tests

**Files:**
- Modify: `src/pages/painel/CadastroUsuarioBiteplaner/index.test.tsx`

- [ ] Add tests that assert the onboarding renders:
  - `Seu progresso`
  - current progress value, e.g. `33% concluído`
  - step label `Dados clínicos para seu cuidado`
  - section heading `Perfil do cliente`
  - trust labels such as `Privacidade protegida`

- [ ] Add a test that verifies the old generic flat layout markers are absent where replaced:
  - no duplicate marketing-style intro inside the form card
  - no old compact step rail label if the new progress component replaces it

- [ ] Run:

```bash
npm run test:run -- src/pages/painel/CadastroUsuarioBiteplaner/index.test.tsx
```

Expected: fail because the new layout primitives are not implemented yet.

## Task 2: Build Shared Form Shell

**Files:**
- Optional create: `src/pages/painel/components/BiteplanerFormShell.tsx`
- Optional create: `src/pages/painel/components/BiteplanerFormShell.styles.ts`
- Or modify directly: `src/pages/painel/components/WorkflowFormsPanel.styles.ts`

- [ ] Create shared styled primitives:
  - `FormExperienceShell`
  - `FormHero`
  - `HeroIcon`
  - `HeroIllustration`
  - `HeroInfoCallout`
  - `ProgressCard`
  - `ProgressRail`
  - `SectionOverviewCard`
  - `TrustBadgeStrip`
  - `StepTabsCard`
  - `PremiumFormCard`
  - `FormActionBar`

- [ ] Use lucide icons where appropriate:
  - `UserRoundPlus` or `UserRoundCheck` for onboarding.
  - `ClipboardPlus`, `ShieldCheck`, `LockKeyhole`, `Users`, `BarChart3`.
  - `Building2`, `MapPin`, `Mail`, `Phone`, `FileText`, `ChevronRight`.

- [ ] Keep decorative clipboard/security visual CSS-based or icon-composed, not SVG-heavy. Hide it on mobile.

- [ ] Run:

```bash
npm run typecheck
```

Expected: pass.

## Task 3: Apply Layout to New User Onboarding

**Files:**
- Modify: `src/pages/painel/CadastroUsuarioBiteplaner/index.tsx`
- Modify: `src/pages/painel/components/WorkflowFormsPanel.tsx`
- Modify: `src/pages/painel/components/WorkflowFormsPanel.styles.ts`

- [ ] Replace the existing onboarding intro area with a hero matching the reference structure:
  - title `Cadastro de novos usuários`
  - same explanatory copy currently used in `OrderStepHeader`
  - green info callout with NEXOR research/device message
  - right illustration hidden on mobile

- [ ] Keep privacy gate before form access, but restyle it to fit the new card system.

- [ ] In `WorkflowFormsPanel`, when `templateKey === 'customer_new_user_onboarding'`, render:
  - external progress card above the current section
  - section overview card
  - inner step tabs
  - premium form card

- [ ] Preserve current behavior:
  - payload submission
  - CEP lookup
  - validation
  - `scrollIntoView` on step change
  - blocker handling for minor/privacy

- [ ] Run:

```bash
npm run test:run -- src/pages/painel/CadastroUsuarioBiteplaner/index.test.tsx
npm run typecheck
```

Expected: pass.

## Task 4: Add Field Icon Support Without Breaking Design-System Fields

**Files:**
- Modify: `src/pages/painel/components/WorkflowFormsPanel.tsx`
- Modify: `src/pages/painel/components/WorkflowFormsPanel.styles.ts`
- Modify: `src/pages/painel/CadastroPerfilBiteplaner/index.tsx`
- Modify: `src/pages/painel/CadastroPerfilBiteplaner/styles.ts`

- [ ] Add optional icon slots at layout level instead of changing `@nexor/design-system` `Field` internals.

- [ ] Map common field keys to icons:
  - name: `UserRound`
  - email: `Mail`
  - phone: `Phone`
  - cpf/document: `BadgeInfo` or `FileText`
  - cep/address/city/state: `MapPin`, `Building2`
  - clinic/lab: `Building2`

- [ ] Ensure icons do not overlap field text on small widths.

- [ ] Run:

```bash
npm run test:run -- src/pages/painel/CadastroUsuarioBiteplaner/index.test.tsx
npm run test:run -- src/pages/painel/CadastroPerfilBiteplaner/index.test.tsx
```

Expected: pass.

## Task 5: Apply Layout to CadastroPerfilBiteplaner Roles

**Files:**
- Modify: `src/pages/painel/CadastroPerfilBiteplaner/index.tsx`
- Modify: `src/pages/painel/CadastroPerfilBiteplaner/styles.ts`
- Modify: `src/pages/painel/CadastroPerfilBiteplaner/index.test.tsx`

- [ ] Add role-specific hero content:
  - Partner: `Cadastro de parceiro Biteplaner`
  - Dentist: `Solicitar cadastro de dentista`
  - Lab: `Solicitar cadastro de laboratório`

- [ ] Use the same shell and card language:
  - hero
  - info callout
  - form card
  - grouped fields
  - privacy/terms footer
  - primary green submit button

- [ ] Keep role-specific content:
  - Partner fields and submit endpoint unchanged.
  - Dentist clinic fields and ViaCEP lookup unchanged.
  - Lab locations and ViaCEP lookup unchanged.

- [ ] Add/adjust tests:
  - each role renders the new hero title
  - existing submit payload tests still pass
  - clinic/lab CEP autofill tests still pass

- [ ] Run:

```bash
npm run test:run -- src/pages/painel/CadastroPerfilBiteplaner/index.test.tsx
npm run typecheck
```

Expected: pass.

## Task 6: Responsive Verification

**Files:**
- Modify styles as needed in:
  - `src/pages/painel/components/WorkflowFormsPanel.styles.ts`
  - `src/pages/painel/CadastroPerfilBiteplaner/styles.ts`

- [ ] Verify CSS breakpoints:
  - desktop: 3-column field rows where appropriate
  - tablet: 2-column field rows
  - mobile: single-column fields and full-width buttons

- [ ] Add tests where practical for layout-critical text:
  - long step names are present and not duplicated
  - mobile-only hidden decorative areas have `aria-hidden="true"`

- [ ] Manually verify in browser using dev server:

```bash
npm run dev
```

Open:
- `/painel/biteplaner/onboarding`
- `/painel/biteplaner/cadastro/parceiro`
- `/painel/biteplaner/cadastro/dentista`
- `/painel/biteplaner/cadastro/laboratório`

Check widths:
- 390px
- 768px
- 1024px
- 1440px

## Task 7: Final Verification

- [ ] Run:

```bash
npm run test:run -- src/pages/painel/CadastroUsuarioBiteplaner/index.test.tsx src/pages/painel/CadastroPerfilBiteplaner/index.test.tsx
npm run typecheck
```

- [ ] If time allows, run:

```bash
npm run build
```

- [ ] Confirm no unrelated files were changed beyond the intended layout/test files.

## Execution Notes

- Do not change backend contracts.
- Do not rename payload keys.
- Do not remove existing CEP behavior.
- Do not add “Salvar rascunho” unless there is already persistence for drafts; the reference image can inspire the footer layout, but the button should be omitted or disabled only if product explicitly wants it.
- Keep mobile simpler than the reference: no decorative illustration, compact progress, one-column fields.
