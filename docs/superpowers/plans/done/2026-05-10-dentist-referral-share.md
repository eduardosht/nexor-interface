# Dentist Referral Share Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add customer-facing WhatsApp/e-mail sharing for recommending Biteplaner dentist licensing, linked to `/parceiros#dentistas`, while preserving the licensed-clinic requirement for the active order.

**Architecture:** Keep the feature frontend-only in this increment. Add stable section anchors to the existing partner tracks and add a secondary sharing panel to the initial consultation page after intake completion.

**Tech Stack:** React 19, TypeScript strict, Vite 6, Styled Components 6, Vitest, Testing Library.

---

### Task 1: Partner Page Anchors

**Files:**
- Modify: `project/frontend/nexor/src/pages/Parceiros/index.tsx`
- Test: `project/frontend/nexor/src/pages/Parceiros/Parceiros.test.tsx`

- [ ] Add failing test asserting the dentist track section has `id="dentistas"`.
- [ ] Run `npm run test:run -- Parceiros` in `project/frontend/nexor` and confirm the test fails because the anchor is missing.
- [ ] Add an `anchor` field to each track and pass it as `id` to `S.TrackSection`.
- [ ] Run `npm run test:run -- Parceiros` and confirm it passes.

### Task 2: Consultation Referral Share Panel

**Files:**
- Modify: `project/frontend/nexor/src/pages/painel/ConsultaInicial/index.tsx`
- Modify: `project/frontend/nexor/src/pages/painel/ConsultaInicial/styles.ts`
- Test: `project/frontend/nexor/src/pages/painel/ConsultaInicial/index.test.tsx`

- [ ] Add failing test asserting the consultation page shows the dentist referral panel after intake completion.
- [ ] Assert the panel includes WhatsApp and e-mail links containing `/parceiros#dentistas`.
- [ ] Assert the panel explains the current order still requires a licensed clinic.
- [ ] Run `npm run test:run -- ConsultaInicial` and confirm the new test fails because the panel is missing.
- [ ] Add constants for the partner URL and prepared referral message.
- [ ] Render the panel only when `intakeIsComplete`.
- [ ] Add styled components using existing panel/card/button patterns.
- [ ] Run `npm run test:run -- ConsultaInicial` and confirm it passes.

### Task 3: Business Context Update

**Files:**
- Modify: `.ai/context/business/biteplaner/product-flow.md`
- Modify: `.ai/context/business/biteplaner/INDEX.md`

- [ ] Update the Biteplaner context to state that customer referral can happen through WhatsApp or e-mail with a ready message and `/parceiros#dentistas`.
- [ ] Preserve the rule that the current order requires a licensed clinic until licensing is complete.

### Task 4: Final Verification

**Files:**
- Verify frontend package.

- [ ] Run `npm run test:run -- Parceiros ConsultaInicial` in `project/frontend/nexor`.
- [ ] Run `npm run build` in `project/frontend/nexor`.
- [ ] Confirm no secrets were added and new code paths stay in `project/`, while business context updates stay in `.ai/`.
