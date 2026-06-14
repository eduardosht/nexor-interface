import styled from 'styled-components';

export const PortalPageTitle = styled.h1<{ $size?: 'default' | 'showcase' }>`
  margin: 0;
  max-width: 760px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ $size = 'default' }) =>
    $size === 'showcase' ? 'clamp(2.25rem, 5vw, 4rem)' : 'clamp(1.25rem, 2vw, 1.75rem)'};
  line-height: ${({ $size = 'default' }) => ($size === 'showcase' ? '0.98' : '1.08')};
  font-weight: 800;
  letter-spacing: 0;

  ${({ $size = 'default' }) =>
    $size === 'showcase'
      ? `
        @media (max-width: 1280px) {
          font-size: clamp(1.8rem, 3vw, 2.4rem);
        }
      `
      : ''}
`;

export const PortalPageDescription = styled.p<{ $size?: 'default' | 'showcase' }>`
  max-width: 760px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ $size = 'default' }) => ($size === 'showcase' ? 'clamp(1rem, 1.4vw, 1.18rem)' : '14px')};
  line-height: ${({ $size = 'default' }) => ($size === 'showcase' ? '1.75' : '1.5')};

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 700;
  }

  ${({ $size = 'default' }) =>
    $size === 'showcase'
      ? `
        @media (max-width: 1280px) {
          font-size: 14px;
        }
      `
      : ''}
`;

export const PortalSectionTitle = styled.h2<{ $size?: 'sm' | 'md' | 'lg' }>`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ $size = 'md' }) => ($size === 'lg' ? '1.25rem' : $size === 'sm' ? '16px' : '18px')};
  font-weight: ${({ $size = 'md' }) => ($size === 'lg' ? 700 : 800)};
  line-height: 1.25;

  @media (max-width: 768px) {
    font-size: ${({ $size = 'md' }) => ($size === 'lg' ? '1.0625rem' : $size === 'sm' ? '15px' : '16px')};
    font-weight: ${({ $size = 'md' }) => ($size === 'lg' ? 650 : 800)};
  }
`;

export const PortalSectionDescription = styled.p<{ $size?: 'sm' | 'md' }>`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ $size = 'md' }) => ($size === 'sm' ? '13px' : '14px')};
  line-height: ${({ $size = 'md' }) => ($size === 'sm' ? '1.6' : '1.65')};

  @media (max-width: 768px) {
    font-size: 12px;
    line-height: 1.5;
  }
`;

export const PortalCardTitle = styled.h3<{ $size?: 'sm' | 'md' }>`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ $size = 'md' }) => ($size === 'sm' ? '14px' : '16px')};
  font-weight: ${({ $size = 'md' }) => ($size === 'sm' ? 700 : 800)};
  line-height: 1.3;
`;

export const PortalCardText = styled.p<{ $size?: 'sm' | 'md' }>`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ $size = 'md' }) => ($size === 'sm' ? '12px' : '13px')};
  line-height: ${({ $size = 'md' }) => ($size === 'sm' ? '1.5' : '1.6')};
`;

export const PortalMetaLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const PortalModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
  font-weight: 800;
`;

export const PortalModalDescription = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.6;
`;
