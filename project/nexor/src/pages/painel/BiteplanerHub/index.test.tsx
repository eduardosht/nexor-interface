import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPost, mockApiPatch } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
  mockApiPatch: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    post: mockApiPost,
    patch: mockApiPatch,
  },
}));

import {
  BiteplanerHub,
  buildPartnerReportWorkbook,
  getFirstAccessMode,
  getDentistLicensingStatusLabel,
  getDentistLicensingStatusTone,
  isLegacyLicensedLabStatus,
} from './index';

function createAuthMock(overrides: Record<string, unknown> = {}) {
  return {
    loading: false,
    session: { access_token: 'tok', user: { id: '1', email: 'demo@nexor.dev' } },
    backendUser: { email: 'demo@nexor.dev', roles: ['customer'] },
    backendUserResolved: true,
    hasConfiguredAuth: true,
    isMockMode: true,
    demoPersona: 'athlete',
    signIn: vi.fn(),
    signInDemo: vi.fn(),
    signOut: vi.fn(),
    sendPasswordReset: vi.fn(),
    refreshBackendUser: vi.fn(),
    ...overrides,
  };
}

function renderPage(path = '/painel/biteplaner?mode=user', authOverrides: Record<string, unknown> = {}) {
  mockUseAuth.mockReturnValue(createAuthMock(authOverrides));

  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider theme={lightTheme}>
        <BiteplanerHub />
        <LocationProbe />
      </ThemeProvider>
    </MemoryRouter>
  );
}

function LocationProbe() {
  const location = useLocation();

  return (
    <span data-testid="current-location" hidden>
      {location.pathname}
      {location.search}
      {location.hash}
    </span>
  );
}

function getDesktopTable(testId: string) {
  const table = screen.getByTestId(testId).querySelector('table');

  if (!table) {
    throw new Error(`Expected ${testId} to contain a desktop table.`);
  }

  return table;
}

