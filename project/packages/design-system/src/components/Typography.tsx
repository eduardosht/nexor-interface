import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export type TypographyVariant =
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'heading-4'
  | 'heading-5'
  | 'heading-6'
  | 'paragraph-lg'
  | 'paragraph-md'
  | 'paragraph-sm'
  | 'description-lg'
  | 'description-md'
  | 'caption-md'
  | 'caption-sm';

export type TypographyAlign = 'left' | 'center' | 'right';
export type TypographyTone = 'default' | 'muted' | 'soft' | 'accent';

export type TypographyProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  variant?: TypographyVariant;
  align?: TypographyAlign;
  tone?: TypographyTone;
  children?: ReactNode;
};

const variantConfig: Record<
  TypographyVariant,
  {
    defaultAs: ElementType;
    style: (tokens: BrandTokens) => ReturnType<typeof css>;
  }
> = {
  'heading-1': {
    defaultAs: 'h1',
    style: (tokens) => css`
      font-family: ${tokens.fonts.display};
      font-size: ${tokens.typography.heading['1'].fontSize};
      line-height: ${tokens.typography.heading['1'].lineHeight};
      letter-spacing: ${tokens.typography.heading['1'].letterSpacing};
      font-weight: 700;
    `,
  },
  'heading-2': {
    defaultAs: 'h2',
    style: (tokens) => css`
      font-family: ${tokens.fonts.display};
      font-size: ${tokens.typography.heading['2'].fontSize};
      line-height: ${tokens.typography.heading['2'].lineHeight};
      letter-spacing: ${tokens.typography.heading['2'].letterSpacing};
      font-weight: 700;
    `,
  },
  'heading-3': {
    defaultAs: 'h3',
    style: (tokens) => css`
      font-family: ${tokens.fonts.display};
      font-size: ${tokens.typography.heading['3'].fontSize};
      line-height: ${tokens.typography.heading['3'].lineHeight};
      letter-spacing: ${tokens.typography.heading['3'].letterSpacing};
      font-weight: 700;
    `,
  },
  'heading-4': {
    defaultAs: 'h4',
    style: (tokens) => css`
      font-family: ${tokens.fonts.display};
      font-size: ${tokens.typography.heading['4'].fontSize};
      line-height: ${tokens.typography.heading['4'].lineHeight};
      letter-spacing: ${tokens.typography.heading['4'].letterSpacing};
      font-weight: 700;
    `,
  },
  'heading-5': {
    defaultAs: 'h5',
    style: (tokens) => css`
      font-family: ${tokens.fonts.display};
      font-size: ${tokens.typography.heading['5'].fontSize};
      line-height: ${tokens.typography.heading['5'].lineHeight};
      letter-spacing: ${tokens.typography.heading['5'].letterSpacing};
      font-weight: 700;
    `,
  },
  'heading-6': {
    defaultAs: 'h6',
    style: (tokens) => css`
      font-family: ${tokens.fonts.display};
      font-size: ${tokens.typography.heading['6'].fontSize};
      line-height: ${tokens.typography.heading['6'].lineHeight};
      letter-spacing: ${tokens.typography.heading['6'].letterSpacing};
      font-weight: 700;
    `,
  },
  'paragraph-lg': {
    defaultAs: 'p',
    style: (tokens) => css`
      font-family: ${tokens.fonts.body};
      font-size: ${tokens.typography.paragraph.lg.fontSize};
      line-height: ${tokens.typography.paragraph.lg.lineHeight};
      font-weight: 400;
    `,
  },
  'paragraph-md': {
    defaultAs: 'p',
    style: (tokens) => css`
      font-family: ${tokens.fonts.body};
      font-size: ${tokens.typography.paragraph.md.fontSize};
      line-height: ${tokens.typography.paragraph.md.lineHeight};
      font-weight: 400;
    `,
  },
  'paragraph-sm': {
    defaultAs: 'p',
    style: (tokens) => css`
      font-family: ${tokens.fonts.body};
      font-size: ${tokens.typography.paragraph.sm.fontSize};
      line-height: ${tokens.typography.paragraph.sm.lineHeight};
      font-weight: 400;
    `,
  },
  'description-lg': {
    defaultAs: 'p',
    style: (tokens) => css`
      font-family: ${tokens.fonts.body};
      font-size: ${tokens.typography.description.lg.fontSize};
      line-height: ${tokens.typography.description.lg.lineHeight};
      font-weight: 500;
    `,
  },
  'description-md': {
    defaultAs: 'p',
    style: (tokens) => css`
      font-family: ${tokens.fonts.body};
      font-size: ${tokens.typography.description.md.fontSize};
      line-height: ${tokens.typography.description.md.lineHeight};
      font-weight: 500;
    `,
  },
  'caption-md': {
    defaultAs: 'span',
    style: (tokens) => css`
      font-family: ${tokens.fonts.body};
      font-size: ${tokens.typography.caption.md.fontSize};
      line-height: ${tokens.typography.caption.md.lineHeight};
      letter-spacing: ${tokens.typography.caption.md.letterSpacing};
      font-weight: 700;
      text-transform: uppercase;
    `,
  },
  'caption-sm': {
    defaultAs: 'span',
    style: (tokens) => css`
      font-family: ${tokens.fonts.body};
      font-size: ${tokens.typography.caption.sm.fontSize};
      line-height: ${tokens.typography.caption.sm.lineHeight};
      letter-spacing: ${tokens.typography.caption.sm.letterSpacing};
      font-weight: 700;
      text-transform: uppercase;
    `,
  },
};

const toneStyles: Record<TypographyTone, (tokens: BrandTokens) => string> = {
  default: (tokens) => tokens.colors.text,
  muted: (tokens) => tokens.colors.textMuted,
  soft: (tokens) => tokens.colors.textSoft,
  accent: (tokens) => tokens.colors.accent,
};

const StyledTypography = styled.span<{
  $tokens: BrandTokens;
  $variant: TypographyVariant;
  $align: TypographyAlign;
  $tone: TypographyTone;
}>`
  margin: 0;
  color: ${({ $tokens, $tone }) => toneStyles[$tone]($tokens)};
  text-align: ${({ $align }) => $align};
  text-wrap: balance;

  ${({ $tokens, $variant }) => variantConfig[$variant].style($tokens)}
`;

export function Typography({
  as,
  variant = 'paragraph-md',
  align = 'left',
  tone = 'default',
  children,
  ...rest
}: TypographyProps) {
  const { tokens } = useDesignSystem();
  const defaultAs = variantConfig[variant].defaultAs;

  return (
    <StyledTypography
      as={as ?? defaultAs}
      $tokens={tokens}
      $variant={variant}
      $align={align}
      $tone={tone}
      {...rest}
    >
      {children}
    </StyledTypography>
  );
}
