import type { ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';
import { Button, type ButtonProps } from './Button';

export type AdminModalProps = {
  open: boolean;
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  ariaLabel?: string;
  mobilePlacement?: 'bottom' | 'center';
  size?: 'default' | 'wide';
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function AdminModal({
  open,
  title,
  subtitle,
  icon,
  ariaLabel,
  mobilePlacement = 'bottom',
  size = 'default',
  onClose,
  children,
  footer,
}: AdminModalProps) {
  const { tokens } = useDesignSystem();

  if (!open) return null;

  return (
    <Overlay
      $tokens={tokens}
      role="dialog"
      $mobilePlacement={mobilePlacement}
      aria-modal="true"
      aria-label={ariaLabel ?? title}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Box $mobilePlacement={mobilePlacement} $size={size} $tokens={tokens}>
        <Header $tokens={tokens}>
          <TitleGroup>
            {icon ? <HeroIcon $tokens={tokens} aria-hidden>{icon}</HeroIcon> : null}
            <div>
              <Title $tokens={tokens}>{title}</Title>
              {subtitle ? <Subtitle $tokens={tokens}>{subtitle}</Subtitle> : null}
            </div>
          </TitleGroup>
          <Close type="button" aria-label="Fechar modal" onClick={onClose}>
            <CloseIcon aria-hidden />
          </Close>
        </Header>
        <Body>{children}</Body>
        {footer ? <Footer>{footer}</Footer> : null}
      </Box>
    </Overlay>
  );
}

export type AdminModalActionTone = 'default' | 'attention';

export type AdminModalActionProps = ButtonProps & {
  actionTone?: AdminModalActionTone;
};

export function AdminModalAction({ actionTone = 'default', children, ...props }: AdminModalActionProps) {
  return (
    <ActionButton $actionTone={actionTone} {...props}>
      {children}
    </ActionButton>
  );
}

export const AdminModalActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-between;

  @media (max-width: 680px) {
    flex-wrap: wrap;
  }
`;

export const AdminModalDetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const AdminModalDetailCard = styled.div`
  min-width: 0;
  padding: 18px;
  border: 1px solid #e0e0e0;
  border-radius: 11px;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 680px) {
    align-items: flex-start;
    padding: 14px;
    gap: 12px;
  }
`;

export const AdminModalDetailIcon = styled.div`
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #15803d;
  background: rgba(21, 128, 61, 0.1);
`;

export const AdminModalDetailContent = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`;

export const AdminModalDetailLabel = styled.strong`
  display: block;
  margin: 0;
  font-size: 16px;
  line-height: 1.25;
  font-weight: 700;
  color: #171717;
`;

export const AdminModalDetailValue = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: #525252;
`;

export const AdminModalTextAreaGroup = styled.div`
  display: grid;
  gap: 8px;
`;

export const AdminModalTextAreaLabel = styled.label`
  font-size: 14px;
  line-height: 1.3;
  font-weight: 700;
  color: #171717;
`;

export const AdminModalTextArea = styled.textarea`
  width: 100%;
  min-height: 104px;
  box-sizing: border-box;
  padding: 14px;
  border: 1px solid #c8c8c8;
  border-radius: 10px;
  resize: vertical;
  background: #ffffff;
  color: #171717;
  font: inherit;
  font-size: 14px;
  line-height: 1.5;
`;

const Overlay = styled.div<{ $tokens: BrandTokens; $mobilePlacement: 'bottom' | 'center' }>`
  position: fixed;
  inset: 0;
  z-index: 50;
  padding: 24px;
  display: grid;
  place-items: center;
  background: rgba(23, 23, 23, 0.58);
  backdrop-filter: blur(3px);

  @media (max-width: 680px) {
    padding: 10px;
    place-items: ${({ $mobilePlacement }) => ($mobilePlacement === 'center' ? 'center' : 'end center')};
  }
`;

const Box = styled.div<{ $tokens: BrandTokens; $mobilePlacement: 'bottom' | 'center'; $size: 'default' | 'wide' }>`
  width: min(${({ $size }) => ($size === 'wide' ? '1120px' : '900px')}, 100%);
  max-height: calc(100vh - 48px);
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 28px;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: 14px;
  background: ${({ $tokens }) => $tokens.colors.surface};
  box-shadow: 0 32px 90px rgba(23, 23, 23, 0.28);
  display: flex;
  flex-direction: column;
  gap: 20px;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 680px) {
    width: 100%;
    max-height: calc(100vh - 20px);
    padding: 14px;
    border-radius: ${({ $mobilePlacement }) => ($mobilePlacement === 'center' ? '14px' : '14px 14px 0 0')};
    gap: 12px;
  }
`;

const Header = styled.div<{ $tokens: BrandTokens }>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid ${({ $tokens }) => $tokens.colors.border};

  @media (max-width: 680px) {
    gap: 10px;
    padding-bottom: 12px;
  }
`;

const TitleGroup = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 18px;

  @media (max-width: 680px) {
    align-items: flex-start;
    gap: 10px;
  }
`;

const HeroIcon = styled.div<{ $tokens: BrandTokens }>`
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #15803d;
  background: rgba(21, 128, 61, 0.1);

  @media (max-width: 680px) {
    width: 42px;
    height: 42px;

    svg {
      width: 22px;
      height: 22px;
    }
  }
`;

const Title = styled.h2<{ $tokens: BrandTokens }>`
  margin: 0;
  font-size: 24px;
  line-height: 1.12;
  font-weight: 700;
  color: ${({ $tokens }) => $tokens.colors.text};

  @media (max-width: 680px) {
    font-size: 16px;
    line-height: 1.18;
  }
`;

const Subtitle = styled.p<{ $tokens: BrandTokens }>`
  margin: 6px 0 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 16px;
  line-height: 1.35;
  color: ${({ $tokens }) => $tokens.colors.textMuted};

  @media (max-width: 680px) {
    font-size: 12px;
    line-height: 1.4;
  }
`;

const Close = styled(Button).attrs({ variant: 'ghost' as const, size: 'sm' as const })`
  width: 44px;
  height: 44px;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: #f7f7f7;
`;

const Body = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;
`;

const Footer = styled.div`
  display: grid;
  gap: 12px;

  @media (max-width: 680px) {
    position: sticky;
    bottom: -14px;
    margin: 0 -14px -14px;
    padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
    border-top: 1px solid #e0e0e0;
    background: inherit;
  }
`;

const ActionButton = styled(Button) <{ $actionTone: AdminModalActionTone }>`
  flex: 0 0 auto;
  min-width: 218px;
  min-height: 48px;
  padding: 0 20px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  ${({ $actionTone }) =>
    $actionTone === 'attention'
      ? `
        background: #ffffff;
        border-color: #c8c8c8;
        color: #b91c1c;
      `
      : `
        background: #15803d;
        border-color: #15803d;
        color: #ffffff;
        box-shadow: 0 12px 24px rgba(21, 128, 61, 0.22);
      `}

  @media (max-width: 680px) {
    min-width: 0;
    width: 100%;
    white-space: normal;
    text-transform: none;
  }
`;

function CloseIcon(props: { 'aria-hidden'?: boolean }) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
