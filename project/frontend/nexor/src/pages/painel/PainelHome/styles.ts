import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getBrandTokens } from '@nexor/design-system';

const bp = getBrandTokens('nexor').biteplanerContext;

export const Page = styled.div`
  width: min(100%, 1360px);
  display: grid;
  gap: 26px;
`;

export const PageHeader = styled.header`
  display: grid;
  gap: 8px;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const HeaderIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  color: #15803d;
  background: rgba(21, 128, 61, 0.1);
`;

export const PageTitle = styled.h1`
  font-size: clamp(1.45rem, 2.1vw, 1.85rem);
  font-weight: 800;
  letter-spacing: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

export const PageSubtitle = styled.p`
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

export const Section = styled.section`
  display: grid;
  gap: 16px;
`;

export const AccountSection = styled.section`
  display: grid;
`;

export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

export const AccountCard = styled.div`
  min-height: 104px;
  padding: 24px 28px;
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(23, 23, 23, 0.06);
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 24px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const AccountField = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
`;

export const AccountIcon = styled.span`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  color: #15803d;
  background: rgba(21, 128, 61, 0.1);
`;

export const AccountText = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

export const FieldLabel = styled.p`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

export const FieldValue = styled.p`
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

export const StatusValue = styled(FieldValue)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

export const StatusDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #16a34a;
`;

export const ProductHero = styled.div<{ $backgroundImage: string }>`
  position: relative;
  min-height: 410px;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid rgba(12, 75, 47, 0.5);
  background:
    linear-gradient(90deg, rgba(1, 37, 29, 0.96) 0%, rgba(1, 37, 29, 0.82) 46%, rgba(1, 37, 29, 0.16) 72%, rgba(1, 37, 29, 0) 100%),
    url(${({ $backgroundImage }) => $backgroundImage}) right 100px center / min(32vw, 400px) auto no-repeat,
    radial-gradient(circle at 78% 45%, rgba(34, 197, 94, 0.32), transparent 30%),
    linear-gradient(135deg, #042d22 0%, #06462f 52%, #01251d 100%);
  color: #ffffff;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(90deg, rgba(1, 37, 29, 0) 0%, rgba(56, 189, 124, 0.14) 56%, rgba(56, 189, 124, 0.42) 82%, rgba(1, 37, 29, 0) 100%);
    mask-image: linear-gradient(180deg, transparent 8%, #000 45%, transparent 86%);
    opacity: 0.55;
  }

  @media (max-width: 980px) {
    background:
      linear-gradient(90deg, rgba(1, 37, 29, 0.98) 0%, rgba(1, 37, 29, 0.9) 58%, rgba(1, 37, 29, 0.48) 100%),
      url(${({ $backgroundImage }) => $backgroundImage}) right 12px center / min(42vw, 300px) auto no-repeat,
      radial-gradient(circle at 78% 45%, rgba(34, 197, 94, 0.24), transparent 30%),
      linear-gradient(135deg, #042d22 0%, #06462f 52%, #01251d 100%);
  }

  @media (max-width: 640px) {
    background:
      linear-gradient(135deg, rgba(4, 45, 34, 0.98) 0%, rgba(6, 70, 47, 0.94) 100%),
      radial-gradient(circle at 84% 84%, rgba(34, 197, 94, 0.18), transparent 34%),
      linear-gradient(135deg, #042d22 0%, #06462f 52%, #01251d 100%);
  }
`;

export const ProductHeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 540px;
  padding: clamp(28px, 5vw, 50px);
  display: grid;
  gap: 22px;
  align-content: center;
`;

export const ProductIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  border: 1px solid rgba(74, 222, 128, 0.24);
  background: rgba(0, 0, 0, 0.18);
  color: #4ade80;
  box-shadow: inset 0 0 24px rgba(74, 222, 128, 0.12);
`;

export const ProductTitle = styled.h3`
  margin: 0;
  color: #ffffff;
  font-size: clamp(2.3rem, 4vw, 3.55rem);
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0;
`;

export const ProductDescription = styled.p`
  max-width: 520px;
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  font-size: clamp(1rem, 1.45vw, 1.22rem);
  line-height: 1.55;
  font-weight: 520;
`;

export const ProductStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  max-width: 520px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const ProductStat = styled.div`
  min-height: 74px;
  padding: 16px 18px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 7px;
`;

export const BpRowLabel = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

export const BpStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #22c55e;
  }
`;

export const BpPrice = styled.span`
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
`;

export const HeroButton = styled.button`
  width: min(100%, 520px);
  min-height: 62px;
  padding: 0 26px;
  border: 1px solid rgba(74, 222, 128, 0.38);
  border-radius: 8px;
  background: linear-gradient(135deg, ${bp.accentSupport}, #16a34a);
  color: #ffffff;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(22, 163, 74, 0.28);

  &:hover:not(:disabled) {
    filter: brightness(1.05);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    filter: saturate(0.5);
  }
`;

export const BpSecondaryLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px 34px;
  align-items: center;
`;

export const BpLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
  text-decoration: none;

  &:hover {
    color: #ffffff;
    text-decoration: underline;
  }
`;

export const RoleActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1120px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

export const RoleActionCard = styled.article<{ $disabled?: boolean }>`
  min-height: 204px;
  padding: 22px 20px 20px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 10px;
  background: ${({ $disabled, theme }) => ($disabled ? theme.colors.bgInset : theme.colors.bgElevated)};
  box-shadow: ${({ $disabled }) => ($disabled ? 'none' : '0 14px 34px rgba(23, 23, 23, 0.05)')};
  display: grid;
  grid-template-rows: auto auto 1fr auto auto;
  gap: 10px;
  opacity: ${({ $disabled }) => ($disabled ? 0.58 : 1)};
  filter: ${({ $disabled }) => ($disabled ? 'saturate(0.55)' : 'none')};
`;

export const RoleCardIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.bgInset};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const RoleActionTitle = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  line-height: 1.28;
  font-weight: 800;
`;

export const RoleActionMeta = styled.span`
  font-size: 14px;
  line-height: 1.48;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const RoleStatusPill = styled.span<{ $tone?: 'success' | 'warning' | 'neutral' }>`
  width: fit-content;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ $tone, theme }) => ($tone === 'success' ? '#166534' : theme.colors.textSecondary)};
  background: ${({ $tone, theme }) => ($tone === 'success' ? 'rgba(22, 101, 52, 0.08)' : theme.colors.bgInset)};
  border: 1px solid ${({ $tone, theme }) => ($tone === 'success' ? 'rgba(22, 101, 52, 0.2)' : theme.colors.borderDefault)};
`;

export const RoleActionButton = styled.button`
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.textPrimary};
    color: ${({ theme }) => theme.colors.bgElevated};
  }

  &:disabled {
    cursor: default;
    color: ${({ theme }) => theme.colors.textSecondary};
    background: ${({ theme }) => theme.colors.bgInset};
  }
`;

export const SecurityBanner = styled.aside`
  min-height: 70px;
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid rgba(21, 128, 61, 0.1);
  background: linear-gradient(90deg, rgba(21, 128, 61, 0.08), rgba(21, 128, 61, 0.03));
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const SecurityIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  color: #15803d;
  background: rgba(21, 128, 61, 0.1);
`;

export const SecurityTitle = styled.strong`
  display: block;
  color: #14532d;
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 3px;
`;

export const SecurityText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.45;
`;

export const DemoBanner = styled.div`
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  display: grid;
  gap: 6px;
`;

export const DemoBannerTitle = styled.strong`
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const DemoBannerText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.5;
`;
