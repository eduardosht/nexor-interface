import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { initDesignSystem } from '../../../provider';
import { AdminMobileActionMenu } from './AdminMobileActionMenu';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

describe('AdminMobileActionMenu', () => {
  it('opens, selects an action, and closes with Escape', () => {
    const onSelect = vi.fn();

    render(
      <DesignSystemRoot>
        <AdminMobileActionMenu items={[{ label: 'Aprovar', onSelect }]} />
      </DesignSystemRoot>
    );

    fireEvent.click(screen.getByRole('button', { name: /mais ações/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Aprovar' }));

    expect(onSelect).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /mais ações/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
