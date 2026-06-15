import styled, { css } from 'styled-components';
import { getBrandTokens } from '@nexor/design-system';

const bp = getBrandTokens('nexor').biteplanerContext;

type Tone = 'dark' | 'light';

const toneColor = {
  dark: {
    title: '#07101d',
    lead: '#465164',
    body: '#465164',
  },
  light: {
    title: '#ffffff',
    lead: 'rgba(255, 255, 255, 0.94)',
    body: 'rgba(255, 255, 255, 0.82)',
  },
};

export const MarketingEyebrow = styled.p<{ $tone?: Tone }>`
  margin: 0 0 16px;
  font-family: ${({ theme }) => theme.fonts.display};
  color: ${({ $tone = 'dark' }) => ($tone === 'light' ? '#57d36d' : bp.accentStrong)};
  font-size: 11px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
`;

export const MarketingSectionTitle = styled.h2<{ $size?: 'default' | 'feature'; $tone?: Tone }>`
  max-width: ${({ $size = 'default' }) => ($size === 'feature' ? '820px' : 'none')};
  margin: ${({ $size = 'default' }) => ($size === 'feature' ? '26px 0 0' : '0')};
  color: ${({ $tone = 'dark' }) => toneColor[$tone].title};
  font-size: clamp(3rem, 3.5vw, 5rem);
  line-height: ${({ $size = 'default' }) => ($size === 'feature' ? '1.04' : '1')};
  font-weight: ${({ $size = 'default' }) => ($size === 'feature' ? 900 : 950)};
  letter-spacing: 0;
  text-transform: uppercase;

  span {
    color: ${bp.accentStrong};
  }

  @media (max-width: 640px) {
    font-size: clamp(2.25rem, 10vw, 3rem);
    line-height: 1.08;
  }
`;

export const MarketingTitleAccent = styled.span`
  color: ${bp.accentStrong};
`;

export const MarketingSectionLead = styled.p<{ $size?: 'default' | 'feature'; $tone?: Tone }>`
  max-width: ${({ $size = 'default' }) => ($size === 'feature' ? '690px' : '720px')};
  margin: ${({ $size = 'default' }) => ($size === 'feature' ? '24px 0 0' : '22px 0 0')};
  color: ${({ $tone = 'dark' }) => toneColor[$tone].lead};
  font-size: ${({ $size = 'default' }) => ($size === 'feature' ? 'clamp(15px, 1.25vw, 18px)' : '15px')};
  line-height: ${({ $size = 'default' }) => ($size === 'feature' ? '1.68' : '1.75')};

  @media (max-width: 900px) {
    font-size: 15px;
  }
`;

export const MarketingCardTitle = styled.h3<{ $tone?: Tone; $size?: 'sm' | 'md' | 'lg' }>`
  margin: 0 0 10px;
  color: ${({ $tone = 'dark' }) => toneColor[$tone].title};
  font-size: ${({ $size = 'md' }) =>
    $size === 'lg' ? 'clamp(20px, 2vw, 25px)' : $size === 'sm' ? '17px' : 'clamp(17px, 1.28vw, 22px)'};
  line-height: ${({ $size = 'md' }) => ($size === 'lg' ? '1.12' : '1.2')};
  font-weight: 900;
  letter-spacing: 0;
`;

export const MarketingBodyText = styled.p<{ $tone?: Tone; $compact?: boolean }>`
  margin: 0;
  color: ${({ $tone = 'dark' }) => toneColor[$tone].body};
  font-size: ${({ $compact = false }) => ($compact ? '14px' : '15px')};
  line-height: ${({ $compact = false }) => ($compact ? '1.62' : '1.72')};
`;

export const marketingLightBody = css`
  color: rgba(255, 255, 255, 0.82);
`;
