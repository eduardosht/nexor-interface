import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="consultation-map">{children}</div>,
  TileLayer: () => <div data-testid="consultation-tiles" />,
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
    <button type="button" data-testid="consultation-marker" onClick={() => eventHandlers?.click?.()}>
      {children}
    </button>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

import { ConsultaInicial } from './index';

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
        <ConsultaInicial />
      </ThemeProvider>
    </MemoryRouter>
  );
}

function scheduledOrder() {
  return {
    id: 'BP-DEMO-002',
    status: 'awaiting_scheduling',
    statusLabel: 'Aguardando consulta inicial',
    stage: 'awaiting_initial_consultation',
    created_at: '2026-05-01T10:00:00.000Z',
    customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
    practice_location: { id: 'practice-demo-001', name: 'Clínica Esportiva Nexor' },
  };
}

function sharedIntake(requiresAdaptedClinic: 'yes' | 'no' = 'no') {
  return {
    id: 'workflow-form-1',
    orderId: 'BP-DEMO-002',
    templateKey: 'customer_pre_consultation_intake',
    stepKey: 'clinical_prerequisite',
    status: 'submitted',
    canViewPayload: true,
    summary: null,
    releasedAt: '2026-05-01T10:00:00.000Z',
    submittedAt: '2026-05-01T10:00:00.000Z',
    payload: {
      customer: {
        requiresAdaptedClinic,
      },
    },
  };
}

