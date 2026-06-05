import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonTone = 'default' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children?: ReactNode;
};

const sizeStyles: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`
    min-height: 40px;
    padding: 9px 16px;
    font-size: 13px;
  `,
  md: css`
    min-height: 46px;
    padding: 12px 20px;
    font-size: 14px;
  `,
  lg: css`
    min-height: 52px;
    padding: 14px 24px;
    font-size: 14px;
  `,
};

function variantStyles(tokens: BrandTokens, variant: ButtonVariant, tone: ButtonTone) {
  if (variant === 'primary') {
    if (tone === 'inverse') {
      return css`
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(8px);

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.4);
        }
      `;
    }

    if (tokens.name === 'biteplaner') {
      return css`
        background: #5b9b74;
        color: ${tokens.colors.accentContrast};
        border: 1px solid #5b9b74;

        &:hover:not(:disabled) {
          background: ${tokens.colors.accent};
          border-color: ${tokens.colors.accent};
          box-shadow: ${tokens.shadow.md};
        }

        &:active:not(:disabled) {
          background: ${tokens.colors.accentStrong};
          border-color: ${tokens.colors.accentStrong};
          box-shadow: ${tokens.shadow.sm};
        }

        &:disabled {
          background: ${tokens.colors.surfaceStrong};
          border-color: ${tokens.colors.surfaceStrong};
          color: ${tokens.colors.textSoft};
        }
      `;
    }

    return css`
      background: ${tokens.colors.text};
      color: ${tokens.colors.accentContrast};
      border: 1px solid ${tokens.colors.text};

      &:hover:not(:disabled) {
        opacity: 0.88;
        box-shadow: ${tokens.shadow.sm};
      }

      &:disabled {
        background: ${tokens.colors.surfaceStrong};
        border-color: ${tokens.colors.surfaceStrong};
        color: ${tokens.colors.textSoft};
      }
    `;
  }

  if (variant === 'secondary') {
    if (tone === 'inverse') {
      return css`
        background: transparent;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.28);

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.44);
      }

      &:disabled {
        color: rgba(255, 255, 255, 0.42);
        border-color: rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.04);
      }
    `;
  }

    return css`
      background: ${tokens.colors.accentSoft};
      color: ${tokens.colors.accent};
      border: 1px solid ${tokens.colors.borderStrong};

      &:hover:not(:disabled) {
        border-color: ${tokens.colors.accent};
        background: ${tokens.colors.accentSoft};
        color: ${tokens.colors.accentStrong};
        box-shadow: ${tokens.shadow.sm};
      }

      &:active:not(:disabled) {
        background: ${tokens.colors.accent};
        border-color: ${tokens.colors.accent};
        color: ${tokens.colors.accentContrast};
      }

      &:disabled {
        background: ${tokens.colors.surfaceSubtle};
        border-color: ${tokens.colors.border};
        color: ${tokens.colors.textSoft};
      }
    `;
  }

  if (tone === 'inverse') {
    return css`
      background: transparent;
      color: rgba(255, 255, 255, 0.72);
      border: 1px solid transparent;

      &:hover:not(:disabled) {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.12);
      }
    `;
  }

  return css`
    background: transparent;
    color: ${tokens.colors.textMuted};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      color: ${tokens.colors.text};
      background: ${tokens.colors.accentSoft};
    }

    &:active:not(:disabled) {
      color: ${tokens.colors.accentStrong};
      background: ${tokens.colors.surfaceStrong};
    }

    &:disabled {
      color: ${tokens.colors.textSoft};
      background: transparent;
    }
  `;
}

const StyledButton = styled.button<{
  $tokens: BrandTokens;
  $variant: ButtonVariant;
  $tone: ButtonTone;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  max-width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'none')};
  min-width: ${({ $fullWidth }) => ($fullWidth ? '0' : 'max-content')};
  border-radius: ${({ $tokens }) => $tokens.radius.sm};
  font-family: ${({ $tokens }) => $tokens.fonts.display};
  font-weight: 400;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  overflow-wrap: normal;
  cursor: pointer;
  transition:
    background ${({ $tokens }) => $tokens.motion.base} ease,
    color ${({ $tokens }) => $tokens.motion.base} ease,
    border-color ${({ $tokens }) => $tokens.motion.base} ease,
    filter ${({ $tokens }) => $tokens.motion.base} ease,
    transform ${({ $tokens }) => $tokens.motion.fast} ease,
    box-shadow ${({ $tokens }) => $tokens.motion.base} ease;

  &:focus-visible {
    outline: 2px solid ${({ $tokens }) => $tokens.colors.accent};
    outline-offset: 2px;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.56;
    filter: saturate(0.72);
    transform: none;
  }

  ${({ $size }) => sizeStyles[$size]}
  ${({ $tokens, $variant, $tone }) => variantStyles($tokens, $variant, $tone)}
`;

const Content = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: none;
  min-width: 0;
  line-height: inherit;
  overflow-wrap: normal;
  white-space: inherit;
  text-wrap: nowrap;

  svg {
    flex: 0 0 auto;
  }
`;

export function Button({
  variant = 'primary',
  tone = 'default',
  size = 'md',
  type = 'button',
  fullWidth = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const { tokens } = useDesignSystem();

  return (
    <StyledButton
      $tokens={tokens}
      $variant={variant}
      $tone={tone}
      $size={size}
      $fullWidth={fullWidth}
      data-variant={variant}
      type={type}
      disabled={disabled || loading}
      {...rest}
    >
      <Content>
        {leadingIcon}
        {loading ? 'Carregando...' : children}
        {trailingIcon}
      </Content>
    </StyledButton>
  );
}
