import { DataTable, type DataTableColumn, Field, Select } from '@nexor/design-system';
import { useMemo, useState } from 'react';
import { useAdminPortal } from '../../../features/admin/portal';
import { AdminProductGate } from './AdminProductGate';
import {
   ADMIN_USERS,
  ADMIN_USER_STATS,
  USER_FILTERS,
  renderEditAction,
  renderUserProfile,
  renderUserStatus,
  type AdminUserRow,
} from './data';
import {
  FilterBar,
  PageHeader,
  PageStack,
  PageSubtitle,
  PageTitle,
  StatCard,
  StatGrid,
  StatLabel,
  StatValue,
  TableSection,
} from './styles';

const USER_COLUMNS: DataTableColumn<AdminUserRow>[] = [
  { key: 'id', label: 'ID', width: '110px', render: (row) => row.id },
  { key: 'name', label: 'Nome', render: (row) => row.name },
  { key: 'email', label: 'E-mail', render: (row) => row.email },
  { key: 'profile', label: 'Perfil', render: (row) => renderUserProfile(row.profile) },
  { key: 'status', label: 'Status', render: (row) => renderUserStatus(row.status) },
  { key: 'createdAt', label: 'Cadastro', render: (row) => row.createdAt },
  { key: 'lastAccess', label: 'Último acesso', render: (row) => row.lastAccess },
  { key: 'actions', label: 'Ações', width: '130px', render: (row) => renderEditAction(`Editar usuário ${row.id}`) },
];

export function AdminUsers() {
  const { selectedProduct } = useAdminPortal();
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState('');

  const filteredUsers = useMemo(() => {
    return ADMIN_USERS.filter((user) => {
      const matchesProfile = profile ? user.profile === profile : true;
      const haystack = `${user.id} ${user.name} ${user.email}`.toLowerCase();
      const matchesSearch = search.trim() ? haystack.includes(search.trim().toLowerCase()) : true;
      return matchesProfile && matchesSearch;
    });
  }, [profile, search]);

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Usuários do Sistema</PageTitle>
        <PageSubtitle>
          {selectedProduct
            ? `Gerencie usuários, papéis e perfis informativos do ${selectedProduct.label}.`
            : 'Selecione um produto para visualizar a base de usuários.'}
        </PageSubtitle>
      </PageHeader>

      <AdminProductGate />

      {selectedProduct ? (
        <>
          <StatGrid>
            {ADMIN_USER_STATS.map((stat) => (
              <StatCard key={stat.label} padding="lg">
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
              </StatCard>
            ))}
          </StatGrid>

          <TableSection padding="lg">
            <FilterBar>
              <Field
                as="input"
                label="Buscar"
                placeholder="Buscar por nome, e-mail ou ID..."
                value={search}
                onChange={(event) => { setSearch(event.target.value); }}
              />
              <Select
                label="Perfil"
                value={profile}
                placeholder="Todos os perfis"
                onChange={(value) => { setProfile(value); }}
                options={[
                  { value: '', label: 'Todos os perfis' },
                  ...USER_FILTERS.map((filter) => ({
                    value: filter.value,
                    label: filter.label,
                  })),
                ]}
              />
            </FilterBar>

            <DataTable
              data={filteredUsers}
              columns={USER_COLUMNS}
              keyExtractor={(row) => row.id}
              pageSize={6}
              emptyMessage="Nenhum usuário encontrado para os filtros aplicados."
            />
          </TableSection>
        </>
      ) : null}
    </PageStack>
  );
}