describe('ConsultaInicial', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
  });

  it('shows the initial consultation order with a clickable map of nearby clinics', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [scheduledOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake('no')] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-order-status')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /visão geral dos steps/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('step-breadcrumb-current')).not.toBeInTheDocument();
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/pedido/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/bp-demo-002/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/status atual/i);
    expect(screen.queryByText(/formulário pré-consulta/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/avaliação inicial compartilhada biteplaner/i)).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /buscar clínicas/i })).toHaveStyle({
      width: 'max-content',
      maxWidth: '100%',
    });
    expect(screen.getByLabelText(/cep/i)).toHaveValue('');
    fireEvent.change(screen.getByLabelText(/cep/i), { target: { value: 'abc12345678' } });
    expect(screen.getByLabelText(/cep/i)).toHaveValue('12345-678');
    expect(screen.getByTestId('consultation-map')).toBeInTheDocument();
    expect(screen.getAllByTestId('consultation-marker').length).toBeGreaterThan(0);
    expect(screen.getByText(/cep 12345-678/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByTestId('consultation-marker')[1]);

    expect(screen.getAllByText(/instituto paulistano de odontologia esportiva/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/dra\. camila moura/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/4\.0 de 5 avaliações do dentista/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/8 avaliações/i)).not.toBeInTheDocument();
    expect(screen.getByText(/confirme quando a consulta estiver agendada/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /consulta agendada/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /selecionar consultório/i })).not.toBeInTheDocument();
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
  });

  it('locks clinic selection to adapted clinics when the customer requested adapted care', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [scheduledOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake('yes')] });

    renderPage();

    expect(await screen.findByText(/necessidade informada: clínica adaptada/i)).toBeInTheDocument();
    const adaptedFilter = screen.getByRole('checkbox', { name: /somente clínicas adaptadas/i });
    expect(adaptedFilter).toBeChecked();
    expect(adaptedFilter).toBeDisabled();
    expect(screen.getAllByText(/adaptada/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/não adaptada/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/instituto paulistano de odontologia esportiva/i)).not.toBeInTheDocument();
  });

  it('limits clinic cards to four items and paginates the remaining clinics', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [scheduledOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake('no')] });

    renderPage();

    expect(await screen.findByRole('navigation', { name: /paginação de clínicas/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /clínica:/i })).toHaveLength(4);
    expect(screen.getByText(/mostrando 1 a 4 de 5 clínicas/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /próxima página de clínicas/i }));

    expect(screen.getAllByRole('button', { name: /clínica:/i })).toHaveLength(1);
    expect(screen.getByText(/mostrando 5 a 5 de 5 clínicas/i)).toBeInTheDocument();
  });

  it('lets the athlete confirm a scheduled consultation and link the order to the licensed dentist', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [scheduledOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake('no')] });
    mockApiPost.mockResolvedValueOnce({
      ...scheduledOrder(),
        status: 'awaiting_dentist_acceptance',
        statusLabel: 'Aguardando aceite do dentista',
        stage: 'dentist_acceptance_pending',
        practice_location: { id: 'practice-demo-003', name: 'Instituto Paulistano de Odontologia Esportiva' },
    });

    renderPage();

    expect(await screen.findByRole('button', { name: /buscar clínicas/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('consultation-marker').length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByTestId('consultation-marker')[1]);

    expect(screen.getAllByText(/instituto paulistano de odontologia esportiva/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/use os dados abaixo para entrar em contato com o consultório fora da plataforma/i)).toBeInTheDocument();
    expect(screen.getByText(/\(11\) 4000-1003/i)).toBeInTheDocument();
    const clinicWhatsappLink = screen.getByRole('link', { name: /agendar pelo whatsapp/i });
    expect(clinicWhatsappLink).toHaveAttribute('href', expect.stringContaining('https://wa.me/551140001003'));
    expect(clinicWhatsappLink).toHaveAttribute(
      'href',
      expect.stringContaining(
        encodeURIComponent('Olá! Quero agendar uma consulta para uso do Biteplaner e saber valores.')
      )
    );
    expect(screen.getByTestId('clinic-whatsapp-icon')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /consulta agendada/i }));
    expect(mockApiPost).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: /confirmar consulta agendada/i })).toBeInTheDocument();
    expect(screen.getByText(/combinar a data da consulta e confirmar os valores/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /sim, ja combinei/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-002/practice-location-selection',
        { practiceLocationId: 'practice-demo-003' },
        'tok'
      )
    );
    expect(await screen.findByText(/aguardando o dentista aceitar a ordem via sistema/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /consulta agendada/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /aguardando aceite/i })).not.toBeInTheDocument();
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
  });

  it('keeps only the informed consultation message after the athlete already confirmed scheduling', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        orders: [
          {
            ...scheduledOrder(),
            status: 'awaiting_dentist_acceptance',
            statusLabel: 'Aguardando aceite do dentista',
            stage: 'dentist_acceptance_pending',
          },
        ],
      })
      .mockResolvedValueOnce({ forms: [sharedIntake('no')] });

    renderPage();

    expect(await screen.findByText(/consulta informada com sucesso/i)).toBeInTheDocument();
    expect(screen.getByText(/aguardando o dentista aceitar a ordem via sistema/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /consulta agendada/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /aguardando aceite/i })).not.toBeInTheDocument();
  });

  it('offers ready WhatsApp and e-mail messages to indicate dentist licensing without unlocking the current order', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [scheduledOrder()] })
      .mockResolvedValueOnce({ forms: [sharedIntake('no')] });

    renderPage();

    expect(await screen.findByText(/indique seu dentista de preferência/i)).toBeInTheDocument();
    expect(screen.getByText(/precisa selecionar uma clínica ja licenciada/i)).toBeInTheDocument();
    expect(screen.getByText(/o processo de licenciamento pode demorar/i)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /enviar por whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent('/parceiros#dentistas'))
    );
    expect(screen.getByRole('link', { name: /enviar por e-mail/i })).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent('/parceiros#dentistas'))
    );
  });

  it('uses admin modal buttons for the schedule confirmation modal', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/ConsultaInicial/index.tsx'), 'utf8');
    const styles = readFileSync(join(process.cwd(), 'src/pages/painel/ConsultaInicial/styles.ts'), 'utf8');

    expect(source).toContain('AdminModalActions');
    expect(source).toContain('AdminModalAction');
    expect(source).toContain('<S.CancelModalAction type="button"');
    expect(source).not.toContain('<S.ModalActions>');
    expect(styles).not.toContain('export const ModalActions');
    expect(styles).toContain('export const CancelModalAction = styled(AdminModalAction)');
    expect(styles).toContain('box-shadow: none');
  });
});
