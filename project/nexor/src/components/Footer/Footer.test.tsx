import { fireEvent, render, screen } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Footer } from './index';
import { lightTheme } from '../../styles/theme';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <DesignSystemRoot>{children}</DesignSystemRoot>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Footer', () => {
  it('renderiza links de navegação de seção', () => {
    render(<Footer />, { wrapper: Wrapper });
    expect(screen.getByRole('link', { name: /quem somos/i })).toHaveAttribute('href', '/#quem-somos');
    expect(screen.getByRole('link', { name: /produtos/i })).toHaveAttribute('href', '/#produtos');
  });

  it('renderiza links legais com rotas corretas', () => {
    render(<Footer />, { wrapper: Wrapper });
    const privLinks = screen.getAllByRole('link', { name: /política de privacidade/i });
    expect(privLinks.length).toBeGreaterThan(0);
    privLinks.forEach(l => expect(l).toHaveAttribute('href', '/privacidade'));
    const termosLinks = screen.getAllByRole('link', { name: /termos de uso/i });
    expect(termosLinks.length).toBeGreaterThan(0);
    termosLinks.forEach(l => expect(l).toHaveAttribute('href', '/termos'));
    expect(screen.getByRole('link', { name: /cookies/i })).toHaveAttribute('href', '/cookies');
  });

  it('renderiza copyright com o ano corrente', () => {
    render(<Footer />, { wrapper: Wrapper });
    expect(screen.getByText(new RegExp(new Date().getFullYear().toString()))).toBeInTheDocument();
  });

  it('mostra logo Nexor como imagem', () => {
    render(<Footer />, { wrapper: Wrapper });
    expect(screen.getByRole('img', { name: /nexor/i })).toBeInTheDocument();
  });

  it('expõe uma ação para reabrir preferências de cookies', () => {
    const onManageCookies = vi.fn();

    render(<Footer onManageCookies={onManageCookies} />, { wrapper: Wrapper });

    fireEvent.click(screen.getByRole('button', { name: /preferências de cookies/i }));

    expect(onManageCookies).toHaveBeenCalledTimes(1);
  });
});
