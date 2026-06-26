import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { Cookies } from './index';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </MemoryRouter>
  );
}

describe('Cookies (Nexor)', () => {
  it('renderiza o título h1', () => {
    render(<Cookies />, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/cookies/i);
  });

  it('renderiza pelo menos uma seção h2', () => {
    render(<Cookies />, { wrapper: Wrapper });
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(0);
  });

  it('explica que o usuário pode aceitar, recusar e reabrir preferências', () => {
    render(<Cookies />, { wrapper: Wrapper });
    expect(screen.getByText(/aceitar ou recusar cookies opcionais/i)).toBeInTheDocument();
    expect(screen.getByText(/reabrir essas preferências pelo rodapé do site/i)).toBeInTheDocument();
  });

  it('descreve localStorage, chave de consentimento e cookie de convite de parceiro', () => {
    render(<Cookies />, { wrapper: Wrapper });
    expect(screen.getAllByText(/localStorage/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/nexor-cookie-consent/i)).toBeInTheDocument();
    expect(screen.getByText(/nexor_partner_invite/i)).toBeInTheDocument();
    expect(screen.getByText(/30 dias/i)).toBeInTheDocument();
  });
});
