import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { Termos } from './index';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </MemoryRouter>
  );
}

describe('Termos (Nexor)', () => {
  it('renderiza o título e os cards de perfil', () => {
    render(<Termos />, { wrapper: Wrapper });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/termos de uso/i);
    expect(screen.getByRole('button', { name: /usuário biteplaner/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dentista licenciado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /parceiro licenciado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /laboratório licenciado/i })).toBeInTheDocument();
  });

  it('renderiza o documento específico ao selecionar um perfil', async () => {
    const user = userEvent.setup();
    render(<Termos />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /dentista licenciado/i }));

    expect(screen.getByRole('heading', { level: 2, name: /termos de uso do dentista licenciado/i })).toBeInTheDocument();
    expect(screen.getByText(/conclusão do cadastro financeiro/i)).toBeInTheDocument();
    expect(screen.getByText(/dados bancários; o envio desses dados ocorre de forma transiente/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /baixar pdf/i })).toBeInTheDocument();
  });

  it('mantém documentos diferentes para laboratório e parceiro', async () => {
    const user = userEvent.setup();
    render(<Termos />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /laboratório licenciado/i }));
    expect(screen.getByText(/produção, qualidade e confidencialidade/i)).toBeInTheDocument();
    expect(screen.getByText(/arquivos, dados de clientes, dentistas e ordens/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /parceiro licenciado/i }));
    expect(screen.getByText(/convites, indicações, fluxos comerciais/i)).toBeInTheDocument();
    expect(screen.queryByText(/produção, qualidade e confidencialidade/i)).not.toBeInTheDocument();
  });

  it('não publica placeholders jurídicos', async () => {
    const user = userEvent.setup();
    render(<Termos />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /usuário biteplaner/i }));

    expect(screen.queryByText(/\[[^\]]+\]/)).not.toBeInTheDocument();
  });
});
