# Admin Mobile App Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an app-like mobile admin experience for Nexor with guided steps, bottom navigation, mobile filter sheets, sticky actions, and responsive list/detail alternatives to dense tables.

**Architecture:** Add small reusable panel components to the shared design system first, then wire them into the Nexor admin shell and the densest admin pages. Desktop behavior remains table/sidebar based; mobile gains a compact app shell, guided flows, and one-column content-first layouts through responsive CSS and targeted React state.

**Tech Stack:** React 19, TypeScript strict, styled-components, lucide-react, React Router, Vitest, Testing Library, existing `@nexor/design-system`.

---

## File Structure

- Create `project/packages/design-system/src/components/StickyActionBar.tsx`: fixed mobile action footer with primary/secondary actions and safe-area padding.
- Create `project/packages/design-system/src/components/StickyActionBar.test.tsx`: verifies actions, disabled/loading states, and mobile CSS.
- Create `project/packages/design-system/src/components/MobileStepFlow.tsx`: controlled stepper shell for mobile form/configuration workflows.
- Create `project/packages/design-system/src/components/MobileStepFlow.test.tsx`: verifies progress, back/next actions, completed summaries, and accessible labels.
- Create `project/packages/design-system/src/components/FilterSheet.tsx`: accessible bottom sheet for mobile filters.
- Create `project/packages/design-system/src/components/FilterSheet.test.tsx`: verifies open/close, Escape handling, apply/clear actions, and focusable controls.
- Create `project/packages/design-system/src/components/ResponsiveDataList.tsx`: renders a desktop table region plus a mobile card/list region from the same data.
- Create `project/packages/design-system/src/components/ResponsiveDataList.test.tsx`: verifies card rows, empty state, and responsive CSS.
- Modify `project/packages/design-system/src/index.ts`: export the new components and types.
- Modify `project/nexor/src/components/portal/PortalLayout/index.tsx`: add mobile admin drawer and bottom navigation, keep desktop sidebar unchanged.
- Modify `project/nexor/src/components/portal/PortalLayout/styles.ts`: hide sidebar on mobile, add compact topbar/menu button/drawer/bottom bar styles, and add bottom padding to content.
- Modify `project/nexor/src/components/portal/PortalLayout/PortalLayout.test.tsx`: cover admin bottom nav, mobile drawer, and CSS source rules.
- Modify `project/nexor/src/pages/painel/admin/AdminOrders.tsx`: add mobile filter sheet, active filter chips, and order cards via `ResponsiveDataList`.
- Modify `project/nexor/src/pages/painel/admin/AdminOrders.styles.ts`: add order card styling and mobile visibility helpers if page-local structure is needed.
- Modify `project/nexor/src/pages/painel/admin/AdminOrders.test.tsx`: cover mobile list content and filter sheet behavior.
- Modify `project/nexor/src/pages/painel/admin/AdminBusinessSettings.tsx`: wrap business settings in a mobile guided flow while preserving desktop sections.
- Modify `project/nexor/src/pages/painel/admin/AdminBusinessSettings.styles.ts`: add mobile-only step container visibility rules.
- Create `project/nexor/src/pages/painel/admin/AdminBusinessSettings.test.tsx`: cover step progress and sticky save actions.
- Modify `project/nexor/src/pages/painel/admin/AdminSystemSettings.tsx`: wrap system settings in a mobile guided flow with review/action steps.
- Modify `project/nexor/src/pages/painel/admin/AdminSystemSettings.styles.ts`: add mobile-only step container visibility rules.
- Create `project/nexor/src/pages/painel/admin/AdminSystemSettings.test.tsx`: cover step progress and sticky actions.

## Task 1: Design System Mobile Primitives

**Files:**
- Create: `project/packages/design-system/src/components/StickyActionBar.tsx`
- Create: `project/packages/design-system/src/components/StickyActionBar.test.tsx`
- Create: `project/packages/design-system/src/components/MobileStepFlow.tsx`
- Create: `project/packages/design-system/src/components/MobileStepFlow.test.tsx`
- Create: `project/packages/design-system/src/components/FilterSheet.tsx`
- Create: `project/packages/design-system/src/components/FilterSheet.test.tsx`
- Create: `project/packages/design-system/src/components/ResponsiveDataList.tsx`
- Create: `project/packages/design-system/src/components/ResponsiveDataList.test.tsx`
- Modify: `project/packages/design-system/src/index.ts`

- [ ] **Step 1: Write failing tests for `StickyActionBar`**

Create `project/packages/design-system/src/components/StickyActionBar.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { initDesignSystem } from '../provider';
import { StickyActionBar } from './StickyActionBar';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function renderBar() {
  const onPrimary = vi.fn();
  const onSecondary = vi.fn();

  render(
    <DesignSystemRoot>
      <StickyActionBar
        primaryLabel="Salvar e avançar"
        secondaryLabel="Voltar"
        onPrimary={onPrimary}
        onSecondary={onSecondary}
      />
    </DesignSystemRoot>
  );

  return { onPrimary, onSecondary };
}

describe('StickyActionBar', () => {
  it('renders primary and secondary actions with mobile-safe fixed positioning', () => {
    const { onPrimary, onSecondary } = renderBar();

    fireEvent.click(screen.getByRole('button', { name: /salvar e avançar/i }));
    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));

    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('sticky-action-bar')).toHaveStyle({ position: 'fixed' });
    expect(screen.getByTestId('sticky-action-bar')).toHaveStyle({ bottom: '0' });
  });

  it('disables the primary action while loading', () => {
    render(
      <DesignSystemRoot>
        <StickyActionBar primaryLabel="Publicar" onPrimary={vi.fn()} loading />
      </DesignSystemRoot>
    );

    expect(screen.getByRole('button', { name: /carregando/i })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run the `StickyActionBar` test to verify it fails**

Run:

```bash
npm run test:run -- StickyActionBar.test.tsx
```

Expected: fail because `./StickyActionBar` does not exist.

- [ ] **Step 3: Implement `StickyActionBar`**

Create `project/packages/design-system/src/components/StickyActionBar.tsx`:

```tsx
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export interface StickyActionBarProps {
  primaryLabel: ReactNode;
  onPrimary: () => void;
  secondaryLabel?: ReactNode;
  onSecondary?: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  loading?: boolean;
}

const Bar = styled.div<{ $tokens: BrandTokens }>`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 70;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid ${({ $tokens }) => $tokens.colors.border};
  background: ${({ $tokens }) => $tokens.colors.surface};
  box-shadow: 0 -10px 28px rgba(23, 23, 23, 0.1);

  @media (min-width: 769px) {
    display: none;
  }
`;

