import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
};

export default meta;
// DataTable é genérico — StoryObj<typeof DataTable> não resolve T.
// Usar um tipo concreto para evitar erro de TypeScript em strict mode.
type Story = StoryObj<typeof DataTable<{ id: string; name: string; status: string }>>;

const sampleData = Array.from({ length: 12 }, (_, i) => ({
  id: `row-${i + 1}`,
  name: `Cliente ${i + 1}`,
  status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'cancelled',
}));

export const Default: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');

    const filtered = sampleData
      .filter((r) => !filter || r.status === filter)
      .filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()));

    return (
      <DataTable
        data={filtered}
        keyExtractor={(r) => r.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome..."
        filterValue={filter}
        onFilterChange={setFilter}
        filterOptions={[
          { value: 'active', label: 'Ativo' },
          { value: 'pending', label: 'Pendente' },
          { value: 'cancelled', label: 'Cancelado' },
        ]}
        columns={[
          { key: 'id', label: 'ID', render: (r) => r.id },
          { key: 'name', label: 'Nome', render: (r) => r.name },
          { key: 'status', label: 'Status', render: (r) => r.status },
        ]}
      />
    );
  },
};
