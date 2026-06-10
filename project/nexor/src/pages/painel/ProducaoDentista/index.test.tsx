import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { createTestQueryClient, TestQueryClientProvider } from '../../../test/renderWithQueryClient';
import { SHARED_INITIAL_EVALUATION_INTAKE } from '../components/sharedIntakeDefinition';
import { getWorkflowFormDictionary } from '../components/workflowFormFieldDictionary';

const { mockUseAuth, mockApiGet, mockApiPost } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
}));

function readSourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return readSourceFiles(path);
    }

    return /\.(ts|tsx)$/.test(entry) ? [readFileSync(path, 'utf8')] : [];
  });
}

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
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="lab-map">{children}</div>,
  TileLayer: () => <div data-testid="lab-tiles" />,
  useMap: () => ({
    fitBounds: vi.fn(),
    setView: vi.fn(),
  }),
  Marker: ({
    children,
    eventHandlers,
  }: {
    children?: React.ReactNode;
    eventHandlers?: { click?: () => void };
  }) => (
    <button type="button" data-testid="lab-marker" onClick={() => eventHandlers?.click?.()}>
      {children}
    </button>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

import { ProducaoDentista } from './index';

class MockPdfWorker {
  static instances: MockPdfWorker[] = [];

  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();

  constructor() {
    MockPdfWorker.instances.push(this);
  }

  resolvePdf() {
    const arrayBuffer = new TextEncoder().encode('pdf').buffer;
    this.onmessage?.({ data: { status: 'success', arrayBuffer } } as MessageEvent);
  }

  rejectPdf(message = 'Falha ao gerar PDF') {
    this.onmessage?.({ data: { status: 'error', message } } as MessageEvent);
  }
}

function createOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'BP-DEMO-004',
    status: 'payment_confirmed',
    statusLabel: 'Pagamento confirmado',
    stage: 'dentist_production',
    created_at: '2026-05-05T10:00:00.000Z',
    customer: { full_name: 'Carlos Demo', email: 'carlos@nexor.dev', phone: null },
    practice_location: { id: 'practice-demo-001', name: 'Clínica Esportiva Nexor' },
    productionRequestDraft: null,
    operationalReadiness: {
      preLabReady: false,
      pendingItems: ['Solicitação de produção pendente'],
      summary: 'Dentista ainda não concluiu os formulários obrigatórios.',
    },
    ...overrides,
  };
}

function sharedIntake(overrides: Record<string, unknown> = {}) {
  return {
    id: 'BP-WF-004-INTAKE',
    orderId: 'BP-DEMO-004',
    templateKey: 'customer_pre_consultation_intake',
    stepKey: 'initial_consultation_preparation',
    status: 'submitted',
    roleState: { customer: 'submitted', dentist: 'pending' },
    customerSubmittedAt: '2026-05-01T11:20:00.000Z',
    dentistReviewStartedAt: null,
    dentistSubmittedAt: null,
    canViewPayload: true,
    summary: { scoreAverage: null, hasComment: true, responseCount: 1, submittedAt: '2026-05-01T11:20:00.000Z' },
    releasedAt: '2026-05-01T11:05:00.000Z',
    submittedAt: '2026-05-01T11:20:00.000Z',
    payload: {
      customer: {
        fullName: 'Carlos Demo',
        hasRelevantMedicalDiagnosis: 'yes',
        relevantMedicalDiagnosisDetails: 'Bruxismo diagnosticado.',
        averagePainLastWeek: 6,
        sportRoutine: 'Musculação cinco vezes por semana.',
      },
    },
    ...overrides,
  };
}

function reviewedSharedIntake(overrides: Record<string, unknown> = {}) {
  return sharedIntake({
    roleState: { customer: 'locked', dentist: 'submitted' },
    dentistReviewStartedAt: '2026-05-08T12:00:00.000Z',
    dentistSubmittedAt: '2026-05-08T12:10:00.000Z',
    payload: {
      customer: {
        fullName: 'Carlos Demo',
        hasRelevantMedicalDiagnosis: 'yes',
        relevantMedicalDiagnosisDetails: 'Bruxismo diagnosticado.',
        averagePainLastWeek: 6,
        sportRoutine: 'Musculação cinco vezes por semana.',
      },
      dentist: {
        painlessMaxOpeningMm: 42,
        initialEvaluationSummary: 'Sem sinais impeditivos para seguir.',
      },
    },
    ...overrides,
  });
}

function customerOnboarding(overrides: Record<string, unknown> = {}) {
  return {
    id: 'BP-WF-004-ONBOARDING',
    orderId: 'BP-DEMO-004',
    templateKey: 'customer_new_user_onboarding',
    stepKey: 'customer_onboarding',
    status: 'submitted',
    roleState: { customer: 'submitted', dentist: 'locked' },
    customerSubmittedAt: '2026-05-01T10:20:00.000Z',
    dentistReviewStartedAt: null,
    dentistSubmittedAt: null,
    canViewPayload: true,
    summary: { scoreAverage: null, hasComment: false, responseCount: 1, submittedAt: '2026-05-01T10:20:00.000Z' },
    releasedAt: '2026-05-01T10:05:00.000Z',
    submittedAt: '2026-05-01T10:20:00.000Z',
    payload: {
      fullName: 'Carlos Demo',
      phone: '(11) 99999-9999',
      bodyMassKg: 82.4,
      heightM: 1.78,
      currentSports: ['strength_training'],
      birthDate: '1992-04-10',
    },
    ...overrides,
  };
}

