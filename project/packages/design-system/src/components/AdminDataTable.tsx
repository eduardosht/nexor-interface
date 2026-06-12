import { useMemo, useState, type ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';
import { AdminPagination } from './AdminPagination';

export type AdminDataTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | null | undefined;
  width?: string;
  align?: 'left' | 'center' | 'right';
};

export type AdminDataTableProps<T> = {
  data: T[];
  columns: AdminDataTableColumn<T>[];
  keyExtractor: (row: T, index: number) => string;
  searchLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  emptyMessage?: string;
  pageSize?: number;
  testId?: string;
  actions?: ReactNode;
};

export function AdminDataTable<T>({
  data,
  columns,
  keyExtractor,
  searchLabel = 'Buscar',
  searchPlaceholder = 'Buscar...',
  searchValue = '',
  onSearchChange,
  emptyMessage = 'Nenhum registro encontrado.',
  pageSize = 10,
  testId,
  actions,
}: AdminDataTableProps<T>) {
  const { tokens } = useDesignSystem();
  const [sortKey, setSortKey] = useState<string>(columns[0]?.key ?? '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const sortedData = useMemo(() => {
    const column = columns.find((candidate) => candidate.key === sortKey);
    if (!column?.sortValue) return data;

    const direction = sortDirection === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const aValue = column.sortValue?.(a) ?? '';
      const bValue = column.sortValue?.(b) ?? '';

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }

      return String(aValue).localeCompare(String(bValue), 'pt-BR', { numeric: true }) * direction;
    });
  }, [columns, data, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const visibleRows = sortedData.slice(pageStart, pageStart + pageSize);
  const rangeStart = sortedData.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + pageSize, sortedData.length);

  function toggleSort(nextKey: string) {
    setPage(1);
    setSortKey((currentKey) => {
      if (currentKey !== nextKey) {
        setSortDirection('asc');
        return nextKey;
      }

      setSortDirection((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'));
      return currentKey;
    });
  }

  function updateSearch(value: string) {
    setPage(1);
    onSearchChange?.(value);
  }

  return (
    <Panel $tokens={tokens}>
      {onSearchChange || actions ? (
        <Toolbar>
          {onSearchChange ? (
            <SearchGroup>
              <SearchLabel $tokens={tokens} htmlFor={`${testId ?? 'admin'}-search`}>{searchLabel}</SearchLabel>
              <SearchInputWrap $tokens={tokens}>
                <SearchIcon aria-hidden />
                <SearchInput
                  $tokens={tokens}
                  id={`${testId ?? 'admin'}-search`}
                  aria-label={searchLabel}
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(event) => updateSearch(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </SearchInputWrap>
            </SearchGroup>
          ) : null}
          {actions ? <Actions>{actions}</Actions> : null}
        </Toolbar>
      ) : null}

      <TableWrap $tokens={tokens} data-testid={testId}>
        <Table $tokens={tokens}>
          <thead>
            <tr>
              {columns.map((column) => (
                <Th $align={column.align ?? 'left'} $width={column.width} key={column.key}>
                  {column.sortValue ? (
                    <SortButton type="button" onClick={() => toggleSort(column.key)}>
                      {column.label} <SortIcon aria-hidden />
                    </SortButton>
                  ) : (
                    column.label
                  )}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <EmptyCell $tokens={tokens} colSpan={columns.length}>{emptyMessage}</EmptyCell>
              </tr>
            ) : (
              visibleRows.map((row, index) => (
                <tr key={keyExtractor(row, pageStart + index)}>
                  {columns.map((column) => (
                    <Td $align={column.align ?? 'left'} key={column.key}>{column.render(row)}</Td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableWrap>

      <AdminPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={sortedData.length}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onPageChange={setPage}
      />
    </Panel>
  );
}

const Panel = styled.section<{ $tokens: BrandTokens }>`
  padding: 18px;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: 14px;
  background: ${({ $tokens }) => $tokens.colors.surface};
  box-shadow: 0 18px 42px rgba(23, 23, 23, 0.05);
`;

const Toolbar = styled.div`
  display: grid;
  gap: 14px;
  margin-bottom: 16px;
`;

const SearchGroup = styled.div`
  display: grid;
  gap: 10px;
`;

const SearchLabel = styled.label<{ $tokens: BrandTokens }>`
  font-size: 14px;
  line-height: 1.3;
  font-weight: 800;
  color: ${({ $tokens }) => $tokens.colors.text};
`;

const SearchInputWrap = styled.div<{ $tokens: BrandTokens }>`
  min-width: 0;
  position: relative;

  svg {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ $tokens }) => $tokens.colors.text};
    pointer-events: none;
  }
`;

const SearchInput = styled.input<{ $tokens: BrandTokens }>`
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: 7px;
  padding: 0 18px 0 52px;
  font: inherit;
  font-size: 14px;
  color: ${({ $tokens }) => $tokens.colors.text};
  background: ${({ $tokens }) => $tokens.colors.surface};
`;

const Actions = styled.div`
  min-width: 0;
`;

const TableWrap = styled.div<{ $tokens: BrandTokens }>`
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: 12px;
`;

const Table = styled.table<{ $tokens: BrandTokens }>`
  width: 100%;
  min-width: 980px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;

  thead {
    background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
  }

  th,
  td {
    padding: 12px 16px;
    vertical-align: middle;
  }

  th {
    height: 44px;
    box-sizing: border-box;
    border-bottom: 1px solid ${({ $tokens }) => $tokens.colors.border};
    color: ${({ $tokens }) => $tokens.colors.textMuted};
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  td {
    height: 58px;
    box-sizing: border-box;
    color: ${({ $tokens }) => $tokens.colors.text};
    font-size: 14px;
  }

  tbody tr + tr td {
    border-top: 1px solid ${({ $tokens }) => $tokens.colors.border};
  }
`;

const Th = styled.th<{ $align: 'left' | 'center' | 'right'; $width?: string }>`
  text-align: ${({ $align }) => $align};
  width: ${({ $width }) => $width ?? 'auto'};
`;

const Td = styled.td<{ $align: 'left' | 'center' | 'right' }>`
  text-align: ${({ $align }) => $align};
`;

const SortButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const EmptyCell = styled.td<{ $tokens: BrandTokens }>`
  height: 120px;
  text-align: center !important;
  color: ${({ $tokens }) => $tokens.colors.textMuted};
`;

function SearchIcon(props: { 'aria-hidden'?: boolean }) {
  return (
    <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function SortIcon(props: { 'aria-hidden'?: boolean }) {
  return (
    <svg {...props} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  );
}
