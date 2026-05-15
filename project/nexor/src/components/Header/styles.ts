import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
