import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { initDesignSystem } from '../../../provider';
import { AdminCollectionToolbar } from './AdminCollectionToolbar';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

describe('AdminCollectionToolbar', () => {
  it('renders search, filters, sorting, utilities, and active filter count', () => {
    const onSearchChange = vi.fn();

    render(
      <DesignSystemRoot>
        <AdminCollectionToolbar
          searchValue=""
          onSearchChange={onSearchChange}
          filterButton={<button type="button">Filtros</button>}
          sortButton={<button type="button">Ordenar</button>}
          utilityActions={<button type="button">Exportar</button>}
          activeFilterCount={2}
        />
      </DesignSystemRoot>
    );

    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar' }), { target: { value: 'Marina' } });

    expect(onSearchChange).toHaveBeenCalledWith('Marina');
    expect(screen.getByRole('button', { name: 'Filtros' })).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ordenar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument();
  });
});
