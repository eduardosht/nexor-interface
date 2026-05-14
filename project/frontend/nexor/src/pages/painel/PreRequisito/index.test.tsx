import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPost, mockNavigate } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    post: mockApiPost,
  },
}));

import { PreRequisito } from './index';

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
        <PreRequisito />
      </ThemeProvider>
    </MemoryRouter>
  );
}

function demoOrder(status = 'registration_started') {
  return {
    id: 'BP-DEMO-001',
    status,
    statusLabel: status === 'registration_started' ? 'Pre-requisito pendente' : 'Aguardando consulta inicial',
    stage: status === 'registration_started' ? 'pre_requisite_pending' : 'awaiting_initial_consultation',
    created_at: '2026-05-01T10:00:00.000Z',
    customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
  };
}

function sharedIntake(status: 'pending' | 'submitted' = 'pending') {
  return {
    id: 'BP-WF-001-INTAKE',
    orderId: 'BP-DEMO-001',
    templateKey: 'customer_pre_consultation_intake',
    stepKey: 'pre_requisite_pending',
    status,
    roleState: { customer: status === 'submitted' ? 'submitted' : 'pending', dentist: 'locked' },
    customerSubmittedAt: status === 'submitted' ? '2026-05-01T11:20:00.000Z' : null,
    dentistReviewStartedAt: null,
    dentistSubmittedAt: null,
    canViewPayload: true,
    summary:
      status === 'submitted'
        ? { scoreAverage: null, hasComment: true, responseCount: 1, submittedAt: '2026-05-01T11:20:00.000Z' }
        : null,
    releasedAt: '2026-05-01T10:05:00.000Z',
    submittedAt: status === 'submitted' ? '2026-05-01T11:20:00.000Z' : null,
    payload: status === 'submitted' ? { customer: { fullName: 'Joao Demo', sportRoutine: 'Boxe' } } : null,
  };
}

async function fillMinimumRequiredCustomerFields() {
  fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: '11999999999' } });
  fireEvent.change(screen.getByLabelText(/modalidade principal/i), { target: { value: 'Boxe' } });
  const medicalDiagnosisGroup = await screen.findByRole('group', {
    name: /possui algum diagn/i,
  });
  fireEvent.click(within(medicalDiagnosisGroup).getByRole('radio', { name: /n/i }));
}

