import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const MobilePublicNavigationSpace = createGlobalStyle`
  @media (max-width: 768px) {
    body {
      padding-bottom: calc(72px + env(safe-area-inset-bottom));
    }
  }
`;

export const Nav = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: auto;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 48px;
  background: rgba(245, 245, 247, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  transition: box-shadow 200ms ease-in-out;

  @media (max-width: 768px) {
    padding: 0 24px;
  }
`;

export const Brand = styled.button`
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
`;

export const LogoImg = styled.img`
  height: auto;
  width: 200px;
`;

export const Links = styled.ul`
  display: flex;
  gap: 32px;
  list-style: none;
  margin: 0 0 0 40px;
  padding: 0;
  align-items: center;
  flex: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const NavLink = styled.button`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: 0.04em;
  position: relative;
  transition: color 100ms cubic-bezier(0.16, 1, 0.3, 1);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: ${({ theme }) => theme.colors.textPrimary};
    transition: width 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    &::after { width: 100%; }
  }
`;

export const EnterButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 150ms ease;
  flex-shrink: 0;

  &:hover {
    opacity: 0.85;
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 8px 16px;
  }
`;

export const MobileBottomNav = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 105;
  display: none;
  align-items: center;
  justify-content: space-around;
  min-height: calc(64px + env(safe-area-inset-bottom));
  padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  background: rgba(250, 250, 250, 0.94);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 -10px 28px rgba(23, 23, 23, 0.08);

  @media (max-width: 768px) {
    display: flex;
  }
`;

export const MobileBottomNavButton = styled.button`
  min-width: 0;
  flex: 1;
  min-height: 52px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 4px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.bgInset};
    outline: none;
  }

  span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
