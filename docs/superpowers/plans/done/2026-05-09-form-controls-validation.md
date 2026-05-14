# Form Controls Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate inline radios, document masking, visible checkbox cards, and name sanitization across the main Nexor forms.

**Architecture:** Shared controls and formatting helpers live in `project/packages/design-system/src/components` and `src/utils`. Frontend pages import those controls and keep their existing state/submission contracts unchanged except for document type changing to CPF/RG in the prerequisite form.

**Tech Stack:** React 19, TypeScript strict, Styled Components 6, Vitest, Testing Library.

---

## File Structure

- Create `project/packages/design-system/src/utils/formats.ts`: name sanitization and document masking helpers.
- Create `project/packages/design-system/src/utils/formats.test.ts`: helper tests.
- Modify `project/packages/design-system/src/components/RadioQuestionGroup.tsx`: add `inline`.
- Modify `project/packages/design-system/src/components/RadioQuestionGroup.test.tsx`: assert inline layout style.
- Create `project/packages/design-system/src/components/DocumentField.tsx`: document selector/input component.
- Create `project/packages/design-system/src/components/DocumentField.test.tsx`: mask and event tests.
- Create `project/packages/design-system/src/components/CheckboxField.tsx`: card checkbox component.
- Create `project/packages/design-system/src/components/CheckboxField.test.tsx`: interaction tests.
- Create stories for `DocumentField` and `CheckboxField`.
- Modify `project/packages/design-system/src/index.ts`: export controls and helpers.
- Modify `project/frontend/nexor/src/pages/Cadastro/index.tsx`: sanitize name and use `CheckboxField`.
- Modify `project/frontend/nexor/src/pages/Cadastro/Cadastro.styles.ts`: remove unused local checkbox export if unused.
- Modify `project/frontend/nexor/src/pages/painel/MinhaConta.tsx`: sanitize editable full name.
- Modify `project/frontend/nexor/src/sections/Contato.tsx`: sanitize contact name.
- Modify `project/frontend/nexor/src/pages/painel/PreRequisito.tsx`: use `DocumentField`, inline radios and `CheckboxField`.
- Modify `project/frontend/nexor/src/pages/painel/ProducaoDentista.tsx`: use `CheckboxField` for LGPD confirmation.
- Update relevant tests in `project/frontend/nexor/src/__tests__/Cadastro.test.tsx`, `project/frontend/nexor/src/pages/painel/__tests__/PreRequisito.test.tsx`, and `project/frontend/nexor/src/sections/__tests__/Contato.test.tsx`.

### Task 1: Design-system helpers and controls

**Files:**
- Create: `project/packages/design-system/src/utils/formats.ts`
- Create: `project/packages/design-system/src/utils/formats.test.ts`
- Modify: `project/packages/design-system/src/components/RadioQuestionGroup.tsx`
- Modify: `project/packages/design-system/src/components/RadioQuestionGroup.test.tsx`
- Create: `project/packages/design-system/src/components/DocumentField.tsx`
- Create: `project/packages/design-system/src/components/DocumentField.test.tsx`
- Create: `project/packages/design-system/src/components/CheckboxField.tsx`
- Create: `project/packages/design-system/src/components/CheckboxField.test.tsx`
- Modify: `project/packages/design-system/src/index.ts`

- [ ] **Step 1: Write failing tests**

Add tests for:

- `sanitizePersonName('Ana 123 Silva')` returns `Ana  Silva`;
- `formatDocumentValue('cpf', '12345678909')` returns `123.456.789-09`;
- `DocumentField` emits raw CPF digits after typing;
- `CheckboxField` calls `onChange(true)` when clicked;
- `RadioQuestionGroup inline` renders the options row with no fixed column grid.

- [ ] **Step 2: Run tests to verify failure**

Run from `project/packages/design-system`:

```bash
npm run test:run -- formats.test.ts DocumentField.test.tsx CheckboxField.test.tsx RadioQuestionGroup.test.tsx
```

Expected: fail because new helpers/components/inline behavior do not exist.

- [ ] **Step 3: Implement helpers and components**

Implement the minimum code required for the tests and export from `src/index.ts`.

- [ ] **Step 4: Run design-system targeted tests**

Run from `project/packages/design-system`:

```bash
npm run test:run -- formats.test.ts DocumentField.test.tsx CheckboxField.test.tsx RadioQuestionGroup.test.tsx
```

Expected: pass.

### Task 2: Apply controls in frontend forms

**Files:**
- Modify: `project/frontend/nexor/src/pages/Cadastro/index.tsx`
- Modify: `project/frontend/nexor/src/pages/Cadastro/Cadastro.styles.ts`
- Modify: `project/frontend/nexor/src/pages/painel/MinhaConta.tsx`
- Modify: `project/frontend/nexor/src/sections/Contato.tsx`
- Modify: `project/frontend/nexor/src/pages/painel/PreRequisito.tsx`
- Modify: `project/frontend/nexor/src/pages/painel/ProducaoDentista.tsx`
- Modify tests as needed.

- [ ] **Step 1: Write or update failing frontend tests**

Add expectations that numeric characters are removed from name fields and the prerequisite document field masks CPF while submitting raw digits.

- [ ] **Step 2: Run targeted frontend tests to verify failure**

Run from `project/frontend/nexor`:

```bash
npm run test:run -- Cadastro.test.tsx PreRequisito.test.tsx Contato.test.tsx
```

Expected: fail before page integration is complete.

- [ ] **Step 3: Integrate components**

Use `CheckboxField`, `DocumentField`, `sanitizePersonName`, and `inline` radios in the target pages.

- [ ] **Step 4: Run targeted frontend tests**

Run from `project/frontend/nexor`:

```bash
npm run test:run -- Cadastro.test.tsx PreRequisito.test.tsx Contato.test.tsx ProducaoDentista.test.tsx
```

Expected: pass.

### Task 3: Final verification

**Files:**
- Review changed files only.

- [ ] **Step 1: Run design-system full tests**

Run from `project/packages/design-system`:

```bash
npm run test:run
```

Expected: pass.

- [ ] **Step 2: Run Nexor targeted tests and build**

Run from `project/frontend/nexor`:

```bash
npm run test:run -- Cadastro.test.tsx PreRequisito.test.tsx Contato.test.tsx ProducaoDentista.test.tsx
npm run build
```

Expected: pass. Vite chunk-size warnings are acceptable if build exits 0.

- [ ] **Step 3: Move completed plan**

Move this file to `docs/superpowers/plans/done/2026-05-09-form-controls-validation.md`.
