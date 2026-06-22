# Admin Mobile Data UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the administrative data UX so high-volume admin screens remain dense, searchable, actionable, and mobile-friendly without relying on horizontal tables.

**Architecture:** Add an explicit administrative component section inside the design system, split into shared admin primitives, desktop admin components, and mobile admin components. Then migrate admin screens from page-local responsive/card patterns to those design-system components, keeping desktop tables and replacing mobile tables with compact operational cards, filter sheets, detail sheets, and mobile-safe pagination.

**Tech Stack:** React 19, TypeScript, styled-components, Vite, Vitest, Playwright, `@nexor/design-system`, existing Nexor admin pages under `project/nexor/src/pages/painel/admin`.

## Global Constraints

- Preserve current backend APIs, permissions, payloads, status rules, and business logic.
- Desktop must not regress: complete tables stay available on wide viewports.
- Mobile admin must not require horizontal viewport scrolling for operational queues.
- Design system administrative components must live under a clearly separated admin section and be separated between mobile and desktop components.
- High-volume lists must support search/filter/pagination and avoid rendering hundreds of rows/cards at once.
- Touch targets for primary actions should be at least 44px high when action density allows it; compact text rows may be smaller only if an equivalent larger action target exists.
- Use Portuguese UI copy already present in the product; preserve UTF-8 accents.
- Before finishing UI/text changes, scan touched files for mojibake markers.
- Every visual change requires visual QA in `390x844` at minimum; for page migrations also validate `360x800`, `768x1024`, and desktop control.

---

## File Structure

### Design System

- Create: `project/packages/design-system/src/components/admin/index.ts`
  - Public export surface for administrative components.
- Create: `project/packages/design-system/src/components/admin/shared/AdminCollectionToolbar.tsx`
  - Shared toolbar for search, filter trigger, sort trigger, and utility actions.
- Create: `project/packages/design-system/src/components/admin/shared/AdminCollectionToolbar.test.tsx`
  - Unit tests for toolbar responsive affordances.
- Create: `project/packages/design-system/src/components/admin/shared/AdminBulkActionBar.tsx`
  - Shared selection/action bar for high-volume queues.
- Create: `project/packages/design-system/src/components/admin/shared/AdminBulkActionBar.test.tsx`
  - Tests for selected count and action rendering.
- Create: `project/packages/design-system/src/components/admin/desktop/AdminDesktopDataTable.tsx`
  - Desktop wrapper around existing `AdminDataTable` behavior.
- Create: `project/packages/design-system/src/components/admin/desktop/AdminDesktopDataTable.test.tsx`
  - Tests for desktop-only table rendering and table actions.
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobileRecordCard.tsx`
  - Compact mobile card component for a single administrative record.
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobileRecordCard.test.tsx`
  - Tests for title, status, metadata, primary action, and secondary action menu slot.
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobileActionMenu.tsx`
  - Compact secondary-actions menu for mobile cards.
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobileActionMenu.test.tsx`
  - Tests for open/close, action labels, and keyboard escape.
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobileDetailSheet.tsx`
  - Mobile detail/action sheet replacing cramped modals for review workflows.
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobileDetailSheet.test.tsx`
  - Tests for header, scrollable body, sticky footer, Escape, overlay close.
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobilePagination.tsx`
  - Mobile-safe pagination: previous/next plus range summary.
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobilePagination.test.tsx`
  - Tests for disabled boundaries and displayed range.
- Create: `project/packages/design-system/src/components/admin/AdminResponsiveCollection.tsx`
  - Responsive collection switcher: desktop table on wide viewports, mobile cards on narrow viewports.
- Create: `project/packages/design-system/src/components/admin/AdminResponsiveCollection.test.tsx`
  - Tests for mobile/table split and empty/loading states.
- Modify: `project/packages/design-system/src/index.ts`
  - Export `components/admin`.
- Keep: existing `project/packages/design-system/src/components/AdminDataTable.tsx`, `AdminModal.tsx`, `AdminPagination.tsx`, `FilterSheet.tsx`
  - Do not remove in the first migration; wrap or reuse them to avoid broad breakage.

