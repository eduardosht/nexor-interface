import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { initDesignSystem } from '../provider';
import { AdminDataTable, type AdminDataTableColumn } from './AdminDataTable';

type Row = {
  id: string;
  name: string;
};

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

const columns: AdminDataTableColumn<Row>[] = [
  { key: 'name', label: 'Nome', render: (row) => row.name, sortValue: (row) => row.name },
];

describe('AdminDataTable', () => {
  it('renders the desktop table and optional mobile cards from the same visible page', () => {
    render(
      <DesignSystemRoot>
        <AdminDataTable
          data={[{ id: '1', name: 'Marina' }]}
          columns={columns}
          keyExtractor={(row) => row.id}
          renderMobileCard={(row) => <article>Mobile {row.name}</article>}
          mobileTestId="admin-table-mobile"
          testId="admin-table"
        />
      </DesignSystemRoot>
    );

    expect(screen.getByTestId('admin-table')).toBeInTheDocument();
    expect(screen.getByTestId('admin-table-mobile')).toBeInTheDocument();
    expect(screen.getByText('Mobile Marina')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Marina' })).toBeInTheDocument();
  });

  it('renders a single empty message when mobile cards are enabled', () => {
    render(
      <DesignSystemRoot>
        <AdminDataTable
          data={[]}
          columns={columns}
          keyExtractor={(row) => row.id}
          renderMobileCard={(row) => <article>Mobile {row.name}</article>}
          emptyMessage="Nenhum resultado encontrado."
          mobileTestId="admin-table-mobile"
          testId="admin-table"
        />
      </DesignSystemRoot>
    );

    expect(screen.getAllByText('Nenhum resultado encontrado.')).toHaveLength(1);
    expect(screen.queryByText('Nenhum resultado')).not.toBeInTheDocument();
  });

  it('keeps the unified empty message separated from the table header', () => {
    const source = readFileSync(resolve(__dirname, 'AdminDataTable.tsx'), 'utf8');
    const unifiedEmptySource = source.slice(
      source.indexOf('const UnifiedEmpty'),
      source.indexOf('function SearchIcon')
    );

    expect(unifiedEmptySource).toContain('margin-top: 14px;');
  });
});
