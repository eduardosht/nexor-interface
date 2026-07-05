import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { Privacidade } from './index';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </MemoryRouter>
  );
}

describe('Privacidade (Nexor)', () => {
  it('renderiza o título e os cards de perfil', () => {
    render(<Privacidade />, { wrapper: Wrapper });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/políticas de privacidade/i);
    expect(screen.getByRole('button', { name: /usuário biteplaner/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dentista licenciado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /parceiro licenciado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /laboratório licenciado/i })).toBeInTheDocument();
  });

  it('renderiza política específica do usuário Biteplaner com dados sensíveis de saúde', async () => {
    const user = userEvent.setup();
    render(<Privacidade />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /usuário biteplaner/i }));

    expect(screen.getByRole('heading', { level: 2, name: /política de privacidade do usuário biteplaner/i })).toBeInTheDocument();
    expect(screen.getByText(/dados clínicos e de saúde/i)).toBeInTheDocument();
    expect(screen.getByText(/proteção da saúde/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /baixar pdf/i })).toBeInTheDocument();
  });

  it('explica que dentista e laboratório não têm dados bancários armazenados na Nexor', async () => {
    const user = userEvent.setup();
    render(<Privacidade />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /dentista licenciado/i }));
    expect(screen.getByText(/dados bancários são enviados ao pagar\.me de forma transiente/i)).toBeInTheDocument();
    expect(screen.getByText(/não são armazenados pela nexor/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /laboratório licenciado/i }));
    expect(screen.getByText(/criar recebedor no pagar\.me/i)).toBeInTheDocument();
    expect(screen.getByText(/split de pagamentos/i)).toBeInTheDocument();
  });

  it('mantém canal LGPD e direitos do titular em todos os documentos', async () => {
    const user = userEvent.setup();
    render(<Privacidade />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /parceiro licenciado/i }));

    expect(screen.getByText(/contato@nexoradvance\.com\.br/i)).toBeInTheDocument();
    expect(screen.getByText(/correção, anonimização, bloqueio, eliminação/i)).toBeInTheDocument();
    expect(screen.getByText(/portabilidade quando aplicável/i)).toBeInTheDocument();
    expect(screen.queryByText(/\[[^\]]+\]/)).not.toBeInTheDocument();
  });
});
