import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiPost, mockNavigate, mockRefreshBackendUser } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiPost: vi.fn(),
  mockNavigate: vi.fn(),
  mockRefreshBackendUser: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: mockUseAuth }));
vi.mock('../../../lib/api', () => ({
  api: {
    post: mockApiPost,
  },
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { CadastroPerfilBiteplaner } from './index';

function renderPage(path = '/painel/biteplaner/cadastro/dentista') {
  mockUseAuth.mockReturnValue({
    loading: false,
    session: { access_token: 'tok', user: { id: '1' } },
    backendUser: { email: 'profissional@nexor.com', roles: [], productRoles: [] },
    isMockMode: false,
    demoPersona: null,
    refreshBackendUser: mockRefreshBackendUser,
  });

  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider theme={lightTheme}>
        <Routes>
          <Route path="/painel/biteplaner/cadastro/:role" element={<CadastroPerfilBiteplaner />} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
}

function mockCepLookup() {
  const fetchMock = vi.fn(async (url: string) => {
    if (url.startsWith('https://cep.awesomeapi.com.br/json/')) {
      return {
        ok: true,
        json: async () => ({
          cep: '01001-000',
          lat: '-23.5505',
          lng: '-46.6333',
        }),
      };
    }

    return {
      ok: true,
      json: async () => ({
        cep: '01001-000',
        logradouro: 'Praça da Sé',
        complemento: 'lado ímpar',
        unidade: '',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
        estado: 'São Paulo',
        regiao: 'Sudeste',
        ibge: '3550308',
        gia: '1004',
        ddd: '11',
        siafi: '7107',
      }),
    };
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}


describe('CadastroPerfilBiteplaner', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiPost.mockReset();
    mockNavigate.mockReset();
    mockRefreshBackendUser.mockReset();
    mockRefreshBackendUser.mockResolvedValue(undefined);
    vi.stubGlobal('scrollTo', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('scrolls to the top when the registration page opens', () => {
    renderPage('/painel/biteplaner/cadastro/parceiro');

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('renders role-specific Biteplaner registration hero titles', () => {
    let view = renderPage('/painel/biteplaner/cadastro/parceiro');
    expect(screen.getByRole('heading', { name: /cadastro de parceiro biteplaner/i })).toBeInTheDocument();

    view.unmount();
    view = renderPage('/painel/biteplaner/cadastro/dentista');
    expect(screen.getByRole('heading', { name: /solicitar licenciamento do dentista/i })).toBeInTheDocument();
  });

  it('hides the registration hero icon on tablet and smaller screens', () => {
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/painel/CadastroPerfilBiteplaner/styles.ts'), 'utf8');

    expect(stylesSource).toContain('@media (max-width: 768px)');
    expect(stylesSource).toContain('display: none;');
  });

  it('asks for CRO and fiscal document on dentist licensing', () => {
    let view = renderPage('/painel/biteplaner/cadastro/dentista');

    expect(screen.getByLabelText(/cro/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/nome profissional/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /tipo de documento fiscal/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^cpf/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^cnpj/i)).toBeInTheDocument();
    expect(screen.getByText(/por que pedimos cpf e cnpj/i)).toBeInTheDocument();
    expect(screen.getAllByText(/criação da conta financeira/i).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText(/resumo profissional/i)).not.toBeInTheDocument();

    view.unmount();
    renderPage('/painel/biteplaner/cadastro/parceiro');

    expect(screen.queryByLabelText(/^cpf/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/por que pedimos cnpj e cpf/i)).not.toBeInTheDocument();
  });

  it('keeps submit disabled until required dentist fields and terms are filled', () => {
    renderPage();

    const submit = screen.getByRole('button', { name: /enviar solicitação/i });
    const cancel = screen.getByRole('button', { name: /cancelar/i });
    expect(submit).toBeDisabled();
    expect(cancel).toHaveAttribute('data-variant', 'secondary');
    expect(screen.getByText(/seus dados est.o protegidos/i)).toBeInTheDocument();
    expect(screen.queryByText(/salvar rascunho/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/dados da clínica/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cadastre a clínica de atendimento/i)).not.toBeInTheDocument();
    expect(screen.getByText(/a nexor ir. avaliar seu licenciamento como dentista/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/campos obrigatórios pendentes/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/cro/i), {
      target: { value: 'CRO-SP 12345' },
    });
    fireEvent.change(screen.getByLabelText(/^cpf/i), {
      target: { value: '52998224725' },
    });
    fireEvent.change(screen.getByLabelText(/^cnpj/i), {
      target: { value: '19131243000197' },
    });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));

    expect(submit).toBeEnabled();
  });
  it('applies CRO mask and keeps dentist submit disabled while CRO is invalid', () => {
    renderPage();

    const submit = screen.getByRole('button', { name: /enviar solicita/i });

    fireEvent.change(screen.getByLabelText(/cro/i), {
      target: { value: 'sp12345' },
    });
    fireEvent.change(screen.getByLabelText(/^cpf/i), {
      target: { value: '52998224725' },
    });
    fireEvent.change(screen.getByLabelText(/^cnpj/i), {
      target: { value: '19131243000197' },
    });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/privacidade/i));

    expect(screen.getByLabelText(/cro/i)).toHaveValue('CRO-SP 12345');
    expect(submit).toBeEnabled();

    fireEvent.change(screen.getByLabelText(/cro/i), {
      target: { value: 'xx123' },
    });

    expect(screen.getByLabelText(/cro/i)).toHaveValue('CRO-XX 123');
    expect(screen.getAllByText(/cro v.lido no formato/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/campos preenchidos incorretamente/i)).toBeInTheDocument();
    expect(submit).toBeDisabled();
  });
  it('submits a dentist request and shows a success message', async () => {
    mockApiPost.mockResolvedValueOnce({
      request: { productKey: 'biteplaner', status: 'pending', croNumber: 'CRO-SP 12345' },
    });
    renderPage();

    fireEvent.change(screen.getByLabelText(/cro/i), {
      target: { value: 'CRO-SP 12345' },
    });
    fireEvent.change(screen.getByLabelText(/^cpf/i), {
      target: { value: '52998224725' },
    });
    fireEvent.change(screen.getByLabelText(/^cnpj/i), {
      target: { value: '19131243000197' },
    });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/products/biteplaner/dentist-license-requests',
        {
          croNumber: 'CRO-SP 12345',
          cpf: '52998224725',
          cnpj: '19131243000197',
        },
        'tok'
      );
      expect(mockApiPost.mock.calls[0][1]).not.toHaveProperty('practiceLocation');
      expect(mockApiPost.mock.calls[0][1]).not.toHaveProperty('practiceLocations');
      expect(screen.getByRole('status')).toHaveTextContent(/solicitação enviada/i);
      expect(screen.getByRole('status')).toHaveTextContent(/avaliar seu cro/i);
      expect(mockRefreshBackendUser).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/painel/home');
    });
  });
  it('does not render clinic fields for dentist registration', () => {
    renderPage();

    expect(screen.queryByRole('heading', { name: /dados da clínica/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/nome da clínica/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/cep da clínica/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /clínica adaptada/i })).not.toBeInTheDocument();
  });


  it('applies CPF and CNPJ masks for dentist fiscal documents', () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/^cpf/i), {
      target: { value: '52998224725' },
    });
    fireEvent.change(screen.getByLabelText(/^cnpj/i), {
      target: { value: '19131243000197' },
    });

    expect(screen.getByLabelText(/^cpf/i)).toHaveValue('529.982.247-25');
    expect(screen.getByLabelText(/^cnpj/i)).toHaveValue('19.131.243/0001-97');
  });
  it('renders dentist terms with only relevant phrases emphasized', () => {
    renderPage();

    expect(screen.getAllByText(/termos de cadastro operacional/i).some((node) => node.tagName === 'STRONG')).toBe(true);
    expect(
      screen.getAllByText(/política de privacidade/i).some((node) => node.tagName === 'STRONG')
    ).toBe(true);
    expect(screen.getByText(/contato comercial e institucional/i).tagName).toBe('STRONG');
  });

  it('shows terms reading links outside the checkbox labels', () => {
    renderPage();

    expect(screen.getByText(/leia antes de aceitar/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /termos de cadastro/i })).toHaveAttribute(
      'href',
      '/termos'
    );
    expect(screen.getByRole('link', { name: /política de privacidade/i })).toHaveAttribute(
      'href',
      '/privacidade'
    );
  });

  it('submits partner requests using the route role', async () => {
    mockApiPost.mockResolvedValue({
      productRole: { productKey: 'biteplaner', role: 'partner', status: 'pending' },
    });
    const view = renderPage('/painel/biteplaner/cadastro/parceiro');

    fireEvent.change(screen.getByLabelText(/nome da empresa/i), {
      target: { value: 'Performance Partners' },
    });
    expect(screen.queryByRole('button', { name: /tipo de documento/i })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^cnpj/i), {
      target: { value: '19131243000197' },
    });
    fireEvent.click(screen.getByLabelText(/coach\/personal/i));
    fireEvent.change(screen.getByPlaceholderText(/digite ou selecione um local/i), {
      target: { value: 'Box de Crossfit' },
    });
    fireEvent.keyDown(screen.getByPlaceholderText(/digite ou selecione um local/i), { key: 'Enter' });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/products/biteplaner/roles/partner',
        {
          name: 'Performance Partners',
          documentType: 'cnpj',
          documentNumber: '19.131.243/0001-97',
          partnerType: 'coach_personal',
          serviceLocations: ['Box de Crossfit'],
        },
        'tok'
      );
    });
    view.unmount();
  });

  it('keeps partner registration restricted to CNPJ', async () => {
    mockApiPost.mockResolvedValue({
      productRole: { productKey: 'biteplaner', role: 'partner', status: 'pending' },
    });
    renderPage('/painel/biteplaner/cadastro/parceiro');

    expect(screen.queryByRole('button', { name: /tipo de documento/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^cpf/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/nome da empresa ou parceiro/i), {
      target: { value: 'Coach Performance' },
    });
    fireEvent.change(screen.getByLabelText(/^cnpj/i), {
      target: { value: '19131243000197' },
    });
    fireEvent.click(screen.getByLabelText(/coach\/personal/i));
    fireEvent.change(screen.getByPlaceholderText(/digite ou selecione um local/i), {
      target: { value: 'Parque de treino' },
    });
    fireEvent.keyDown(screen.getByPlaceholderText(/digite ou selecione um local/i), { key: 'Enter' });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/products/biteplaner/roles/partner',
        expect.objectContaining({
          name: 'Coach Performance',
          documentType: 'cnpj',
          documentNumber: '19.131.243/0001-97',
          partnerType: 'coach_personal',
          serviceLocations: ['Parque de treino'],
        }),
        'tok'
      );
    });
  });

  it('keeps partner submit disabled while CNPJ is invalid', () => {
    renderPage('/painel/biteplaner/cadastro/parceiro');

    const submit = screen.getByRole('button', { name: /enviar solicitação/i });
    fireEvent.change(screen.getByLabelText(/nome da empresa ou parceiro/i), {
      target: { value: 'Parceiro Inválido' },
    });
    fireEvent.change(screen.getByLabelText(/^cnpj/i), {
      target: { value: '11111111111111' },
    });
    fireEvent.click(screen.getByLabelText(/coach\/personal/i));
    fireEvent.change(screen.getByPlaceholderText(/digite ou selecione um local/i), {
      target: { value: 'Academia' },
    });
    fireEvent.keyDown(screen.getByPlaceholderText(/digite ou selecione um local/i), { key: 'Enter' });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));

    expect(screen.getByLabelText(/^cnpj/i)).toHaveValue('11.111.111/1111-11');
    expect(submit).toBeDisabled();
  });

  it('submits an academy partner request with location filled from CEP', async () => {
    const fetchMock = mockCepLookup();
    mockApiPost.mockResolvedValue({
      productRole: { productKey: 'biteplaner', role: 'partner', status: 'pending' },
    });
    renderPage('/painel/biteplaner/cadastro/parceiro');

    fireEvent.change(screen.getByLabelText(/nome da empresa ou parceiro/i), {
      target: { value: 'Performance Academy' },
    });
    fireEvent.change(screen.getByLabelText(/^cnpj/i), {
      target: { value: '19131243000197' },
    });

    const partnerTypeGroup = screen.getByRole('group', { name: /tipo de parceiro/i });
    fireEvent.click(within(partnerTypeGroup).getByLabelText(/academia/i));

    expect(screen.getByRole('heading', { name: /localização/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^cep/i), {
      target: { value: '01001000' },
    });
    fireEvent.blur(screen.getByLabelText(/^cep/i));

    await waitFor(() => {
      expect(screen.getByLabelText(/endereço/i)).toHaveValue('Praça da Sé - Sé, São Paulo - SP');
    });

    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));
    fireEvent.click(screen.getByRole('button', { name: /enviar solicita/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json/');
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/products/biteplaner/roles/partner',
        expect.objectContaining({
          name: 'Performance Academy',
          documentType: 'cnpj',
          documentNumber: '19.131.243/0001-97',
          partnerType: 'academy',
          location: expect.objectContaining({
            cep: '01001-000',
            address: 'Praça da Sé - Sé, São Paulo - SP',
            city: 'São Paulo',
            state: 'SP',
          }),
        }),
        'tok'
      );
    });
  });

});
