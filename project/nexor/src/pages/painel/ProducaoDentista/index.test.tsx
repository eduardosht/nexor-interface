import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
        <Routes>
          <Route path="/painel/dentista/producao/:orderId" element={<ProducaoDentista />} />
          <Route path="/painel/biteplaner" element={<div>hub</div>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
}

async function goToDentistComplement() {
  for (let index = 0; index < 8 && !screen.queryByRole('button', { name: /salvar complemento do dentista/i }); index += 1) {
    fireEvent.click(await screen.findByRole('button', { name: /próxima etapa/i }));
  }
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
  fireEvent.change(getPainlessOpeningInput(), { target: { value: '42' } });
  fireEvent.click(
    screen.getByRole('checkbox', {
      name: /declaro que as informações acima foram coletadas através de exame clínico/i,
    })
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

    const stepCardSource = productionStyles.slice(
      productionStyles.indexOf('export const StepCard'),
      productionStyles.indexOf('export const StepTop')
    );
    const stepBadgeSource = productionStyles.slice(
      productionStyles.indexOf('export const StepBadge'),
      productionStyles.indexOf('export const StepMeta')
    );

    expect(stepCardSource).toContain('grid-template-columns: auto minmax(0, 1fr)');
    expect(stepCardSource).toContain('align-items: center');
    expect(stepCardSource).toContain("$completed ? '#ECFDF3'");
    expect(stepCardSource).not.toContain('position: relative');
    expect(stepBadgeSource).not.toContain('position: absolute');
    expect(productionStyles).not.toContain('export const StepCheck');
    expect(readFileSync(join(process.cwd(), 'src/pages/painel/ProducaoDentista/index.tsx'), 'utf8')).not.toContain(
      'StepCheckIcon'
    );
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
    expect(screen.getAllByText(/^1$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^2$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^3$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^4$/).length).toBeGreaterThan(0);
    expect(screen.getByText(/resumo anamnese/i)).toBeInTheDocument();
    expect(screen.queryByText(/^anexos obrigatórios$/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /salvar rascunho/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /finalizar/i })).toBeDisabled();

    await fillProductionRequestUntilLabSelection();
    expect(screen.getAllByLabelText(/4\.0 de 5 avaliações do laboratório/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/2 avaliações/i)).not.toBeInTheDocument();
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

  it('keeps the production steps as compact sticky top navigation at 1440px layouts', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

    expect(await screen.findByTestId('dentist-production-steps')).toBeInTheDocument();

    const stylesheet = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n');
    const stepsClass = getGeneratedClass(screen.getByTestId('dentist-production-steps'));
    const stepDescriptionClass = getGeneratedClass(screen.getAllByText(/revise e complemente/i)[0]);
    fireEvent.click(screen.getByRole('button', { name: /resumo anamnese/i }));
    const anamnesisSideNavClass = getGeneratedClass(screen.getByRole('navigation', { name: /navegacao da ficha de anamnese/i }));

    expect(stylesheet).toMatch(new RegExp(`@media \\(max-width:\\s?1440px\\).*\\.${stepsClass}\\{[^}]*position:sticky;[^}]*top:0`, 's'));
    expect(stylesheet).toContain('grid-template-columns:1fr');
    expect(stylesheet).toMatch(/grid-template-columns:repeat\(4,\s?minmax\(150px,\s?1fr\)\)/);
    expect(stylesheet).toMatch(new RegExp(`@media \\(max-width:\\s?1440px\\).*\\.${stepDescriptionClass}\\{[^}]*display:none`, 's'));
    expect(stylesheet).toMatch(new RegExp(`@media \\(max-width:\\s?1440px\\).*\\.${anamnesisSideNavClass}\\{[^}]*display:none`, 's'));
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
    expect(getPainlessOpeningInput()).toBeInTheDocument();

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

  it('shows the dentist clinical form as three sections with clinical subsections grouped under section 2', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    expect(await screen.findByText(/seção 1 de 3/i)).toBeInTheDocument();
    expect(screen.queryByText(/seção 1 de 7/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/seção 1 - dados iniciais/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /próxima etapa/i }));

    expect(screen.getAllByText(/seção 2 - dados clínicos para seu cuidado/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/histórico odontológico e orofacial/i)).toBeInTheDocument();
    expect(screen.getByText(/sintomas atuais - dor orofacial, cervical e impacto funcional/i)).toBeInTheDocument();
    expect(screen.getAllByText(/hábitos de vida/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /complemento dentista/i }));

    await waitFor(() => expect(screen.getAllByText(/seção 3 - complemento dentista/i).length).toBeGreaterThan(0));
    expect(screen.getAllByText(/realizar o exame com o paciente em posição de cabeça natural/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/sempre que possível, associar a avaliação clínica a fotografias padronizadas/i).length
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/info interna/i)).not.toBeInTheDocument();
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
    expect(screen.getAllByRole('heading', { name: /seção 1 - dados iniciais/i })).toHaveLength(1);
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
