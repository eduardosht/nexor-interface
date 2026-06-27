import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPatch, mockApiPost, mockSendPasswordReset } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPatch: vi.fn(),
  mockApiPost: vi.fn(),
  mockSendPasswordReset: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    patch: mockApiPatch,
    post: mockApiPost,
  },
}));

import { MinhaConta } from './index';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

function renderPage(authOverrides: Record<string, unknown> = {}) {
  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok', user: { id: '1', email: 'joao@nexor.dev' } },
    backendUser: { email: 'joao@nexor.dev', roles: ['user'] },
    hasConfiguredAuth: true,
    isMockMode: false,
    sendPasswordReset: mockSendPasswordReset,
    ...authOverrides,
  });

  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <MinhaConta />
      </ThemeProvider>
    </MemoryRouter>
  );
}

function renderPageWithAuthState(authState: Record<string, unknown>) {
  mockUseAuth.mockReturnValue(authState);

  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <MinhaConta />
      </ThemeProvider>
    </MemoryRouter>
  );
}

function renderPageInStrictMode(authOverrides: Record<string, unknown> = {}) {
  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok', user: { id: 'dentist-2', email: 'dentista2@gmail.com' } },
    backendUser: { email: 'dentista2@gmail.com', roles: ['dentist'] },
    hasConfiguredAuth: true,
    isMockMode: false,
    sendPasswordReset: mockSendPasswordReset,
    ...authOverrides,
  });

  return render(
    <StrictMode>
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <MinhaConta />
        </ThemeProvider>
      </MemoryRouter>
    </StrictMode>
  );
}

