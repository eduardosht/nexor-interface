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

    const button = screen.getByRole('button');
    const content = button.querySelector('[data-button-content]');
    const label = button.querySelector('[data-button-label]');

    expect(button).toHaveStyle({
      width: 'auto',
      maxWidth: 'none',
      minWidth: 'max-content',
      minHeight: '46px',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      overflowWrap: 'normal',
    });
    expect(content).toHaveStyle({
      maxWidth: '100%',
      minWidth: '0',
      whiteSpace: 'inherit',
      overflowWrap: 'inherit',
    });
    expect(label).toHaveStyle({
      maxWidth: '100%',
      minWidth: '0',
      whiteSpace: 'inherit',
      overflowWrap: 'inherit',
    });
  });

  it('separates icon and label slots so icon sizing does not shrink text', () => {
    render(
      <Button leadingIcon={<svg aria-hidden="true" viewBox="0 0 16 16"><path d="M1 1h14v14H1z" /></svg>}>
        Baixar ficha de anamnese
      </Button>
    );

    const button = screen.getByRole('button', { name: /baixar ficha de anamnese/i });

    expect(button.querySelector('[data-button-content]')).toBeTruthy();
    expect(button.querySelector('[data-button-icon]')).toBeTruthy();
    expect(button.querySelector('[data-button-label]')).toHaveTextContent('Baixar ficha de anamnese');
  });

  it('only stretches to the container when fullWidth is enabled', () => {
    render(<Button fullWidth>Salvar</Button>);

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveStyle({
      width: '100%',
      maxWidth: '100%',
      minWidth: '0',
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
