import { ArrowUp } from 'lucide-react';
import * as S from './WorkflowFormsPanel.styles';

export type PendingRequiredField = {
  key: string;
  label: string;
  sectionIndex: number;
};

type WorkflowFormsPendingRequiredLegendProps = {
  items: PendingRequiredField[];
  onFieldClick: (field: PendingRequiredField) => void;
};

export function WorkflowFormsPendingRequiredLegend({
  items,
  onFieldClick,
}: WorkflowFormsPendingRequiredLegendProps) {
  if (items.length === 0) {
    return null;
  }

  const pendingCountLabel = `${items.length} ${items.length === 1 ? 'pendente' : 'pendentes'}`;

  return (
    <S.PendingRequiredLegend aria-label="Campos obrigatórios pendentes">
      <S.PendingRequiredHeader>
        <S.PendingRequiredHeaderCopy>
          <S.PendingRequiredTitle>Campos obrigatórios pendentes</S.PendingRequiredTitle>
          <S.PendingRequiredDescription>
            Complete os campos abaixo para continuar.
          </S.PendingRequiredDescription>
        </S.PendingRequiredHeaderCopy>
        <S.PendingRequiredCountBadge>{pendingCountLabel}</S.PendingRequiredCountBadge>
      </S.PendingRequiredHeader>
      <S.PendingRequiredList>
        {items.map((field, index) => (
          <S.PendingRequiredItem key={field.key}>
            <S.PendingRequiredButton
              type="button"
              aria-label={`Ir para ${field.label}`}
              onClick={() => onFieldClick(field)}
            >
              <S.PendingRequiredItemNumber>{index + 1}</S.PendingRequiredItemNumber>
              <S.PendingRequiredItemLabel>{field.label}</S.PendingRequiredItemLabel>
              <S.PendingRequiredItemArrow aria-hidden="true">
                <ArrowUp size={18} strokeWidth={2.6} />
              </S.PendingRequiredItemArrow>
            </S.PendingRequiredButton>
          </S.PendingRequiredItem>
        ))}
      </S.PendingRequiredList>
      <S.PendingRequiredFooter>
        <S.PendingRequiredFooterMark aria-hidden="true">(*)</S.PendingRequiredFooterMark>
        <span>Campos obrigatórios são essenciais para uma avaliação precisa.</span>
      </S.PendingRequiredFooter>
    </S.PendingRequiredLegend>
  );
}
