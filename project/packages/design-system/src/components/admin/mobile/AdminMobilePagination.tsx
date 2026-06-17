import styled from 'styled-components';
import { adminColor } from '../adminTheme';

export interface AdminMobilePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function AdminMobilePagination({ page, pageSize, totalItems, onPrevious, onNext }: AdminMobilePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  return (
    <Pager aria-label="Paginação mobile">
      <Summary>{totalItems === 0 ? 'Nenhum resultado' : `${start}-${end} de ${totalItems}`}</Summary>
      <ButtonRow>
        <PagerButton type="button" disabled={safePage <= 1} onClick={onPrevious}>
          Anterior
        </PagerButton>
        <Page aria-current="page">{safePage}</Page>
        <PagerButton type="button" disabled={safePage >= totalPages} onClick={onNext}>
          Próxima
        </PagerButton>
      </ButtonRow>
    </Pager>
  );
}

const Pager = styled.nav`
  display: grid;
  gap: 8px;
`;

const Summary = styled.span`
  color: ${({ theme }) => adminColor(theme, 'textSecondary', 'textMuted', '#525252')};
  font-size: 12px;
  line-height: 1.3;
`;

const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 40px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
`;

const PagerButton = styled.button`
  min-width: 0;
  min-height: 40px;
  border: 1px solid ${({ theme }) => adminColor(theme, 'borderDefault', 'border', '#E0E0E0')};
  border-radius: 8px;
  background: ${({ theme }) => adminColor(theme, 'bgElevated', 'surface', '#FFFFFF')};
  color: ${({ theme }) => adminColor(theme, 'textPrimary', 'text', '#171717')};
  font: inherit;
  font-size: 12px;
  cursor: pointer;

  &:disabled {
    opacity: 0.48;
    cursor: not-allowed;
  }
`;

const Page = styled.span`
  width: 40px;
  height: 40px;
  display: inline-grid;
  place-items: center;
  border: 1px solid #15803d;
  border-radius: 8px;
  color: #15803d;
  font-size: 12px;
  font-weight: 800;
`;
