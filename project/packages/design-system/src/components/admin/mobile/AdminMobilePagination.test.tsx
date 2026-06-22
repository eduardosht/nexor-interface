import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { initDesignSystem } from '../../../provider';
import { AdminMobilePagination } from './AdminMobilePagination';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

describe('AdminMobilePagination', () => {
  it('shows a compact range and disables boundary actions', () => {
    render(
      <DesignSystemRoot>
        <AdminMobilePagination page={1} pageSize={10} totalItems={25} onPrevious={vi.fn()} onNext={vi.fn()} />
      </DesignSystemRoot>
    );

    expect(screen.getByText('1-10 de 25')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima' })).not.toBeDisabled();
  });
});
