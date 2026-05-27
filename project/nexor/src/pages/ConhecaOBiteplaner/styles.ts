import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { getBrandTokens } from '@nexor/design-system';

const bp = getBrandTokens('nexor').biteplanerContext;

export const Page = styled.main`
  min-height: 100vh;
  min-height: 100svh;
  background:
    linear-gradient(120deg, rgba(250, 250, 250, 0.96) 0%, rgba(250, 250, 250, 0.84) 54%, rgba(240, 248, 243, 0.96) 100%),
    repeating-linear-gradient(90deg, rgba(23, 23, 23, 0.04) 0 1px, transparent 1px 88px);
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Hero = styled.section`
  width: min(100%, ${({ theme }) => theme.maxWidth});
  margin: 0 auto;
  padding: 150px 48px 56px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 420px);
  gap: 56px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 124px 24px 42px;
    gap: 32px;
  }
`;

export const HeroCopy = styled.div`
  max-width: 760px;
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
  max-width: 760px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(48px, 7vw, 88px);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 0.92;
  text-transform: uppercase;

  @media (max-width: 640px) {
    font-size: clamp(40px, 12vw, 58px);
    line-height: 0.98;
  }
`;

export const Lead = styled.p`
  max-width: 650px;
  margin: 28px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(18px, 2vw, 24px);
  line-height: 1.48;
`;

export const Actions = styled.div`
  margin-top: 36px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
`;

export const PrimaryCta = styled(Link)`
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 24px;
  border-radius: 4px;
  background: ${bp.accentStrong};
  color: #ffffff;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0;
  text-decoration: none;
  text-transform: uppercase;
  box-shadow: 0 18px 40px rgba(28, 94, 58, 0.22);
  transition: transform 180ms ease, box-shadow 180ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 48px rgba(28, 94, 58, 0.28);
  }
`;

export const SecondaryCta = styled(Link)`
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 22px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.72);
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0;
  text-decoration: none;
  text-transform: uppercase;
`;

export const ProductPanel = styled.aside`
  min-height: 390px;
  display: grid;
  align-content: end;
  gap: 18px;
  padding: 34px;
  border: 1px solid rgba(28, 94, 58, 0.18);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.92)),
    linear-gradient(135deg, rgba(205, 252, 221, 0.78), rgba(255, 255, 255, 0.9) 58%, rgba(23, 23, 23, 0.08));
  box-shadow: 0 28px 70px rgba(23, 23, 23, 0.1);

  @media (max-width: 900px) {
    min-height: 260px;
  }
`;

export const ProductMark = styled.div`
  width: 92px;
  height: 92px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #ffffff;
  color: ${bp.accentStrong};
  box-shadow: 0 18px 42px rgba(28, 94, 58, 0.14);
`;

export const ProductName = styled.h2`
  margin: 0;
  color: ${bp.accentStrong};
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1;
`;

export const ProductText = styled.p`
  max-width: 310px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  line-height: 1.64;
`;

export const HighlightGrid = styled.section`
  width: min(100%, ${({ theme }) => theme.maxWidth});
  margin: 0 auto;
  padding: 0 48px 78px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    padding: 0 24px 56px;
  }
`;

export const HighlightCard = styled.article`
  min-height: 210px;
  padding: 28px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 18px 48px rgba(23, 23, 23, 0.06);

  svg {
    color: ${bp.accentStrong};
  }
`;

export const HighlightTitle = styled.h3`
  margin: 24px 0 12px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 17px;
  font-weight: 900;
  line-height: 1.2;
`;

export const HighlightBody = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.64;
`;
