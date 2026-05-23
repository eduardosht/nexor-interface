import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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

  it('não usa o poster otimizado como background alternativo no mobile', () => {
    const stylesSource = readFileSync(join(process.cwd(), 'src/sections/Hero/styles.ts'), 'utf8');
    const sectionWrapperSource = stylesSource.slice(
      stylesSource.indexOf('export const SectionWrapper'),
      stylesSource.indexOf('export const VideoBackground')
    );

    expect(sectionWrapperSource).not.toContain('heroPoster');
    expect(sectionWrapperSource).not.toContain('background-image');
  });
});