describe('PreRequisito', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockNavigate.mockReset();
  });

  it('shows the shared athlete order status', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-order-status')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /visão geral dos steps/i })).toHaveAttribute('href', '/painel/biteplaner/jornada');
    expect(screen.getByTestId('step-breadcrumb-current')).toHaveTextContent(/pre-requisito/i);
    expect(screen.getByTestId('athlete-order-status')).toHaveTextContent(/pre-requisito pendente/i);
    expect(screen.queryByRole('link', { name: /ver jornada/i })).not.toBeInTheDocument();
  });

  it('replaces the old prerequisite questions with the shared Biteplaner intake and consents', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    expect(screen.getByRole('heading', { name: /pre-requisito biteplaner/i })).toBeInTheDocument();
    expect(screen.getByText(/campos marcados com/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByTestId('athlete-order-card')).toBeInTheDocument());

    expect(screen.getByText('BP-DEMO-001')).toBeInTheDocument();
    expect(screen.getByTestId('athlete-order-status')).toHaveTextContent(/pre-requisito pendente/i);
    expect((await screen.findAllByText(/avalia.*inicial compartilhada biteplaner/i)).length).toBeGreaterThan(0);
    expect(screen.getByText(/25% completo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1 perfil e sa/i })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: /4 consentimentos/i })).toBeInTheDocument();
    const sleepQualityInput = screen.getByLabelText(/qualidade do sono/i);
    expect(sleepQualityInput).toHaveAttribute('type', 'number');
    expect(sleepQualityInput).toHaveAttribute('min', '0');
    expect(sleepQualityInput).toHaveAttribute('max', '10');
    expect(screen.queryByRole('button', { name: /concluir pre-requisito/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/questionario odontológico/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^documento/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/esporte ou atividade/i)).not.toBeInTheDocument();
  });

  it('renders shared intake step titles without bold weight', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByRole('button', { name: /1 perfil e sa/i });

    const profileAndHealthTitles = screen.getAllByText('Perfil e saúde');
    expect(profileAndHealthTitles.length).toBeGreaterThan(0);
    profileAndHealthTitles.forEach((title) => {
      expect(Number(getComputedStyle(title).fontWeight)).toBeLessThan(600);
    });
  });

  it('limits numeric 0 to 10 intake fields while typing', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    const sleepQualityInput = await screen.findByLabelText(/qualidade do sono/i);
    fireEvent.change(sleepQualityInput, { target: { value: '15' } });
    expect(sleepQualityInput).toHaveValue(10);

    fireEvent.change(sleepQualityInput, { target: { value: '-3' } });
    expect(sleepQualityInput).toHaveValue(0);

    fireEvent.click(screen.getByRole('button', { name: /3 treino e expectativas/i }));
    const stressInput = await screen.findByLabelText(/n.*vel de estresse percebido/i);
    expect(stressInput).toHaveAttribute('type', 'number');
    fireEvent.change(stressInput, { target: { value: '11' } });
    expect(stressInput).toHaveValue(10);
  });

  it('keeps the shared form submission disabled until required Biteplaner consents are accepted', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    expect((await screen.findAllByText(/avalia.*inicial compartilhada biteplaner/i)).length).toBeGreaterThan(0);
    await fillMinimumRequiredCustomerFields();
    fireEvent.click(screen.getByRole('button', { name: /4 consentimentos/i }));

    const submitButton = await screen.findByRole('button', { name: /enviar formulário/i });
    expect(screen.getAllByRole('heading', { name: /consentimentos/i }).length).toBeGreaterThan(0);
    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/tratamento necessário para inscrição/i));
    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/tratamento de dados sensíveis/i));
    expect(submitButton).not.toBeDisabled();
  });

  it('advances the order when the shared intake is submitted with required consents', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake()] });
    mockApiPost
      .mockResolvedValueOnce({
        ...sharedIntake('submitted'),
        payload: {
          customer: {
            fullName: 'Joao Demo',
            phone: '11999999999',
            sportRoutine: 'Boxe',
            serviceConsent: ['accepted'],
            sensitiveHealthConsent: ['accepted'],
            researchConsent: ['accepted'],
          },
        },
      })
      .mockResolvedValueOnce({ order: demoOrder('awaiting_scheduling') });

    renderPage();

    expect((await screen.findAllByText(/avalia.*inicial compartilhada biteplaner/i)).length).toBeGreaterThan(0);
    await fillMinimumRequiredCustomerFields();
    fireEvent.click(screen.getByRole('button', { name: /próxima etapa/i }));
    fireEvent.click(await screen.findByRole('button', { name: /4 consentimentos/i }));
    fireEvent.click(screen.getByLabelText(/tratamento necessário para inscrição/i));
    fireEvent.click(screen.getByLabelText(/tratamento de dados sensíveis/i));
    fireEvent.click(screen.getByLabelText(/pesquisa e p&d/i));
    fireEvent.click(screen.getByRole('button', { name: /enviar formulário/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-001/workflow-forms/BP-WF-001-INTAKE/submit',
        {
          payload: expect.objectContaining({
            customer: expect.objectContaining({
              fullName: 'Joao Demo',
              phone: '11999999999',
              sportRoutine: 'Boxe',
              serviceConsent: ['accepted'],
              sensitiveHealthConsent: ['accepted'],
              researchConsent: ['accepted'],
            }),
          }),
        },
        'tok'
      )
    );
    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-001/prerequisite-completed',
        expect.objectContaining({
          documentType: 'workflow_intake',
          documentNumber: '',
          sport: '',
          isMinor: false,
          eligibility: {
            orthodontic: false,
            activeDentalTreatment: false,
            relevantCondition: false,
          },
          consents: expect.objectContaining({
            service: true,
            sensitiveHealth: true,
            research: true,
            marketing: false,
          }),
        }),
        'tok'
      )
    );
    expect(screen.getByTestId('athlete-order-status')).toHaveTextContent(/aguardando consulta inicial/i);
    expect(screen.getByRole('status')).toHaveTextContent(/pre-requisito concluído/i);
    expect(screen.getByRole('status')).toHaveTextContent(/escolha o consultório/i);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/painel/consulta-inicial'));
  });
});
