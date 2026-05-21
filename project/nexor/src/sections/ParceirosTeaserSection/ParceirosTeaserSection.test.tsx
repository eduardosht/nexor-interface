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
  });

  it('renders link to /parceiros', () => {
    renderSection();
    const link = screen.getByText(/Veja como ser licenciado/i).closest('a');
    expect(link).toHaveAttribute('href', '/parceiros');
  });
});
