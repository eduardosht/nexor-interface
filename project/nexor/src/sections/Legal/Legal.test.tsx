import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Legal } from './Legal';
import { lightTheme } from '../../styles/theme';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </MemoryRouter>
  );
}

describe('Legal', () => {
  it('renderiza heading de transparência', () => {
    render(<Legal />, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { name: /transparência e privacidade/i })).toBeInTheDocument();
  });

  it('renderiza link para política de privacidade', () => {
    render(<Legal />, { wrapper: Wrapper });
    expect(screen.getByRole('link', { name: /política de privacidade/i })).toHaveAttribute('href', '/privacidade');
  });

  it('renderiza link para termos de uso', () => {
    render(<Legal />, { wrapper: Wrapper });
    expect(screen.getByRole('link', { name: /termos de uso/i })).toHaveAttribute('href', '/termos');
  });

  it('renderiza link para cookies', () => {
    render(<Legal />, { wrapper: Wrapper });
    expect(screen.getByRole('link', { name: /política de cookies/i })).toHaveAttribute('href', '/cookies');
  });

  it('tem id legal para âncora', () => {
    const { container } = render(<Legal />, { wrapper: Wrapper });
    expect(container.querySelector('#legal')).toBeInTheDocument();
  });
});
