# Aviso de Licenciamento Pendente Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir um aviso visual destacado dentro de cada card de licenciamento com status `pending` na home do painel.

**Architecture:** Reutilizar a derivação `isPending` já existente em `PainelHome`. O componente renderizará um bloco condicional dentro do card, e `styles.ts` fornecerá o tratamento visual sem alterar navegação ou regras de status.

**Tech Stack:** React 19, TypeScript, styled-components, lucide-react, Vitest, Testing Library.

## Global Constraints

- Alterar somente a home do painel, seus estilos e teste relacionado.
- Manter cards `active`, `rejected`, `suspended` e `available` sem o novo aviso.
- Manter o card pendente sem botão de nova solicitação.
- Preservar acentos em UTF-8 sem BOM.

---

### Task 1: Aviso visual no card pendente

**Files:**
- Modify: `project/nexor/src/pages/painel/PainelHome/index.tsx`
- Modify: `project/nexor/src/pages/painel/PainelHome/styles.ts`
- Test: `project/nexor/src/pages/painel/PainelHome/index.test.tsx`

**Interfaces:**
- Consumes: `ProductRoleStatus`, `isPending`, `RoleActionCard` and existing `RoleActionMeta` styles.
- Produces: a visible pending notice with text `Cadastro enviado. Aguarde a Nexor verificar seus dados para seguir para aprovação.` inside each pending licensing card.

- [ ] **Step 1: Write the failing test**

Add a test to `PainelHome` that renders a dentist product role with `{ productKey: 'biteplaner', role: 'dentist', status: 'pending' }`, finds the dentist card, and asserts that it contains the pending notice text.

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm run test:run -- src/pages/painel/PainelHome/index.test.tsx
```

Expected: the new assertion fails because the pending card does not yet render the notice.

- [ ] **Step 3: Implement the minimal component and style changes**

In the pending branch of the card, render a styled notice after `RoleActionMeta`:

```tsx
{isPending ? (
  <S.PendingLicensingNotice role="status">
    <Clock3 size={18} aria-hidden="true" />
    <span>Cadastro enviado. Aguarde a Nexor verificar seus dados para seguir para aprovação.</span>
  </S.PendingLicensingNotice>
) : null}
```

Add `PendingLicensingNotice` to `styles.ts` with a visible warning border/background, compact spacing, readable line-height, and responsive wrapping.

- [ ] **Step 4: Run focused tests and build**

Run:

```bash
npm run test:run -- src/pages/painel/PainelHome/index.test.tsx
npm run build
```

Expected: all `PainelHome` tests pass and the production build exits successfully.

- [ ] **Step 5: Check encoding and diff**

Verify touched files contain no BOM or mojibake markers (`Ã`, `Â`, `â`, `�`), then review `git diff` for unrelated changes.

- [ ] **Step 6: Commit the implementation**

```bash
git add project/nexor/src/pages/painel/PainelHome/index.tsx project/nexor/src/pages/painel/PainelHome/styles.ts project/nexor/src/pages/painel/PainelHome/index.test.tsx
git commit -m "feat: highlight pending licensing review"
```