### App Admin Pages

- Modify: `project/nexor/src/pages/painel/admin/mobileCards.tsx`
  - Convert temporary app-local card helpers into thin adapters over design-system admin mobile components.
- Modify: `project/nexor/src/pages/painel/admin/AdminOrders.tsx`
  - First pilot migration to `AdminResponsiveCollection`.
- Modify: `project/nexor/src/pages/painel/admin/AdminOrders.test.tsx`
  - Tests for mobile cards, filters, pagination, and desktop table retention.
- Modify: `project/nexor/src/pages/painel/admin/AdminPartnerLicensing.tsx`
  - Migrate partner requests to design-system collection/card/detail sheet.
- Modify: `project/nexor/src/pages/painel/admin/AdminPartnerLicensing.test.tsx`
  - Tests for mobile card and review action.
- Modify: `project/nexor/src/pages/painel/admin/AdminAccountDeletions.tsx`
  - Migrate account deletion queue to mobile cards and detail sheet with textarea.
- Modify: `project/nexor/src/pages/painel/admin/AdminAccountDeletions.test.tsx`
  - Tests for decision sheet and textarea.
- Modify: `project/nexor/src/pages/painel/admin/AdminDentistLicensing.tsx`
  - Migrate dentist licensing queue to shared card pattern.
- Modify: `project/nexor/src/pages/painel/admin/AdminDentistLicensing.test.tsx`
  - Tests for CPF/CNPJ/status card essentials.
- Modify: `project/nexor/src/pages/painel/admin/AdminLabLicensing.tsx`
  - Migrate lab licensing queue to shared card pattern and detail sheet for locations.
- Modify: `project/nexor/src/pages/painel/admin/AdminLabLicensing.test.tsx`
  - Tests for lab location visibility in detail sheet.
- Modify: `project/nexor/src/pages/painel/admin/AdminUsers.tsx`
  - Migrate users queue to collection/card/action menu.
- Modify: `project/nexor/src/pages/painel/admin/AdminUsers.test.tsx`
  - Tests for profile filter and status action.
- Modify: `project/nexor/src/pages/painel/RelatoriosBiteplaner/index.tsx`
  - Apply report-specific rule: summary cards by default on mobile; table only for comparison/export flow.
- Modify: `project/nexor/src/pages/painel/RelatoriosBiteplaner/index.test.tsx`
  - Tests for mobile report summary, filters, and export action.

### Visual QA

- Create: `project/nexor/scripts/visual-qa-admin-mobile.mjs`
  - Playwright smoke runner for admin mobile data screens using `VITE_MOCK=true`.
- Create: `project/nexor/scripts/visual-qa-admin-mobile.test.mjs` or update existing E2E script tests if the repo does not use script tests.
  - Static check that the script covers all target routes and screenshots.
- Modify: `project/nexor/package.json`
  - Add `qa:visual:admin-mobile`.

---

## Task 1: Create Design System Admin Component Sections

**Files:**
- Create: `project/packages/design-system/src/components/admin/index.ts`
- Create directories:
  - `project/packages/design-system/src/components/admin/shared`
  - `project/packages/design-system/src/components/admin/desktop`
  - `project/packages/design-system/src/components/admin/mobile`
- Modify: `project/packages/design-system/src/index.ts`

**Interfaces:**
- Produces: `@nexor/design-system/components/admin` export surface.
- Consumes: existing design-system token/provider setup.

- [ ] **Step 1: Create failing export test**

Create `project/packages/design-system/src/components/admin/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import * as adminComponents from './index';

describe('admin design-system exports', () => {
  it('exposes separate shared, desktop, and mobile administrative component namespaces', () => {
    expect(adminComponents).toHaveProperty('AdminCollectionToolbar');
    expect(adminComponents).toHaveProperty('AdminDesktopDataTable');
    expect(adminComponents).toHaveProperty('AdminMobileRecordCard');
    expect(adminComponents).toHaveProperty('AdminResponsiveCollection');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd project/nexor
npm run test:run -- ../packages/design-system/src/components/admin/index.test.ts
```

