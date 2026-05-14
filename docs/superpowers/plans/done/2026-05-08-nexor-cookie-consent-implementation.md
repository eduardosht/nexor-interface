# Nexor Cookie Consent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a fixed cookie consent banner to the public Nexor site, persist the user's decision, allow reopening preferences, and align the cookie policy page with the actual consent flow.

**Architecture:** Keep the consent state in a focused frontend utility backed by `localStorage`, render the banner from the public `Layout`, and expose a lightweight reopen control through the footer. Use a small preferences panel inside the banner so the first decision is simple while still allowing category-level choices without introducing a modal.

**Tech Stack:** React 19, TypeScript, Styled Components, React Router, Vitest, Testing Library

---

### Task 1: Add failing tests for cookie consent UX

**Files:**
- Create: `project/frontend/nexor/src/features/cookies/__tests__/consent.test.tsx`
- Modify: `project/frontend/nexor/src/components/__tests__/Footer.test.tsx`
- Modify: `project/frontend/nexor/src/__tests__/Layout.test.tsx`

- [x] Add tests that prove the banner appears when there is no saved decision.
- [x] Add tests that prove accepting optional cookies stores the consent and hides the banner.
- [x] Add tests that prove rejecting optional cookies stores only necessary cookies and hides the banner.
- [x] Add tests that prove the footer exposes a control to reopen cookie preferences after a decision.

### Task 2: Implement persisted consent state and public banner

**Files:**
- Create: `project/frontend/nexor/src/features/cookies/storage.ts`
- Create: `project/frontend/nexor/src/features/cookies/CookieConsentBanner.tsx`
- Modify: `project/frontend/nexor/src/Layout.tsx`
- Modify: `project/frontend/nexor/src/components/Footer.tsx`

- [x] Add a small storage module with the consent shape, current version, read/write helpers, and a helper that returns the default "necessary only" state.
- [x] Render the banner in `Layout` for public pages and keep it hidden once a saved decision exists.
- [x] Provide first-level actions for accept, reject, and manage preferences, plus a link to `/cookies`.
- [x] Add a compact inline preferences area with categories for necessary, preferences, and analytics.
- [x] Add a footer action that reopens the preferences banner without clearing the saved decision until the user updates it.

### Task 3: Align legal copy with implemented behavior

**Files:**
- Modify: `project/frontend/nexor/src/pages/Cookies.tsx`
- Modify: `project/frontend/nexor/src/pages/__tests__/Cookies.test.tsx`

- [x] Rewrite the cookie policy to describe necessary, preferences, and analytics cookies in plain language.
- [x] Remove references to tools or categories that are not actually wired in the frontend right now.
- [x] Document that users can accept, refuse optional cookies, or reopen preferences from the site footer.
- [x] Extend the cookie policy tests to verify the updated sections and management guidance.

### Task 4: Verify the feature end-to-end

**Files:**
- Modify: `docs/superpowers/plans/done/2026-05-08-nexor-cookie-consent-implementation.md`

- [x] Run the focused frontend test commands for layout, footer, cookie consent, and cookie policy.
- [x] Review the banner copy and spacing against the Nexor design tokens.
- [x] Mark the completed checklist items in this plan before reporting completion.
