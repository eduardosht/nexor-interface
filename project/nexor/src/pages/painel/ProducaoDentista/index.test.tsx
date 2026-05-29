import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { createTestQueryClient, TestQueryClientProvider } from '../../../test/renderWithQueryClient';
import { SHARED_INITIAL_EVALUATION_INTAKE } from '../components/sharedIntakeDefinition';

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
    status: 'awaiting_dentist_forms',
    statusLabel: 'Aguardando preenchimento dentista',
    stage: 'awaiting_dentist_forms',
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
  const button = screen
    .getAllByRole('button')
    .find((item) => item.textContent?.toLowerCase().includes('ximo'));

  if (!button) {
    throw new Error('Wizard next button was not found.');
  }

  return button;
}

function getPainlessOpeningInput() {
  return screen.getAllByLabelText(/abertura m/i)[0];
}

function fillRequiredDentistComplement() {
  fireEvent.change(screen.getByLabelText(/data da consulta/i), { target: { value: '2026-05-12' } });
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
  await screen.findByRole('heading', { name: /avalia/i });
  fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

  fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
    target: { value: 'Resumo clínico completo.' },
  });
  fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

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
  fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

  fireEvent.click(screen.getAllByRole('button', { name: /lab demo sul/i })[1]);
}

describe('ProducaoDentista', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
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

    [
      /<Button[\s\S]*?type="button"[\s\S]*?onClick=\{handleNextSection\}[\s\S]*?trailingIcon=\{<ChevronRight/,
      /<Button[\s\S]*?type="submit"[\s\S]*?trailingIcon=\{<Send/,
      /<Button[\s\S]*?variant="secondary"[\s\S]*?leadingIcon=\{<ArrowLeft/,
      /<Button[\s\S]*?variant="secondary"[\s\S]*?leadingIcon=\{<PencilLine/,
    ].forEach((pattern) => {
      expect(workflowFormsSource).toMatch(pattern);
    });

    expect(productionSource).toMatch(/<Button[\s\S]*?onClick=\{handleSearchLabs\}[\s\S]*?trailingIcon=\{<Search/);
    expect(productionSource).toMatch(/<Button[\s\S]*?variant="secondary"[\s\S]*?leadingIcon=\{<ArrowLeft/);
    expect(productionSource).toMatch(/<Button[\s\S]*?onClick=\{handleNextStep\}[\s\S]*?trailingIcon=\{<ChevronRight/);
    expect(productionSource).toMatch(/<Button[\s\S]*?onClick=\{\(\) => void handleComplete\(\)\}[\s\S]*?trailingIcon=\{<CheckCircle2/);

    expect(buttonStyleSource).toContain('background: #15803d;');
    expect(buttonStyleSource).toContain('min-height: 52px;');
    [workflowFormsStyles, productionStyles, profileStyles, hubStyles].forEach((source) => {
      expect(source).toContain('biteplanerFormButtonStyles');
    });

    [dentistLicensingSource, partnerLicensingSource, labLicensingSource].forEach((source) => {
      expect(source).not.toContain('const DangerButton = styled.button');
      expect(source).toMatch(/const DangerButton = styled\(Button\)/);
      expect(source).not.toContain('const IconButton = styled.button');
      expect(source).toMatch(/const IconButton = styled\(Button\)/);
      expect(source).toMatch(/leadingIcon=\{<XCircle/);
      expect(source).toMatch(/leadingIcon=\{<CheckCircle2/);
    });
  });

  it('keeps administrative form typography aligned with the onboarding scale', () => {
    const onboardingStyles = readFileSync(join(process.cwd(), 'src/pages/painel/PreRequisito/styles.ts'), 'utf8');
    const adminStyles = readFileSync(join(process.cwd(), 'src/pages/painel/admin/styles.ts'), 'utf8');
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
    expect(adminStyles).toContain('font-size: 2rem;');
    expect(adminStyles).toContain('font-size: 1rem;');

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
      expect(source).not.toMatch(/font-size:\s*(0|10|11)px|font-size:\s*0;|font-size:\s*0\.(?:[0-6][0-9]*|7[0-4])rem/);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the dentist production wizard with four steps and blocks completion until all required data exists', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

    expect(await screen.findByRole('heading', { name: /solicitação de produção/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /visão geral dos steps/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('step-breadcrumb-current')).not.toBeInTheDocument();
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/pedido/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/bp-demo-004/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/status atual/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/última atualização/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/etapa atual/i);
    expect(screen.getByText(/etapa 1 de 4/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /seu progresso/i })).toBeInTheDocument();
    expect(screen.getByText(/seção 1 de 3/i)).toBeInTheDocument();
    expect(screen.queryByTestId('dentist-production-steps')).not.toBeInTheDocument();
    expect(screen.queryByText(/^anexos obrigatórios$/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /salvar rascunho/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /finalizar/i })).toBeDisabled();

    await fillProductionRequestUntilLabSelection();
    expect(screen.getAllByLabelText(/4\.0 de 5 avaliações do laboratório/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/2 avaliações/i)).not.toBeInTheDocument();
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
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));

    firstRender.unmount();
    renderPageWithQueryClient(queryClient);

    expect(await screen.findByTestId('athlete-order-card')).toBeInTheDocument();
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
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
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));

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
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
  });

  it('keeps the anamnesis record in the summary step and attachments inside production request', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

    await screen.findByRole('heading', { name: /avalia/i });
    expect(screen.queryByTestId('dental-anamnesis-record')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(screen.getByText(/clínica esportiva nexor/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    expect(screen.getByLabelText(/^solicita.*produ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/selecionar escaneamento 3d intraoral/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/selecionar prescrição médica assinada e carimbada/i)).toBeInTheDocument();
  });

  it('keeps the clinical form progress inside the form card instead of the production shell', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

    await screen.findByRole('heading', { name: /solicitação de produção/i });
    expect(screen.queryByTestId('dentist-production-steps')).not.toBeInTheDocument();

    const stylesheet = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n');

    expect(screen.getByRole('region', { name: /seu progresso/i })).toBeInTheDocument();
    expect(stylesheet).toContain('grid-auto-flow:column');

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    const updatedStylesheet = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n');
    const anamnesisSideNavClass = getGeneratedClass(
      await screen.findByRole('navigation', { name: /navegacao da ficha de anamnese/i })
    );

    expect(updatedStylesheet).toMatch(new RegExp(`@media \\(max-width:\\s?1440px\\).*\\.${anamnesisSideNavClass}\\{[^}]*display:none`, 's'));
  });

  it('starts the fixed dental anamnesis card area at the progress section', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /próximo/i }));
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
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /próximo/i }));
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(screen.getByText(/ficha de anamnese odontológica/i)).toBeInTheDocument();
    expect(screen.getAllByText(/identificacao do paciente/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/queixa principal/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/histórico médico/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/avaliação clínica/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/plano de tratamento/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/observações profissionais/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/consentimento/i).length).toBeGreaterThan(0);
  });

  it('requires both the intraoral scan and the signed prescription before enabling completion', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

    await screen.findByRole('heading', { name: /avalia/i });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
      target: { value: 'Solicitação preenchida.' },
    });

    fireEvent.change(screen.getByLabelText(/selecionar escaneamento 3d intraoral/i), {
      target: { files: [new File(['scan'], 'scan.stl', { type: 'model/stl' })] },
    });

    expect(screen.getByRole('button', { name: /finalizar/i })).toBeDisabled();
  });

  it('only shows the anamnesis summary after the dentist completes the shared review', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByRole('heading', { name: /avalia/i });

    expect(screen.queryByLabelText(/resumo da avaliação inicial \/ anamnese/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^salvar rascunho$/i })).not.toBeInTheDocument();

    await goToDentistComplement();
    mockApiPost.mockResolvedValueOnce(reviewedSharedIntake());
    fillRequiredDentistComplement();
    fireEvent.click(screen.getByRole('button', { name: /salvar complemento do dentista/i }));

    expect(await screen.findByLabelText(/resumo da avaliação inicial \/ anamnese/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));
    expect(screen.getByTestId('workflow-forms-panel')).toBeInTheDocument();
  });

  it('advances after saving the dentist complement when the response only includes the dentist payload', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByRole('heading', { name: /avalia/i });
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
            painlessMaxOpeningMm: 42,
            initialEvaluationSummary: 'Sem sinais impeditivos para seguir.',
          },
        },
      })
    );

    fillRequiredDentistComplement();
    fireEvent.click(screen.getByRole('button', { name: /salvar complemento do dentista/i }));

    expect(await screen.findByLabelText(/resumo da avaliação inicial \/ anamnese/i)).toBeInTheDocument();
  });

  it('submits the production request successfully when all required fields are filled', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });
    mockApiPost.mockResolvedValueOnce({
      order: createOrder({
        status: 'lab_processing',
        statusLabel: 'Em processo - Laboratório',
        stage: 'lab_production',
      }),
    });

    renderPage();

    await screen.findByRole('heading', { name: /avalia/i });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

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
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    fireEvent.click(screen.getAllByRole('button', { name: /lab demo sul/i })[1]);

    const concludeButton = screen.getByRole('button', { name: /finalizar/i });
    expect(concludeButton).toBeEnabled();

    fireEvent.click(concludeButton);

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-004/production-request/complete',
        expect.objectContaining({
          anamnesisSummary: 'Resumo clínico completo.',
          productionRequestSummary: 'Solicitação preenchida.',
          scan3dFileName: 'scan.stl',
          prescriptionFileName: 'prescricao.pdf',
          lgpdConfirmed: true,
          selectedLabId: expect.any(String),
          anamnesisDownloaded: true,
        }),
        'tok'
      )
    );
    expect(MockPdfWorker.instances).toHaveLength(1);
    expect(MockPdfWorker.instances[0]?.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        draft: expect.objectContaining({ anamnesisDownloaded: true }),
      })
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();

    act(() => {
      MockPdfWorker.instances[0]?.resolvePdf();
    });

    const downloadedBlob = vi.mocked(URL.createObjectURL).mock.calls[0]?.[0] as Blob;
    expect(downloadedBlob.type).toBe('application/pdf');
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it('starts the final PDF generation in the background while completing the production request', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });
    mockApiPost.mockReturnValueOnce(new Promise(() => {}));

    renderPage();

    await fillProductionRequestUntilLabSelection();

    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(/pdf.*gerado/i);
    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-004/production-request/complete',
        expect.objectContaining({ anamnesisDownloaded: true }),
        'tok'
      )
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('shows an error snackbar if the background PDF generation fails', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });
    mockApiPost.mockReturnValueOnce(new Promise(() => {}));

    renderPage();

    await fillProductionRequestUntilLabSelection();

    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    await screen.findByRole('status');
    act(() => {
      MockPdfWorker.instances[0]?.rejectPdf();
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(/pdf/i);
    expect(mockApiPost).toHaveBeenCalledWith(
      '/v1/orders/BP-DEMO-004/production-request/complete',
      expect.objectContaining({ anamnesisDownloaded: true }),
      'tok'
    );
  });

  it('keeps completing the production request if the PDF worker cannot start', async () => {
    class BrokenPdfWorker {
      constructor() {
        throw new Error('Worker unavailable');
      }
    }

    vi.stubGlobal('Worker', BrokenPdfWorker);
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });
    mockApiPost.mockReturnValueOnce(new Promise(() => {}));

    renderPage();

    await fillProductionRequestUntilLabSelection();
    expect(await screen.findByRole('alert')).toHaveTextContent(/pdf/i);

    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    expect(mockApiPost).toHaveBeenCalledWith(
      '/v1/orders/BP-DEMO-004/production-request/complete',
      expect.objectContaining({ anamnesisDownloaded: true }),
      'tok'
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('shows licensed labs on the map and allows selecting one before completion', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

    await screen.findByRole('heading', { name: /avalia/i });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

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
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    expect(screen.getByTestId('lab-map')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /lab demo sul/i })[1]);

    expect(screen.getByText(/laboratório selecionado: lab demo sul/i)).toBeInTheDocument();
  });

  it('keeps the dentist data retention checkbox text regular with only keywords highlighted', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

    await screen.findByRole('heading', { name: /avalia/i });
    fireEvent.click(getWizardNextButton());
    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    fireEvent.click(getWizardNextButton());

    fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
      target: { value: 'Solicitação preenchida.' },
    });

    expect(screen.getByTestId('dentist-retention-consent-label')).toHaveStyle({ fontWeight: '400' });
    expect(screen.getByText(/tempo necessário para entrega/i).tagName).toBe('STRONG');
    expect(screen.getByText(/guarda principal do registro clínico/i).tagName).toBe('STRONG');
    expect(screen.getByText(/dados operacionais indispensaveis/i).tagName).toBe('STRONG');
  });

  it('lets the dentist complement the shared intake while customer answers stay read-only', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [sharedIntake()] });
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
    expect(screen.getByLabelText(/data da consulta/i)).toHaveAttribute('type', 'date');
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
    expect(screen.getByTestId('workflow-forms-panel')).toBeInTheDocument();
  });

  it('lets the dentist edit a submitted shared intake complement', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });
    mockApiPost.mockResolvedValueOnce(reviewedSharedIntake({
      payload: {
        customer: {
          fullName: 'Carlos Demo',
          hasRelevantMedicalDiagnosis: 'yes',
          relevantMedicalDiagnosisDetails: 'Bruxismo diagnosticado.',
          averagePainLastWeek: 6,
          sportRoutine: 'Musculação cinco vezes por semana.',
        },
        dentist: {
          painlessMaxOpeningMm: 44,
          initialEvaluationSummary: 'Complemento corrigido após revisão.',
        },
      },
    }));

    renderPage();

    expect(await screen.findByTestId('workflow-forms-panel')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /voltar etapa/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    await goToDentistComplement();

    fillRequiredDentistComplement();
    fireEvent.click(screen.getByRole('button', { name: /salvar complemento do dentista/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-004/workflow-forms/BP-WF-004-INTAKE/submit',
        {
          payload: expect.objectContaining({
            dentist: expect.objectContaining({
              painlessMaxOpeningMm: 42,
              dentistClinicalDeclaration: ['accepted'],
            }),
          }),
        },
        'tok'
      )
    );
  });

  it('does not expose customer consent steps to the dentist shared intake review', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    expect(await screen.findByTestId('workflow-forms-panel')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /consentimentos/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/tratamento necessário para inscrição/i)).not.toBeInTheDocument();
  });

  it('prefills dentist system fields and renders the clinical declaration as one checkbox', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [sharedIntake()] });

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

  it('uses the dentist-filled consultation date in the anamnesis record', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({
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

    fireEvent.click(await screen.findByRole('button', { name: /próximo/i }));
    expect(await screen.findByTestId('dental-anamnesis-record')).toBeInTheDocument();
    expect(screen.getAllByText(/12\/05\/2026/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/20\/05\/2026/)).not.toBeInTheDocument();
  });

  it('shows the dentist clinical form as three sections with clinical subsections grouped under section 2', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [sharedIntake()] });

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
    expect(screen.getAllByText(/realizar o exame com o paciente em posição de cabeça natural/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/sempre que possível, associar a avaliação clínica a fotografias padronizadas/i).length
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/info interna/i)).not.toBeInTheDocument();
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
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({
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

    mockApiGet
      .mockResolvedValueOnce({ orders: [createOrder()] })
      .mockResolvedValueOnce({ forms: [listForm] })
      .mockResolvedValueOnce(detailedForm);

    renderPage();

    await screen.findByText(/seção 1 de 3/i);
    fireEvent.click(screen.getByRole('button', { name: /próxima etapa/i }));

    expect(await screen.findByText(/bruxismo diagnosticado/i)).toBeInTheDocument();
    expect(mockApiGet).toHaveBeenCalledWith(
      '/v1/orders/BP-DEMO-004/workflow-forms/BP-WF-004-INTAKE',
      'tok'
    );
  });

  it('renders the clinical form without duplicate internal heading, release metadata or consolidated notice card', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    expect(await screen.findByText(/formulário clínico biteplaner/i)).toBeInTheDocument();
    expect(screen.queryByText(/avaliação clínica biteplaner consolidada/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/liberado em/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/enviado em/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/enviado$/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /formulário clínico biteplaner/i })).toHaveLength(1);
    expect(screen.getAllByRole('heading', { name: /dados iniciais/i })).toHaveLength(1);
  });

  it('includes the detailed facial profile and skeletal pattern fields in the dentist complement', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByTestId('workflow-forms-panel');
    await goToDentistComplement();

    expect(screen.getByText(/5\.1\. avaliação geral do terço facial/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/observações sobre proporções/i)).toBeInTheDocument();
    expect(screen.getByText(/5\.2\. perfil facial - tecidos moles/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/região nasal - observações/i)).toBeInTheDocument();
    expect(screen.getByText(/5\.3\. avaliação facial frontal - tecidos moles/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/terço superior - observações/i)).toBeInTheDocument();
    expect(screen.getByText(/5\.4\. padrão esquelético - análise clínica/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/observações.*edge-to-edge/i)).toBeInTheDocument();
    expect(screen.getByText(/5\.5\. medidas cefalométricas/i)).toBeInTheDocument();
    expect(screen.getByText(/5\.6\. síntese diagnóstica - perfil facial e padrão esquelético/i)).toBeInTheDocument();
  });

  it('does not show removed broad dentist complement questions', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [sharedIntake()] });

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

  it('downloads the anamnesis PDF when advancing from the summary step', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

    await screen.findByRole('heading', { name: /avalia/i });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    expect(MockPdfWorker.instances).toHaveLength(1);
    expect(MockPdfWorker.instances[0]?.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        draft: expect.objectContaining({
          anamnesisSummary: 'Resumo clínico completo.',
          anamnesisDownloaded: true,
        }),
      })
    );
    expect(screen.getByLabelText(/^solicita.*produ/i)).toBeInTheDocument();

    act(() => {
      MockPdfWorker.instances[0]?.resolvePdf();
    });

    const downloadedBlob = vi.mocked(URL.createObjectURL).mock.calls[0]?.[0] as Blob;
    expect(downloadedBlob.type).toBe('application/pdf');
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });
});
