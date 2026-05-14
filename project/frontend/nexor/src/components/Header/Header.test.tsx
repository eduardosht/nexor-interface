import { render, screen } from '@testing-library/react';
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
    expect(screen.getByRole('button', { name: /sobre/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /produtos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /depoimentos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /contato/i })).toBeInTheDocument();
  });

  it('renderiza botão do logo com label de início', () => {
    render(<Header />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: /nexor.*início/i })).toBeInTheDocument();
  });
});
