import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { initDesignSystem } from '../provider';
import { FilterSheet } from './FilterSheet';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

describe('FilterSheet', () => {
  it('renders children and calls close, clear and apply actions', () => {
    const onClose = vi.fn();
    const onClear = vi.fn();
    const onApply = vi.fn();

    render(
      <DesignSystemRoot>
        <FilterSheet open title="Filtros de ordens" onClose={onClose} onClear={onClear} onApply={onApply}>
          <label htmlFor="status">Status</label>
          <input id="status" />
        </FilterSheet>
      </DesignSystemRoot>
    );

    expect(screen.getByRole('dialog', { name: /filtros de ordens/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /limpar filtros/i }));
    fireEvent.click(screen.getByRole('button', { name: /aplicar filtros/i }));
    fireEvent.click(screen.getByRole('button', { name: /fechar filtros/i }));

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when closed', () => {
    render(
      <DesignSystemRoot>
        <FilterSheet open={false} title="Filtros" onClose={vi.fn()} onClear={vi.fn()} onApply={vi.fn()}>
          <span>Conteudo</span>
        </FilterSheet>
      </DesignSystemRoot>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('moves focus into the modal, closes with Escape and traps Tab navigation', () => {
    const onClose = vi.fn();

    render(
      <DesignSystemRoot>
        <button type="button">Before sheet</button>
        <FilterSheet open title="Filtros de ordens" onClose={onClose} onClear={vi.fn()} onApply={vi.fn()}>
          <input aria-label="Busca" />
        </FilterSheet>
        <button type="button">After sheet</button>
      </DesignSystemRoot>
    );

    const closeButton = screen.getByRole('button', { name: /fechar filtros/i });
    const applyButton = screen.getByRole('button', { name: /aplicar filtros/i });

    expect(closeButton).toHaveFocus();

    applyButton.focus();
    fireEvent.keyDown(screen.getByRole('dialog', { name: /filtros de ordens/i }), {
      key: 'Tab',
    });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('dialog', { name: /filtros de ordens/i }), {
      key: 'Escape',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
