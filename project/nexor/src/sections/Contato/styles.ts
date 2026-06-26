import styled from 'styled-components';
import { Surface } from '@nexor/design-system';
import { fullBleedSection, pageContainer } from '../../styles/layout';

export const SectionOuter = styled.div`
  ${fullBleedSection}
  background: ${({ theme }) => theme.colors.bgInset};
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

export const Section = styled.section`
  ${pageContainer}
  padding: 120px 0;
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 64px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 40px 0;
    gap: 32px;
  }
`;

export const Title = styled.h2`
  font-size: clamp(3rem, 3.5vw, 5rem);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.1;
  margin: 0 0 16px;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 640px) {
    font-size: clamp(2.25rem, 10vw, 3rem);
  }
`;

export const Subtitle = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.65;
  margin: 0 0 32px;
`;

export const ContactLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

export const ContactLink = styled.a`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 10px;
  transition: color 100ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const IconBox = styled.span`
  width: 30px;
  height: 30px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const SelectIntro = styled.p`
  margin: 0 0 -2px;
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSoft};
`;

export const SuccessBanner = styled(Surface)`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
`;

export const ErrorBanner = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.error};
  font-size: 13px;
  line-height: 1.5;
`;
