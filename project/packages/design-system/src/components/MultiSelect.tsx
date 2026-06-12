import { useRef, useState, useEffect } from 'react';
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

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
}

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const LabelEl = styled.label<{ $tokens: BrandTokens }>`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ $tokens }) => $tokens.colors.text};
  margin-bottom: 6px;
  font-family: ${({ $tokens }) => $tokens.fonts.body};
`;

const Trigger = styled.div<{ $tokens: BrandTokens; $open: boolean }>`
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.md};
  padding: 6px 32px 6px 10px;
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  background: ${({ $tokens }) => $tokens.colors.surface};
  cursor: pointer;
  position: relative;
  user-select: none;
  font-family: ${({ $tokens }) => $tokens.fonts.body};
`;

const ChevronIcon = styled.span<{ $open: boolean }>`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%) rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  transition: transform 150ms ease;
  display: flex;
  align-items: center;
  color: inherit;
  pointer-events: none;
`;

const SelectionChip = styled.span<{ $tokens: BrandTokens }>`
  background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.sm};
  padding: 2px 4px 2px 6px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
`;

const SelectionChipLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RemoveSelectionButton = styled.button<{ $tokens: BrandTokens }>`
  width: 16px;
  height: 16px;
  border: none;
  border-radius: ${({ $tokens }) => $tokens.radius.sm};
  background: transparent;
  color: ${({ $tokens }) => $tokens.colors.textSoft};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: ${({ $tokens }) => $tokens.colors.surface};
    color: ${({ $tokens }) => $tokens.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ $tokens }) => $tokens.colors.text};
    outline-offset: 1px;
  }
`;

const Placeholder = styled.span<{ $tokens: BrandTokens }>`
  font-size: 13px;
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
`;

const Dropdown = styled.div<{ $tokens: BrandTokens }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 200;
  min-width: 100%;
  max-height: 280px;
  display: flex;
  flex-direction: column;
  background: ${({ $tokens }) => $tokens.colors.surface};
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.md};
  box-shadow: ${({ $tokens }) => $tokens.shadow.md};
  overflow: hidden;
`;

const SearchWrap = styled.div<{ $tokens: BrandTokens }>`
  position: relative;
  border-bottom: 1px solid ${({ $tokens }) => $tokens.colors.border};
  flex-shrink: 0;
`;

const SearchIconWrap = styled.span`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  opacity: 0.5;
`;

const SearchInput = styled.input<{ $tokens: BrandTokens }>`
  width: 100%;
  border: none;
  outline: none;
  padding: 8px 10px 8px 32px;
  font-size: 13px;
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  background: transparent;
  color: ${({ $tokens }) => $tokens.colors.text};
  box-sizing: border-box;

  &::placeholder {
    color: ${({ $tokens }) => $tokens.colors.textMuted};
  }
`;

const OptionsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 4px 0;
  overflow-y: auto;
  flex: 1;
`;

const OptionItem = styled.li<{ $tokens: BrandTokens; $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  color: ${({ $tokens }) => $tokens.colors.text};
  cursor: pointer;
  background: ${({ $selected, $tokens }) => ($selected ? $tokens.colors.surfaceSubtle : 'transparent')};

  &:hover {
    background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
  }
`;

const Checkbox = styled.span<{ $tokens: BrandTokens; $checked: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1.5px solid ${({ $tokens, $checked }) => ($checked ? $tokens.colors.text : $tokens.colors.border)};
  background: ${({ $tokens, $checked }) => ($checked ? $tokens.colors.text : $tokens.colors.surface)};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 120ms ease, border-color 120ms ease;

  &::after {
    content: '';
    display: ${({ $checked }) => ($checked ? 'block' : 'none')};
    width: 4px;
    height: 7px;
    border: 2px solid #ffffff;
    border-top: none;
    border-left: none;
    transform: rotate(45deg) translate(-1px, -1px);
  }
`;

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecionar...',
  searchPlaceholder = 'Buscar...',
  label,
}: MultiSelectProps) {
  const { tokens } = useDesignSystem();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => { document.removeEventListener('mousedown', handleMouseDown); };
  }, []);

  function toggle(optValue: string) {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  }

  const searchActive = search.trim().length > 0;
  const matchingOptions = searchActive
    ? options.filter((o) => o.label.toLowerCase().includes(search.trim().toLowerCase()))
    : options;

  const selectedMatching = matchingOptions.filter((o) => value.includes(o.value));
  const unselectedMatching = matchingOptions.filter((o) => !value.includes(o.value));
  const showDivider = selectedMatching.length > 0 && unselectedMatching.length > 0;

  const selectedOptions = value
    .map((selectedValue) => options.find((option) => option.value === selectedValue))
    .filter((option): option is MultiSelectOption => Boolean(option));

  function removeSelected(optValue: string) {
    onChange(value.filter((v) => v !== optValue));
  }

  return (
    <Wrapper ref={wrapperRef}>
      {label && <LabelEl $tokens={tokens}>{label}</LabelEl>}
      <Trigger
        $tokens={tokens}
        $open={open}
        onClick={() => { setOpen((prev) => !prev); }}
        role="button"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {value.length === 0 ? (
          <Placeholder $tokens={tokens}>{placeholder}</Placeholder>
        ) : (
          <>
            {selectedOptions.map((opt) => (
              <SelectionChip key={opt.value} $tokens={tokens}>
                <SelectionChipLabel>{opt.label}</SelectionChipLabel>
                <RemoveSelectionButton
                  $tokens={tokens}
                  type="button"
                  aria-label={`Remover ${opt.label}`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    removeSelected(opt.value);
                  }}
                >
                  <RemoveIcon />
                </RemoveSelectionButton>
              </SelectionChip>
            ))}
          </>
        )}
        <ChevronIcon $open={open}>
          <ChevronDownIcon />
        </ChevronIcon>
      </Trigger>

      {open && (
        <Dropdown $tokens={tokens}>
          <SearchWrap $tokens={tokens}>
            <SearchIconWrap>
              <SearchIcon />
            </SearchIconWrap>
            <SearchInput
              $tokens={tokens}
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              placeholder={searchPlaceholder}
              aria-label="Buscar opções"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          </SearchWrap>
          <OptionsList
            role="listbox"
            aria-multiselectable="true"
            aria-label={label ?? placeholder}
          >
            {matchingOptions.length === 0 ? (
              <OptionItem $tokens={tokens} $selected={false} style={{ cursor: 'default', opacity: 0.6 }}>
                Nenhuma opção encontrada
              </OptionItem>
            ) : (
              <>
                {selectedMatching.map((opt) => (
                  <OptionItem
                    key={opt.value}
                    $tokens={tokens}
                    $selected={true}
                    role="option"
                    aria-selected={true}
                    onClick={() => { toggle(opt.value); }}
                  >
                    <Checkbox $tokens={tokens} $checked={true} />
                    {opt.label}
                  </OptionItem>
                ))}
                {showDivider && (
                  <li aria-hidden="true" style={{ height: 1, background: 'currentColor', opacity: 0.1, margin: '2px 12px' }} />
                )}
                {unselectedMatching.map((opt) => (
                  <OptionItem
                    key={opt.value}
                    $tokens={tokens}
                    $selected={false}
                    role="option"
                    aria-selected={false}
                    onClick={() => { toggle(opt.value); }}
                  >
                    <Checkbox $tokens={tokens} $checked={false} />
                    {opt.label}
                  </OptionItem>
                ))}
              </>
            )}
          </OptionsList>
        </Dropdown>
      )}
    </Wrapper>
  );
}
