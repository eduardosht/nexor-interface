import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export type AdminPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  ariaLabel?: string;
};

export function AdminPagination({
  page,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  onPageChange,
  pageSize,
  pageSizeOptions = [],
  onPageSizeChange,
  ariaLabel = 'Paginação',
}: AdminPaginationProps) {
  const { tokens } = useDesignSystem();
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const canChangePageSize = pageSize !== undefined && pageSizeOptions.length > 0 && onPageSizeChange !== undefined;

  return (
    <Footer>
      <ResultsText $tokens={tokens}>
        {totalItems === 0 ? 'Nenhum resultado' : `Mostrando ${rangeStart} a ${rangeEnd} de ${totalItems} resultados`}
      </ResultsText>
      <Controls>
        <PaginationGroup aria-label={ariaLabel}>
          <PagerButton
            $tokens={tokens}
            type="button"
            disabled={safePage <= 1}
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
          >
            <ChevronLeftIcon aria-hidden />
            Anterior
          </PagerButton>
          <CurrentPage $tokens={tokens} aria-current="page">
            {safePage}
          </CurrentPage>
          <PagerButton
            $tokens={tokens}
            type="button"
            disabled={safePage >= safeTotalPages}
            onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
          >
            Próximo
            <ChevronRightIcon aria-hidden />
          </PagerButton>
        </PaginationGroup>
        {canChangePageSize ? (
          <PageSizeControl $tokens={tokens}>
            <PageSizeSelect
              $tokens={tokens}
              aria-label="Resultados por página"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} por página
                </option>
              ))}
            </PageSizeSelect>
            <ChevronDownIcon aria-hidden />
          </PageSizeControl>
        ) : null}
      </Controls>
    </Footer>
  );
}

const Footer = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
  padding-top: 28px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const ResultsText = styled.span<{ $tokens: BrandTokens }>`
  font-size: 14px;
  color: ${({ $tokens }) => $tokens.colors.textMuted};
`;

const Controls = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;

  @media (max-width: 760px) {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }
`;

const PaginationGroup = styled.nav`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const PagerButton = styled.button<{ $tokens: BrandTokens }>`
  min-width: 88px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  background: ${({ $tokens }) => $tokens.colors.surface};
  font: inherit;
  font-size: 14px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CurrentPage = styled.span<{ $tokens: BrandTokens }>`
  width: 44px;
  height: 44px;
  border: 1px solid #15803d;
  border-radius: 8px;
  display: inline-grid;
  place-items: center;
  color: #15803d;
  background: ${({ $tokens }) => $tokens.colors.surface};
  font-size: 14px;
  font-weight: 800;
`;

const PageSizeControl = styled.label<{ $tokens: BrandTokens }>`
  width: 148px;
  min-height: 44px;
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: 7px;
  background: ${({ $tokens }) => $tokens.colors.surface};
  color: ${({ $tokens }) => $tokens.colors.textMuted};

  @media (max-width: 760px) {
    width: 100%;
  }
`;

const PageSizeSelect = styled.select<{ $tokens: BrandTokens }>`
  width: 100%;
  height: 44px;
  padding: 0 36px 0 12px;
  border: 0;
  appearance: none;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: 2px solid rgba(21, 128, 61, 0.18);
    outline-offset: 2px;
  }

  + svg {
    position: absolute;
    right: 12px;
    pointer-events: none;
  }
`;

function ChevronLeftIcon(props: { 'aria-hidden'?: boolean }) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props: { 'aria-hidden'?: boolean }) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronDownIcon(props: { 'aria-hidden'?: boolean }) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
