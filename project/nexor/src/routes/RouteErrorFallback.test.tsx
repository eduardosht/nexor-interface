import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../styles/theme';
import { ErrorFallbackView } from './RouteErrorFallback';

describe('RouteErrorFallback', () => {
  it('shows a friendly refresh action for dynamic import failures', () => {
    const reload = vi.fn();
    const originalLocation = window.location;

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload },
    });

    render(
      <ThemeProvider theme={lightTheme}>
        <ErrorFallbackView
          error={new TypeError('Failed to fetch dynamically imported module: https://nexoradvance.com.br/assets/Compra-B_XIltfp.js')}
        />
      </ThemeProvider>
    );

    expect(screen.getByRole('heading', { name: /atualize a aplicação para continuar/i })).toBeInTheDocument();
    expect(screen.getByText(/uma nova versão do sistema foi publicada/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /recarregar aplicação/i }));

    expect(reload).toHaveBeenCalledTimes(1);

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });
});
