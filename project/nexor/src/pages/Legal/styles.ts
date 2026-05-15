import styled from 'styled-components';

export const LegalPage = styled.main`
  min-height: 100vh;
  padding: 120px 48px 80px;
  @media (max-width: 768px) { padding: 100px 24px 60px; }
`;

export const LegalContainer = styled.article`
  max-width: 720px;
  margin: 0 auto;
`;

export const LegalUpdatedAt = styled.p`
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 40px;
`;

export const LegalTitle = styled.h1`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 16px;
`;

export const LegalSection = styled.section`
  padding: 32px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  &:first-of-type { border-top: none; padding-top: 0; }
`;

export const LegalSectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 16px;
`;

export const LegalBody = styled.p`
  font-size: 15px;
  line-height: 1.75;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 12px;
  &:last-child { margin: 0; }
`;

export const LegalList = styled.ul`
  font-size: 15px;
  line-height: 1.75;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  padding-left: 20px;
  li + li { margin-top: 6px; }
`;
