import styled from 'styled-components';

export const LegalPage = styled.main`
  min-height: 100vh;
  padding: 120px 48px 80px;
  @media (max-width: 768px) { padding: 100px 24px 60px; }
`;

export const LegalContainer = styled.article`
  max-width: 920px;
  margin: 0 auto;
`;

export const LegalProfileIntro = styled.p`
  max-width: 680px;
  font-size: 15px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 28px;
`;

export const LegalProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 44px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const LegalProfileCard = styled.button<{ $active: boolean }>`
  min-height: 132px;
  padding: 18px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.accent : theme.colors.borderSubtle)};
  border-radius: 8px;
  background: ${({ $active, theme }) => ($active ? theme.colors.bgElevated : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: left;
  cursor: pointer;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;

  strong,
  span {
    display: block;
  }

  strong {
    font-size: 15px;
    line-height: 1.25;
    margin-bottom: 10px;
  }

  span {
    font-size: 13px;
    line-height: 1.55;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
    outline: none;
    transform: translateY(-1px);
  }
`;

export const LegalDocumentHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding-top: 28px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  margin-bottom: 8px;

  @media (max-width: 720px) {
    display: block;
  }
`;

export const LegalSubtitle = styled.p`
  font-size: 15px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: -4px 0 12px;
`;

export const LegalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;

  @media (max-width: 720px) {
    justify-content: flex-start;
    margin-bottom: 24px;
  }
`;

export const LegalDownloadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.surface};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    cursor: wait;
    opacity: 0.72;
  }
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
  font-weight: 700;
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
