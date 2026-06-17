import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { adminColor } from '../adminTheme';

export interface AdminMobileActionMenuItem {
  label: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}

export interface AdminMobileActionMenuProps {
  label?: string;
  items: AdminMobileActionMenuItem[];
}

export function AdminMobileActionMenu({ label = 'Mais ações', items }: AdminMobileActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  return (
    <Wrap ref={menuRef}>
      <Trigger type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <span aria-hidden="true">...</span>
        <span className="sr-only">{label}</span>
      </Trigger>
      {open ? (
        <Menu role="menu" aria-label={label}>
          {items.map((item) => (
            <MenuItem
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              $tone={item.tone ?? 'default'}
              onClick={() => {
                item.onSelect();
                setOpen(false);
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      ) : null}
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
`;

const Trigger = styled.button`
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  border: 1px solid ${({ theme }) => adminColor(theme, 'borderDefault', 'border', '#E0E0E0')};
  border-radius: 8px;
  background: ${({ theme }) => adminColor(theme, 'bgElevated', 'surface', '#FFFFFF')};
  color: ${({ theme }) => adminColor(theme, 'textPrimary', 'text', '#171717')};
  cursor: pointer;

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

const Menu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 5;
  min-width: 176px;
  display: grid;
  padding: 6px;
  border: 1px solid ${({ theme }) => adminColor(theme, 'borderDefault', 'border', '#E0E0E0')};
  border-radius: 8px;
  background: ${({ theme }) => adminColor(theme, 'bgElevated', 'surface', '#FFFFFF')};
  box-shadow: 0 14px 32px rgba(23, 23, 23, 0.14);
`;

const MenuItem = styled.button<{ $tone: 'default' | 'danger' }>`
  min-height: 36px;
  border: 0;
  border-radius: 6px;
  padding: 0 10px;
  background: transparent;
  color: ${({ $tone, theme }) => ($tone === 'danger' ? '#b91c1c' : adminColor(theme, 'textPrimary', 'text', '#171717'))};
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;

  &:hover:not(:disabled),
  &:focus-visible {
    background: ${({ theme }) => adminColor(theme, 'bgSubtle', 'surfaceSubtle', '#F7F7F7')};
    outline: 0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
