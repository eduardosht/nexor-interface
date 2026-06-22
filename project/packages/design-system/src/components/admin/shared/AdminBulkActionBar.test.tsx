import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { initDesignSystem } from '../../../provider';
import { AdminBulkActionBar } from './AdminBulkActionBar';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

describe('AdminBulkActionBar', () => {
  it('renders selected count and actions only when there is selection', () => {
    const { rerender } = render(
      <DesignSystemRoot>
        <AdminBulkActionBar selectedCount={0} onClearSelection={vi.fn()}>
          <button type="button">Arquivar</button>
        </AdminBulkActionBar>
      </DesignSystemRoot>
    );

    expect(screen.queryByRole('region', { name: 'Ações em lote' })).not.toBeInTheDocument();

    rerender(
      <DesignSystemRoot>
        <AdminBulkActionBar selectedCount={2} onClearSelection={vi.fn()}>
          <button type="button">Arquivar</button>
        </AdminBulkActionBar>
      </DesignSystemRoot>
    );

    expect(screen.getByText('2 selecionados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Arquivar' })).toBeInTheDocument();
  });
});
