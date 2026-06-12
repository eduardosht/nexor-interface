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

  return (
    <S.PendingRequiredLegend aria-label="Campos obrigatórios pendentes">
      <S.PendingRequiredTitle>Campos obrigatórios pendentes</S.PendingRequiredTitle>
      <S.PendingRequiredList>
        {items.map((field) => (
          <S.PendingRequiredItem key={field.key}>
            <span>{field.label}</span>
            <S.PendingRequiredButton
              type="button"
              aria-label={`Ir para ${field.label}`}
              onClick={() => onFieldClick(field)}
            >
              <ArrowUp size={14} aria-hidden="true" />
            </S.PendingRequiredButton>
          </S.PendingRequiredItem>
        ))}
      </S.PendingRequiredList>
    </S.PendingRequiredLegend>
  );
}
