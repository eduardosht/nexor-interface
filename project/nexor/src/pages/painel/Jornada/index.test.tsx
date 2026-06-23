import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { createTestQueryClient, TestQueryClientProvider } from '../../../test/renderWithQueryClient';
import { biteplanerQueryKeys } from '../../../features/demo/biteplanerQueryKeys';

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

import { Jornada } from './index';

function CurrentPath() {
  const location = useLocation();

  return <span data-testid="current-path">{location.pathname}</span>;
}

function renderPage() {
  mockUseAuth.mockReturnValue({
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
  });

  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <TestQueryClientProvider>
          <CurrentPath />
          <Jornada />
        </TestQueryClientProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

function renderPageWithQueryClient(queryClient: ReturnType<typeof createTestQueryClient>) {
  mockUseAuth.mockReturnValue({
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
  });

  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <QueryClientProvider client={queryClient}>
          <CurrentPath />
          <Jornada />
        </QueryClientProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

function expectNoEmbeddedStepContent() {
  expect(screen.queryByTestId('journey-step-forms-prerequisite')).not.toBeInTheDocument();
  expect(screen.queryByTestId('journey-step-forms-clinical_decision')).not.toBeInTheDocument();
  expect(screen.queryByTestId('journey-step-forms-follow_up')).not.toBeInTheDocument();
  expect(screen.queryByTestId('journey-consultation-content')).not.toBeInTheDocument();
  expect(screen.queryByTestId('journey-purchase-content')).not.toBeInTheDocument();
  expect(screen.queryByTestId('workflow-forms-panel')).not.toBeInTheDocument();
}

describe('Jornada', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiGet.mockImplementation((path: string) => {
      if (path.includes('/clinical-follow-ups')) {
        return Promise.resolve({ followUps: [] });
      }

      if (path.includes('/workflow-forms')) {
        return Promise.resolve({ forms: [] });
      }

      return Promise.resolve({ appointments: [] });
    });
    mockApiPost.mockReset();
  });

  it('shows post-completed clinical follow-up cards and schedules the available return', async () => {
    const completedOrder = {
      id: 'BP-DEMO-009',
      status: 'completed',
      statusLabel: 'Finalizado',
      stage: 'completed',
      created_at: '2026-05-03T14:00:00.000Z',
      practice_location_id: 'practice-demo-001',
      customer: { full_name: 'Joao Demo', email: 'atleta.demo@nexor.dev', phone: null },
      practice_location: { id: 'practice-demo-001', name: 'Clínica Esportiva Nexor' },
    };

    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=user') {
        return Promise.resolve({ orders: [completedOrder] });
      }

      if (path === '/v1/orders/BP-DEMO-009/workflow-forms') {
        return Promise.resolve({ forms: [] });
      }

      if (path === '/v1/orders/BP-DEMO-009/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      if (path === '/v1/orders/BP-DEMO-009/clinical-follow-ups') {
        return Promise.resolve({
          followUps: [
            {
              kind: 'return_15_days',
              sequence: 1,
              title: 'Check-up de 15 dias',
              description: 'Avaliação da adaptação, conforto e primeiros resultados do dispositivo.',
              status: 'available',
              availableAt: '2026-05-18T14:00:00.000Z',
              scheduledAt: null,
              appointmentId: null,
              lockedReason: null,
            },
            {
              kind: 'return_30_days',
              sequence: 2,
              title: 'Check-up de 30 dias',
              description: 'Avaliação final do período inicial de adaptação e ajustes necessários.',
              status: 'locked',
              availableAt: '2026-06-02T14:00:00.000Z',
              scheduledAt: null,
              appointmentId: null,
              lockedReason: 'Este retorno será liberado após a conclusão do Retorno 01.',
            },
          ],
        });
      }

      return Promise.resolve({});
    });
    mockApiPost.mockResolvedValue({ order: completedOrder });

    renderPage();

    await waitFor(() =>
      expect(mockApiGet).toHaveBeenCalledWith('/v1/orders/BP-DEMO-009/clinical-follow-ups', 'tok')
    );
    const section = await screen.findByTestId('clinical-follow-up-cards', undefined, { timeout: 3000 });
    const actionCardTitle = screen.getByRole('heading', { level: 2, name: /o que fazer agora\?/i });
    const overviewTitle = screen.getByRole('heading', { level: 2, name: /vis.o geral da jornada/i });
    expect(section).toHaveTextContent('Acompanhamento Clínico');
    expect(section).toHaveTextContent('Check-up de 15 dias');
    expect(section).toHaveTextContent('Check-up de 30 dias');
    expect(section).toHaveTextContent('Bloqueado');
    expect(section.compareDocumentPosition(actionCardTitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(section.compareDocumentPosition(overviewTitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const adaptationStep = screen.getByTestId('journey-step-follow_up');
    const checkupsStep = screen.getByTestId('journey-step-checkups');
    const checkup15 = screen.getByTestId('journey-checkup-return_15_days');
    const checkup30 = screen.getByTestId('journey-checkup-return_30_days');
    expect(adaptationStep.compareDocumentPosition(checkupsStep) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(checkupsStep.compareDocumentPosition(checkup15) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(checkup15.compareDocumentPosition(checkup30) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByTestId('journey-step-checkups')).toHaveTextContent(/atual/i);
    expect(checkup15).toHaveTextContent(/atual/i);
    expect(checkup30).toHaveTextContent(/pendente/i);

    fireEvent.click(within(section).getByRole('button', { name: /agendar retorno/i }));

    await waitFor(() => expect(mockApiPost).toHaveBeenCalledWith(
      '/v1/orders/BP-DEMO-009/clinical-follow-ups/return_15_days/schedule',
      { practiceLocationId: 'practice-demo-001' },
      'tok'
    ));
  });

  it('renders completed return as inactive and pending return with warning badge', async () => {
    const completedOrder = {
      id: 'BP-DEMO-010',
      status: 'completed',
      statusLabel: 'Finalizado',
      stage: 'completed',
      created_at: '2026-05-03T14:00:00.000Z',
      practice_location_id: 'practice-demo-001',
      customer: { full_name: 'Cliente 3', email: 'cliente3@gmail.com', phone: null },
      practice_location: { id: 'practice-demo-001', name: 'Clínica Esportiva Nexor' },
    };

    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=user') {
        return Promise.resolve({ orders: [completedOrder] });
      }

      if (path === '/v1/orders/BP-DEMO-010/workflow-forms') {
        return Promise.resolve({ forms: [] });
      }

      if (path === '/v1/orders/BP-DEMO-010/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      if (path === '/v1/orders/BP-DEMO-010/clinical-follow-ups') {
        return Promise.resolve({
          followUps: [
            {
              kind: 'return_15_days',
              sequence: 1,
              title: 'Check-up de 15 dias',
              description: 'Avaliação da adaptação, conforto e primeiros resultados do dispositivo.',
              status: 'completed',
              availableAt: '2026-05-18T14:00:00.000Z',
              scheduledAt: '2026-05-21T10:00:00.000Z',
              appointmentId: 'appointment-return-01',
              lockedReason: null,
            },
            {
              kind: 'return_30_days',
              sequence: 2,
              title: 'Check-up de 30 dias',
              description: 'Avaliação final do período inicial de adaptação e ajustes necessários.',
              status: 'overdue',
              availableAt: '2026-06-20T14:00:00.000Z',
              scheduledAt: null,
              appointmentId: null,
              lockedReason: null,
            },
          ],
        });
      }

      return Promise.resolve({});
    });

    renderPage();

    const section = await screen.findByTestId('clinical-follow-up-cards', undefined, { timeout: 3000 });
    const return01 = within(section).getByTestId('clinical-follow-up-return_15_days');
    const return02Badge = within(section).getByTestId('clinical-follow-up-status-return_30_days');
    const scheduleButton = within(section).getByRole('button', { name: /agendar retorno/i });

    expect(return01).toHaveAttribute('aria-disabled', 'true');
    expect(return01).toHaveTextContent('Concluído');
    expect(return02Badge).toHaveTextContent('Pendente');
    expect(getComputedStyle(return02Badge).color).toBe('rgb(146, 64, 14)');
    expect(getComputedStyle(return02Badge).color).not.toBe('rgb(4, 120, 87)');
    expect(scheduleButton.querySelector('svg')).not.toBeInTheDocument();
  });
  it('does not refetch journey data when only the auth token changes', async () => {
    const queryClient = createTestQueryClient();
    let accessToken = 'tok';
    mockUseAuth.mockImplementation(() => ({
      loading: false,
      session: { access_token: accessToken, user: { id: '1', email: 'demo@nexor.dev' } },
      backendUser: { id: 'athlete-user-1', email: 'demo@nexor.dev', roles: ['customer'] },
      backendUserResolved: true,
      hasConfiguredAuth: true,
      isMockMode: true,
      demoPersona: 'athlete',
      signIn: vi.fn(),
      signInDemo: vi.fn(),
      signOut: vi.fn(),
      sendPasswordReset: vi.fn(),
      refreshBackendUser: vi.fn(),
    }));
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=user') {
        return Promise.resolve({
          orders: [
            {
              id: 'BP-DEMO-006',
              status: 'follow_up',
              statusLabel: 'Em acompanhamento',
              stage: 'follow_up',
              created_at: '2026-05-03T10:00:00.000Z',
              customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-006/workflow-forms') {
        return Promise.resolve({ forms: [] });
      }

      if (path === '/v1/orders/BP-DEMO-006/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      return Promise.resolve({});
    });

    const view = renderPageWithQueryClient(queryClient);

    await waitFor(() => expect(screen.getByTestId('athlete-journey-steps')).toBeInTheDocument());
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(3));

    accessToken = 'tok-refreshed';
    view.rerender(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <QueryClientProvider client={queryClient}>
            <CurrentPath />
            <Jornada />
          </QueryClientProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('athlete-journey-steps')).toBeInTheDocument());
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(3));
  });

  it('keeps auxiliary query errors hidden when the loaded order can render the journey', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=user') {
        return Promise.resolve({
          orders: [
            {
              id: 'BP-DEMO-022',
              status: 'awaiting_dentist_acceptance',
              statusLabel: 'Aguardando aceite do dentista',
              stage: 'dentist_acceptance_pending',
              created_at: '2026-05-01T10:00:00.000Z',
              customer: { full_name: 'Cliente indicado', email: 'cliente@nexor.dev', phone: null },
              practice_location: { id: 'practice-demo-001', name: 'Clínica Esportiva Nexor' },
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-022/workflow-forms') {
        return Promise.reject(new Error('workflow forms unavailable'));
      }

      if (path === '/v1/orders/BP-DEMO-022/appointments') {
        return Promise.reject(new Error('appointments unavailable'));
      }

      return Promise.resolve({});
    });

    renderPage();

    expect(await screen.findByTestId('athlete-journey-steps')).toBeInTheDocument();
    expect(screen.queryByText(/não foi possível carregar a jornada compartilhada agora/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/não foi possível carregar os formulários desta ordem/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/não foi possível carregar a consulta agendada desta ordem/i)).not.toBeInTheDocument();
  });

  it('refetches the customer order on mount when cached order data does not include the selected clinic yet', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(biteplanerQueryKeys.orders('user', '1'), {
      orders: [
        {
          id: 'BP-DEMO-024',
          status: 'awaiting_scheduling',
          statusLabel: 'Aguardando consulta inicial',
          stage: 'awaiting_initial_consultation',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'Cliente indicado', email: 'cliente@nexor.dev', phone: null },
          practice_location: null,
        },
      ],
    });

    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=user') {
        return Promise.resolve({
          orders: [
            {
              id: 'BP-DEMO-024',
              status: 'awaiting_dentist_acceptance',
              statusLabel: 'Aguardando aceite do dentista',
              stage: 'dentist_acceptance_pending',
              created_at: '2026-05-01T10:00:00.000Z',
              customer: { full_name: 'Cliente indicado', email: 'cliente@nexor.dev', phone: null },
              dentist: { id: 'dentist-demo-001', full_name: 'Dra. Ana Silva', email: null },
              practice_location: {
                id: 'practice-demo-001',
                name: 'Clínica Esportiva Nexor',
                address: {
                  street: 'Rua das Palmeiras',
                  number: '120',
                  district: 'Jardins',
                  city: 'São Paulo',
                  state: 'SP',
                  zip_code: '01415-000',
                },
              },
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-024/workflow-forms') {
        return Promise.resolve({ forms: [] });
      }

      if (path === '/v1/orders/BP-DEMO-024/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      return Promise.resolve({});
    });

    renderPageWithQueryClient(queryClient);

    const selectedClinic = await screen.findByTestId('journey-selected-clinic');
    expect(mockApiGet).toHaveBeenCalledWith('/v1/orders?as=user', 'tok');
    expect(selectedClinic).toHaveTextContent(/clínica esportiva nexor/i);
    expect(selectedClinic).toHaveTextContent(/dra\. ana silva/i);
  });

  it('starts directly with the flat visual journey for the current athlete order', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-006',
            status: 'follow_up',
            statusLabel: 'Em acompanhamento',
            stage: 'follow_up',
            created_at: '2026-05-03T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({
        forms: [
          {
            id: 'BP-WF-001-INTAKE',
            orderId: 'BP-DEMO-001',
            templateKey: 'customer_pre_consultation_intake',
            stepKey: 'initial_consultation_preparation',
            status: 'pending',
            roleState: { customer: 'pending', dentist: 'locked' },
            customerSubmittedAt: null,
            dentistReviewStartedAt: null,
            dentistSubmittedAt: null,
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-01T10:05:00.000Z',
            submittedAt: null,
            payload: {},
          },
        ],
      });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-journey-steps')).toBeInTheDocument());
    expect(screen.getByRole('heading', { level: 1, name: /sua jornada biteplaner/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /bp-demo-006/i })).toBeInTheDocument();
    expect(screen.queryByTestId('athlete-order-card')).not.toBeInTheDocument();
    expectNoEmbeddedStepContent();
  });

  it('uses the provided journey card background and consolidates progress into the overview title', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-006',
            status: 'awaiting_dentist_acceptance',
            statusLabel: 'Aguardando aceite do dentista',
            stage: 'dentist_acceptance_pending',
            created_at: '2026-05-03T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] })
      .mockResolvedValueOnce({ appointments: [] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-journey-steps')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /continuar jornada/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /abrir jornada/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: /progresso da jornada/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /visão geral da jornada.*\d+% concluído/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /o que fazer agora\?/i })).toBeInTheDocument();
    expect(screen.getByText(/aguarde o aceite do dentista/i)).toBeInTheDocument();

    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/painel/Jornada/styles.ts'), 'utf8');
    expect(stylesSource).toContain('background-card-jornada.png');
  });

  it('shows an empty state instead of a blank page when the user has no Biteplaner order', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [] });

    renderPage();

    const emptyState = await screen.findByTestId('journey-empty-state');
    expect(emptyState).toHaveTextContent(/nenhuma jornada biteplaner encontrada/i);
    expect(emptyState).toHaveTextContent(/não encontramos pedido biteplaner ativo/i);
    expect(screen.queryByTestId('athlete-journey-steps')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /iniciar onboarding/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/onboarding'
    );
  });

  it('keeps new-user-onboarding orders on the registration step until the form is submitted', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-001',
            status: 'registration_started',
            statusLabel: 'Cadastro inicial pendente',
            stage: 'new_user_onboarding',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-journey-steps')).toBeInTheDocument());
    expect(screen.getByTestId('current-path')).not.toHaveTextContent('/painel/biteplaner/onboarding');
    expect(screen.getByTestId('journey-step-registration')).toHaveTextContent(/atual/i);
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/pendente/i);
    expect(screen.getByRole('link', { name: /iniciar cadastro/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/onboarding'
    );
  });

  it('keeps registration as current when onboarding is pending even if the backend stage says prerequisite', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=user') {
        return Promise.resolve({
          orders: [
            {
              id: 'BP-TESTE4-001',
              status: 'registration_started',
              statusLabel: 'Pre-requisito pendente',
              stage: 'pre_requisite_pending',
              created_at: '2026-05-01T10:00:00.000Z',
              customer: { full_name: 'tete4', email: 'tete4@nexor.dev', phone: null },
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-TESTE4-001/workflow-forms') {
        return Promise.resolve({
          forms: [
            {
              id: 'BP-WF-TESTE4-ONBOARDING',
              orderId: 'BP-TESTE4-001',
              templateKey: 'customer_new_user_onboarding',
              stepKey: 'new_user_onboarding',
              status: 'pending',
              roleState: { customer: 'pending', dentist: 'locked' },
              canViewPayload: true,
              summary: null,
              releasedAt: '2026-05-01T10:05:00.000Z',
              submittedAt: null,
              payload: {},
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-TESTE4-001/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      return Promise.resolve({});
    });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('journey-step-registration')).toHaveTextContent(/atual/i));
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/pendente/i);
    expect(screen.getByRole('link', { name: /iniciar cadastro/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/onboarding'
    );
  });

  it('keeps a submitted onboarding order in the prerequisite step even when the backend stage is still new-user onboarding', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=user') {
        return Promise.resolve({
          orders: [
            {
              id: 'BP-TESTE4-001',
              status: 'registration_started',
              statusLabel: 'Cadastro inicial pendente',
              stage: 'new_user_onboarding',
              created_at: '2026-05-01T10:00:00.000Z',
              customer: { full_name: 'teste4', email: 'teste4@nexor.dev', phone: null },
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-TESTE4-001/workflow-forms') {
        return Promise.resolve({
          forms: [
            {
              id: 'BP-WF-TESTE4-ONBOARDING',
              orderId: 'BP-TESTE4-001',
              templateKey: 'customer_new_user_onboarding',
              stepKey: 'new_user_onboarding',
              status: 'submitted',
              roleState: { customer: 'submitted', dentist: 'locked' },
              customerSubmittedAt: '2026-05-01T10:20:00.000Z',
              dentistReviewStartedAt: null,
              dentistSubmittedAt: null,
              canViewPayload: true,
              summary: null,
              releasedAt: '2026-05-01T10:05:00.000Z',
              submittedAt: '2026-05-01T10:20:00.000Z',
              payload: { fullName: 'teste4' },
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-TESTE4-001/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      return Promise.resolve({});
    });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-journey-steps')).toBeInTheDocument());
    expect(screen.getByTestId('current-path')).not.toHaveTextContent('/painel/biteplaner/onboarding');
    await waitFor(() => expect(screen.getByTestId('journey-step-registration')).toHaveTextContent(/conclu.do/i));
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/atual/i);
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /iniciar pr/i })).toHaveAttribute('href', '/painel/pre-requisito')
    );
  });

  it('does not redirect registration orders to onboarding while workflow forms are still loading', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=user') {
        return Promise.resolve({
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
        });
      }

      if (path === '/v1/orders/BP-DEMO-001/workflow-forms') {
        return new Promise(() => undefined);
      }

      if (path === '/v1/orders/BP-DEMO-001/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      return Promise.resolve({});
    });

    renderPage();

    await waitFor(() =>
      expect(mockApiGet).toHaveBeenCalledWith('/v1/orders/BP-DEMO-001/workflow-forms', 'tok')
    );
    expect(screen.getByTestId('current-path')).not.toHaveTextContent('/painel/biteplaner/onboarding');
    expect(screen.getByLabelText(/carregando jornada/i)).toBeInTheDocument();
  });

  it('keeps prerequisite forms out of the journey and links the current step to the prerequisite page', async () => {
    mockApiGet
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
        forms: [
          {
            id: 'BP-WF-001-INTAKE',
            orderId: 'BP-DEMO-001',
            templateKey: 'customer_pre_consultation_intake',
            stepKey: 'pre_requisite_pending',
            status: 'pending',
            roleState: { customer: 'pending', dentist: 'locked' },
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-01T10:05:00.000Z',
            submittedAt: null,
            payload: null,
          },
        ],
      });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/atual/i));
    expect(screen.getByRole('link', { name: /iniciar pré-requisito/i })).toHaveAttribute('href', '/painel/pre-requisito');
    expectNoEmbeddedStepContent();
  });

  it('advances to consultation when the prerequisite intake was already submitted', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-001',
            status: 'awaiting_scheduling',
            statusLabel: 'Aguardando consulta inicial',
            stage: 'awaiting_initial_consultation',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Eduardo Shoiti Fujiwara', email: 'eduardoshoitifujiwara@gmail.com', phone: null },
          },
        ],
      })
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

    renderPage();

    await waitFor(() => expect(screen.getByTestId('journey-step-consultation')).toHaveTextContent(/atual/i));
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/conclu.do/i);
    expect(screen.getByRole('link', { name: /abrir consulta inicial/i })).toHaveAttribute('href', '/painel/consulta-inicial');
    expectNoEmbeddedStepContent();
  });

  it('uses the journey only as tracking for the consultation step', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-002',
            status: 'awaiting_scheduling',
            statusLabel: 'Aguardando consulta inicial',
            stage: 'awaiting_initial_consultation',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
            practice_location: { id: 'practice-demo-001', name: 'Clinica Esportiva Nexor' },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('journey-step-consultation')).toHaveTextContent(/atual/i));
    expect(screen.getByRole('link', { name: /abrir consulta inicial/i })).toHaveAttribute('href', '/painel/consulta-inicial');
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/conclu.do/i);
    expectNoEmbeddedStepContent();
  });

  it('keeps the initial consultation step current while waiting for dentist acceptance', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-021',
            status: 'awaiting_dentist_acceptance',
            statusLabel: 'Aguardando aceite do dentista',
            stage: 'dentist_acceptance_pending',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Cliente indicado', email: 'cliente@nexor.dev', phone: null },
            dentist: { id: 'dentist-demo-001', full_name: 'Dra. Ana Silva', email: null },
            practice_location: {
              id: 'practice-demo-001',
              name: 'Clínica Esportiva Nexor',
              address: {
                street: 'Rua das Palmeiras',
                number: '120',
                district: 'Jardins',
                city: 'São Paulo',
                state: 'SP',
                zip_code: '01415-000',
              },
            },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('journey-step-consultation')).toHaveTextContent(/atual/i));
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/concluído/i);
    expect(screen.getByTestId('journey-step-clinical_decision')).toHaveTextContent(/pendente/i);
    const selectedClinic = screen.getByTestId('journey-selected-clinic');
    expect(selectedClinic).toHaveTextContent(/cl.nica selecionada/i);
    expect(selectedClinic).toHaveTextContent(/cl.nica esportiva nexor/i);
    expect(selectedClinic).toHaveTextContent(/dra\. ana silva/i);
    expect(selectedClinic).toHaveTextContent(/rua das palmeiras, 120 - jardins, s.o paulo - sp, 01415-000/i);
    expect(screen.getByRole('button', { name: /cancelar consulta/i })).toBeInTheDocument();
    expectNoEmbeddedStepContent();
  });

  it('lets the customer cancel the selected clinic while waiting for dentist acceptance', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=user') {
        return Promise.resolve({
          orders: [
            {
              id: 'BP-DEMO-021',
              status: 'awaiting_dentist_acceptance',
              statusLabel: 'Aguardando aceite do dentista',
              stage: 'dentist_acceptance_pending',
              created_at: '2026-05-01T10:00:00.000Z',
              customer: { full_name: 'Cliente indicado', email: 'cliente@nexor.dev', phone: null },
              practice_location: { id: 'practice-demo-001', name: 'Clínica Esportiva Nexor' },
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-021/workflow-forms') {
        return Promise.resolve({ forms: [] });
      }

      if (path === '/v1/orders/BP-DEMO-021/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      return Promise.resolve({});
    });
    mockApiPost.mockResolvedValueOnce({
      order: {
        id: 'BP-DEMO-021',
        status: 'awaiting_scheduling',
        statusLabel: 'Aguardando consulta inicial',
        stage: 'awaiting_initial_consultation',
        created_at: '2026-05-01T10:00:00.000Z',
        customer: { full_name: 'Cliente indicado', email: 'cliente@nexor.dev', phone: null },
        practice_location: null,
      },
    });

    renderPage();

    const cancelButton = await screen.findByRole('button', { name: /cancelar consulta/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-021/practice-location-selection/cancel',
        {},
        'tok'
      );
      expect(screen.getByRole('status')).toHaveTextContent(/cl.nica cancelada/i);
    });
  });

  it('lets the customer recover an interrupted clinic cancellation without a selected clinic card', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=user') {
        return Promise.resolve({
          orders: [
            {
              id: 'BP-DEMO-023',
              status: 'awaiting_dentist_acceptance',
              statusLabel: 'Aguardando aceite do dentista',
              stage: 'dentist_acceptance_pending',
              created_at: '2026-05-01T10:00:00.000Z',
              customer: { full_name: 'Cliente indicado', email: 'cliente@nexor.dev', phone: null },
              practice_location: null,
              dentist_id: null,
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-023/workflow-forms') {
        return Promise.resolve({ forms: [] });
      }

      if (path === '/v1/orders/BP-DEMO-023/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      return Promise.resolve({});
    });
    mockApiPost.mockResolvedValueOnce({
      order: {
        id: 'BP-DEMO-023',
        status: 'awaiting_scheduling',
        statusLabel: 'Aguardando consulta inicial',
        stage: 'awaiting_initial_consultation',
        created_at: '2026-05-01T10:00:00.000Z',
        customer: { full_name: 'Cliente indicado', email: 'cliente@nexor.dev', phone: null },
        practice_location: null,
        dentist_id: null,
      },
    });

    renderPage();

    expect(await screen.findByTestId('journey-interrupted-clinic-selection')).toHaveTextContent(/consulta sem cl.nica vinculada/i);
    fireEvent.click(screen.getByRole('button', { name: /liberar escolha de cl.nica/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-023/practice-location-selection/cancel',
        {},
        'tok'
      );
      expect(screen.getByRole('status')).toHaveTextContent(/ordem voltou para sele..o de cl.nica/i);
    });
  });

  it('shows only a waiting notice when the current step depends on the dentist', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-003',
            status: 'appointment_confirmed',
            statusLabel: 'Consulta confirmada',
            stage: 'awaiting_clinical_decision',
            created_at: '2026-05-02T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
            practice_location: { id: 'clinic-1', name: 'Clinica Sorriso Centro' },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    const notice = await screen.findByTestId('journey-step-notice');
    expect(screen.getByTestId('journey-step-clinical_decision')).toHaveTextContent(/atual/i);
    expect(notice).toHaveTextContent(/aguarda a decis/i);
    expectNoEmbeddedStepContent();
  });

  it('shows collapsed payment details and advances the journey to laboratory after Stripe confirmation', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-004',
            status: 'payment_confirmed',
            statusLabel: 'Aguardando envio ao laboratório',
            stage: 'payment_confirmed',
            created_at: '2026-05-02T15:56:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
            payment: {
              status: 'paid',
              provider: 'stripe',
              amountCents: 548000,
              method: 'card',
              paidAt: '2026-05-02T15:56:00.000Z',
              receiptEmail: 'joao@nexor.dev',
            },
            purchaseConfiguration: {
              productKey: 'biteplaner',
              quantity: 4,
              model: 'esportes',
              color: 'preto',
            },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    const paymentBox = await screen.findByTestId('journey-payment-confirmation');
    const nextStepBox = await screen.findByTestId('journey-payment-next-step');
    expect(screen.getByTestId('journey-step-purchase')).toHaveTextContent(/conclu.do/i);
    expect(screen.getByTestId('journey-step-laboratory')).toHaveTextContent(/atual/i);
    expect(paymentBox).toHaveTextContent(/detalhes do pagamento/i);
    expect(paymentBox).not.toHaveAttribute('open');
    fireEvent.click(within(paymentBox).getByText(/detalhes do pagamento/i));
    expect(paymentBox).toHaveAttribute('open');
    expect(paymentBox).toHaveTextContent(/próximo passo/i);
    expect(paymentBox).toHaveTextContent(/dentista dar o ok/i);
    expect(paymentBox).toHaveTextContent(/enviar a produção para o laboratório/i);
    expect(paymentBox).toHaveTextContent(/quantidade/i);
    expect(paymentBox).toHaveTextContent(/4/i);
    expect(paymentBox).toHaveTextContent(/linha esportes/i);
    expect(paymentBox).toHaveTextContent(/preto/i);
    expect(paymentBox).toHaveTextContent(/r\$ 5.480,00/i);
    expect(paymentBox).toHaveTextContent(/cartão/i);
    expect(paymentBox).not.toHaveTextContent(/cupom/i);
    expect(paymentBox).not.toHaveTextContent(/desconto/i);
    expect(paymentBox).not.toHaveTextContent(/recibo/i);
    expect(nextStepBox).toHaveTextContent(/o que acontece agora/i);
    expect(nextStepBox).toHaveTextContent(/aguarde o dentista confirmar os dados operacionais/i);
    expectNoEmbeddedStepContent();
  });

  it('shows a pending user action when the linked consultation needs athlete confirmation', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-003',
            status: 'in_progress',
            statusLabel: 'Aguardando confirmação de consulta',
            stage: 'consultation_linked',
            created_at: '2026-05-02T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
            practice_location: { id: 'clinic-1', name: 'Clinica Sorriso Centro' },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] })
      .mockResolvedValueOnce({
        appointments: [
          {
            id: 'appointment-1',
            order_id: 'BP-DEMO-003',
            type: 'initial',
            status: 'scheduled',
            scheduled_at: '2026-05-03T10:00:00.000Z',
            user_confirmed_at: null,
            dentist_confirmed_at: null,
          },
        ],
      });
    mockApiPost.mockResolvedValueOnce({
      appointment: {
        id: 'appointment-1',
        order_id: 'BP-DEMO-003',
        type: 'initial',
        status: 'scheduled',
        scheduled_at: '2026-05-03T10:00:00.000Z',
        user_confirmed_at: '2026-05-03T12:00:00.000Z',
        dentist_confirmed_at: null,
      },
    });

    renderPage();

    const actionCard = await screen.findByTestId('journey-action-card');
    await within(actionCard).findByRole('button', { name: /confirmar consulta realizada/i });
    expect(actionCard).toHaveTextContent(/confirme que a consulta agendada foi realizada/i);
    expect(within(actionCard).getByRole('button', { name: /confirmar consulta realizada/i })).toBeInTheDocument();
    const pendingAlert = await screen.findByTestId('journey-pending-user-action');
    expect(pendingAlert).toHaveTextContent(/ação pendente do usuário/i);
    expect(pendingAlert).toHaveTextContent(/o que fazer agora/i);
    expect(within(pendingAlert).queryByRole('button', { name: /confirmar consulta realizada/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('journey-step-notice')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /confirmar consulta realizada/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-003/appointments/appointment-1/user-confirmation',
        {},
        'tok'
      )
    );
    expectNoEmbeddedStepContent();
  });

  it('keeps the journey stable when appointment confirmation returns the appointment directly', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-003',
            status: 'in_progress',
            statusLabel: 'Aguardando confirmação de consulta',
            stage: 'consultation_linked',
            created_at: '2026-05-02T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
            practice_location: { id: 'clinic-1', name: 'Clínica Sorriso Centro' },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] })
      .mockResolvedValueOnce({
        appointments: [
          {
            id: 'appointment-1',
            order_id: 'BP-DEMO-003',
            type: 'initial',
            status: 'scheduled',
            scheduled_at: '2026-05-03T10:00:00.000Z',
            user_confirmed_at: null,
            dentist_confirmed_at: null,
          },
        ],
      });
    mockApiPost.mockResolvedValueOnce({
      id: 'appointment-1',
      order_id: 'BP-DEMO-003',
      type: 'initial',
      status: 'scheduled',
      scheduled_at: '2026-05-03T10:00:00.000Z',
      user_confirmed_at: '2026-05-03T12:00:00.000Z',
      dentist_confirmed_at: null,
    });

    renderPage();

    await screen.findByTestId('journey-action-card');
    expect(await screen.findByTestId('journey-pending-user-action')).toHaveTextContent(/ação pendente do usuário/i);
    fireEvent.click(await screen.findByRole('button', { name: /confirmar consulta realizada/i }));

    await screen.findByText(/consulta realizada foi registrada/i);
    expect(
      screen
        .getAllByRole('status')
        .some((status) => /consulta confirmada/i.test(status.textContent ?? '') && /consulta realizada foi registrada/i.test(status.textContent ?? ''))
    ).toBe(true);
    expect(screen.getByTestId('journey-step-notice')).toHaveTextContent(/ação está com o dentista/i);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the dentist as the current actor when the athlete already confirmed the consultation', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-003',
            status: 'in_progress',
            statusLabel: 'Aguardando confirmação de consulta',
            stage: 'consultation_linked',
            created_at: '2026-05-02T10:00:00.000Z',
            customer: { full_name: 'Eduardo Demo', email: 'eduardohoitifujiwara@gmail.com', phone: null },
            practice_location: { id: 'clinic-1', name: 'Clinica Sorriso Centro' },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] })
      .mockResolvedValueOnce({
        appointments: [
          {
            id: 'appointment-1',
            order_id: 'BP-DEMO-003',
            type: 'initial',
            status: 'scheduled',
            scheduled_at: '2026-05-03T10:00:00.000Z',
            user_confirmed_at: '2026-05-03T12:00:00.000Z',
            dentist_confirmed_at: null,
          },
        ],
      });

    renderPage();

    const notice = await screen.findByTestId('journey-step-notice');
    expect(notice).toHaveTextContent(/ação está com o dentista/i);
    expect(notice).not.toHaveTextContent(/ação pendente para o usuário/i);
    expect(screen.queryByTestId('journey-pending-user-action')).not.toBeInTheDocument();
    expectNoEmbeddedStepContent();
  });

  it('keeps the athlete journey focused on a single primary order even when the backend returns more orders', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-001',
            status: 'awaiting_scheduling',
            statusLabel: 'Aguardando consulta inicial',
            stage: 'awaiting_initial_consultation',
            created_at: '2026-05-01T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
          },
          {
            id: 'BP-DEMO-003',
            status: 'in_progress',
            statusLabel: 'Aguardando confirmação de consulta',
            stage: 'consultation_linked',
            created_at: '2026-05-02T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
            practice_location: { id: 'clinic-1', name: 'Clinica Sorriso Centro' },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getAllByText(/bp-demo-001/i).length).toBeGreaterThan(0));
    expect(screen.getByTestId('journey-step-consultation')).toHaveTextContent(/atual/i);
    expect(screen.queryByText(/bp-demo-003/i)).not.toBeInTheDocument();
    expectNoEmbeddedStepContent();
  });

  it('shows a compact problem message when the dentist marks the order as ineligible', async () => {
    const inaptitudeReason = 'A ATM apresentou limitação dolorosa e o cliente deve reavaliar após acompanhamento.';

    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=user') {
        return Promise.resolve({
        orders: [
          {
            id: 'BP-DEMO-010',
            status: 'ineligible_reassessment',
            statusLabel: 'Inaptidão',
            stage: 'awaiting_initial_consultation',
            created_at: '2026-05-04T09:00:00.000Z',
            customer: { full_name: 'Marina Lutadora', email: 'marina.demo@nexor.dev', phone: null },
          },
        ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-010/workflow-forms') {
        return Promise.resolve({
        forms: [
          {
            id: 'BP-WF-010-INTAKE',
            orderId: 'BP-DEMO-010',
            templateKey: 'customer_pre_consultation_intake',
            stepKey: 'initial_consultation_preparation',
            status: 'submitted',
            roleState: { customer: 'locked', dentist: 'submitted' },
            customerSubmittedAt: '2026-05-01T11:20:00.000Z',
            dentistSubmittedAt: '2026-05-08T12:10:00.000Z',
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-01T11:05:00.000Z',
            submittedAt: '2026-05-08T12:10:00.000Z',
            payload: {
              customer: { fullName: 'Marina Lutadora' },
              dentist: {
                biteplannerEligible: 'no',
                ineligibilityDescriptionForCustomer: inaptitudeReason,
              },
            },
          },
        ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-010/appointments') {
        return Promise.resolve({ appointments: [] });
      }

      return Promise.resolve({});
    });

    renderPage();

    const problem = await screen.findByTestId('journey-order-problem');
    expect(problem).toHaveTextContent(/cliente inapto neste momento/i);
    expect(problem).toHaveTextContent(/nova reavalia/i);
    expect(problem).toHaveTextContent(/dentista respons.*vel registrou/i);
    await waitFor(() => expect(screen.getByTestId('journey-order-problem')).toHaveTextContent(inaptitudeReason));
    expect(screen.getByTestId('journey-step-consultation')).toHaveTextContent(/atual/i);
    expect(screen.getByTestId('journey-step-clinical_decision')).not.toHaveTextContent(/atual/i);
    expect(screen.getByRole('link', { name: /marcar uma nova consulta/i })).toHaveAttribute('href', '/painel/consulta-inicial');
    expect(screen.queryByRole('textbox', { name: /mensagem/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /enviar e-mail para a nexor/i })).not.toBeInTheDocument();
    expectNoEmbeddedStepContent();
  });

  it('explains when the journey was interrupted by an approved account removal', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-011',
            status: 'cancelled',
            statusLabel: 'Cancelada',
            statusReason: 'account_deletion_approved',
            stage: 'awaiting_initial_consultation',
            created_at: '2026-05-04T09:00:00.000Z',
            customer: { full_name: 'Marina Lutadora', email: 'marina.demo@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] })
      .mockResolvedValueOnce({ appointments: [] });

    renderPage();

    const problem = await screen.findByTestId('journey-order-problem');
    expect(problem).toHaveTextContent(/jornada interrompida/i);
    expect(problem).toHaveTextContent(/remoção de conta/i);
    expect(problem).toHaveTextContent(/sem gerar ressarcimento automático/i);
    expectNoEmbeddedStepContent();
  });
});
