import { render, screen } from '@testing-library/react';
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
  it('renderiza o titulo h1', () => {
    render(<Privacidade />, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/política de privacidade/i);
  });

  it('renderiza pelo menos uma seção h2', () => {
    render(<Privacidade />, { wrapper: Wrapper });
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(0);
  });

  it('não pública placeholders nem documento no cadastro base', () => {
    render(<Privacidade />, { wrapper: Wrapper });
    expect(screen.queryByText(/\[[^\]]+\]/)).not.toBeInTheDocument();
    expect(screen.queryByText(/cpf ou cnpj/i)).not.toBeInTheDocument();
  });
});
