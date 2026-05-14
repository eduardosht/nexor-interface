import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPost } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    post: mockApiPost,
  },
}));

import { BiteplanerHub } from './index';

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
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
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
    expect(screen.getAllByText(/leads captados/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /abrir indicar/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/indicar?mode=partner'
    );
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
      .mockResolvedValueOnce({ orders: [] })
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
      .mockResolvedValueOnce({ orders: [] })
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
      .mockResolvedValueOnce({ orders: [] })
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

  it('shows the athlete primary status and next CTA', async () => {
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
      .mockResolvedValueOnce({ events: [] });

    renderPage('/painel/biteplaner?mode=user');

    await waitFor(() => expect(screen.getByTestId('athlete-order-status')).toBeInTheDocument());
    expect(screen.getByTestId('athlete-order-status')).toHaveTextContent(/pre-requisito pendente/i);
    expect(screen.getByRole('link', { name: /continuar fluxo/i })).toHaveAttribute('href', '/painel/pre-requisito');
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
            created_at: '2026-05-01T11:00:00.000Z',
            customer: { full_name: 'Marina Demo', email: 'marina@nexor.dev', phone: null },
          },
          {
            id: 'BP-DEMO-203',
            status: 'appointment_confirmed',
            statusLabel: 'Consulta confirmada',
            stage: 'consultation_confirmed',
            created_at: '2026-05-01T12:00:00.000Z',
            customer: { full_name: 'Carlos Demo', email: 'carlos@nexor.dev', phone: null },
          },
          {
            id: 'BP-DEMO-204',
            status: 'awaiting_dentist_forms',
            statusLabel: 'Aguardando preenchimento dentista',
            stage: 'awaiting_dentist_forms',
            created_at: '2026-05-01T13:00:00.000Z',
            customer: { full_name: 'Ana Demo', email: 'ana@nexor.dev', phone: null },
          },
          {
            id: 'BP-DEMO-205',
            status: 'awaiting_payment',
            statusLabel: 'Aguardando pagamento',
            stage: 'awaiting_payment',
            created_at: '2026-05-01T14:00:00.000Z',
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
        events: [
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
    expect(screen.getAllByText(/aguardando aceite do dentista/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /visualizar atualizacoes da ordem bp-demo-201/i }));
    expect(await screen.findByRole('dialog', { name: /atualizacoes da ordem/i })).toBeInTheDocument();
    expect(screen.getByText(/historico resumido da jornada operacional/i)).toBeInTheDocument();
    expect(screen.getByText(/evento 1/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /fechar modal das atualizacoes/i }));
    fireEvent.click(screen.getByRole('button', { name: /aceitar consulta agendada da ordem bp-demo-201/i }));
    expect(await screen.findByRole('dialog', { name: /confirmar ação da ordem/i })).toBeInTheDocument();
    expect(screen.getByText(/desejá aceitar a consulta agendada da ordem bp-demo-201/i)).toBeInTheDocument();
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
            statusLabel: 'Consulta vinculada',
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

  it('locks the dentist home tab when the dentist is not licensed yet', async () => {
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

    expect(await screen.findByRole('status')).toHaveTextContent(
      /conteúdo liberado apenas para dentistas licenciados/i
    );
    await waitFor(() => expect(screen.getByTestId('dentist-status-dot')).toHaveAttribute('data-tone', 'warning'));
    expect(screen.getByRole('link', { name: /ir para licenciamento/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/licenciamento?mode=dentist'
    );
    expect(screen.queryByTestId('dentist-queue-table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirmar pagamento/i })).not.toBeInTheDocument();
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

  it('shows only the payment step after Nexor approves the dentist', async () => {
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
      })
      .mockResolvedValueOnce({
        workflow: {
          id: 'workflow-1',
          status: 'payment_confirmed_pending_intention_contract',
          paymentStatus: 'confirmed',
          testAttempts: 0,
          testPassed: false,
          certificateIssuedAt: null,
          metadata: { courseProgress: {} },
        },
        course: [],
        notifications: [],
      });
    mockApiPost.mockResolvedValueOnce({
      workflow: {
        id: 'workflow-1',
        status: 'payment_confirmed_pending_intention_contract',
      },
    });

    renderPage('/painel/biteplaner/licenciamento?mode=dentist', {
      demoPersona: 'dentist',
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    expect(await screen.findByRole('dialog', { name: /cadastro aprovado/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /entendi/i }));

    expect(screen.getByText(/licenciamento biteplaner/i)).toBeInTheDocument();
    expect(screen.getByText(/status do dentista/i)).toBeInTheDocument();
    expect(screen.getAllByText(/aguardando pagamento/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^pagamento$/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/fundamentos clínicos do biteplaner/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/curso de licenciamento/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /cliente/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /dentista/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('dentist-queue-table')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirmar pagamento/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/biteplaner/dentist-licensing/payment-confirmed',
        {},
        'tok'
      )
    );
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
            statusLabel: 'Aguardando preenchimento dentista',
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
            statusLabel: 'Aguardando início da produção',
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
            statusLabel: 'Em processo - Laboratório',
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
    expect(screen.getAllByText(/aguardando início da produção/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /verificar documentação da ordem bp-demo-005/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /verificar documentação da ordem bp-demo-005/i }));
    expect(await screen.findByRole('dialog', { name: /formulário de solicitação de produção/i })).toBeInTheDocument();
    expect(screen.getByText(/paciente apta para biteplaner esportivo/i)).toBeInTheDocument();
    expect(screen.getByText(/protetor superior personalizado/i)).toBeInTheDocument();
    const documentationDialog = screen.getByRole('dialog', { name: /formulário de solicitação de produção/i });
    const dialogText = documentationDialog.textContent ?? '';
    expect(dialogText.indexOf('Escaneamento 3D')).toBeGreaterThan(dialogText.indexOf('Laboratório selecionado'));
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
    fireEvent.click(screen.getByRole('button', { name: /fechar documentação/i }));

    await waitFor(() => expect(screen.getByTestId('lab-order-action-start')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('lab-order-action-start'));
    expect(await screen.findByRole('dialog', { name: /confirmar ação da ordem/i })).toBeInTheDocument();
    expect(screen.getByText(/desejá iniciar formalmente a produção da ordem bp-demo-005/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith('/v1/orders/BP-DEMO-005/lab-production-started', {}, 'tok')
    );
    expect(screen.getAllByText(/em processo - laboratório/i).length).toBeGreaterThan(0);

    await waitFor(() => expect(screen.getByTestId('lab-order-action-complete')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('lab-order-action-complete'));
    expect(await screen.findByRole('dialog', { name: /confirmar ação da ordem/i })).toBeInTheDocument();
    expect(screen.getByText(/desejá concluir a etapa produtiva da ordem bp-demo-005/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith('/v1/orders/BP-DEMO-005/lab-production-completed', {}, 'tok')
    );
    expect(screen.getAllByText(/aguardando recebimento pelo dentista/i).length).toBeGreaterThan(0);
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
    expect(screen.getByText(/deseja confirmar que o produto da ordem bp-demo-017 chegou ao dentista/i)).toBeInTheDocument();
    fireEvent.click(within(receiptDialog).getByRole('button', { name: /^confirmar$/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith('/v1/orders/BP-DEMO-017/product-received', {}, 'tok')
    );
    expect(screen.getAllByText(/aguardando adaptação/i).length).toBeGreaterThan(0);
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
            statusLabel: 'Aguardando início da produção',
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
            status: 'awaiting_dentist_forms',
            statusLabel: 'Ajuste solicitado pelo laboratório',
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
    expect(screen.getByLabelText(/descricao do motivo/i)).toBeInTheDocument();
    const confirmButton = within(dialog).getByRole('button', { name: /confirmar/i });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/descricao do motivo/i), {
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
  });
});
