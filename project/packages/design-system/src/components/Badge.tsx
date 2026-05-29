import type { HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export type BadgeTone = 'neutral' | 'accent' | 'warning' | 'error' | 'success';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

function toneStyles(tokens: BrandTokens, tone: BadgeTone) {
  if (tone === 'accent') {
    return css`
      background: ${tokens.colors.accentSoft};
      color: ${tokens.colors.accent};
      border-color: ${tokens.colors.border};
    `;
  }

  if (tone === 'error') {
    return css`
      background: ${tokens.colors.dangerBg};
      color: ${tokens.colors.danger};
      border-color: ${tokens.colors.dangerBorder};
    `;
  }

  if (tone === 'success') {
    return css`
      background: ${tokens.colors.successBg};
      color: ${tokens.colors.text};
      border-color: ${tokens.colors.successBorder};
    `;
  }

  if (tone === 'warning') {
    return css`
      background: #fff7e6;
      color: #9a6700;
      border-color: #f5d08a;
    `;
  }

  return css`
    background: ${tokens.colors.surfaceSubtle};
    color: ${tokens.colors.textMuted};
    border-color: ${tokens.colors.border};
  `;
}

const StyledBadge = styled.span<{ $tokens: BrandTokens; $tone: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 4px 10px;
  border: 1px solid;
  border-radius: ${({ $tokens }) => $tokens.radius.pill};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;

  ${({ $tokens, $tone }) => toneStyles($tokens, $tone)}
`;

export function Badge({ tone = 'neutral', ...rest }: BadgeProps) {
  const { tokens } = useDesignSystem();

  return <StyledBadge $tokens={tokens} $tone={tone} {...rest} />;
}
