import { useId, useRef, useState } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 16.5v1a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-1" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3 2.5 20h19z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export type UploadFieldFile = {
  id: string;
  name: string;
  status: 'uploaded' | 'error';
  sizeLabel?: string;
  errorMessage?: string;
};

export interface UploadFieldProps {
  label?: string;
  hint?: string;
  files: UploadFieldFile[];
  onFilesChange: (files: File[]) => void;
  onRemoveFile: (fileId: string) => void;
  accept?: string;
  multiple?: boolean;
  browseLabel?: string;
}

const Wrapper = styled.div<{ $tokens: BrandTokens }>`
  display: grid;
  gap: ${({ $tokens }) => $tokens.spacing.form.fieldGap};
`;

const Label = styled.label<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 14px;
  font-weight: 600;

  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

const Dropzone = styled.button<{ $tokens: BrandTokens; $dragActive: boolean }>`
  display: grid;
  justify-items: center;
  gap: 12px;
  width: 100%;
  padding: 28px 20px;
  border-radius: ${({ $tokens }) => $tokens.radius.xl};
  border: 1.5px dashed ${({ $dragActive, $tokens }) => ($dragActive ? '#15803d' : $tokens.colors.borderStrong)};
  background: ${({ $dragActive, $tokens }) => ($dragActive ? 'rgba(21, 128, 61, 0.08)' : $tokens.colors.surfaceSubtle)};
  color: ${({ $dragActive, $tokens }) => ($dragActive ? $tokens.colors.text : $tokens.colors.textMuted)};
  cursor: pointer;
  transition:
    border-color ${({ $tokens }) => $tokens.motion.base} ease,
    background ${({ $tokens }) => $tokens.motion.base} ease,
    color ${({ $tokens }) => $tokens.motion.base} ease;

  &:hover {
    border-color: ${({ $tokens }) => $tokens.colors.textMuted};
    color: ${({ $tokens }) => $tokens.colors.text};
    background: ${({ $tokens }) => $tokens.colors.surface};
  }
`;

const DropzoneText = styled.div<{ $tokens: BrandTokens }>`
  display: grid;
  gap: 2px;
  text-align: center;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
`;

const DropzoneHeadline = styled.span`
  font-size: 14px;
  line-height: 1.5;
`;

const BrowseText = styled.span`
  font-size: 14px;
  font-weight: 700;
  text-decoration: underline;
`;

const HiddenInput = styled.input`
  display: none;
`;

const Helper = styled.span<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.textSoft};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  line-height: 1.4;
`;

const FileList = styled.div`
  display: grid;
  gap: 12px;
`;

const FileRow = styled.div<{ $tokens: BrandTokens; $status: 'uploaded' | 'error' }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: start;
  color: ${({ $tokens, $status }) => ($status === 'error' ? $tokens.colors.danger : $tokens.colors.text)};
`;

const FileMeta = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`;

const FileName = styled.span`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-word;
`;

const FileSubtext = styled.span<{ $tokens: BrandTokens; $status: 'uploaded' | 'error' }>`
  font-size: 12px;
  line-height: 1.4;
  color: ${({ $tokens, $status }) => ($status === 'error' ? $tokens.colors.danger : $tokens.colors.textSoft)};
`;

const StatusSlot = styled.span<{ $tokens: BrandTokens; $status: 'uploaded' | 'error' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ $tokens, $status }) => ($status === 'error' ? $tokens.colors.danger : '#16A34A')};
`;

const RemoveButton = styled.button<{ $tokens: BrandTokens }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: ${({ $tokens }) => $tokens.colors.textSoft};
  cursor: pointer;
  border-radius: ${({ $tokens }) => $tokens.radius.md};

  &:hover {
    background: ${({ $tokens }) => $tokens.colors.surfaceStrong};
    color: ${({ $tokens }) => $tokens.colors.text};
  }
`;

export function UploadField({
  label,
  hint,
  files,
  onFilesChange,
  onRemoveFile,
  accept,
  multiple = false,
  browseLabel = 'procurar',
}: UploadFieldProps) {
  const { tokens } = useDesignSystem();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <Wrapper $tokens={tokens}>
      {label ? <Label $tokens={tokens} htmlFor={inputId}>{label}</Label> : null}
      <Dropzone
        $tokens={tokens}
        $dragActive={dragActive}
        data-drag-active={dragActive ? 'true' : 'false'}
        type="button"
        onClick={openPicker}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          const nextFiles = Array.from(event.dataTransfer.files ?? []);

          if (nextFiles.length > 0) {
            onFilesChange(multiple ? nextFiles : nextFiles.slice(0, 1));
          }
        }}
      >
        <UploadIcon />
        <DropzoneText $tokens={tokens}>
          <DropzoneHeadline>Arraste e solte o(s) arquivo(s) para enviar</DropzoneHeadline>
          <BrowseText>ou {browseLabel}</BrowseText>
        </DropzoneText>
      </Dropzone>
      <HiddenInput
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        aria-label={`Selecionar ${label?.toLowerCase() ?? 'arquivo'}`}
        onChange={(event) => {
          const nextFiles = Array.from(event.target.files ?? []);
          onFilesChange(nextFiles);
        }}
      />
      {hint ? <Helper $tokens={tokens}>{hint}</Helper> : null}
      {files.length > 0 ? (
        <FileList>
          {files.map((file) => (
            <FileRow key={file.id} $tokens={tokens} $status={file.status}>
              <FileIcon />
              <FileMeta>
                <FileName>{file.name}</FileName>
                {file.status === 'error' && file.errorMessage ? (
                  <FileSubtext $tokens={tokens} $status={file.status}>{file.errorMessage}</FileSubtext>
                ) : file.sizeLabel ? (
                  <FileSubtext $tokens={tokens} $status={file.status}>{file.sizeLabel}</FileSubtext>
                ) : null}
              </FileMeta>
              <StatusSlot $tokens={tokens} $status={file.status}>
                {file.status === 'error' ? <ErrorIcon /> : <SuccessIcon />}
              </StatusSlot>
              <RemoveButton
                $tokens={tokens}
                type="button"
                aria-label={`Remover arquivo ${file.name}`}
                onClick={() => {
                  onRemoveFile(file.id);
                }}
              >
                <TrashIcon />
              </RemoveButton>
            </FileRow>
          ))}
        </FileList>
      ) : null}
    </Wrapper>
  );
}
