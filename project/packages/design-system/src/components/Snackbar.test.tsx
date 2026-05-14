import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DesignSystemProvider } from '../provider';
import { Snackbar, SnackbarStack } from './Snackbar';

describe('Snackbar', () => {
  it('renders stacked feedbacks with close action and semantic roles', () => {
    const handleClose = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <SnackbarStack>
          <Snackbar tone="success" title="Rascunho salvo" message="As alteracoes foram persistidas." />
          <Snackbar
            tone="error"
            title="Falha ao concluir"
            message="Nao foi possivel enviar ao laboratorio."
            onClose={handleClose}
          />
        </SnackbarStack>
      </DesignSystemProvider>
    );

    expect(screen.getByRole('status')).toHaveTextContent(/rascunho salvo/i);
    expect(screen.getByRole('alert')).toHaveTextContent(/falha ao concluir/i);

    fireEvent.click(screen.getByRole('button', { name: /fechar snackbar/i }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes automatically after the default timeout', () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();

    try {
      render(
        <DesignSystemProvider brand="nexor">
          <Snackbar tone="info" title="PDF em geracao" message="Aguarde." onClose={handleClose} />
        </DesignSystemProvider>
      );

      expect(handleClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(3999);
      expect(handleClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the snackbar visible when auto close is disabled', () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();

    try {
      render(
        <DesignSystemProvider brand="nexor">
          <Snackbar tone="info" title="PDF em geracao" message="Aguarde." onClose={handleClose} autoCloseMs={0} />
        </DesignSystemProvider>
      );

      vi.advanceTimersByTime(10000);

      expect(handleClose).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
