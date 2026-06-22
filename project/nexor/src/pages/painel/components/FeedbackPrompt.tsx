import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { PendingReviewOpportunity } from '../biteplanerReviewForms';

interface FeedbackPromptProps {
  opportunity: PendingReviewOpportunity;
  onDismiss: (opportunity: PendingReviewOpportunity) => void;
}

const Prompt = styled.aside`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-left: 3px solid #eab308;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 10px 24px rgba(23, 23, 23, 0.05);

  @media (max-width: 640px) {
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

const Icon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #fffbeb;
  color: #a16207;
`;

const Copy = styled.div`
  min-width: 0;
`;

const Title = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  line-height: 1.35;
`;

const Description = styled.p`
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  line-height: 1.5;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 640px) {
    grid-column: 1 / -1;
    justify-content: flex-end;
  }
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgBase};
  font-size: 12px;
  font-weight: 750;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid rgba(234, 179, 8, 0.35);
    outline-offset: 2px;
  }
`;

const SecondaryButton = styled.button`
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textSecondary};
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:focus-visible {
    outline: 2px solid rgba(234, 179, 8, 0.35);
    outline-offset: 2px;
  }
`;

export function FeedbackPrompt({ opportunity, onDismiss }: FeedbackPromptProps) {
  return (
    <Prompt aria-label="Convite para avaliação Biteplaner">
      <Icon aria-hidden>
        <Star size={18} fill="currentColor" />
      </Icon>
      <Copy>
        <Title>{opportunity.title}</Title>
        <Description>
          Sua avaliação ajuda a qualificar a rede Biteplaner. {opportunity.context}
        </Description>
      </Copy>
      <Actions>
        <SecondaryButton type="button" onClick={() => onDismiss(opportunity)}>
          Responder depois
        </SecondaryButton>
        <PrimaryLink to={opportunity.route}>Avaliar agora</PrimaryLink>
      </Actions>
    </Prompt>
  );
}
