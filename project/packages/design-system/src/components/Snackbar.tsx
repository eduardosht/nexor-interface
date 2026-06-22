import { useEffect, type ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export type SnackbarTone = 'info' | 'success' | 'warning' | 'error';

export interface SnackbarProps {
  tone?: SnackbarTone;
  title?: string;
  message?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
  autoCloseMs?: number;
}

export interface SnackbarStackProps {
  children: ReactNode;
}

function toneStyles(tokens: BrandTokens, tone: SnackbarTone) {
  if (tone === 'success') {
    return {
      accent: '#15803D',
      background: tokens.name === 'biteplaner' ? '#F3FFF7' : '#F6FBF7',
      border: '#B9E2C4',
      iconBackground: '#DCFCE7',
    };
  }

  if (tone === 'warning') {
    return {
      accent: '#B45309',
      background: '#FFF8EB',
      border: '#F3D39A',
      iconBackground: '#FEF3C7',
    };
  }

  if (tone === 'error') {
    return {
      accent: tokens.colors.danger,
      background: tokens.colors.dangerBg,
      border: tokens.colors.dangerBorder,
      iconBackground: '#FEE2E2',
    };
  }

  return {
    accent: tokens.colors.text,
    background: tokens.colors.surface,
    border: tokens.colors.borderStrong,
    iconBackground: tokens.colors.surfaceStrong,
  };
}

function SnackbarIcon({ tone }: { tone: SnackbarTone }) {
  if (tone === 'success') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (tone === 'warning') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3l-8.47-14.14a2 2 0 0 0-3.42 0Z" />
      </svg>
    );
  }

  if (tone === 'error') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

const Stack = styled.div<{ $tokens: BrandTokens }>`
  position: fixed;
  right: ${({ $tokens }) => $tokens.spacing['12']};
  bottom: ${({ $tokens }) => $tokens.spacing['12']};
  z-index: 1400;
  display: grid;
  gap: ${({ $tokens }) => $tokens.spacing['6']};
  width: min(calc(100vw - 32px), 420px);
  pointer-events: none;
`;

const Shell = styled.div<{
  $tokens: BrandTokens;
  $tone: SnackbarTone;
}>`
  ${({ $tokens, $tone }) => {
    const palette = toneStyles($tokens, $tone);

    return `
      border-color: ${palette.border};
      background: ${palette.background};
      color: ${palette.accent};
    `;
  }}

  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: ${({ $tokens }) => $tokens.spacing['6']};
  align-items: start;
  padding: ${({ $tokens }) => $tokens.spacing['8']};
  border-width: 1px;
  border-style: solid;
  border-radius: ${({ $tokens }) => $tokens.radius.lg};
  box-shadow: ${({ $tokens }) => $tokens.shadow.lg};
  pointer-events: auto;
`;

const IconSlot = styled.span<{
  $tokens: BrandTokens;
  $tone: SnackbarTone;
}>`
  ${({ $tokens, $tone }) => {
    const palette = toneStyles($tokens, $tone);

    return `
      background: ${palette.iconBackground};
      color: ${palette.accent};
    `;
  }}

  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ $tokens }) => $tokens.radius.md};
  flex-shrink: 0;
`;

const Content = styled.div<{ $tokens: BrandTokens }>`
  display: grid;
  gap: ${({ $tokens }) => $tokens.spacing['2']};
  min-width: 0;
  padding-top: 2px;
`;

const Title = styled.strong<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.display};
  font-size: 13px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const Message = styled.div<{ $tokens: BrandTokens }>`
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 13px;
  line-height: 1.55;
`;

const ActionSlot = styled.div<{ $tokens: BrandTokens }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ $tokens }) => $tokens.spacing['4']};
  margin-top: ${({ $tokens }) => $tokens.spacing['4']};
`;

const CloseButton = styled.button<{ $tokens: BrandTokens }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: ${({ $tokens }) => $tokens.radius.md};
  background: transparent;
  color: ${({ $tokens }) => $tokens.colors.textSoft};
  cursor: pointer;

  &:hover {
    background: ${({ $tokens }) => $tokens.colors.surfaceStrong};
    color: ${({ $tokens }) => $tokens.colors.text};
  }
`;

export function SnackbarStack({ children }: SnackbarStackProps) {
  const { tokens } = useDesignSystem();

  return <Stack $tokens={tokens}>{children}</Stack>;
}

export function Snackbar({
  tone = 'info',
  title,
  message,
  action,
  onClose,
  autoCloseMs = 10000,
}: SnackbarProps) {
  const { tokens } = useDesignSystem();
  const role = tone === 'error' ? 'alert' : 'status';

  useEffect(() => {
    if (!onClose || autoCloseMs <= 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(onClose, autoCloseMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoCloseMs, onClose]);

  return (
    <Shell $tokens={tokens} $tone={tone} role={role}>
      <IconSlot $tokens={tokens} $tone={tone}>
        <SnackbarIcon tone={tone} />
      </IconSlot>
      <Content $tokens={tokens}>
        {title ? <Title $tokens={tokens}>{title}</Title> : null}
        {message ? <Message $tokens={tokens}>{message}</Message> : null}
        {action ? <ActionSlot $tokens={tokens}>{action}</ActionSlot> : null}
      </Content>
      {onClose ? (
        <CloseButton $tokens={tokens} type="button" aria-label="Fechar snackbar" onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      ) : <span aria-hidden />}
    </Shell>
  );
}
