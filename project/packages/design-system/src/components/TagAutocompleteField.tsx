import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export interface TagAutocompleteOption {
  value: string;
  label: string;
}

export interface TagAutocompleteFieldProps {
  label: string;
  value: string[];
  options: TagAutocompleteOption[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  allowCustomValue?: boolean;
}

const Wrapper = styled.div`
  position: relative;
  display: grid;
  gap: 6px;
`;

const Label = styled.label<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 14px;
  font-weight: 600;
`;

const RequiredMark = styled.span<{ $tokens: BrandTokens }>`
  color: inherit;
`;

const Control = styled.div<{ $tokens: BrandTokens; $invalid: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid
    ${({ $tokens, $invalid }) =>
      $invalid ? $tokens.colors.dangerBorder : $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.md};
  background: ${({ $tokens, $invalid }) =>
    $invalid ? $tokens.colors.dangerBg : $tokens.colors.surface};
  transition:
    border-color ${({ $tokens }) => $tokens.motion.base} ease,
    box-shadow ${({ $tokens }) => $tokens.motion.base} ease;

  &:focus-within {
    border-color: ${({ $tokens, $invalid }) =>
      $invalid ? $tokens.colors.danger : $tokens.colors.accentStrong};
    box-shadow: 0 0 0 3px
      ${({ $tokens, $invalid }) =>
        $invalid ? `${$tokens.colors.danger}18` : `${$tokens.colors.accent}18`};
  }
`;

const Tag = styled.span<{ $tokens: BrandTokens }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0 6px 0 10px;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.sm};
  background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 13px;
  font-weight: 600;
`;

const RemoveButton = styled.button<{ $tokens: BrandTokens }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: ${({ $tokens }) => $tokens.radius.sm};
  background: transparent;
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  cursor: pointer;

  &:hover {
    background: ${({ $tokens }) => $tokens.colors.surface};
    color: ${({ $tokens }) => $tokens.colors.text};
  }
`;

const Input = styled.input<{ $tokens: BrandTokens }>`
  flex: 1 1 160px;
  min-width: 120px;
  height: 30px;
  border: 0;
  outline: 0;
  background: transparent;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 14px;

  &::placeholder {
    color: ${({ $tokens }) => $tokens.colors.textMuted};
  }
`;

const OptionsList = styled.ul<{ $tokens: BrandTokens }>`
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 240px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  list-style: none;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.md};
  background: ${({ $tokens }) => $tokens.colors.surface};
  box-shadow: ${({ $tokens }) => $tokens.shadow.md};
`;

const OptionItem = styled.li<{ $tokens: BrandTokens }>`
  padding: 9px 10px;
  border-radius: ${({ $tokens }) => $tokens.radius.sm};
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
  }
`;

const Message = styled.span<{ $tokens: BrandTokens; $tone: 'hint' | 'error' }>`
  color: ${({ $tokens, $tone }) =>
    $tone === 'error' ? $tokens.colors.danger : $tokens.colors.textSoft};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  line-height: 1.4;
`;

function RemoveIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function TagAutocompleteField({
  label,
  value,
  options,
  onChange,
  onBlur,
  placeholder = 'Buscar...',
  hint,
  error,
  required,
  allowCustomValue = false,
}: TagAutocompleteFieldProps) {
  const { tokens } = useDesignSystem();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextBlurRef = useRef(false);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const invalid = Boolean(error);
  const selected = new Set(value);
  const normalizedSearch = normalize(search);

  const matchingOptions = useMemo(
    () =>
      options.filter(
        (option) =>
          !selected.has(option.value) &&
          (!normalizedSearch || normalize(option.label).includes(normalizedSearch)),
      ),
    [normalizedSearch, options, selected],
  );

  function addOption(option: TagAutocompleteOption) {
    if (selected.has(option.value)) {
      return;
    }

    setSearch('');
    setOpen(false);
    inputRef.current?.blur();
    onChange([...value, option.value]);
  }

  function addCustomValue() {
    const customLabel = search.trim().replace(/\s+/g, ' ');

    if (!allowCustomValue || !customLabel) {
      return false;
    }

    const normalizedCustomLabel = normalize(customLabel);
    const alreadySelected = value.some((item) => {
      const option = options.find((candidate) => candidate.value === item);
      return normalize(option?.label ?? item) === normalizedCustomLabel;
    });

    if (alreadySelected) {
      setSearch('');
      setOpen(false);
      return true;
    }

    setSearch('');
    setOpen(false);
    onChange([...value, customLabel]);
    return true;
  }

  function removeOption(nextValue: string) {
    onChange(value.filter((item) => item !== nextValue));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return;
    }

    if (allowCustomValue && search.trim()) {
      event.preventDefault();
      skipNextBlurRef.current = true;
      inputRef.current?.blur();
      skipNextBlurRef.current = false;
      addCustomValue();
      return;
    }

    const firstOption = matchingOptions[0];
    if (!firstOption) {
      return;
    }

    event.preventDefault();
    addOption(firstOption);
  }

  return (
    <Wrapper>
      <Label $tokens={tokens} htmlFor={id}>
        {label}
        {required ? <> <RequiredMark $tokens={tokens}>(*)</RequiredMark></> : null}
      </Label>
      <Control $tokens={tokens} $invalid={invalid}>
        {value.map((item) => {
          const option = options.find((candidate) => candidate.value === item);
          const tagLabel = option?.label ?? item;

          return (
            <Tag $tokens={tokens} key={item}>
              {tagLabel}
              <RemoveButton
                $tokens={tokens}
                type="button"
                aria-label={`Remover ${tagLabel}`}
                onClick={() => {
                  removeOption(item);
                }}
              >
                <RemoveIcon />
              </RemoveButton>
            </Tag>
          );
        })}
        <Input
          $tokens={tokens}
          ref={inputRef}
          id={id}
          name={`${id}-search`}
          value={search}
          placeholder={value.length === 0 ? placeholder : 'Adicionar mais...'}
          autoComplete="off"
          aria-invalid={invalid}
          aria-autocomplete="list"
          aria-expanded={open}
          onFocus={() => {
            setOpen(true);
          }}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            if (skipNextBlurRef.current) {
              return;
            }

            const customValueAdded = addCustomValue();

            if (!customValueAdded) {
              setOpen(false);
              onBlur?.();
            }
          }}
          onKeyDown={handleKeyDown}
        />
      </Control>
      {open && matchingOptions.length > 0 ? (
        <OptionsList $tokens={tokens} role="listbox" aria-label="Sugestoes">
          {matchingOptions.map((option) => (
            <OptionItem
              $tokens={tokens}
              key={option.value}
              role="option"
              aria-selected={false}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={() => {
                addOption(option);
              }}
            >
              {option.label}
            </OptionItem>
          ))}
        </OptionsList>
      ) : null}
      {error ? <Message $tokens={tokens} $tone="error">{error}</Message> : null}
      {!error && hint ? <Message $tokens={tokens} $tone="hint">{hint}</Message> : null}
    </Wrapper>
  );
}
