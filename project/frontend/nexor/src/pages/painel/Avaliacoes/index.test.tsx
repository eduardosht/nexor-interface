import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

import { Avaliacoes } from './index';

function renderPage(path = '/painel/biteplaner/avaliacoes?mode=dentist') {
  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok', user: { id: '1', email: 'demo@nexor.dev' } },
  });

  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider theme={lightTheme}>
        <Avaliacoes />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Avaliações', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
  });

  it('renders the dentist review dashboard with submitted feedback templates', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-009',
            status: 'follow_up',
            statusLabel: 'Em acompanhamento',
            stage: 'follow_up',
            created_at: '2026-05-03T14:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'atleta.demo@nexor.dev', phone: null },
            dentist: { full_name: 'Dra. Helena Licenciada', email: 'dentista@nexor.dev' },
          },
          {
            id: 'BP-DEMO-016',
            status: 'awaiting_lab_start',
            statusLabel: 'Aguardando inicio',
            stage: 'awaiting_lab_start',
            created_at: '2026-05-05T15:00:00.000Z',
            customer: { full_name: 'Camila Boxe', email: 'camila@nexor.dev', phone: null },
            dentist: { full_name: 'Dra. Helena Licenciada', email: 'dentista@nexor.dev' },
          },
        ],
      })
      .mockResolvedValueOnce({
        forms: [
          {
            id: 'review-customer-dentist',
            orderId: 'BP-DEMO-009',
            templateKey: 'dentist_review_by_customer',
            stepKey: 'post_adaptation_feedback',
            status: 'submitted',
            canViewPayload: true,
            summary: { scoreAverage: 9, hasComment: true, responseCount: 1, submittedAt: '2026-05-05T09:00:00.000Z' },
            releasedAt: '2026-05-04T15:00:00.000Z',
            submittedAt: '2026-05-05T09:00:00.000Z',
            payload: {
              contactEase: 9,
              consultationLeadTime: 8,
              punctuality: 9,
              officeFacilities: 8,
              courtesy: 10,
              deviceUseAndAdjustmentGuidance: 8,
              comment: 'Atendimento claro, pontual e com boa orientacao.',
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        forms: [
          {
            id: 'review-dentist-lab',
            orderId: 'BP-DEMO-016',
            templateKey: 'lab_review_by_dentist',
            stepKey: 'lab_cycle_feedback_from_dentist',
            status: 'submitted',
            canViewPayload: true,
            summary: { scoreAverage: 9, hasComment: true, responseCount: 1, submittedAt: '2026-05-06T10:00:00.000Z' },
            releasedAt: '2026-05-06T09:00:00.000Z',
            submittedAt: '2026-05-06T10:00:00.000Z',
            payload: {
              deliveryLeadTime: 8,
              rawDeviceQuality: 9,
              contactEase: 9,
              comment: 'Laboratório respondeu rápido e entregou bom acabamento.',
            },
          },
        ],
      });

    renderPage();

    expect(await screen.findByRole('heading', { name: /avaliações do dentista/i })).toBeInTheDocument();
    expect(screen.getAllByText(/cliente avaliando dentista/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/dentista avaliando laboratório/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/atendimento claro, pontual/i)).toBeInTheDocument();
    expect(screen.getByText(/laboratório respondeu rápido/i)).toBeInTheDocument();
    expect(screen.getByText(/templates ativos/i)).toBeInTheDocument();
  });

  it('uses partner-specific feedback templates', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-014',
            status: 'appointment_confirmed',
            statusLabel: 'Consulta confirmada',
            stage: 'consultation_confirmed',
            created_at: '2026-05-05T11:30:00.000Z',
            customer: { full_name: 'Renata Crossfit', email: 'renata@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({
        forms: [
          {
            id: 'review-partner',
            orderId: 'BP-DEMO-014',
            templateKey: 'partner_review_by_customer',
            stepKey: 'partner_review_by_customer',
            status: 'submitted',
            canViewPayload: true,
            summary: { scoreAverage: 9, hasComment: true, responseCount: 1, submittedAt: '2026-05-08T15:00:00.000Z' },
            releasedAt: '2026-05-08T14:40:00.000Z',
            submittedAt: '2026-05-08T15:00:00.000Z',
            payload: {
              facilities: 8,
              courtesy: 9,
              followUpAvailability: 10,
              technicalGuidance: 9,
              comment: 'Parceiro explicou bem o fluxo.',
            },
          },
        ],
      });

    renderPage('/painel/biteplaner/avaliacoes?mode=partner');

    expect(await screen.findByRole('heading', { name: /avaliações do parceiro/i })).toBeInTheDocument();
    expect(screen.getAllByText(/cliente avaliando parceiro/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/parceiro explicou bem o fluxo/i)).toBeInTheDocument();
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/v1/orders?as=partner', 'tok'));
  });

  it('opens a pending customer survey, validates required fields and submits it', async () => {
    const user = userEvent.setup();

    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-006',
            status: 'awaiting_adaptation',
            statusLabel: 'Aguardando adaptação',
            stage: 'awaiting_adaptation',
            created_at: '2026-05-04T10:00:00.000Z',
            customer: { full_name: 'Marina Costa', email: 'marina@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({
        forms: [
          {
            id: 'review-partner-pending',
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

    mockApiPost.mockResolvedValueOnce({
      id: 'review-partner-pending',
      orderId: 'BP-DEMO-006',
      templateKey: 'partner_review_by_customer',
      stepKey: 'partner_review_by_customer',
      status: 'submitted',
      canViewPayload: true,
      summary: { scoreAverage: 4.67, hasComment: true, responseCount: 1, submittedAt: '2026-05-04T12:10:00.000Z' },
      releasedAt: '2026-05-04T12:00:00.000Z',
      submittedAt: '2026-05-04T12:10:00.000Z',
      payload: {
        courtesy: 5,
        followUpAvailability: 4,
        technicalGuidance: 5,
        comment: 'Cadastro por link bem orientado.',
      },
    });

    renderPage('/painel/biteplaner/avaliacoes?mode=user');

    expect(await screen.findByRole('heading', { name: /avaliações enviadas pelo cliente/i })).toBeInTheDocument();
    expect(screen.getByText(/cadastro via link de recomendação do parceiro/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /responder/i }));
    expect(screen.getByText(/nota de 1 a 5 estrelas/i)).toBeInTheDocument();
    expect(
      within(screen.getByRole('radiogroup', { name: /gentileza no atendimento/i })).queryByRole('radio', {
        name: /0 sem estrelas/i,
      })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /enviar survey/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/gentileza no atendimento/i);

    await user.click(within(screen.getByRole('radiogroup', { name: /gentileza no atendimento/i })).getByRole('radio', { name: /5 estrelas/i }));
    await user.click(
      within(screen.getByRole('radiogroup', { name: /disponibilidade, presença e atenção/i })).getByRole('radio', {
        name: /4 estrelas/i,
      })
    );
    await user.click(
      within(screen.getByRole('radiogroup', { name: /qualidade técnica no direcionamento/i })).getByRole('radio', {
        name: /5 estrelas/i,
      })
    );
    await user.type(screen.getByRole('textbox'), 'Cadastro por link bem orientado.');
    await user.click(screen.getByRole('button', { name: /enviar survey/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-006/workflow-forms/review-partner-pending/submit',
        {
          payload: {
            courtesy: 5,
            followUpAvailability: 4,
            technicalGuidance: 5,
            comment: 'Cadastro por link bem orientado.',
          },
        },
        'tok'
      )
    );
    expect(await screen.findByText(/cadastro por link bem orientado/i)).toBeInTheDocument();
  });
});