Expected: FAIL because the admin index file/components do not exist.

- [ ] **Step 3: Create placeholder-free export structure**

Create `project/packages/design-system/src/components/admin/index.ts`:

```ts
export { AdminResponsiveCollection } from './AdminResponsiveCollection';
export type { AdminResponsiveCollectionProps } from './AdminResponsiveCollection';
export { AdminCollectionToolbar } from './shared/AdminCollectionToolbar';
export type { AdminCollectionToolbarProps } from './shared/AdminCollectionToolbar';
export { AdminBulkActionBar } from './shared/AdminBulkActionBar';
export type { AdminBulkActionBarProps } from './shared/AdminBulkActionBar';
export { AdminDesktopDataTable } from './desktop/AdminDesktopDataTable';
export type { AdminDesktopDataTableProps } from './desktop/AdminDesktopDataTable';
export { AdminMobileRecordCard } from './mobile/AdminMobileRecordCard';
export type { AdminMobileRecordCardProps } from './mobile/AdminMobileRecordCard';
export { AdminMobileActionMenu } from './mobile/AdminMobileActionMenu';
export type { AdminMobileActionMenuProps } from './mobile/AdminMobileActionMenu';
export { AdminMobileDetailSheet } from './mobile/AdminMobileDetailSheet';
export type { AdminMobileDetailSheetProps } from './mobile/AdminMobileDetailSheet';
export { AdminMobilePagination } from './mobile/AdminMobilePagination';
export type { AdminMobilePaginationProps } from './mobile/AdminMobilePagination';
```

Create minimal component files that render their children/slots with typed props. Full behavior is added in later tasks.

Modify `project/packages/design-system/src/index.ts` to export:

```ts
export * from './components/admin';
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd project/nexor
npm run test:run -- ../packages/design-system/src/components/admin/index.test.ts
```

Expected: PASS.

---

## Task 2: Implement Mobile Administrative Record Card

**Files:**
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobileRecordCard.tsx`
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobileRecordCard.test.tsx`

**Interfaces:**
- Produces:
  - `AdminMobileRecordCardProps`
  - `AdminMobileRecordCard`
- Consumes: React nodes, design-system tokens via styled-components theme.

- [ ] **Step 1: Write failing tests**

Test requirements:
- Renders title, subtitle, status, metadata.
- Renders only one visible primary action.
- Supports secondary action slot without layout overflow.
- Uses compact mobile density: card padding <= 14px, metadata text <= 12px.

Run:

```bash
cd project/nexor
npm run test:run -- ../packages/design-system/src/components/admin/mobile/AdminMobileRecordCard.test.tsx
```

Expected: FAIL before implementation.

- [ ] **Step 2: Implement component**

Component contract:

```ts
export interface AdminMobileRecordMetadataItem {
  label: string;
  value: ReactNode;
}

export interface AdminMobileRecordCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  status?: ReactNode;
  metadata?: AdminMobileRecordMetadataItem[];
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
}
```

Visual rules:
- `article`
- `border-radius: 8px`
- `padding: 12px`
- `display: grid`
- title row: title + status
- metadata grid: `repeat(2, minmax(0, 1fr))` on mobile
- no nested cards

- [ ] **Step 3: Run tests**

Run same test command. Expected: PASS.

---

## Task 3: Implement Mobile Action Menu And Detail Sheet

**Files:**
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobileActionMenu.tsx`
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobileActionMenu.test.tsx`
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobileDetailSheet.tsx`
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobileDetailSheet.test.tsx`

**Interfaces:**
- Produces:
  - `AdminMobileActionMenu`
  - `AdminMobileDetailSheet`
- Consumes: action definitions from page adapters.

- [ ] **Step 1: Write failing tests for action menu**

Cases:
- trigger opens menu;
- selecting action invokes callback;
- Escape closes menu;
- trigger has accessible name.

