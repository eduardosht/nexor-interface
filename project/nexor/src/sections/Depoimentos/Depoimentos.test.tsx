import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Depoimentos } from './Depoimentos';
import { lightTheme } from '../../styles/theme';

describe('Depoimentos', () => {
  it('renderiza heading', () => {
    render(<ThemeProvider theme={lightTheme}><Depoimentos /></ThemeProvider>);
    expect(screen.getByRole('heading', { name: /o que dizem/i })).toBeInTheDocument();
  });

  it('renderiza o primeiro depoimento', () => {
    render(<ThemeProvider theme={lightTheme}><Depoimentos /></ThemeProvider>);
    expect(screen.getByText(/carlos m\./i)).toBeInTheDocument();
    expect(screen.getByText(/dispositivo de segurança/i)).toBeInTheDocument();
    expect(screen.getByText(/detalhe do dispositivo/i)).toBeInTheDocument();
  });

  it('tem id depoimentos para âncora', () => {
    const { container } = render(<ThemeProvider theme={lightTheme}><Depoimentos /></ThemeProvider>);
    expect(container.querySelector('#depoimentos')).toBeInTheDocument();
  });
});
