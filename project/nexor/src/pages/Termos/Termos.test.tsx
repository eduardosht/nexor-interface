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
});