- [ ] **Step 2: Implement action menu**

Contract:

```ts
export interface AdminMobileActionMenuItem {
  label: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}

export interface AdminMobileActionMenuProps {
  label?: string;
  items: AdminMobileActionMenuItem[];
}
```

Default label: `Mais ações`.

- [ ] **Step 3: Write failing tests for detail sheet**

Cases:
- renders title and body;
- footer remains present;
- overlay click closes when `onClose` is provided;
- Escape closes;
- action buttons are full-width only when needed on narrow viewport.

- [ ] **Step 4: Implement detail sheet**

Contract:

```ts
export interface AdminMobileDetailSheetProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}
```

Visual rules:
- fixed inset bottom sheet on mobile;
- max-height `min(88vh, 720px)`;
- body scrolls;
- footer sticky at bottom.

- [ ] **Step 5: Run tests**

Run:

```bash
cd project/nexor
npm run test:run -- ../packages/design-system/src/components/admin/mobile/AdminMobileActionMenu.test.tsx ../packages/design-system/src/components/admin/mobile/AdminMobileDetailSheet.test.tsx
```

Expected: PASS.

---

## Task 4: Implement Responsive Collection, Toolbar, Bulk Bar, And Pagination

**Files:**
- Create: `project/packages/design-system/src/components/admin/AdminResponsiveCollection.tsx`
- Create: `project/packages/design-system/src/components/admin/AdminResponsiveCollection.test.tsx`
- Create: `project/packages/design-system/src/components/admin/shared/AdminCollectionToolbar.tsx`
- Create: `project/packages/design-system/src/components/admin/shared/AdminCollectionToolbar.test.tsx`
- Create: `project/packages/design-system/src/components/admin/shared/AdminBulkActionBar.tsx`
- Create: `project/packages/design-system/src/components/admin/shared/AdminBulkActionBar.test.tsx`
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobilePagination.tsx`
- Create: `project/packages/design-system/src/components/admin/mobile/AdminMobilePagination.test.tsx`

**Interfaces:**
- Produces:
  - `AdminResponsiveCollection<T>`
  - `AdminCollectionToolbar`
  - `AdminBulkActionBar`
  - `AdminMobilePagination`

- [ ] **Step 1: Write failing responsive collection tests**

Requirements:
- table slot is rendered inside a desktop wrapper;
- cards slot is rendered inside a mobile wrapper;
- loading and empty states render in both modes;
- component does not make paging/data decisions.

Contract:

```ts
export interface AdminResponsiveCollectionProps<TItem> {
  items: TItem[];
  getItemKey: (item: TItem) => string;
  renderTable: (items: TItem[]) => ReactNode;
  renderCard: (item: TItem) => ReactNode;
  loading?: boolean;
  emptyState?: ReactNode;
  pagination?: ReactNode;
}
```

- [ ] **Step 2: Implement responsive collection**

Use CSS media queries:
- desktop wrapper visible above `768px`;
- mobile wrapper visible at `max-width: 768px`.

- [ ] **Step 3: Write failing toolbar tests**

Requirements:
- mobile renders search + filter trigger + sort trigger;
- desktop supports utility actions inline;
- filter trigger can show active count.

- [ ] **Step 4: Implement toolbar**

Contract:

```ts
export interface AdminCollectionToolbarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filterButton?: ReactNode;
  sortButton?: ReactNode;
  utilityActions?: ReactNode;
  activeFilterCount?: number;
}
```

- [ ] **Step 5: Write and implement bulk bar tests**

Contract:

```ts
export interface AdminBulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  children: ReactNode;
}
```

- [ ] **Step 6: Write and implement pagination tests**

Contract:

```ts
export interface AdminMobilePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
}
```

- [ ] **Step 7: Run tests**

Run all new design-system admin tests. Expected: PASS.

---

## Task 5: Pilot Migration - Admin Orders

**Files:**
- Modify: `project/nexor/src/pages/painel/admin/AdminOrders.tsx`
- Modify: `project/nexor/src/pages/painel/admin/AdminOrders.test.tsx`
- Modify only if necessary: `project/nexor/src/pages/painel/admin/AdminOrders.styles.ts`

**Interfaces:**
- Consumes:
  - `AdminResponsiveCollection`
  - `AdminMobileRecordCard`
  - `AdminCollectionToolbar`
  - `AdminMobilePagination`
- Produces: first screen using the final admin mobile data UX pattern.

- [ ] **Step 1: Write failing page tests**

Cases:
- mobile card includes order id, customer, status, stage, last update;
- desktop table is still present;
- filter trigger is available on mobile;
- pagination summary is available on mobile;
- no page-local table fallback is used as primary mobile UI.

- [ ] **Step 2: Implement Orders mobile cards**

Card essentials:
- title: order display id;
- status: status pill;
- subtitle: customer name/email;
- metadata: stage, created/updated date, assigned role if available;
- primary action: open/view order.

- [ ] **Step 3: Run focused tests**

Run:

```bash
cd project/nexor
npm run test:run -- src/pages/painel/admin/AdminOrders.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Visual QA pilot**

