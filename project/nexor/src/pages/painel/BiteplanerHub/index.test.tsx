import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
      </ThemeProvider>
    </MemoryRouter>
  );
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

function licensedDentistWorkflow() {
  return {
    workflow: {
      id: 'workflow-licensed',
      status: 'licensed',
      paymentStatus: 'confirmed',
      testAttempts: 1,
      testPassed: true,
      certificateIssuedAt: '2026-05-03T14:00:00.000Z',
      metadata: { courseProgress: { fundamentos: true, operacao: true, qualidade: true } },
    },
    course: [],
    notifications: [],
  };
}

describe('BiteplanerHub', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockApiPatch.mockReset();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('keeps dashboard stat icons compact on notebook and mobile breakpoints', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/styles.ts'), 'utf8');
    const compactCardSource = source.slice(
      source.indexOf('const compactStatCard'),
      source.indexOf('const compactStatIcon')
    );
    const compactIconSource = source.slice(
      source.indexOf('const compactStatIcon'),
      source.indexOf('export const AthleteStatsGrid')
    );

    expect(source).toContain('@media (max-width: 1280px)');
    expect(source).toContain('width: 32px');
    expect(source).toContain('height: 32px');
    expect(source).toContain('padding: 16px');
    expect(compactCardSource).toContain('align-items: flex-start');
    expect(compactIconSource).toContain('align-self: flex-start');
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
            statusLabel: 'Pre-requisito pendente',
            created_at: '2026-05-01T10:00:00.000Z',
            orderStatus: 'Pre-requisito pendente',
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

  it('sends a registration-started athlete back to onboarding when the prerequisite intake is not released yet', async () => {
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
            statusLabel: 'Pre-requisito pendente',
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
    expect(screen.getAllByText(/jornada do atleta/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('athlete-primary-order')).toHaveTextContent(/próximo passo visível/i);
    expect(screen.getByTestId('athlete-order-status')).toHaveTextContent(/cadastro iniciado/i);
    expect(screen.getByRole('link', { name: /continuar fluxo/i })).toHaveAttribute('href', '/painel/biteplaner/onboarding');
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
            statusLabel: 'Pre-requisito pendente',
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
    expect(screen.getByRole('link', { name: /continuar fluxo/i })).toHaveAttribute('href', '/painel/consulta-inicial');
    expect(screen.getByRole('link', { name: /abrir jornada/i })).toHaveAttribute('href', '/painel/biteplaner/jornada');
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
          ? [
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
          ? [
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
    mockApiGet.mockResolvedValueOnce(licensedDentistWorkflow());

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-queue-table')).toBeInTheDocument());
    const dentistQueueTable = screen.getByTestId('dentist-queue-table');
    expect(screen.getByText(/fila operacional do dentista/i)).toBeInTheDocument();
    expect(screen.getByText(/ordens com consulta agendada pelo cliente/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /vincular consulta/i })).not.toBeInTheDocument();
    expect(within(dentistQueueTable).getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(within(dentistQueueTable).queryByRole('columnheader', { name: /^consulta$/i })).not.toBeInTheDocument();
    expect(screen.getAllByText(/aguardando aceite do dentista/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /visualizar atualizacoes da ordem bp-demo-201/i }));
    const timelineDialog = await screen.findByRole('dialog', { name: /atualizacoes da ordem/i });
    expect(timelineDialog).toBeInTheDocument();
    expect(within(timelineDialog).getByText(/historico resumido da jornada operacional/i)).toBeInTheDocument();
    expect(within(timelineDialog).getByText(/aguardando aceite do dentista/i)).toBeInTheDocument();
    expect(within(timelineDialog).queryByText(/^awaiting_dentist_acceptance$/i)).not.toBeInTheDocument();
    expect(within(timelineDialog).queryByText(/^practice_location_selected_by_customer$/i)).not.toBeInTheDocument();
    expect(within(timelineDialog).getByText(/cliente informou que combinou a consulta fora da plataforma/i)).toBeInTheDocument();
    const timelineRows = within(timelineDialog).getAllByRole('row');
    expect(timelineRows[1]).toHaveTextContent(/aguardando aceite do dentista/i);
    fireEvent.click(screen.getByRole('button', { name: /fechar modal das atualizacoes/i }));
    fireEvent.click(screen.getByRole('button', { name: /aceitar consulta agendada da ordem bp-demo-201/i }));
    expect(await screen.findByRole('dialog', { name: /confirmar ação da ordem/i })).toBeInTheDocument();
    expect(screen.getByText(/deseja aceitar a consulta agendada da ordem bp-demo-201/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('BP-DEMO-205')).toBeInTheDocument();
    expect(screen.getByText('BP-DEMO-205').closest('tr')).toHaveTextContent('-');

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(within(dentistQueueTable).getByRole('button', { name: /selecionar/i }));
    fireEvent.click(screen.getByRole('option', { name: /tratamento prévio pendente/i }));

    await waitFor(() => {
      expect(screen.getByText('BP-DEMO-202')).toBeInTheDocument();
      expect(screen.queryByText('BP-DEMO-201')).not.toBeInTheDocument();
      expect(screen.queryByText('BP-DEMO-205')).not.toBeInTheDocument();
    });
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
      .mockResolvedValueOnce(licensedDentistWorkflow());

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    expect(await screen.findByText('BP-DEMO-002')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /vincular consulta/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /vincular consulta/i })).not.toBeInTheDocument();
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('opens the pre-consultation review after both appointment confirmations for licensed dentists', async () => {
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
      })
      .mockResolvedValueOnce({
        appointments: [
          {
            id: 'appointment-check',
            order_id: 'BP-DEMO-CHECK',
            type: 'initial',
            status: 'scheduled',
            scheduled_at: '2026-05-07T10:00:00.000Z',
            user_confirmed_at: '2026-05-07T11:00:00.000Z',
            dentist_confirmed_at: null,
          },
        ],
      })
      .mockResolvedValueOnce({
        appointments: [
          {
            id: 'appointment-clinical',
            order_id: 'BP-DEMO-CLINICAL',
            type: 'initial',
            status: 'completed',
            scheduled_at: '2026-05-07T12:00:00.000Z',
            user_confirmed_at: '2026-05-07T13:00:00.000Z',
            dentist_confirmed_at: '2026-05-07T13:05:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({
        appointments: [
          {
            id: 'appointment-stale',
            order_id: 'BP-DEMO-STALE',
            type: 'initial',
            status: 'scheduled',
            scheduled_at: '2026-05-07T14:00:00.000Z',
            user_confirmed_at: '2026-05-07T15:00:00.000Z',
            dentist_confirmed_at: '2026-05-07T15:05:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ forms: [] })
      .mockResolvedValueOnce({ forms: [] })
      .mockResolvedValueOnce(licensedDentistWorkflow());

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistLicensed',
      backendUser: { email: 'dentista.licenciada@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-queue-table')).toBeInTheDocument());
    const confirmationRow = screen.getByText('BP-DEMO-CHECK').closest('tr');
    const clinicalRow = screen.getByText('BP-DEMO-CLINICAL').closest('tr');
    const staleRow = screen.getByText('BP-DEMO-STALE').closest('tr');

    if (!confirmationRow || !clinicalRow || !staleRow) {
      throw new Error('Expected all licensed dentist scenario rows to render.');
    }

    expect(confirmationRow).toHaveTextContent(/aguardando confirmação de consulta/i);
    expect(within(confirmationRow).getByRole('button', { name: /confirmar consulta realizada/i })).toBeInTheDocument();
    expect(within(confirmationRow).queryByRole('button', { name: /registrar apto/i })).not.toBeInTheDocument();

    expect(clinicalRow).toHaveTextContent(/aguardando decisão clínica/i);
    expect(within(clinicalRow).getByRole('button', { name: /complementar pre-consulta/i })).toBeInTheDocument();
    expect(within(clinicalRow).queryByRole('button', { name: /registrar apto/i })).not.toBeInTheDocument();
    expect(within(clinicalRow).queryByRole('button', { name: /registrar inapto/i })).not.toBeInTheDocument();
    expect(within(clinicalRow).queryByRole('button', { name: /marcar tratamento pr/i })).not.toBeInTheDocument();
    expect(within(clinicalRow).queryByRole('button', { name: /confirmar consulta realizada/i })).not.toBeInTheDocument();

    expect(within(staleRow).getByRole('button', { name: /complementar pre-consulta/i })).toBeInTheDocument();
    expect(within(staleRow).queryByRole('button', { name: /confirmar consulta realizada/i })).not.toBeInTheDocument();
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

      if (path === '/v1/orders?as=dentist') {
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

      if (path === '/v1/account/biteplaner/dentist-licensing') {
        return Promise.resolve(licensedDentistWorkflow());
      }

      return Promise.resolve({});
    });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistLicensed',
      backendUser: { email: 'dentista2@gmail.com', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByTestId('dentist-queue-table')).toBeInTheDocument());
    const row = screen.getByText('BP-DEMO-INELIGIBLE').closest('tr');

    if (!row) {
      throw new Error('Expected ineligible dentist row to render.');
    }

    expect(row).toHaveTextContent(/inaptidão/i);
    expect(row).not.toHaveTextContent(/nova consulta disponível/i);
    expect(row).toHaveTextContent(/consulta inicial/i);
    expect(within(row).queryByTestId('dentist-order-action-open-pre-consultation-review')).not.toBeInTheDocument();
    expect(within(row).queryByTestId('dentist-order-action-confirm-appointment')).not.toBeInTheDocument();
    expect(row).toHaveTextContent('-');

    fireEvent.click(screen.getByRole('button', { name: /visualizar atualizacoes da ordem bp-demo-ineligible/i }));
    const timelineDialog = await screen.findByRole('dialog', { name: /atualizacoes da ordem/i });
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
      .mockResolvedValueOnce({ orders: [] })
      .mockResolvedValueOnce({
        workflow: {
          id: 'workflow-approved',
          status: 'approved_pending_payment',
          paymentStatus: 'not_started',
          testAttempts: 0,
          testPassed: false,
          certificateIssuedAt: null,
          metadata: { courseProgress: {} },
        },
        course: [],
        notifications: [],
      });

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
  });

  it('renders the dentist workspace hero without the e-mail block', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({ orders: [] })
      .mockResolvedValueOnce({
        workflow: {
          id: 'workflow-approved',
          status: 'approved_pending_payment',
          paymentStatus: 'not_started',
          testAttempts: 0,
          testPassed: false,
          certificateIssuedAt: null,
          metadata: { courseProgress: {} },
        },
        course: [],
        notifications: [],
      });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistApproved',
      backendUser: { email: 'dentista.aprovada@nexor.dev', roles: ['dentist'] },
    });

    expect(await screen.findByText(/workspace do dentista/i)).toBeInTheDocument();
    expect(screen.getByTestId('dentist-hero-visual')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('dentist-status-dot')).toHaveAttribute('data-tone', 'success'));
    const statusLabel = screen.getByText(/status licenciamento/i);
    const statusValue = statusLabel.parentElement?.querySelector('strong');

    expect(screen.queryByText('E-mail')).not.toBeInTheDocument();
    expect(screen.queryByText('dentista.aprovada@nexor.dev')).not.toBeInTheDocument();
    if (!statusValue) {
      throw new Error('Expected dentist status value in workspace hero.');
    }
    expect(statusValue).toHaveTextContent(/licenciado/i);
    expect(statusLabel.parentElement).toContainElement(statusValue);
  });

  it('renders the laboratory workspace hero with licensing status', async () => {
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
    const statusLabel = screen.getByText(/status licenciamento/i);
    const statusValue = statusLabel.parentElement?.querySelector('strong');

    expect(screen.queryByText('E-mail')).not.toBeInTheDocument();
    expect(screen.queryByText('lab@nexor.dev')).not.toBeInTheDocument();
    if (!statusValue) {
      throw new Error('Expected laboratory status value in workspace hero.');
    }
    expect(statusValue).toHaveTextContent(/sem processo de licenciamento/i);
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
  it('keeps the dentist home in skeleton state until licensing and orders finish loading', async () => {
    const licensingRequest = deferred<ReturnType<typeof licensedDentistWorkflow>>();
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({ orders: [] })
      .mockImplementationOnce(() => licensingRequest.promise);

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentistLicensed',
      backendUser: { email: 'dentista.licenciada@nexor.dev', roles: ['dentist'] },
    });

    expect(await screen.findByLabelText(/carregando painel do dentista/i)).toBeInTheDocument();
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(3));
    expect(screen.queryByText(/conteúdo liberado apenas para dentistas licenciados/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('dentist-queue-table')).not.toBeInTheDocument();

    licensingRequest.resolve(licensedDentistWorkflow());

    await waitFor(() => expect(screen.queryByLabelText(/carregando painel do dentista/i)).not.toBeInTheDocument());
    expect(screen.getByTestId('dentist-queue-table')).toBeInTheDocument();
    expect(screen.queryByText(/conteúdo liberado apenas para dentistas licenciados/i)).not.toBeInTheDocument();
  });

  it('uses a neutral dentist status marker when there is no licensing process', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({ orders: [] })
      .mockResolvedValueOnce({
        workflow: null,
        course: [],
        notifications: [],
      });

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    expect(await screen.findByText(/sem processo de licenciamento/i)).toBeInTheDocument();
    expect(screen.getByTestId('dentist-status-dot')).toHaveAttribute('data-tone', 'neutral');
  });

  it('shows the licensed state immediately after Nexor approves the dentist', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({ orders: [] })
      .mockResolvedValueOnce({
        workflow: {
          id: 'workflow-1',
          status: 'approved_pending_payment',
          paymentStatus: 'not_started',
          testAttempts: 0,
          testPassed: false,
          certificateIssuedAt: null,
          metadata: { courseProgress: {} },
        },
        course: [
          {
            id: 'fundamentos',
            title: 'Fundamentos clínicos do Biteplaner',
            videoTitle: 'Vídeo 1',
            documentTitle: 'Protocolo clínico',
          },
          {
            id: 'operacao',
            title: 'Fluxo operacional e documentação',
            videoTitle: 'Vídeo 2',
            documentTitle: 'Checklist operacional',
          },
          {
            id: 'qualidade',
            title: 'Acompanhamento, qualidade e boas práticas',
            videoTitle: 'Vídeo 3',
            documentTitle: 'Guia de acompanhamento',
          },
        ],
        notifications: [
          {
            id: 'notification-1',
            title: 'Cadastro aprovado',
            message: 'Seu cadastro foi aprovado pela Nexor.',
            read: false,
          },
        ],
      });
    mockApiPatch.mockResolvedValueOnce({
      notification: {
        id: 'notification-1',
        title: 'Cadastro aprovado',
        message: 'Seu cadastro foi aprovado pela Nexor.',
        read: true,
      },
    });

    renderPage('/painel/biteplaner/licenciamento?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    expect(await screen.findByRole('dialog', { name: /cadastro aprovado/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /entendi/i }));
    await waitFor(() =>
      expect(mockApiPatch).toHaveBeenCalledWith('/v1/account/notifications/notification-1/read', {}, 'tok')
    );

    expect(screen.getByText(/licenciamento biteplaner/i)).toBeInTheDocument();
    expect(screen.getByText(/status licenciamento/i)).toBeInTheDocument();
    expect(screen.getAllByText(/licenciado/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/licenciamento concluído/i)).toBeInTheDocument();
    expect(screen.queryByText(/^pagamento$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fundamentos clínicos do biteplaner/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/curso de licenciamento/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /cliente/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /dentista/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('dentist-queue-table')).not.toBeInTheDocument();
  });

  it('does not reopen the licensing approval modal after the approval notification was read', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({ orders: [] })
      .mockResolvedValueOnce({
        workflow: {
          id: 'workflow-1',
          status: 'licensed',
          paymentStatus: 'not_started',
          testAttempts: 0,
          testPassed: false,
          certificateIssuedAt: null,
          metadata: { courseProgress: {} },
        },
        course: [],
        notifications: [
          {
            id: 'notification-1',
            title: 'Cadastro aprovado',
            message: 'Seu cadastro foi aprovado pela Nexor.',
            read: true,
          },
        ],
      });

    renderPage('/painel/biteplaner/licenciamento?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() => expect(screen.getByText(/licenciamento biteplaner/i)).toBeInTheDocument());
    expect(screen.queryByRole('dialog', { name: /cadastro aprovado/i })).not.toBeInTheDocument();
    expect(mockApiPatch).not.toHaveBeenCalled();
  });

  it('shows the licensing course content after payment is confirmed', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({ orders: [] })
      .mockResolvedValueOnce({
        workflow: {
          id: 'workflow-progress',
          status: 'course_in_progress',
          paymentStatus: 'confirmed',
          testAttempts: 1,
          testPassed: false,
          certificateIssuedAt: null,
          metadata: { courseProgress: { fundamentos: true } },
        },
        course: [
          {
            id: 'fundamentos',
            title: 'Fundamentos clínicos do Biteplaner',
            videoTitle: 'Vídeo 1',
            documentTitle: 'Protocolo clínico',
          },
          {
            id: 'operacao',
            title: 'Fluxo operacional e documentação',
            videoTitle: 'Vídeo 2',
            documentTitle: 'Checklist operacional',
          },
        ],
        notifications: [],
      });

    renderPage('/painel/biteplaner/licenciamento?mode=dentist', {
      demoPersona: 'dentistProgress',
      backendUser: { email: 'dentista.progresso@nexor.dev', roles: ['dentist'] },
    });

    expect((await screen.findAllByText(/curso de licenciamento/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/fundamentos clínicos do biteplaner/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/neste modulo, o dentista revisa os fundamentos clínicos/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /baixar pdf/i })).toHaveAttribute('download', 'fundamentos-biteplaner.pdf');
    expect(screen.getByRole('button', { name: /vídeo 2 fluxo operacional e documentação/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /vídeo 2 fluxo operacional e documentação/i }));
    expect(screen.getAllByText(/fluxo operacional e documentação/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/checklist operacional/i)).toBeInTheDocument();
    expect(screen.getByText(/este modulo organiza o fluxo operacional/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /baixar pdf/i })).toHaveAttribute('download', 'operacao-biteplaner.pdf');
    expect(screen.queryByRole('button', { name: /confirmar pagamento/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /fazer teste/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /cliente/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /dentista/i })).not.toBeInTheDocument();
  });

  it('shows only the certificate download when the dentist is already licensed', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        productKey: 'biteplaner',
        defaultMode: 'dentist',
        enrollment: null,
        modes: [{ key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null }],
      })
      .mockResolvedValueOnce({ orders: [] })
      .mockResolvedValueOnce({
        ...licensedDentistWorkflow(),
      });

    renderPage('/painel/biteplaner/licenciamento?mode=dentist', {
      demoPersona: 'dentistLicensed',
      backendUser: { email: 'dentista.licenciada@nexor.dev', roles: ['dentist'] },
    });

    expect(await screen.findByText(/licenciamento concluído/i)).toBeInTheDocument();
    expect(screen.getByText(/parabens! seu licenciamento biteplaner foi concluído com sucesso/i)).toBeInTheDocument();
    expect(screen.getByTestId('dentist-status-dot')).toHaveAttribute('data-tone', 'success');
    expect(screen.getAllByText(/licenciado/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /baixar certificado/i })).toHaveAttribute(
      'download',
      'certificado-biteplaner.txt'
    );
    expect(screen.queryByRole('button', { name: /confirmar pagamento/i })).not.toBeInTheDocument();
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
      .mockResolvedValueOnce(licensedDentistWorkflow());

    renderPage('/painel/biteplaner?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /abrir solicitação de produção da ordem bp-demo-204/i })).toBeInTheDocument()
    );
    expect(screen.queryByRole('button', { name: /encaminhar ao laboratório a ordem bp-demo-204/i })).not.toBeInTheDocument();
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
            customer: { full_name: 'Marina Demo', email: 'marina@nexor.dev', phone: null },
            dentist: { full_name: 'Dra. Ana Demo', email: 'ana@nexor.dev' },
            productionRequestDraft: {
              anamnesisSummary: 'Paciente apta para Biteplaner esportivo.',
              anamnesisDownloaded: true,
              productionRequestSummary: 'Protetor superior personalizado para alto impacto.',
              labNotes: 'Priorizar acabamento vestibular e conferir adaptação posterior.',
              scan3dFileName: 'marina-demo-arcada-superior.stl',
              prescriptionFileName: 'prescricao-marina-demo.pdf',
              lgpdConfirmed: true,
              selectedLabId: 'lab-demo-001',
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
              prescriptionFileName: 'prescricao-marina-demo.pdf',
              lgpdConfirmed: true,
              selectedLabId: 'lab-demo-001',
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
    expect(within(labQueueTable).getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(within(labQueueTable).getByRole('columnheader', { name: /dentista/i })).toBeInTheDocument();
    expect(within(labQueueTable).getByText(/dra\. ana demo/i)).toBeInTheDocument();
    expect(screen.getAllByText(/aguardando aceite do laboratório/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /verificar documentação da ordem bp-demo-005/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /verificar documentação da ordem bp-demo-005/i }));
    expect(await screen.findByRole('dialog', { name: /formulário de solicitação de produção/i })).toBeInTheDocument();
    expect(screen.getByText(/protetor superior personalizado/i)).toBeInTheDocument();
    const documentationDialog = screen.getByRole('dialog', { name: /formulário de solicitação de produção/i });
    const dialogText = documentationDialog.textContent ?? '';
    expect(within(documentationDialog).getByText(/dra\. ana demo/i)).toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/resumo da anamnese/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/paciente apta para biteplaner esportivo/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/lgpd e retenção/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/laboratório selecionado/i)).not.toBeInTheDocument();
    expect(dialogText.indexOf('Prescrição')).toBeGreaterThan(dialogText.indexOf('Escaneamento 3D'));
    const scanDownload = within(documentationDialog).getByRole('link', {
      name: /baixar escaneamento 3d marina-demo-arcada-superior\.stl/i
    });
    const prescriptionDownload = within(documentationDialog).getByRole('link', {
      name: /baixar prescrição prescricao-marina-demo\.pdf/i
    });
    expect(scanDownload).toHaveAttribute('download', 'marina-demo-arcada-superior.stl');
    expect(scanDownload).toHaveAttribute('href', expect.stringContaining('marina-demo-arcada-superior.stl'));
    expect(prescriptionDownload).toHaveAttribute('download', 'prescricao-marina-demo.pdf');
    expect(prescriptionDownload).toHaveAttribute('href', expect.stringContaining('prescricao-marina-demo.pdf'));
    expect(within(documentationDialog).getAllByText(/baixar arquivo/i)).toHaveLength(2);
    expect(within(documentationDialog).getAllByText(/tamanho não informado/i)).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: /fechar documentação/i }));

    await waitFor(() => expect(screen.getByTestId('lab-order-action-start')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('lab-order-action-start'));
    expect(await screen.findByRole('dialog', { name: /confirmar ação da ordem/i })).toBeInTheDocument();
    expect(screen.getByText(/deseja aprovar a ordem bp-demo-005 e iniciar a produ/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith('/v1/orders/BP-DEMO-005/lab-production-started', {}, 'tok')
    );
    expect(screen.getAllByText(/em produ/i).length).toBeGreaterThan(0);

    await waitFor(() => expect(screen.getByTestId('lab-order-action-complete')).toBeInTheDocument());
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
      if (path === '/v1/account/biteplaner/access') {
        return Promise.resolve({
          productKey: 'biteplaner',
          defaultMode: 'lab',
          enrollment: null,
          modes: [{ key: 'lab', label: 'Laboratório', description: '', allowed: true, highlighted: true, reason: null }],
        });
      }

      if (path === '/v1/orders?as=lab') {
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
              id: 'ext_scan_123',
              fileName: 'scan-real.stl',
              provider: 'simulated-external-storage',
              mimeType: 'model/stl',
              sizeBytes: 123456,
              uploadedAt: '2026-06-03T12:55:00.000Z',
            },
            prescriptionFileName: '',
            prescriptionFileRef: {
              id: 'ext_rx_456',
              fileName: 'prescricao-real.pdf',
              provider: 'simulated-external-storage',
              mimeType: 'application/pdf',
              sizeBytes: 654321,
              uploadedAt: '2026-06-03T12:56:00.000Z',
            },
            lgpdConfirmed: true,
            selectedLabId: 'profile-lab-edu',
          },
        });
      }

      return Promise.reject(new Error(`Unhandled GET ${path}`));
    });

    renderPage('/painel/biteplaner?mode=lab', {
      demoPersona: 'lab',
      backendUser: { email: 'eduardoshoitifujiwara123@gmail.com', roles: ['lab'] },
    });

    await waitFor(() => expect(screen.getByTestId('lab-queue-table')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /verificar documentação da ordem bp-demo-088/i }));

    const documentationDialog = await screen.findByRole('dialog', { name: /formulário de solicitação de produção/i });
    expect(within(documentationDialog).getByText(/dr\. eduardo fujiwara/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/eduardoshoitifujiwara@gmail\.com/i)).toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/resumo clínico validado para produção/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/resumo da anamnese/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/lgpd e retenção/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/laboratório selecionado/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).getByText(/solicitação de produção enviada ao laboratório/i)).toBeInTheDocument();
    const scanDownload = within(documentationDialog).getByRole('link', { name: /baixar escaneamento 3d scan-real\.stl/i });
    const prescriptionDownload = within(documentationDialog).getByRole('link', { name: /baixar prescrição prescricao-real\.pdf/i });
    expect(scanDownload).toHaveTextContent(/baixar arquivo/i);
    expect(prescriptionDownload).toHaveTextContent(/baixar arquivo/i);
    expect(within(documentationDialog).getByText(/tamanho: 120,6 kb/i)).toBeInTheDocument();
    expect(within(documentationDialog).getByText(/tamanho: 639 kb/i)).toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/scan-real\.stl/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/prescricao-real\.pdf/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/id externo/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/serviço/i)).not.toBeInTheDocument();
    expect(within(documentationDialog).queryByText(/^tipo:/i)).not.toBeInTheDocument();
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
      .mockResolvedValueOnce(licensedDentistWorkflow())
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
      .mockResolvedValueOnce(licensedDentistWorkflow())
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
      .mockResolvedValueOnce(licensedDentistWorkflow())
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

    await waitFor(() => expect(screen.getByTestId('lab-order-action-return')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('lab-order-action-return'));

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

      if (path === '/v1/orders?as=dentist') {
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
                prescriptionFileName: 'prescricao.pdf',
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

      if (path === '/v1/account/biteplaner/dentist-licensing') {
        return Promise.resolve(licensedDentistWorkflow());
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
    expect(within(dialog).getByText(/escaneamento 3d incompleto/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/solicitação de produção com ajuste pendente/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/laboratório do edu/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/\(11\) 1111-1111/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/eduardoshoitifujiwara123@gmail\.com/i)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /abrir solicitação de produção/i })).toBeInTheDocument();
  });
});
