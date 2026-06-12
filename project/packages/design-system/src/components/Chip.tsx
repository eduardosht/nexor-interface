import type { HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export type ChipTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone;
}

function toneStyles(tokens: BrandTokens, tone: ChipTone) {
  if (tone === 'success') {
    return css`
      background: #d1fae5;
      color: #065f46;
      border-color: #6ee7b7;
    `;
  }

  if (tone === 'warning') {
    return css`
      background: #fff7e6;
      color: #9a6700;
      border-color: #f5d08a;
    `;
  }

  if (tone === 'error') {
    return css`
      background: ${tokens.colors.dangerBg};
      color: ${tokens.colors.danger};
      border-color: ${tokens.colors.dangerBorder};
    `;
  }

  if (tone === 'info') {
    return css`
      background: ${tokens.colors.accentSoft};
      color: ${tokens.colors.textMuted};
      border-color: ${tokens.colors.border};
    `;
  }

  return css`
    background: ${tokens.colors.surfaceSubtle};
    color: ${tokens.colors.textMuted};
    border-color: ${tokens.colors.border};
  `;
}

const StyledChip = styled.span<{ $tokens: BrandTokens; $tone: ChipTone }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border: 1px solid;
  border-radius: ${({ $tokens }) => $tokens.radius.sm};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;

  ${({ $tokens, $tone }) => toneStyles($tokens, $tone)}
`;

export function Chip({ tone = 'neutral', ...rest }: ChipProps) {
  const { tokens } = useDesignSystem();

  return <StyledChip $tokens={tokens} $tone={tone} {...rest} />;
}