Run app in mock mode and capture:
- `/painel/admin/ordens` at `390x844`;
- `/painel/admin/ordens` at desktop control.

Check:
- no horizontal overflow;
- search/filter controls accessible;
- card primary action visible;
- desktop table still visible on desktop.

---

## Task 6: Migrate Operational Queues

**Files:**
- Modify:
  - `project/nexor/src/pages/painel/admin/AdminPartnerLicensing.tsx`
  - `project/nexor/src/pages/painel/admin/AdminAccountDeletions.tsx`
  - `project/nexor/src/pages/painel/admin/AdminDentistLicensing.tsx`
  - `project/nexor/src/pages/painel/admin/AdminLabLicensing.tsx`
  - `project/nexor/src/pages/painel/admin/AdminUsers.tsx`
- Modify matching tests.

**Interfaces:**
- Consumes design-system admin components from Tasks 2-4.
- Produces consistent high-volume mobile queue UX for all operational admin queues.

- [ ] **Step 1: Migrate Partner Licensing**

Card essentials:
- title: partner/company name;
- status: request status;
- subtitle: email;
- metadata: CNPJ/CPF summary, city/state, submitted date;
- primary action: `Analisar`.

Detail sheet:
- complete submitted payload;
- approve/reject footer actions.

- [ ] **Step 2: Migrate Account Deletions**

Card essentials:
- title: requester;
- status: deletion status;
- metadata: active order impact, requested date, refund impact if present;
- primary action: `Analisar`.

Detail sheet:
- impact summary;
- administrative note textarea;
- approve/reject footer actions.

- [ ] **Step 3: Migrate Dentist Licensing**

Card essentials:
- title: dentist name;
- status;
- metadata: CPF/CNPJ, city/state, submitted date;
- primary action: `Analisar`.

- [ ] **Step 4: Migrate Lab Licensing**

Card essentials:
- title: lab name;
- status;
- metadata: CPF/CNPJ, city/state, location count;
- primary action: `Analisar`.

Detail sheet must show lab locations.

- [ ] **Step 5: Migrate Users**

Card essentials:
- title: user name/email;
- status;
- metadata: profile/role, product access, created date;
- primary action: `Ver usuário` or current status action;
- secondary status changes in action menu/detail sheet.

- [ ] **Step 6: Run focused tests**

Run:

```bash
cd project/nexor
npm run test:run -- src/pages/painel/admin/AdminPartnerLicensing.test.tsx src/pages/painel/admin/AdminAccountDeletions.test.tsx src/pages/painel/admin/AdminDentistLicensing.test.tsx src/pages/painel/admin/AdminLabLicensing.test.tsx src/pages/painel/admin/AdminUsers.test.tsx
```

Expected: PASS.

---

## Task 7: Reports Mobile Pattern

