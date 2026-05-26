import { useEffect, useId, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  onBlur?: () => void;
}

const Wrapper = styled.div<{ $tokens: BrandTokens }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ $tokens }) => $tokens.spacing.form.helperGap};
  min-width: 0;
`;

const Label = styled.label<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
`;

const RequiredMark = styled.span<{ $tokens: BrandTokens }>`
  color: inherit;
  font-weight: 700;
`;

const ControlShell = styled.div`
  position: relative;
  min-width: 0;
`;

const Trigger = styled.button<{ $tokens: BrandTokens; $invalid: boolean; $open: boolean }>`
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  border-radius: ${({ $tokens }) => $tokens.radius.md};
  border: 1px solid
    ${({ $tokens, $invalid, $open }) =>
      $invalid
        ? $tokens.colors.dangerBorder
        : $open
          ? $tokens.colors.accentStrong
          : $tokens.colors.border};
  background: ${({ $tokens, $invalid }) =>
    $invalid ? $tokens.colors.dangerBg : $tokens.colors.surface};
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  outline: none;
  box-shadow: ${({ $tokens, $invalid, $open }) =>
    $open
      ? `inset 0 0 0 1px ${$invalid ? `${$tokens.colors.danger}28` : `${$tokens.colors.accent}28`}`
      : 'none'};
  transition:
    border-color ${({ $tokens }) => $tokens.motion.base} ease,
    box-shadow ${({ $tokens }) => $tokens.motion.base} ease,
    background ${({ $tokens }) => $tokens.motion.base} ease;

  &:hover:not(:disabled) {
    border-color: ${({ $tokens, $invalid }) =>
      $invalid ? $tokens.colors.danger : $tokens.colors.accent};
    background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
  }

  &:focus-visible {
    border-color: ${({ $tokens, $invalid }) =>
      $invalid ? $tokens.colors.danger : $tokens.colors.accentStrong};
    box-shadow: inset 0 0 0 1px
      ${({ $tokens, $invalid }) =>
        $invalid ? `${$tokens.colors.danger}28` : `${$tokens.colors.accent}28`};
  }

  &:disabled {
    cursor: not-allowed;
    border-color: ${({ $tokens }) => $tokens.colors.border};
    background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
    color: ${({ $tokens }) => $tokens.colors.textSoft};
    opacity: 1;
  }
`;

const TriggerText = styled.span<{ $tokens: BrandTokens; $placeholder: boolean; $disabled: boolean }>`
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ $tokens, $placeholder, $disabled }) =>
    $disabled ? $tokens.colors.textSoft : $placeholder ? $tokens.colors.textMuted : $tokens.colors.text};
`;

const ChevronWrap = styled.span<{ $open: boolean; $tokens: BrandTokens }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ $tokens }) => $tokens.colors.textSoft};
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  transition: transform 150ms ease;
  flex-shrink: 0;
`;

const Dropdown = styled.div<{ $tokens: BrandTokens }>`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 220;
  width: 100%;
  min-width: 0;
  background: ${({ $tokens }) => $tokens.colors.surface};
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.lg};
  box-shadow: ${({ $tokens }) => $tokens.shadow.md};
  overflow: hidden;
`;

const OptionsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 6px;
  max-height: 280px;
  overflow-y: auto;
`;

const OptionButton = styled.button<{ $tokens: BrandTokens; $selected: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px 11px;
  border: none;
  border-radius: ${({ $tokens }) => $tokens.radius.md};
  background: ${({ $tokens, $selected }) =>
    $selected ? $tokens.colors.accentSoft : 'transparent'};
  color: ${({ $tokens, $selected }) =>
    $selected ? $tokens.colors.accentStrong : $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition:
    background ${({ $tokens }) => $tokens.motion.base} ease,
    color ${({ $tokens }) => $tokens.motion.base} ease;

  &:hover:not(:disabled) {
    background: ${({ $tokens, $selected }) =>
      $selected ? $tokens.colors.accentSoft : $tokens.colors.surfaceSubtle};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

const OptionText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const OptionLabel = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OptionDescription = styled.span<{ $tokens: BrandTokens }>`
  font-size: 11px;
  color: ${({ $tokens }) => $tokens.colors.textSoft};
  line-height: 1.4;
`;

const CheckWrap = styled.span<{ $tokens: BrandTokens; $visible: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: ${({ $tokens, $visible }) =>
    $visible ? $tokens.colors.accent : 'transparent'};
  color: ${({ $visible }) => ($visible ? '#ffffff' : 'transparent')};
  flex-shrink: 0;
`;

const Message = styled.span<{ $tokens: BrandTokens; $tone: 'hint' | 'error' }>`
  color: ${({ $tokens, $tone }) =>
    $tone === 'error' ? $tokens.colors.danger : $tokens.colors.textSoft};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 10px;
  line-height: 1.4;
`;

export function Select({
  options,
  value,
  onChange,
  label,
  hint,
  error,
  placeholder = 'Selecione...',
  id,
  disabled = false,
  required = false,
  onBlur,
}: SelectProps) {
  const { tokens } = useDesignSystem();
  const autoId = useId();
  const fieldId = id ?? autoId;
  const listboxId = `${fieldId}-listbox`;
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const invalid = Boolean(error);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <Wrapper $tokens={tokens} ref={wrapperRef}>
      {label ? (
        <Label $tokens={tokens} htmlFor={fieldId}>
          {label}
          {required ? <> <RequiredMark $tokens={tokens}>(*)</RequiredMark></> : null}
        </Label>
      ) : null}
      <ControlShell>
        <Trigger
          id={fieldId}
          type="button"
          $tokens={tokens}
          $invalid={invalid}
          $open={open}
          onClick={() => { if (!disabled) setOpen((previous) => !previous); }}
          onBlur={onBlur}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          disabled={disabled}
        >
          <TriggerText $tokens={tokens} $placeholder={!selectedOption} $disabled={disabled}>
            {selectedOption?.label ?? placeholder}
          </TriggerText>
          <ChevronWrap $open={open} $tokens={tokens}>
            <ChevronDownIcon />
          </ChevronWrap>
        </Trigger>

        {open ? (
          <Dropdown $tokens={tokens}>
            <OptionsList id={listboxId} role="listbox" aria-label={label ?? placeholder}>
              {options.map((option) => {
                const selected = option.value === value;

                return (
                  <li key={option.value} role="presentation">
                    <OptionButton
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={option.disabled}
                      $tokens={tokens}
                      $selected={selected}
                      onClick={() => {
                        if (option.disabled) {
                          return;
                        }

                        onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <OptionText>
                        <OptionLabel>{option.label}</OptionLabel>
                        {option.description ? (
                          <OptionDescription $tokens={tokens}>
                            {option.description}
                          </OptionDescription>
                        ) : null}
                      </OptionText>
                      <CheckWrap $tokens={tokens} $visible={selected}>
                        <CheckIcon />
                      </CheckWrap>
                    </OptionButton>
                  </li>
                );
              })}
            </OptionsList>
          </Dropdown>
        ) : null}
      </ControlShell>

      {error ? <Message $tokens={tokens} $tone="error">{error}</Message> : null}
      {!error && hint ? <Message $tokens={tokens} $tone="hint">{hint}</Message> : null}
    </Wrapper>
  );
}
