import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { ParceirosTeaserSection } from './ParceirosTeaserSection';

function renderSection() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <ParceirosTeaserSection />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('ParceirosTeaserSection', () => {
  it('renders three partner types', () => {
    renderSection();
    expect(screen.getByText('Dentista Licenciado')).toBeInTheDocument();
    expect(screen.getByText('Academia / Coach Licenciado')).toBeInTheDocument();
    expect(screen.getByText('Laboratório Licenciado')).toBeInTheDocument();
    expect(screen.getByText(/público diferenciado e serviços premium/i)).toBeInTheDocument();
    expect(screen.getByText(/aumento do valuation e upgrade profissional/i)).toBeInTheDocument();
    expect(screen.getByText(/upgrade de produtos e novos nichos de mercado/i)).toBeInTheDocument();
  });

  it('renders link to /parceiros', () => {
    renderSection();
    const link = screen.getByText(/Veja como ser licenciado/i).closest('a');
    expect(link).toHaveAttribute('href', '/parceiros');
  });
});
