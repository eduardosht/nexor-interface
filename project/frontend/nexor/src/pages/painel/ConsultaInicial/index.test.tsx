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

describe('ConsultaInicial', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
  });

  it('shows the initial consultation order with a clickable map of nearby clinics', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [scheduledOrder()] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-order-status')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /visão geral dos steps/i })).toHaveAttribute('href', '/painel/biteplaner/jornada');
    expect(screen.getByTestId('step-breadcrumb-current')).toHaveTextContent(/consulta inicial/i);
    expect(screen.getByText(/pre-requisito/i)).toBeInTheDocument();
    expect(screen.getByText(/decisão clínica/i)).toBeInTheDocument();
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/pedido/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/bp-demo-002/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/status atual/i);
    expect(screen.queryByText(/formulário pré-consulta/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/avaliação inicial compartilhada biteplaner/i)).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /buscar clínicas/i })).toHaveStyle({
      width: 'max-content',
      maxWidth: '100%',
    });
    expect(screen.getByDisplayValue('04567-000')).toBeInTheDocument();
    expect(screen.getByTestId('consultation-map')).toBeInTheDocument();
    expect(screen.getAllByTestId('consultation-marker').length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByTestId('consultation-marker')[1]);

    expect(screen.getAllByText(/instituto paulistano de odontologia esportiva/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/dra\. camila moura/i)).toBeInTheDocument();
    expect(screen.getByText(/confirme quando a consulta estiver agendada/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /consulta agendada/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /selecionar consultório/i })).not.toBeInTheDocument();
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
  });

  it('lets the athlete confirm a scheduled consultation and link the order to the licensed dentist', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [scheduledOrder()] });
    mockApiPost.mockResolvedValueOnce({
      order: {
        ...scheduledOrder(),
        status: 'awaiting_dentist_acceptance',
        statusLabel: 'Aguardando aceite do dentista',
        stage: 'dentist_acceptance_pending',
        practice_location: { id: 'practice-demo-003', name: 'Instituto Paulistano de Odontologia Esportiva' },
      },
    });

    renderPage();

    expect(await screen.findByRole('button', { name: /buscar clínicas/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('consultation-marker').length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByTestId('consultation-marker')[1]);

    expect(screen.getAllByText(/instituto paulistano de odontologia esportiva/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/use os dados abaixo para entrar em contato com o consultório fora da plataforma/i)).toBeInTheDocument();
    expect(screen.getByText(/\(11\) 4000-1003/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /consulta agendada/i }));
    expect(mockApiPost).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: /confirmar consulta agendada/i })).toBeInTheDocument();
    expect(screen.getByText(/combinar a data da consulta e confirmar os valores/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /sim, ja combinei/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-002/initial-consultation-scheduled',
        { practiceLocationId: 'practice-demo-003' },
        'tok'
      )
    );
    expect(await screen.findByText(/aguardando o dentista aceitar a ordem via sistema/i)).toBeInTheDocument();
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
  });

  it('offers ready WhatsApp and e-mail messages to indicate dentist licensing without unlocking the current order', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [scheduledOrder()] });

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
});
