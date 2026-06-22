import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../styles/theme';

const { mockApiGet, mockApiPost } = vi.hoisted(() => ({
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: { get: mockApiGet, post: mockApiPost } }));

import { Cadastro } from './index';

const renderCadastro = (search = '') =>
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={[`/cadastro${search}`]}>
        <Cadastro />
      </MemoryRouter>
    </ThemeProvider>
  );

function fillStepOneWithValidData() {
  fireEvent.change(screen.getByLabelText(/nome completo/i), {
    target: { value: 'Atleta Teste' },
  });
  fireEvent.change(screen.getByLabelText(/e-mail/i), {
    target: { value: 'atleta@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/^senha$/i), {
    target: { value: 'Senha1234' },
  });
  fireEvent.change(screen.getByLabelText(/confirmar sua senha/i), {
    target: { value: 'Senha1234' },
  });
}

describe('Cadastro', () => {
  beforeEach(() => {
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    document.cookie = 'nexor_partner_invite=; path=/; max-age=0';
  });

  it('shows the new two-step account form on step 1', () => {
    renderCadastro();

    expect(screen.getByText(/dados da conta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar sua senha/i)).toBeInTheDocument();
    expect(screen.queryByText(/tipo de conta/i)).not.toBeInTheDocument();
  });

  it('moves to the consent step when step 1 is valid', async () => {
    renderCadastro();
    fillStepOneWithValidData();

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    await waitFor(() =>
      expect(screen.getByText(/consentimentos gerais da conta nexor/i)).toBeInTheDocument()
    );
  });

  it('validates password confirmation before advancing', async () => {
    renderCadastro();

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Atleta Teste' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'atleta@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^senha$/i), {
      target: { value: 'Senha1234' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar sua senha/i), {
      target: { value: 'Senha4321' },
    });

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    await waitFor(() =>
      expect(screen.getByText(/senhas informadas não conferem/i)).toBeInTheDocument()
    );
  });

  it('removes numbers from the full name while typing', () => {
    renderCadastro();

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Ana 123 Silva' },
    });

    expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Ana  Silva');
  });

  it('saves ref from URL to sessionStorage on mount', () => {
    sessionStorage.clear();
    mockApiGet.mockResolvedValueOnce({
      inviteLink: { token: 'PARTNER456', status: 'valid', partner: { id: '1', name: 'Parceiro' } },
    });

    renderCadastro('?ref=PARTNER456');

    expect(sessionStorage.getItem('nexor_referral_ref')).toBe('PARTNER456');
  });

  it('validates and persists an invite token from the URL in a first-party cookie', async () => {
    mockApiGet.mockResolvedValueOnce({
      inviteLink: {
        token: 'bp-partner-demo-001',
        status: 'valid',
        partner: { id: '1', name: 'Parceiro' },
      },
    });

    renderCadastro('?invite=bp-partner-demo-001');

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/v1/partner-invite-links/bp-partner-demo-001/validate');
      expect(document.cookie).toContain('nexor_partner_invite=bp-partner-demo-001');
    });
  });

  it('clears the invite cookie when the URL token is invalid', async () => {
    document.cookie = 'nexor_partner_invite=existing-token; path=/';
    mockApiGet.mockResolvedValueOnce({
      inviteLink: { token: 'invalid-token', status: 'invalid', partner: null },
    });

    renderCadastro('?invite=invalid-token');

    await waitFor(() => {
      expect(document.cookie).not.toContain('nexor_partner_invite=');
    });
  });

  it('links existing users to login with the selected Biteplaner onboarding destination', () => {
    renderCadastro('?tipo=dentista');

    expect(screen.getByRole('link', { name: /fazer login/i })).toHaveAttribute(
      'href',
      '/entrar?next=%2Fpainel%2Fbiteplaner%2Fcadastro%2Fdentista'
    );
  });

  it('does not pass invalid selected onboarding types to login', () => {
    renderCadastro('?tipo=admin');

    expect(screen.getByRole('link', { name: /fazer login/i })).toHaveAttribute('href', '/entrar');
  });

  it('registers the account, profile and consents through the backend', async () => {
    mockApiPost.mockResolvedValue({});

    renderCadastro();
    fillStepOneWithValidData();
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    await waitFor(() => screen.getByText(/termos de uso/i));
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/v1/auth/register', {
        email: 'atleta@example.com',
        password: 'Senha1234',
        fullName: 'Atleta Teste',
        consents: [
          { type: 'terms', accepted: true },
          { type: 'privacy', accepted: true },
          { type: 'marketing', accepted: false },
        ],
      });
    });
  });

  it('sends the referral invite token with the backend registration', async () => {
    document.cookie = 'nexor_partner_invite=bp-partner-demo-001; path=/';
    mockApiPost.mockResolvedValue({});

    renderCadastro();
    fillStepOneWithValidData();
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    await waitFor(() => screen.getByText(/termos de uso/i));
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/auth/register',
        expect.objectContaining({ referralInviteToken: 'bp-partner-demo-001' })
      );
    });
  });

  it('clears a stale referral invite cookie and retries registration without it', async () => {
    document.cookie = 'nexor_partner_invite=stale-partner-token; path=/';
    mockApiPost
      .mockRejectedValueOnce(
        Object.assign(new Error('Partner invite link not found.'), {
          status: 404,
          code: 'not_found',
        })
      )
      .mockResolvedValueOnce({});

    renderCadastro();
    fillStepOneWithValidData();
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    await waitFor(() => screen.getByText(/termos de uso/i));
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenNthCalledWith(
        1,
        '/v1/auth/register',
        expect.objectContaining({ referralInviteToken: 'stale-partner-token' })
      );
      expect(mockApiPost).toHaveBeenNthCalledWith(
        2,
        '/v1/auth/register',
        expect.not.objectContaining({ referralInviteToken: expect.any(String) })
      );
      expect(document.cookie).not.toContain('nexor_partner_invite=');
    });
  });

  it('shows the backend validation message when registration is rejected', async () => {
    mockApiPost.mockRejectedValue(
      Object.assign(new Error('E-mail já cadastrado. Entre na sua conta ou recupere a senha.'), {
        status: 409,
        code: 'conflict',
      })
    );

    renderCadastro();
    fillStepOneWithValidData();
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    await waitFor(() => screen.getByText(/termos de uso/i));
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /e-mail já cadastrado/i
      );
    });
  });

  it('does not show a partial account creation message when backend registration fails', async () => {
    mockApiPost.mockRejectedValue(new Error('consent failure'));

    renderCadastro();
    fillStepOneWithValidData();
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    await waitFor(() => screen.getByText(/termos de uso/i));
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /não foi possível criar sua conta agora/i
      );
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('keeps legal consent messaging on the second step', async () => {
    renderCadastro();
    fillStepOneWithValidData();
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    await waitFor(() =>
      expect(screen.getByText(/dados clínicos, documentos, elegibilidade odontológica/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/lgpd/i)).toBeInTheDocument();
    expect(
      screen.getByText(/posso revogar essa autorização a qualquer momento/i)
    ).toBeInTheDocument();
  });
});
