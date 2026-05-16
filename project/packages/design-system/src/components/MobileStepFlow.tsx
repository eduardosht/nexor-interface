import type { ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';
import { Button } from './Button';

export interface MobileStepDefinition {
  id: string;
  title: string;
  summary?: ReactNode;
}

export interface MobileStepFlowProps {
  steps: MobileStepDefinition[];
  activeStepId: string;
  onStepChange: (stepId: string) => void;
  renderStep: (step: MobileStepDefinition) => ReactNode;
}

const Wrap = styled.section<{ $tokens: BrandTokens }>`
  display: grid;
  gap: 16px;

  @media (min-width: 769px) {
    display: none;
  }
`;

const Header = styled.header`
  display: grid;
  gap: 8px;
`;

const Progress = styled.span<{ $tokens: BrandTokens }>`
  width: fit-content;
  padding: 3px 8px;
  border-radius: ${({ $tokens }) => $tokens.radius.sm};
  background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  font-size: 12px;
  font-weight: 700;
`;

const Title = styled.h2<{ $tokens: BrandTokens }>`
  margin: 0;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-size: 20px;
  line-height: 1.2;
`;

const Summary = styled.p<{ $tokens: BrandTokens }>`
  margin: 0;
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  font-size: 13px;
  line-height: 1.5;
`;

const Body = styled.div`
  min-width: 0;
`;

const Nav = styled.div`
  display: flex;
  gap: 10px;
`;

export function MobileStepFlow({
  steps,
  activeStepId,
  onStepChange,
  renderStep,
}: MobileStepFlowProps) {
  const { tokens } = useDesignSystem();

  if (steps.length === 0) return null;

  const foundIndex = steps.findIndex((step) => step.id === activeStepId);
  const activeIndex = foundIndex >= 0 ? foundIndex : 0;
  const activeStep = steps[activeIndex];
  const previousStep = activeIndex > 0 ? steps[activeIndex - 1] : null;
  const nextStep = activeIndex < steps.length - 1 ? steps[activeIndex + 1] : null;

  return (
    <Wrap $tokens={tokens} aria-label="Fluxo guiado mobile">
      <Header>
        <Progress $tokens={tokens}>
          {activeIndex + 1}/{steps.length}
        </Progress>
        <Title $tokens={tokens}>{activeStep.title}</Title>
        {activeStep.summary ? <Summary $tokens={tokens}>{activeStep.summary}</Summary> : null}
      </Header>
      <Body>{renderStep(activeStep)}</Body>
      <Nav>
        {previousStep ? (
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => onStepChange(previousStep.id)}
          >
            Voltar para {previousStep.title}
          </Button>
        ) : null}
        {nextStep ? (
          <Button type="button" fullWidth onClick={() => onStepChange(nextStep.id)}>
            Avançar para {nextStep.title}
          </Button>
        ) : null}
      </Nav>
    </Wrap>
  );
}
