import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiPost, mockNavigate } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiPost: vi.fn(),
  mockNavigate: vi.fn(),
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
  const fetchMock = vi.fn().mockResolvedValue({
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
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function fillCepAndWaitForAddress() {
  fireEvent.change(screen.getByLabelText(/cep da clínica/i), {
    target: { value: '01001000' },
  });

  expect(screen.getByLabelText(/cep da clínica/i)).toHaveValue('01001-000');

  fireEvent.blur(screen.getByLabelText(/cep da clínica/i));

  await waitFor(() => {
    expect(screen.getByLabelText(/endereço da clínica/i)).toHaveValue(
      'Praça da Sé - Sé, São Paulo - SP'
    );
  });
}

describe('CadastroPerfilBiteplaner', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiPost.mockReset();
    mockNavigate.mockReset();
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
    expect(screen.getByRole('heading', { name: /solicitar cadastro de dentista/i })).toBeInTheDocument();

    view.unmount();
    renderPage('/painel/biteplaner/cadastro/laboratório');
    expect(screen.getByRole('heading', { name: /solicitar cadastro de laborat.rio/i })).toBeInTheDocument();
  });

  it('keeps submit disabled until required dentist and clinic fields and required terms are filled', async () => {
    mockCepLookup();
    renderPage();

    const submit = screen.getByRole('button', { name: /enviar solicitação/i });
    const cancel = screen.getByRole('button', { name: /cancelar/i });
    expect(submit).toBeDisabled();
    expect(cancel).toHaveAttribute('data-variant', 'secondary');
    expect(screen.getByText(/seus dados est.o protegidos/i)).toBeInTheDocument();
    expect(screen.queryByText(/salvar rascunho/i)).not.toBeInTheDocument();
    expect(screen.getByText(/cadastre a clínica de atendimento/i)).toBeInTheDocument();
    expect(screen.getByText(/a nexor irá verificar o cadastro do dentista/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nome profissional/i), {
      target: { value: 'Dra Maria' },
    });
    fireEvent.change(screen.getByLabelText(/cro/i), {
      target: { value: 'CRO-SP 12345' },
    });
    fireEvent.change(screen.getByLabelText(/resumo profissional/i), {
      target: { value: 'Dentista com foco em performance esportiva.' },
    });
    fireEvent.change(screen.getByLabelText(/nome da clínica/i), {
      target: { value: 'Clínica Esportiva Nexor' },
    });
    fireEvent.change(screen.getByLabelText(/dia e horário de atendimento/i), {
      target: { value: 'Segunda a sexta, 8h as 18h' },
    });
    fireEvent.change(screen.getByLabelText(/telefone da clínica/i), {
      target: { value: '11987654321' },
    });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));

    await fillCepAndWaitForAddress();

    expect(screen.queryByLabelText(/latitude/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/longitude/i)).not.toBeInTheDocument();
    expect(submit).toBeDisabled();

    const adaptedGroup = screen.getByRole('group', { name: /clínica adaptada/i });
    fireEvent.click(within(adaptedGroup).getByLabelText('Sim'));

    expect(submit).toBeEnabled();
  });

  it('fills clinic address fields automatically after a valid Brazilian CEP', async () => {
    const fetchMock = mockCepLookup();
    renderPage();

    fireEvent.change(screen.getByLabelText(/cep da clínica/i), {
      target: { value: '01001000' },
    });

    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.blur(screen.getByLabelText(/cep da clínica/i));

    await waitFor(() => {
      expect(screen.getByLabelText(/endereço da clínica/i)).toHaveValue(
        'Praça da Sé - Sé, São Paulo - SP'
      );
    });

    expect(fetchMock).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json/');
    expect(screen.getByLabelText(/cidade da clínica/i)).toHaveValue('São Paulo');
    expect(screen.getByRole('button', { name: /estado da clínica/i })).toHaveTextContent('SP');
  });

  it('does not request ViaCEP when the CEP input loses focus with an invalid value', () => {
    const fetchMock = mockCepLookup();
    renderPage();

    fireEvent.change(screen.getByLabelText(/cep da clínica/i), {
      target: { value: '01001' },
    });
    fireEvent.blur(screen.getByLabelText(/cep da clínica/i));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('lets the dentist choose the state with the design-system dropdown used on the contact form', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /estado da clínica/i }));
    fireEvent.click(screen.getByRole('option', { name: 'RJ' }));

    expect(screen.getByRole('button', { name: /estado da clínica/i })).toHaveAttribute(
      'aria-haspopup',
      'listbox'
    );
    expect(screen.getByRole('button', { name: /estado da clínica/i })).toHaveTextContent('RJ');
  });

  it('applies Brazilian masks to clinic CEP and phone fields', () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/cep da clínica/i), {
      target: { value: '04567000' },
    });
    fireEvent.change(screen.getByLabelText(/telefone da clínica/i), {
      target: { value: '11987654321' },
    });

    expect(screen.getByLabelText(/cep da clínica/i)).toHaveValue('04567-000');
    expect(screen.getByLabelText(/telefone da clínica/i)).toHaveValue('(11) 98765-4321');
  });

  it('applies CRO mask and keeps dentist submit disabled while CRO is invalid', async () => {
    mockCepLookup();
    renderPage();

    const submit = screen.getByRole('button', { name: /enviar solicita/i });

    fireEvent.change(screen.getByLabelText(/nome profissional/i), {
      target: { value: 'Dra Maria' },
    });
    fireEvent.change(screen.getByLabelText(/cro/i), {
      target: { value: 'sp12345' },
    });
    fireEvent.change(screen.getByLabelText(/resumo profissional/i), {
      target: { value: 'Dentista com foco em performance esportiva.' },
    });
    fireEvent.change(screen.getByLabelText(/nome da cl.nica/i), {
      target: { value: 'ClÃ­nica Esportiva Nexor' },
    });
    fireEvent.change(screen.getByLabelText(/dia e hor.rio de atendimento/i), {
      target: { value: 'Segunda a sexta, 8h as 18h' },
    });
    fireEvent.change(screen.getByLabelText(/telefone da cl.nica/i), {
      target: { value: '11987654321' },
    });
    fireEvent.click(within(screen.getByRole('group', { name: /clínica adaptada/i })).getByLabelText('Sim'));
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/privacidade/i));

    await fillCepAndWaitForAddress();

    expect(screen.getByLabelText(/cro/i)).toHaveValue('CRO-SP 12345');
    expect(submit).toBeEnabled();

    fireEvent.change(screen.getByLabelText(/cro/i), {
      target: { value: 'xx123' },
    });

    expect(screen.getByLabelText(/cro/i)).toHaveValue('CRO-XX 123');
    expect(screen.getByText(/cro v.lido no formato/i)).toBeInTheDocument();
    expect(submit).toBeDisabled();
  });

  it('keeps submit enabled when the optional complement is empty', async () => {
    mockCepLookup();
    renderPage();

    const submit = screen.getByRole('button', { name: /enviar solicitação/i });

    fireEvent.change(screen.getByLabelText(/nome profissional/i), {
      target: { value: 'Dra Maria' },
    });
    fireEvent.change(screen.getByLabelText(/cro/i), {
      target: { value: 'CRO-SP 12345' },
    });
    fireEvent.change(screen.getByLabelText(/resumo profissional/i), {
      target: { value: 'Dentista com foco em performance esportiva.' },
    });
    fireEvent.change(screen.getByLabelText(/nome da clínica/i), {
      target: { value: 'Clínica Esportiva Nexor' },
    });
    fireEvent.change(screen.getByLabelText(/dia e horário de atendimento/i), {
      target: { value: 'Segunda a sexta, 8h as 18h' },
    });
    fireEvent.change(screen.getByLabelText(/telefone da clínica/i), {
      target: { value: '11987654321' },
    });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));

    await fillCepAndWaitForAddress();

    expect(screen.getByLabelText(/^complemento da clínica$/i)).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('group', { name: /clínica adaptada/i })).getByLabelText('Sim'));
    expect(submit).toBeEnabled();
  });

  it('submits a dentist request and shows a success message', async () => {
    mockCepLookup();
    mockApiPost.mockResolvedValueOnce({
      productRole: { productKey: 'biteplaner', role: 'dentist', status: 'pending' },
    });
    renderPage();

    fireEvent.change(screen.getByLabelText(/nome profissional/i), {
      target: { value: 'Dra Maria' },
    });
    fireEvent.change(screen.getByLabelText(/cro/i), {
      target: { value: 'CRO-SP 12345' },
    });
    fireEvent.change(screen.getByLabelText(/resumo profissional/i), {
      target: { value: 'Dentista com foco em performance esportiva.' },
    });
    fireEvent.change(screen.getByLabelText(/nome da clínica/i), {
      target: { value: 'Clínica Esportiva Nexor' },
    });
    await fillCepAndWaitForAddress();
    fireEvent.change(screen.getByLabelText(/^complemento da clínica$/i), {
      target: { value: 'Sala 42' },
    });
    fireEvent.change(screen.getByLabelText(/dia e horário de atendimento/i), {
      target: { value: 'Segunda a sexta, 8h as 18h' },
    });
    fireEvent.change(screen.getByLabelText(/telefone da clínica/i), {
      target: { value: '11987654321' },
    });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));
    fireEvent.click(within(screen.getByRole('group', { name: /clínica adaptada/i })).getByLabelText('Sim'));
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/products/biteplaner/roles/dentist',
        expect.objectContaining({
          fullName: 'Dra Maria',
          croNumber: 'CRO-SP 12345',
          city: 'São Paulo',
          state: 'SP',
          practiceLocation: expect.objectContaining({
            name: 'Clínica Esportiva Nexor',
            address: 'Praça da Sé - Sé, São Paulo - SP',
            cep: '01001-000',
            complement: 'Sala 42',
            dentistName: 'Dra Maria',
            isAdapted: true,
            serviceHours: 'Segunda a sexta, 8h as 18h',
          }),
          practiceLocations: [
            expect.objectContaining({
              name: 'Clínica Esportiva Nexor',
              address: 'Praça da Sé - Sé, São Paulo - SP',
              cep: '01001-000',
              isAdapted: true,
            }),
          ],
        }),
        'tok'
      );
      expect(screen.getByRole('status')).toHaveTextContent(/solicitação enviada/i);
      expect(screen.getByRole('status')).toHaveTextContent(/nexor irá verificar/i);
      expect(mockNavigate).toHaveBeenCalledWith('/painel/home');
    });
  });

  it('keeps the dentist registration limited to a single clinic', async () => {
    mockCepLookup();
    mockApiPost.mockResolvedValueOnce({
      productRole: { productKey: 'biteplaner', role: 'dentist', status: 'pending' },
    });
    renderPage();

    fireEvent.change(screen.getByLabelText(/nome profissional/i), {
      target: { value: 'Dra Maria' },
    });
    fireEvent.change(screen.getByLabelText(/cro/i), {
      target: { value: 'CRO-SP 12345' },
    });
    fireEvent.change(screen.getByLabelText(/resumo profissional/i), {
      target: { value: 'Dentista com foco em performance esportiva.' },
    });

    expect(screen.getByRole('heading', { name: /dados da clínica/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /\+ clínica/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remover clínica/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/nome da clínica 2/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/nome da clínica \(\*\)/i), {
      target: { value: 'Clínica Centro' },
    });
    await fillCepAndWaitForAddress();
    fireEvent.change(screen.getByLabelText(/dia e horário de atendimento da clínica \(\*\)/i), {
      target: { value: 'Segunda a sexta, 8h as 18h' },
    });
    fireEvent.change(screen.getByLabelText(/telefone da clínica \(\*\)/i), {
      target: { value: '11987654321' },
    });
    fireEvent.click(within(screen.getByRole('group', { name: /clínica adaptada/i })).getByLabelText('Não'));

    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/products/biteplaner/roles/dentist',
        expect.objectContaining({
          practiceLocation: expect.objectContaining({
            name: 'Clínica Centro',
            cep: '01001-000',
            isAdapted: false,
          }),
          practiceLocations: [
            expect.objectContaining({
              name: 'Clínica Centro',
              address: 'Praça da Sé - Sé, São Paulo - SP',
              isAdapted: false,
              serviceHours: 'Segunda a sexta, 8h as 18h',
            }),
          ],
        }),
        'tok'
      );
    });
  });

  it('renders dentist terms with only relevant phrases emphasized', () => {
    renderPage();

    expect(screen.getByText(/termos de cadastro operacional/i).tagName).toBe('STRONG');
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

  it('submits partner and laboratory requests using the route role', async () => {
    mockApiPost.mockResolvedValue({
      productRole: { productKey: 'biteplaner', role: 'partner', status: 'pending' },
    });
    const view = renderPage('/painel/biteplaner/cadastro/parceiro');

    fireEvent.change(screen.getByLabelText(/nome da empresa/i), {
      target: { value: 'Performance Partners' },
    });
    expect(screen.getByRole('button', { name: /tipo de documento/i })).toHaveTextContent('CNPJ');
    fireEvent.change(screen.getByLabelText(/^cnpj/i), {
      target: { value: '19131243000197' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail de contato/i), {
      target: { value: 'contato@partner.test' },
    });
    fireEvent.change(screen.getByLabelText(/cidade e estado/i), {
      target: { value: 'Campinas, SP' },
    });
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
          contactEmail: 'contato@partner.test',
          cityState: 'Campinas, SP',
        },
        'tok'
      );
    });

    mockApiPost.mockClear();
    view.unmount();
    renderPage('/painel/biteplaner/cadastro/laboratório');

    fireEvent.change(screen.getByLabelText(/nome do laboratório/i), {
      target: { value: 'Lab Performance' },
    });
    fireEvent.change(screen.getByLabelText(/cnpj/i), {
      target: { value: '19131243000197' },
    });
    fireEvent.change(screen.getByLabelText(/resumo operacional/i), {
      target: { value: 'Laboratório especializado em dispositivos esportivos personalizados.' },
    });
    fireEvent.change(screen.getByLabelText(/nome do local/i), {
      target: { value: 'Unidade Central' },
    });
    fireEvent.change(screen.getByLabelText(/cep do local/i), {
      target: { value: '04567000' },
    });
    fireEvent.change(screen.getByLabelText(/cidade do local/i), {
      target: { value: 'São Paulo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /estado do local/i }));
    fireEvent.click(screen.getByRole('option', { name: 'SP' }));
    fireEvent.change(screen.getByLabelText(/endereço do local/i), {
      target: { value: 'Rua Funchal, 500 - São Paulo - SP' },
    });
    fireEvent.change(screen.getByLabelText(/dia e horário de operação/i), {
      target: { value: 'Segunda a sexta, 8h as 18h' },
    });
    fireEvent.change(screen.getByLabelText(/telefone do local/i), {
      target: { value: '11987654321' },
    });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/privacidade/i));
    fireEvent.click(screen.getByRole('button', { name: /enviar solicita/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/products/biteplaner/roles/lab',
        expect.objectContaining({
          labName: 'Lab Performance',
          cnpj: '19.131.243/0001-97',
          professionalSummary: 'Laboratório especializado em dispositivos esportivos personalizados.',
          locations: [expect.objectContaining({ name: 'Unidade Central', cep: '04567-000' })],
        }),
        'tok'
      );
    });
  });

  it('submits a partner request with CPF when the partner is an individual', async () => {
    mockApiPost.mockResolvedValue({
      productRole: { productKey: 'biteplaner', role: 'partner', status: 'pending' },
    });
    renderPage('/painel/biteplaner/cadastro/parceiro');

    fireEvent.click(screen.getByRole('button', { name: /tipo de documento/i }));
    fireEvent.click(screen.getByRole('option', { name: 'CPF' }));
    fireEvent.change(screen.getByLabelText(/nome da empresa ou parceiro/i), {
      target: { value: 'Coach Performance' },
    });
    fireEvent.change(screen.getByLabelText(/^cpf/i), {
      target: { value: '52998224725' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail de contato/i), {
      target: { value: 'coach@partner.test' },
    });
    fireEvent.change(screen.getByLabelText(/cidade e estado/i), {
      target: { value: 'Rio de Janeiro, RJ' },
    });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/products/biteplaner/roles/partner',
        expect.objectContaining({
          name: 'Coach Performance',
          documentType: 'cpf',
          documentNumber: '529.982.247-25',
          contactEmail: 'coach@partner.test',
          cityState: 'Rio de Janeiro, RJ',
        }),
        'tok'
      );
    });
  });

  it('keeps partner submit disabled while CPF or CNPJ is invalid', () => {
    renderPage('/painel/biteplaner/cadastro/parceiro');

    const submit = screen.getByRole('button', { name: /enviar solicitação/i });
    fireEvent.change(screen.getByLabelText(/nome da empresa ou parceiro/i), {
      target: { value: 'Parceiro Inválido' },
    });
    fireEvent.change(screen.getByLabelText(/^cnpj/i), {
      target: { value: '11111111111111' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail de contato/i), {
      target: { value: 'contato@partner.test' },
    });
    fireEvent.change(screen.getByLabelText(/cidade e estado/i), {
      target: { value: 'Campinas, SP' },
    });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));

    expect(screen.getByLabelText(/^cnpj/i)).toHaveValue('11.111.111/1111-11');
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /tipo de documento/i }));
    fireEvent.click(screen.getByRole('option', { name: 'CPF' }));
    fireEvent.change(screen.getByLabelText(/^cpf/i), {
      target: { value: '11111111111' },
    });

    expect(screen.getByLabelText(/^cpf/i)).toHaveValue('111.111.111-11');
    expect(submit).toBeDisabled();
  });

  it('requires valid CNPJ and laboratory location data before submitting laboratory onboarding', async () => {
    const fetchMock = mockCepLookup();
    mockApiPost.mockResolvedValueOnce({
      productRole: { productKey: 'biteplaner', role: 'lab', status: 'pending' },
    });
    renderPage('/painel/biteplaner/cadastro/laboratório');

    const submit = screen.getByRole('button', { name: /enviar solicita/i });
    expect(submit).toBeDisabled();
    expect(screen.getByText(/dados do local/i)).toBeInTheDocument();
    expect(screen.getByText(/nexor ira verificar o cadastro do laboratório/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nome do laboratório/i), {
      target: { value: 'Lab Performance' },
    });
    fireEvent.change(screen.getByLabelText(/^cnpj/i), {
      target: { value: '11111111111111' },
    });
    fireEvent.change(screen.getByLabelText(/resumo operacional/i), {
      target: { value: 'Laboratório especializado em dispositivos esportivos personalizados.' },
    });
    fireEvent.change(screen.getByLabelText(/nome do local/i), {
      target: { value: 'Unidade Central' },
    });
    fireEvent.change(screen.getByLabelText(/cep do local/i), {
      target: { value: '01001000' },
    });
    expect(screen.getByLabelText(/^cnpj/i)).toHaveValue('11.111.111/1111-11');
    expect(screen.getByLabelText(/cep do local/i)).toHaveValue('01001-000');
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/^cnpj/i), {
      target: { value: '19131243000197' },
    });
    fireEvent.blur(screen.getByLabelText(/cep do local/i));

    await waitFor(() => {
      expect(screen.getByLabelText(/endereço do local/i)).toHaveValue('Praça da Sé - Sé, São Paulo - SP');
    });

    fireEvent.change(screen.getByLabelText(/dia e horário de operação/i), {
      target: { value: 'Segunda a sexta, 8h as 18h' },
    });
    fireEvent.change(screen.getByLabelText(/telefone do local/i), {
      target: { value: '11987654321' },
    });
    fireEvent.click(screen.getByLabelText(/termos de cadastro operacional/i));
    fireEvent.click(screen.getByLabelText(/privacidade/i));

    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json/');
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/products/biteplaner/roles/lab',
        expect.objectContaining({
          labName: 'Lab Performance',
          cnpj: '19.131.243/0001-97',
          professionalSummary: 'Laboratório especializado em dispositivos esportivos personalizados.',
          locations: [
            expect.objectContaining({
              name: 'Unidade Central',
              address: 'Praça da Sé - Sé, São Paulo - SP',
              cep: '01001-000',
              serviceHours: 'Segunda a sexta, 8h as 18h',
            }),
          ],
        }),
        'tok'
      );
    });
  });
});
