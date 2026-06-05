import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { createTestQueryClient, TestQueryClientProvider } from '../../../test/renderWithQueryClient';

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
        <TestQueryClientProvider>
          <PreRequisito />
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
          <PreRequisito />
        </QueryClientProvider>
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
    payload: status === 'submitted' ? { customer: { fullName: 'Joao Demo', clinicalPrivacyConsent: ['accepted'] } } : {},
  };
}

function sharedIntakeWithClinicalPayload(payload: Record<string, unknown>) {
  return {
    ...sharedIntake(),
    payload: {
      customer: payload,
    },
  };
}

function getDropdown(label: RegExp) {
  const trigger = screen
    .getAllByLabelText(label)
    .find((element) => element.getAttribute('aria-haspopup') === 'listbox');
  if (!trigger) {
    throw new Error(`Dropdown not found for ${String(label)}`);
  }

  return trigger;
}

function findDropdown(label: RegExp) {
  return waitFor(() => getDropdown(label));
}

function findField(label: RegExp) {
  return screen.findByLabelText(label, { selector: 'input, textarea' });
}

function completeClinicalSectionPayload(overrides: Record<string, unknown> = {}) {
  return {
    orthodonticTreatmentStatus: 'none',
    fullName: 'Joao Demo',
    phone: '11999999999',
    needsAdaptedClinic: 'no',
    hasRelevantMedicalDiagnosis: 'no',
    currentMedicationUse: 'no',
    longTermPainOrSleepMedicationUse: 'no',
    headNeckSpineSurgeryHistory: 'no',
    faceJawTraumaHistory: 'no',
    headNeckSpineAccidentHistory: 'no',
    sleepQualityScore: '8',
    hasTmdDiagnosis: 'no',
    orofacialSymptomsHistory: ['none'],
    atmJointSymptoms: ['none'],
    awakeParafunctionalHabits: ['none'],
    previousOrofacialTreatments: ['none'],
    orthodonticApplianceHistory: 'never',
    dentalProsthesisTypes: ['none'],
    regularDentistVisit: 'no',
    hasCurrentPain: 'no',
    nicotineUse: 'none',
    alcoholPattern: 'none',
    usesCaffeineStimulants: 'no',
    stressLevel: '4',
    averageSleepHours: '8',
    subjectiveSleepQuality: '8',
    workPosture: 'mixed',
    ...overrides,
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
    expect(screen.getByTestId('pre-requisito-onboarding-card')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /visão geral dos steps/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('step-breadcrumb-current')).not.toBeInTheDocument();
    expect(screen.getByTestId('athlete-order-status')).toHaveTextContent(/pre-requisito pendente/i);
    expect(screen.queryByTestId('athlete-order-card')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ver jornada/i })).not.toBeInTheDocument();
  });

  it('renders the clinical form from the DOCX with the same stepped intake experience without duplicate privacy consent', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    expect(await screen.findByRole('heading', { name: /pre-requisito biteplaner/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('pre-requisito-onboarding-card')).toBeInTheDocument());

    expect(await screen.findByRole('heading', { name: /dados iniciais/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/declaro que li e entendi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/a nexor desenvolve pesquisas científicas/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /1 política de privacidade/i })).not.toBeInTheDocument();
    const progressCard = await screen.findByRole('region', { name: /seu progresso/i });
    expect(progressCard.querySelector('[aria-current="step"]')).toHaveTextContent(/dados iniciais/i);
    expect(within(progressCard).queryByRole('button')).not.toBeInTheDocument();
    expect(within(progressCard).getByText(/dados clínicos/i)).toBeInTheDocument();
    expect(within(progressCard).getByText(/pesquisa de satisfação/i)).toBeInTheDocument();
    expect(within(progressCard).queryByText(/experiência com o dispositivo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/questionario odontológico/i)).not.toBeInTheDocument();
  });

  it('keeps the visual progress card non-clickable', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    const progressCard = await screen.findByRole('region', { name: /seu progresso/i });

    expect(progressCard).toHaveTextContent(/dados iniciais/i);
    expect(progressCard).toHaveTextContent(/dados clínicos/i);
    expect(progressCard).toHaveTextContent(/pesquisa de satisfação/i);
    expect(progressCard).not.toHaveTextContent(/experiência com o dispositivo/i);
    expect(within(progressCard).queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows only the completed message when the prerequisite intake was already submitted', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder('awaiting_scheduling')] })
      .mockResolvedValueOnce({ forms: [sharedIntake('submitted')] });

    renderPage();

    expect(await screen.findByText(/preencheu este formulário/i)).toBeInTheDocument();
    expect(screen.queryByTestId('workflow-forms-panel')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /enviar formulário/i })).not.toBeInTheDocument();
  });

  it('keeps the prerequisite customer flow with three visual steps and moves satisfaction checkboxes into the third step', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/components/WorkflowFormsPanel.tsx'), 'utf8');

    expect(source).toContain('const satisfactionCheckboxFields');
    expect(source).toContain("field.type === 'checkbox-group'");
    expect(source).toContain('fields: [...deviceExperienceSection.fields, ...satisfactionCheckboxFields]');
    expect(source).toContain("title: 'Pesquisa de satisfação'");
    expect(source).not.toContain("'clinical-satisfaction'");
  });

  it('does not call the legacy prerequisite-completed endpoint after the workflow intake submission', () => {
    const pageSource = readFileSync(join(process.cwd(), 'src/pages/painel/PreRequisito/index.tsx'), 'utf8');
    const flowSource = readFileSync(join(process.cwd(), 'src/pages/painel/components/WorkflowFormsPanel.tsx'), 'utf8');

    expect(pageSource).not.toContain('completePrerequisite');
    expect(pageSource).not.toContain('prerequisite-completed');
    expect(flowSource).toContain('submitWorkflowForm(form.orderId, form.id, payloadToSubmit, token)');
  });

  it('does not allow resubmitting a customer intake that is already submitted', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/components/WorkflowFormsPanel.tsx'), 'utf8');

    expect(source).toContain("roleState.customer === 'pending'");
    expect(source).toContain("form.status !== 'submitted'");
    expect(source).toContain('submitError instanceof ApiError && submitError.status === 409');
  });

  it('keeps the shared intake progress card compact enough for four steps', () => {
    const styles = readFileSync(join(process.cwd(), 'src/pages/painel/components/WorkflowFormsPanel.styles.ts'), 'utf8');
    const onboardingRailStart = styles.indexOf('export const OnboardingProgressRail');
    const onboardingStepStart = styles.indexOf('export const OnboardingProgressStep', onboardingRailStart);
    const onboardingRailStyles = styles.slice(onboardingRailStart, onboardingStepStart);
    const stepRailStart = styles.indexOf('export const StepRail');
    const stepTabStart = styles.indexOf('export const StepTab =', stepRailStart);
    const stepRailStyles = styles.slice(stepRailStart, stepTabStart);
    const stepTabStyles = styles.slice(stepTabStart, styles.indexOf('export const StepNumber', stepTabStart));

    expect(onboardingRailStyles).toContain('grid-auto-flow: column;');
    expect(onboardingRailStyles).toContain('grid-auto-columns: minmax(104px, 1fr);');
    expect(onboardingRailStyles).toContain('overflow-x: auto;');
    expect(onboardingRailStyles).not.toContain('grid-template-columns: 1fr;');
    expect(stepRailStyles).toContain('minmax(min(100%, 92px), 1fr)');
    expect(stepRailStyles).toContain('gap: 8px;');
    expect(stepTabStyles).toContain('min-height: 48px;');
    expect(stepTabStyles).toContain('padding: 9px 10px;');
  });

  it('starts the prerequisite form on initial data because Biteplaner consent was already collected', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    expect(await findDropdown(/está em tratamento ortodôntico/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/declaro que li e entendi/i)).not.toBeInTheDocument();
  });

  it('keeps the local draft when the auth token refreshes after returning to the tab', async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();
    let accessToken = 'tok';
    mockUseAuth.mockImplementation(() => ({
      loading: false,
      session: { access_token: accessToken, user: { id: '1', email: 'demo@nexor.dev' } },
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
    }));
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=user') {
        return Promise.resolve({ orders: [demoOrder()] });
      }

      if (path === '/v1/orders/BP-DEMO-001/workflow-forms') {
        return Promise.resolve({ forms: [{ ...sharedIntake(), payload: { customer: {} } }] });
      }

      return Promise.resolve({});
    });

    const view = renderPageWithQueryClient(queryClient);
    const orthodonticSelect = await findDropdown(/está em tratamento ortodôntico/i);
    await user.click(orthodonticSelect);
    await user.click(await screen.findByRole('option', { name: /^não$/i }));
    const fullNameInput = await findField(/nome completo/i);
    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'Maria Digitando');

    accessToken = 'tok-refreshed';
    view.rerender(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <QueryClientProvider client={queryClient}>
            <PreRequisito />
          </QueryClientProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
    expect(getDropdown(/está em tratamento ortodôntico/i)).toHaveTextContent(/^Não$/);
    expect(await findField(/nome completo/i)).toHaveValue('Maria Digitando');
  });

  it('requires a visible conditional clinical field before advancing from clinical data', async () => {
    const user = userEvent.setup();
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({
        forms: [
          sharedIntakeWithClinicalPayload(
            completeClinicalSectionPayload({
              hasRelevantMedicalDiagnosis: 'yes',
              relevantMedicalDiagnosisDetails: '',
            })
          ),
        ],
      });

    renderPage();

    await user.click(await screen.findByRole('button', { name: /próxima etapa/i }));

    expect(await findField(/quais diagnósticos ou condições/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próxima etapa/i })).toBeDisabled();
  });

  it('maps 0 to 10 health scores to accessible slider fields with endpoint descriptions', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/components/WorkflowFormsPanel.tsx'), 'utf8');

    expect(source).toContain('SliderField');
    [
      'sleepQualityScore',
      'previousTreatmentSatisfactionDental',
      'previousTreatmentSatisfactionTherapies',
      'stressLevel',
      'subjectiveSleepQuality',
    ].forEach((fieldKey) => {
      expect(source).toContain(`'${fieldKey}'`);
    });
    expect(source).toContain('minLabel="Pior caso"');
    expect(source).toContain('maxLabel="Melhor caso"');
  });
});
