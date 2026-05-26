import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  as?: 'input';
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  as: 'select';
};

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  as: 'textarea';
};

type BaseFieldProps = {
  label?: ReactNode;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children?: ReactNode;
};

export type FieldProps = BaseFieldProps & (InputFieldProps | SelectFieldProps | TextareaFieldProps);

const Wrapper = styled.div<{ $tokens: BrandTokens }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $tokens }) => $tokens.spacing.form.helperGap};
`;

const Label = styled.label<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;

  strong {
    color: inherit;
    font-weight: 850;
  }
`;

const RequiredMark = styled.span<{ $tokens: BrandTokens }>`
  color: inherit;
  font-weight: 700;
`;

const ControlWrap = styled.div<{ $tokens: BrandTokens; $invalid: boolean; $disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ $tokens }) => $tokens.spacing.form.controlGap};
  background: ${({ $tokens, $invalid, $disabled }) =>
    $disabled ? $tokens.colors.surfaceSubtle : $invalid ? $tokens.colors.dangerBg : $tokens.colors.surface};
  border: 1px solid
    ${({ $tokens, $invalid, $disabled }) =>
      $disabled ? $tokens.colors.border : $invalid ? $tokens.colors.dangerBorder : $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.md};
  color: ${({ $tokens, $disabled }) => ($disabled ? $tokens.colors.textSoft : $tokens.colors.text)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'text')};
  padding: 0 12px;
  transition:
    border-color ${({ $tokens }) => $tokens.motion.base} ease,
    background ${({ $tokens }) => $tokens.motion.base} ease,
    box-shadow ${({ $tokens }) => $tokens.motion.base} ease;

  &:focus-within {
    border-color: ${({ $tokens, $invalid }) =>
      $invalid ? $tokens.colors.danger : $tokens.colors.accentStrong};
    box-shadow: inset 0 0 0 1px
      ${({ $tokens, $invalid }) =>
        $invalid ? `${$tokens.colors.danger}24` : `${$tokens.colors.accent}24`};
  }
`;

const sharedControlStyles = `
  flex: 1;
  width: 100%;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  font: inherit;
  box-sizing: border-box;

  &::placeholder {
    color: inherit;
    opacity: 0.65;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px transparent inset;
    box-shadow: 0 0 0 1000px transparent inset;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

const InputControl = styled.input<{ $tokens: BrandTokens }>`
  ${sharedControlStyles}
  min-height: 42px;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 14px;

  &:disabled {
    color: ${({ $tokens }) => $tokens.colors.textSoft};
    cursor: not-allowed;
    -webkit-text-fill-color: ${({ $tokens }) => $tokens.colors.textSoft};
  }
`;

const SelectControl = styled.select<{ $tokens: BrandTokens }>`
  ${sharedControlStyles}
  min-height: 42px;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 14px;
  appearance: none;
  cursor: pointer;

  &:disabled {
    color: ${({ $tokens }) => $tokens.colors.textSoft};
    cursor: not-allowed;
    -webkit-text-fill-color: ${({ $tokens }) => $tokens.colors.textSoft};
  }
`;

const TextareaControl = styled.textarea<{ $tokens: BrandTokens }>`
  ${sharedControlStyles}
  min-height: 110px;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  padding: 12px 0;

  &:disabled {
    color: ${({ $tokens }) => $tokens.colors.textSoft};
    cursor: not-allowed;
    resize: none;
    -webkit-text-fill-color: ${({ $tokens }) => $tokens.colors.textSoft};
  }
`;

const Message = styled.span<{ $tokens: BrandTokens; $tone: 'hint' | 'error' }>`
  color: ${({ $tokens, $tone }) =>
    $tone === 'error' ? $tokens.colors.danger : $tokens.colors.textSoft};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 10px;
  line-height: 1.4;
`;

const IconSlot = styled.span<{ $tokens: BrandTokens }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ $tokens }) => $tokens.colors.textSoft};
  flex-shrink: 0;
`;

export const Field = forwardRef<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  FieldProps
>(function Field(
  {
    as = 'input',
    label,
    hint,
    error,
    id,
    leadingIcon,
    trailingIcon,
    children,
    ...rest
  },
  ref,
) {
  const { tokens } = useDesignSystem();
  const autoId = useId();
  const fieldId = id ?? autoId;
  const invalid = Boolean(error);
  const required = Boolean((rest as { required?: boolean }).required);
  const disabled = Boolean((rest as { disabled?: boolean }).disabled);

  return (
    <Wrapper $tokens={tokens}>
      {label ? (
        <Label $tokens={tokens} htmlFor={fieldId}>
          {label}
          {required ? <> <RequiredMark $tokens={tokens}>(*)</RequiredMark></> : null}
        </Label>
      ) : null}
      <ControlWrap $tokens={tokens} $invalid={invalid} $disabled={disabled}>
        {leadingIcon ? <IconSlot $tokens={tokens}>{leadingIcon}</IconSlot> : null}
        {as === 'select' ? (
          <SelectControl
            $tokens={tokens}
            id={fieldId}
            ref={ref as Ref<HTMLSelectElement>}
            aria-invalid={invalid}
            {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {children}
          </SelectControl>
        ) : null}
        {as === 'textarea' ? (
          <TextareaControl
            $tokens={tokens}
            id={fieldId}
            ref={ref as Ref<HTMLTextAreaElement>}
            aria-invalid={invalid}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : null}
        {as === 'input' ? (
          <InputControl
            $tokens={tokens}
            id={fieldId}
            ref={ref as Ref<HTMLInputElement>}
            aria-invalid={invalid}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        ) : null}
        {trailingIcon ? <IconSlot $tokens={tokens}>{trailingIcon}</IconSlot> : null}
      </ControlWrap>
      {error ? <Message $tokens={tokens} $tone="error">{error}</Message> : null}
      {!error && hint ? <Message $tokens={tokens} $tone="hint">{hint}</Message> : null}
    </Wrapper>
  );
});
