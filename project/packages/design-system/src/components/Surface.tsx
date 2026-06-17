import type { HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export type SurfaceTone = 'default' | 'subtle' | 'accent';
export type SurfacePadding = 'sm' | 'md' | 'lg';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  padding?: SurfacePadding;
  interactive?: boolean;
}

const paddingStyles = {
  sm: css`
    padding: 12px;
  `,
  md: css`
    padding: 16px;
  `,
  lg: css`
    padding: 24px;
  `,
};

function toneStyles(tokens: BrandTokens, tone: SurfaceTone) {
  if (tone === 'subtle') {
    return css`
      background: ${tokens.colors.surfaceSubtle};
      border-color: ${tokens.colors.border};
    `;
  }

  if (tone === 'accent') {
    return css`
      background: ${tokens.colors.accentSoft};
      border-color: ${tokens.colors.border};
    `;
  }

  return css`
    background: ${tokens.colors.surface};
    border-color: ${tokens.colors.border};
  `;
}

const StyledSurface = styled.div<{
  $tokens: BrandTokens;
  $tone: SurfaceTone;
  $padding: SurfacePadding;
  $interactive: boolean;
}>`
  border: 1px solid;
  border-radius: ${({ $tokens }) => $tokens.radius.lg};
  box-shadow: ${({ $tokens }) => $tokens.shadow.sm};
  transition:
    background ${({ $tokens }) => $tokens.motion.base} ease,
    border-color ${({ $tokens }) => $tokens.motion.base} ease,
    box-shadow ${({ $tokens }) => $tokens.motion.base} ease,
    transform ${({ $tokens }) => $tokens.motion.fast} ease;

  ${({ $tokens, $tone }) => toneStyles($tokens, $tone)}
  ${({ $padding }) => paddingStyles[$padding]}

  @media (max-width: 768px) {
    ${({ $padding }) =>
      $padding === 'lg'
        ? css`
            padding: 16px;
          `
        : ''}
  }

  ${({ $interactive, $tokens }) =>
    $interactive
      ? css`
          cursor: pointer;

          &:hover {
            transform: translateY(-2px);
            box-shadow: ${$tokens.shadow.md};
          }
        `
      : ''}
`;

export function Surface({
  tone = 'default',
  padding = 'md',
  interactive = false,
  ...rest
}: SurfaceProps) {
  const { tokens } = useDesignSystem();

  return (
    <StyledSurface
      $tokens={tokens}
      $tone={tone}
      $padding={padding}
      $interactive={interactive}
      {...rest}
    />
  );
}
