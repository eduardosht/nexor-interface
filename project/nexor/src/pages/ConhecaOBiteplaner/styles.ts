import styled from 'styled-components';
import { getBrandTokens } from '@nexor/design-system';

const bp = getBrandTokens('nexor').biteplanerContext;

export const Page = styled.main`
  min-height: 100vh;
  min-height: 100svh;
  background: #ffffff;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Hero = styled.section`
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 136px 48px 48px;

  @media (max-width: 900px) {
    padding: 118px 24px 36px;
  }
`;

export const HeroCopy = styled.div`
  max-width: 820px;
`;

export const Eyebrow = styled.p`
  margin: 0 0 18px;
  color: ${bp.accentStrong};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  max-width: 720px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(40px, 5.8vw, 72px);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 0.98;
  text-transform: uppercase;

  @media (max-width: 640px) {
    font-size: clamp(34px, 11vw, 50px);
    line-height: 1;
  }
`;

export const Lead = styled.p`
  max-width: 680px;
  margin: 24px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(17px, 1.8vw, 21px);
  line-height: 1.58;
`;

export const ContentShell = styled.div`
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 0 48px 88px;

  @media (max-width: 820px) {
    padding: 0 24px 64px;
  }
`;

export const IntroPanel = styled.section`
  padding: 34px 0 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${bp.accentStrong};
  font-size: clamp(28px, 3.4vw, 42px);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.05;
`;

export const SectionLead = styled.p`
  max-width: 720px;
  margin: 14px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 16px;
  line-height: 1.65;
`;

export const CareGrid = styled.section`
  margin-top: 16px;
  display: grid;
  gap: 14px;
`;

export const CareItem = styled.article`
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 18px;
  padding: 22px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const CareIcon = styled.div`
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${bp.accentSoft};
  color: ${bp.accentStrong};
`;

export const CareTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
  font-weight: 900;
  line-height: 1.25;
`;

export const CareBody = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  line-height: 1.68;
`;

export const InfoBand = styled.section`
  margin-top: 34px;
  padding: 34px;
  border: 1px solid rgba(28, 94, 58, 0.16);
  border-radius: 12px;
  background: #ffffff;

  @media (max-width: 640px) {
    padding: 26px;
  }
`;

export const InfoCopy = styled.div`
  max-width: 760px;
`;

export const NoteList = styled.ul`
  margin: 20px 0 0;
  padding: 0 0 0 20px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  line-height: 1.72;

  li + li {
    margin-top: 10px;
  }
`;

export const FinalNote = styled.aside`
  margin-top: 28px;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 16px;
  padding: 24px 0 0;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
  color: ${bp.accentStrong};
`;

export const FinalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 20px;
  font-weight: 900;
  line-height: 1.25;
`;

export const FinalText = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  line-height: 1.68;
`;
