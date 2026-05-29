import { fireEvent, render, screen } from '@testing-library/react';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('uses regular text weight', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveStyle({
      fontWeight: '400',
    });
  });

  it('keeps button labels on one line without shrinking below readable size', () => {
    render(<Button>Salvar complemento do dentista com um texto muito longo</Button>);

    expect(screen.getByRole('button')).toHaveStyle({
      maxWidth: '100%',
      minWidth: '0',
      minHeight: '46px',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      overflowWrap: 'normal',
    });
  });

  it('does not submit forms by default', () => {
    const handleSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());

    render(
      <form onSubmit={handleSubmit}>
        <Button>Cancelar</Button>
      </form>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveAttribute('type', 'button');
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits forms only when explicitly configured as submit', () => {
    const handleSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());

    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit">Enviar</Button>
      </form>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute('type', 'submit');
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
