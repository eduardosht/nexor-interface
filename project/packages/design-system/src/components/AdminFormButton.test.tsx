import { fireEvent, render, screen } from '@testing-library/react';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AdminFormButton } from './AdminFormButton';

describe('AdminFormButton', () => {
  it('keeps all admin form actions on the same visual size baseline', () => {
    render(
      <>
        <AdminFormButton>Continuar</AdminFormButton>
        <AdminFormButton>Próxima etapa</AdminFormButton>
        <AdminFormButton variant="secondary">Voltar etapa</AdminFormButton>
      </>
    );

    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveStyle({
        minHeight: '52px',
        padding: '10px 18px',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '700',
      });
    }
  });

  it('supports icon and label slots without changing the button source', () => {
    render(
      <AdminFormButton trailingIcon={<svg aria-hidden="true" viewBox="0 0 16 16"><path d="M1 1h14v14H1z" /></svg>}>
        Próxima etapa
      </AdminFormButton>
    );

    const button = screen.getByRole('button', { name: /próxima etapa/i });

    expect(button.querySelector('[data-button-content]')).toBeTruthy();
    expect(button.querySelector('[data-button-label]')).toHaveTextContent('Próxima etapa');
  });

  it('does not submit forms by default', () => {
    const handleSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());

    render(
      <form onSubmit={handleSubmit}>
        <AdminFormButton>Continuar</AdminFormButton>
      </form>
    );

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    expect(screen.getByRole('button', { name: /continuar/i })).toHaveAttribute('type', 'button');
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
