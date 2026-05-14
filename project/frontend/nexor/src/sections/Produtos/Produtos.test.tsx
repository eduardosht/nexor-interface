import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Produtos } from './Produtos';
import { lightTheme } from '../../styles/theme';

describe('Produtos', () => {
  it('renderiza heading Produtos', () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}><Produtos /></ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /tecnologia feita/i })).toBeInTheDocument();
  });

  it('renderiza o logo do Biteplaner na seção', () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}><Produtos /></ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('img', { name: /biteplaner/i })).toBeInTheDocument();
  });

  it('tem id produtos para âncora', () => {
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}><Produtos /></ThemeProvider>
      </MemoryRouter>
    );
    expect(container.querySelector('#produtos')).toBeInTheDocument();
  });
});
