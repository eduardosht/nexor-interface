import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';
import { Button } from './Button';

export interface FilterSheetProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  align-items: end;
  background: rgba(0, 0, 0, 0.42);

  @media (min-width: 769px) {
    display: none;
  }
`;

const Sheet = styled.div<{ $tokens: BrandTokens }>`
  width: 100%;
  max-height: min(82vh, 680px);
  display: grid;
  gap: 16px;
  overflow: auto;
  padding: 18px 16px calc(16px + env(safe-area-inset-bottom));
  border-radius: 16px 16px 0 0;
  background: ${({ $tokens }) => $tokens.colors.surface};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h2<{ $tokens: BrandTokens }>`
  margin: 0;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-size: 18px;
  line-height: 1.2;
`;

const IconButton = styled.button<{ $tokens: BrandTokens }>`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.sm};
  background: ${({ $tokens }) => $tokens.colors.surface};
  color: ${({ $tokens }) => $tokens.colors.text};
  cursor: pointer;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function FilterSheet({
  open,
  title,
  children,
  onClose,
  onClear,
  onApply,
}: FilterSheetProps) {
  const { tokens } = useDesignSystem();
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    return () => {
      previousFocusRef.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      onClose();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
    ).filter((element) => !element.hasAttribute('disabled'));

    if (focusable.length === 0) {
      event.preventDefault();
      sheetRef.current?.focus();
      return;
    }

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  return (
    <Overlay role="presentation" onClick={handleOverlayClick}>
      <Sheet
        ref={sheetRef}
        $tokens={tokens}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <Header>
          <Title $tokens={tokens}>{title}</Title>
          <IconButton
            ref={closeButtonRef}
            $tokens={tokens}
            type="button"
            aria-label="Fechar filtros"
            onClick={onClose}
          >
            <span aria-hidden="true">X</span>
          </IconButton>
        </Header>
        {children}
        <Actions>
          <Button type="button" variant="secondary" fullWidth onClick={onClear}>
            Limpar filtros
          </Button>
          <Button type="button" fullWidth onClick={onApply}>
            Aplicar filtros
          </Button>
        </Actions>
      </Sheet>
    </Overlay>
  );
}