**Files:**
- Modify: `project/nexor/src/pages/painel/RelatoriosBiteplaner/index.tsx`
- Modify: `project/nexor/src/pages/painel/RelatoriosBiteplaner/index.test.tsx`

**Interfaces:**
- Consumes:
  - `AdminCollectionToolbar`
  - `AdminMobileRecordCard`
  - existing CSV/export logic

- [ ] **Step 1: Write failing tests**

Cases:
- mobile first renders summary cards instead of a cramped table;
- table comparison mode remains available when needed;
- CSV export remains accessible;
- filters use sheet/compact toolbar.

- [ ] **Step 2: Implement mobile report summaries**

Report mobile default:
- top summary metrics;
- cards by report row or grouped section;
- comparison table hidden behind explicit `Ver tabela` or desktop-only control when comparison is central.

- [ ] **Step 3: Run focused tests**

Run:

```bash
cd project/nexor
npm run test:run -- src/pages/painel/RelatoriosBiteplaner/index.test.tsx
```

Expected: PASS.

---

## Task 8: Visual QA Runner For Admin Mobile

**Files:**
- Create: `project/nexor/scripts/visual-qa-admin-mobile.mjs`
- Modify: `project/nexor/package.json`

**Interfaces:**
- Produces command: `npm run qa:visual:admin-mobile`.
- Consumes Playwright and Vite app at `http://127.0.0.1:5173`.

- [ ] **Step 1: Create script**

Script requirements:
- assumes app is running with `VITE_MOCK=true`;
- opens admin persona with `localStorage.nexor_demo_persona = 'admin'`;
- validates routes:
  - `/painel/admin/home`
  - `/painel/admin/ordens`
  - `/painel/admin/relatorios`
  - `/painel/admin/parceiros`
  - `/painel/admin/remocoes-conta`
  - `/painel/admin/dentistas`
  - `/painel/admin/laboratorios`
  - `/painel/admin/usuarios`
  - `/painel/admin/configuracoes/negocio`
  - `/painel/admin/configuracoes/sistema`
- checks no horizontal overflow;
- checks no framework overlay;
- captures screenshots under `C:/Users/Pichau/Projetos/NexorProjects/run-logs/visual-qa/admin-mobile`.

- [ ] **Step 2: Add package script**

Modify `project/nexor/package.json`:

```json
"qa:visual:admin-mobile": "node scripts/visual-qa-admin-mobile.mjs"
```

- [ ] **Step 3: Run script manually**

Start Vite:

```powershell
$env:VITE_MOCK='true'; npm run dev -- --host 127.0.0.1 --port 5173
```

Run:

```bash
npm run qa:visual:admin-mobile
```

Expected:
- JSON summary with every route passing;
- screenshots generated;
- no horizontal overflow.

---

## Task 9: Final Verification

**Files:**
- All touched files from Tasks 1-8.

- [ ] **Step 1: Run focused tests**

Run all admin/design-system focused tests:

```bash
cd project/nexor
npm run test:run -- ../packages/design-system/src/components/admin src/pages/painel/admin src/pages/painel/RelatoriosBiteplaner/index.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

```bash
cd project/nexor
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Run full build**

```bash
cd project/nexor
npm run build
```

Expected: PASS. Vite chunk-size warnings are acceptable if no new chunk regression is introduced.

- [ ] **Step 4: Run visual QA**

```bash
cd project/nexor
npm run qa:visual:admin-mobile
```

Expected: PASS with screenshots.

- [ ] **Step 5: Scan for mojibake**

Run from `project/nexor`:

Use the standard mojibake marker scan from `AGENTS.md` against touched files under `src` and `../packages/design-system/src`.

Expected: no matches in touched files. If existing unrelated matches appear, inspect and fix only touched files unless the user requests a broader encoding cleanup.

---

## Self-Review

- Spec coverage: The plan covers the requested design-system administrative section, mobile/desktop separation, high-volume data handling, table-to-card mobile migration, filters, detail sheets, pagination, visual QA, and verification.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation step remains.
- Type consistency: Design-system component names and props are introduced before app migrations consume them.
