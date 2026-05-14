import { useState, useRef, useLayoutEffect, type ReactNode } from 'react';
import styled from 'styled-components';

export interface CollapseProps {
  trigger: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

const Wrapper = styled.div`
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  background: #FFFFFF;
  overflow: hidden;
`;

const Trigger = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #171717;
  text-align: left;
  gap: 16px;

  &:focus-visible {
    outline: 2px solid #171717;
    outline-offset: -2px;
    border-radius: 11px;
  }
`;

const Icon = styled.span<{ $open: boolean }>`
  flex-shrink: 0;
  font-size: 18px;
  line-height: 1;
  color: #525252;
  transition: transform 180ms ease;
  transform: ${({ $open }) => ($open ? 'rotate(45deg)' : 'rotate(0deg)')};
  user-select: none;
`;

const BodyOuter = styled.div<{ $open: boolean; $height: number | 'auto' }>`
  height: ${({ $open, $height }) => ($open ? ($height === 'auto' ? 'auto' : `${$height}px`) : '0px')};
  overflow: hidden;
  transition: height 180ms ease;
`;

const BodyInner = styled.div`
  padding: 0 24px 20px;
  font-size: 14px;
  color: #525252;
  line-height: 1.65;
`;

export function Collapse({ trigger, children, defaultOpen = false }: CollapseProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [height, setHeight] = useState<number | 'auto'>(defaultOpen ? 'auto' : 0);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (defaultOpen && innerRef.current) {
      setHeight(innerRef.current.scrollHeight || 'auto');
    }
  }, [defaultOpen]);

  function toggle() {
    if (!open && innerRef.current) {
      setHeight(innerRef.current.scrollHeight);
    }
    setOpen((prev) => !prev);
  }

  return (
    <Wrapper>
      <Trigger onClick={toggle} aria-expanded={open} type="button">
        <span>{trigger}</span>
        <Icon $open={open} aria-hidden="true">+</Icon>
      </Trigger>
      <BodyOuter $open={open} $height={height} aria-hidden={!open}>
        <BodyInner ref={innerRef}>{children}</BodyInner>
      </BodyOuter>
    </Wrapper>
  );
}
