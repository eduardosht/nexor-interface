import { useId, type ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';
import {
  formatDocumentValue,
  getDocumentMaxLength,
  sanitizeDocumentValue,
  type SupportedDocumentType,
} from '../utils/formats';

export type DocumentFieldOption = {
  value: SupportedDocumentType;
  label: string;
};

export type DocumentFieldProps = {
  label: string;
  documentType: SupportedDocumentType;
  documentNumber: string;
  documentTypes: DocumentFieldOption[];
  onDocumentTypeChange: (type: SupportedDocumentType) => void;
  onDocumentNumberChange: (value: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  id?: string;
};

const Wrapper = styled.div<{ $tokens: BrandTokens }>`
  display: grid;
  gap: ${({ $tokens }) => $tokens.spacing.form.helperGap};
`;

const Label = styled.label<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const RequiredMark = styled.span<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.danger};
`;

const Control = styled.div<{ $tokens: BrandTokens; $invalid: boolean }>`
  display: grid;
  grid-template-columns: minmax(92px, auto) minmax(0, 1fr);
  align-items: center;
  min-height: 44px;
  overflow: hidden;
  background: ${({ $tokens, $invalid }) =>
    $invalid ? $tokens.colors.dangerBg : $tokens.colors.surface};
  border: 1px solid
    ${({ $tokens, $invalid }) =>
      $invalid ? $tokens.colors.dangerBorder : $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.md};
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

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const TypeSelect = styled.select<{ $tokens: BrandTokens }>`
  height: 100%;
  min-height: 44px;
  padding: 0 12px;
  border: 0;
  border-right: 1px solid ${({ $tokens }) => $tokens.colors.border};
  background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 13px;
  font-weight: 700;
  outline: none;
  cursor: pointer;

  @media (max-width: 420px) {
    border-right: 0;
    border-bottom: 1px solid ${({ $tokens }) => $tokens.colors.border};
  }
`;

const Input = styled.input<{ $tokens: BrandTokens }>`
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 0 12px;
  border: 0;
  outline: none;
  background: transparent;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 14px;
`;

const Message = styled.span<{ $tokens: BrandTokens; $tone: 'hint' | 'error' }>`
  color: ${({ $tokens, $tone }) =>
    $tone === 'error' ? $tokens.colors.danger : $tokens.colors.textSoft};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 11px;
  line-height: 1.4;
`;

export function DocumentField({
  label,
  documentType,
  documentNumber,
  documentTypes,
  onDocumentTypeChange,
  onDocumentNumberChange,
  hint,
  error,
  required = false,
  id,
}: DocumentFieldProps) {
  const { tokens } = useDesignSystem();
  const autoId = useId();
  const inputId = id ?? autoId;
  const typeId = `${inputId}-type`;
  const invalid = Boolean(error);

  return (
    <Wrapper $tokens={tokens}>
      <Label $tokens={tokens} htmlFor={inputId}>
        {label} {required ? <RequiredMark $tokens={tokens}>*</RequiredMark> : null}
      </Label>
      <Control $tokens={tokens} $invalid={invalid}>
        <TypeSelect
          $tokens={tokens}
          id={typeId}
          aria-label="Tipo de documento"
          value={documentType}
          onChange={(event) => onDocumentTypeChange(event.target.value as SupportedDocumentType)}
        >
          {documentTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TypeSelect>
        <Input
          $tokens={tokens}
          id={inputId}
          value={formatDocumentValue(documentType, documentNumber)}
          maxLength={getDocumentMaxLength(documentType)}
          inputMode={documentType === 'cpf' ? 'numeric' : 'text'}
          aria-invalid={invalid}
          onChange={(event) => {
            onDocumentNumberChange(sanitizeDocumentValue(documentType, event.target.value));
          }}
        />
      </Control>
      {error ? <Message $tokens={tokens} $tone="error">{error}</Message> : null}
      {!error && hint ? <Message $tokens={tokens} $tone="hint">{hint}</Message> : null}
    </Wrapper>
  );
}
