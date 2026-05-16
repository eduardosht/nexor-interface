import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Header } from './index';
import { lightTheme } from '../../styles/theme';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </MemoryRouter>
  );
}

describe('Header', () => {
  it('renderiza botões de navegação', () => {
    render(<Header />, { wrapper: Wrapper });
    expect(screen.getAllByRole('button', { name: /sobre/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /produtos/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /depoimentos/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /contato/i }).length).toBeGreaterThan(0);
  });

  it('renderiza botão do logo com label de início', () => {
    render(<Header />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: /nexor.*início/i })).toBeInTheDocument();
  });

  it('renderiza bottom bar mobile com a mesma navegação pública', () => {
    const { container } = render(<Header />, { wrapper: Wrapper });

    const mobileNav = container.querySelector('nav[aria-label="Navegação principal mobile"]');

    expect(mobileNav).toBeInTheDocument();
    expect(within(mobileNav as HTMLElement).getByRole('button', { hidden: true, name: /sobre/i })).toBeInTheDocument();
    expect(within(mobileNav as HTMLElement).getByRole('button', { hidden: true, name: /produtos/i })).toBeInTheDocument();
    expect(within(mobileNav as HTMLElement).getByRole('button', { hidden: true, name: /depoimentos/i })).toBeInTheDocument();
    expect(within(mobileNav as HTMLElement).getByRole('button', { hidden: true, name: /contato/i })).toBeInTheDocument();
  });
});
