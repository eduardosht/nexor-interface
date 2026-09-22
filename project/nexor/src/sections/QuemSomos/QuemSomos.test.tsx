import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { QuemSomos } from './QuemSomos';
import { lightTheme } from '../../styles/theme';

describe('QuemSomos', () => {
  it('renderiza heading', () => {
    render(<ThemeProvider theme={lightTheme}><QuemSomos /></ThemeProvider>);
    expect(screen.getByRole('heading', { name: /precisão.*personalização.*performance/i })).toBeInTheDocument();
  });

  it('renderiza parágrafos da descrição', () => {
    render(<ThemeProvider theme={lightTheme}><QuemSomos /></ThemeProvider>);
    expect(screen.getByText(/tecnologias de precisão para compreender, personalizar e avançar/i)).toBeInTheDocument();
    expect(screen.getByText(/conhecimento aplicado e personalização/i)).toBeInTheDocument();
  });

  it('tem id quem-somos para âncora', () => {
    const { container } = render(<ThemeProvider theme={lightTheme}><QuemSomos /></ThemeProvider>);
    expect(container.querySelector('#quem-somos')).toBeInTheDocument();
  });
});
