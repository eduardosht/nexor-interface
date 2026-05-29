import { useId, type ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export type RadioQuestionVariant = 'inline' | 'cards';
export type RadioQuestionColumns = 1 | 2 | 3;

export type RadioQuestionOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

export type RadioQuestionGroupProps = {
  name: string;
  label: ReactNode;
  value: string;
  options: RadioQuestionOption[];
  onChange: (value: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  variant?: RadioQuestionVariant;
  columns?: RadioQuestionColumns;
  inline?: boolean;
  onBlur?: () => void;
};

const Wrapper = styled.fieldset<{ $tokens: BrandTokens; $variant: RadioQuestionVariant; $inline: boolean }>`
  display: grid;
  grid-template-columns: ${({ $variant, $inline }) =>
    $variant === 'inline' || $inline ? 'minmax(0, 1fr) auto' : '1fr'};
  align-items: center;
  gap: ${({ $tokens }) => $tokens.spacing.form.labelGap};
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Legend = styled.legend<{ $tokens: BrandTokens }>`
  margin: 0;
  padding: 0;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
`;

const RequiredMark = styled.span<{ $tokens: BrandTokens }>`
  color: inherit;
`;

const Hint = styled.p<{ $tokens: BrandTokens }>`
  grid-column: 1 / -1;
  margin: -2px 0 0;
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 13px;
  line-height: 1.45;
`;

const ErrorText = styled.span<{ $tokens: BrandTokens; $inline: boolean; $variant: RadioQuestionVariant }>`
  grid-column-start: 1;
  grid-column-end: ${({ $inline, $variant }) => ($inline || $variant === 'inline' ? '2' : '-1')};
  color: ${({ $tokens }) => $tokens.colors.danger};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  line-height: 1.4;

  @media (max-width: 640px) {
    grid-column-start: 1;
    grid-column-end: -1;
  }
`;

const Options = styled.div<{
  $tokens: BrandTokens;
  $variant: RadioQuestionVariant;
  $columns: RadioQuestionColumns;
  $inline: boolean;
}>`
  display: ${({ $inline }) => ($inline ? 'flex' : 'grid')};
  flex-wrap: ${({ $inline }) => ($inline ? 'wrap' : undefined)};
  justify-content: ${({ $inline }) => ($inline ? 'flex-end' : undefined)};
  gap: ${({ $tokens }) => $tokens.spacing['8']};

  ${({ $variant, $columns, $inline }) =>
    $inline
      ? css`
          > label {
            min-width: 104px;
          }
        `
      : $variant === 'cards'
      ? css`
          grid-template-columns: repeat(${$columns}, minmax(0, 1fr));
        `
      : css`
          grid-template-columns: repeat(${$columns}, minmax(104px, 1fr));
          justify-content: end;
        `}

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const OptionLabel = styled.label<{
  $tokens: BrandTokens;
  $variant: RadioQuestionVariant;
  $selected: boolean;
  $disabled: boolean;
}>`
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: ${({ $tokens }) => $tokens.spacing['8']};
  min-height: ${({ $variant }) => ($variant === 'cards' ? '76px' : '44px')};
  padding: ${({ $variant }) => ($variant === 'cards' ? '16px 18px' : '10px 16px')};
  border: 1px solid
    ${({ $tokens, $selected }) => ($selected ? '#2563eb' : $tokens.colors.border)};
  border-radius: ${({ $tokens }) => $tokens.radius.md};
  background: ${({ $selected, $tokens }) => ($selected ? '#eff6ff' : $tokens.colors.surface)};
  color: ${({ $tokens }) => $tokens.colors.text};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.52 : 1)};
  transition:
    background ${({ $tokens }) => $tokens.motion.base} ease,
    border-color ${({ $tokens }) => $tokens.motion.base} ease,
    box-shadow ${({ $tokens }) => $tokens.motion.base} ease;

  &:hover {
    border-color: ${({ $disabled }) => ($disabled ? undefined : '#2563eb')};
  }

  &:focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
  }
`;

const NativeInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
`;

const RadioMark = styled.span<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 2px solid ${({ $selected }) => ($selected ? '#2563eb' : '#8a94a6')};
  border-radius: 50%;
  background: #ffffff;

  &::after {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2563eb;
    content: '';
    opacity: ${({ $selected }) => ($selected ? 1 : 0)};
  }
`;

const OptionContent = styled.span`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const IconSlot = styled.span<{ $tokens: BrandTokens }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: ${({ $tokens }) => $tokens.radius.lg};
  background: ${({ $tokens }) => $tokens.colors.accentSoft};
  color: #2563eb;
  flex: 0 0 auto;
`;

const TextStack = styled.span`
  display: grid;
  gap: 2px;
  min-width: 0;
`;

const OptionTitle = styled.span<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
`;

const OptionDescription = styled.span<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  line-height: 1.35;
`;

export function RadioQuestionGroup({
  name,
  label,
  value,
  options,
  onChange,
  hint,
  error,
  required = false,
  variant = 'inline',
  columns,
  inline = false,
  onBlur,
}: RadioQuestionGroupProps) {
  const { tokens } = useDesignSystem();
  const autoName = useId();
  const groupName = name || autoName;
  const resolvedColumns =
    columns ?? (variant === 'cards' ? 2 : (Math.min(options.length, 3) as RadioQuestionColumns));

  return (
    <Wrapper $tokens={tokens} $variant={variant} $inline={inline} onBlur={onBlur}>
      <Legend $tokens={tokens}>
        {label} {required ? <RequiredMark $tokens={tokens}>(*)</RequiredMark> : null}
      </Legend>
      {hint ? <Hint $tokens={tokens}>{hint}</Hint> : null}
      <Options
        $tokens={tokens}
        $variant={variant}
        $columns={resolvedColumns}
        $inline={inline}
        data-testid={`radio-question-options-${groupName}`}
      >
        {options.map((option) => {
          const selected = option.value === value;
          const optionId = `${groupName}-${option.value}`;

          return (
            <OptionLabel
              key={option.value}
              $tokens={tokens}
              $variant={variant}
              $selected={selected}
              $disabled={Boolean(option.disabled)}
              htmlFor={optionId}
            >
              <NativeInput
                id={optionId}
                type="radio"
                name={groupName}
                value={option.value}
                aria-label={typeof option.label === 'string' ? option.label : undefined}
                checked={selected}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
              />
              <RadioMark $selected={selected} aria-hidden="true" />
              <OptionContent>
                {option.icon ? <IconSlot $tokens={tokens}>{option.icon}</IconSlot> : null}
                <TextStack>
                  <OptionTitle $tokens={tokens}>{option.label}</OptionTitle>
                  {option.description ? (
                    <OptionDescription $tokens={tokens}>{option.description}</OptionDescription>
                  ) : null}
                </TextStack>
              </OptionContent>
            </OptionLabel>
          );
        })}
      </Options>
      {error ? (
        <ErrorText $tokens={tokens} $inline={inline} $variant={variant} role="alert">
          {error}
        </ErrorText>
      ) : null}
    </Wrapper>
  );
}
