import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    payload: status === 'submitted' ? { customer: { fullName: 'Joao Demo', clinicalPrivacyConsent: ['accepted'] } } : null,
  };
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
    expect(screen.queryByRole('link', { name: /visão geral dos steps/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('step-breadcrumb-current')).not.toBeInTheDocument();
    expect(screen.getByTestId('athlete-order-status')).toHaveTextContent(/pre-requisito pendente/i);
    expect(screen.queryByRole('link', { name: /ver jornada/i })).not.toBeInTheDocument();
  });

  it('renders the clinical form from the DOCX with the same stepped intake experience', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    expect(screen.getByRole('heading', { name: /pre-requisito biteplaner/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('athlete-order-card')).toBeInTheDocument());

    expect((await screen.findAllByText(/formulário clínico biteplaner/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/política de privacidade/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/a nexor desenvolve pesquisas científicas/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /1 política de privacidade/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /1 dados iniciais/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/declaro que li e entendi/i));
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    expect(await screen.findByRole('button', { name: /1 dados iniciais/i })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: /2 dados clínicos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3 experiência com o dispositivo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4 pesquisa de satisfação/i })).toBeInTheDocument();
    expect(screen.queryByText(/questionario odontológico/i)).not.toBeInTheDocument();
  });

  it('requires the clinical privacy consent before showing initial clinical data fields', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByLabelText(/declaro que li e entendi/i);
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));
    expect(await screen.findByText(/campo obrigatório/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/declaro que li e entendi/i));
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    expect(await screen.findByLabelText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/está em tratamento ortodôntico/i)).toBeInTheDocument();
    expect(screen.getByText(/necessita de atendimento em clínica adaptada/i)).toBeInTheDocument();
  });
});