export function StickyActionBar({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryDisabled = false,
  secondaryDisabled = false,
  loading = false,
}: StickyActionBarProps) {
  const { tokens } = useDesignSystem();

  return (
    <Bar $tokens={tokens} data-testid="sticky-action-bar">
      {secondaryLabel && onSecondary ? (
        <Button
          type="button"
          variant="secondary"
          fullWidth
          disabled={secondaryDisabled || loading}
          onClick={onSecondary}
        >
          {secondaryLabel}
        </Button>
      ) : null}
      <Button
        type="button"
        fullWidth
        loading={loading}
        disabled={primaryDisabled}
        onClick={onPrimary}
      >
        {primaryLabel}
      </Button>
    </Bar>
  );
}
```

- [ ] **Step 4: Write failing tests for `MobileStepFlow`**

Create `project/packages/design-system/src/components/MobileStepFlow.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { initDesignSystem } from '../provider';
import { MobileStepFlow, type MobileStepDefinition } from './MobileStepFlow';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

const steps: MobileStepDefinition[] = [
  { id: 'main', title: 'Dados principais', summary: 'Nome e contato' },
  { id: 'docs', title: 'Licença e documentos', summary: 'CRO e arquivos' },
  { id: 'review', title: 'Revisão', summary: 'Conferência final' },
];

describe('MobileStepFlow', () => {
  it('shows progress, active content and navigation callbacks', () => {
    const onStepChange = vi.fn();

    render(
      <DesignSystemRoot>
        <MobileStepFlow
          steps={steps}
          activeStepId="docs"
          onStepChange={onStepChange}
          renderStep={(step) => <p>Conteúdo de {step.title}</p>}
        />
      </DesignSystemRoot>
    );

    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /licença e documentos/i })).toBeInTheDocument();
    expect(screen.getByText(/conteúdo de licença e documentos/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /voltar para dados principais/i }));
    expect(onStepChange).toHaveBeenCalledWith('main');

    fireEvent.click(screen.getByRole('button', { name: /avançar para revisão/i }));
    expect(onStepChange).toHaveBeenCalledWith('review');
  });
});
```

- [ ] **Step 5: Run the `MobileStepFlow` test to verify it fails**

Run:

```bash
npm run test:run -- MobileStepFlow.test.tsx
```

Expected: fail because `./MobileStepFlow` does not exist.

- [ ] **Step 6: Implement `MobileStepFlow`**

Create `project/packages/design-system/src/components/MobileStepFlow.tsx`:

```tsx
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export interface MobileStepDefinition {
  id: string;
  title: string;
  summary?: ReactNode;
}

export interface MobileStepFlowProps {
  steps: MobileStepDefinition[];
  activeStepId: string;
  onStepChange: (stepId: string) => void;
  renderStep: (step: MobileStepDefinition) => ReactNode;
}

const Wrap = styled.section<{ $tokens: BrandTokens }>`
  display: grid;
  gap: 16px;

  @media (min-width: 769px) {
    display: none;
  }
`;

const Header = styled.header`
  display: grid;
  gap: 8px;
`;

const Progress = styled.span<{ $tokens: BrandTokens }>`
  width: fit-content;
  padding: 3px 8px;
  border-radius: ${({ $tokens }) => $tokens.radius.sm};
  background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  font-size: 12px;
  font-weight: 700;
`;

const Title = styled.h2<{ $tokens: BrandTokens }>`
  margin: 0;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-size: 20px;
  line-height: 1.2;
`;

const Summary = styled.p<{ $tokens: BrandTokens }>`
  margin: 0;
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  font-size: 13px;
  line-height: 1.5;
`;

const Body = styled.div`
  min-width: 0;
`;

const Nav = styled.div`
  display: flex;
  gap: 10px;
`;

export function MobileStepFlow({ steps, activeStepId, onStepChange, renderStep }: MobileStepFlowProps) {
  const { tokens } = useDesignSystem();
  const activeIndex = Math.max(0, steps.findIndex((step) => step.id === activeStepId));
  const activeStep = steps[activeIndex] ? steps[activeIndex] : steps[0];
  const previousStep = activeIndex > 0 ? steps[activeIndex - 1] : null;
  const nextStep = activeIndex < steps.length - 1 ? steps[activeIndex + 1] : null;

  return (
    <Wrap $tokens={tokens} aria-label="Fluxo guiado mobile">
      <Header>
        <Progress $tokens={tokens}>{activeIndex + 1}/{steps.length}</Progress>
        <Title $tokens={tokens}>{activeStep.title}</Title>
        {activeStep.summary ? <Summary $tokens={tokens}>{activeStep.summary}</Summary> : null}
      </Header>
      <Body>{renderStep(activeStep)}</Body>
      <Nav>
        {previousStep ? (
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => onStepChange(previousStep.id)}
          >
            Voltar para {previousStep.title}
          </Button>
        ) : null}
        {nextStep ? (
          <Button
            type="button"
            fullWidth
            onClick={() => onStepChange(nextStep.id)}
          >
            Avançar para {nextStep.title}
          </Button>
        ) : null}
      </Nav>
    </Wrap>
  );
}
```

- [ ] **Step 7: Write failing tests for `FilterSheet`**

Create `project/packages/design-system/src/components/FilterSheet.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { initDesignSystem } from '../provider';
import { FilterSheet } from './FilterSheet';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

