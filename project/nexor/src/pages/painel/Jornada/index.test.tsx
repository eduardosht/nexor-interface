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

import { Jornada } from './index';

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
        <Jornada />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Jornada', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
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
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-journey-steps')).toBeInTheDocument());
    expect(screen.getByRole('heading', { level: 1, name: /fluxo visual da jornada/i })).toBeInTheDocument();
    expect(screen.getByText(/pedido bp-demo-006/i)).toBeInTheDocument();
    expect(screen.queryByTestId('athlete-order-card')).not.toBeInTheDocument();
  });

  it('shows the next-step CTA based on the active order', async () => {
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
        events: [
          {
            id: 'event-1',
            orderId: 'BP-DEMO-001',
            fromStatus: null,
            toStatus: 'registration_started',
            reason: 'Cadastro iniciado na demo.',
            createdAt: '2026-05-01T10:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getByRole('link', { name: /abrir pre-requisito/i })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /abrir pre-requisito/i })).toHaveAttribute('href', '/painel/pre-requisito');
    expect(screen.getAllByText(/cadastro iniciado na demo/i).length).toBeGreaterThan(0);
  });

  it('routes the consultation step to the dedicated consultation screen and uses numeric step badges', async () => {
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
            practice_location: { id: 'practice-demo-001', name: 'Clínica Esportiva Nexor' },
          },
        ],
      })
      .mockResolvedValueOnce({
        events: [
          {
            id: 'event-1',
            orderId: 'BP-DEMO-002',
            fromStatus: 'registration_started',
            toStatus: 'awaiting_scheduling',
            reason: 'Pre-requisito concluído e aguardando escolha do consultório.',
            createdAt: '2026-05-01T10:15:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getByRole('link', { name: /abrir consulta inicial/i })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /abrir consulta inicial/i })).toHaveAttribute('href', '/painel/consulta-inicial');
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveAttribute('href', '/painel/pre-requisito');
    expect(screen.getByTestId('journey-step-consultation')).toHaveAttribute('href', '/painel/consulta-inicial');
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/concluído com sucesso/i);
    expect(getComputedStyle(screen.getByTestId('journey-step-prerequisite')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(screen.getByTestId('journey-step-prerequisite')).borderTopStyle).toBe('');
    expect(screen.getByText(/^2$/)).toBeInTheDocument();
    expect(screen.queryByText(/step 2/i)).not.toBeInTheDocument();
  });

  it('renders a connected step flow with explicit mock purchase and case summary', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-004',
            status: 'awaiting_payment',
            statusLabel: 'Aguardando pagamento',
            stage: 'awaiting_payment',
            created_at: '2026-05-03T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
            practice_location: { id: 'clinic-1', name: 'Clínica Sorrisó Centro' },
          },
        ],
      })
      .mockResolvedValueOnce({
        events: [
          {
            id: 'event-1',
            orderId: 'BP-DEMO-004',
            fromStatus: 'in_progress',
            toStatus: 'awaiting_payment',
            reason: 'Apto na avaliação clínica e aguardando pagamento.',
            createdAt: '2026-05-03T11:00:00.000Z',
          },
          {
            id: 'event-2',
            orderId: 'BP-DEMO-004',
            fromStatus: 'awaiting_scheduling',
            toStatus: 'in_progress',
            reason: 'Consulta inicial vinculada ao dentista selecionado.',
            createdAt: '2026-05-03T10:30:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-journey-steps')).toBeInTheDocument());
    expect(screen.getByText(/^4$/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /compra/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /abrir compra mock/i })).toHaveAttribute('href', '/painel/compra');
    expect(screen.getAllByText(/dentista selecionado/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/clínica sorrisó centro/i)).toBeInTheDocument();
    expect(screen.getByText(/histórico resumido/i)).toBeInTheDocument();
    expect(screen.getByText(/apto na avaliação clínica/i)).toBeInTheDocument();
  });

  it('renders mapped workflow forms in the journey and submits the pending intake', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-003',
            status: 'in_progress',
            statusLabel: 'Consulta vinculada',
            stage: 'consultation_linked',
            created_at: '2026-05-02T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
            practice_location: { id: 'clinic-1', name: 'Clínica Sorrisó Centro' },
          },
        ],
      })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({
        forms: [
          {
            id: 'BP-WF-003-INTAKE',
            orderId: 'BP-DEMO-003',
            templateKey: 'customer_pre_consultation_intake',
            stepKey: 'initial_consultation_preparation',
            status: 'pending',
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-02T10:05:00.000Z',
            submittedAt: null,
            payload: null,
          },
        ],
      });
    mockApiPost.mockResolvedValueOnce({
      id: 'BP-WF-003-INTAKE',
      orderId: 'BP-DEMO-003',
      templateKey: 'customer_pre_consultation_intake',
      stepKey: 'initial_consultation_preparation',
      status: 'submitted',
      canViewPayload: true,
      summary: { scoreAverage: null, hasComment: true, responseCount: 1, submittedAt: '2026-05-02T10:20:00.000Z' },
      releasedAt: '2026-05-02T10:05:00.000Z',
      submittedAt: '2026-05-02T10:20:00.000Z',
      payload: {},
    });

    renderPage();

    await waitFor(() => expect(screen.getByText(/avalia.*inicial compartilhada biteplaner/i)).toBeInTheDocument());
    expect(getComputedStyle(screen.getByTestId('journey-step-forms-consultation')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(screen.getByTestId('journey-step-forms-consultation')).borderTopStyle).toBe('');
    expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Joao Demo');
    fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: '11999999999' } });
    expect(screen.getByLabelText(/telefone/i)).toHaveValue('(11) 99999-9999');
    fireEvent.change(screen.getByLabelText(/modalidade principal/i), { target: { value: 'Boxe' } });
    const medicalDiagnosisGroup = await screen.findByRole('group', {
      name: /possui algum diagn/i,
    });
    fireEvent.click(within(medicalDiagnosisGroup).getByRole('radio', { name: /n/i }));
    fireEvent.click(screen.getByRole('button', { name: /próxima etapa/i }));
    fireEvent.click(await screen.findByRole('button', { name: /4 consentimentos/i }));
    fireEvent.click(screen.getByLabelText(/tratamento necessário para inscrição/i));
    fireEvent.click(screen.getByLabelText(/tratamento de dados sensíveis/i));
    fireEvent.click(screen.getByRole('button', { name: /enviar formulário/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-003/workflow-forms/BP-WF-003-INTAKE/submit',
        {
          payload: expect.objectContaining({
            customer: expect.objectContaining({
              fullName: 'Joao Demo',
              phone: '11999999999',
              sportRoutine: 'Boxe',
              hasRelevantMedicalDiagnosis: 'no',
              serviceConsent: ['accepted'],
              sensitiveHealthConsent: ['accepted'],
            }),
          }),
        },
        'tok'
      )
    );
    expect((await screen.findAllByText(/formulário enviado/i)).length).toBeGreaterThan(0);
  });

  it('lets the athlete select another visible order to load its workflow forms', async () => {
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
            statusLabel: 'Consulta vinculada',
            stage: 'consultation_linked',
            created_at: '2026-05-02T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
            practice_location: { id: 'clinic-1', name: 'Clínica Sorrisó Centro' },
          },
        ],
      })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ forms: [] })
      .mockResolvedValueOnce({
        forms: [
          {
            id: 'BP-WF-003-INTAKE',
            orderId: 'BP-DEMO-003',
            templateKey: 'customer_pre_consultation_intake',
            stepKey: 'initial_consultation_preparation',
            status: 'pending',
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-02T10:05:00.000Z',
            submittedAt: null,
            payload: null,
          },
        ],
      });

    renderPage();

    await waitFor(() => expect(screen.getByText(/bp-demo-003/i)).toBeInTheDocument());
    expect(screen.queryByText(/avalia.*inicial compartilhada biteplaner/i)).not.toBeInTheDocument();

    const orderCard = screen.getByText('BP-DEMO-003').closest('article');
    expect(orderCard).not.toBeNull();
    fireEvent.click(within(orderCard as HTMLElement).getByRole('button', { name: /ver formulários/i }));

    expect(await screen.findByText(/formulários e feedbacks da jornada/i)).toBeInTheDocument();
    expect(screen.getByText(/os passos abaixo mostram em que ponto o pedido bp-demo-003 está/i)).toBeInTheDocument();
    expect(await screen.findByText(/avalia.*inicial compartilhada biteplaner/i)).toBeInTheDocument();
  });

  it('maps customer partner reviews to the follow-up step', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-006',
            status: 'follow_up',
            statusLabel: 'Em acompanhamento',
            stage: 'follow_up',
            created_at: '2026-05-04T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
            practice_location: { id: 'clinic-1', name: 'Clínica Sorrisó Centro' },
          },
        ],
      })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({
        forms: [
          {
            id: 'BP-WF-006-PARTNER',
            orderId: 'BP-DEMO-006',
            templateKey: 'partner_review_by_customer',
            stepKey: 'partner_review_by_customer',
            status: 'pending',
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-04T12:00:00.000Z',
            submittedAt: null,
            payload: null,
          },
        ],
      });

    renderPage();

    mockApiPost.mockResolvedValueOnce({
      id: 'BP-WF-006-PARTNER',
      orderId: 'BP-DEMO-006',
      templateKey: 'partner_review_by_customer',
      stepKey: 'partner_review_by_customer',
      status: 'submitted',
      canViewPayload: true,
      summary: { scoreAverage: 4.7, hasComment: true, responseCount: 4, submittedAt: '2026-05-04T12:10:00.000Z' },
      releasedAt: '2026-05-04T12:00:00.000Z',
      submittedAt: '2026-05-04T12:10:00.000Z',
      payload: {},
    });

    const followUpForms = await screen.findByTestId('journey-step-forms-follow_up');
    expect(within(followUpForms).getByText(/cliente avaliando parceiro/i)).toBeInTheDocument();
    expect(within(followUpForms).getByRole('button', { name: /responder survey obrigat/i })).toBeInTheDocument();
    expect(within(followUpForms).queryByText(/gentileza no atendimento/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('journey-step-forms-clinical_decision')).not.toBeInTheDocument();

    fireEvent.click(within(followUpForms).getByRole('button', { name: /responder survey obrigat/i }));
    expect(await screen.findByRole('dialog', { name: /cliente avaliando parceiro indicador/i })).toBeInTheDocument();
    expect(screen.getByText(/gentileza no atendimento/i)).toBeInTheDocument();

    for (const label of [
      /gentileza no atendimento/i,
      /disponibilidade, presença e atenção/i,
      /qualidade técnica no direcionamento/i,
    ]) {
      const group = screen.getByRole('radiogroup', { name: label });
      fireEvent.click(within(group).getByLabelText(/5 estrelas/i));
    }

    fireEvent.change(screen.getByLabelText(/comentário/i), {
      target: { value: 'Acompanhamento claro desde a indicação.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar survey/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-006/workflow-forms/BP-WF-006-PARTNER/submit',
        {
          payload: {
            courtesy: 5,
            followUpAvailability: 5,
            technicalGuidance: 5,
            comment: 'Acompanhamento claro desde a indicação.',
          },
        },
        'tok'
      )
    );
  });
});
