import type { ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';
import { Button } from './Button';

export interface StickyActionBarProps {
  primaryLabel: ReactNode;
  onPrimary: () => void;
  secondaryLabel?: ReactNode;
  onSecondary?: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  loading?: boolean;
}

const Bar = styled.div<{ $tokens: BrandTokens }>`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid ${({ $tokens }) => $tokens.colors.border};
  background: ${({ $tokens }) => $tokens.colors.surface};
  box-shadow: 0 -10px 28px rgba(23, 23, 23, 0.1);

  @media (min-width: 769px) {
    display: none;
  }

  @media (max-width: 768px) {
    gap: 8px;
    padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  }
`;

export function StickyActionBar({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryDisabled = false,
  secondaryDisabled = false,
  loading = false,
}: StickyActionBarProps) {
  const { tokens } = useDesignSystem();

  return (
    <Bar $tokens={tokens} data-testid="sticky-action-bar">
      {secondaryLabel && onSecondary ? (
        <Button
          type="button"
          variant="secondary"
          fullWidth
          disabled={secondaryDisabled || loading}
          onClick={onSecondary}
        >
          {secondaryLabel}
        </Button>
      ) : null}
      <Button
        type="button"
        fullWidth
        loading={loading}
        disabled={primaryDisabled}
        onClick={onPrimary}
      >
        {primaryLabel}
      </Button>
    </Bar>
  );
}
