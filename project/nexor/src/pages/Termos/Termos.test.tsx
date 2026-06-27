import { render, screen } from '@testing-library/react';
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
  it('renderiza o título h1', () => {
    render(<Termos />, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/termos de uso/i);
  });

  it('renderiza pelo menos uma seção h2', () => {
    render(<Termos />, { wrapper: Wrapper });
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(0);
  });

  it('não publica placeholders de foro ou campos jurídicos', () => {
    render(<Termos />, { wrapper: Wrapper });
    expect(screen.queryByText(/\[[^\]]+\]/)).not.toBeInTheDocument();
  });

  it('descreve perfis Biteplaner, pagamentos, cancelamento, suspensão e foro competente', () => {
    render(<Termos />, { wrapper: Wrapper });

    expect(screen.getAllByText(/clientes, dentistas, parceiros, laboratórios e administradores/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/stripe/i)).toBeInTheDocument();
    expect(screen.getAllByText(/cancelamento/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/suspender ou bloquear/i)).toBeInTheDocument();
    expect(screen.getByText(/foro legalmente competente/i)).toBeInTheDocument();
  });

  it('explica notificações, leitura, exportação e exclusão de conta', () => {
    render(<Termos />, { wrapper: Wrapper });

    expect(screen.getByText(/a leitura de notificações pode ser registrada/i)).toBeInTheDocument();
    expect(screen.getByText(/exportação e pedidos de exclusão/i)).toBeInTheDocument();
    expect(screen.getByText(/remoção, bloqueio, anonimização ou retenção mínima/i)).toBeInTheDocument();
  });
});
