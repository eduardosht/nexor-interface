# Pre-requisito Radio Question Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable design-system radio question component and apply it to `/painel/pre-requisito`.

**Architecture:** `RadioQuestionGroup` lives in `project/packages/design-system/src/components/` and is exported from the package root. The Nexor pre-requisito page imports it and keeps business state, validation and submission unchanged.

**Tech Stack:** React 19, TypeScript strict, Styled Components 6, Vitest, Testing Library.

---

## File Structure

- Create `project/packages/design-system/src/components/RadioQuestionGroup.tsx`: controlled radio group component with inline and cards variants.
- Create `project/packages/design-system/src/components/RadioQuestionGroup.test.tsx`: component behavior and accessibility tests.
- Create `project/packages/design-system/src/components/RadioQuestionGroup.stories.tsx`: Storybook examples for inline and cards usage.
- Modify `project/packages/design-system/src/index.ts`: export component and types.
- Modify `project/frontend/nexor/src/pages/painel/PreRequisito.tsx`: use the new component and page section layout.
- Modify `project/frontend/nexor/src/pages/painel/__tests__/PreRequisito.test.tsx`: adjust selectors only if the rendered accessible names change.

### Task 1: Design-system radio question component

**Files:**
- Create: `project/packages/design-system/src/components/RadioQuestionGroup.test.tsx`
- Create: `project/packages/design-system/src/components/RadioQuestionGroup.tsx`
- Create: `project/packages/design-system/src/components/RadioQuestionGroup.stories.tsx`
- Modify: `project/packages/design-system/src/index.ts`

- [ ] **Step 1: Write failing component tests**

Create `RadioQuestionGroup.test.tsx` with tests that render `variant="inline"` and `variant="cards"`, click an option, and assert `onChange` receives the selected value.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- RadioQuestionGroup.test.tsx` from `project/packages/design-system`.

Expected: fail because `RadioQuestionGroup` does not exist.

- [ ] **Step 3: Implement `RadioQuestionGroup`**

Create a controlled component with props:

```ts
export type RadioQuestionOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

export type RadioQuestionGroupProps = {
  name: string;
  label: ReactNode;
  value: string;
  options: RadioQuestionOption[];
  onChange: (value: string) => void;
  hint?: ReactNode;
  required?: boolean;
  variant?: 'inline' | 'cards';
  columns?: 1 | 2 | 3;
};
```

- [ ] **Step 4: Export and add stories**

Export the component from `src/index.ts` and add Storybook examples for cards and inline variants.

- [ ] **Step 5: Run design-system tests**

Run: `npm run test:run -- RadioQuestionGroup.test.tsx` from `project/packages/design-system`.

Expected: pass.

### Task 2: Apply component to pre-requisito page

**Files:**
- Modify: `project/frontend/nexor/src/pages/painel/PreRequisito.tsx`
- Modify if needed: `project/frontend/nexor/src/pages/painel/__tests__/PreRequisito.test.tsx`

- [ ] **Step 1: Run existing page test before editing**

Run: `npm run test:run -- PreRequisito.test.tsx` from `project/frontend/nexor`.

Expected: current baseline pass before refactor, or fail only because the new component is not wired yet if Task 1 is incomplete.

- [ ] **Step 2: Replace local radio markup**

Import `RadioQuestionGroup` from `@nexor/design-system` and replace:

- document type radios with `variant="cards"` and two columns;
- menoridade radios with `variant="inline"`;
- odontological blocking questions with `variant="inline"`.

- [ ] **Step 3: Adjust page section layout**

Add local styled section wrappers for the document block, questionnaire block and consent block. Keep submission logic and validation state unchanged.

- [ ] **Step 4: Run page test**

Run: `npm run test:run -- PreRequisito.test.tsx` from `project/frontend/nexor`.

Expected: pass.

### Task 3: Final verification

**Files:**
- Review changed files only.

- [ ] **Step 1: Run frontend and design-system checks**

Run from `project/packages/design-system`: `npm run test:run`.

Run from `project/frontend/nexor`: `npm run test:run -- PreRequisito.test.tsx`.

Run from `project/frontend/nexor`: `npm run build`.

Expected: all pass.

- [ ] **Step 2: Move completed plan**

After all checks pass, move this file to `docs/superpowers/plans/done/2026-05-09-pre-requisito-radio-question.md`.
