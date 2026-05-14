import { useMemo, useState, type ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';
import { Button } from './Button';
import { Field } from './Field';
import { MultiSelect } from './MultiSelect';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string;
  filterOptions?: Array<{ value: string; label: string }>;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterValues?: string[];
  onFilterValuesChange?: (values: string[]) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  pageSize?: number;
  emptyMessage?: ReactNode;
}

const Controls = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const SearchWrap = styled.div`
  flex: 1 1 260px;
  min-width: 0;
`;

const FilterWrap = styled.div<{ $multiSelect?: boolean }>`
  ${({ $multiSelect }) => $multiSelect ? 'min-width: 200px; width: auto;' : 'width: 200px;'}
  flex: 0 1 260px;
  min-width: 200px;

  @media (max-width: 640px) {
    width: 100%;
    min-width: 0;
    flex-basis: 100%;
  }
`;

const TableContainer = styled.div<{ $tokens: BrandTokens }>`
  width: 100%;
  min-width: 0;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.lg};
  overflow-x: auto;
  overflow-y: hidden;
`;

const StyledTable = styled.table`
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
`;

const Thead = styled.thead<{ $tokens: BrandTokens }>`
  background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
`;

const Th = styled.th<{ $tokens: BrandTokens; $width?: string }>`
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  text-align: left;
  width: ${({ $width }) => $width ?? 'auto'};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
`;

const Tr = styled.tr<{ $tokens: BrandTokens }>`
  border-top: 1px solid ${({ $tokens }) => $tokens.colors.border};
  transition: background ${({ $tokens }) => $tokens.motion.fast} ease;

  &:hover {
    background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
  }
`;

const Td = styled.td<{ $tokens: BrandTokens }>`
  padding: 14px 16px;
  font-size: 13px;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  vertical-align: middle;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  flex-wrap: wrap;
  gap: 8px;
`;

const FooterInfo = styled.span<{ $tokens: BrandTokens }>`
  font-size: 13px;
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
`;

const PageButtons = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const EmptyRow = styled.tr<{ $tokens: BrandTokens }>`
  td {
    padding: 24px 16px;
    font-size: 14px;
    color: ${({ $tokens }) => $tokens.colors.textMuted};
    font-family: ${({ $tokens }) => $tokens.fonts.body};
    text-align: center;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  filterOptions,
  filterValue = '',
  onFilterChange,
  filterValues,
  onFilterValuesChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  pageSize = 5,
  emptyMessage = 'Nenhum resultado encontrado.',
}: DataTableProps<T>) {
  const { tokens } = useDesignSystem();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = data.slice(start, end);

  const showControls =
    onSearchChange !== undefined ||
    (filterOptions !== undefined && filterOptions.length > 0) ||
    filterValues !== undefined;

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }, [totalPages]);

  const rangeStart = data.length === 0 ? 0 : start + 1;
  const rangeEnd = Math.min(end, data.length);

  return (
    <Wrapper>
      {showControls && (
        <Controls>
          {onSearchChange !== undefined && (
            <SearchWrap>
              <Field
                as="input"
                value={searchValue}
                onChange={(e) => { onSearchChange(e.target.value); setPage(1); }}
                placeholder={searchPlaceholder}
              />
            </SearchWrap>
          )}
          {filterValues !== undefined && onFilterValuesChange !== undefined && (
            <FilterWrap $multiSelect>
              <MultiSelect
                options={filterOptions ?? []}
                value={filterValues}
                onChange={(vals) => { onFilterValuesChange(vals); setPage(1); }}
              />
            </FilterWrap>
          )}
          {filterValues === undefined && filterOptions !== undefined && filterOptions.length > 0 && onFilterChange !== undefined && (
            <FilterWrap>
              <Field
                as="select"
                value={filterValue}
                onChange={(e) => { onFilterChange(e.target.value); setPage(1); }}
              >
                <option value="">Todos os Status</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Field>
            </FilterWrap>
          )}
        </Controls>
      )}

      <TableContainer $tokens={tokens}>
        <StyledTable>
          <Thead $tokens={tokens}>
            <tr>
              {columns.map((col) => (
                <Th key={col.key} $tokens={tokens} $width={col.width}>
                  {col.label}
                </Th>
              ))}
            </tr>
          </Thead>
          <tbody>
            {pageData.length === 0 ? (
              <EmptyRow $tokens={tokens}>
                <td colSpan={columns.length}>{emptyMessage}</td>
              </EmptyRow>
            ) : (
              pageData.map((row) => (
                <Tr key={keyExtractor(row)} $tokens={tokens}>
                  {columns.map((col) => (
                    <Td key={col.key} $tokens={tokens}>
                      {col.render(row)}
                    </Td>
                  ))}
                </Tr>
              ))
            )}
          </tbody>
        </StyledTable>
      </TableContainer>

      <Footer>
        <FooterInfo $tokens={tokens}>
          {data.length === 0
            ? 'Nenhum resultado'
            : `Mostrando ${rangeStart} a ${rangeEnd} de ${data.length} resultados`}
        </FooterInfo>
        {totalPages > 1 && (
          <PageButtons>
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage === 1}
              onClick={() => { setPage((p) => Math.max(1, p - 1)); }}
            >
              Anterior
            </Button>
            {pageNumbers.map((n) => (
              <Button
                key={n}
                variant={n === safePage ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => { setPage(n); }}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage === totalPages}
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); }}
            >
              Próximo
            </Button>
          </PageButtons>
        )}
      </Footer>
    </Wrapper>
  );
}
