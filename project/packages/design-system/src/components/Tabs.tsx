import { createContext, useContext, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue>({
  value: '',
  onChange: () => undefined,
});

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

export interface TabListProps {
  children: ReactNode;
}

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
}

const StyledTabList = styled.div<{ $tokens: BrandTokens }>`
  display: flex;
  border-bottom: 1px solid ${({ $tokens }) => $tokens.colors.border};
`;

const StyledTab = styled.button<{ $tokens: BrandTokens; $active: boolean }>`
  padding: 10px 16px;
  font-size: 13px;
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  color: ${({ $tokens, $active }) => ($active ? $tokens.colors.text : $tokens.colors.textMuted)};
  background: transparent;
  border: none;
  border-bottom: ${({ $tokens, $active }) =>
    $active ? `2px solid ${$tokens.colors.text}` : '2px solid transparent'};
  margin-bottom: -1px;
  cursor: pointer;
  transition: color ${({ $tokens }) => $tokens.motion.base} ease;

  &:hover:not(:disabled) {
    color: ${({ $tokens }) => $tokens.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ $tokens }) => $tokens.colors.accent};
    outline-offset: 2px;
  }
`;

export function Tabs({ value, onChange, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      {children}
    </TabsContext.Provider>
  );
}

export function TabList({ children }: TabListProps) {
  const { tokens } = useDesignSystem();

  return <StyledTabList $tokens={tokens}>{children}</StyledTabList>;
}

export function Tab({ value, children, ...rest }: TabProps) {
  const { tokens } = useDesignSystem();
  const { value: activeValue, onChange } = useContext(TabsContext);
  const isActive = value === activeValue;

  return (
    <StyledTab
      $tokens={tokens}
      $active={isActive}
      type="button"
      aria-selected={isActive}
      role="tab"
      onClick={() => { onChange(value); }}
      {...rest}
    >
      {children}
    </StyledTab>
  );
}
