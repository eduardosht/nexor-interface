import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { initDesignSystem } from '../provider';
import { StickyActionBar } from './StickyActionBar';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function renderBar() {
  const onPrimary = vi.fn();
  const onSecondary = vi.fn();

  render(
    <DesignSystemRoot>
      <StickyActionBar
        primaryLabel="Salvar e avancar"
        secondaryLabel="Voltar"
        onPrimary={onPrimary}
        onSecondary={onSecondary}
      />
    </DesignSystemRoot>
  );

  return { onPrimary, onSecondary };
}

describe('StickyActionBar', () => {
  it('renders primary and secondary actions with mobile-safe fixed positioning', () => {
    const { onPrimary, onSecondary } = renderBar();

    fireEvent.click(screen.getByRole('button', { name: /salvar e avancar/i }));
    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));

    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('sticky-action-bar')).toHaveStyle({ position: 'fixed' });
    expect(screen.getByTestId('sticky-action-bar')).toHaveStyle({ bottom: '0' });
  });

  it('disables the primary action while loading', () => {
    render(
      <DesignSystemRoot>
        <StickyActionBar primaryLabel="Publicar" onPrimary={vi.fn()} loading />
      </DesignSystemRoot>
    );

    expect(screen.getByRole('button', { name: /carregando/i })).toBeDisabled();
  });
});