function getWorkbookEntryText(workbook: Uint8Array, entryName: string) {
  const decoder = new TextDecoder();
  let offset = 0;

  while (offset < workbook.length) {
    const signature =
      workbook[offset] |
      (workbook[offset + 1] << 8) |
      (workbook[offset + 2] << 16) |
      (workbook[offset + 3] << 24);

    if (signature !== 0x04034b50) {
      break;
    }

    const compressedSize =
      workbook[offset + 18] |
      (workbook[offset + 19] << 8) |
      (workbook[offset + 20] << 16) |
      (workbook[offset + 21] << 24);
    const nameLength = workbook[offset + 26] | (workbook[offset + 27] << 8);
    const extraLength = workbook[offset + 28] | (workbook[offset + 29] << 8);
    const nameStart = offset + 30;
    const contentStart = nameStart + nameLength + extraLength;
    const name = decoder.decode(workbook.slice(nameStart, nameStart + nameLength));

    if (name === entryName) {
      return decoder.decode(workbook.slice(contentStart, contentStart + compressedSize));
    }

    offset = contentStart + compressedSize;
  }

  throw new Error(`Workbook entry not found: ${entryName}`);
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

describe('BiteplanerHub', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockApiPatch.mockReset();
    vi.restoreAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('keeps dashboard stat icons compact on notebook and mobile breakpoints', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/styles.ts'), 'utf8');
    const compactIconSource = source.slice(
      source.indexOf('const compactStatIcon'),
      source.indexOf('export const AthleteStatsGrid')
    );

    expect(source).toContain('@media (max-width: 1280px)');
    expect(source).toContain('@media (max-width: 640px)');
    expect(source).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(source).toContain('grid-column: 1 / -1');
    expect(source).toContain('width: 56px');
    expect(source).toContain('height: 56px');
    expect(source).toContain('flex: 0 0 56px');
    expect(source).toContain('padding: 14px');
    expect(source).toContain('padding: 12px');
    expect(source).toContain('padding: 8px');
    expect(source).toContain('font-size: 16px');
    expect(compactIconSource).not.toContain('width: 40px');
    expect(compactIconSource).not.toContain('height: 40px');
    expect(compactIconSource).not.toContain('width: 32px');
    expect(compactIconSource).not.toContain('height: 32px');
  });

  it('uses the form green and red palette in the lab documentation modal actions', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/styles.ts'), 'utf8');
    const paletteSource = source.slice(
      source.indexOf('const documentationActionButtonTone'),
      source.indexOf('export const TableIconButton')
    );
    const buttonSource = source.slice(
      source.indexOf('export const DocumentationActionButton'),
      source.indexOf('export const ReferralInviteModalBox')
    );

    expect(paletteSource).toContain("bg: '#15803d'");
    expect(paletteSource).toContain("hover: '#166534'");
    expect(paletteSource).toContain("bg: '#b91c1c'");
    expect(paletteSource).toContain("hover: '#991b1b'");
    expect(buttonSource).toContain('documentationActionButtonTone[$tone].bg');
    expect(buttonSource).toContain('documentationActionButtonTone[$tone].hover');
  });

  it('keeps lab production documentation as a two-column operational grid without patient identity cards', () => {
    const pageSource = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/index.tsx'), 'utf8');
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/styles.ts'), 'utf8');
    const modalSource = pageSource.slice(
      pageSource.indexOf('aria-label="Formulário de Solicitação de Produção"'),
      pageSource.indexOf('<S.DocumentationModalActions aria-label="Ações do formulário de solicitação de produção">')
    );
    const gridSource = stylesSource.slice(
      stylesSource.indexOf('export const DocumentationGrid'),
      stylesSource.indexOf('export const DocumentationItem')
    );
    const fullWidthSource = stylesSource.slice(
      stylesSource.indexOf('export const DocumentationFullWidthItem'),
      stylesSource.indexOf('export const DocumentationLabel')
    );

    expect(modalSource).not.toContain('Pedido Biteplaner');
    expect(modalSource).not.toContain('Dentista solicitante');
    expect(modalSource).not.toContain('<S.DocumentationLabel>Paciente</S.DocumentationLabel>');
    expect(modalSource.indexOf('<S.DocumentationLabel>Modelo</S.DocumentationLabel>')).toBeLessThan(
      modalSource.indexOf('<S.DocumentationLabel>Cor</S.DocumentationLabel>')
    );
    expect(modalSource.indexOf('<S.DocumentationLabel>Quantidade</S.DocumentationLabel>')).toBeLessThan(
      modalSource.indexOf('<S.DocumentationLabel>Escaneamento 3D</S.DocumentationLabel>')
    );
    expect(modalSource).toContain('<S.DocumentationFullWidthItem>');
    expect(gridSource).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));');
    expect(gridSource).not.toContain('grid-template-columns: 1fr;');
    expect(fullWidthSource).toContain('grid-column: 1 / -1;');
  });

  it('keeps the order updates modal scrollable and accented in Brazilian Portuguese', () => {
    const pageSource = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/index.tsx'), 'utf8');
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/styles.ts'), 'utf8');

    expect(pageSource).toContain('aria-label="Atualizações da ordem"');
    expect(pageSource).toContain('Atualizações da ordem');
    expect(pageSource).toContain('Histórico resumido');
    expect(pageSource).toContain('Fechar modal das atualizações');
    expect(pageSource).not.toContain('Atualizacoes da ordem');
    expect(pageSource).not.toContain('Fechar modal das atualizacoes');
    expect(stylesSource).toContain('export const TimelineTableWrap = styled(SimpleTableWrap)`');
    expect(stylesSource).toContain('max-height: min(46vh, 420px);');
    expect(stylesSource).toContain('overflow-y: auto;');
    expect(stylesSource).toContain('@media (max-width: 640px)');
    expect(stylesSource).toContain('max-height: 42vh;');
  });

  it('keeps pending order action reason state inside the modal', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/index.tsx'), 'utf8');
    const componentStart = source.indexOf('function PendingOrderActionModal');
    const hubStart = source.indexOf('export function BiteplanerHub');
    const modalSource = source.slice(componentStart, hubStart);
    const hubSource = source.slice(hubStart);

    expect(componentStart).toBeGreaterThan(-1);
    expect(modalSource).toContain("const [reason, setReason] = useState('')");
    expect(modalSource).toContain("onConfirm(action, requiresReturnReason ? reason.trim() : '')");
    expect(hubSource).not.toContain('pendingOrderReason');
    expect(hubSource).not.toContain('setPendingOrderReason');
  });

  it('prioritizes operational modes on first access before the user tab', () => {
    expect(
      getFirstAccessMode({
        defaultMode: 'user',
        modes: [
          { key: 'user', label: 'Atleta', description: '', allowed: true, highlighted: false, reason: null },
          { key: 'partner', label: 'Parceiro', description: '', allowed: true, highlighted: false, reason: null },
          { key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: false, reason: null },
          { key: 'lab', label: 'Laboratório', description: '', allowed: true, highlighted: false, reason: null },
        ],
      })
    ).toBe('lab');

    expect(
      getFirstAccessMode({
        defaultMode: 'user',
        modes: [
          { key: 'user', label: 'Atleta', description: '', allowed: true, highlighted: false, reason: null },
          { key: 'partner', label: 'Parceiro', description: '', allowed: true, highlighted: false, reason: null },
          { key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: false, reason: null },
        ],
      })
    ).toBe('dentist');
  });

  it('waits for access options before loading a requested operational mode that is not allowed', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/products/biteplaner/access-options') {
        return Promise.resolve({
          productKey: 'biteplaner',
          defaultMode: 'user',
          enrollment: null,
          modes: [
            { key: 'user', label: 'Cliente', description: '', allowed: true, highlighted: true, reason: null },
            {
              key: 'dentist',
              label: 'Dentista',
              description: '',
              allowed: false,
              highlighted: false,
              reason: 'Dentist profile is not linked yet.',
            },
          ],
        });
      }

      if (path === '/v1/orders?as=user') {
        return Promise.resolve({ orders: [] });
      }

      return Promise.reject(new Error(`Unexpected request: ${path}`));
    });

    renderPage('/painel/biteplaner?mode=dentist', {
      backendUser: { email: 'cliente@nexor.dev', roles: ['customer'] },
      demoPersona: 'athlete',
    });

    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/v1/orders?as=user', 'tok'));
    expect(mockApiGet).not.toHaveBeenCalledWith('/v1/orders?as=dentist', 'tok');
  });

  it('waits for access options before loading the dentist fallback mode when it is not allowed', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/products/biteplaner/access-options') {
        return Promise.resolve({
          productKey: 'biteplaner',
          defaultMode: 'user',
          enrollment: null,
          modes: [
            { key: 'user', label: 'Cliente', description: '', allowed: true, highlighted: true, reason: null },
            {
              key: 'dentist',
              label: 'Dentista',
              description: '',
              allowed: false,
              highlighted: false,
              reason: 'Dentist profile is not linked yet.',
            },
          ],
        });
      }

      if (path === '/v1/orders?as=user') {
        return Promise.resolve({ orders: [] });
      }

      return Promise.reject(new Error(`Unexpected request: ${path}`));
    });

    renderPage('/painel/biteplaner', {
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
      demoPersona: 'dentist',
    });

    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/v1/orders?as=user', 'tok'));
    expect(mockApiGet).not.toHaveBeenCalledWith('/v1/orders?as=dentist', 'tok');
  });

  it('uses the admin data table component for operational Biteplaner queues', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/index.tsx'), 'utf8');

    expect(source).toContain('AdminDataTable');
    expect(source).not.toContain('<DataTable\n                  data={filteredDentistOrders}');
    expect(source).not.toContain('<DataTable\n                  data={filteredLabOrders}');
  });

  it('renders the partner lead table with shared funnel data', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'partner',
        enrollment: null,
        modes: [{ key: 'partner', label: 'Parceiro', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        inviteLinks: [
          {
            id: 'link-1',
            token: 'bp-partner-demo-001',
            status: 'active',
            intendedCustomerName: 'Joao Demo',
            intendedCustomerEmail: 'joao@nexor.dev',
            created_at: '2026-05-01T10:00:00.000Z',
            expires_at: null,
            consumed_at: null,
          },
        ],
        leads: [
          {
            id: 'lead-1',
            partnerId: 'partner-1',
            partnerLinkId: 'link-1',
            orderId: 'BP-DEMO-001',
            customerProfileId: 'profile-1',
            customerName: 'Joao Demo',
            customerEmail: 'joao@nexor.dev',
            customerPhone: null,
            funnelStage: 'account_created',
            statusLabel: 'Pré-consulta pendente',
            created_at: '2026-05-01T10:00:00.000Z',
            orderStatus: 'Pré-consulta pendente',
          },
        ],
        summary: { leadsCaptured: 1, convertedToAccount: 1, activeOrders: 1 },
      });

    renderPage('/painel/biteplaner?mode=partner', {
      demoPersona: 'partner',
      backendUser: { email: 'parceiro@nexor.dev', roles: ['partner'] },
    });

    await waitFor(() => expect(screen.getByText(/resumo das indicações/i)).toBeInTheDocument());
    expect(screen.getAllByText(/links gerados/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/clientes cadastrados/i)).toBeInTheDocument();
    expect(screen.getByText(/links convertidos em compra/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /semana/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mês/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText(/leads captados/i)).not.toBeInTheDocument();
    expect(screen.getByText(/pedidos finalizados/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /abrir indicar/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/indicar?mode=partner'
    );
    expect(mockApiGet).not.toHaveBeenCalledWith('/v1/orders?as=partner', 'tok');
    expect(screen.queryByRole('button', { name: /gerar link individual/i })).not.toBeInTheDocument();
  });

  it('keeps the partner referral summary compact on mobile', () => {
    const chartSource = readFileSync(join(process.cwd(), 'src/features/biteplaner/hub/partnerDashboard.tsx'), 'utf8');
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/styles.ts'), 'utf8');
    const chartPanelSource = stylesSource.slice(
      stylesSource.indexOf('export const PartnerChartPanel'),
      stylesSource.indexOf('export const PartnerChartHeader')
    );
    const periodControlSource = stylesSource.slice(
      stylesSource.indexOf('export const PartnerPeriodControl'),
      stylesSource.indexOf('export const PartnerPeriodButton')
    );
    const barChartSource = stylesSource.slice(
      stylesSource.indexOf('export const PartnerBarChart'),
      stylesSource.indexOf('export const PartnerChartLegend')
    );
    const legendItemSource = stylesSource.slice(
      stylesSource.indexOf('export const PartnerChartLegendItem'),
      stylesSource.indexOf('export const PartnerOperationPanel')
    );

    expect(chartSource).toContain('<S.PartnerBarCanvas>');
    expect(chartSource).toContain('height="100%"');
    expect(chartPanelSource).toContain('@media (max-width: 720px)');
    expect(chartPanelSource).toContain('padding: 14px;');
    expect(chartPanelSource).toContain('box-shadow: none;');
    expect(periodControlSource).toContain('width: 100%;');
    expect(periodControlSource).toContain('grid-template-columns: repeat(4, minmax(0, 1fr));');
    expect(periodControlSource).toContain('@media (max-width: 360px)');
    expect(barChartSource).toContain('min-height: 0;');
    expect(barChartSource).toContain('height: 210px;');
    expect(barChartSource).toContain('height: 184px;');
    expect(legendItemSource).toContain('padding: 8px 10px;');
    expect(legendItemSource).toContain('font-size: 11px;');
  });

  it('keeps the partner operation card full width below the referral summary with compact action cards', () => {
    const pageSource = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/index.tsx'), 'utf8');
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/styles.ts'), 'utf8');
    const dashboardGridSource = stylesSource.slice(
      stylesSource.indexOf('export const PartnerDashboardGrid'),
      stylesSource.indexOf('export const PartnerChartPanel')
    );
    const actionCardsSource = stylesSource.slice(
      stylesSource.indexOf('export const PartnerActionCards'),
      stylesSource.indexOf('export const PartnerActionCard = styled')
    );
    const operationPanelSource = stylesSource.slice(
      stylesSource.indexOf('export const PartnerOperationPanel'),
      stylesSource.indexOf('export const PartnerActionCards')
    );
    const actionCardSource = stylesSource.slice(
      stylesSource.indexOf('export const PartnerActionCard = styled'),
      stylesSource.indexOf('export const PartnerActionButton')
    );
    const actionButtonSource = stylesSource.slice(
      stylesSource.indexOf('export const PartnerActionButton'),
      stylesSource.indexOf('export const PartnerActionCardPrimary')
    );

    expect(dashboardGridSource).toContain('grid-template-columns: minmax(0, 1fr);');
    expect(operationPanelSource).toContain('grid-column: 1 / -1;');
    expect(actionCardsSource).toContain('grid-template-columns: repeat(3, minmax(0, 1fr));');
    expect(actionCardsSource).toContain('@media (max-width: 720px)');
    expect(actionCardsSource).toContain('grid-template-columns: minmax(0, 1fr);');
    expect(actionCardSource).toContain('min-height: 0;');
    expect(actionCardSource).toContain('padding: 18px;');
    expect(actionCardSource).toContain('padding: 12px;');
    expect(actionButtonSource).toContain('min-height: 0;');
    expect(actionButtonSource).toContain('padding: 18px;');
    expect(actionButtonSource).toContain('padding: 12px;');
    expect(pageSource).not.toContain('<ArrowRight size={22} aria-hidden />');
    expect(pageSource).not.toContain('<Download size={22} aria-hidden />');
  });

  it('keeps partner link generation out of the Home dashboard', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'partner',
        enrollment: null,
        modes: [{ key: 'partner', label: 'Parceiro', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        inviteLinks: [],
        leads: [],
        summary: { leadsCaptured: 0, convertedToAccount: 0, activeOrders: 0 },
      });

    renderPage('/painel/biteplaner?mode=partner', {
      demoPersona: 'partner',
      backendUser: { email: 'parceiro@nexor.dev', roles: ['partner'] },
    });

    await waitFor(() => expect(screen.getByRole('link', { name: /abrir indicar/i })).toBeInTheDocument());
    expect(screen.queryByLabelText(/cliente qualificado/i)).not.toBeInTheDocument();
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('filters the partner referral chart by period', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'partner',
        enrollment: null,
        modes: [{ key: 'partner', label: 'Parceiro', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        inviteLinks: [
          {
            id: 'link-current',
            token: 'bp-partner-demo-current',
            status: 'active',
            intendedCustomerName: 'Joao Demo',
            intendedCustomerEmail: 'joao@nexor.dev',
            created_at: '2026-05-10T10:00:00.000Z',
            expires_at: null,
            consumed_at: null,
          },
          {
            id: 'link-old',
            token: 'bp-partner-demo-old',
            status: 'active',
            intendedCustomerName: 'Marina Demo',
            intendedCustomerEmail: 'marina@nexor.dev',
            created_at: '2025-11-10T10:00:00.000Z',
            expires_at: null,
            consumed_at: null,
          },
        ],
        leads: [
          {
            id: 'lead-current',
            partnerId: 'partner-1',
            partnerLinkId: 'link-current',
            orderId: 'BP-DEMO-001',
            customerProfileId: 'profile-1',
            customerName: 'Joao Demo',
            customerEmail: 'joao@nexor.dev',
            customerPhone: null,
            funnelStage: 'account_created',
            statusLabel: 'Conta criada',
            created_at: '2026-05-10T10:00:00.000Z',
            orderStatus: 'Conta criada',
          },
          {
            id: 'lead-old',
            partnerId: 'partner-1',
            partnerLinkId: 'link-old',
            orderId: 'BP-DEMO-002',
            customerProfileId: 'profile-2',
            customerName: 'Marina Demo',
            customerEmail: 'marina@nexor.dev',
            customerPhone: null,
            funnelStage: 'order_advanced',
            statusLabel: 'Pedido ativo',
            created_at: '2025-11-10T10:00:00.000Z',
            orderStatus: 'Pedido ativo',
          },
        ],
        summary: { leadsCaptured: 2, convertedToAccount: 2, activeOrders: 1 },
      });

    renderPage('/painel/biteplaner?mode=partner', {
      demoPersona: 'partner',
      backendUser: { email: 'parceiro@nexor.dev', roles: ['partner'] },
    });

    await waitFor(() => expect(screen.getByTestId('partner-chart-value-links')).toHaveTextContent('1'));
    expect(screen.getByTestId('partner-chart-value-accounts')).toHaveTextContent('1');
    expect(screen.getByTestId('partner-chart-value-purchases')).toHaveTextContent('0');

    fireEvent.click(screen.getByRole('button', { name: /tudo/i }));

    expect(screen.getByRole('button', { name: /tudo/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('partner-chart-value-links')).toHaveTextContent('2');
    expect(screen.getByTestId('partner-chart-value-accounts')).toHaveTextContent('2');
    expect(screen.getByTestId('partner-chart-value-purchases')).toHaveTextContent('1');
  });

  it('shows the partner Home CTA to the Indicar submenu when links exist', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'partner',
        enrollment: null,
        modes: [{ key: 'partner', label: 'Parceiro', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        inviteLinks: [
          {
            id: 'link-1',
            token: 'bp-partner-demo-001',
            status: 'active',
            intendedCustomerName: 'Joao Demo',
            intendedCustomerEmail: 'joao@nexor.dev',
            created_at: '2026-05-01T10:00:00.000Z',
            expires_at: null,
            consumed_at: null,
          },
        ],
        leads: [],
        summary: { leadsCaptured: 0, convertedToAccount: 0, activeOrders: 0 },
      });

    renderPage('/painel/biteplaner?mode=partner', {
      demoPersona: 'partner',
      backendUser: { email: 'parceiro@nexor.dev', roles: ['partner'] },
    });

    await waitFor(() => expect(screen.getAllByText(/links gerados/i).length).toBeGreaterThan(0));
    expect(screen.getByRole('link', { name: /abrir indicar/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/indicar?mode=partner'
    );
  });

  it('downloads the partner one-year link and order report from the operation card', async () => {
    const createdBlobs: Blob[] = [];
    const partnerOverview = {
      inviteLinks: [
        {
          id: 'link-current',
          token: 'bp-partner-current',
          status: 'active',
          intendedCustomerName: 'Joao Atual',
          intendedCustomerEmail: 'joao@nexor.dev',
          created_at: '2026-05-10T10:00:00.000Z',
          expires_at: null,
          consumed_at: null,
        },
        {
          id: 'link-old',
          token: 'bp-partner-old',
          status: 'expired',
          intendedCustomerName: 'Marina Antiga',
          intendedCustomerEmail: 'marina@nexor.dev',
          created_at: '2024-12-10T10:00:00.000Z',
          expires_at: null,
          consumed_at: null,
        },
      ],
      leads: [
        {
          id: 'lead-current',
          partnerId: 'partner-1',
          partnerLinkId: 'link-current',
          orderId: 'BP-DEMO-010',
          customerProfileId: 'profile-1',
          customerName: 'Joao Atual',
          customerEmail: 'joao@nexor.dev',
          customerPhone: null,
          funnelStage: 'order_advanced',
          statusLabel: 'Pedido ativo',
          created_at: '2026-05-10T10:00:00.000Z',
          orderStatus: 'Pedido ativo',
        },
        {
          id: 'lead-finished',
          partnerId: 'partner-1',
          partnerLinkId: 'link-current',
          orderId: 'BP-DEMO-011',
          customerProfileId: 'profile-2',
          customerName: 'Ana Finalizada',
          customerEmail: 'ana@nexor.dev',
          customerPhone: null,
          funnelStage: 'order_advanced',
          statusLabel: 'Finalizado',
          created_at: '2026-04-10T10:00:00.000Z',
          orderStatus: 'Finalizado',
        },
        {
          id: 'lead-old',
          partnerId: 'partner-1',
          partnerLinkId: 'link-old',
          orderId: 'BP-DEMO-012',
          customerProfileId: 'profile-3',
          customerName: 'Marina Antiga',
          customerEmail: 'marina@nexor.dev',
          customerPhone: null,
          funnelStage: 'order_advanced',
          statusLabel: 'Pedido antigo',
          created_at: '2024-12-10T10:00:00.000Z',
          orderStatus: 'Pedido antigo',
        },
      ],
      summary: { leadsCaptured: 3, convertedToAccount: 3, activeOrders: 1, finishedOrders: 1 },
    };
    const createObjectUrl = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation((blob) => {
        if (blob instanceof Blob) {
          createdBlobs.push(blob);
        }
        return 'blob:partner-report';
      });
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const clickSpy = vi.fn();
    const createdAnchors: HTMLAnchorElement[] = [];
    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      const element = originalCreateElement(tagName, options);

      if (tagName.toLowerCase() === 'a') {
        createdAnchors.push(element as HTMLAnchorElement);
        element.click = clickSpy;
      }

      return element;
    });

    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'partner',
        enrollment: null,
        modes: [{ key: 'partner', label: 'Parceiro', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce(partnerOverview);

    renderPage('/painel/biteplaner?mode=partner', {
      demoPersona: 'partner',
      backendUser: { email: 'parceiro@nexor.dev', roles: ['partner'] },
    });

    fireEvent.click(await screen.findByRole('button', { name: /download do relatório/i }));

    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:partner-report');
    expect(createdBlobs).toHaveLength(1);
    const downloadedBlob = createdBlobs[0];
    const downloadAnchor = createdAnchors.find((anchor) => anchor.download.endsWith('.xlsx'));

    expect(downloadedBlob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(downloadAnchor?.download).toMatch(/^relatorio-parceiro-biteplaner-\d{4}-\d{2}-\d{2}\.xlsx$/);

    const workbook = buildPartnerReportWorkbook(partnerOverview, new Date('2026-06-12T12:00:00.000Z'));
    const workbookText = new TextDecoder().decode(workbook);
    const workbookXml = getWorkbookEntryText(workbook, 'xl/workbook.xml');
    const workbookRelsXml = getWorkbookEntryText(workbook, 'xl/_rels/workbook.xml.rels');
    const linksSheetXml = getWorkbookEntryText(workbook, 'xl/worksheets/sheet1.xml');
    const ordersSheetXml = getWorkbookEntryText(workbook, 'xl/worksheets/sheet2.xml');

    expect(workbook[0]).toBe(0x50);
    expect(workbook[1]).toBe(0x4b);
    expect(workbookText).toContain('xl/worksheets/sheet1.xml');
    expect(workbookText).toContain('xl/worksheets/sheet2.xml');
    expect(workbookXml).toContain('name="Links gerados"');
    expect(workbookXml).toContain('name="Pedidos"');
    expect(workbookRelsXml).toContain('Target="worksheets/sheet1.xml"');
    expect(workbookRelsXml).toContain('Target="worksheets/sheet2.xml"');
    expect(workbookText).toContain('Relatório do parceiro - últimos 12 meses');
    expect(workbookText).toContain('bp-partner-current');
    expect(workbookText).toContain('Ativo');
    expect(linksSheetXml).toContain('bp-partner-current');
    expect(linksSheetXml).not.toContain('BP-DEMO-010');
    expect(workbookText).toContain('BP-DEMO-010');
    expect(workbookText).toContain('Pedido ativo');
    expect(workbookText).toContain('BP-DEMO-011');
    expect(workbookText).toContain('Finalizado');
    expect(ordersSheetXml).toContain('BP-DEMO-010');
    expect(ordersSheetXml).toContain('BP-DEMO-011');
    expect(ordersSheetXml).not.toContain('bp-partner-current');
    expect(workbookText).not.toContain('bp-partner-old');
  });

  it('sends a registration-started athlete to the prerequisite page when the intake is not released yet', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'user',
        enrollment: null,
        modes: [{ key: 'user', label: 'Cliente', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-001',
            status: 'registration_started',
            statusLabel: 'Pré-consulta pendente',
            stage: 'pre_requisite_pending',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ forms: [] });

    renderPage('/painel/biteplaner?mode=user');

    await waitFor(() => expect(screen.getByTestId('athlete-order-status')).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: /workspace do atleta/i })).toBeInTheDocument();
    expect(screen.getByTestId('athlete-hero-visual')).toBeInTheDocument();
    expect(screen.getAllByText(/jornada biteplaner/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('athlete-primary-order')).toHaveTextContent(/sua jornada biteplaner/i);
    expect(screen.queryByText(/^BP$/)).not.toBeInTheDocument();
    expect(screen.getByTestId('athlete-primary-order')).toHaveTextContent(/próximo passo visível/i);
    expect(screen.getByTestId('athlete-order-status')).toHaveTextContent(/cadastro iniciado/i);
    expect(screen.getByRole('link', { name: /ver jornada/i })).toHaveAttribute('href', '/painel/biteplaner/onboarding');
  });

  it('shows an onboarding CTA when the athlete has no Biteplaner order yet', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'user',
        enrollment: null,
        modes: [{ key: 'user', label: 'Cliente', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({ orders: [] });

    renderPage('/painel/biteplaner?mode=user');

    await waitFor(() => expect(screen.getByTestId('athlete-onboarding-empty-state')).toBeInTheDocument());
    expect(screen.getByText(/você ainda não iniciou sua jornada biteplaner/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /iniciar onboarding/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/onboarding'
    );
  });

  it('sends the athlete to clinic selection when the prerequisite intake is already submitted', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'user',
        enrollment: null,
        modes: [{ key: 'user', label: 'Cliente', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-001',
            status: 'registration_started',
            statusLabel: 'Pré-consulta pendente',
            stage: 'pre_requisite_pending',
            created_at: '2026-05-01T14:00:00.000Z',
            customer: { full_name: 'Eduardo Shoiti Fujiwara', email: 'eduardoshoitifujiwara@gmail.com', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({
        forms: [
          {
            id: 'BP-WF-001-INTAKE',
            orderId: 'BP-DEMO-001',
            templateKey: 'customer_pre_consultation_intake',
            stepKey: 'pre_requisite_pending',
            status: 'submitted',
            roleState: { customer: 'submitted', dentist: 'locked' },
            canViewPayload: true,
            summary: { submittedAt: '2026-05-01T11:20:00.000Z' },
            releasedAt: '2026-05-01T10:05:00.000Z',
            submittedAt: '2026-05-01T11:20:00.000Z',
            payload: { customer: { fullName: 'Eduardo Shoiti Fujiwara' } },
          },
        ],
      });

    renderPage('/painel/biteplaner?mode=user');

    await waitFor(() => expect(screen.getByTestId('athlete-order-status')).toHaveTextContent(/aguardando consulta inicial/i));
    expect(screen.getByTestId('athlete-primary-order')).toHaveTextContent(/escolher a cl.*nica da consulta inicial/i);
    expect(screen.getByRole('link', { name: /ver jornada/i })).toHaveAttribute('href', '/painel/consulta-inicial');
    expect(screen.queryByRole('link', { name: /abrir jornada/i })).not.toBeInTheDocument();
  });

  it('renders the dentist queue as a páginated table with status filters', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-201',
            status: 'awaiting_dentist_acceptance',
            statusLabel: 'Aguardando aceite do dentista',
            stage: 'dentist_acceptance_pending',
            created_at: '2026-05-01T10:00:00.000Z',
            updated_at: '2026-05-02T14:35:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
          },
          {
            id: 'BP-DEMO-202',
            status: 'treatment_required',
            statusLabel: 'Tratamento prévio pendente',
            stage: 'treatment_required',
            created_at: '2026-05-01T13:00:00.000Z',
            customer: { full_name: 'Marina Demo', email: 'marina@nexor.dev', phone: null },
          },
          {
            id: 'BP-DEMO-203',
            status: 'appointment_confirmed',
            statusLabel: 'Aguardando decisão clínica',
            stage: 'awaiting_clinical_decision',
            created_at: '2026-05-01T12:00:00.000Z',
            customer: { full_name: 'Carlos Demo', email: 'carlos@nexor.dev', phone: null },
          },
          {
            id: 'BP-DEMO-204',
            status: 'awaiting_dentist_forms',
            statusLabel: 'Aguardando envio ao laboratório',
            stage: 'awaiting_dentist_forms',
            created_at: '2026-05-01T11:00:00.000Z',
            customer: { full_name: 'Ana Demo', email: 'ana@nexor.dev', phone: null },
          },
          {
            id: 'BP-DEMO-205',
            status: 'awaiting_payment',
            statusLabel: 'Aguardando pagamento',
            stage: 'awaiting_payment',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Paula Demo', email: 'paula@nexor.dev', phone: null },
          },
        ],
      });

    for (let index = 0; index < 5; index += 1) {
      mockApiGet.mockResolvedValueOnce({
        appointments: index === 0
          ?[
              {
                id: `appointment-${index + 1}`,
                order_id: 'BP-DEMO-201',
                type: 'initial',
                status: 'scheduled',
                scheduled_at: '2026-05-07T10:00:00.000Z',
                user_confirmed_at: null,
                dentist_confirmed_at: null,
              },
            ]
          : [],
      });
    }

    for (let index = 0; index < 5; index += 1) {
      mockApiGet.mockResolvedValueOnce({
        events: index === 0
          ?[
              {
                id: 'event-1-old',
                orderId: 'BP-DEMO-201',
                fromStatus: null,
                toStatus: 'registration_started',
                reason: 'order_created',
                createdAt: '2026-05-01T09:00:00.000Z',
              },
              {
                id: 'event-1-new',
                orderId: 'BP-DEMO-201',
                fromStatus: 'awaiting_scheduling',
                toStatus: 'awaiting_dentist_acceptance',
                reason: 'practice_location_selected_by_customer',
                createdAt: '2026-05-01T10:00:00.000Z',
              },
              {
                id: 'event-1-cancelled',
                orderId: 'BP-DEMO-201',
                fromStatus: 'awaiting_dentist_acceptance',
                toStatus: 'awaiting_scheduling',
                reason: 'practice_location_selection_cancelled_by_customer',
                metadata: {
                  previousPracticeLocationName: 'Clínica anterior',
                  previousDentistName: 'Dr. Bruno Lima',
                },
                createdAt: '2026-05-01T10:30:00.000Z',
              },
              {
                id: 'event-1-payment',
                orderId: 'BP-DEMO-201',
                fromStatus: 'awaiting_payment',
                toStatus: 'payment confirmed',
                reason: 'legacy_payment_confirmed',
                createdAt: '2026-05-01T10:45:00.000Z',
              },
              {
                id: 'event-1-forms',
                orderId: 'BP-DEMO-201',
                fromStatus: 'payment confirmed',
                toStatus: 'awaiting_dentist_forms',
                reason: 'legacy_status_transition',
                createdAt: '2026-05-01T11:00:00.000Z',
              },
            ]
          : [
              {
                id: `event-${index + 1}`,
                orderId: `BP-DEMO-20${index + 1}`,
                fromStatus: null,
                toStatus: 'seeded',
                reason: `Evento ${index + 1}`,
                createdAt: `2026-05-0${index + 1}T10:00:00.000Z`,
              },
            ],
      });
    }

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-queue-table')).toBeInTheDocument());
    const dentistQueueTable = getDesktopTable('dentist-queue-table');
    expect(screen.getByText(/fila operacional do dentista/i)).toBeInTheDocument();
    expect(screen.getByText(/ordens com consulta agendada pelo cliente/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /vincular consulta/i })).not.toBeInTheDocument();
    expect(within(dentistQueueTable).getAllByRole('columnheader').map((header) => header.textContent?.trim())).toEqual([
      'Pedido',
      'Última atualização',
      'Paciente',
      'Etapa',
      'Status',
      'Detalhes',
      'Ações',
    ]);
    expect(within(dentistQueueTable).getByText('02/05/2026 11:35')).toBeInTheDocument();
    expect(within(dentistQueueTable).getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(within(dentistQueueTable).queryByRole('columnheader', { name: /^consulta$/i })).not.toBeInTheDocument();
    expect(screen.getAllByText(/aguardando aceite do dentista/i).length).toBeGreaterThan(0);
    fireEvent.click(within(dentistQueueTable).getByRole('button', { name: /visualizar atualizações da ordem bp-demo-201/i }));
    const timelineDialog = await screen.findByRole('dialog', { name: /atualizações da ordem/i });
    expect(timelineDialog).toBeInTheDocument();
    expect(within(timelineDialog).getByText(/histórico resumido da jornada operacional/i)).toBeInTheDocument();
    expect(within(timelineDialog).getByText(/aguardando aceite do dentista/i)).toBeInTheDocument();
    expect(within(timelineDialog).queryByText(/^awaiting_dentist_acceptance$/i)).not.toBeInTheDocument();
    expect(within(timelineDialog).queryByText(/^practice_location_selected_by_customer$/i)).not.toBeInTheDocument();
    expect(within(timelineDialog).getByText(/cliente informou que combinou a consulta fora da plataforma/i)).toBeInTheDocument();
    expect(within(timelineDialog).getByText(/cliente cancelou a consulta na clínica anterior com dr\. bruno lima/i)).toBeInTheDocument();
    expect(within(timelineDialog).getByText(/^Pagamento confirmado$/i)).toBeInTheDocument();
    expect(within(timelineDialog).queryByText(/^Payment Confirmed$/i)).not.toBeInTheDocument();
    expect(
      within(timelineDialog).getByText(/status alterado de pagamento confirmado para formul/i)
    ).toBeInTheDocument();
    expect(within(timelineDialog).queryByText(/status alterado de payment confirmed/i)).not.toBeInTheDocument();
    const timelineRows = within(timelineDialog).getAllByRole('row');
    expect(timelineRows.some((row) => /aguardando agendamento/i.test(row.textContent ?? ''))).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /fechar modal das atualizações/i }));
    fireEvent.click(within(dentistQueueTable).getByRole('button', { name: /aceitar consulta agendada da ordem bp-demo-201/i }));
    expect(await screen.findByRole('dialog', { name: /confirmar ação da ordem/i })).toBeInTheDocument();
    expect(screen.getByText(/deseja aceitar a consulta agendada da ordem bp-demo-201/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    expect(within(dentistQueueTable).getByText('BP-DEMO-205')).toBeInTheDocument();
    expect(
      within(dentistQueueTable).getByRole('button', { name: /visualizar ficha clínica da ordem bp-demo-205/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /anterior/i }));
    fireEvent.click(screen.getByRole('button', { name: /selecionar/i }));
    fireEvent.click(screen.getByRole('option', { name: /tratamento prévio pendente/i }));

    await waitFor(() => {
      expect(within(dentistQueueTable).getByText('BP-DEMO-202')).toBeInTheDocument();
      expect(within(dentistQueueTable).queryByText('BP-DEMO-201')).not.toBeInTheDocument();
      expect(within(dentistQueueTable).queryByText('BP-DEMO-205')).not.toBeInTheDocument();
    });
  }, 15000);

  it('requests dentist orders with a bounded date range filter', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-401',
            status: 'awaiting_payment',
            statusLabel: 'Aguardando pagamento',
            stage: 'awaiting_payment',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Paula Demo', email: 'paula@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-402',
            status: 'awaiting_payment',
            statusLabel: 'Aguardando pagamento',
            stage: 'awaiting_payment',
            created_at: '2026-03-01T10:00:00.000Z',
            customer: { full_name: 'Marina Demo', email: 'marina@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-queue-table')).toBeInTheDocument());
    const firstDentistOrdersUrl = mockApiGet.mock.calls
      .map(([path]) => String(path))
      .find((path) => path.startsWith('/v1/orders?as=dentist'));
    expect(firstDentistOrdersUrl).toContain('initDate=');
    expect(firstDentistOrdersUrl).toContain('finalDate=');

    fireEvent.change(screen.getByLabelText(/data inicial/i), { target: { value: '2026-02-01' } });
    fireEvent.change(screen.getByLabelText(/data final/i), { target: { value: '2026-05-31' } });
    fireEvent.click(screen.getByRole('button', { name: /aplicar período/i }));

    await waitFor(() =>
      expect(mockApiGet).toHaveBeenCalledWith(
        '/v1/orders?as=dentist&initDate=2026-02-01T00%3A00%3A00.000Z&finalDate=2026-05-31T23%3A59%3A59.999Z',
        'tok'
      )
    );
  });

  it('requests lab orders with the same bounded date range filter', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'lab',
        enrollment: null,
        modes: [{ key: 'lab', label: 'Laboratório', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-LAB-401',
            status: 'awaiting_lab_start',
            statusLabel: 'Aguardando aceite do laboratório',
            stage: 'awaiting_lab_start',
            created_at: '2026-05-01T10:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-LAB-402',
            status: 'lab_processing',
            statusLabel: 'Em produção',
            stage: 'lab_processing',
            created_at: '2026-03-01T10:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] });

    renderPage('/painel/biteplaner?mode=lab', {
      demoPersona: 'lab',
      backendUser: { email: 'laboratorio@nexor.dev', roles: ['lab'] },
    });

    await waitFor(() => expect(screen.getByTestId('lab-queue-table')).toBeInTheDocument());
    const firstLabOrdersUrl = mockApiGet.mock.calls
      .map(([path]) => String(path))
      .find((path) => path.startsWith('/v1/orders?as=lab'));
    expect(firstLabOrdersUrl).toContain('initDate=');
    expect(firstLabOrdersUrl).toContain('finalDate=');

    fireEvent.change(screen.getByLabelText(/data inicial/i), { target: { value: '2026-01-01' } });
    fireEvent.change(screen.getByLabelText(/data final/i), { target: { value: '2026-05-02' } });
    fireEvent.click(screen.getByRole('button', { name: /aplicar período/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/período de até 4 meses/i);
    expect(
      mockApiGet.mock.calls.some(([path]) =>
        String(path).includes('initDate=2026-01-01T00%3A00%3A00.000Z&finalDate=2026-05-02T23%3A59%3A59.999Z')
      )
    ).toBe(false);

    fireEvent.change(screen.getByLabelText(/data inicial/i), { target: { value: '2026-02-01' } });
    fireEvent.change(screen.getByLabelText(/data final/i), { target: { value: '2026-05-31' } });
    fireEvent.click(screen.getByRole('button', { name: /aplicar período/i }));

    await waitFor(() =>
      expect(mockApiGet).toHaveBeenCalledWith(
        '/v1/orders?as=lab&initDate=2026-02-01T00%3A00%3A00.000Z&finalDate=2026-05-31T23%3A59%3A59.999Z',
        'tok'
      )
    );
  });

  it('explains account-removal interruptions in the operational timeline', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-301',
            status: 'cancelled',
            statusLabel: 'Cancelada',
            stage: 'awaiting_initial_consultation',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Paciente Demo', email: 'paciente@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({
        events: [
          {
            id: 'event-account-deletion',
            orderId: 'BP-DEMO-301',
            fromStatus: 'awaiting_scheduling',
            toStatus: 'cancelled',
            reason: 'account_deletion_approved',
            createdAt: '2026-05-01T11:00:00.000Z',
          },
        ],
      })

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-queue-table')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /visualizar atualizações da ordem bp-demo-301/i }));

    const timelineDialog = await screen.findByRole('dialog', { name: /atualizações da ordem/i });
    expect(within(timelineDialog).getByText(/jornada interrompida/i)).toBeInTheDocument();
    expect(within(timelineDialog).getByText(/remoção de conta aprovada/i)).toBeInTheDocument();
    expect(within(timelineDialog).getByText(/não foi gerado ressarcimento automático/i)).toBeInTheDocument();
  });

  it('does not expose the old dentist-side consultation linking modal', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-002',
            status: 'in_progress',
            statusLabel: 'Aguardando confirmação de consulta',
            stage: 'consultation_linked',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'atleta.demo@nexor.dev', phone: '11999990001' },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ forms: [] })

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(within(getDesktopTable('dentist-queue-table')).getByText('BP-DEMO-002')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /vincular consulta/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /vincular consulta/i })).not.toBeInTheDocument();
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('opens an action modal when an in-progress dentist order waits for patient confirmation', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-PATIENT-PENDING',
            status: 'in_progress',
            statusLabel: 'Em andamento',
            stage: 'consultation_linked',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Paciente Pendente', email: 'pendente@nexor.dev', phone: '11999990001' },
          },
        ],
      })
      .mockResolvedValueOnce({
        appointments: [
          {
            id: 'appointment-patient-pending',
            order_id: 'BP-DEMO-PATIENT-PENDING',
            type: 'initial',
            status: 'scheduled',
            scheduled_at: '2026-05-07T10:00:00.000Z',
            user_confirmed_at: null,
            dentist_confirmed_at: '2026-05-07T11:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ forms: [] });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-queue-table')).toBeInTheDocument());

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.getAllByText('Em andamento')[0]).toBeInTheDocument();

    const infoActions = screen.getAllByTestId('dentist-order-action-patient-pending-info');
    expect(infoActions.length).toBeGreaterThan(0);
    fireEvent.click(infoActions[0]);

    const modal = screen.getByRole('dialog', { name: /ordem aguardando aceite do cliente/i });
    expect(within(modal).getByText('Aguardando aceite do cliente')).toBeInTheDocument();
    expect(within(modal).getByText(/o dentista já confirmou a consulta/i)).toBeInTheDocument();
    expect(within(modal).getByText(/o paciente ainda precisa confirmar/i)).toBeInTheDocument();
  });

  it('opens the pre-consultation review after both appointment confirmations for licensed dentists', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/products/biteplaner/access-options') {
        return Promise.resolve({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
        });
      }

      if (path === '/v1/account/products/biteplaner/financial-onboarding') {
        return Promise.resolve({ recipients: [] });
      }

      if (path.startsWith('/v1/orders?as=dentist')) {
        return Promise.resolve({
        orders: [
          {
            id: 'BP-DEMO-CHECK',
            status: 'in_progress',
            statusLabel: 'Aguardando confirmação de consulta',
            stage: 'consultation_linked',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Cliente Check', email: 'check@nexor.dev', phone: null },
          },
          {
            id: 'BP-DEMO-CLINICAL',
            status: 'appointment_confirmed',
            statusLabel: 'Aguardando decisão clínica',
            stage: 'awaiting_clinical_decision',
            created_at: '2026-05-01T11:00:00.000Z',
            customer: { full_name: 'Cliente Clinico', email: 'clinico@nexor.dev', phone: null },
          },
          {
            id: 'BP-DEMO-STALE',
            status: 'in_progress',
            statusLabel: 'Consulta em andamento',
            stage: 'consultation_linked',
            created_at: '2026-05-01T12:00:00.000Z',
            customer: { full_name: 'Cliente Legado', email: 'legado@nexor.dev', phone: null },
          },
        ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-CHECK/appointments') {
        return Promise.resolve({ appointments: [
          {
            id: 'appointment-check',
            order_id: 'BP-DEMO-CHECK',
            type: 'initial',
            status: 'scheduled',
            scheduled_at: '2026-05-07T10:00:00.000Z',
            user_confirmed_at: '2026-05-07T11:00:00.000Z',
            dentist_confirmed_at: null,
          },
        ] });
      }

      if (path === '/v1/orders/BP-DEMO-CLINICAL/appointments') {
        return Promise.resolve({ appointments: [
          {
            id: 'appointment-clinical',
            order_id: 'BP-DEMO-CLINICAL',
            type: 'initial',
            status: 'completed',
            scheduled_at: '2026-05-07T12:00:00.000Z',
            user_confirmed_at: '2026-05-07T13:00:00.000Z',
            dentist_confirmed_at: '2026-05-07T13:05:00.000Z',
          },
        ] });
      }

      if (path === '/v1/orders/BP-DEMO-STALE/appointments') {
        return Promise.resolve({ appointments: [
          {
            id: 'appointment-stale',
            order_id: 'BP-DEMO-STALE',
            type: 'initial',
            status: 'scheduled',
            scheduled_at: '2026-05-07T14:00:00.000Z',
            user_confirmed_at: '2026-05-07T15:00:00.000Z',
            dentist_confirmed_at: '2026-05-07T15:05:00.000Z',
          },
        ] });
      }

      if (path.includes('/timeline')) {
        return Promise.resolve({ events: [] });
      }

      if (path.includes('/forms')) {
        return Promise.resolve({ forms: [] });
      }

      return Promise.resolve({});
    });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistLicensed',
      backendUser: { email: 'dentista.licenciada@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-queue-table')).toBeInTheDocument());
    const dentistQueueTable = getDesktopTable('dentist-queue-table');
    const confirmationRow = within(dentistQueueTable).getByText('BP-DEMO-CHECK').closest('tr');
    const clinicalRow = within(dentistQueueTable).getByText('BP-DEMO-CLINICAL').closest('tr');
    const staleRow = within(dentistQueueTable).getByText('BP-DEMO-STALE').closest('tr');

    if (!confirmationRow || !clinicalRow || !staleRow) {
      throw new Error('Expected all licensed dentist scenario rows to render.');
    }

    expect(confirmationRow).toHaveTextContent(/aguardando confirmação de consulta/i);
    expect(within(confirmationRow).getByRole('button', { name: /confirmar consulta realizada/i })).toBeInTheDocument();
    expect(within(confirmationRow).queryByRole('button', { name: /registrar apto/i })).not.toBeInTheDocument();

    expect(clinicalRow).toHaveTextContent(/aguardando decisão clínica/i);
    expect(within(clinicalRow).getByRole('button', { name: /complementar pré-consulta/i })).toBeInTheDocument();
    expect(within(clinicalRow).queryByRole('button', { name: /registrar apto/i })).not.toBeInTheDocument();
    expect(within(clinicalRow).queryByRole('button', { name: /registrar inapto/i })).not.toBeInTheDocument();
    expect(within(clinicalRow).queryByRole('button', { name: /marcar tratamento pr/i })).not.toBeInTheDocument();
    expect(within(clinicalRow).queryByRole('button', { name: /confirmar consulta realizada/i })).not.toBeInTheDocument();

    expect(within(staleRow).getByRole('button', { name: /complementar pré-consulta/i })).toBeInTheDocument();
    expect(within(staleRow).queryByRole('button', { name: /confirmar consulta realizada/i })).not.toBeInTheDocument();

    const mobileList = screen.getByTestId('dentist-queue-table-mobile');
    expect(
      within(mobileList).getByTestId('dentist-order-action-confirm-appointment-mobile-BP-DEMO-CHECK')
    ).toBeInTheDocument();
    expect(
      within(mobileList).getByTestId('dentist-order-action-open-pre-consultation-review-mobile-BP-DEMO-CLINICAL')
    ).toBeInTheDocument();
    expect(
      within(mobileList).getByTestId('dentist-order-action-open-pre-consultation-review-mobile-BP-DEMO-STALE')
    ).toBeInTheDocument();
  });

  it('shows inaptitude status and no dentist action when the pre-consultation form is already marked not eligible', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/products/biteplaner/access-options') {
        return Promise.resolve({
          productKey: 'biteplaner',
          defaultMode: 'dentist',
          enrollment: null,
          modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
        });
      }

      if (path.startsWith('/v1/orders?as=dentist')) {
        return Promise.resolve({
          orders: [
            {
              id: 'BP-DEMO-INELIGIBLE',
              status: 'in_progress',
              statusLabel: 'Em andamento',
              stage: 'consultation_linked',
              created_at: '2026-05-07T10:00:00.000Z',
              customer: { full_name: 'Cliente Inapto', email: 'cliente@nexor.dev', phone: null },
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-INELIGIBLE/appointments') {
        return Promise.resolve({
          appointments: [
            {
              id: 'appointment-ineligible',
              order_id: 'BP-DEMO-INELIGIBLE',
              type: 'initial',
              status: 'completed',
              scheduled_at: '2026-05-07T10:00:00.000Z',
              user_confirmed_at: '2026-05-07T11:00:00.000Z',
              dentist_confirmed_at: '2026-05-07T11:05:00.000Z',
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-INELIGIBLE/timeline') {
        return Promise.resolve({
          events: [
            {
              id: 'event-ineligible',
              orderId: 'BP-DEMO-INELIGIBLE',
              fromStatus: 'in_progress',
              toStatus: 'ineligible_reassessment',
              reason: 'Dentista registrou inaptidão no complemento de pré-consulta.',
              createdAt: '2026-05-07T11:10:00.000Z',
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-INELIGIBLE/workflow-forms') {
        return Promise.resolve({
          forms: [
            {
              id: 'BP-WF-INELIGIBLE-INTAKE',
              orderId: 'BP-DEMO-INELIGIBLE',
              templateKey: 'customer_pre_consultation_intake',
              stepKey: 'initial_consultation_preparation',
              status: 'submitted',
              roleState: { customer: 'locked', dentist: 'submitted' },
              customerSubmittedAt: '2026-05-07T10:30:00.000Z',
              dentistReviewStartedAt: '2026-05-07T11:00:00.000Z',
              dentistSubmittedAt: '2026-05-07T11:10:00.000Z',
              canViewPayload: true,
              summary: null,
              releasedAt: '2026-05-07T10:00:00.000Z',
              submittedAt: '2026-05-07T11:10:00.000Z',
              payload: {
                customer: { fullName: 'Cliente Inapto' },
                dentist: {
                  biteplannerEligible: 'no',
                  ineligibilityDescriptionForCustomer: 'Cliente deve passar por nova avaliação.',
                },
              },
            },
          ],
        });
      }

      return Promise.resolve({});
    });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistLicensed',
      backendUser: { email: 'dentista2@gmail.com', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-queue-table')).toBeInTheDocument());
    const dentistQueueTable = getDesktopTable('dentist-queue-table');
    const row = within(dentistQueueTable).getByText('BP-DEMO-INELIGIBLE').closest('tr');

    if (!row) {
      throw new Error('Expected ineligible dentist row to render.');
    }

    expect(row).toHaveTextContent(/inaptidão/i);
    expect(row).not.toHaveTextContent(/nova consulta disponível/i);
    expect(row).toHaveTextContent(/consulta inicial/i);
    expect(within(row).queryByTestId('dentist-order-action-open-pre-consultation-review')).not.toBeInTheDocument();
    expect(within(row).queryByTestId('dentist-order-action-confirm-appointment')).not.toBeInTheDocument();
    expect(row).toHaveTextContent('-');

    fireEvent.click(within(dentistQueueTable).getByRole('button', { name: /visualizar atualizações da ordem bp-demo-ineligible/i }));
    const timelineDialog = await screen.findByRole('dialog', { name: /atualizações da ordem/i });
    expect(within(timelineDialog).getByText(/^inaptidão$/i)).toBeInTheDocument();
    expect(within(timelineDialog).queryByText(/nova consulta disponível/i)).not.toBeInTheDocument();
    expect(within(timelineDialog).queryByText(/ineligible reassessment/i)).not.toBeInTheDocument();
  });

  it('shows the dentist workspace when the admin approval is already active', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({ orders: [] });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistApproved',
      backendUser: { email: 'dentista.aprovada@nexor.dev', roles: ['dentist'] },
    });

    expect(await screen.findByText(/workspace do dentista/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('dentist-status-dot')).toHaveAttribute('data-tone', 'success'));
    expect(screen.queryByText(/conteúdo liberado apenas para dentistas/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ir para licenciamento/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('dentist-queue-table')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirmar pagamento/i })).not.toBeInTheDocument();
    expect(mockApiGet).not.toHaveBeenCalledWith('/v1/account/biteplaner/dentist-licensing', 'tok');
  });

  it('renders the dentist workspace hero without the e-mail block', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({ orders: [] });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistApproved',
      backendUser: { email: 'dentista.aprovada@nexor.dev', roles: ['dentist'] },
    });

    expect(await screen.findByText(/workspace do dentista/i)).toBeInTheDocument();
    expect(screen.getByTestId('dentist-hero-visual')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('dentist-status-dot')).toHaveAttribute('data-tone', 'success'));
    const statusLabel = screen.getAllByText(/^status$/i)[0];
    const statusValue = statusLabel.parentElement?.querySelector('strong');

    expect(screen.queryByText('E-mail')).not.toBeInTheDocument();
    expect(screen.queryByText('dentista.aprovada@nexor.dev')).not.toBeInTheDocument();
    if (!statusValue) {
      throw new Error('Expected dentist status value in workspace hero.');
    }
    expect(statusValue).toHaveTextContent(/licenciado/i);
    expect(statusLabel.parentElement).toContainElement(statusValue);
  });

  it('renders the laboratory workspace hero with admin-approved licensed status', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'lab',
        enrollment: null,
        modes: [{ key: 'lab', label: 'Laboratório', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({ orders: [] });

    renderPage('/painel/biteplaner?mode=lab', {
      demoPersona: 'athlete',
      backendUser: { email: 'lab@nexor.dev', roles: ['lab'] },
    });

    expect(await screen.findByText(/workspace do laboratório/i)).toBeInTheDocument();
    expect(screen.getByTestId('lab-hero-visual')).toBeInTheDocument();
    const statusLabel = screen.getAllByText(/^status$/i)[0];
    const statusValue = statusLabel.parentElement?.querySelector('strong');

    expect(screen.queryByText('E-mail')).not.toBeInTheDocument();
    expect(screen.queryByText('lab@nexor.dev')).not.toBeInTheDocument();
    if (!statusValue) {
      throw new Error('Expected laboratory status value in workspace hero.');
    }
    expect(statusValue).toHaveTextContent(/licenciado/i);
    expect(statusLabel.parentElement).toContainElement(statusValue);
  });

  it('treats legacy approved laboratory workflows as licensed in the workspace', () => {
    expect(isLegacyLicensedLabStatus('lab', 'approved_pending_payment')).toBe(true);
    expect(getDentistLicensingStatusLabel('lab', 'approved_pending_payment')).toBe('Licenciado');
    expect(getDentistLicensingStatusTone('lab', 'approved_pending_payment')).toBe('success');
  });
  it('treats legacy approved dentist workflows as licensed in the workspace', () => {
    expect(isLegacyLicensedLabStatus('dentist', 'approved_pending_payment')).toBe(true);
    expect(getDentistLicensingStatusLabel('dentist', 'approved_pending_payment')).toBe('Licenciado');
    expect(getDentistLicensingStatusTone('dentist', 'approved_pending_payment')).toBe('success');
  });
  it('keeps the dentist home in skeleton state until orders finish loading', async () => {
    const ordersRequest = deferred<{ orders: [] }>();
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockImplementationOnce(() => ordersRequest.promise);

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistLicensed',
      backendUser: { email: 'dentista.licenciada@nexor.dev', roles: ['dentist'] },
    });

    expect(await screen.findByLabelText(/carregando painel do dentista/i)).toBeInTheDocument();
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
    expect(screen.queryByText(/conteúdo liberado apenas para dentistas licenciados/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('dentist-queue-table')).not.toBeInTheDocument();

    ordersRequest.resolve({ orders: [] });

    await waitFor(() => expect(screen.queryByLabelText(/carregando painel do dentista/i)).not.toBeInTheDocument());
    expect(screen.getByTestId('dentist-queue-table')).toBeInTheDocument();
    expect(screen.queryByText(/conteúdo liberado apenas para dentistas licenciados/i)).not.toBeInTheDocument();
  });

  it('keeps dentist workspace locked when admin approval is not active', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: false, highlighted: true, reason: 'Cadastro pendente.' }],
      })
      .mockResolvedValueOnce({ orders: [] });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    expect(await screen.findByText(/conteúdo liberado apenas para dentistas aprovados/i)).toBeInTheDocument();
    expect(screen.getByTestId('dentist-status-dot')).toHaveAttribute('data-tone', 'warning');
    expect(screen.queryByTestId('dentist-queue-table')).not.toBeInTheDocument();
  });

  it('opens the production wizard entry action for orders awaiting dentist forms', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-204',
            status: 'awaiting_dentist_forms',
            statusLabel: 'Aguardando envio ao laboratório',
            stage: 'awaiting_dentist_forms',
            created_at: '2026-05-01T13:00:00.000Z',
            customer: { full_name: 'Ana Demo', email: 'ana@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({
        events: [
          {
            id: 'event-204',
            orderId: 'BP-DEMO-204',
            fromStatus: 'awaiting_payment',
            toStatus: 'awaiting_dentist_forms',
            reason: 'Pagamento mock confirmado. Ordem aguardando solicitação de produção do dentista.',
            createdAt: '2026-05-01T13:10:00.000Z',
          },
        ],
      })

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /abrir solicitação de produção da ordem bp-demo-204/i })).toBeInTheDocument()
    );
    expect(screen.queryByRole('button', { name: /encaminhar ao laboratório a ordem bp-demo-204/i })).not.toBeInTheDocument();
  });

  it('opens the clinical record from the dentist queue while the order awaits payment', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'ae3c5f2a-384b-4c4a-a7fe-bf09d4969785',
            status: 'awaiting_payment',
            statusLabel: 'Aguardando pagamento',
            stage: 'awaiting_payment',
            created_at: '2026-05-01T13:00:00.000Z',
            customer: { full_name: 'Ana Demo', email: 'ana@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    const action = await screen.findByRole('button', {
      name: /visualizar ficha clínica da ordem ae3c5f2a-384b-4c4a-a7fe-bf09d4969785/i,
    });

    expect(screen.queryByRole('button', { name: /abrir solicitação de produção da ordem/i })).not.toBeInTheDocument();
    fireEvent.click(action);

    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/painel/dentista/producao/ae3c5f2a-384b-4c4a-a7fe-bf09d4969785'
    );
  });

  it('renders the laboratory queue flow with start production before completion', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'lab',
        enrollment: null,
        modes: [{ key: 'lab', label: 'Laboratório', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-005',
            status: 'awaiting_lab_start',
            statusLabel: 'Aguardando aceite do laborat\u00f3rio',
            stage: 'awaiting_lab_start',
            created_at: '2026-05-01T10:00:00.000Z',
            updated_at: '2026-05-03T09:20:00.000Z',
            customer: { full_name: 'Marina Demo', email: 'marina@nexor.dev', phone: null },
            dentist: { full_name: 'Dra. Ana Demo', email: 'ana@nexor.dev' },
            productionRequestDraft: {
              anamnesisSummary: 'Paciente apta para Biteplaner esportivo.',
              anamnesisDownloaded: true,
              productionRequestSummary: 'Protetor superior personalizado para alto impacto.',
              labNotes: 'Priorizar acabamento vestibular e conferir adaptação posterior.',
              scan3dFileName: 'marina-demo-arcada-superior.stl',
              scan3dFileRef: {
                id: 'upload_demo_marina_scan',
                fileName: 'marina-demo-arcada-superior.stl',
                provider: 'amazon-s3',
                purpose: 'production_scan3d',
                objectKey: 'biteplaner/production-scans/confirmed/BP-DEMO-005/upload_demo_marina_scan/marina-demo-arcada-superior.stl',
                scanStatus: 'not_scanned',
                uploadedAt: '2026-05-03T09:15:00.000Z',
              },
              lgpdConfirmed: true,
              selectedLabId: 'lab-demo-001',
              purchaseConfiguration: { productKey: 'biteplaner', model: 'impacto', color: 'preto', quantity: 3 },
            },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-005',
            status: 'lab_processing',
            statusLabel: 'Em produ\u00e7\u00e3o',
            stage: 'lab_production',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Marina Demo', email: 'marina@nexor.dev', phone: null },
            dentist: { full_name: 'Dra. Ana Demo', email: 'ana@nexor.dev' },
            productionRequestDraft: {
              anamnesisSummary: 'Paciente apta para Biteplaner esportivo.',
              anamnesisDownloaded: true,
              productionRequestSummary: 'Protetor superior personalizado para alto impacto.',
              labNotes: 'Priorizar acabamento vestibular e conferir adaptação posterior.',
              scan3dFileName: 'marina-demo-arcada-superior.stl',
              scan3dFileRef: {
                id: 'upload_demo_marina_scan',
                fileName: 'marina-demo-arcada-superior.stl',
                provider: 'amazon-s3',
                purpose: 'production_scan3d',
                objectKey: 'biteplaner/production-scans/confirmed/BP-DEMO-005/upload_demo_marina_scan/marina-demo-arcada-superior.stl',
                scanStatus: 'not_scanned',
                uploadedAt: '2026-05-03T09:15:00.000Z',
              },
              lgpdConfirmed: true,
              selectedLabId: 'lab-demo-001',
              purchaseConfiguration: { productKey: 'biteplaner', model: 'impacto', color: 'preto', quantity: 3 },
            },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-005',
            status: 'product_received_by_clinic',
            statusLabel: 'Aguardando recebimento pelo dentista',
            stage: 'product_received_by_clinic',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Marina Demo', email: 'marina@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] });
    mockApiPost
      .mockResolvedValueOnce({ order: { id: 'BP-DEMO-005' } })
      .mockResolvedValueOnce({ order: { id: 'BP-DEMO-005' } });

    renderPage('/painel/biteplaner?mode=lab', {
      demoPersona: 'lab',
      backendUser: { email: 'lab@nexor.dev', roles: ['lab'] },
    });

    await waitFor(() => expect(screen.getByTestId('lab-queue-table')).toBeInTheDocument());
    const labQueueTable = screen.getByTestId('lab-queue-table');
    expect(screen.getByText(/fila operacional do laboratório/i)).toBeInTheDocument();
    expect(within(labQueueTable).getAllByRole('columnheader').map((header) => header.textContent?.trim())).toEqual([
      'Pedido',
      'Última atualização',
      'Etapa',
      'Status',
      'Detalhes',
      'Ações',
    ]);
    expect(within(labQueueTable).getByText('03/05/2026 06:20')).toBeInTheDocument();
    expect(within(labQueueTable).getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(within(labQueueTable).queryByRole('columnheader', { name: /paciente/i })).not.toBeInTheDocument();
    expect(within(labQueueTable).queryByRole('columnheader', { name: /dentista/i })).not.toBeInTheDocument();
    expect(within(labQueueTable).queryByText(/marina demo/i)).not.toBeInTheDocument();
    expect(within(labQueueTable).queryByText(/dra\. ana demo/i)).not.toBeInTheDocument();
    expect(within(screen.getByTestId('lab-queue-table-mobile')).queryByText(/marina demo/i)).not.toBeInTheDocument();
    expect(within(screen.getByTestId('lab-queue-table-mobile')).queryByText(/dra\. ana demo/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/aguardando aceite do laboratório/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /verificar documentação da ordem bp-demo-005/i })).toBeInTheDocument();
    expect(
      within(screen.getByTestId('lab-queue-table-mobile')).getByTestId(
        'lab-order-action-documentation-mobile-BP-DEMO-005'
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /verificar documentação da ordem bp-demo-005/i }));
    expect(await screen.findByRole('dialog', { name: /formulário de solicitação de produção/i })).toBeInTheDocument();
    const documentationDialog = screen.getByRole('dialog', { name: /formulário de solicitação de produção/i });
    expect(within(documentationDialog).queryByText(/protetor superior personalizado/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).getByText(/observa/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/priorizar acabamento/i)).toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/dra\. ana demo/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/marina demo/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/pedido biteplaner/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByTestId('lab-documentation-purchase-section')).not.toBeInTheDocument();
    expect(within(documentationDialog).getByText(/^modelo$/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/impacto/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/^cor$/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/preto/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/^quantidade$/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/^3$/i)).toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/resumo da anamnese/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/paciente apta para biteplaner esportivo/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/lgpd e retenção/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/laboratório selecionado/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).getByRole('button', {
      name: /baixar escaneamento 3d marina-demo-arcada-superior\.stl/i
    })).toBeInTheDocument();
    expect(within(documentationDialog).getAllByText(/baixar arquivo/i)).toHaveLength(1);
    expect(within(documentationDialog).getAllByText(/tamanho não informado/i)).toHaveLength(1);
    expect(screen.queryByTestId('lab-order-action-start')).not.toBeInTheDocument();
    expect(within(documentationDialog).getByTestId('lab-documentation-action-start')).toBeInTheDocument();
    expect(within(documentationDialog).getByTestId('lab-documentation-action-return')).toBeInTheDocument();

    fireEvent.click(within(documentationDialog).getByTestId('lab-documentation-action-start'));
    expect(await screen.findByRole('dialog', { name: /confirmar ação da ordem/i })).toBeInTheDocument();
    expect(screen.getByText(/deseja aprovar a ordem bp-demo-005 e iniciar a produ/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith('/v1/orders/BP-DEMO-005/lab-production-started', {}, 'tok')
    );
    expect(screen.getAllByText(/em produ/i).length).toBeGreaterThan(0);

    await waitFor(() => expect(screen.getByTestId('lab-order-action-complete')).toBeInTheDocument());
    await waitFor(() =>
      expect(
        within(screen.getByTestId('lab-queue-table-mobile')).getByTestId('lab-order-action-complete-mobile-BP-DEMO-005')
      ).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('lab-order-action-complete'));
    expect(await screen.findByRole('dialog', { name: /confirmar ação da ordem/i })).toBeInTheDocument();
    expect(screen.getByText(/deseja registrar que a produ/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith('/v1/orders/BP-DEMO-005/lab-production-completed', {}, 'tok')
    );
    expect(screen.getAllByText(/aguardando recebimento pelo dentista/i).length).toBeGreaterThan(0);
  });

  it('loads production request form details in the laboratory documentation modal', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/products/biteplaner/access-options') {
        return Promise.resolve({
          productKey: 'biteplaner',
          defaultMode: 'lab',
          enrollment: null,
          modes: [{ key: 'lab', label: 'Laboratório', description: '', allowed: true, highlighted: true, reason: null }],
        });
      }

      if (path.startsWith('/v1/orders?as=lab')) {
        return Promise.resolve({
          orders: [
            {
              id: 'BP-DEMO-088',
              status: 'awaiting_lab_start',
              statusLabel: 'Aguardando aceite do laborat\u00f3rio',
              stage: 'awaiting_lab_start',
              created_at: '2026-05-01T10:00:00.000Z',
              customer: { full_name: 'Eduardo Paciente', email: 'paciente@nexor.dev', phone: null },
              dentist: { full_name: 'Dr. Eduardo Fujiwara', email: 'eduardoshoitifujiwara@gmail.com' },
              productionRequestDraft: null,
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-088/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      if (path === '/v1/orders/BP-DEMO-088/timeline') {
        return Promise.resolve({ events: [] });
      }

      if (path === '/v1/orders/BP-DEMO-088/forms') {
        return Promise.resolve({
          forms: [
            {
              id: 'form-production-1',
              order_id: 'BP-DEMO-088',
              type: 'production_request',
              version: 1,
              created_at: '2026-06-03T13:00:00.000Z',
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-088/forms/form-production-1') {
        return Promise.resolve({
          id: 'form-production-1',
          order_id: 'BP-DEMO-088',
          type: 'production_request',
          version: 1,
          created_at: '2026-06-03T13:00:00.000Z',
          payload: {
            anamnesisSummary: 'Resumo clínico validado para produção.',
            anamnesisDownloaded: true,
            productionRequestSummary: 'Solicitação de produção enviada ao laboratório.',
            labNotes: 'Usar acabamento esportivo e conferir adaptação posterior.',
            scan3dFileName: '',
            scan3dFileRef: {
              id: 'upload_demo_scan_123',
              fileName: 'scan-real.stl',
              provider: 'amazon-s3',
              purpose: 'production_scan3d',
              objectKey: 'biteplaner/production-scans/confirmed/BP-DEMO-088/upload_demo_scan_123/scan-real.stl',
              mimeType: 'model/stl',
              sizeBytes: 123456,
              scanStatus: 'not_scanned',
              uploadedAt: '2026-06-03T12:55:00.000Z',
            },
            lgpdConfirmed: true,
            selectedLabId: 'profile-lab-edu',
            purchaseConfiguration: { productKey: 'biteplaner', model: 'esportes', color: 'branco', quantity: 2 },
          },
        });
      }

      return Promise.reject(new Error(`Unhandled GET ${path}`));
    });
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    mockApiPost.mockResolvedValueOnce({
      downloadUrl: 'https://s3.demo.local/download/scan-real.stl',
      expiresAt: '2026-06-03T13:05:00.000Z',
    });

    renderPage('/painel/biteplaner?mode=lab', {
      demoPersona: 'lab',
      backendUser: { email: 'eduardoshoitifujiwara123@gmail.com', roles: ['lab'] },
    });

    await waitFor(() => expect(screen.getByTestId('lab-queue-table')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /verificar documentação da ordem bp-demo-088/i }));

    const documentationDialog = await screen.findByRole('dialog', { name: /formulário de solicitação de produção/i });
    expect(within(documentationDialog).queryByText(/dr\. eduardo fujiwara/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/eduardoshoitifujiwara@gmail\.com/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/eduardo paciente/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/paciente@nexor\.dev/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/pedido biteplaner/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/^paciente$/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/dentista solicitante/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).getByText(/^modelo$/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/esportes/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/^cor$/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/branco/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/^quantidade$/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/^2$/i)).toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/resumo clínico validado para produção/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/resumo da anamnese/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/lgpd e retenção/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/laboratório selecionado/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/solicitação de produção enviada ao laboratório/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).getByText(/usar acabamento esportivo/i)).toBeInTheDocument();
    const scanDownload = within(documentationDialog).getByRole('button', { name: /baixar escaneamento 3d scan-real\.stl/i });
    expect(scanDownload).toHaveTextContent(/baixar arquivo/i);
    expect(mockApiPost).not.toHaveBeenCalled();
    fireEvent.click(scanDownload);
    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-088/attachments/production-scan3d/download-url',
        { fileRefId: 'upload_demo_scan_123' },
        'tok'
      )
    );
    expect(openSpy).toHaveBeenCalledWith(
      'https://s3.demo.local/download/scan-real.stl',
      '_blank',
      'noopener,noreferrer'
    );
    expect(await screen.findByText(/download temporário gerado para o escaneamento 3d\./i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/tamanho: 120,6 kb/i)).toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/scan-real\.stl/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/prescricao-real\.pdf/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/id externo/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/serviço/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/^tipo:/i)).not.toBeInTheDocument();
  });

  it('shows reassigned lab orders as read-only history for the previous laboratory', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/products/biteplaner/access-options') {
        return Promise.resolve({
          productKey: 'biteplaner',
          defaultMode: 'lab',
          enrollment: null,
          modes: [{ key: 'lab', label: 'Laboratório', description: '', allowed: true, highlighted: true, reason: null }],
        });
      }

      if (path.startsWith('/v1/orders?as=lab')) {
        return Promise.resolve({
          orders: [
            {
              id: 'BP-DEMO-REASSIGNED',
              status: 'awaiting_lab_start',
              statusLabel: 'Aguardando aceite do laboratório',
              stage: 'awaiting_lab_start',
              created_at: '2026-06-04T13:00:00.000Z',
              lab_profile_id: 'lab-demo-002',
              customer: { full_name: 'Cliente Reencaminhado', email: 'cliente@nexor.dev', phone: null },
              dentist: { full_name: 'Dra. Ana Demo', email: 'ana@nexor.dev' },
              productionRequestDraft: {
                anamnesisSummary: 'Resumo preservado.',
                anamnesisDownloaded: true,
                productionRequestSummary: 'Solicitação reenviada para outro laboratório.',
                labNotes: 'Histórico do laboratório anterior.',
                scan3dFileName: 'scan.stl',
                lgpdConfirmed: true,
                selectedLabId: 'lab-demo-002',
              },
              labAssignmentView: {
                id: 'assignment-1',
                orderId: 'BP-DEMO-REASSIGNED',
                labProfileId: 'lab-demo-001',
                sequence: 1,
                status: 'returned_for_adjustment',
                productionRequestVersionId: null,
                returnReason: 'Ajuste solicitado pelo laboratório anterior.',
                assignedAt: '2026-06-04T12:00:00.000Z',
                returnedAt: '2026-06-04T12:30:00.000Z',
                replacedAt: null,
                completedAt: null,
                isCurrent: false,
              },
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-REASSIGNED/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      if (path === '/v1/orders/BP-DEMO-REASSIGNED/timeline') {
        return Promise.resolve({ events: [] });
      }

      return Promise.resolve({});
    });

    renderPage('/painel/biteplaner?mode=lab', {
      demoPersona: 'lab',
      backendUser: { email: 'lab@nexor.dev', roles: ['lab'] },
    });

    await waitFor(() => expect(screen.getByTestId('lab-queue-table')).toBeInTheDocument());
    expect(screen.getAllByText(/mudança de lab/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/encaminhado para outro laboratório/i).length).toBeGreaterThan(0);
    expect(screen.queryByTestId('lab-order-action-documentation')).not.toBeInTheDocument();
    expect(screen.queryByTestId('lab-order-action-start')).not.toBeInTheDocument();
    expect(screen.queryByTestId('lab-order-action-return')).not.toBeInTheDocument();
  });

  it('lets the dentist confirm product receipt before adaptation', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-017',
            status: 'product_received_by_clinic',
            statusLabel: 'Aguardando recebimento pelo dentista',
            stage: 'product_received_by_clinic',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Marina Demo', email: 'marina@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-017',
            status: 'awaiting_adaptation',
            statusLabel: 'Aguardando adaptação',
            stage: 'awaiting_adaptation',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Marina Demo', email: 'marina@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] });
    mockApiPost.mockResolvedValueOnce({ order: { id: 'BP-DEMO-017' } });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistLicensed',
      backendUser: { email: 'dentista.licenciada@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-order-action-confirm-product-received')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('dentist-order-action-confirm-product-received'));
    const receiptDialog = await screen.findByRole('dialog', { name: /confirmar ação da ordem/i });
    expect(receiptDialog).toBeInTheDocument();
    expect(screen.getByText(/deseja confirmar que o pedido da ordem bp-demo-017 foi recebido pelo dentista/i)).toBeInTheDocument();
    fireEvent.click(within(receiptDialog).getByRole('button', { name: /^confirmar$/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith('/v1/orders/BP-DEMO-017/product-received', {}, 'tok')
    );
    expect(screen.getAllByText(/aguardando adaptação/i).length).toBeGreaterThan(0);
  });

  it('lets the dentist schedule the adaptation return with customer contact details', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-018',
            status: 'awaiting_adaptation',
            statusLabel: 'Aguardando adaptação',
            stage: 'awaiting_adaptation',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: {
              full_name: 'Marina Demo',
              email: 'marina@nexor.dev',
              phone: null,
            },
            user_profile: {
              phone: '11988887777',
            },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-018',
            status: 'awaiting_adaptation',
            statusLabel: 'Aguardando adaptação',
            stage: 'awaiting_adaptation',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: {
              full_name: 'Marina Demo',
              email: 'marina@nexor.dev',
              phone: null,
            },
            user_profile: {
              phone: '11988887777',
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        appointments: [
          {
            id: 'appointment-adaptation-1',
            order_id: 'BP-DEMO-018',
            type: 'adaptation',
            status: 'scheduled',
            scheduled_at: '2026-06-10T17:30:00.000Z',
            user_confirmed_at: null,
            dentist_confirmed_at: null,
          },
        ],
      })
      .mockResolvedValueOnce({ events: [] });
    mockApiPost.mockResolvedValueOnce({
      id: 'appointment-adaptation-1',
      order_id: 'BP-DEMO-018',
      type: 'adaptation',
      status: 'scheduled',
      scheduled_at: '2026-06-10T17:30:00.000Z',
      user_confirmed_at: null,
      dentist_confirmed_at: null,
    });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistLicensed',
      backendUser: { email: 'dentista.licenciada@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-order-action-schedule-adaptation')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('dentist-order-action-schedule-adaptation'));

    const dialog = await screen.findByRole('dialog', { name: /agendar retorno/i });
    expect(within(dialog).getByText(/marina demo/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/\(11\) 98888-7777/i)).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: /abrir whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('web.whatsapp.com/send')
    );
    expect(within(dialog).queryByText(/^abrir whatsapp$/i)).not.toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText(/data agendada/i), {
      target: { value: '2026-06-10T14:30' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: /^salvar$/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-018/appointments',
        expect.objectContaining({ type: 'adaptation', scheduledAt: expect.stringContaining('2026-06-10T') }),
        'tok'
      )
    );
    expect(mockApiPatch).not.toHaveBeenCalled();
  });

  it('loads the adaptation customer phone from the pre-consultation form when the order profile has no phone', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-019',
            status: 'awaiting_adaptation',
            statusLabel: 'Aguardando adaptação',
            stage: 'awaiting_adaptation',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: {
              full_name: 'Cliente Intake',
              email: 'cliente@nexor.dev',
              phone: null,
            },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({
        forms: [
          {
            id: 'workflow-pre-consultation-1',
            orderId: 'BP-DEMO-019',
            templateKey: 'customer_pre_consultation_intake',
            stepKey: 'initial_consultation_preparation',
            status: 'submitted',
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-01T10:00:00.000Z',
            submittedAt: '2026-05-01T10:30:00.000Z',
            payload: null,
          },
        ],
      })
      .mockResolvedValueOnce({
        id: 'workflow-pre-consultation-1',
        orderId: 'BP-DEMO-019',
        templateKey: 'customer_pre_consultation_intake',
        stepKey: 'initial_consultation_preparation',
        status: 'submitted',
        canViewPayload: true,
        summary: null,
        releasedAt: '2026-05-01T10:00:00.000Z',
        submittedAt: '2026-05-01T10:30:00.000Z',
        payload: { customer: { phone: '(11) 97777-6666' } },
      });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistLicensed',
      backendUser: { email: 'dentista.licenciada@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-order-action-schedule-adaptation')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('dentist-order-action-schedule-adaptation'));

    const dialog = await screen.findByRole('dialog', { name: /agendar retorno/i });
    await waitFor(() => expect(within(dialog).getByText(/\(11\) 97777-6666/i)).toBeInTheDocument());
    expect(mockApiGet).toHaveBeenCalledWith('/v1/orders/BP-DEMO-019/workflow-forms', 'tok');
    expect(mockApiGet).toHaveBeenCalledWith(
      '/v1/orders/BP-DEMO-019/workflow-forms/workflow-pre-consultation-1',
      'tok'
    );
  });

  it('requires a return reason before sending a laboratory order back to the dentist', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'lab',
        enrollment: null,
        modes: [{ key: 'lab', label: 'Laboratório', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-006',
            status: 'awaiting_lab_start',
            statusLabel: 'Aguardando aceite do laborat\u00f3rio',
            stage: 'awaiting_lab_start',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Carlos Demo', email: 'carlos@nexor.dev', phone: null },
            productionRequestDraft: {
              anamnesisSummary: 'Paciente apto para Biteplaner.',
              anamnesisDownloaded: true,
              productionRequestSummary: 'Solicitação pronta para revisão do laboratório.',
              labNotes: 'Conferir escaneamento antes de produzir.',
              scan3dFileName: 'scan-carlos.stl',
              lgpdConfirmed: true,
              selectedLabId: 'lab-demo-001',
              purchaseConfiguration: { productKey: 'biteplaner', model: 'impacto', color: 'preto', quantity: 1 },
            },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-006',
            status: 'dentist_adjustment_required',
            statusLabel: 'Ajuste de produção',
            stage: 'dentist_adjustment_required',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Carlos Demo', email: 'carlos@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ appointments: [] })
      .mockResolvedValueOnce({ events: [] });
    mockApiPost.mockResolvedValueOnce({ order: { id: 'BP-DEMO-006' } });

    renderPage('/painel/biteplaner?mode=lab', {
      demoPersona: 'lab',
      backendUser: { email: 'lab@nexor.dev', roles: ['lab'] },
    });

    await waitFor(() => expect(screen.getByTestId('lab-order-action-documentation')).toBeInTheDocument());
    expect(screen.queryByTestId('lab-order-action-return')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('lab-order-action-documentation'));

    const documentationDialog = await screen.findByRole('dialog', { name: /formulário de solicitação de produção/i });
    fireEvent.click(within(documentationDialog).getByTestId('lab-documentation-action-return'));

    const dialog = await screen.findByRole('dialog', { name: /confirmar ação da ordem/i });
    expect(screen.getByLabelText(/descrição do motivo/i)).toBeInTheDocument();
    const cancelButton = within(dialog).getByRole('button', { name: /cancelar/i });
    const confirmButton = within(dialog).getByRole('button', { name: /confirmar/i });
    expect(cancelButton.querySelector('svg')).toBeNull();
    expect(confirmButton.querySelector('svg')).toBeNull();
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/descrição do motivo/i), {
      target: { value: 'Escaneamento 3D incompleto e precisa de novo envio.' },
    });

    expect(confirmButton).not.toBeDisabled();
    fireEvent.click(confirmButton);

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-006/lab-return-for-adjustment',
        { reason: 'Escaneamento 3D incompleto e precisa de novo envio.' },
        'tok'
      )
    );
    await waitFor(() => expect(screen.getAllByText(/ajuste de produção/i).length).toBeGreaterThan(0));
    expect(screen.queryByTestId('lab-order-action-return')).not.toBeInTheDocument();
  });

  it('shows lab adjustment details to the dentist with contact and production request shortcut', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/products/biteplaner/access-options') {
        return Promise.resolve({
          productKey: 'biteplaner',
          defaultMode: 'dentist',
          enrollment: null,
          modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
        });
      }

      if (path.startsWith('/v1/orders?as=dentist')) {
        return Promise.resolve({
          orders: [
            {
              id: 'BP-DEMO-090',
              status: 'dentist_adjustment_required',
              statusLabel: 'Consulta em andamento',
              stage: 'dentist_adjustment_required',
              created_at: '2026-06-03T13:00:00.000Z',
              lab_profile_id: 'profile-lab-edu',
              customer: { full_name: 'Eduardo Paciente', email: 'paciente@nexor.dev', phone: null },
              productionRequestDraft: {
                anamnesisSummary: 'Resumo já preenchido.',
                anamnesisDownloaded: true,
                productionRequestSummary: 'Solicitação de produção com ajuste pendente.',
                labNotes: 'Conferir acabamento.',
                scan3dFileName: 'scan.stl',
                lgpdConfirmed: true,
                selectedLabId: 'profile-lab-edu',
              },
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-090/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      if (path === '/v1/orders/BP-DEMO-090/timeline') {
        return Promise.resolve({
          events: [
            {
              id: 'event-adjustment-1',
              orderId: 'BP-DEMO-090',
              fromStatus: 'lab_processing',
              toStatus: 'dentist_adjustment_required',
              reason: 'Escaneamento 3D incompleto e precisa de novo envio.',
              createdAt: '2026-06-03T13:10:00.000Z',
            },
          ],
        });
      }

      if (path === '/v1/account/biteplaner/licensed-labs') {
        return Promise.resolve({
          labs: [
            {
              id: 'lab-role-edu',
              profileId: 'profile-lab-edu',
              labName: 'Laboratório do Edu',
              cnpj: '27.122.387/0001-05',
              professionalSummary: 'Resumo operacional',
              address: 'Rua Conselheiro Brotero',
              cep: '01232-011',
              phone: '(11) 1111-1111',
              email: 'eduardoshoitifujiwara123@gmail.com',
              serviceHours: 'Segunda a Sexta - 06h a 19h',
              city: 'São Paulo',
              state: 'SP',
            },
          ],
        });
      }

      return Promise.reject(new Error(`Unhandled GET ${path}`));
    });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistLicensed',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-order-action-view-lab-adjustment')).toBeInTheDocument());
    expect(screen.getAllByText(/ajuste de produção/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/consulta em andamento/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('dentist-order-action-view-lab-adjustment'));

    const dialog = await screen.findByRole('dialog', { name: /ajuste de produção/i });
    const reasonCard = within(dialog).getByTestId('dentist-adjustment-reason-card');
    expect(reasonCard).toHaveTextContent(/mensagem do laboratório/i);
    expect(reasonCard).toHaveTextContent(/escaneamento 3d incompleto/i);
    expect(within(dialog).getByText(/escaneamento 3d incompleto/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/solicitação de produção com ajuste pendente/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/laboratório do edu/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/\(11\) 1111-1111/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/eduardoshoitifujiwara123@gmail\.com/i)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /abrir solicitação de produção/i })).toBeInTheDocument();
  });
});
