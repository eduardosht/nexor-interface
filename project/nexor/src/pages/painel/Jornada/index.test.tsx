import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
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

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="consultation-map">{children}</div>,
  TileLayer: () => <div data-testid="consultation-tiles" />,
  Marker: ({
    children,
    eventHandlers,
  }: {
    children?: React.ReactNode;
    eventHandlers?: { click?: () => void };
  }) => (
    <button type="button" data-testid="consultation-marker" onClick={() => eventHandlers?.click?.()}>
      {children}
    </button>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
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
        <CurrentPath />
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
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-journey-steps')).toBeInTheDocument());
    expect(screen.getByRole('heading', { level: 1, name: /fluxo visual da jornada/i })).toBeInTheDocument();
    expect(screen.getByText(/jornada bp-demo-006/i)).toBeInTheDocument();
    expect(screen.queryByTestId('athlete-order-card')).not.toBeInTheDocument();
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

  it('shows only the clinical intake in the prerequisite step after onboarding is complete', async () => {
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
            id: 'BP-WF-001-ONBOARDING',
            orderId: 'BP-DEMO-001',
            templateKey: 'customer_new_user_onboarding',
            stepKey: 'new_user_onboarding',
            status: 'submitted',
            canViewPayload: true,
            summary: { title: 'Cadastro de novos usuários Biteplaner' },
            releasedAt: '2026-05-01T10:00:00.000Z',
            submittedAt: '2026-05-01T10:04:00.000Z',
            payload: { fullName: 'Joao Demo' },
          },
          {
            id: 'BP-WF-001-INTAKE',
            orderId: 'BP-DEMO-001',
            templateKey: 'customer_pre_consultation_intake',
            stepKey: 'pre_requisite_pending',
            status: 'pending',
            roleState: { customer: 'pending', dentist: 'locked' },
            customerSubmittedAt: null,
            dentistReviewStartedAt: null,
            dentistSubmittedAt: null,
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-01T10:05:00.000Z',
            submittedAt: null,
            payload: null,
          },
        ],
      });

    renderPage();

    const prerequisiteForms = await screen.findByTestId('journey-step-forms-prerequisite');
    expect(within(prerequisiteForms).getByText(/pré-requisito clínico biteplaner/i)).toBeInTheDocument();
    expect(within(prerequisiteForms).getByRole('button', { name: /continuar/i })).toBeInTheDocument();
    expect(within(prerequisiteForms).queryByText(/cadastro de novos usu.rios biteplaner/i)).not.toBeInTheDocument();
    expect(within(prerequisiteForms).queryByText(/este cadastro . seu primeiro passo/i)).not.toBeInTheDocument();
  });

  it('shows clinical detail inputs only after their yes/no question is answered yes', async () => {
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
            customerSubmittedAt: null,
            dentistReviewStartedAt: null,
            dentistSubmittedAt: null,
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-01T10:05:00.000Z',
            submittedAt: null,
            payload: null,
          },
        ],
      });

    renderPage();

    const prerequisiteForms = await screen.findByTestId('journey-step-forms-prerequisite');
    fireEvent.click(within(prerequisiteForms).getByLabelText(/pol.*tica de privacidade/i));
    fireEvent.click(within(prerequisiteForms).getByRole('button', { name: /continuar/i }));
    fireEvent.click(within(prerequisiteForms).getByRole('button', { name: /dados cl.*nicos/i }));

    const detailLabels = [
      /quais diagn.*sticos ou condi/i,
      /quais medicamentos, dosagens/i,
      /especifique quais, dose/i,
      /qual cirurgia e quando/i,
      /descreva o trauma em face\/mand.*bula/i,
      /descreva o acidente com impacto/i,
    ];

    detailLabels.forEach((label) => {
      expect(within(prerequisiteForms).queryByLabelText(label)).not.toBeInTheDocument();
    });

    detailLabels.forEach((label, index) => {
      fireEvent.click(within(prerequisiteForms).getAllByLabelText(/^Sim$/i)[index]);
      expect(within(prerequisiteForms).getByLabelText(detailLabels[index])).toBeInTheDocument();

      fireEvent.click(within(prerequisiteForms).getAllByLabelText(/^N.o$/i)[index]);
      expect(within(prerequisiteForms).queryByLabelText(label)).not.toBeInTheDocument();
    });
  }, 10000);

  it('shows orofacial and pain details only when their parent question allows it', async () => {
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
            customerSubmittedAt: null,
            dentistReviewStartedAt: null,
            dentistSubmittedAt: null,
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-01T10:05:00.000Z',
            submittedAt: null,
            payload: null,
          },
        ],
      });

    renderPage();

    const prerequisiteForms = await screen.findByTestId('journey-step-forms-prerequisite');
    fireEvent.click(within(prerequisiteForms).getByLabelText(/pol.*tica de privacidade/i));
    fireEvent.click(within(prerequisiteForms).getByRole('button', { name: /continuar/i }));
    fireEvent.click(within(prerequisiteForms).getByRole('button', { name: /dados cl.*nicos/i }));

    expect(within(prerequisiteForms).queryByLabelText(/ano do primeiro diagn.*stico/i)).not.toBeInTheDocument();
    expect(within(prerequisiteForms).queryByLabelText(/cite a cidade\/bairro/i)).not.toBeInTheDocument();

    const tmdQuestion = within(prerequisiteForms).getByRole('group', { name: /diagn.*stico de dtm/i });
    fireEvent.click(within(tmdQuestion).getByLabelText(/^Sim$/i));
    expect(within(prerequisiteForms).getByLabelText(/ano do primeiro diagn.*stico/i)).toBeInTheDocument();
    fireEvent.click(within(tmdQuestion).getByLabelText(/^N.o$/i));
    expect(within(prerequisiteForms).queryByLabelText(/ano do primeiro diagn.*stico/i)).not.toBeInTheDocument();

    const dentistQuestion = within(prerequisiteForms).getByRole('group', { name: /frequenta regularmente algum dentista/i });
    fireEvent.click(within(dentistQuestion).getByLabelText(/^Sim$/i));
    expect(within(prerequisiteForms).getByLabelText(/cite a cidade\/bairro/i)).toBeInTheDocument();
    fireEvent.click(within(dentistQuestion).getByLabelText(/^N.o$/i));
    expect(within(prerequisiteForms).queryByLabelText(/cite a cidade\/bairro/i)).not.toBeInTheDocument();

    [
      /j.* teve ou tem algum destes sinais\/sintomas/i,
      /sintomas articulares espec.*ficos de atm/i,
      /h.*bitos parafuncionais acordado/i,
      /tratamentos odontol.*gicos pr.*vios relacionados/i,
    ].forEach((groupLabel) => {
      const checkboxGroup = within(prerequisiteForms).getByRole('group', { name: groupLabel });
      expect(within(checkboxGroup).getAllByRole('checkbox')[0]).toHaveAccessibleName('Nenhuma');
    });

    const currentPainQuestion = within(prerequisiteForms).getByRole('group', { name: /presen.*a de dor atualmente/i });
    fireEvent.click(within(currentPainQuestion).getByLabelText(/^N.o$/i));

    [
      /localiza.*o da dor/i,
      /padr.*o da dor/i,
      /dor m.*dia na .*ltima semana/i,
      /fatores que pioram a dor/i,
      /quanto a dor\/desconforto/i,
      /quantos treinos estima ter perdido por dor/i,
    ].forEach((label) => {
      expect(within(prerequisiteForms).queryByText(label)).not.toBeInTheDocument();
    });

    fireEvent.click(within(currentPainQuestion).getByLabelText(/^Sim$/i));
    expect(within(prerequisiteForms).getByText(/localiza.*o da dor/i)).toBeInTheDocument();
    expect(within(prerequisiteForms).getByLabelText(/padr.*o da dor/i)).toBeInTheDocument();
  }, 10000);

  it('updates sleep bruxism fields and stops initial data when orthodontic treatment is active', async () => {
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
            customerSubmittedAt: null,
            dentistReviewStartedAt: null,
            dentistSubmittedAt: null,
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-01T10:05:00.000Z',
            submittedAt: null,
            payload: null,
          },
        ],
      });

    renderPage();

    const prerequisiteForms = await screen.findByTestId('journey-step-forms-prerequisite');
    fireEvent.click(within(prerequisiteForms).getByLabelText(/pol.*tica de privacidade/i));
    fireEvent.click(within(prerequisiteForms).getByRole('button', { name: /continuar/i }));

    fireEvent.click(within(prerequisiteForms).getByRole('button', { name: /dados cl.*nicos/i }));

    expect(within(prerequisiteForms).getByRole('group', { name: /^dist.*rbios do sono relatados$/i })).toBeInTheDocument();
    expect(within(prerequisiteForms).queryByText(/bruxismo do sono com diagn.*stico confirmado/i)).not.toBeInTheDocument();

    const sleepBruxismQuestion = within(prerequisiteForms).getByRole('group', {
      name: /ranger ou apertar os dentes dormindo/i,
    });
    expect(within(sleepBruxismQuestion).getByLabelText(/^N.o$/i)).toBeInTheDocument();
    expect(within(sleepBruxismQuestion).getByLabelText(/suspeito/i)).toBeInTheDocument();
    expect(within(sleepBruxismQuestion).getByLabelText(/diagn.*stico confirmado/i)).toBeInTheDocument();

    fireEvent.click(within(prerequisiteForms).getByRole('button', { name: /dados iniciais/i }));

    const orthodonticSelect = within(prerequisiteForms).getByLabelText(/est.* em tratamento ortod.*ntico/i);
    expect(orthodonticSelect).toBeInTheDocument();
    expect(within(prerequisiteForms).queryByLabelText(/nome completo/i)).not.toBeInTheDocument();
    expect(within(prerequisiteForms).queryByLabelText(/telefone/i)).not.toBeInTheDocument();

    fireEvent.click(orthodonticSelect);
    fireEvent.click(await screen.findByRole('option', { name: /sim, ainda em tratamento ativo/i }));

    expect(
      within(prerequisiteForms).getByText(
        /n.o . poss.vel continuar o processo antes de encerramento da fase ativa do tratamento ortod.ntico/i
      )
    ).toBeInTheDocument();
    expect(within(prerequisiteForms).getByLabelText(/tristeza/i)).toBeInTheDocument();
    expect(within(prerequisiteForms).queryByText(/necessita de atendimento em cl.*nica adaptada/i)).not.toBeInTheDocument();
    expect(within(prerequisiteForms).queryByLabelText(/nome completo/i)).not.toBeInTheDocument();
    expect(within(prerequisiteForms).queryByRole('button', { name: /pr.*xima etapa/i })).not.toBeInTheDocument();
  }, 10000);

  it('reveals the initial data fields after a non-blocking orthodontic answer', async () => {
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
            customerSubmittedAt: null,
            dentistReviewStartedAt: null,
            dentistSubmittedAt: null,
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-01T10:05:00.000Z',
            submittedAt: null,
            payload: null,
          },
        ],
      });

    renderPage();

    const prerequisiteForms = await screen.findByTestId('journey-step-forms-prerequisite');
    fireEvent.click(within(prerequisiteForms).getByLabelText(/pol.*tica de privacidade/i));
    fireEvent.click(within(prerequisiteForms).getByRole('button', { name: /continuar/i }));
    fireEvent.click(within(prerequisiteForms).getByRole('button', { name: /dados iniciais/i }));

    expect(within(prerequisiteForms).queryByRole('button', { name: /voltar etapa/i })).not.toBeInTheDocument();
    expect(within(prerequisiteForms).queryByLabelText(/nome completo/i)).not.toBeInTheDocument();

    fireEvent.click(within(prerequisiteForms).getByLabelText(/est.* em tratamento ortod.*ntico/i));
    fireEvent.click(await screen.findByRole('option', { name: /^n.o$/i }));

    expect(within(prerequisiteForms).getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(within(prerequisiteForms).getByLabelText(/telefone/i)).toBeInTheDocument();
    expect(within(prerequisiteForms).getByText(/necessita de atendimento em cl.*nica adaptada/i)).toBeInTheDocument();
  }, 10000);

  it('uses conditional stimulant and device other detail fields', async () => {
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
            customerSubmittedAt: null,
            dentistReviewStartedAt: null,
            dentistSubmittedAt: null,
            canViewPayload: true,
            summary: null,
            releasedAt: '2026-05-01T10:05:00.000Z',
            submittedAt: null,
            payload: null,
          },
        ],
      });

    renderPage();

    const prerequisiteForms = await screen.findByTestId('journey-step-forms-prerequisite');
    fireEvent.click(within(prerequisiteForms).getByLabelText(/pol.*tica de privacidade/i));
    fireEvent.click(within(prerequisiteForms).getByRole('button', { name: /continuar/i }));
    fireEvent.click(within(prerequisiteForms).getByRole('button', { name: /dados cl.*nicos/i }));

    expect(within(prerequisiteForms).getByText(/grau de satisfa.*o com tratamento odontol.*gico anterior/i)).toBeInTheDocument();
    expect(
      within(prerequisiteForms).queryByText(/grau de satisfa.*o com tratamento odontol.*gico anterior.*\(\*\)/i)
    ).not.toBeInTheDocument();
    expect(within(prerequisiteForms).queryByLabelText(/dose di.*ria e hor.*rio de maior consumo/i)).not.toBeInTheDocument();

    const caffeineQuestion = within(prerequisiteForms).getByRole('group', { name: /utiliza cafe.*na\/estimulantes/i });
    fireEvent.click(within(caffeineQuestion).getByLabelText(/^Sim$/i));
    expect(within(prerequisiteForms).getByLabelText(/dose di.*ria e hor.*rio de maior consumo/i)).toBeInTheDocument();
    fireEvent.click(within(caffeineQuestion).getByLabelText(/^N.o$/i));
    expect(within(prerequisiteForms).queryByLabelText(/dose di.*ria e hor.*rio de maior consumo/i)).not.toBeInTheDocument();

    fireEvent.click(within(prerequisiteForms).getByRole('button', { name: /experi.*ncia com o dispositivo/i }));

    const expectedBenefitGroup = within(prerequisiteForms).getByRole('group', {
      name: /expectativa com o uso de um dispositivo bucal/i,
    });
    const expectedBenefitOther = within(expectedBenefitGroup).getByRole('checkbox', { name: /^outros$/i });
    fireEvent.click(expectedBenefitOther);
    const expectedBenefitOtherInput = within(prerequisiteForms).getByLabelText(/descreva outros benef.*cios esperados/i);
    expect(expectedBenefitOtherInput).toBeRequired();
    fireEvent.blur(expectedBenefitOtherInput);
    expect(await within(prerequisiteForms).findByText('Campo obrigatório')).toBeInTheDocument();

    const barrierGroup = within(prerequisiteForms).getByRole('group', {
      name: /barreiras imaginadas ao uso de um dispositivo bucal/i,
    });
    fireEvent.click(within(barrierGroup).getByRole('checkbox', { name: /^outros$/i }));
    expect(within(prerequisiteForms).getByLabelText(/descreva outras barreiras imaginadas/i)).toBeRequired();
  }, 10000);

  it('keeps journey steps informational and renders consultation content directly', async () => {
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
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('journey-consultation-content')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /abrir consulta inicial/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('consultation-map')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /consulta agendada/i })).toBeInTheDocument();
    expect(screen.getByTestId('journey-step-prerequisite').closest('a')).toBeNull();
    expect(screen.getByTestId('journey-step-consultation').closest('a')).toBeNull();
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/concluído com sucesso/i);
    expect(getComputedStyle(screen.getByTestId('journey-step-prerequisite')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(screen.getByTestId('journey-step-prerequisite')).borderTopStyle).toBe('');
    expect(screen.getByText(/^2$/)).toBeInTheDocument();
    expect(screen.queryByText(/step 2/i)).not.toBeInTheDocument();
  });

  it('keeps dentist referral links with icons below an editable message in the consultation step', async () => {
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
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('journey-consultation-content')).toBeInTheDocument());
    const messageField = screen.getByRole('textbox', { name: /mensagem para o dentista/i });
    const whatsappLink = screen.getByRole('link', { name: /enviar por whatsapp/i });
    const emailLink = screen.getByRole('link', { name: /enviar por e-mail/i });

    expect((messageField as HTMLTextAreaElement).value).toEqual(expect.stringContaining('Estou usando o Biteplaner'));
    expect(within(whatsappLink).getByTestId('referral-whatsapp-icon')).toBeInTheDocument();
    expect(within(emailLink).getByTestId('referral-email-icon')).toBeInTheDocument();
    expect(messageField.compareDocumentPosition(whatsappLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(messageField.compareDocumentPosition(emailLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.change(messageField, {
      target: { value: 'Oi, doutora. Quero te mostrar o Biteplaner.' },
    });

    expect(whatsappLink).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent('Oi, doutora. Quero te mostrar o Biteplaner.'))
    );
    expect(emailLink).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent('Oi, doutora. Quero te mostrar o Biteplaner.'))
    );
  });

  it('renders purchase content directly in the journey', async () => {
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
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-journey-steps')).toBeInTheDocument());
    expect(screen.getByText(/^4$/)).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /compra/i }).length).toBeGreaterThan(0);
    expect(screen.getByTestId('journey-purchase-content')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /abrir compra mock/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmar compra mock/i })).toBeInTheDocument();
    expect(screen.getByText(/biteplaner personalizado/i)).toBeInTheDocument();
    expect(screen.queryByText(/dentista selecionado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/histórico resumido/i)).not.toBeInTheDocument();
  });

  it('shows the training report only in the follow-up stage', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-FOLLOW-UP',
            status: 'follow_up',
            statusLabel: 'Em acompanhamento',
            stage: 'follow_up',
            created_at: '2026-05-02T10:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({
        forms: [
          {
            id: 'BP-WF-TRAINING-001',
            orderId: 'BP-DEMO-FOLLOW-UP',
            templateKey: 'customer_training_report',
            stepKey: 'post_adaptation_feedback',
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

    expect(await screen.findByText(/relat.*rio de treino\/competi/i)).toBeInTheDocument();
    expect(screen.getByTestId('journey-step-forms-follow_up')).toBeInTheDocument();
    expect(screen.getByLabelText(/data da atividade/i)).toBeInTheDocument();
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
            practice_location: { id: 'clinic-1', name: 'Clínica Sorrisó Centro' },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    await waitFor(() => expect(screen.getAllByText(/bp-demo-001/i).length).toBeGreaterThan(0));
    expect(screen.getByTestId('journey-step-prerequisite')).toHaveTextContent(/etapa atual/i);
    expect(screen.queryByText(/bp-demo-003/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver formulários/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/formulários e feedbacks da etapa atual/i)).not.toBeInTheDocument();
  });

  it('shows a problem message and contact form when the dentist marks the order as ineligible', async () => {
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
    expect(problem).toHaveTextContent(/decisão clínica/i);
    expect(problem).toHaveTextContent(/o dentista responsável registrou/i);
    await waitFor(() => expect(screen.getByLabelText(/nome/i)).toHaveValue('Marina Lutadora'));
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('marina.demo@nexor.dev');
    expect(screen.getByLabelText(/assunto/i)).toHaveValue('Erro ordem BP-DEMO-010 - ');
    expect((screen.getByLabelText(/mensagem/i) as HTMLTextAreaElement).value).toContain('Decisão clínica');
    expect(screen.getByRole('link', { name: /enviar e-mail para a nexor/i })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:contato@necoradvance.com.br')
    );
    expect(screen.queryByTestId('journey-purchase-content')).not.toBeInTheDocument();
  });

  it('shows a cancelled order problem with the cancellation stage and prefilled contact subject', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            id: 'BP-DEMO-011',
            status: 'cancelled',
            statusLabel: 'Cancelado',
            stage: 'cancelled',
            created_at: '2026-05-04T11:00:00.000Z',
            customer: { full_name: 'Joao Demo', email: 'atleta.demo@nexor.dev', phone: null },
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [] });

    renderPage();

    const problem = await screen.findByTestId('journey-order-problem');
    expect(problem).toHaveTextContent(/ordem cancelada/i);
    expect(problem).toHaveTextContent(/etapa cancelado/i);
    await waitFor(() => expect(screen.getByLabelText(/assunto/i)).toHaveValue('Erro ordem BP-DEMO-011 - '));
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
