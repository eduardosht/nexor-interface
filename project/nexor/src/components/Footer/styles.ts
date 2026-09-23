import styled from 'styled-components';
import { Link } from 'react-router';
import { pageContainer } from '../../styles/layout';

export const FooterEl = styled.footer`
  background: #f5f5f5;
  border-top: 1px solid rgba(220, 228, 232, 0.82);
`;

export const Main = styled.div`
  ${pageContainer}
  padding: 34px 0 30px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 64px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    padding-top: 48px;
    padding-bottom: 40px;
    gap: 36px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const LogoLink = styled.a`
  display: inline-flex;
  align-items: center;
`;

export const LogoImg = styled.img`
  height: auto;
  width: 138px;
`;

export const Tagline = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
  max-width: 260px;
`;

export const NavColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const NavHeading = styled.p`
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #172033;
  margin: 0 0 8px;
  font-weight: 900;
`;

export const NavLink = styled(Link)`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 100ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const Bottom = styled.div`
  ${pageContainer}
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  padding-top: 16px;
  padding-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    padding-top: 20px;
    padding-bottom: 20px;
    text-align: center;
  }
`;

export const Copyright = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

export const LegalLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

export const NavLinkRouter = styled(Link)`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 100ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const LegalLinkRouter = styled(Link)`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 100ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;
