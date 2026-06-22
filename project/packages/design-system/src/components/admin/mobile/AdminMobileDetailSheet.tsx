import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import styled from 'styled-components';
import { adminColor } from '../adminTheme';

export interface AdminMobileDetailSheetProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export function AdminMobileDetailSheet({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: AdminMobileDetailSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    return undefined;
  }, [open]);

  if (!open) return null;

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') onClose();
  }

  return (
    <Overlay role="presentation" onClick={handleOverlayClick}>
      <Sheet role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined} onKeyDown={handleKeyDown}>
        <Header>
          <div>
            <Title>{title}</Title>
            {description ? <Description>{description}</Description> : null}
          </div>
          <CloseButton ref={closeRef} type="button" aria-label="Fechar detalhes" onClick={onClose}>
            X
          </CloseButton>
        </Header>
        <Body>{children}</Body>
        {footer ? <Footer>{footer}</Footer> : null}
      </Sheet>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 95;
  display: grid;
  align-items: end;
  background: rgba(0, 0, 0, 0.42);
`;

const Sheet = styled.div`
  width: 100%;
  max-height: min(88vh, 720px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border-radius: 16px 16px 0 0;
  background: ${({ theme }) => adminColor(theme, 'bgElevated', 'surface', '#FFFFFF')};
  box-shadow: 0 -18px 42px rgba(23, 23, 23, 0.18);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border-bottom: 1px solid ${({ theme }) => adminColor(theme, 'borderDefault', 'border', '#E0E0E0')};
`;

const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => adminColor(theme, 'textPrimary', 'text', '#171717')};
  font-size: 16px;
  line-height: 1.25;
`;

const Description = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => adminColor(theme, 'textSecondary', 'textMuted', '#525252')};
  font-size: 12px;
  line-height: 1.35;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border: 1px solid ${({ theme }) => adminColor(theme, 'borderDefault', 'border', '#E0E0E0')};
  border-radius: 8px;
  background: ${({ theme }) => adminColor(theme, 'bgElevated', 'surface', '#FFFFFF')};
  color: ${({ theme }) => adminColor(theme, 'textPrimary', 'text', '#171717')};
  cursor: pointer;
`;

const Body = styled.div`
  min-height: 0;
  overflow: auto;
  padding: 14px;
`;

const Footer = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid ${({ theme }) => adminColor(theme, 'borderDefault', 'border', '#E0E0E0')};
  background: ${({ theme }) => adminColor(theme, 'bgElevated', 'surface', '#FFFFFF')};

  > * {
    flex: 1 1 130px;
    min-width: 130px;
  }
`;