describe('MinhaConta', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPatch.mockReset();
    mockApiPost.mockReset();
    mockSendPasswordReset.mockReset();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows account information without account type or document fields', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
        documentType: 'cpf',
        documentNumber: '52998224725',
      },
    });

    renderPage();

    expect(await screen.findByDisplayValue('Joao Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@nexor.dev')).toBeInTheDocument();
    expect(screen.getAllByText('Ativo').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /enviar link para trocar senha/i })).toBeInTheDocument();
    expect(screen.queryByText(/tipo de conta/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/tipo de documento/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/número do documento/i)).not.toBeInTheDocument();
  });

  it('uses the design-system field for the account deletion confirmation input', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/MinhaConta/index.tsx'), 'utf8');

    expect(source).toContain("Field as DesignSystemField");
    expect(source).toContain('<DesignSystemField');
    expect(source).toContain('label={<>Digite <strong>{firstName}</strong> para confirmar</>}');
  });

  it('uses the design-system snackbar for account action feedbacks', () => {
    const pageSource = readFileSync(join(process.cwd(), 'src/pages/painel/MinhaConta/index.tsx'), 'utf8');
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/painel/MinhaConta/styles.ts'), 'utf8');

    expect(pageSource).toContain('SnackbarStack');
    expect(pageSource).toContain('<Snackbar');
    expect(pageSource).not.toContain('<S.Snackbar');
    expect(pageSource).not.toContain('<S.SaveMsg');
    expect(stylesSource).not.toContain('export const Snackbar');
    expect(stylesSource).not.toContain('export const SaveMsg');
  });

  it('keeps modal body content aligned with internal padding', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/MinhaConta/styles.ts'), 'utf8');

    expect(source).toContain('export const ModalBody = styled.div`');
    expect(source).toContain('padding: 18px 20px;');
    expect(source).toContain('> ${Field}');
    expect(source).toContain('border-bottom: none;');
  });

  it('saves only editable account name', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
        documentType: 'cpf',
        documentNumber: '52998224725',
      },
    });
    mockApiPatch.mockResolvedValueOnce({ ok: true });

    renderPage();

    fireEvent.change(await screen.findByLabelText(/nome completo/i), {
      target: { value: 'Joao Santos' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith(
        '/v1/auth/profile',
        {
          fullName: 'Joao Santos',
        },
        'tok'
      );
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/alterações salvas/i);
  });


  it('loads system flow email preferences in account settings', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        user: {
          email: 'joao@nexor.dev',
          fullName: 'Joao Silva',
          roles: ['user'],
        },
      })
      .mockResolvedValueOnce({ productRoles: [] })
      .mockResolvedValueOnce({ deletionRequest: null })
      .mockResolvedValueOnce({
        preferences: {
          profileId: 'profile-1',
          systemFlowEmailEnabled: true,
          updatedAt: '2026-06-20T12:00:00.000Z',
        },
      });

    renderPage();

    expect(await screen.findByRole('heading', { name: /preferências de comunicação/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/receber comunicações de fluxos do sistema por e-mail/i)).toBeChecked();
    expect(mockApiGet).toHaveBeenCalledWith('/v1/account/communication-preferences', 'tok');
  });

  it('shows LGPD rights shortcuts and exports account privacy data', async () => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:nexor-export');
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    const appendChild = vi.spyOn(document.body, 'appendChild');

    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    });
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = document.createElementNS('http://www.w3.org/1999/xhtml', tagName) as HTMLAnchorElement;
      if (tagName === 'a') {
        element.click = click;
      }
      return element;
    });
    mockApiGet
      .mockResolvedValueOnce({
        user: {
          email: 'joao@nexor.dev',
          fullName: 'Joao Silva',
          roles: ['user'],
        },
      })
      .mockResolvedValueOnce({ productRoles: [] })
      .mockResolvedValueOnce({ deletionRequest: null })
      .mockResolvedValueOnce({
        preferences: {
          profileId: 'profile-1',
          systemFlowEmailEnabled: true,
          updatedAt: '2026-06-20T12:00:00.000Z',
        },
      })
      .mockResolvedValueOnce({
        latestAccountConsents: {
          marketing: true,
          privacy: true,
          terms: true,
        },
        latestCookieConsent: {
          version: 1,
          necessary: true,
          preferences: true,
          analytics: false,
          acceptedAt: '2026-06-20T12:00:00.000Z',
        },
      })
      .mockResolvedValueOnce({
        metadados: {
          formato: 'json',
          finalidade: 'Acesso e portabilidade de dados pessoais da própria conta.',
          geradoPor: 'Nexor',
          exportadoEm: '2026-06-25T12:00:00.000Z',
          secoes: ['dadosDaConta', 'perfil', 'produtos', 'consentimentos'],
        },
        dadosDaConta: { email: 'joao@nexor.dev', perfisGlobais: ['user'] },
        perfil: { nomeCompleto: 'Joao Silva', email: 'joao@nexor.dev' },
        produtos: [],
        consentimentos: [],
      });
    mockApiPost.mockResolvedValueOnce({
      revoked: [
        {
          id: 'revocation-1',
          type: 'marketing',
          accepted: false,
          acceptedAt: '2026-06-25T12:10:00.000Z',
        },
      ],
    });

    renderPage();

    expect(await screen.findByRole('heading', { name: /privacidade e lgpd/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /política de privacidade/i })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: /política de cookies/i })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: /falar com o canal lgpd/i })).toHaveAttribute(
      'href',
      '/?assunto=lgpd#contato'
    );
    expect(screen.getByRole('link', { name: /falar com o canal lgpd/i })).toHaveAttribute('target', '_blank');
    expect(screen.queryByRole('button', { name: /solicitar exclusão/i })).not.toBeInTheDocument();
    expect(await screen.findByText(/marketing ativo/i)).toBeInTheDocument();
    expect(screen.getByText(/preferências de marketing para receber novidades e informativos sobre o produto/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/receber novidades e informativos sobre o produto/i));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/v1/account/consents/revoke', { types: ['marketing'] }, 'tok');
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/marketing revogado/i);

    fireEvent.click(screen.getByRole('button', { name: /exportar meus dados/i }));

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/v1/account/privacy-export', 'tok');
    });
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    const exportedBlob = createObjectURL.mock.calls[0]?.[0] as Blob;
    const exportedJson = await exportedBlob.text();
    expect(exportedJson).toContain('"dadosDaConta"');
    expect(exportedJson).toContain('"consentimentos"');
    expect(exportedJson).not.toContain('authUserId');
    expect(appendChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:nexor-export');
    expect(await screen.findByRole('status')).toHaveTextContent(/exportação gerada/i);
  });

  it('carrega os dados da conta apenas uma vez quando a sessao mantém o mesmo token', async () => {
    const authState = {
      session: { access_token: 'tok', user: { id: '1', email: 'joao@nexor.dev' } },
      backendUser: { email: 'joao@nexor.dev', roles: ['user'] },
      hasConfiguredAuth: true,
      isMockMode: false,
      sendPasswordReset: mockSendPasswordReset,
    };

    mockApiGet
      .mockResolvedValueOnce({
        user: {
          email: 'joao@nexor.dev',
          fullName: 'Joao Silva',
          roles: ['user'],
        },
      })
      .mockResolvedValueOnce({ productRoles: [] })
      .mockResolvedValueOnce({ deletionRequest: null })
      .mockResolvedValueOnce({
        preferences: {
          profileId: 'profile-1',
          systemFlowEmailEnabled: true,
          updatedAt: '2026-06-20T12:00:00.000Z',
        },
      })
      .mockResolvedValueOnce({
        latestAccountConsents: {
          marketing: false,
          privacy: true,
          terms: true,
        },
        latestCookieConsent: null,
      });

    const { rerender } = renderPageWithAuthState(authState);

    expect(await screen.findByDisplayValue('Joao Silva')).toBeInTheDocument();
    expect(mockApiGet).toHaveBeenCalledTimes(5);

    mockUseAuth.mockReturnValue({
      ...authState,
      session: { access_token: 'tok', user: { id: '1', email: 'joao@nexor.dev' } },
    });
    rerender(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <MinhaConta />
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledTimes(5);
    });
  });

  it('permite ativar o consentimento de marketing pelo toggle', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        user: {
          email: 'joao@nexor.dev',
          fullName: 'Joao Silva',
          roles: ['user'],
        },
      })
      .mockResolvedValueOnce({ productRoles: [] })
      .mockResolvedValueOnce({ deletionRequest: null })
      .mockResolvedValueOnce({
        preferences: {
          profileId: 'profile-1',
          systemFlowEmailEnabled: true,
          updatedAt: '2026-06-20T12:00:00.000Z',
        },
      })
      .mockResolvedValueOnce({
        latestAccountConsents: {
          marketing: false,
          privacy: true,
          terms: true,
        },
        latestCookieConsent: null,
      });
    mockApiPost.mockResolvedValueOnce({ ok: true });

    renderPage();

    const toggle = await screen.findByLabelText(/receber novidades e informativos sobre o produto/i);
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/consents',
        { consents: [{ type: 'marketing', accepted: true }] },
        'tok'
      );
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/marketing ativado/i);
  });

  it('asks for confirmation before disabling system flow emails', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        user: {
          email: 'joao@nexor.dev',
          fullName: 'Joao Silva',
          roles: ['user'],
        },
      })
      .mockResolvedValueOnce({ productRoles: [] })
      .mockResolvedValueOnce({ deletionRequest: null })
      .mockResolvedValueOnce({
        preferences: {
          profileId: 'profile-1',
          systemFlowEmailEnabled: true,
          updatedAt: '2026-06-20T12:00:00.000Z',
        },
      });
    mockApiPatch.mockResolvedValueOnce({
      preferences: {
        profileId: 'profile-1',
        systemFlowEmailEnabled: false,
        updatedAt: '2026-06-20T12:01:00.000Z',
      },
    });

    renderPage();

    const toggle = await screen.findByLabelText(/receber comunicações de fluxos do sistema por e-mail/i);
    fireEvent.click(toggle);

    expect(screen.getByRole('dialog', { name: /desativar e-mails de fluxo/i })).toBeInTheDocument();
    expect(mockApiPatch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /desativar e-mails/i }));

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith(
        '/v1/account/communication-preferences',
        { systemFlowEmailEnabled: false },
        'tok'
      );
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/preferências atualizadas/i);
  });

  it('shows onboarding values as labels and edits a field only after clicking the pencil', async () => {
    const productRole = {
      id: 'role-dentist-1',
      productKey: 'biteplaner',
      role: 'dentist',
      status: 'active',
      metadata: {
        fullName: 'Dra. Eduarda',
        cpf: '52998224725',
        cnpj: '19131243000197',
        croNumber: 'CRO-SP 123456',
        professionalSummary: 'Atendimento esportivo.',
        practiceLocations: [
          {
            name: 'Clínica Edu',
            address: 'Rua Teste, 123',
            cep: '01234000',
            phone: '(11) 99999-9999',
            dentistName: 'Dra. Eduarda',
            isAdapted: true,
            serviceHours: 'Segunda a sexta',
            city: 'São Paulo',
            state: 'SP',
          },
        ],
      },
    };

    mockApiGet
      .mockResolvedValueOnce({
        user: {
          email: 'dentista@nexor.dev',
          fullName: 'Dra. Eduarda',
          roles: ['dentist'],
        },
      })
      .mockResolvedValueOnce({ productRoles: [productRole] });
    mockApiPatch.mockImplementation(async (_url, payload) => ({
      productRole: {
        ...productRole,
        metadata: payload.metadata,
      },
    }));
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })));

    renderPage({
      session: { access_token: 'tok', user: { id: 'dentist', email: 'dentista@nexor.dev' } },
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    fireEvent.click(await screen.findByRole('button', { name: /dentista biteplaner/i }));

    expect(screen.getByText('Dados profissionais')).toBeInTheDocument();
    expect(screen.getByText('Dados da clínica')).toBeInTheDocument();
    expect(await screen.findByText('Clínica Edu')).toBeInTheDocument();
    expect(screen.getByText('529.982.247-25')).toBeInTheDocument();
    expect(screen.getByText('19.131.243/0001-97')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar cpf/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar cnpj/i })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Clínica Edu')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /editar nome da clínica/i }));
    fireEvent.change(screen.getByDisplayValue('Clínica Edu'), {
      target: { value: 'Clínica Nova' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: /^salvar$/i }).at(-1)!);

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith(
        '/v1/account/product-roles/role-dentist-1',
        expect.objectContaining({
          metadata: expect.objectContaining({
            practiceLocations: [
              expect.objectContaining({
                name: 'Clínica Nova',
              }),
            ],
          }),
        }),
        'tok'
      );
    });
  });

  it('busca o CEP no blur, preenche endereço real e permite corrigir o endereço antes de salvar', async () => {
    const productRole = {
      id: 'role-dentist-cep',
      productKey: 'biteplaner',
      role: 'dentist',
      status: 'active',
      metadata: {
        fullName: 'Dentista Edu',
        cpf: '42349336867',
        cnpj: '58751544000175',
        croNumber: 'CRO-SP 123123',
        professionalSummary: 'Resumo profissional teste',
        practiceLocations: [
          {
            name: 'Clínica Edu',
            address: 'Endereço antigo',
            cep: '01232011',
            phone: '(11) 11111-1111',
            dentistName: 'Dentista Edu',
            isAdapted: false,
            serviceHours: 'Segunda a Sexta',
            city: 'Cidade antiga',
            state: 'AA',
            coordinates: { lat: -1, lng: -2 },
          },
        ],
      },
    };

    mockApiGet
      .mockResolvedValueOnce({
        user: {
          email: 'dentista@nexor.dev',
          fullName: 'Dentista Edu',
          roles: ['dentist'],
        },
      })
      .mockResolvedValueOnce({ productRoles: [productRole] });
    mockApiPatch.mockImplementation(async (_url, payload) => ({
      productRole: {
        ...productRole,
        metadata: payload.metadata,
      },
    }));
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        cep: '01232-011',
        address: 'Rua Conselheiro Brotero',
        district: 'Santa Cecília',
        city: 'São Paulo',
        state: 'SP',
        lat: '-23.529413',
        lng: '-46.660682',
      }),
    })));

    renderPage({
      session: { access_token: 'tok', user: { id: 'dentist', email: 'dentista@nexor.dev' } },
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    fireEvent.click(await screen.findByRole('button', { name: /dentista biteplaner/i }));

    expect(screen.getByRole('heading', { name: 'Endereço da clínica' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar cep/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar endereço da clínica/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar cidade/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar estado/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /editar cep/i }));
    fireEvent.change(screen.getByDisplayValue('01232011'), {
      target: { value: '01232-011' },
    });
    fireEvent.blur(screen.getByDisplayValue('01232-011'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('https://cep.awesomeapi.com.br/json/01232011');
    });
    expect(await screen.findByText('Rua Conselheiro Brotero - Santa Cecília')).toBeInTheDocument();
    expect(screen.getByText('São Paulo')).toBeInTheDocument();
    expect(screen.getByText('SP')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /editar endereço da clínica/i }));
    fireEvent.change(screen.getByDisplayValue('Rua Conselheiro Brotero - Santa Cecília'), {
      target: { value: 'Rua Conselheiro Brotero, 123 - Santa Cecília' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: /^salvar$/i }).at(-1)!);

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith(
        '/v1/account/product-roles/role-dentist-cep',
        expect.objectContaining({
          metadata: expect.objectContaining({
            practiceLocations: [
              expect.objectContaining({
                cep: '01232-011',
                address: 'Rua Conselheiro Brotero, 123 - Santa Cecília',
                city: 'São Paulo',
                state: 'SP',
                coordinates: {
                  lat: -23.529413,
                  lng: -46.660682,
                },
              }),
            ],
          }),
        }),
        'tok'
      );
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('exibe dados de onboarding mesmo quando endpoints auxiliares da conta falham', async () => {
    const productRole = {
      id: 'role-dentist-fallback',
      productKey: 'biteplaner',
      role: 'dentist',
      status: 'active',
      metadata: {
        fullName: 'Dra. Eduarda',
        croNumber: 'CRO-SP 123456',
        practiceLocations: [{ name: 'Clínica Resiliente', cep: '01232011', city: 'São Paulo', state: 'SP' }],
      },
    };

    mockApiGet.mockImplementation((url: string) => {
      if (url === '/v1/auth/me') {
        return Promise.resolve({ user: { email: 'dentista@nexor.dev', fullName: 'Dra. Eduarda', roles: ['dentist'] } });
      }

      if (url === '/v1/account/product-roles') {
        return Promise.resolve({ productRoles: [productRole] });
      }

      return Promise.reject(new Error(`Falha auxiliar em ${url}`));
    });

    renderPage({
      session: { access_token: 'tok', user: { id: 'dentist', email: 'dentista@nexor.dev' } },
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    fireEvent.click(await screen.findByRole('button', { name: /dentista biteplaner/i }));

    expect(await screen.findByText('Clínica Resiliente')).toBeInTheDocument();
    expect(screen.queryByText(/skeleton/i)).not.toBeInTheDocument();
  });

  it('encerra o loading de onboarding quando product roles não responde', async () => {
    vi.useFakeTimers();
    const productRolesRequest = deferred<{ productRoles: [] }>();

    mockApiGet.mockImplementation((url: string) => {
      if (url === '/v1/auth/me') {
        return Promise.resolve({ user: { email: 'dentista2@gmail.com', fullName: 'Dentista 2', roles: ['dentist'] } });
      }

      if (url === '/v1/account/product-roles') {
        return productRolesRequest.promise;
      }

      return Promise.resolve({});
    });

    renderPage({
      session: { access_token: 'tok', user: { id: 'dentist-2', email: 'dentista2@gmail.com' } },
      backendUser: { email: 'dentista2@gmail.com', roles: ['dentist'] },
    });

    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByDisplayValue('Dentista 2')).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(12000);
    });

    expect(screen.getByText(/não foi possível carregar os dados de onboarding/i)).toBeInTheDocument();
    expect(screen.queryByText(/nenhum onboarding de produto foi encontrado/i)).not.toBeInTheDocument();
  });

  it('carrega onboarding em StrictMode quando todos os endpoints retornam 200', async () => {
    const productRole = {
      id: 'role-dentist-strict',
      productKey: 'biteplaner',
      role: 'dentist',
      status: 'active',
      metadata: {
        fullName: 'Dentista 2',
        croNumber: 'CRO-SP 456',
        practiceLocations: [{ name: 'Clínica Dentista 2', cep: '01232011', city: 'São Paulo', state: 'SP' }],
      },
    };

    mockApiGet.mockImplementation((url: string) => {
      if (url === '/v1/auth/me') {
        return Promise.resolve({ user: { email: 'dentista2@gmail.com', fullName: 'Dentista 2', roles: ['dentist'] } });
      }

      if (url === '/v1/account/product-roles') {
        return Promise.resolve({ productRoles: [productRole] });
      }

      return Promise.resolve({});
    });

    renderPageInStrictMode();

    fireEvent.click(await screen.findByRole('button', { name: /dentista biteplaner/i }));

    expect(await screen.findByText('Clínica Dentista 2')).toBeInTheDocument();
    expect(screen.queryByText(/não foi possível carregar os dados de onboarding/i)).not.toBeInTheDocument();
  });

  it('translates product role badges to Portuguese', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        user: {
          email: 'dentista@nexor.dev',
          fullName: 'Dra. Eduarda',
          roles: ['dentist'],
        },
      })
      .mockResolvedValueOnce({
        productRoles: [
          {
            id: 'role-rejected-1',
            productKey: 'biteplaner',
            role: 'dentist',
            status: 'rejected',
            metadata: {
              fullName: 'Dra. Eduarda',
            },
          },
        ],
      });

    renderPage({
      session: { access_token: 'tok', user: { id: 'dentist', email: 'dentista@nexor.dev' } },
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    });

    const badge = await screen.findByText('Rejeitado');

    expect(badge).toBeInTheDocument();
    expect(screen.queryByText(/^rejected$/i)).not.toBeInTheDocument();
    expect(getComputedStyle(badge).backgroundColor).toBe('rgba(185, 28, 28, 0.08)');
  });

  it('shows the acquired Biteplaner product for a user that has it', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
      },
    });

    renderPage();

    expect(await screen.findByRole('heading', { name: /produtos adquiridos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /biteplaner/i })).toBeInTheDocument();
    expect(screen.getByText(/produto ativo na sua conta nexor/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /abrir biteplaner/i })).toHaveAttribute('href', '/painel/biteplaner?mode=user');
  });

  it('shows a Biteplaner request CTA for a user without the product', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'sem-produto@nexor.dev',
        fullName: 'Maria Costa',
      },
    });

    renderPage({
      session: { access_token: 'tok', user: { id: '2', email: 'sem-produto@nexor.dev' } },
      backendUser: { email: 'sem-produto@nexor.dev', roles: ['user'] },
    });

    expect(await screen.findByRole('heading', { name: /produtos adquiridos/i })).toBeInTheDocument();
    expect(screen.getByText(/você ainda não possui produtos ativos/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pedir biteplaner/i })).toHaveAttribute('href', '/painel/biteplaner');
  });

  it('requests password reset for the account email', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
      },
    });
    mockSendPasswordReset.mockResolvedValueOnce(undefined);

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /enviar link para trocar senha/i }));

    await waitFor(() => {
      expect(mockSendPasswordReset).toHaveBeenCalledWith('joao@nexor.dev');
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/link enviado/i);
  });

  it('does not fail password reset in demo mode when Supabase is unavailable', async () => {
    mockUseAuth.mockReturnValue({
      session: { access_token: 'tok', user: { id: '1', email: 'joao@nexor.dev' } },
      backendUser: { email: 'joao@nexor.dev', roles: ['user'] },
      hasConfiguredAuth: true,
      isMockMode: true,
      sendPasswordReset: mockSendPasswordReset,
    });
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
      },
    });
    mockSendPasswordReset.mockRejectedValueOnce(new Error('Autenticação não configurada neste ambiente.'));

    render(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <MinhaConta />
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /enviar link para trocar senha/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(/ambiente de demonstração/i);
    expect(mockSendPasswordReset).not.toHaveBeenCalled();
  });

  it('submits an account deletion request with optional reason after first-name confirmation', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
        roles: ['dentist'],
      },
    });
    const deletionRequest = deferred<{
      status: string;
      message: string;
    }>();
    mockApiPost.mockReturnValueOnce(deletionRequest.promise);

    renderPage({ backendUser: { email: 'joao@nexor.dev', roles: ['dentist'] } });

    fireEvent.click(await screen.findByRole('button', { name: /excluir conta/i }));

    expect(screen.getAllByText('Joao').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: /confirmar exclusão/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /privacidade e lgpd/i }));
    fireEvent.change(screen.getByLabelText(/digite joao para confirmar/i), {
      target: { value: 'Joao' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirmar exclusão/i }));

    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled();

    deletionRequest.resolve({
      status: 'blocked_by_active_orders',
      message: 'Solicitação registrada. Existem ordens em andamento vinculadas à conta.',
    });

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/deletion-request',
        {
          confirmationFirstName: 'Joao',
          reason: 'privacy',
          reasonDetails: '',
        },
        'tok'
      );
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /confirmar exclusão da conta/i })).not.toBeInTheDocument();
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/solicitação registrada/i);
  });

  it('accepts numeric characters in the account deletion confirmation input', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao2@nexor.dev',
        fullName: 'Joao2 Silva',
        roles: ['user'],
      },
    });
    mockApiPost.mockResolvedValueOnce({
      request: { id: 'request-2', status: 'pending_confirmation', active_order_ids: [] },
      requiresAdminReview: false,
      message: 'Solicitação registrada.',
    });

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /excluir conta/i }));

    const confirmationInput = screen.getByLabelText(/digite joao2 para confirmar/i);
    fireEvent.change(confirmationInput, {
      target: { value: 'Joao2' },
    });

    expect(confirmationInput).toHaveValue('Joao2');
    expect(screen.getByRole('button', { name: /confirmar exclusão/i })).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /confirmar exclusão/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/deletion-request',
        {
          confirmationFirstName: 'Joao2',
          reasonDetails: '',
        },
        'tok'
      );
    });
  });

  it('exibe cliente Biteplaner somente quando o onboarding de novos usuarios ja foi preenchido', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        user: {
          email: 'cliente@nexor.dev',
          fullName: 'Cliente Nexor',
          roles: ['customer'],
        },
      })
      .mockResolvedValueOnce({
        productRoles: [
          {
            id: 'role-customer-empty',
            productKey: 'biteplaner',
            role: 'customer',
            status: 'active',
            metadata: {},
          },
          {
            id: 'role-customer-onboarded',
            productKey: 'biteplaner',
            role: 'customer',
            status: 'active',
            metadata: {
              onboardingCompleted: true,
              fullName: 'Cliente Onboarded',
              cpf: '52998224725',
              phone: '11999990001',
              birthDate: '1990-01-10',
              currentSports: ['crossfit', 'strength_training'],
              trainingExperience: '5_to_10_years',
              trainingCityOrNeighborhood: 'São Paulo / Moema',
            },
          },
        ],
      });

    renderPage({
      session: { access_token: 'tok', user: { id: 'customer', email: 'cliente@nexor.dev' } },
      backendUser: { email: 'cliente@nexor.dev', roles: ['customer'] },
    });

    const customerCardToggle = await screen.findByRole('button', { name: /cliente biteplaner/i });
    expect(screen.queryByText('role-customer-empty')).not.toBeInTheDocument();

    fireEvent.click(customerCardToggle);

    expect(await screen.findByText('Cliente Onboarded')).toBeInTheDocument();
    expect(screen.getByText('529.982.247-25')).toBeInTheDocument();
  });

  it('allows an optional custom account deletion reason', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
        roles: ['user'],
      },
    });
    mockApiPost.mockResolvedValueOnce({
      status: 'pending',
      message: 'Solicitação de exclusão registrada.',
    });

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /excluir conta/i }));
    fireEvent.click(screen.getByRole('button', { name: /outros/i }));
    fireEvent.change(screen.getByLabelText(/descreva o motivo/i), {
      target: { value: 'Prefiro encerrar meu cadastro agora.' },
    });
    fireEvent.change(screen.getByLabelText(/digite joao para confirmar/i), {
      target: { value: 'Joao' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirmar exclusão/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/deletion-request',
        {
          confirmationFirstName: 'Joao',
          reason: 'other',
          reasonDetails: 'Prefiro encerrar meu cadastro agora.',
        },
        'tok'
      );
    });
  });

  it('closes the deletion modal and shows an error snackbar when deletion request fails', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
        roles: ['user'],
      },
    });
    mockApiPost.mockRejectedValueOnce(new Error('network'));

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /excluir conta/i }));
    fireEvent.change(screen.getByLabelText(/digite joao para confirmar/i), {
      target: { value: 'Joao' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirmar exclusão/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /confirmar exclusão da conta/i })).not.toBeInTheDocument();
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível registrar/i);
  });

  it('shows pending confirmation actions and lets the user send to admin review or cancel', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        user: {
          email: 'dentista@nexor.dev',
          fullName: 'Joao Silva',
          roles: ['dentist'],
        },
      })
      .mockResolvedValueOnce({ productRoles: [] })
      .mockResolvedValueOnce({
        deletionRequest: {
          request: { id: 'request-1', status: 'pending_confirmation', active_order_ids: ['order-1'] },
          requiresAdminReview: true,
          message: 'Encontramos fluxos ativos vinculados à sua conta.',
        },
      });
    mockApiPost
      .mockResolvedValueOnce({
        request: { id: 'request-1', status: 'pending_admin_review', active_order_ids: ['order-1'] },
        requiresAdminReview: true,
        message: 'Sua solicitação está em análise.',
      })
      .mockResolvedValueOnce({
        request: { id: 'request-1', status: 'cancelled_by_user', active_order_ids: ['order-1'] },
        requiresAdminReview: false,
        message: 'A solicitação de remoção da conta foi cancelada por você.',
      });

    renderPage({ backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] } });

    expect(await screen.findByText(/fluxos ativos encontrados/i)).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /status da remoção/i })).toHaveTextContent(
      /encontramos fluxos ativos vinculados/i
    );
    fireEvent.click(screen.getByRole('button', { name: /enviar para análise da nexor/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/deletion-request',
        {
          confirmationFirstName: 'Joao',
          forceAdminReview: true,
        },
        'tok'
      );
    });

    fireEvent.click(await screen.findByRole('button', { name: /cancelar remoção/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/account/deletion-request/request-1/cancel',
        {},
        'tok'
      );
    });
    await waitFor(() => {
      expect(screen.getAllByText(/remoção cancelada/i).length).toBeGreaterThan(0);
    });
  });

  it('shows rejected account deletion requests with contact action', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        user: {
          email: 'joao@nexor.dev',
          fullName: 'Joao Silva',
          roles: ['user'],
        },
      })
      .mockResolvedValueOnce({ productRoles: [] })
      .mockResolvedValueOnce({
        deletionRequest: {
          request: { id: 'request-rejected', status: 'rejected', active_order_ids: [] },
          requiresAdminReview: false,
          message: 'A remoção da conta foi rejeitada pelo administrador.',
        },
      });

    renderPage();

    expect(await screen.findByText(/remoção de conta rejeitada/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /entrar em contato/i })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:suporte@nexor.com.br')
    );
  });

  it('does not show account deletion controls for admins', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'admin@nexor.dev',
        fullName: 'Admin Nexor',
        roles: ['admin'],
      },
    });

    renderPage({
      session: { access_token: 'tok', user: { id: 'admin', email: 'admin@nexor.dev' } },
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
    });

    expect(await screen.findByDisplayValue('Admin Nexor')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /excluir conta/i })).not.toBeInTheDocument();
  });
});
