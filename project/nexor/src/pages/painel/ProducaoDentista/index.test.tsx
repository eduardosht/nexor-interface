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
    backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
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
  for (let index = 0; index < 3; index += 1) {
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

function getGeneratedClass(element: Element) {
  const generatedClass = Array.from(element.classList).find((className) => !className.startsWith('sc-'));

  if (!generatedClass) {
    throw new Error('Styled-components generated class was not found.');
  }

  return generatedClass;
}

async function fillProductionRequestUntilLabSelection() {
  await screen.findByRole('heading', { name: /solicitação de produção/i });

  fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
    target: { value: 'Resumo clínico completo.' },
  });
  fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

  fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
    target: { value: 'Solicitação preenchida.' },
  });
  fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

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

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the dentist production wizard with four steps and blocks completion until all required data exists', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

    expect(await screen.findByRole('heading', { name: /solicitação de produção/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /visão geral dos steps/i })).toHaveAttribute('href', '/painel/biteplaner/jornada');
    expect(screen.getByTestId('step-breadcrumb-current')).toHaveTextContent(/laboratório/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/pedido/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/bp-demo-004/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/status atual/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/última atualização/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/etapa atual/i);
    expect(screen.getAllByText(/^1$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^2$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^3$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^4$/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /finalizar/i })).toBeDisabled();

    await fillProductionRequestUntilLabSelection();
    expect(screen.getAllByLabelText(/4\.0 de 5 avaliações do laboratório/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/2 avaliações/i)).not.toBeInTheDocument();
  });

  it('keeps the production steps as compact sticky top navigation at 1440px layouts', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

    expect(await screen.findByTestId('dentist-production-steps')).toBeInTheDocument();

    const stylesheet = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n');
    const stepsClass = getGeneratedClass(screen.getByTestId('dentist-production-steps'));
    const stepDescriptionClass = getGeneratedClass(screen.getAllByText(/revise, complemente e baixe/i)[0]);
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

  it('saves draft data and rehydrates it from the API payload', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });
    mockApiPost.mockResolvedValueOnce({
      order: createOrder({
        productionRequestDraft: {
          anamnesisSummary: 'Paciente apto sem sinais impeditivos.',
          anamnesisDownloaded: false,
          productionRequestSummary: '',
          labNotes: '',
          scan3dFileName: '',
          prescriptionFileName: '',
          lgpdConfirmed: false,
          selectedLabId: null,
        },
      }),
    });

    renderPage();

    await screen.findByRole('heading', { name: /solicitação de produção/i });

    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Paciente apto sem sinais impeditivos.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar rascunho/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-004/production-request/draft',
        expect.objectContaining({ anamnesisSummary: 'Paciente apto sem sinais impeditivos.' }),
        'tok'
      )
    );
    expect(await screen.findByRole('status')).toHaveTextContent(/rascunho salvo com sucesso/i);
  });

  it('renders the modern dental anamnesis record after the dentist review', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [reviewedSharedIntake()] });

    renderPage();

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

    await screen.findByRole('heading', { name: /solicitação de produção/i });
    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
      target: { value: 'Solicitação preenchida.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    fireEvent.change(screen.getByLabelText(/selecionar escaneamento 3d intraoral/i), {
      target: { files: [new File(['scan'], 'scan.stl', { type: 'model/stl' })] },
    });

    expect(screen.getByRole('button', { name: /finalizar/i })).toBeDisabled();
  });

  it('only shows the anamnesis summary after the dentist completes the shared review', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByRole('heading', { name: /solicitação de produção/i });

    expect(screen.queryByLabelText(/resumo da avaliação inicial \/ anamnese/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^salvar rascunho$/i })).not.toBeInTheDocument();

    await goToDentistComplement();
    mockApiPost.mockResolvedValueOnce(reviewedSharedIntake());
    fireEvent.change(getPainlessOpeningInput(), { target: { value: '42' } });
    fireEvent.change(screen.getByLabelText(/s.ntese da avalia/i), {
      target: { value: 'Sem sinais impeditivos para seguir.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar complemento do dentista/i }));

    expect(await screen.findByLabelText(/^solicita.*produ/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));
    expect(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i)).toHaveValue(
      'Sem sinais impeditivos para seguir.'
    );
  });

  it('advances after saving the dentist complement when the response only includes the dentist payload', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [createOrder()] }).mockResolvedValueOnce({ forms: [sharedIntake()] });

    renderPage();

    await screen.findByRole('heading', { name: /solicitação de produção/i });
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

    fireEvent.change(getPainlessOpeningInput(), { target: { value: '42' } });
    fireEvent.change(screen.getByLabelText(/s.ntese da avalia/i), {
      target: { value: 'Sem sinais impeditivos para seguir.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar complemento do dentista/i }));

    expect(await screen.findByLabelText(/^solicita.*produ/i)).toBeInTheDocument();
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

    await screen.findByRole('heading', { name: /solicitação de produção/i });

    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
      target: { value: 'Solicitação preenchida.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

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

    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/pdf/i);
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

    await screen.findByRole('heading', { name: /solicitação de produção/i });
    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
      target: { value: 'Solicitação preenchida.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

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

    await screen.findByRole('heading', { name: /solicitação de produção/i });
    fireEvent.change(screen.getByLabelText(/resumo da avaliação inicial \/ anamnese/i), {
      target: { value: 'Resumo clínico completo.' },
    });
    fireEvent.click(getWizardNextButton());

    fireEvent.change(screen.getByLabelText(/solicitação de produção/i), {
      target: { value: 'Solicitação preenchida.' },
    });
    fireEvent.click(getWizardNextButton());

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

    expect(await screen.findByText(/avaliação inicial compartilhada biteplaner/i)).toBeInTheDocument();
    expect(screen.getByText(/bruxismo diagnosticado/i)).toBeInTheDocument();
    expect(screen.getByText(/musculação cinco vezes por semana/i)).toBeInTheDocument();
    await goToDentistComplement();
    expect(getPainlessOpeningInput()).toBeInTheDocument();

    fireEvent.change(getPainlessOpeningInput(), { target: { value: '42' } });
    fireEvent.change(screen.getByLabelText(/s.ntese da avalia/i), {
      target: { value: 'Sem sinais impeditivos para seguir.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar complemento do dentista/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-004/workflow-forms/BP-WF-004-INTAKE/submit',
        {
          payload: expect.objectContaining({
            dentist: expect.objectContaining({
              painlessMaxOpeningMm: 42,
              initialEvaluationSummary: 'Sem sinais impeditivos para seguir.',
            }),
          }),
        },
        'tok'
      )
    );
    expect(await screen.findByLabelText(/^solicita.*produ/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/formulário enviado/i).length).toBeLessThanOrEqual(1);
    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));
    expect(screen.getByLabelText(/resumo da avalia.*inicial \/ anamnese/i)).toHaveValue(
      'Sem sinais impeditivos para seguir.'
    );
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

    expect(await screen.findByRole('heading', { name: /avalia.*compartilhada biteplaner/i })).toBeInTheDocument();
    await goToDentistComplement();
    expect(screen.queryByRole('button', { name: /voltar etapa/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    fireEvent.change(getPainlessOpeningInput(), { target: { value: '44' } });
    fireEvent.change(screen.getByLabelText(/s.ntese da avalia/i), {
      target: { value: 'Complemento corrigido após revisão.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar complemento do dentista/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-004/workflow-forms/BP-WF-004-INTAKE/submit',
        {
          payload: expect.objectContaining({
            dentist: expect.objectContaining({
              painlessMaxOpeningMm: 44,
              initialEvaluationSummary: 'Complemento corrigido após revisão.',
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

    expect(await screen.findByRole('heading', { name: /avalia.*compartilhada biteplaner/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /consentimentos/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/tratamento necessário para inscrição/i)).not.toBeInTheDocument();
  });
});
