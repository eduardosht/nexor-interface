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
    expect(screen.getByRole('button', { name: /geral nexor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /usuário biteplaner/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^dentista licenciado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /parceiro licenciado/i })).toBeInTheDocument();
  });

  it('renderiza o documento específico ao selecionar um perfil', async () => {
    const user = userEvent.setup();
    render(<Termos />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /^dentista licenciado/i }));

    expect(screen.getByRole('heading', { level: 2, name: /termos de uso do dentista licenciado/i })).toBeInTheDocument();
    expect(screen.getByText(/compra do Biteplaner é feita pelo dentista diretamente com a Nexor/i)).toBeInTheDocument();
    expect(screen.getByText(/provedor externo/i)).toBeInTheDocument();
    expect(screen.getByText(/terms-dentist-v1\.0\.0/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /baixar pdf/i })).toBeInTheDocument();
  });

  it('não publica perfil jurídico legado de fornecedor operacional', async () => {
    render(<Termos />, { wrapper: Wrapper });

    expect(screen.queryByRole('heading', { level: 2, name: /laboratório/i })).not.toBeInTheDocument();
  });

  it('renderiza termos gerais e condição para menores', async () => {
    const user = userEvent.setup();
    render(<Termos />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /geral nexor/i }));
    expect(screen.getByText(/ETHOSME SERVICOS EDUCACIONAIS LTDA/i)).toBeInTheDocument();
    expect(screen.getByText(/terms-general-v1\.0\.0/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /usuário biteplaner/i }));
    expect(screen.getByText(/menores de 18 anos somente devem usar/i)).toBeInTheDocument();
    expect(screen.getByText(/contratação é feita pelo dentista licenciado diretamente com a Nexor/i)).toBeInTheDocument();
    expect(screen.getByText(/compra do Biteplaner é realizada pelo dentista licenciado no MVP atual/i)).toBeInTheDocument();
    expect(screen.queryByText(/A compra ocorre após a consulta inicial/i)).not.toBeInTheDocument();
  });

  it('não publica placeholders jurídicos', async () => {
    const user = userEvent.setup();
    render(<Termos />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /usuário biteplaner/i }));

    expect(screen.queryByText(/\[[^\]]+\]/)).not.toBeInTheDocument();
  });
});
