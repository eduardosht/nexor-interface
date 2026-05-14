import styled from 'styled-components';

export const Page = styled.div`
  display: grid;
  gap: 22px;
`;

export const Banner = styled.div`
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const GuidanceBanner = styled(Banner)`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 18px;
  padding: 20px 22px;
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #0f2a5f;

  p {
    margin: 0;
  }

  p + p {
    margin-top: 2px;
    color: #334155;
  }
`;

export const InfoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 2px solid #2563eb;
  border-radius: 999px;
  color: #2563eb;
`;

export const RequiredStar = styled.span`
  color: #dc2626;
  font-weight: 800;
`;

export const ImpedimentBanner = styled(Banner)`
  border-color: #fecaca;
  background: #fef2f2;
  color: #7f1d1d;
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.08);

  > strong {
    color: #991b1b;
  }
`;

export const ImpedimentList = styled.ul`
  display: grid;
  gap: 10px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
`;

export const ImpedimentItem = styled.li`
  display: grid;
  gap: 2px;

  strong {
    font-size: 14px;
    color: #991b1b;
  }

  span {
    color: #7f1d1d;
  }
`;

export const Content = styled.div`
  display: grid;
  gap: 18px;

  > form {
    display: grid;
    gap: 18px;
  }
`;

export const Section = styled.section`
  display: grid;
  gap: 18px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const StepBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgElevated};
  font-size: 14px;
  font-weight: 800;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 20px;
  font-weight: 800;
`;

export const QuestionBlock = styled.div`
  display: grid;
  gap: 12px;
`;

export const QuestionIntro = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const QuestionRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 254px);
  align-items: center;
  gap: 18px;
  padding: 0 0 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }

  > fieldset {
    grid-column: 1 / -1;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;
