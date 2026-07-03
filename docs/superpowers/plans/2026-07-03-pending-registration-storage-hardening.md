# Pending Registration Storage Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop persisting CPF/CNPJ in frontend `sessionStorage` pending registration data while preserving safe consent reconciliation and one-time legacy migration.

**Architecture:** `src/lib/pending-registration.ts` becomes the privacy boundary. Auth/account reconciliation consumes safe pending payloads for consents only and uses a separate legacy migration reader only for old payloads that already contain document data.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Vite.

## Global Constraints

- Do not persist `documentNumber` or `documentType` in new `nexor_pending_registration` writes.
- Safe pending registration may contain only email, fullName, role, companyName, and consents.
- Legacy payloads with document data may be read only through an explicit migration function and must be cleared after reconciliation, conflict, invalid shape, or email mismatch.
- Preserve UTF-8 Portuguese accents when touching UI/legal copy.
- Do not change admin API-backed document displays in this task.

---

### Task 1: Pending Registration Storage Boundary

**Files:**
- Modify: `project/nexor/src/lib/pending-registration.ts`
- Create: `project/nexor/src/lib/pending-registration.test.ts`

**Interfaces:**
- Produces: `PendingRegistration`, `LegacyPendingRegistration`, `savePendingRegistration(payload)`, `loadPendingRegistration()`, `loadLegacyPendingRegistrationForMigration()`, `clearPendingRegistration()`.
- Consumes: `readStorageJson`, `writeStorageJson`, `removeStorageValue` from `src/lib/browser-storage.ts`.

- [ ] **Step 1: Write failing tests**

Create `project/nexor/src/lib/pending-registration.test.ts` with tests proving safe writes strip document fields, safe payloads round-trip, legacy payloads are available only via migration reader, invalid payloads clear storage, and email mismatch cleanup can use the existing clear function.

- [ ] **Step 2: Run RED**

Run: `npm run test:run -- src/lib/pending-registration.test.ts`

Expected: FAIL because `loadLegacyPendingRegistrationForMigration` does not exist and current safe loader returns document fields.

- [ ] **Step 3: Implement storage boundary**

Update `pending-registration.ts` to validate safe payloads, sanitize writes, expose `LegacyPendingRegistration`, and clear invalid shapes.

- [ ] **Step 4: Run GREEN**

Run: `npm run test:run -- src/lib/pending-registration.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `fix: harden pending registration storage boundary`.

### Task 2: Auth and Account Reconciliation

**Files:**
- Modify: `project/nexor/src/hooks/useAuth.tsx`
- Modify: `project/nexor/src/hooks/useAuth.test.tsx`
- Modify: `project/nexor/src/pages/Conta/index.tsx`
- Modify: `project/nexor/src/pages/Conta/Conta.test.tsx`

**Interfaces:**
- Consumes: `loadPendingRegistration`, `loadLegacyPendingRegistrationForMigration`, `clearPendingRegistration`.
- Produces: auth/account behavior that posts consents from safe payloads, creates profiles only from legacy payloads, and clears storage on email mismatch.

- [ ] **Step 1: Write failing reconciliation tests**

Update focused tests so safe pending storage posts only `/v1/account/consents`, does not call `/v1/auth/profile`, and clears mismatched pending storage.

- [ ] **Step 2: Run RED**

Run: `npm run test:run -- src/hooks/useAuth.test.tsx src/pages/Conta/Conta.test.tsx`

Expected: FAIL because current code expects document fields and profile creation from pending storage.

- [ ] **Step 3: Implement reconciliation changes**

Update `useAuth` and `Conta` to use safe pending payloads for consent sync and legacy payloads only for one-time profile migration.

- [ ] **Step 4: Run GREEN**

Run: `npm run test:run -- src/hooks/useAuth.test.tsx src/pages/Conta/Conta.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `fix: stop using client stored documents for registration sync`.

### Task 3: Cookie Disclosure Copy and Final Verification

**Files:**
- Modify: `project/nexor/src/pages/Cookies/index.tsx`
- Modify: `project/nexor/src/pages/Cookies/Cookies.test.tsx`

**Interfaces:**
- Produces: legal copy that describes `nexor_pending_registration` as safe temporary registration state without CPF/CNPJ.

- [ ] **Step 1: Update tests for disclosure copy**

Add assertion that the Cookies page states `nexor_pending_registration` does not store CPF/CNPJ.

- [ ] **Step 2: Run RED**

Run: `npm run test:run -- src/pages/Cookies/Cookies.test.tsx`

Expected: FAIL because the text is not present yet.

- [ ] **Step 3: Update copy and fix existing mojibake in touched file**

Rewrite the touched Cookies copy with proper UTF-8 Portuguese accents and explicit no-document storage wording.

- [ ] **Step 4: Run final verification**

Run:
- `npm run test:run -- src/lib/pending-registration.test.ts src/hooks/useAuth.test.tsx src/pages/Conta/Conta.test.tsx src/pages/Cookies/Cookies.test.tsx`
- `npm run typecheck`
- `npm run build`
- `npm audit --audit-level=moderate`
- `rg -n '\x{00C3}|\x{00C2}|\x{00E2}\x{20AC}|\x{FFFD}' project/nexor/src/lib/pending-registration.ts project/nexor/src/lib/pending-registration.test.ts project/nexor/src/hooks/useAuth.tsx project/nexor/src/hooks/useAuth.test.tsx project/nexor/src/pages/Conta/index.tsx project/nexor/src/pages/Conta/Conta.test.tsx project/nexor/src/pages/Cookies/index.tsx project/nexor/src/pages/Cookies/Cookies.test.tsx`

Expected: focused tests, typecheck, build, and audit pass; mojibake scan has no output.

- [ ] **Step 5: Commit**

Commit: `docs: clarify safe pending registration storage`.