describe('FilterSheet', () => {
  it('renders children and calls close, clear and apply actions', () => {
    const onClose = vi.fn();
    const onClear = vi.fn();
    const onApply = vi.fn();

    render(
      <DesignSystemRoot>
        <FilterSheet open title="Filtros de ordens" onClose={onClose} onClear={onClear} onApply={onApply}>
          <label htmlFor="status">Status</label>
          <input id="status" />
        </FilterSheet>
      </DesignSystemRoot>
    );

    expect(screen.getByRole('dialog', { name: /filtros de ordens/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /limpar filtros/i }));
    fireEvent.click(screen.getByRole('button', { name: /aplicar filtros/i }));
    fireEvent.click(screen.getByRole('button', { name: /fechar filtros/i }));

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when closed', () => {
    render(
      <DesignSystemRoot>
        <FilterSheet open={false} title="Filtros" onClose={vi.fn()} onClear={vi.fn()} onApply={vi.fn()}>
          <span>Conteúdo</span>
        </FilterSheet>
      </DesignSystemRoot>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Implement `FilterSheet`**

Create `project/packages/design-system/src/components/FilterSheet.tsx`:

```tsx
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import styled from 'styled-components';
import { Button } from './Button';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export interface FilterSheetProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  align-items: end;
  background: rgba(0, 0, 0, 0.42);

  @media (min-width: 769px) {
    display: none;
  }
`;

const Sheet = styled.div<{ $tokens: BrandTokens }>`
  width: 100%;
  max-height: min(82vh, 680px);
  overflow: auto;
  display: grid;
  gap: 16px;
  padding: 18px 16px calc(16px + env(safe-area-inset-bottom));
  border-radius: 16px 16px 0 0;
  background: ${({ $tokens }) => $tokens.colors.surface};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h2<{ $tokens: BrandTokens }>`
  margin: 0;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-size: 18px;
`;

const IconButton = styled.button<{ $tokens: BrandTokens }>`
  width: 40px;
  height: 40px;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.sm};
  background: ${({ $tokens }) => $tokens.colors.surface};
  color: ${({ $tokens }) => $tokens.colors.text};
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

export function FilterSheet({ open, title, children, onClose, onClear, onApply }: FilterSheetProps) {
  const { tokens } = useDesignSystem();

  if (!open) return null;

  return (
    <Overlay
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Sheet $tokens={tokens} role="dialog" aria-modal="true" aria-label={title}>
        <Header>
          <Title $tokens={tokens}>{title}</Title>
          <IconButton $tokens={tokens} type="button" aria-label="Fechar filtros" onClick={onClose}>
            <X size={16} aria-hidden />
          </IconButton>
        </Header>
        {children}
        <Actions>
          <Button type="button" variant="secondary" fullWidth onClick={onClear}>
            Limpar filtros
          </Button>
          <Button type="button" fullWidth onClick={onApply}>
            Aplicar filtros
          </Button>
        </Actions>
      </Sheet>
    </Overlay>
  );
}
```

- [ ] **Step 9: Write failing tests for `ResponsiveDataList`**

Create `project/packages/design-system/src/components/ResponsiveDataList.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { initDesignSystem } from '../provider';
import { ResponsiveDataList } from './ResponsiveDataList';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

describe('ResponsiveDataList', () => {
  it('renders desktop content and mobile cards from the same wrapper', () => {
    render(
      <DesignSystemRoot>
        <ResponsiveDataList
          desktop={<table><tbody><tr><td>Desktop BP-001</td></tr></tbody></table>}
          data={[{ id: 'BP-001', name: 'Marina Demo' }]}
          keyExtractor={(row) => row.id}
          renderCard={(row) => <article>{row.id} {row.name}</article>}
          emptyMessage="Nenhum registro"
        />
      </DesignSystemRoot>
    );

    expect(screen.getByText('Desktop BP-001')).toBeInTheDocument();
    expect(screen.getByText(/bp-001 marina demo/i)).toBeInTheDocument();
    expect(screen.getByTestId('responsive-data-list-mobile')).toBeInTheDocument();
  });

  it('renders the mobile empty message when data is empty', () => {
    render(
      <DesignSystemRoot>
        <ResponsiveDataList
          desktop={<div>Tabela vazia</div>}
          data={[]}
          keyExtractor={(row: { id: string }) => row.id}
          renderCard={(row: { id: string }) => <article>{row.id}</article>}
          emptyMessage="Nenhuma ordem encontrada"
        />
      </DesignSystemRoot>
    );

    expect(screen.getByText('Nenhuma ordem encontrada')).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: Implement `ResponsiveDataList`**

Create `project/packages/design-system/src/components/ResponsiveDataList.tsx`:

```tsx
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export interface ResponsiveDataListProps<T> {
  desktop: ReactNode;
  data: T[];
  keyExtractor: (row: T) => string;
  renderCard: (row: T) => ReactNode;
  emptyMessage: ReactNode;
}

const DesktopOnly = styled.div`
  min-width: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileOnly = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    gap: 10px;
  }
`;

const Empty = styled.div<{ $tokens: BrandTokens }>`
  padding: 18px 14px;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.lg};
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
  font-size: 14px;
`;

export function ResponsiveDataList<T>({
  desktop,
  data,
  keyExtractor,
  renderCard,
  emptyMessage,
}: ResponsiveDataListProps<T>) {
  const { tokens } = useDesignSystem();

  return (
    <>
      <DesktopOnly data-testid="responsive-data-list-desktop">{desktop}</DesktopOnly>
      <MobileOnly data-testid="responsive-data-list-mobile">
        {data.length === 0 ? (
          <Empty $tokens={tokens}>{emptyMessage}</Empty>
        ) : (
          data.map((row) => <div key={keyExtractor(row)}>{renderCard(row)}</div>)
        )}
      </MobileOnly>
    </>
  );
}
```

- [ ] **Step 11: Export new design-system components**

Modify `project/packages/design-system/src/index.ts` by adding:

```ts
export { StickyActionBar, type StickyActionBarProps } from './components/StickyActionBar';
export {
  MobileStepFlow,
  type MobileStepDefinition,
  type MobileStepFlowProps,
} from './components/MobileStepFlow';
export { FilterSheet, type FilterSheetProps } from './components/FilterSheet';
export {
  ResponsiveDataList,
  type ResponsiveDataListProps,
} from './components/ResponsiveDataList';
```

- [ ] **Step 12: Run design-system component tests**

Run:

```bash
npm run test:run -- StickyActionBar.test.tsx MobileStepFlow.test.tsx FilterSheet.test.tsx ResponsiveDataList.test.tsx
```

Expected: all four component test files pass.

- [ ] **Step 13: Commit design-system primitives**

Run:

```bash
git add project/packages/design-system/src/components/StickyActionBar.tsx project/packages/design-system/src/components/StickyActionBar.test.tsx project/packages/design-system/src/components/MobileStepFlow.tsx project/packages/design-system/src/components/MobileStepFlow.test.tsx project/packages/design-system/src/components/FilterSheet.tsx project/packages/design-system/src/components/FilterSheet.test.tsx project/packages/design-system/src/components/ResponsiveDataList.tsx project/packages/design-system/src/components/ResponsiveDataList.test.tsx project/packages/design-system/src/index.ts
git commit -m "feat: add mobile panel primitives"
```

## Task 2: App-Like Mobile Admin Shell

**Files:**
- Modify: `project/nexor/src/components/portal/PortalLayout/index.tsx`
- Modify: `project/nexor/src/components/portal/PortalLayout/styles.ts`
- Modify: `project/nexor/src/components/portal/PortalLayout/PortalLayout.test.tsx`

- [ ] **Step 1: Write failing shell tests**

Append these tests to `project/nexor/src/components/portal/PortalLayout/PortalLayout.test.tsx`:

```tsx
it('renders app-like admin mobile navigation destinations', () => {
  renderLayout('/painel/admin/ordens', {
    backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
    demoPersona: 'admin',
  });

  expect(screen.getByRole('navigation', { name: /navegação principal mobile/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/painel/admin/home');
  expect(screen.getByRole('link', { name: /ordens/i })).toHaveAttribute('href', '/painel/admin/ordens');
  expect(screen.getByRole('link', { name: /usuários/i })).toHaveAttribute('href', '/painel/admin/usuarios');
  expect(screen.getByRole('link', { name: /configurações/i })).toHaveAttribute(
    'href',
    '/painel/admin/configuracoes/negocio'
  );
});

it('opens the mobile admin drawer with secondary admin destinations', () => {
  renderLayout('/painel/admin/home', {
    backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
    demoPersona: 'admin',
  });

  fireEvent.click(screen.getByRole('button', { name: /abrir menu mobile/i }));

  expect(screen.getByRole('dialog', { name: /menu administrativo/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /parceiros/i })).toHaveAttribute('href', '/painel/admin/parceiros');
  expect(screen.getByRole('link', { name: /dentistas/i })).toHaveAttribute('href', '/painel/admin/dentistas');
  expect(screen.getByRole('link', { name: /laboratórios/i })).toHaveAttribute('href', '/painel/admin/laboratorios');
});

it('contains responsive CSS that removes the desktop sidebar from mobile flow', () => {
  const source = readFileSync(join(process.cwd(), 'src/components/portal/PortalLayout/styles.ts'), 'utf8');

  expect(source).toContain('@media (max-width: 768px)');
  expect(source).toContain('display: none');
  expect(source).toContain('padding-bottom: calc(76px + env(safe-area-inset-bottom))');
});
```

- [ ] **Step 2: Run shell tests to verify failure**

Run:

```bash
npm run test:run -- PortalLayout.test.tsx
```

Expected: fail because mobile nav/drawer elements are not implemented.

- [ ] **Step 3: Update `PortalLayout` imports and state**

In `project/nexor/src/components/portal/PortalLayout/index.tsx`, add `Menu` to the lucide import and add state inside `PortalLayout`:

```tsx
import { LayoutDashboard, LogOut, Bell, ChevronLeft, ChevronRight, User, ShieldCheck, FlaskConical, Stethoscope, Handshake, X, Boxes, BriefcaseBusiness, ClipboardList, Settings2, UserRound, Home, FileText, Star, Link2, Menu } from 'lucide-react';
```

Inside the component state block:

```tsx
const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false);
```

Add this effect near the route scroll effect:

```tsx
useEffect(() => {
  setMobileAdminMenuOpen(false);
}, [location.pathname]);
```

- [ ] **Step 4: Add bottom navigation definitions**

Add below `ADMIN_NAV_ITEMS`:

```tsx
const ADMIN_MOBILE_PRIMARY_NAV_ITEMS = [
  { to: '/painel/admin/home', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/painel/admin/ordens', label: 'Ordens', Icon: ClipboardList },
  { to: '/painel/admin/usuarios', label: 'Usuários', Icon: UserRound },
  { to: '/painel/admin/configuracoes/negocio', label: 'Configurações', Icon: Settings2 },
];
```

- [ ] **Step 5: Render mobile menu button, drawer and bottom navigation**

In the topbar, before `<S.TopbarGreeting>`, add:

```tsx
{isAdmin ? (
  <S.MobileMenuBtn
    type="button"
    aria-label="Abrir menu mobile"
    onClick={() => setMobileAdminMenuOpen(true)}
  >
    <Menu size={18} aria-hidden />
  </S.MobileMenuBtn>
) : null}
```

After the notification modal block and before `<S.Sidebar ...>`, add:

```tsx
{isAdmin && mobileAdminMenuOpen ? (
  <S.MobileDrawerOverlay
    role="presentation"
    onClick={(event) => {
      if (event.target === event.currentTarget) {
        setMobileAdminMenuOpen(false);
      }
    }}
  >
    <S.MobileDrawer role="dialog" aria-modal="true" aria-label="Menu administrativo">
      <S.MobileDrawerHeader>
        <S.MobileDrawerTitle>Admin Nexor</S.MobileDrawerTitle>
        <S.MobileMenuBtn
          type="button"
          aria-label="Fechar menu mobile"
          onClick={() => setMobileAdminMenuOpen(false)}
        >
          <X size={18} aria-hidden />
        </S.MobileMenuBtn>
      </S.MobileDrawerHeader>
      <S.MobileDrawerNav>
        {ADMIN_NAV_ITEMS.map(({ to, label, Icon }) => (
          <S.MobileDrawerLink key={to} to={to}>
            <Icon size={16} aria-hidden />
            {label}
          </S.MobileDrawerLink>
        ))}
      </S.MobileDrawerNav>
    </S.MobileDrawer>
  </S.MobileDrawerOverlay>
) : null}
```

Inside `<S.ContentArea>`, after `</S.ContentScroll>` and before closing `</S.ContentArea>`, add:

```tsx
{isAdmin ? (
  <S.MobileBottomNav aria-label="Navegação principal mobile">
    {ADMIN_MOBILE_PRIMARY_NAV_ITEMS.map(({ to, label, Icon }) => (
      <S.MobileBottomNavLink key={to} to={to}>
        <Icon size={17} aria-hidden />
        <span>{label}</span>
      </S.MobileBottomNavLink>
    ))}
  </S.MobileBottomNav>
) : null}
```

- [ ] **Step 6: Add mobile shell styles**

In `project/nexor/src/components/portal/PortalLayout/styles.ts`, add:

```tsx
export const MobileMenuBtn = styled.button`
  width: 40px;
  height: 40px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

export const MobileDrawerOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 110;
  display: none;
  background: rgba(0, 0, 0, 0.42);

  @media (max-width: 768px) {
    display: block;
  }
`;

export const MobileDrawer = styled.aside`
  width: min(320px, 86vw);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bgElevated};
  border-right: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const MobileDrawerHeader = styled.div`
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

export const MobileDrawerTitle = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
`;

export const MobileDrawerNav = styled.nav`
  display: grid;
  padding: 8px;
`;

export const MobileDrawerLink = styled(NavLink)`
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;

  &.active {
    background: ${({ theme }) => theme.colors.bgInset};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const MobileBottomNav = styled.nav`
  display: none;

  @media (max-width: 768px) {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 60;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    min-height: calc(64px + env(safe-area-inset-bottom));
    padding: 6px 6px calc(6px + env(safe-area-inset-bottom));
    border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
    background: ${({ theme }) => theme.colors.bgElevated};
  }
`;

export const MobileBottomNavLink = styled(NavLink)`
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  font-size: 10px;
  font-weight: 700;

  &.active {
    background: ${({ theme }) => theme.colors.bgInset};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
```

Also update existing components:

```tsx
export const Sidebar = styled.nav<{ $collapsed: boolean }>`
  /* keep existing declarations */

  @media (max-width: 768px) {
    display: none;
  }
`;
```

```tsx
export const Topbar = styled.div`
  /* keep existing declarations */

  @media (max-width: 768px) {
    padding: 0 12px;
  }
`;
```

```tsx
export const ContentInner = styled(motion.main)`
  /* keep existing declarations */

  @media (max-width: 768px) {
    padding-bottom: calc(76px + env(safe-area-inset-bottom));
  }
`;
```

- [ ] **Step 7: Run shell tests**

Run:

```bash
npm run test:run -- PortalLayout.test.tsx
```

Expected: pass.

- [ ] **Step 8: Commit mobile shell**

Run:

```bash
git add project/nexor/src/components/portal/PortalLayout/index.tsx project/nexor/src/components/portal/PortalLayout/styles.ts project/nexor/src/components/portal/PortalLayout/PortalLayout.test.tsx
git commit -m "feat: add mobile admin app shell"
```

## Task 3: Admin Orders Mobile List and Filter Sheet

**Files:**
- Modify: `project/nexor/src/pages/painel/admin/AdminOrders.tsx`
- Modify: `project/nexor/src/pages/painel/admin/AdminOrders.styles.ts`
- Modify: `project/nexor/src/pages/painel/admin/AdminOrders.test.tsx`

- [ ] **Step 1: Write failing tests for mobile cards and filter sheet**

Append to `project/nexor/src/pages/painel/admin/AdminOrders.test.tsx`:

```tsx
it('renders mobile order cards with prioritized operational content', async () => {
  mockApiGet.mockResolvedValueOnce({
    orders: [
      {
        id: 'BP-DEMO-004',
        status: 'awaiting_dentist_forms',
        statusLabel: 'Aguardando preenchimento dentista',
        stage: 'awaiting_dentist_forms',
        created_at: '2026-05-02T12:00:00.000Z',
        customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
        operationalReadiness: {
          preLabReady: false,
          pendingItems: [],
          summary: 'Pendências antes da liberação.',
        },
      },
    ],
  });

  renderPage();

  expect(await screen.findByTestId('admin-orders-mobile-list')).toBeInTheDocument();
  const card = screen.getByTestId('admin-order-card-BP-DEMO-004');
  expect(within(card).getByText('BP-DEMO-004')).toBeInTheDocument();
  expect(within(card).getByText('Joao Demo')).toBeInTheDocument();
  expect(within(card).getByText(/pendências antes da liberação/i)).toBeInTheDocument();
});

it('opens mobile filters in a sheet and shows active filter chips', async () => {
  mockApiGet.mockResolvedValueOnce({
    orders: [
      {
        id: 'BP-DEMO-004',
        status: 'awaiting_dentist_forms',
        statusLabel: 'Aguardando preenchimento dentista',
        stage: 'awaiting_dentist_forms',
        created_at: '2026-05-02T12:00:00.000Z',
        customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
        operationalReadiness: { preLabReady: false, pendingItems: [], summary: 'Pendente.' },
      },
      {
        id: 'BP-DEMO-005',
        status: 'lab_processing',
        statusLabel: 'Em processo - Laboratório',
        stage: 'lab_production',
        created_at: '2026-05-03T08:00:00.000Z',
        customer: { full_name: 'Marina Demo', email: 'marina@nexor.dev', phone: null },
        operationalReadiness: { preLabReady: true, pendingItems: [], summary: 'Pronta.' },
      },
    ],
  });

  renderPage();

  fireEvent.click(await screen.findByRole('button', { name: /abrir filtros de ordens/i }));
  expect(screen.getByRole('dialog', { name: /filtros de ordens/i })).toBeInTheDocument();

  const statusFilter = screen.getByTestId('admin-orders-mobile-filter-status');
  fireEvent.click(within(statusFilter).getByRole('button', { name: /todos os status/i }));
  fireEvent.click(screen.getByRole('option', { name: /em processo - laboratório/i }));
  fireEvent.click(screen.getByRole('button', { name: /aplicar filtros/i }));

  expect(screen.getByText(/status: em processo - laboratório/i)).toBeInTheDocument();
  expect(screen.queryByText('BP-DEMO-004')).not.toBeInTheDocument();
  expect(screen.getByText('BP-DEMO-005')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run admin orders tests to verify failure**

Run:

```bash
npm run test:run -- AdminOrders.test.tsx
```

Expected: fail because `admin-orders-mobile-list`, mobile filter controls, and card rendering do not exist.

- [ ] **Step 3: Update imports and state**

In `project/nexor/src/pages/painel/admin/AdminOrders.tsx`, update the design-system import:

```tsx
import { Button, DataTable, Field, FilterSheet, MultiSelect, ResponsiveDataList, StatusIndicator, type DataTableColumn } from '@nexor/design-system';
```

Add local state:

```tsx
const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
```

Add helper near `filteredOrders`:

```tsx
const activeFilterLabels = useMemo(() => {
  const statusLabels = statusFilter
    .map((value) => STATUS_OPTIONS.find((option) => option.value === value)?.label)
    .filter((label): label is string => Boolean(label))
    .map((label) => `Status: ${label}`);
  const stageLabels = stageFilter
    .map((value) => stageOptions.find((option) => option.value === value)?.label)
    .filter((label): label is string => Boolean(label))
    .map((label) => `Etapa: ${label}`);

  return [...statusLabels, ...stageLabels];
}, [stageFilter, stageOptions, statusFilter]);
```

- [ ] **Step 4: Add order card styles**

In `project/nexor/src/pages/painel/admin/AdminOrders.styles.ts`, append:

```tsx
export const MobileFilterTriggerRow = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

export const DesktopFilters = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

export const FilterChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const FilterChip = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.bgInset};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 700;
`;

export const MobileListWrap = styled.div`
  display: grid;
  gap: 10px;
`;

export const OrderCard = styled.article`
  min-width: 0;
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const OrderCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

export const OrderCardTitle = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
`;

export const OrderCardMeta = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;
```

- [ ] **Step 5: Render mobile controls and responsive list**

In the `TableSection`, replace the existing `FilterBar` and `DataTable` block with:

```tsx
<S.DesktopFilters>
  <FilterBar>
    <Field
      as="input"
      label="Buscar"
      placeholder="Buscar por pedido, cliente ou e-mail..."
      value={search}
      onChange={(event) => {
        setSearch(event.target.value);
      }}
    />

    <div data-testid="admin-orders-filter-status">
      <MultiSelect
        options={STATUS_OPTIONS}
        value={statusFilter}
        onChange={setStatusFilter}
        placeholder="Todos os status"
        label="Status"
      />
    </div>

    <div data-testid="admin-orders-filter-stage">
      <MultiSelect
        options={stageOptions}
        value={stageFilter}
        onChange={setStageFilter}
        placeholder="Todas as etapas"
        label="Etapa"
      />
    </div>
  </FilterBar>
</S.DesktopFilters>

<S.MobileFilterTriggerRow>
  <Field
    as="input"
    label="Buscar"
    placeholder="Pedido, cliente ou e-mail"
    value={search}
    onChange={(event) => setSearch(event.target.value)}
  />
  <Button type="button" variant="secondary" onClick={() => setMobileFiltersOpen(true)}>
    Abrir filtros de ordens
  </Button>
</S.MobileFilterTriggerRow>

{activeFilterLabels.length > 0 ? (
  <S.FilterChipRow aria-label="Filtros ativos">
    {activeFilterLabels.map((label) => (
      <S.FilterChip key={label}>{label}</S.FilterChip>
    ))}
  </S.FilterChipRow>
) : null}

<ResponsiveDataList
  desktop={
    <div data-testid="admin-orders-table">
      <DataTable
        data={filteredOrders}
        columns={columns}
        keyExtractor={(row) => row.id}
        pageSize={6}
        emptyMessage={loading ? 'Carregando ordens...' : 'Nenhuma ordem encontrada para os filtros aplicados.'}
      />
    </div>
  }
  data={filteredOrders}
  keyExtractor={(row) => row.id}
  emptyMessage={loading ? 'Carregando ordens...' : 'Nenhuma ordem encontrada para os filtros aplicados.'}
  renderCard={(row) => {
    const presentation = getOrderStatusPresentation(row);
    return (
      <S.OrderCard data-testid={`admin-order-card-${row.id}`}>
        <S.OrderCardHeader>
          <div>
            <S.OrderCardTitle>{row.id}</S.OrderCardTitle>
            <S.OrderCardMeta>{row.customer?.full_name ? row.customer.full_name : 'Não identificado'}</S.OrderCardMeta>
          </div>
          <StatusIndicator color={presentation.color} label={presentation.label} />
        </S.OrderCardHeader>
        <S.OrderCardMeta>Etapa: {getStageLabel(row)}</S.OrderCardMeta>
        <S.ReadinessText>
          {row.operationalReadiness?.summary ? row.operationalReadiness.summary : 'Sem pendência operacional registrada.'}
        </S.ReadinessText>
        <S.OrderCardMeta>Atualizado em {formatDate(row.created_at)}</S.OrderCardMeta>
      </S.OrderCard>
    );
  }}
/>

<div data-testid="admin-orders-mobile-list">
  <S.MobileListWrap />
</div>

<FilterSheet
  open={mobileFiltersOpen}
  title="Filtros de ordens"
  onClose={() => setMobileFiltersOpen(false)}
  onClear={() => {
    setStatusFilter([]);
    setStageFilter([]);
  }}
  onApply={() => setMobileFiltersOpen(false)}
>
  <div data-testid="admin-orders-mobile-filter-status">
    <MultiSelect
      options={STATUS_OPTIONS}
      value={statusFilter}
      onChange={setStatusFilter}
      placeholder="Todos os status"
      label="Status"
    />
  </div>
  <div data-testid="admin-orders-mobile-filter-stage">
    <MultiSelect
      options={stageOptions}
      value={stageFilter}
      onChange={setStageFilter}
      placeholder="Todas as etapas"
      label="Etapa"
    />
  </div>
</FilterSheet>
```

If the empty `admin-orders-mobile-list` marker is awkward during implementation, wrap the `ResponsiveDataList` mobile region by moving the `data-testid` into `ResponsiveDataList` via a `mobileTestId?: string` prop and pass `mobileTestId="admin-orders-mobile-list"`. Update the design-system test to assert the default remains `responsive-data-list-mobile`.

- [ ] **Step 6: Run admin orders tests**

Run:

```bash
npm run test:run -- AdminOrders.test.tsx
```

Expected: pass.

- [ ] **Step 7: Commit admin orders mobile flow**

Run:

```bash
git add project/nexor/src/pages/painel/admin/AdminOrders.tsx project/nexor/src/pages/painel/admin/AdminOrders.styles.ts project/nexor/src/pages/painel/admin/AdminOrders.test.tsx project/packages/design-system/src/components/ResponsiveDataList.tsx project/packages/design-system/src/components/ResponsiveDataList.test.tsx
git commit -m "feat: add mobile admin orders flow"
```

## Task 4: Guided Mobile Steps for Business Settings

**Files:**
- Modify: `project/nexor/src/pages/painel/admin/AdminBusinessSettings.tsx`
- Modify: `project/nexor/src/pages/painel/admin/AdminBusinessSettings.styles.ts`
- Create: `project/nexor/src/pages/painel/admin/AdminBusinessSettings.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `project/nexor/src/pages/painel/admin/AdminBusinessSettings.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAdminPortal } = vi.hoisted(() => ({
  mockUseAdminPortal: vi.fn(),
}));

vi.mock('../../../features/admin/portal', () => ({
  useAdminPortal: mockUseAdminPortal,
}));

import { AdminBusinessSettings } from './AdminBusinessSettings';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function renderPage() {
  mockUseAdminPortal.mockReturnValue({
    selectedProduct: { id: 'biteplaner', name: 'Biteplaner', label: 'Biteplaner', description: '', status: 'available' },
  });

  render(
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <AdminBusinessSettings />
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminBusinessSettings mobile flow', () => {
  beforeEach(() => {
    mockUseAdminPortal.mockReset();
  });

  it('shows a guided mobile step flow for business settings', () => {
    renderPage();

    expect(screen.getByRole('region', { name: /configuração de negócio mobile/i })).toBeInTheDocument();
    expect(screen.getByText('1/4')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /processo e pagamento/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /avançar para regras de credenciamento/i }));

    expect(screen.getByText('2/4')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /regras de credenciamento/i })).toBeInTheDocument();
  });

  it('uses a sticky save action in the mobile flow', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /^salvar e avançar$/i }));

    expect(screen.getByText(/última ação local salva nesta tela: pagamento/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm run test:run -- AdminBusinessSettings.test.tsx
```

Expected: fail because the mobile step region and sticky action are not implemented.

- [ ] **Step 3: Add mobile visibility styles**

Append to `project/nexor/src/pages/painel/admin/AdminBusinessSettings.styles.ts`:

```tsx
export const DesktopSettingsWrap = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileSettingsWrap = styled.section`
  display: none;

  @media (max-width: 768px) {
    display: block;
    padding-bottom: calc(76px + env(safe-area-inset-bottom));
  }
`;
```

- [ ] **Step 4: Add step state and reusable field blocks**

In `AdminBusinessSettings.tsx`, update imports:

```tsx
import { Button, Field, MobileStepFlow, Select, StickyActionBar, Tabs, TabList, Tab, type MobileStepDefinition } from '@nexor/design-system';
```

Add state:

```tsx
const [mobileStep, setMobileStep] = useState('process');
```

Add steps inside the component:

```tsx
const mobileSteps: MobileStepDefinition[] = [
  { id: 'process', title: 'Processo e Pagamento', summary: 'Datas, repasses, prazos e limites.' },
  { id: 'credentialing', title: 'Regras de Credenciamento', summary: 'Critérios de mercado e capacidade por região.' },
  { id: 'contracts', title: 'Contratos e Documentos', summary: 'Modelos usados no fluxo comercial.' },
  { id: 'review', title: 'Revisão', summary: 'Resumo antes de salvar as configurações.' },
];
```

Add helpers:

```tsx
function goToNextMobileStep() {
  const currentIndex = mobileSteps.findIndex((step) => step.id === mobileStep);
  const nextStep = mobileSteps[Math.min(currentIndex + 1, mobileSteps.length - 1)];
  if (mobileStep === 'process') setSavedSection('pagamento');
  if (mobileStep === 'credentialing') setSavedSection('credenciamento');
  if (nextStep) setMobileStep(nextStep.id);
}

function goToPreviousMobileStep() {
  const currentIndex = mobileSteps.findIndex((step) => step.id === mobileStep);
  const previousStep = mobileSteps[Math.max(currentIndex - 1, 0)];
  if (previousStep) setMobileStep(previousStep.id);
}
```

- [ ] **Step 5: Render desktop and mobile settings separately**

Wrap the existing `SectionCardGrid` and desktop saved message with:

```tsx
<S.DesktopSettingsWrap>
  <SectionCardGrid>
    {/* existing desktop sections stay here unchanged */}
  </SectionCardGrid>
</S.DesktopSettingsWrap>
```

After it, add:

```tsx
<S.MobileSettingsWrap aria-label="Configuração de negócio mobile">
  <MobileStepFlow
    steps={mobileSteps}
    activeStepId={mobileStep}
    onStepChange={setMobileStep}
    renderStep={(step) => {
      if (step.id === 'process') {
        return (
          <FormSection padding="md">
            <CompactFieldsGrid>
              <Field as="input" label="Data de pagamento" defaultValue={content.process.paymentDay} />
              <Field as="input" label="Comissão (%)" defaultValue={content.process.commission} />
              <Field as="input" label="Prazo (dias)" defaultValue={content.process.processingDeadline} />
              <Field as="input" label="Limite mensal" defaultValue={content.process.monthlyLimit} />
            </CompactFieldsGrid>
          </FormSection>
        );
      }

      if (step.id === 'credentialing') {
        return (
          <FormSection padding="md">
            <CompactFieldsGrid>
              <Select
                label="Criterio de mercado"
                value={content.credentialing.marketCriteria}
                onChange={() => undefined}
                options={[
                  { value: content.credentialing.marketCriteria, label: content.credentialing.marketCriteria },
                  { value: 'Por perfil de renda', label: 'Por perfil de renda' },
                  { value: 'Por capacidade operacional', label: 'Por capacidade operacional' },
                ]}
              />
              <Field as="input" label="Maximo por regiao" defaultValue={content.credentialing.maxPerRegion} />
              <Field as="input" label="SLA de análise" defaultValue="48 horas" />
            </CompactFieldsGrid>
          </FormSection>
        );
      }

      if (step.id === 'contracts') {
        return (
          <FormSection padding="md">
            <S.ContractsInlineGrid>
              {content.contracts.map((contract) => (
                <ContractCard key={contract.title}>
                  <div>
                    <ContractTitle>{contract.title}</ContractTitle>
                    <ContractDescription>{contract.description}</ContractDescription>
                  </div>
                  <Button variant="secondary">Editar modelo</Button>
                </ContractCard>
              ))}
            </S.ContractsInlineGrid>
          </FormSection>
        );
      }

      return (
        <FormSection padding="md">
          <SectionDescription>
            Revise as regras de {TAB_LABELS[tab]} para o {selectedProduct.label}. Ao salvar, as mudanças locais desta tela ficam registradas como revisão.
          </SectionDescription>
        </FormSection>
      );
    }}
  />
  <StickyActionBar
    secondaryLabel="Voltar"
    onSecondary={goToPreviousMobileStep}
    primaryLabel={mobileStep === 'review' ? 'Salvar revisão' : 'Salvar e avançar'}
    onPrimary={goToNextMobileStep}
  />
</S.MobileSettingsWrap>
```

- [ ] **Step 6: Run business settings tests**

Run:

```bash
npm run test:run -- AdminBusinessSettings.test.tsx
```

Expected: pass.

- [ ] **Step 7: Commit business settings mobile step flow**

Run:

```bash
git add project/nexor/src/pages/painel/admin/AdminBusinessSettings.tsx project/nexor/src/pages/painel/admin/AdminBusinessSettings.styles.ts project/nexor/src/pages/painel/admin/AdminBusinessSettings.test.tsx
git commit -m "feat: add mobile business settings flow"
```

## Task 5: Guided Mobile Steps for System Settings

**Files:**
- Modify: `project/nexor/src/pages/painel/admin/AdminSystemSettings.tsx`
- Modify: `project/nexor/src/pages/painel/admin/AdminSystemSettings.styles.ts`
- Create: `project/nexor/src/pages/painel/admin/AdminSystemSettings.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `project/nexor/src/pages/painel/admin/AdminSystemSettings.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAdminPortal } = vi.hoisted(() => ({
  mockUseAdminPortal: vi.fn(),
}));

vi.mock('../../../features/admin/portal', () => ({
  useAdminPortal: mockUseAdminPortal,
}));

import { AdminSystemSettings } from './AdminSystemSettings';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function renderPage() {
  mockUseAdminPortal.mockReturnValue({
    selectedProduct: { id: 'biteplaner', name: 'Biteplaner', label: 'Biteplaner', description: '', status: 'available' },
  });

  render(
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <AdminSystemSettings />
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminSystemSettings mobile flow', () => {
  beforeEach(() => {
    mockUseAdminPortal.mockReset();
  });

  it('shows message, purchase control and review as mobile steps', () => {
    renderPage();

    expect(screen.getByRole('region', { name: /configuração de sistema mobile/i })).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /mensagem global/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /avançar para controle de compras/i }));

    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /controle de compras/i })).toBeInTheDocument();
  });

  it('keeps the primary system action in the sticky mobile action bar', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /^salvar e avançar$/i }));

    expect(screen.getByText(/mensagem "manutencao preventiva agendada" preparada/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm run test:run -- AdminSystemSettings.test.tsx
```

Expected: fail because the mobile step flow does not exist.

- [ ] **Step 3: Add styles**

Append to `project/nexor/src/pages/painel/admin/AdminSystemSettings.styles.ts`:

```tsx
export const DesktopSettingsWrap = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileSettingsWrap = styled.section`
  display: none;

  @media (max-width: 768px) {
    display: block;
    padding-bottom: calc(76px + env(safe-area-inset-bottom));
  }
`;
```

- [ ] **Step 4: Add mobile step flow logic**

In `AdminSystemSettings.tsx`, update imports:

```tsx
import { Badge, Button, Field, MobileStepFlow, Select, StickyActionBar, type MobileStepDefinition } from '@nexor/design-system';
```

Add state:

```tsx
const [mobileStep, setMobileStep] = useState('message');
```

Add steps and helpers inside the component:

```tsx
const mobileSteps: MobileStepDefinition[] = [
  { id: 'message', title: 'Mensagem Global', summary: 'Conteúdo exibido aos usuários após login.' },
  { id: 'purchase', title: 'Controle de Compras', summary: 'Bloqueio ou liberação de novas ordens.' },
  { id: 'review', title: 'Revisão', summary: 'Conferência dos controles transversais.' },
];

function goToNextMobileStep() {
  const currentIndex = mobileSteps.findIndex((step) => step.id === mobileStep);
  if (mobileStep === 'message') {
    setNotice(`Mensagem "${messageTitle}" preparada como ${messageType.toLowerCase()}.`);
  }
  const nextStep = mobileSteps[Math.min(currentIndex + 1, mobileSteps.length - 1)];
  if (nextStep) setMobileStep(nextStep.id);
}

function goToPreviousMobileStep() {
  const currentIndex = mobileSteps.findIndex((step) => step.id === mobileStep);
  const previousStep = mobileSteps[Math.max(currentIndex - 1, 0)];
  if (previousStep) setMobileStep(previousStep.id);
}
```

- [ ] **Step 5: Render desktop and mobile system settings**

Wrap the existing `SectionCardGrid` with:

```tsx
<S.DesktopSettingsWrap>
  <SectionCardGrid>
    {/* existing desktop sections stay here unchanged */}
  </SectionCardGrid>
</S.DesktopSettingsWrap>
```

After it, add:

```tsx
<S.MobileSettingsWrap aria-label="Configuração de sistema mobile">
  <MobileStepFlow
    steps={mobileSteps}
    activeStepId={mobileStep}
    onStepChange={setMobileStep}
    renderStep={(step) => {
      if (step.id === 'message') {
        return (
          <FormSection padding="md">
            <CompactFieldsGrid>
              <Field as="input" label="Titulo da mensagem" value={messageTitle} onChange={(event) => setMessageTitle(event.target.value)} />
              <Select
                label="Tipo de notificação"
                value={messageType}
                onChange={(value) => setMessageType(value)}
                options={[
                  { value: 'Informacao', label: 'Informacao' },
                  { value: 'Alerta', label: 'Alerta' },
                  { value: 'Urgente', label: 'Urgente' },
                ]}
              />
            </CompactFieldsGrid>
            <Field as="textarea" label="Conteúdo da mensagem" value={messageBody} onChange={(event) => setMessageBody(event.target.value)} />
          </FormSection>
        );
      }

      if (step.id === 'purchase') {
        return (
          <FormSection padding="md">
            <S.FlowHeader>
              <Badge tone={purchaseFlowBlocked ? 'warning' : 'success'}>
                {purchaseFlowBlocked ? 'Compras bloqueadas' : 'Compras liberadas'}
              </Badge>
              <Button
                variant={purchaseFlowBlocked ? 'secondary' : 'primary'}
                onClick={() => {
                  const next = !purchaseFlowBlocked;
                  setPurchaseFlowBlocked(next);
                  setNotice(next ? 'Fluxo de compras bloqueado para novas ordens.' : 'Fluxo de compras reabilitado para novas ordens.');
                }}
              >
                {purchaseFlowBlocked ? 'Liberar compras' : 'Bloquear compras'}
              </Button>
            </S.FlowHeader>
            <SectionDescription>
              Status atual do sistema: {purchaseFlowBlocked ? 'novos usuários não podem iniciar ordens.' : 'usuários podem criar novas ordens normalmente.'}
            </SectionDescription>
          </FormSection>
        );
      }

      return (
        <FormSection padding="md">
          <SectionDescription>
            Mensagem atual: {messageTitle}. Compras: {purchaseFlowBlocked ? 'bloqueadas' : 'liberadas'}.
          </SectionDescription>
        </FormSection>
      );
    }}
  />
  <StickyActionBar
    secondaryLabel="Voltar"
    onSecondary={goToPreviousMobileStep}
    primaryLabel={mobileStep === 'review' ? 'Salvar revisão' : 'Salvar e avançar'}
    onPrimary={goToNextMobileStep}
  />
</S.MobileSettingsWrap>
```

- [ ] **Step 6: Run system settings tests**

Run:

```bash
npm run test:run -- AdminSystemSettings.test.tsx
```

Expected: pass.

- [ ] **Step 7: Commit system settings mobile step flow**

Run:

```bash
git add project/nexor/src/pages/painel/admin/AdminSystemSettings.tsx project/nexor/src/pages/painel/admin/AdminSystemSettings.styles.ts project/nexor/src/pages/painel/admin/AdminSystemSettings.test.tsx
git commit -m "feat: add mobile system settings flow"
```

## Task 6: Final Verification and Spec Lifecycle

**Files:**
- Modify: `docs/superpowers/specs/2026-05-16-admin-mobile-app-flow-design.md`

- [ ] **Step 1: Run focused tests**

Run:

```bash
npm run test:run -- StickyActionBar.test.tsx MobileStepFlow.test.tsx FilterSheet.test.tsx ResponsiveDataList.test.tsx PortalLayout.test.tsx AdminOrders.test.tsx AdminBusinessSettings.test.tsx AdminSystemSettings.test.tsx
```

Expected: all listed tests pass.

- [ ] **Step 2: Run full frontend verification**

Run:

```bash
npm run test:run
npm run build
```

Expected: both commands complete successfully.

- [ ] **Step 3: Check for accidental secrets and large generated files**

Run:

```bash
git status --short
git diff --stat
```

Expected: only source, tests, and the spec lifecycle move are present. `.env` files and `.superpowers/brainstorm/` content are not staged.

- [ ] **Step 4: Move implemented spec to done**

Run:

```bash
mkdir -p docs/superpowers/specs/done
git mv docs/superpowers/specs/2026-05-16-admin-mobile-app-flow-design.md docs/superpowers/specs/done/2026-05-16-admin-mobile-app-flow-design.md
```

- [ ] **Step 5: Commit verification/spec lifecycle**

Run:

```bash
git add docs/superpowers/specs/done/2026-05-16-admin-mobile-app-flow-design.md
git commit -m "docs: mark admin mobile flow spec done"
```

## Self-Review

Spec coverage:

- App-like shell: Task 2 covers compact topbar, drawer, sidebar removal, and bottom bar.
- Guided form/configuration flow: Tasks 4 and 5 cover business/system settings with mobile stepper and sticky actions.
- Dense tables to mobile list/detail: Task 3 covers admin orders as the primary dense table; the `ResponsiveDataList` primitive supports applying the same pattern to licensing pages later.
- Filter sheet/chips: Task 3 covers mobile filter sheet, apply/clear actions, and active chips.
- Accessibility: Tasks 1 and 2 include dialog labels, button labels, focusable controls, and touch-sized controls. Full focus trapping can be added in a later accessibility-hardening plan if manual testing shows a problem.
- Tests and verification: Task 6 covers focused tests, full tests, build, and spec lifecycle.

Placeholder scan:

- The plan contains no placeholder markers, no incomplete task names, and no unspecified commands.

Type consistency:

- `StickyActionBarProps`, `MobileStepDefinition`, `MobileStepFlowProps`, `FilterSheetProps`, and `ResponsiveDataListProps` are exported in Task 1 and imported by pages in later tasks.
- Step ids used in tests match implementation snippets: `process`, `credentialing`, `contracts`, `review`, `message`, `purchase`.
