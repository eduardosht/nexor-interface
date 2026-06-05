import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { createTestQueryClient, TestQueryClientProvider } from '../../../test/renderWithQueryClient';

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
    mockApiGet.mockResolvedValue({ appointments: [] });
    mockApiPost.mockReset();
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
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-journey-steps')).toBeInTheDocument());
    expect(screen.getByRole('heading', { level: 1, name: /fluxo visual da jornada/i })).toBeInTheDocument();
    expect(screen.getByText(/jornada bp-demo-006/i)).toBeInTheDocument();
    expect(screen.queryByTestId('athlete-order-card')).not.toBeInTheDocument();
    expectNoEmbeddedStepContent();
  });

  it('redirects new-user-onboarding orders to the Biteplaner onboarding page', async () => {
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

    await waitFor(() => expect(screen.getByTestId('current-path')).toHaveTextContent('/painel/biteplaner/onboarding'));
    expect(screen.queryByTestId('athlete-journey-steps')).not.toBeInTheDocument();
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

    await waitFor(() => expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/etapa atual/i));
    expect(screen.getByRole('link', { name: /etapa atual/i })).toHaveAttribute('href', '/painel/pre-requisito');
    expectNoEmbeddedStepContent();
  });

  it('advances to consultation when the prerequisite intake was already submitted', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-001',
            status: 'registration_started',
            statusLabel: 'Pre-requisito pendente',
            stage: 'pre_requisite_pending',
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

    await waitFor(() => expect(screen.getByTestId('journey-step-consultation')).toHaveTextContent(/etapa atual/i));
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/conclu.do com sucesso/i);
    expect(screen.getByRole('link', { name: /etapa atual/i })).toHaveAttribute('href', '/painel/consulta-inicial');
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

    await waitFor(() => expect(screen.getByTestId('journey-step-consultation')).toHaveTextContent(/etapa atual/i));
    expect(screen.getByRole('link', { name: /etapa atual/i })).toHaveAttribute('href', '/painel/consulta-inicial');
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/conclu.do com sucesso/i);
    expectNoEmbeddedStepContent();
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
    expect(screen.getByTestId('journey-step-clinical_decision')).toHaveTextContent(/etapa atual/i);
    expect(notice).toHaveTextContent(/aguarda a decis/i);
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

    const notice = await screen.findByTestId('journey-step-notice');
    expect(notice).toHaveTextContent(/ação pendente para o usuário/i);
    expect(notice).not.toHaveTextContent(/aguarde as confirma/i);

    const pendingAction = await screen.findByTestId('journey-pending-user-action');
    fireEvent.click(screen.getByRole('button', { name: /confirmar consulta realizada/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-003/appointments/appointment-1/user-confirmation',
        {},
        'tok'
      )
    );
    expect(pendingAction).toHaveTextContent(/confirme que a consulta agendada foi realizada/i);
    expectNoEmbeddedStepContent();
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
            status: 'registration_started',
            statusLabel: 'Pre-requisito pendente',
            stage: 'pre_requisite_pending',
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
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/etapa atual/i);
    expect(screen.queryByText(/bp-demo-003/i)).not.toBeInTheDocument();
    expectNoEmbeddedStepContent();
  });

  it('shows a compact problem message when the dentist marks the order as ineligible', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-010',
            status: 'ineligible_refund',
            statusLabel: 'Inapto - Encerrado',
            stage: 'closed_ineligible',
            created_at: '2026-05-04T09:00:00.000Z',
            customer: { full_name: 'Marina Lutadora', email: 'marina.demo@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    const problem = await screen.findByTestId('journey-order-problem');
    expect(problem).toHaveTextContent(/atleta inapto para uso do produto/i);
    expect(problem).toHaveTextContent(/o dentista respons/i);
    expect(screen.queryByRole('textbox', { name: /mensagem/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /enviar e-mail para a nexor/i })).not.toBeInTheDocument();
    expectNoEmbeddedStepContent();
  });
});
