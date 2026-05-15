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
    expect(screen.getByText('Academia / Coach')).toBeInTheDocument();
    expect(screen.getByText('Laboratório Certificado')).toBeInTheDocument();
  });

  it('renders link to /parceiros', () => {
    renderSection();
    const link = screen.getByText(/Ver como ser parceiro/i).closest('a');
    expect(link).toHaveAttribute('href', '/parceiros');
  });
});
