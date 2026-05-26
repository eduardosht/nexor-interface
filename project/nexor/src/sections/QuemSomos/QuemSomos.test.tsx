import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { QuemSomos } from './QuemSomos';
import { lightTheme } from '../../styles/theme';

describe('QuemSomos', () => {
  it('renderiza heading', () => {
    render(<ThemeProvider theme={lightTheme}><QuemSomos /></ThemeProvider>);
    expect(screen.getByRole('heading', { name: /segurança.*prevenção.*performance/i })).toBeInTheDocument();
  });

  it('renderiza parágrafos da descrição', () => {
    render(<ThemeProvider theme={lightTheme}><QuemSomos /></ThemeProvider>);
    expect(screen.getByText(/para atletas e praticantes esportivos/i)).toBeInTheDocument();
    expect(screen.getByText(/evolução do atleta ou praticante esportivo/i)).toBeInTheDocument();
  });

  it('tem id quem-somos para âncora', () => {
    const { container } = render(<ThemeProvider theme={lightTheme}><QuemSomos /></ThemeProvider>);
    expect(container.querySelector('#quem-somos')).toBeInTheDocument();
  });
});
