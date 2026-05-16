import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Hero } from './Hero';
import { lightTheme } from '../../styles/theme';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('Hero', () => {
  it('renderiza headline', () => {
    render(<Hero />, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renderiza CTA de produtos', () => {
    render(<Hero />, { wrapper: Wrapper });
    expect(screen.getByRole('link', { name: /conheça o biteplaner/i })).toHaveAttribute('href', '/biteplaner');
  });

  it('tem aria-label na section', () => {
    render(<Hero />, { wrapper: Wrapper });
    expect(screen.getByRole('region', { name: /apresentação nexor/i })).toBeInTheDocument();
  });

  it('mantém o vídeo mp4 disponível também no mobile', () => {
    const { container } = render(<Hero />, { wrapper: Wrapper });
    const source = container.querySelector('video source');

    expect(source).toHaveAttribute('type', 'video/mp4');
    expect(source).not.toHaveAttribute('media');
  });
});
