import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Button, type ButtonProps } from './Button';

export type AdminFormButtonVariant = 'primary' | 'secondary';

export type AdminFormButtonProps = Omit<ButtonProps, 'size' | 'variant'> & {
  variant?: AdminFormButtonVariant;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
};

const ButtonRoot = styled(Button)`
  flex: 0 1 auto;
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  min-height: 52px;
  padding: 10px 18px;
  border-radius: 8px;
  border-color: #15803d;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  white-space: normal;
  overflow-wrap: break-word;

  &[data-variant='primary'] {
    background: #15803d;
    color: #f8fbff;
  }

  &[data-variant='secondary'] {
    background: transparent;
    color: #15803d;
  }

  &[data-variant='primary']:not(:disabled):hover {
    border-color: #166534;
    background: #166534;
    color: #f8fbff;
    box-shadow: none;
  }

  &[data-variant='secondary']:not(:disabled):hover {
    border-color: #166534;
    background: rgba(21, 128, 61, 0.08);
    color: #166534;
    box-shadow: 0 10px 22px rgba(21, 128, 61, 0.12);
  }

  &[data-variant='primary']:not(:disabled):active {
    background: #14532d;
    border-color: #14532d;
    color: #f8fbff;
    box-shadow: none;
  }

  &[data-variant='secondary']:not(:disabled):active {
    background: rgba(21, 128, 61, 0.14);
    border-color: #14532d;
    color: #14532d;
    box-shadow: none;
  }

  &:focus-visible {
    outline: 2px solid rgba(21, 128, 61, 0.36);
    outline-offset: 2px;
  }

  &:disabled {
    border-color: #d7deea;
    background: #f8fafc;
    color: #6b7280;
    box-shadow: none;
    opacity: 1;
    filter: none;
  }

  @media (max-width: 760px) {
    min-height: 38px;
    padding: 8px 12px;
    font-size: 12px;
  }

  [data-button-content] {
    flex: 0 1 100%;
    flex-wrap: wrap;
    white-space: normal;
    overflow-wrap: break-word;
  }

  [data-button-label] {
    white-space: normal;
    overflow-wrap: break-word;
  }
`;

export function AdminFormButton({
  variant = 'primary',
  type = 'button',
  leadingIcon,
  trailingIcon,
  loading = false,
  disabled,
  children,
  ...rest
}: AdminFormButtonProps) {
  return (
    <ButtonRoot
      variant={variant}
      size="lg"
      type={type}
      disabled={disabled || loading}
      loading={loading}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      {...rest}
    >
      {children}
    </ButtonRoot>
  );
}
