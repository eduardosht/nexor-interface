import { ArrowUp } from 'lucide-react';
import * as S from './WorkflowFormsPanel.styles';

export type FormValidationItem = {
  key: string;
  label: string;
  sectionIndex: number;
  message?: string;
};

type FormValidationsProps = {
  items: FormValidationItem[];
  onItemClick: (field: FormValidationItem) => void;
  title?: string;
  description?: string;
  footer?: string;
  ariaLabel?: string;
};

export function FormValidations({
  items,
  onItemClick,
  title = 'Campos obrigatórios pendentes',
  description = 'Complete os campos abaixo para continuar.',
  footer = 'Campos obrigatórios são essenciais para uma avaliação precisa.',
  ariaLabel = 'Campos obrigatórios pendentes',
}: FormValidationsProps) {
  if (items.length === 0) {
    return null;
  }

  const pendingCountLabel = `${items.length} ${items.length === 1 ? 'pendente' : 'pendentes'}`;

  return (
    <S.PendingRequiredLegend aria-label={ariaLabel}>
      <S.PendingRequiredHeader>
        <S.PendingRequiredHeaderCopy>
          <S.PendingRequiredTitle>{title}</S.PendingRequiredTitle>
          <S.PendingRequiredDescription>{description}</S.PendingRequiredDescription>
        </S.PendingRequiredHeaderCopy>
        <S.PendingRequiredCountBadge>{pendingCountLabel}</S.PendingRequiredCountBadge>
      </S.PendingRequiredHeader>
      <S.PendingRequiredList>
        {items.map((field, index) => (
          <S.PendingRequiredItem key={field.key}>
            <S.PendingRequiredButton
              type="button"
              aria-label={`Ir para campo ${index + 1}`}
              title={`Ir para ${field.label}`}
              onClick={() => onItemClick(field)}
            >
              <S.PendingRequiredItemContent>
                <S.PendingRequiredItemHeader>
                  <S.PendingRequiredItemNumber>{index + 1}</S.PendingRequiredItemNumber>
                  <S.PendingRequiredItemLabel>{field.label}</S.PendingRequiredItemLabel>
                </S.PendingRequiredItemHeader>
                {field.message ? (
                  <S.PendingRequiredItemMessage>{field.message}</S.PendingRequiredItemMessage>
                ) : null}
              </S.PendingRequiredItemContent>
              <S.PendingRequiredItemArrow aria-hidden="true">
                <ArrowUp size={18} strokeWidth={2.6} />
              </S.PendingRequiredItemArrow>
            </S.PendingRequiredButton>
          </S.PendingRequiredItem>
        ))}
      </S.PendingRequiredList>
      <S.PendingRequiredFooter>
        <S.PendingRequiredFooterMark aria-hidden="true">(*)</S.PendingRequiredFooterMark>
        <span>{footer}</span>
      </S.PendingRequiredFooter>
    </S.PendingRequiredLegend>
  );
}
