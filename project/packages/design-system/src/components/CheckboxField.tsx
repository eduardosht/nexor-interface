import { useId, type ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export type CheckboxFieldProps = {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: ReactNode;
  error?: ReactNode;
  badge?: ReactNode;
  badgeTone?: 'required' | 'optional';
  disabled?: boolean;
  name?: string;
  id?: string;
  onBlur?: () => void;
};

const Wrapper = styled.label<{
  $tokens: BrandTokens;
  $checked: boolean;
  $disabled: boolean;
}>`
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  padding: 16px;
  border: 1px solid ${({ $checked, $tokens }) => ($checked ? '#2563eb' : $tokens.colors.border)};
  border-radius: ${({ $tokens }) => $tokens.radius.md};
  background: ${({ $checked, $tokens }) => ($checked ? '#eff6ff' : $tokens.colors.surface)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.56 : 1)};
  transition:
    background ${({ $tokens }) => $tokens.motion.base} ease,
    border-color ${({ $tokens }) => $tokens.motion.base} ease,
    box-shadow ${({ $tokens }) => $tokens.motion.base} ease;

  &:focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
  }
`;

const NativeInput = styled.input`
  position: absolute;
  top: 16px;
  left: 16px;
  width: 22px;
  height: 22px;
  margin: 0;
  padding: 0;
  border: 0;
  opacity: 0;
  cursor: inherit;
`;

const CheckMark = styled.span<{ $checked: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 2px solid ${({ $checked }) => ($checked ? '#2563eb' : '#8a94a6')};
  border-radius: 6px;
  background: ${({ $checked }) => ($checked ? '#2563eb' : '#ffffff')};
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
  flex: 0 0 auto;

  &::after {
    content: '✓';
    opacity: ${({ $checked }) => ($checked ? 1 : 0)};
  }
`;

const TextStack = styled.span`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

const LabelRow = styled.span`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LabelText = styled.span<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;

  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

const Badge = styled.span<{ $tokens: BrandTokens; $tone: 'required' | 'optional' }>`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 3px 8px;
  border: 1px solid ${({ $tone }) => ($tone === 'required' ? '#2563eb' : '#86efac')};
  border-radius: ${({ $tokens }) => $tokens.radius.md};
  background: ${({ $tone }) => ($tone === 'required' ? '#dbeafe' : '#f0fdf4')};
  color: ${({ $tone }) => ($tone === 'required' ? '#1d4ed8' : '#15803d')};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
`;

const Description = styled.span<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  line-height: 1.45;
`;

const ErrorText = styled.span<{ $tokens: BrandTokens }>`
  grid-column: 1 / -1;
  color: ${({ $tokens }) => $tokens.colors.danger};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  line-height: 1.4;
`;

export function CheckboxField({
  label,
  checked,
  onChange,
  description,
  error,
  badge,
  badgeTone = 'optional',
  disabled = false,
  name,
  id,
  onBlur,
}: CheckboxFieldProps) {
  const { tokens } = useDesignSystem();
  const autoId = useId();
  const inputId = id ?? autoId;
  const ariaLabel = typeof label === 'string' ? label : undefined;

  return (
    <Wrapper
      $tokens={tokens}
      $checked={checked}
      $disabled={disabled}
      htmlFor={inputId}
      data-testid="checkbox-field-card"
      onBlur={onBlur}
    >
      <NativeInput
        id={inputId}
        type="checkbox"
        name={name}
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.checked)}
      />
      <CheckMark $checked={checked} aria-hidden="true" />
      <TextStack>
        <LabelRow>
          <LabelText $tokens={tokens}>{label}</LabelText>
          {badge ? <Badge $tokens={tokens} $tone={badgeTone}>{badge}</Badge> : null}
        </LabelRow>
        {description ? <Description $tokens={tokens}>{description}</Description> : null}
        {error ? <ErrorText $tokens={tokens} role="alert">{error}</ErrorText> : null}
      </TextStack>
    </Wrapper>
  );
}