function getExpectedAgeYears(birthDateValue: string) {
  const birthDate = new Date(`${birthDateValue}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return String(age);
}

function licensedLabsResponse(overrides: Array<Record<string, unknown>> = []) {
  const [first = {}] = overrides;

  return {
    labs: [
      {
        id: 'lab-role-edu',
        profileId: 'profile-lab-edu',
        labName: 'Laboratorio do Edu',
        cnpj: '27.122.387/0001-05',
        professionalSummary: 'Laboratorio do Edu com um resumo operacional',
        address: 'Rua Conselheiro Brotero - Santa Cecilia, São Paulo - SP',
        cep: '01232-011',
        phone: '(11) 1111-1111',
        serviceHours: 'Segunda a Sexta - 06h a 19h',
        city: 'São Paulo',
        state: 'SP',
        coordinates: { lat: -23.533456, lng: -46.6594115 },
        ...first,
      },
    ],
  };
}

function configureApiGet({
  order = createOrder(),
  forms = [reviewedSharedIntake()],
  orderForms = [],
  licensedLabs = licensedLabsResponse(),
}: {
  order?: ReturnType<typeof createOrder>;
  forms?: Array<Record<string, unknown>>;
  orderForms?: unknown[];
  licensedLabs?: ReturnType<typeof licensedLabsResponse>;
} = {}) {
  const configuredOrderId = String(order.id);

  mockApiGet.mockImplementation((url: string) => {
    if (url === '/v1/orders?as=dentist') {
      return Promise.resolve({ orders: [order] });
    }

    if (url === `/v1/orders/${configuredOrderId}/workflow-forms`) {
      return Promise.resolve({ forms });
    }

    if (url === `/v1/orders/${configuredOrderId}/forms`) {
      return Promise.resolve({ forms: orderForms });
    }

    if (url === '/v1/account/biteplaner/licensed-labs') {
      return Promise.resolve(licensedLabs);
    }

    return Promise.resolve({});
  });
}

function renderPage(path = '/painel/dentista/producao/BP-DEMO-004') {
  mockUseAuth.mockReturnValue({
    loading: false,
    session: { access_token: 'tok', user: { id: '1', email: 'dentista@nexor.dev' } },
    backendUser: {
      email: 'dentista@nexor.dev',
      fullName: 'Dra Maria Solicitante',
      phone: '(11) 99999-9999',
      roles: ['dentist'],
      productRoles: [
        {
          productKey: 'biteplaner',
          role: 'dentist',
          status: 'active',
          metadata: {
            fullName: 'Dra Maria Solicitante',
            croNumber: 'CRO-SP 12345',
          },
        },
      ],
    },
    backendUserResolved: true,
    hasConfiguredAuth: true,
    isMockMode: true,
    demoPersona: 'dentist',
    signIn: vi.fn(),
    signInDemo: vi.fn(),
    signOut: vi.fn(),
    sendPasswordReset: vi.fn(),
    refreshBackendUser: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider theme={lightTheme}>
        <TestQueryClientProvider>
          <Routes>
            <Route path="/painel/dentista/producao/:orderId" element={<ProducaoDentista />} />
            <Route path="/painel/biteplaner" element={<div>hub</div>} />
          </Routes>
        </TestQueryClientProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

async function goToDentistComplement() {
  for (let index = 0; index < 8 && !screen.queryByRole('button', { name: /salvar complemento do dentista/i }); index += 1) {
    fireEvent.click(await screen.findByRole('button', { name: /próxima etapa/i }));
  }

  expect(await screen.findByRole('button', { name: /salvar complemento do dentista/i })).toBeInTheDocument();
}

function getWizardNextButton() {
  return screen.getByRole('button', { name: /^pr.*ximo$/i });
}

async function clickWizardNextButton() {
  await waitFor(() => expect(getWizardNextButton()).toBeEnabled(), { timeout: 1000 });
  fireEvent.click(getWizardNextButton());
}

async function ensureAnamnesisSummaryStep() {
  if (screen.queryByTestId('dental-anamnesis-record')) {
    return;
  }

  try {
    await screen.findByTestId('dental-anamnesis-record', {}, { timeout: 250 });
    return;
  } catch {
    // The initial evaluation is still pending, so the test needs to advance from step 1.
  }

  await clickWizardNextButton();
  await screen.findByTestId('dental-anamnesis-record');
}

function getPainlessOpeningInput() {
  return screen.getAllByLabelText(/abertura m/i)[0];
}

function fillRequiredDentistComplement() {
  const consultationDateInput = screen
    .getAllByLabelText(/data da consulta/i)
    .find((element) => element instanceof HTMLInputElement);

  if (!consultationDateInput) {
    throw new Error('Consultation date input was not found.');
  }

  const eligibilityGroup = screen.getByRole('group', { name: /cliente est.*apto para uso do biteplaner/i });
  fireEvent.click(within(eligibilityGroup).getByRole('radio', { name: /sim/i }));
  fireEvent.change(consultationDateInput, { target: { value: '2026-05-12' } });
  fireEvent.change(getPainlessOpeningInput(), { target: { value: '42' } });
  fireEvent.click(
    screen.getByRole('checkbox', {
      name: /declaro que as informações acima foram coletadas através de exame clínico/i,
    })
  );
}

function renderPageWithQueryClient(queryClient: ReturnType<typeof createTestQueryClient>, path = '/painel/dentista/producao/BP-DEMO-004') {
  mockUseAuth.mockReturnValue({
    loading: false,
    session: { access_token: 'tok', user: { id: '1', email: 'dentista@nexor.dev' } },
    backendUser: {
      id: 'dentist-user-1',
      email: 'dentista@nexor.dev',
      roles: ['dentist'],
      productRoles: [{ productKey: 'biteplaner', role: 'dentist', status: 'active' }],
    },
    backendUserResolved: true,
    hasConfiguredAuth: true,
    isMockMode: true,
    demoPersona: 'dentist',
    signIn: vi.fn(),
    signInDemo: vi.fn(),
    signOut: vi.fn(),
    sendPasswordReset: vi.fn(),
    refreshBackendUser: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider theme={lightTheme}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/painel/dentista/producao/:orderId" element={<ProducaoDentista />} />
            <Route path="/painel/biteplaner" element={<div>hub</div>} />
          </Routes>
        </QueryClientProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

function getGeneratedClass(element: Element) {
  const generatedClass = Array.from(element.classList).find((className) => !className.startsWith('sc-'));

  if (!generatedClass) {
    throw new Error('Styled-components generated class was not found.');
  }

  return generatedClass;
}

async function fillProductionRequestUntilLabSelection() {
  await screen.findByTestId('athlete-order-card');
  await ensureAnamnesisSummaryStep();

  fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
    target: { value: 'Resumo clínico completo.' },
  });
  await clickWizardNextButton();

  fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
    target: { value: 'Solicitação preenchida.' },
  });

  fireEvent.change(screen.getByLabelText(/selecionar escaneamento 3d intraoral/i), {
    target: { files: [new File(['scan'], 'scan.stl', { type: 'model/stl' })] },
  });
  fireEvent.change(screen.getByLabelText(/selecionar prescrição médica assinada e carimbada/i), {
    target: { files: [new File(['prescription'], 'prescricao.pdf', { type: 'application/pdf' })] },
  });
  fireEvent.click(screen.getByRole('checkbox'));
  await clickWizardNextButton();

  fireEvent.click((await screen.findAllByRole('button', { name: /laboratorio do edu/i }))[1]);
}

describe('ProducaoDentista', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    configureApiGet();
    MockPdfWorker.instances = [];
    vi.stubGlobal('Worker', MockPdfWorker);
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:anamnese-final'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  it('uses compact dashboard density for dentist production cards on notebook and mobile screens', () => {
    const productionStyles = readFileSync(join(process.cwd(), 'src/pages/painel/ProducaoDentista/styles.ts'), 'utf8');
    const anamnesisStyles = readFileSync(
      join(process.cwd(), 'src/pages/painel/ProducaoDentista/DentalAnamnesisRecord.styles.ts'),
      'utf8'
    );
    const stepHeaderStyles = readFileSync(join(process.cwd(), 'src/pages/painel/components/OrderStepHeader.styles.ts'), 'utf8');
    const formsPanelStyles = readFileSync(join(process.cwd(), 'src/pages/painel/components/WorkflowFormsPanel.styles.ts'), 'utf8');

    expect(productionStyles).toContain('@media (max-width: 1280px)');
    expect(productionStyles).toContain('padding: 16px');
    expect(anamnesisStyles).toContain('@media (max-width: 1280px)');
    expect(anamnesisStyles).toContain('width: 32px');
    expect(anamnesisStyles).toContain('height: 32px');
    expect(stepHeaderStyles).toContain('@media (max-width: 1280px)');
    expect(stepHeaderStyles).toContain('width: 32px');
    expect(formsPanelStyles).toContain('@media (max-width: 1280px)');
    expect(formsPanelStyles).toContain('padding: 14px');

    expect(productionStyles).not.toContain('export const StepCard');
    expect(productionStyles).not.toContain('export const WizardSidebar');
    expect(productionStyles).not.toContain('export const ProgressHeader');
    expect(readFileSync(join(process.cwd(), 'src/pages/painel/components/WorkflowFormsPanel.tsx'), 'utf8')).toContain(
      'isClinicalDentistIntake'
    );
    expect(productionStyles).not.toContain('export const StepCheck');
    expect(readFileSync(join(process.cwd(), 'src/pages/painel/ProducaoDentista/index.tsx'), 'utf8')).not.toContain(
      'StepCheckIcon'
    );
  });

  it('keeps administrative form section groups as minimal fieldsets without decorative section icons', () => {
    const formsPanelStyles = readFileSync(join(process.cwd(), 'src/pages/painel/components/WorkflowFormsPanel.styles.ts'), 'utf8');
    const formsPanelSource = readFileSync(join(process.cwd(), 'src/pages/painel/components/WorkflowFormsPanel.tsx'), 'utf8');
    const anamnesisStyles = readFileSync(
      join(process.cwd(), 'src/pages/painel/ProducaoDentista/DentalAnamnesisRecord.styles.ts'),
      'utf8'
    );
    const anamnesisSource = readFileSync(join(process.cwd(), 'src/pages/painel/ProducaoDentista/DentalAnamnesisRecord.tsx'), 'utf8');
    const subsectionSource = formsPanelStyles.slice(
      formsPanelStyles.indexOf('export const FormSubsection'),
      formsPanelStyles.indexOf('export const SectionHeading')
    );

    expect(subsectionSource).toContain('styled.fieldset');
    expect(subsectionSource).toContain('styled.legend');
    expect(subsectionSource).not.toContain('&::before');
    expect(subsectionSource).not.toContain('border-radius: 999px');
    expect(formsPanelSource).toContain('<S.SubsectionHeading>{childSection.title}</S.SubsectionHeading>');
    expect(anamnesisStyles).not.toContain('export const SectionIcon');
    expect(anamnesisSource).not.toContain('<S.SectionIcon>');
  });

  it('keeps form action buttons on the onboarding button pattern and admin actions on the design-system Button', () => {
    const workflowFormsSource = readFileSync(join(process.cwd(), 'src/pages/painel/components/WorkflowFormsPanel.tsx'), 'utf8');
    const workflowFormsStyles = readFileSync(
      join(process.cwd(), 'src/pages/painel/components/WorkflowFormsPanel.styles.ts'),
      'utf8'
    );
    const productionSource = readFileSync(join(process.cwd(), 'src/pages/painel/ProducaoDentista/index.tsx'), 'utf8');
    const productionStyles = readFileSync(join(process.cwd(), 'src/pages/painel/ProducaoDentista/styles.ts'), 'utf8');
    const profileStyles = readFileSync(join(process.cwd(), 'src/pages/painel/CadastroPerfilBiteplaner/styles.ts'), 'utf8');
    const hubStyles = readFileSync(join(process.cwd(), 'src/pages/painel/BiteplanerHub/styles.ts'), 'utf8');
    const buttonStyleSource = readFileSync(join(process.cwd(), 'src/pages/painel/styles/biteplanerFormButton.ts'), 'utf8');
    const dentistLicensingSource = readFileSync(join(process.cwd(), 'src/pages/painel/admin/AdminDentistLicensing.tsx'), 'utf8');
    const partnerLicensingSource = readFileSync(join(process.cwd(), 'src/pages/painel/admin/AdminPartnerLicensing.tsx'), 'utf8');
    const labLicensingSource = readFileSync(join(process.cwd(), 'src/pages/painel/admin/AdminLabLicensing.tsx'), 'utf8');

    expect(workflowFormsSource).toContain('function WorkflowActionButton');
    expect(workflowFormsSource).toContain('<S.FormActionButton');
    expect(workflowFormsSource).toContain('<S.FormActionButtonContent>');
    expect(workflowFormsSource).toContain('<S.FormActionButtonLabel>');
    [
      /<WorkflowActionButton[\s\S]*?type="button"[\s\S]*?onClick=\{handleNextSection\}[\s\S]*?trailingIcon=\{<ChevronRight/,
      /<WorkflowActionButton[\s\S]*?type="submit"[\s\S]*?trailingIcon=\{<Send/,
      /<WorkflowActionButton[\s\S]*?variant="secondary"[\s\S]*?leadingIcon=\{<ArrowLeft/,
      /<WorkflowActionButton[\s\S]*?variant="secondary"[\s\S]*?leadingIcon=\{<PencilLine/,
    ].forEach((pattern) => {
      expect(workflowFormsSource).toMatch(pattern);
    });

    expect(productionSource).toMatch(/<Button(?=[\s\S]*?onClick=\{\(\) => void handleSearchLabs\(\)\})(?=[\s\S]*?trailingIcon=\{<Search)/);
    expect(productionSource).toMatch(/<Button(?=[\s\S]*?variant="secondary")(?=[\s\S]*?leadingIcon=\{<ArrowLeft)/);
    expect(productionSource).toMatch(/<Button(?=[\s\S]*?onClick=\{handleNextStep\})(?=[\s\S]*?trailingIcon=\{<ChevronRight)/);
    expect(productionSource).toMatch(/<Button(?=[\s\S]*?onClick=\{\(\) => void handleComplete\(\)\})(?=[\s\S]*?trailingIcon=\{<CheckCircle2)/);

    expect(buttonStyleSource).toContain('background: #15803d;');
    expect(buttonStyleSource).toContain('min-height: 52px;');
    [workflowFormsStyles, productionStyles, profileStyles, hubStyles].forEach((source) => {
      expect(source).toContain('biteplanerFormButtonStyles');
    });

    [dentistLicensingSource, partnerLicensingSource, labLicensingSource].forEach((source) => {
      expect(source).not.toContain('const DangerButton = styled.button');
      expect(source).not.toContain('const IconButton = styled.button');
      expect(source).toContain('AdminModalAction');
      expect(source).toContain('actionTone="attention"');
      expect(source).not.toMatch(/<AdminModalAction[\s\S]*?leadingIcon=/);
    });
  });

  it('keeps administrative form typography aligned with the onboarding scale', () => {
    const onboardingStyles = readFileSync(join(process.cwd(), 'src/pages/painel/PreRequisito/styles.ts'), 'utf8');
    const adminStyles = readFileSync(join(process.cwd(), 'src/pages/painel/admin/styles.ts'), 'utf8');
    const portalTypography = readFileSync(join(process.cwd(), 'src/pages/painel/styles/portalTypography.ts'), 'utf8');
    const designSystemFormSources = [
      '../packages/design-system/src/components/Field.tsx',
      '../packages/design-system/src/components/Select.tsx',
      '../packages/design-system/src/components/DocumentField.tsx',
      '../packages/design-system/src/components/UploadField.tsx',
      '../packages/design-system/src/components/TagAutocompleteField.tsx',
    ].map((path) => readFileSync(join(process.cwd(), path), 'utf8'));

    expect(onboardingStyles).toContain('font-size: 2rem;');
    expect(onboardingStyles).toContain('font-size: 1rem;');
    expect(onboardingStyles).toContain('font-size: 0.875rem;');
    expect(adminStyles).toContain('export const PageTitle');
    expect(adminStyles).toContain('PortalPageTitle');
    expect(adminStyles).toContain('PortalPageDescription');
    expect(portalTypography).toContain('font-size: ${({ $size = \'default\' }) =>');
    expect(portalTypography).toContain('clamp(2rem, 3.4vw, 2.75rem)');
    expect(portalTypography).toContain('16px');

    designSystemFormSources.forEach((source) => {
      const labelBlock = source.slice(source.indexOf('const Label'), source.indexOf('const RequiredMark'));

      expect(labelBlock).toContain('font-size: 14px;');
      expect(labelBlock).not.toContain('text-transform: uppercase');
      expect(labelBlock).not.toContain('letter-spacing');
    });

    [
      ...readSourceFiles(join(process.cwd(), 'src/pages/painel')),
      ...readSourceFiles(join(process.cwd(), '../packages/design-system/src/components')),
    ].forEach((source) => {
      const sourceWithAllowedTinyMetadataRemoved = source.replace(/const PartnerEmail = styled\.span`[\s\S]*?`;/g, '');
      expect(sourceWithAllowedTinyMetadataRemoved).not.toMatch(
        /font-size:\s*(0|10|11)px|font-size:\s*0;|font-size:\s*0\.(?:[0-6][0-9]*|7[0-4])rem/
      );
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the dentist production wizard with four steps and blocks completion until all required data exists', async () => {
    configureApiGet();

    renderPage();

    expect(await screen.findByRole('heading', { name: /solicitação de produção/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /visão geral dos steps/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('step-breadcrumb-current')).not.toBeInTheDocument();
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/pedido/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/bp-demo-004/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/status atual/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/última atualização/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/etapa atual/i);
    expect(await screen.findByText(/etapa 2 de 4/i)).toBeInTheDocument();
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(screen.queryByTestId('workflow-forms-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dentist-production-steps')).not.toBeInTheDocument();
    expect(screen.queryByText(/^anexos obrigatórios$/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /salvar rascunho/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /finalizar/i })).not.toBeInTheDocument();
    expect(getWizardNextButton()).toBeEnabled();

    await fillProductionRequestUntilLabSelection();
    expect(screen.getAllByLabelText(/4\.0 de 5 avaliações do laboratório/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/2 avaliações/i)).not.toBeInTheDocument();
  }, 10_000);

  it('hydrates the production request step from the latest production_request form saved in the database', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=dentist') {
        return Promise.resolve({ orders: [createOrder({ productionRequestDraft: null })] });
      }

      if (path === '/v1/orders/BP-DEMO-004/workflow-forms') {
        return Promise.resolve({ forms: [reviewedSharedIntake()] });
      }

      if (path === '/v1/orders/BP-DEMO-004/forms') {
        return Promise.resolve({
          forms: [
            {
              id: 'form-production-1',
              order_id: 'BP-DEMO-004',
              type: 'production_request',
              version: 1,
              created_at: '2026-06-03T13:00:00.000Z',
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-004/forms/form-production-1') {
        return Promise.resolve({
          id: 'form-production-1',
          order_id: 'BP-DEMO-004',
          type: 'production_request',
          version: 1,
          created_at: '2026-06-03T13:00:00.000Z',
          payload: {
            anamnesisSummary: 'Resumo clínico salvo.',
            anamnesisDownloaded: true,
            productionRequestSummary: 'Solicitação de produção já salva no banco.',
            labNotes: 'Observações salvas para o laboratório.',
            scan3dFileName: 'scan-salvo.stl',
            prescriptionFileName: 'prescricao-salva.pdf',
            lgpdConfirmed: true,
            selectedLabId: 'profile-lab-edu',
          },
        });
      }

      return Promise.resolve({});
    });

    renderPage('/painel/dentista/producao/BP-DEMO-004#production-request');

    expect(await screen.findByDisplayValue('Solicitação de produção já salva no banco.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Observações salvas para o laboratório.')).toBeInTheDocument();
    expect(screen.getByText(/scan-salvo\.stl/i)).toBeInTheDocument();
    expect(screen.getByText(/prescricao-salva\.pdf/i)).toBeInTheDocument();
  });

  it('opens directly on the anamnesis summary when the anamnesis was already saved', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=dentist') {
        return Promise.resolve({ orders: [createOrder({ productionRequestDraft: null })] });
      }

      if (path === '/v1/orders/BP-DEMO-004/workflow-forms') {
        return Promise.resolve({ forms: [reviewedSharedIntake()] });
      }

      if (path === '/v1/orders/BP-DEMO-004/forms') {
        return Promise.resolve({
          forms: [
            {
              id: 'form-production-1',
              order_id: 'BP-DEMO-004',
              type: 'production_request',
              version: 1,
              created_at: '2026-06-03T13:00:00.000Z',
            },
          ],
        });
      }

      if (path === '/v1/orders/BP-DEMO-004/forms/form-production-1') {
        return Promise.resolve({
          id: 'form-production-1',
          order_id: 'BP-DEMO-004',
          type: 'production_request',
          version: 1,
          created_at: '2026-06-03T13:00:00.000Z',
          payload: {
            anamnesisSummary: 'Resumo clínico salvo.',
            anamnesisDownloaded: true,
            productionRequestSummary: '',
            labNotes: '',
            scan3dFileName: '',
            prescriptionFileName: '',
            lgpdConfirmed: false,
            selectedLabId: '',
          },
        });
      }

      return Promise.resolve({});
    });

    renderPage();

    expect(await screen.findByText(/etapa 2 de 4/i)).toBeInTheDocument();
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Resumo clínico salvo.')).toBeInTheDocument();
    expect(screen.queryByTestId('workflow-forms-panel')).not.toBeInTheDocument();
  });

  it('opens directly on the anamnesis summary when the dentist already submitted the initial evaluation', async () => {
    configureApiGet({
      order: createOrder({
        id: 'c3dfd202-f15a-4c53-83f8-b82f6948c8be',
        status: 'awaiting_payment',
        statusLabel: 'Aguardando pagamento',
        stage: 'awaiting_payment',
        productionRequestDraft: null,
      }),
      forms: [
        reviewedSharedIntake({
          orderId: 'c3dfd202-f15a-4c53-83f8-b82f6948c8be',
        }),
      ],
    });

    renderPage('/painel/dentista/producao/c3dfd202-f15a-4c53-83f8-b82f6948c8be');

    expect(await screen.findByText(/etapa 2 de 4/i)).toBeInTheDocument();
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(screen.queryByTestId('workflow-forms-panel')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /salvar complemento do dentista/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aguardando pagamento do cliente/i })).toBeDisabled();
  });

  it('allows the dentist to continue production after payment releases dentist forms', async () => {
    configureApiGet({
      order: createOrder({
        id: 'BP-DEMO-004',
        status: 'awaiting_dentist_forms',
        statusLabel: 'Aguardando envio ao laboratório',
        stage: 'awaiting_dentist_forms',
        productionRequestDraft: null,
      }),
      forms: [reviewedSharedIntake()],
    });

    renderPage('/painel/dentista/producao/BP-DEMO-004');

    expect(await screen.findByText(/etapa 2 de 4/i)).toBeInTheDocument();
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(getWizardNextButton()).toBeEnabled();
    expect(screen.queryByRole('button', { name: /aguardando pagamento do cliente/i })).not.toBeInTheDocument();
  });

  it('shows the initial evaluation step again when the submitted complement belongs to a previous dentist', async () => {
    configureApiGet({
      order: createOrder({
        id: 'c3dfd202-f15a-4c53-83f8-b82f6948c8be',
        status: 'in_progress',
        statusLabel: 'Em andamento',
        stage: 'consultation_linked',
        dentist: { id: 'dentist-new', full_name: 'Dra Maria Solicitante', email: 'dentista@gmail.com' },
      }),
      forms: [
        reviewedSharedIntake({
          orderId: 'c3dfd202-f15a-4c53-83f8-b82f6948c8be',
          dentistId: 'dentist-previous',
          payload: {
            customer: {
              fullName: 'Carlos Demo',
              hasRelevantMedicalDiagnosis: 'yes',
              relevantMedicalDiagnosisDetails: 'Bruxismo diagnosticado.',
              averagePainLastWeek: 6,
              sportRoutine: 'Musculação cinco vezes por semana.',
            },
            dentist: {
              biteplannerEligible: 'no',
              painlessMaxOpeningMm: 42,
              initialEvaluationSummary: 'Cliente inapto na consulta anterior.',
              dentistProfessionalContact: 'dentista2@gmail.com',
            },
          },
        }),
      ],
    });

    renderPage('/painel/dentista/producao/c3dfd202-f15a-4c53-83f8-b82f6948c8be');

    expect(await screen.findByText(/etapa 1 de 4/i)).toBeInTheDocument();
    expect(await screen.findByTestId('workflow-forms-panel')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dra Maria Solicitante')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Cliente inapto na consulta anterior.')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dental-anamnesis-record')).not.toBeInTheDocument();
  });

  it('renders only the active clinical form when a previous dentist intake is superseded', async () => {
    configureApiGet({
      order: createOrder({
        id: 'c3dfd202-f15a-4c53-83f8-b82f6948c8be',
        status: 'in_progress',
        statusLabel: 'Em andamento',
        stage: 'consultation_linked',
        dentist: { id: 'dentist-new', full_name: 'Dra Maria Solicitante', email: 'dentista@gmail.com' },
      }),
      forms: [
        reviewedSharedIntake({
          id: 'BP-WF-PREVIOUS-INTAKE',
          orderId: 'c3dfd202-f15a-4c53-83f8-b82f6948c8be',
          status: 'superseded',
          dentistId: 'dentist-previous',
          payload: {
            customer: { fullName: 'Carlos Demo' },
            dentist: {
              biteplannerEligible: 'no',
              dentistProfessionalContact: 'dentista2@gmail.com',
            },
          },
        }),
        sharedIntake({
          id: 'BP-WF-CURRENT-INTAKE',
          orderId: 'c3dfd202-f15a-4c53-83f8-b82f6948c8be',
          status: 'submitted',
          roleState: { customer: 'submitted', dentist: 'pending' },
          dentistId: 'dentist-new',
          payload: { customer: { fullName: 'Carlos Demo' } },
        }),
      ],
    });

    renderPage('/painel/dentista/producao/c3dfd202-f15a-4c53-83f8-b82f6948c8be');

    expect(await screen.findByText(/etapa 1 de 4/i)).toBeInTheDocument();
    expect(await screen.findByTestId('workflow-forms-panel')).toBeInTheDocument();
    expect(screen.getAllByText(/formulário clínico biteplaner/i)).toHaveLength(1);
    expect(screen.queryByDisplayValue('dentista2@gmail.com')).not.toBeInTheDocument();
  });

  it('reuses fresh React Query cache when the production page remounts', async () => {
    const queryClient = createTestQueryClient();
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=dentist') {
        return Promise.resolve({ orders: [createOrder()] });
      }

      if (path === '/v1/orders/BP-DEMO-004/workflow-forms') {
        return Promise.resolve({ forms: [reviewedSharedIntake()] });
      }

      return Promise.resolve({});
    });

    const firstRender = renderPageWithQueryClient(queryClient);

    expect(await screen.findByTestId('athlete-order-card')).toBeInTheDocument();
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(3));

    firstRender.unmount();
    renderPageWithQueryClient(queryClient);

    expect(await screen.findByTestId('athlete-order-card')).toBeInTheDocument();
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(4));
  });

  it('does not refetch production data when only the auth token changes', async () => {
    const queryClient = createTestQueryClient();
    let accessToken = 'tok';
    mockUseAuth.mockImplementation(() => ({
      loading: false,
      session: { access_token: accessToken, user: { id: '1', email: 'dentista@nexor.dev' } },
      backendUser: {
        id: 'dentist-user-1',
        email: 'dentista@nexor.dev',
        roles: ['dentist'],
        productRoles: [{ productKey: 'biteplaner', role: 'dentist', status: 'active' }],
      },
      backendUserResolved: true,
      hasConfiguredAuth: true,
      isMockMode: true,
      demoPersona: 'dentist',
      signIn: vi.fn(),
      signInDemo: vi.fn(),
      signOut: vi.fn(),
      sendPasswordReset: vi.fn(),
      refreshBackendUser: vi.fn(),
    }));
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/orders?as=dentist') {
        return Promise.resolve({ orders: [createOrder()] });
      }

      if (path === '/v1/orders/BP-DEMO-004/workflow-forms') {
        return Promise.resolve({ forms: [reviewedSharedIntake()] });
      }

      return Promise.resolve({});
    });

    const view = render(
      <MemoryRouter initialEntries={['/painel/dentista/producao/BP-DEMO-004']}>
        <ThemeProvider theme={lightTheme}>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path="/painel/dentista/producao/:orderId" element={<ProducaoDentista />} />
            </Routes>
          </QueryClientProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(await screen.findByTestId('athlete-order-card')).toBeInTheDocument();
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(3));

    accessToken = 'tok-refreshed';
    view.rerender(
      <MemoryRouter initialEntries={['/painel/dentista/producao/BP-DEMO-004']}>
        <ThemeProvider theme={lightTheme}>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path="/painel/dentista/producao/:orderId" element={<ProducaoDentista />} />
            </Routes>
          </QueryClientProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(await screen.findByTestId('athlete-order-card')).toBeInTheDocument();
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(3));
  });

  it('keeps the anamnesis record in the summary step and attachments inside production request', async () => {
    configureApiGet();

    renderPage();

    await screen.findByTestId('athlete-order-card');
    await ensureAnamnesisSummaryStep();
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(screen.getByText(/clínica esportiva nexor/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    await clickWizardNextButton();

    expect(screen.getByLabelText(/^solicita.*produ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/selecionar escaneamento 3d intraoral/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/selecionar prescrição médica assinada e carimbada/i)).toBeInTheDocument();
  });

  it('stops the dentist at the anamnesis summary after the initial evaluation is completed', async () => {
    configureApiGet({
      order: createOrder({
        status: 'awaiting_payment',
        statusLabel: 'Aguardando pagamento',
        stage: 'awaiting_payment',
      }),
    });

    renderPage();

    await screen.findByTestId('athlete-order-card');
    await screen.findByText(/etapa 2 de 4/i);

    fireEvent.change(await screen.findByLabelText(/resumo da avalia.*inicial \/ anamnese/i), {
      target: { value: 'Resumo clinico completo.' },
    });

    expect(screen.getByText(/etapa 2 de 4/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aguardando pagamento do cliente/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /^pr.*ximo$/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^solicita.*produ/i)).not.toBeInTheDocument();
    expect(screen.getByText(/o cliente precisa concluir o pagamento/i)).toBeInTheDocument();
  });

  it('warns when the shared clinical payload is not available yet instead of showing an empty anamnesis record', async () => {
    configureApiGet({
      forms: [
        reviewedSharedIntake({
          payload: undefined,
          canViewPayload: false,
          summary: { scoreAverage: null, hasComment: false, responseCount: 0, submittedAt: null },
        }),
      ],
    });

    renderPage();

    await screen.findByTestId('athlete-order-card');

    expect(screen.queryByTestId('dental-anamnesis-record')).not.toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent(/dados da anamnese ainda n.*dispon/i);
    expect(screen.getByRole('alert')).toHaveTextContent(/atualize a p.*gina/i);
    expect(screen.queryByText(/n.*informado/i)).not.toBeInTheDocument();
  });

  it('keeps the clinical form progress inside the form card instead of the production shell', async () => {
    configureApiGet({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByRole('heading', { name: /solicitação de produção/i });
    expect(screen.queryByTestId('dentist-production-steps')).not.toBeInTheDocument();

    const stylesheet = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n');

    expect(await screen.findByRole('region', { name: /seu progresso/i })).toBeInTheDocument();
    expect(stylesheet).toContain('grid-auto-flow:column');

    expect(screen.getByTestId('workflow-forms-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('dental-anamnesis-record')).not.toBeInTheDocument();
  });

  it('starts the fixed dental anamnesis card area at the progress section', async () => {
    configureApiGet();

    renderPage();

    await ensureAnamnesisSummaryStep();
    const stickySummary = await screen.findByTestId('dental-anamnesis-sticky-summary');
    const header = stickySummary.closest('header');

    if (!header) {
      throw new Error('Dental anamnesis header was not found.');
    }

    const stylesheet = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n');
    const stickySummaryClass = getGeneratedClass(stickySummary);
    const headerClass = getGeneratedClass(header);

    expect(stickySummary).toHaveTextContent(/progresso da ficha/i);
    expect(stylesheet).toMatch(new RegExp(`\\.${stickySummaryClass}\\{[^}]*position:sticky;[^}]*top:0`, 's'));
    expect(stylesheet).not.toMatch(new RegExp(`\\.${headerClass}\\{[^}]*position:sticky`, 's'));
  });

  it('renders the modern dental anamnesis record after the dentist review', async () => {
    configureApiGet();

    renderPage();

    await ensureAnamnesisSummaryStep();
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(screen.getByText(/ficha de anamnese odontológica/i)).toBeInTheDocument();
    expect(screen.getAllByText(/dados iniciais/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/hist.*rico m.*dico/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/hist.*rico odontol.*gico/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sintomas atuais/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/rastreabilidade e guarda/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/observações profissionais/i).length).toBeGreaterThan(0);
  });

  it('requires both the intraoral scan and the signed prescription before enabling completion', async () => {
    configureApiGet();

    renderPage();

    await screen.findByTestId('athlete-order-card');
    await ensureAnamnesisSummaryStep();
    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    await clickWizardNextButton();

    fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
      target: { value: 'Solicitação preenchida.' },
    });

    fireEvent.change(screen.getByLabelText(/selecionar escaneamento 3d intraoral/i), {
      target: { files: [new File(['scan'], 'scan.stl', { type: 'model/stl' })] },
    });

    expect(screen.queryByRole('button', { name: /finalizar/i })).not.toBeInTheDocument();
    expect(getWizardNextButton()).toBeDisabled();
  });

  it('keeps the production request draft filled after moving to the lab step and back', async () => {
    configureApiGet();
    renderPage();

    await screen.findByTestId('athlete-order-card');
    await ensureAnamnesisSummaryStep();

    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    await clickWizardNextButton();

    fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
      target: { value: 'Solicitação preenchida.' },
    });
    fireEvent.change(screen.getByLabelText(/observações para o laboratório/i), {
      target: { value: 'Observações operacionais.' },
    });
    fireEvent.change(screen.getByLabelText(/selecionar escaneamento 3d intraoral/i), {
      target: { files: [new File(['scan'], 'scan.stl', { type: 'model/stl' })] },
    });
    fireEvent.change(screen.getByLabelText(/selecionar prescrição médica assinada e carimbada/i), {
      target: { files: [new File(['prescription'], 'prescricao.pdf', { type: 'application/pdf' })] },
    });
    await waitFor(() => expect(screen.getByText('scan.stl')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('prescricao.pdf')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('checkbox'));

    await clickWizardNextButton();
    expect(await screen.findByText(/selecionar um laboratório licenciado/i)).toBeInTheDocument();
    expect(screen.queryByText(/preencher a solicitação de produção/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/anexar o escaneamento 3d intraoral/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/anexar a prescrição médica assinada e carimbada/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/confirmar o aceite de retenção e rastreabilidade/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));

    expect(await screen.findByDisplayValue('Solicitação preenchida.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Observações operacionais.')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(mockApiPost.mock.calls.some(([url]) => url === '/v1/orders/BP-DEMO-004/production-request/draft')).toBe(false);
  });

  it('only shows the anamnesis summary after the dentist completes the shared review', async () => {
    configureApiGet({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByTestId('athlete-order-card');

    expect(screen.queryByLabelText(/resumo da avaliação inicial \/ anamnese/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^salvar rascunho$/i })).not.toBeInTheDocument();

    await goToDentistComplement();
    mockApiPost.mockResolvedValueOnce(reviewedSharedIntake());
    fillRequiredDentistComplement();
    fireEvent.click(screen.getByRole('button', { name: /salvar complemento do dentista/i }));

    expect(await screen.findByLabelText(/resumo da avaliação inicial \/ anamnese/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));
    expect(screen.queryByTestId('workflow-forms-panel')).not.toBeInTheDocument();
  });

  it('advances after saving the dentist complement when the response only includes the dentist payload', async () => {
    configureApiGet({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByTestId('athlete-order-card');
    await goToDentistComplement();
    mockApiPost.mockResolvedValueOnce(
      sharedIntake({
        payload: {
          customer: {
            fullName: 'Carlos Demo',
            hasRelevantMedicalDiagnosis: 'yes',
            relevantMedicalDiagnosisDetails: 'Bruxismo diagnosticado.',
            averagePainLastWeek: 6,
            sportRoutine: 'Musculação cinco vezes por semana.',
          },
          dentist: {
            biteplannerEligible: 'yes',
            consultationDate: '2026-05-12',
            painlessMaxOpeningMm: 42,
            initialEvaluationSummary: 'Sem sinais impeditivos para seguir.',
            dentistClinicalDeclaration: ['accepted'],
          },
        },
      })
    );

    fillRequiredDentistComplement();
    fireEvent.click(screen.getByRole('button', { name: /salvar complemento do dentista/i }));

    expect(await screen.findByLabelText(/resumo da avaliação inicial \/ anamnese/i)).toBeInTheDocument();
  });

  it('submits the production request successfully when all required fields are filled', async () => {
    configureApiGet();
    mockApiPost.mockResolvedValueOnce({
      order: createOrder({
        status: 'lab_processing',
        statusLabel: 'Em processo - Laboratório',
        stage: 'lab_production',
      }),
    });

    renderPage();

    await screen.findByTestId('athlete-order-card');
    await ensureAnamnesisSummaryStep();

    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    await clickWizardNextButton();

    fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
      target: { value: 'Solicitação preenchida.' },
    });

    fireEvent.change(screen.getByLabelText(/selecionar escaneamento 3d intraoral/i), {
      target: { files: [new File(['scan'], 'scan.stl', { type: 'model/stl' })] },
    });
    fireEvent.change(screen.getByLabelText(/selecionar prescrição médica assinada e carimbada/i), {
      target: { files: [new File(['prescription'], 'prescricao.pdf', { type: 'application/pdf' })] },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    await clickWizardNextButton();

    fireEvent.click((await screen.findAllByRole('button', { name: /laboratorio do edu/i }))[1]);

    const concludeButton = screen.getByRole('button', { name: /finalizar/i });
    expect(concludeButton).toBeEnabled();

    fireEvent.click(concludeButton);

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-004/clinical-evaluation',
        { outcome: 'eligible' },
        'tok'
      )
    );
    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-004/forms/production-request',
        {
          payload: expect.objectContaining({
            anamnesisSummary: 'Resumo clínico completo.',
            productionRequestSummary: 'Solicitação preenchida.',
            scan3dFileName: 'scan.stl',
            scan3dFileRef: expect.objectContaining({
              id: expect.stringContaining('ext_scan3d-scan.stl'),
              provider: 'simulated-external-storage',
            }),
            prescriptionFileName: 'prescricao.pdf',
            prescriptionFileRef: expect.objectContaining({
              id: expect.stringContaining('ext_prescription-prescricao.pdf'),
              provider: 'simulated-external-storage',
            }),
            lgpdConfirmed: true,
            selectedLabId: 'profile-lab-edu',
            anamnesisDownloaded: false,
          }),
        },
        'tok'
      )
    );
  });

  it('does not start PDF generation while completing the production request', async () => {
    configureApiGet();
    mockApiPost.mockResolvedValueOnce({ order: createOrder() });
    mockApiPost.mockResolvedValueOnce({ id: 'form-production-1' });

    renderPage();

    await fillProductionRequestUntilLabSelection();

    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-004/forms/production-request',
        { payload: expect.objectContaining({ anamnesisDownloaded: false }) },
        'tok'
      )
    );
    expect(MockPdfWorker.instances).toHaveLength(0);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('does not show a PDF snackbar while completing the production request', async () => {
    configureApiGet();
    mockApiPost.mockResolvedValueOnce({ order: createOrder() });
    mockApiPost.mockResolvedValueOnce({ id: 'form-production-1' });

    renderPage();

    await fillProductionRequestUntilLabSelection();

    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-004/forms/production-request',
        { payload: expect.objectContaining({ anamnesisDownloaded: false }) },
        'tok'
      )
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert', { name: /pdf/i })).not.toBeInTheDocument();
  });

  it('keeps completing the production request if the PDF worker is unavailable', async () => {
    class BrokenPdfWorker {
      constructor() {
        throw new Error('Worker unavailable');
      }
    }

    vi.stubGlobal('Worker', BrokenPdfWorker);
    configureApiGet();
    mockApiPost.mockResolvedValueOnce({ order: createOrder() });
    mockApiPost.mockResolvedValueOnce({ id: 'form-production-1' });

    renderPage();

    await fillProductionRequestUntilLabSelection();

    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-004/forms/production-request',
        { payload: expect.objectContaining({ anamnesisDownloaded: false }) },
        'tok'
      )
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('shows licensed labs on the map and allows selecting one before completion', async () => {
    configureApiGet();

    renderPage();

    await screen.findByTestId('athlete-order-card');
    await ensureAnamnesisSummaryStep();
    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    await clickWizardNextButton();

    fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
      target: { value: 'Solicitação preenchida.' },
    });

    fireEvent.change(screen.getByLabelText(/selecionar escaneamento 3d intraoral/i), {
      target: { files: [new File(['scan'], 'scan.stl', { type: 'model/stl' })] },
    });
    fireEvent.change(screen.getByLabelText(/selecionar prescrição médica assinada e carimbada/i), {
      target: { files: [new File(['prescription'], 'prescricao.pdf', { type: 'application/pdf' })] },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    await clickWizardNextButton();

    expect(screen.getByTestId('lab-map')).toBeInTheDocument();
    fireEvent.click((await screen.findAllByRole('button', { name: /laboratorio do edu/i }))[1]);

    expect(screen.getByText(/laboratório selecionado: laboratorio do edu/i)).toBeInTheDocument();
  });

  it('shows the approved laboratory address from the licensed lab account in the selection step', async () => {
    configureApiGet();

    renderPage();

    await screen.findByTestId('athlete-order-card');
    await ensureAnamnesisSummaryStep();
    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    await clickWizardNextButton();
    fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
      target: { value: 'Solicitação preenchida.' },
    });
    fireEvent.change(screen.getByLabelText(/selecionar escaneamento 3d intraoral/i), {
      target: { files: [new File(['scan'], 'scan.stl', { type: 'model/stl' })] },
    });
    fireEvent.change(screen.getByLabelText(/selecionar prescrição médica assinada e carimbada/i), {
      target: { files: [new File(['prescription'], 'prescricao.pdf', { type: 'application/pdf' })] },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    await clickWizardNextButton();

    expect(await screen.findByText(/rua conselheiro brotero - santa cecilia, são paulo - sp/i)).toBeInTheDocument();
    expect(screen.getByText(/\(11\) 1111-1111 - 1\.2 km/i)).toBeInTheDocument();
  });

  it('keeps the dentist data retention checkbox text regular with only keywords highlighted', async () => {
    configureApiGet();

    renderPage();

    await screen.findByTestId('athlete-order-card');
    await ensureAnamnesisSummaryStep();
    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    await clickWizardNextButton();

    fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
      target: { value: 'Solicitação preenchida.' },
    });

    expect(screen.getByTestId('dentist-retention-consent-label')).toHaveStyle({ fontWeight: '400' });
    expect(screen.getByText(/tempo necessário para entrega/i).tagName).toBe('STRONG');
    expect(screen.getByText(/guarda principal do registro clínico/i).tagName).toBe('STRONG');
    expect(screen.getByText(/dados operacionais indispens.*veis/i).tagName).toBe('STRONG');
  });

  it('lets the dentist complement the shared intake while customer answers stay read-only', async () => {
    configureApiGet({ forms: [sharedIntake()] });
    mockApiPost.mockResolvedValueOnce({
      ...sharedIntake({
        roleState: { customer: 'locked', dentist: 'submitted' },
        dentistReviewStartedAt: '2026-05-08T12:00:00.000Z',
        dentistSubmittedAt: '2026-05-08T12:10:00.000Z',
        payload: {
          customer: {
            fullName: 'Carlos Demo',
            hasRelevantMedicalDiagnosis: 'yes',
            relevantMedicalDiagnosisDetails: 'Bruxismo diagnosticado.',
            averagePainLastWeek: 6,
            sportRoutine: 'Musculação cinco vezes por semana.',
          },
          dentist: {
            painlessMaxOpeningMm: 42,
            initialEvaluationSummary: 'Sem sinais impeditivos para seguir.',
          },
        },
      }),
    });

    renderPage();

    expect(await screen.findByTestId('workflow-forms-panel')).toBeInTheDocument();
    await goToDentistComplement();
    expect(
      screen.getAllByLabelText(/data da consulta/i).find((element) => element instanceof HTMLInputElement)
    ).toHaveAttribute('type', 'date');
    expect(getPainlessOpeningInput()).toBeInTheDocument();

    fillRequiredDentistComplement();
    fireEvent.click(screen.getByRole('button', { name: /salvar complemento do dentista/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-004/workflow-forms/BP-WF-004-INTAKE/submit',
        {
          payload: expect.objectContaining({
            dentist: expect.objectContaining({
              consultationDate: '2026-05-12',
              painlessMaxOpeningMm: 42,
              dentistClinicalDeclaration: ['accepted'],
            }),
          }),
        },
        'tok'
      )
    );
    expect(await screen.findByLabelText(/resumo da avalia.*inicial \/ anamnese/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/formulário enviado/i).length).toBeLessThanOrEqual(1);
    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));
    expect(screen.queryByTestId('workflow-forms-panel')).not.toBeInTheDocument();
  });

  it('does not reopen a submitted shared intake complement as the initial evaluation step', async () => {
    configureApiGet();

    renderPage();

    expect(await screen.findByText(/etapa 2 de 4/i)).toBeInTheDocument();
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(screen.queryByTestId('workflow-forms-panel')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
  });

  it('does not expose customer consent steps to the dentist shared intake review', async () => {
    configureApiGet({ forms: [sharedIntake()] });

    renderPage();

    expect(await screen.findByTestId('workflow-forms-panel')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /consentimentos/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/tratamento necessário para inscrição/i)).not.toBeInTheDocument();
  });

  it('prefills dentist system fields and renders the clinical declaration as one checkbox', async () => {
    configureApiGet({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByLabelText(/data da avaliação/i);
    expect(screen.getByLabelText(/data da avaliação/i)).toHaveValue(new Date().toLocaleDateString('pt-BR'));
    expect(screen.getByLabelText(/nome do dentista/i)).toHaveValue('Dra Maria Solicitante');
    expect(screen.getByLabelText(/cro\/estado/i)).toHaveValue('CRO-SP 12345');
    expect(screen.getByLabelText(/contato profissional/i)).toHaveValue('dentista@nexor.dev / (11) 99999-9999');
    expect(screen.queryByText(/preenchido pelo sistema/i)).not.toBeInTheDocument();

    await goToDentistComplement();

    expect(screen.queryByLabelText(/^aceito$/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: /declaro que as informações acima foram coletadas através de exame clínico/i,
      })
    ).toBeInTheDocument();
  });

  it('requires a customer-facing inaptitude description when the dentist marks the client as not eligible', async () => {
    configureApiGet({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByTestId('workflow-forms-panel');
    await goToDentistComplement();

    const eligibilityGroup = screen.getByRole('group', { name: /cliente est.*apto para uso do biteplaner/i });
    fireEvent.click(within(eligibilityGroup).getByRole('radio', { name: /não/i }));

    const inaptitudeDescription = await screen.findByRole('textbox', {
      name: /descrição da inaptidão para o cliente/i,
    });
    expect(inaptitudeDescription).toBeRequired();
    expect(screen.getByText(/este texto será exibido para o cliente/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /salvar complemento do dentista/i }));

    expect(inaptitudeDescription).toBeInvalid();
    expect(mockApiPost).not.toHaveBeenCalledWith(
      '/v1/orders/BP-DEMO-004/workflow-forms/BP-WF-004-INTAKE/submit',
      expect.anything(),
      'tok'
    );
  });

  it('uses the dentist-filled consultation date in the anamnesis record', async () => {
    configureApiGet({
      forms: [
        reviewedSharedIntake({
          dentistSubmittedAt: '2026-05-20T12:10:00.000Z',
          payload: {
            customer: {
              fullName: 'Carlos Demo',
              hasRelevantMedicalDiagnosis: 'yes',
              relevantMedicalDiagnosisDetails: 'Bruxismo diagnosticado.',
              averagePainLastWeek: 6,
              sportRoutine: 'Musculação cinco vezes por semana.',
            },
            dentist: {
              consultationDate: '2026-05-12',
              painlessMaxOpeningMm: 42,
              dentistClinicalDeclaration: ['accepted'],
            },
          },
        }),
      ],
    });

    renderPage();

    await ensureAnamnesisSummaryStep();
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(screen.getAllByText(/12\/05\/2026/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/20\/05\/2026/)).not.toBeInTheDocument();
  });

  it('shows the dentist clinical form as three sections with clinical subsections grouped under section 2', async () => {
    configureApiGet({ forms: [sharedIntake()] });

    renderPage();

    expect(await screen.findByText(/seção 1 de 3/i)).toBeInTheDocument();
    expect(screen.queryByText(/seção 1 de 7/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /dados iniciais/i }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /próxima etapa/i }));

    expect(screen.getAllByRole('heading', { name: /dados clínicos para seu cuidado/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/histórico odontológico e orofacial/i)).toBeInTheDocument();
    expect(screen.getByText(/sintomas atuais - dor orofacial, cervical e impacto funcional/i)).toBeInTheDocument();
    expect(screen.getAllByText(/hábitos de vida/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /próxima etapa/i }));

    await waitFor(() => expect(screen.getAllByRole('heading', { name: /complemento dentista/i }).length).toBeGreaterThan(0));
    expect(screen.getByText(/campos preenchidos pelo dentista licenciado/i)).toBeInTheDocument();
    expect(screen.getByText(/integram o prontu.*rio/i)).toBeInTheDocument();
    expect(screen.queryByText(/info interna/i)).not.toBeInTheDocument();
  });

  it('fills dentist initial data review with customer onboarding values', async () => {
    configureApiGet({
      forms: [
        customerOnboarding(),
        sharedIntake({
          payload: {
            customer: {
              orthodonticTreatmentStatus: 'no',
              needsAdaptedClinic: 'no',
            },
          },
        }),
      ],
    });

    renderPage();

    expect(await screen.findByText(/nome completo do paciente/i)).toBeInTheDocument();
    expect(screen.getAllByText('Carlos Demo').length).toBeGreaterThan(0);
    expect(screen.getByText(/massa corporal \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByText('82.4')).toBeInTheDocument();
    expect(screen.getByText(/altura \(m\)/i)).toBeInTheDocument();
    expect(screen.getByText('1.78')).toBeInTheDocument();
    expect(screen.getByText(/idade \(anos\)/i)).toBeInTheDocument();
    expect(screen.getByText(getExpectedAgeYears('1992-04-10'))).toBeInTheDocument();
    expect(screen.getByText(/esportes\/atividades atuais/i)).toBeInTheDocument();
    expect(screen.getByText(/muscula/i)).toBeInTheDocument();
  });

  it('keeps every dentist section 2 clinical question backed by a customer-filled pre-consultation field', () => {
    const customerClinicalSectionKeys = new Set([
      'medical-history',
      'dental-orofacial-history',
      'current-pain-function',
      'life-habits',
    ]);
    const sectionTwoFields = SHARED_INITIAL_EVALUATION_INTAKE.sections
      .filter((section) => customerClinicalSectionKeys.has(section.key))
      .flatMap((section) => section.fields);

    expect(sectionTwoFields.length).toBeGreaterThan(0);
    sectionTwoFields.forEach((field) => {
      expect(field.ownerRole).toBe('user');
      expect(field.editableWhen).toBe('customer_intake');
      expect(field.visibleTo).toContain('user');
    });
  });

  it('reflects customer conditional clinical answers in the dentist read-only section 2 review', async () => {
    configureApiGet({
      forms: [
        sharedIntake({
          payload: {
            customer: {
              orthodonticTreatmentStatus: 'none',
              fullName: 'Carlos Demo',
              phone: '(11) 99999-9999',
              needsAdaptedClinic: 'no',
              hasRelevantMedicalDiagnosis: 'yes',
              relevantMedicalDiagnosisDetails: 'Bruxismo diagnosticado.',
              currentMedicationUse: 'yes',
              currentMedicationDetails: 'Relaxante muscular quando necessário.',
              hasCurrentPain: 'yes',
              painLocations: ['temples', 'neck'],
              painPatternDetails: 'Dor temporal após treinos intensos.',
            },
          },
        }),
      ],
    });

    renderPage();

    await screen.findByText(/seção 1 de 3/i);
    fireEvent.click(screen.getByRole('button', { name: /próxima etapa/i }));

    expect(screen.getByText(/possui algum diagnóstico médico prévio relevante/i)).toBeInTheDocument();
    expect(screen.getByText(/bruxismo diagnosticado/i)).toBeInTheDocument();
    expect(screen.getByText(/quais medicamentos, dosagens e há quanto tempo/i)).toBeInTheDocument();
    expect(screen.getByText(/relaxante muscular quando necessário/i)).toBeInTheDocument();
    expect(screen.getByText(/localização da dor/i)).toBeInTheDocument();
    expect(screen.getByText(/dor temporal após treinos intensos/i)).toBeInTheDocument();
  });

  it('loads the workflow form detail when the list response omits the sensitive payload for the dentist', async () => {
    const listForm = sharedIntake({ payload: null });
    const detailedForm = sharedIntake({
      payload: {
        customer: {
          orthodonticTreatmentStatus: 'none',
          fullName: 'Carlos Demo',
          phone: '(11) 99999-9999',
          needsAdaptedClinic: 'no',
          hasRelevantMedicalDiagnosis: 'yes',
          relevantMedicalDiagnosisDetails: 'Bruxismo diagnosticado.',
        },
      },
    });

    mockApiGet.mockImplementation((url: string) => {
      if (url === '/v1/orders?as=dentist') {
        return Promise.resolve({ orders: [createOrder()] });
      }

      if (url === '/v1/orders/BP-DEMO-004/workflow-forms') {
        return Promise.resolve({ forms: [listForm] });
      }

      if (url === '/v1/orders/BP-DEMO-004/workflow-forms/BP-WF-004-INTAKE') {
        return Promise.resolve(detailedForm);
      }

      if (url === '/v1/orders/BP-DEMO-004/forms') {
        return Promise.resolve({ forms: [] });
      }

      return Promise.resolve({});
    });

    renderPage();

    await screen.findByText(/seção 1 de 3/i);
    fireEvent.click(screen.getByRole('button', { name: /próxima etapa/i }));

    expect(await screen.findByText(/bruxismo diagnosticado/i)).toBeInTheDocument();
    expect(mockApiGet).toHaveBeenCalledWith(
      '/v1/orders/BP-DEMO-004/workflow-forms/BP-WF-004-INTAKE',
      'tok'
    );
  });

  it('keeps customer answers visible in the anamnesis record through the canonical intake dictionary', async () => {
    const dictionary = getWorkflowFormDictionary('customer_pre_consultation_intake');

    expect(dictionary?.payloadMode).toBe('actor-nested');
    expect(dictionary?.fieldsByKey.hasCurrentPain.payloadRole).toBe('customer');
    expect(dictionary?.fieldsByKey.painLocations.payloadRole).toBe('customer');
    expect(dictionary?.fieldsByKey.painlessMaxOpeningMm.payloadRole).toBe('dentist');

    configureApiGet({
      forms: [
        reviewedSharedIntake({
          payload: {
            customer: {
              orthodonticTreatmentStatus: 'none',
              fullName: 'Carlos Demo',
              phone: '(11) 99999-9999',
              needsAdaptedClinic: 'no',
              hasCurrentPain: 'yes',
              painLocations: ['temples', 'neck'],
              painPatternDetails: 'Dor no treino já preenchida pelo cliente.',
              averagePainLastWeek: 6,
              worstPainLastWeek: 8,
              painAggravatingFactors: ['heavy_training', 'emotional_stress'],
              painReliefFactors: ['heat', 'training_pause'],
              hasMouthOpeningDifficulty: 'no',
              jointClickFrequency: 'occasional',
              trainingTeethClenching: 'conscious_yes',
              trainingJawTensionMoment: ['near_failure', 'heavy_lifts'],
              trainingInterruptedByPain: 'monthly',
              trainingPerformanceImpact: 7,
              missedTrainingDuePain: '1_3',
            },
            dentist: {
              painlessMaxOpeningMm: 42,
              dentistClinicalDeclaration: ['accepted'],
            },
          },
        }),
      ],
    });

    renderPage();

    await ensureAnamnesisSummaryStep();
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(screen.getByText(/dor no treino já preenchida pelo cliente/i)).toBeInTheDocument();
    expect(screen.getByText(/têmporas, pescoço/i)).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText(/treinos pesados\/levantamento de cargas/i)).toBeInTheDocument();
    expect(screen.getByText(/sim, percebo conscientemente/i)).toBeInTheDocument();
  });

  it('consolidates customer onboarding values into the dentist anamnesis summary', async () => {
    configureApiGet({
      forms: [
        customerOnboarding(),
        reviewedSharedIntake({
          payload: {
            customer: {
              orthodonticTreatmentStatus: 'none',
              hasCurrentPain: 'no',
              needsAdaptedClinic: 'no',
            },
            dentist: {
              painlessMaxOpeningMm: 42,
              dentistClinicalDeclaration: ['accepted'],
            },
          },
        }),
      ],
    });

    renderPage();

    await ensureAnamnesisSummaryStep();
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(screen.getByText(/nome completo do paciente/i)).toBeInTheDocument();
    expect(screen.getAllByText('Carlos Demo').length).toBeGreaterThan(0);
    expect(screen.getByText(/massa corporal \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByText('82.4')).toBeInTheDocument();
    expect(screen.getByText(/altura \(m\)/i)).toBeInTheDocument();
    expect(screen.getByText('1.78')).toBeInTheDocument();
    expect(screen.getByText(/musculação/i)).toBeInTheDocument();
  });

  it('renders the clinical form without duplicate internal heading, release metadata or consolidated notice card', async () => {
    configureApiGet({ forms: [sharedIntake()] });

    renderPage();

    expect(await screen.findByText(/formulário clínico biteplaner/i)).toBeInTheDocument();
    expect(screen.queryByText(/avaliação clínica biteplaner consolidada/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/liberado em/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/enviado em/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/enviado$/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /formulário clínico biteplaner/i })).toHaveLength(1);
    expect(screen.getAllByRole('heading', { name: /dados iniciais/i })).toHaveLength(1);
  });

  it('does not include the removed detailed facial profile and skeletal pattern fields in the dentist complement', async () => {
    configureApiGet({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByTestId('workflow-forms-panel');
    await goToDentistComplement();

    expect(screen.queryByText(/5\.1\./i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/propor/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/5\.2\. perfil facial - tecidos moles/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/nasal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/5\.3\./i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/superior/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/5\.4\./i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/edge-to-edge/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/5\.5\./i)).not.toBeInTheDocument();
    expect(screen.queryByText(/5\.6\./i)).not.toBeInTheDocument();
  });

  it('does not show removed broad dentist complement questions', async () => {
    configureApiGet({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByTestId('workflow-forms-panel');
    await goToDentistComplement();

    expect(screen.queryByText(/^descrição sucinta do padrão esquelético/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^perfil facial e padrão esquelético/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^síntese do perfil facial de tecidos moles/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^síntese do padrão esquelético/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^síntese da avaliação inicial/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^pontos de atenção para decisão clínica/i)).not.toBeInTheDocument();
  });

  it('does not generate the anamnesis PDF when only advancing from the summary step', async () => {
    configureApiGet();

    renderPage();

    await screen.findByTestId('athlete-order-card');
    await ensureAnamnesisSummaryStep();
    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });

    await clickWizardNextButton();
    expect(MockPdfWorker.instances).toHaveLength(0);
  });
});
