import styled, { css, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  biteplanerButtonHoverStyles,
  biteplanerButtonSurfaceStyles,
  biteplanerFormButtonStyles,
} from '../styles/biteplanerFormButton';

type WorkspaceHeroMode = 'user' | 'partner' | 'dentist' | 'lab' | 'admin';

const workspaceHeroBackground = (mode: WorkspaceHeroMode | undefined, fallback: string) => {
  switch (mode) {
    case 'partner':
      return `radial-gradient(circle at 88% 16%, rgba(34, 197, 94, 0.18), transparent 31%),
    radial-gradient(circle at 7% 12%, rgba(20, 184, 166, 0.13), transparent 28%),
    linear-gradient(135deg, rgba(250, 253, 251, 0.99) 0%, rgba(239, 253, 246, 0.94) 58%, rgba(236, 253, 245, 0.92) 100%),
    ${fallback}`;
    case 'dentist':
      return `radial-gradient(circle at 88% 16%, rgba(14, 165, 233, 0.18), transparent 31%),
    radial-gradient(circle at 7% 12%, rgba(45, 212, 191, 0.13), transparent 28%),
    linear-gradient(135deg, rgba(250, 253, 255, 0.99) 0%, rgba(239, 250, 255, 0.94) 58%, rgba(236, 254, 255, 0.9) 100%),
    ${fallback}`;
    case 'lab':
      return `radial-gradient(circle at 88% 16%, rgba(124, 58, 237, 0.16), transparent 31%),
    radial-gradient(circle at 7% 12%, rgba(59, 130, 246, 0.12), transparent 28%),
    linear-gradient(135deg, rgba(252, 251, 255, 0.99) 0%, rgba(245, 243, 255, 0.94) 58%, rgba(239, 246, 255, 0.9) 100%),
    ${fallback}`;
    default:
      return `radial-gradient(circle at 92% 18%, rgba(245, 158, 11, 0.2), transparent 30%),
    radial-gradient(circle at 6% 14%, rgba(59, 130, 246, 0.12), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.94) 58%, rgba(255, 247, 237, 0.92) 100%),
    ${fallback}`;
  }
};

const workspaceHeroAccent = (mode: WorkspaceHeroMode | undefined) => {
  switch (mode) {
    case 'partner':
      return '#16a34a';
    case 'dentist':
      return '#0891b2';
    case 'lab':
      return '#7c3aed';
    default:
      return '#f59e0b';
  }
};

export const Page = styled.div`
  display: grid;
  gap: 24px;
`;

export const RoleTabs = styled.nav`
  display: flex;
  align-items: center;
  gap: 22px;
  min-width: 0;
  padding-bottom: 1px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
  overflow-x: auto;
`;

export const RoleTabButton = styled.button<{ $active: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 48px;
  padding: 0 0 14px;
  border: 0;
  background: transparent;
  color: ${({ $active, theme }) => ($active ? '#6d3df5' : theme.colors.textSecondary)};
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  transition: color 160ms ease;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 3px;
    border-radius: 999px 999px 0 0;
    background: ${({ $active }) => ($active ? '#6d3df5' : 'transparent')};
  }

  &:hover {
    color: ${({ $active, theme }) => ($active ? '#6d3df5' : theme.colors.textPrimary)};
  }
`;

export const Hero = styled.section<{ $showcase?: boolean; $mode?: WorkspaceHeroMode }>`
  display: grid;
  grid-template-columns: ${({ $showcase }) => ($showcase ? 'minmax(0, 1fr) minmax(320px, 0.9fr)' : '1fr')};
  align-items: ${({ $showcase }) => ($showcase ? 'center' : 'stretch')};
  gap: ${({ $showcase }) => ($showcase ? '28px' : '10px')};
  min-height: ${({ $showcase }) => ($showcase ? '260px' : 'auto')};
  padding: ${({ $showcase }) => ($showcase ? '38px 46px' : '24px')};
  border-radius: ${({ $showcase }) => ($showcase ? '18px' : '16px')};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ $showcase, $mode, theme }) =>
    $showcase
      ? workspaceHeroBackground($mode, theme.colors.bgElevated)
      : theme.colors.bgElevated};
  box-shadow: ${({ $showcase }) => ($showcase ? '0 18px 48px rgba(15, 23, 42, 0.07)' : 'none')};
  overflow: hidden;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: ${({ $showcase }) => ($showcase ? '28px' : '24px')};
  }
`;

export const HeroCopy = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
`;

export const Eyebrow = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Title = styled.h1<{ $showcase?: boolean }>`
  margin: 0;
  font-size: ${({ $showcase }) => ($showcase ? 'clamp(2.25rem, 5vw, 4rem)' : 'clamp(1.8rem, 3vw, 2.4rem)')};
  font-weight: 800;
  letter-spacing: 0;
  line-height: ${({ $showcase }) => ($showcase ? '0.98' : '1.1')};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Description = styled.p<{ $showcase?: boolean }>`
  margin: 0;
  max-width: 760px;
  font-size: ${({ $showcase }) => ($showcase ? 'clamp(1rem, 1.4vw, 1.18rem)' : '14px')};
  line-height: ${({ $showcase }) => ($showcase ? '1.75' : '1.6')};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const HeroVisual = styled.div`
  position: relative;
  min-height: 190px;

  @media (max-width: 720px) {
    display: none;
  }
`;

export const HeroBrowser = styled.div`
  position: absolute;
  inset: 0 0 0 24px;
  border-radius: 16px 16px 0 0;
  border: 1px solid rgba(148, 163, 184, 0.42);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 22px 42px rgba(15, 23, 42, 0.1);
  overflow: hidden;
`;

export const HeroBrowserChrome = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);

  span {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #f59e0b;
  }

  span:nth-child(2) {
    background: #fbbf24;
  }

  span:nth-child(3) {
    background: #d1d5db;
  }
`;

export const HeroBrowserBody = styled.div`
  position: relative;
  height: calc(100% - 34px);
  background:
    linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px) 0 0 / 33.3% 100%,
    linear-gradient(180deg, rgba(15, 23, 42, 0.04), transparent 44%);

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 12%;
    width: 72px;
    height: 10px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.08);
  }

  &::before {
    top: 20px;
  }

  &::after {
    top: 46px;
    width: 48px;
  }
`;

export const HeroChartLine = styled.span`
  position: absolute;
  left: 13%;
  right: 8%;
  top: 48%;
  height: 54px;
  border-top: 2px solid rgba(15, 23, 42, 0.32);
  transform: skewY(-16deg);
`;

export const HeroChartPoint = styled.span<{ $left: string; $top: string; $active?: boolean; $mode?: WorkspaceHeroMode }>`
  position: absolute;
  left: ${({ $left }) => $left};
  top: ${({ $top }) => $top};
  width: ${({ $active }) => ($active ? '34px' : '10px')};
  height: ${({ $active }) => ($active ? '34px' : '10px')};
  border-radius: 999px;
  border: ${({ $active, $mode }) => ($active ? `8px solid ${workspaceHeroAccent($mode)}66` : '2px solid rgba(15, 23, 42, 0.66)')};
  background: ${({ $active, $mode }) => ($active ? workspaceHeroAccent($mode) : 'rgba(255, 255, 255, 0.96)')};
  transform: translate(-50%, -50%);
  box-shadow: ${({ $active, $mode }) => ($active ? `0 0 0 4px ${workspaceHeroAccent($mode)}24` : 'none')};
`;

export const HeroFloatingCard = styled.div`
  position: absolute;
  left: -8px;
  top: 62px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 230px;
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.12);
  color: ${({ theme }) => theme.colors.textPrimary};

  span {
    display: grid;
    gap: 4px;
    font-size: 13px;
    font-weight: 800;
  }

  strong {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const HeroFloatingIcon = styled.span<{ $mode?: WorkspaceHeroMode; $tone?: 'success' | 'warning' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: ${({ $tone, $mode }) =>
    $tone === 'warning'
      ? 'rgba(245, 158, 11, 0.14)'
      : $tone === 'neutral'
        ? 'rgba(148, 163, 184, 0.16)'
        : `${workspaceHeroAccent($mode)}18`};
  color: ${({ $tone, $mode }) =>
    $tone === 'warning' ? '#d18a00' : $tone === 'neutral' ? '#64748b' : workspaceHeroAccent($mode)};
`;

export const PartnerHeroVisual = styled.div`
  position: relative;
  min-height: 190px;

  @media (max-width: 720px) {
    display: none;
  }
`;

export const PartnerHeroBrowser = styled.div`
  position: absolute;
  top: 0;
  right: 70px;
  width: min(360px, 82%);
  height: 192px;
  border-radius: 16px 16px 0 0;
  border: 1px solid rgba(148, 163, 184, 0.38);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.1);
  overflow: hidden;
`;

export const PartnerHeroBrowserBody = styled.div`
  position: relative;
  display: grid;
  align-content: start;
  gap: 12px;
  height: calc(100% - 34px);
  padding: 28px 42px 0;
  background:
    linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px) 0 0 / 50% 100%,
    linear-gradient(180deg, rgba(248, 250, 252, 0.88), rgba(255, 255, 255, 0.94));
`;

export const PartnerHeroLine = styled.span<{ $width: string }>`
  display: block;
  width: ${({ $width }) => $width};
  height: 9px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
`;

export const PartnerHeroSuccess = styled.span`
  position: absolute;
  top: 34px;
  right: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #2ca36a;
  color: #ffffff;
  box-shadow: 0 0 0 8px rgba(44, 163, 106, 0.12);
`;

export const PartnerHeroLinkBadge = styled.span`
  position: absolute;
  left: 18px;
  top: 76px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 74px;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.86);
  background: rgba(239, 246, 255, 0.94);
  color: #3b82f6;
  box-shadow: 0 18px 34px rgba(59, 130, 246, 0.14);
`;

export const PartnerHeroBars = styled.span`
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  width: 100px;
  height: 82px;
  padding: 18px 18px 12px;
  border-radius: 24px 0 16px 0;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);

  span {
    display: block;
    width: 14px;
    border-radius: 5px 5px 2px 2px;
    background: #cbd5e1;
  }

  span:nth-child(1) {
    height: 22px;
  }

  span:nth-child(2) {
    height: 38px;
  }

  span:nth-child(3) {
    height: 58px;
    background: #2ca36a;
  }
`;

export const PartnerHeroArrow = styled.span`
  position: absolute;
  right: 58px;
  top: 70px;
  width: 86px;
  height: 42px;
  border-top: 2px dashed rgba(71, 85, 105, 0.38);
  border-radius: 80% 60% 0 0;
  transform: rotate(-8deg);

  &::after {
    content: '';
    position: absolute;
    right: -2px;
    top: -5px;
    width: 8px;
    height: 8px;
    border-top: 2px solid rgba(71, 85, 105, 0.46);
    border-right: 2px solid rgba(71, 85, 105, 0.46);
    transform: rotate(28deg);
  }
`;

export const ReferralHero = styled.section`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.9fr);
  align-items: center;
  gap: 28px;
  min-height: 188px;
  padding: 32px 40px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background:
    radial-gradient(circle at 90% 12%, rgba(59, 130, 246, 0.12), transparent 26%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.94) 68%, rgba(255, 255, 255, 0.96) 100%),
    ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
  overflow: hidden;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 28px;
  }
`;

export const ReferralHeroVisual = styled.div`
  position: relative;
  min-height: 150px;

  @media (max-width: 720px) {
    display: none;
  }
`;

export const ReferralHeroBrowser = styled.div`
  position: absolute;
  top: -12px;
  right: 50px;
  width: min(360px, 82%);
  height: 164px;
  border-radius: 14px 14px 0 0;
  border: 1px solid rgba(148, 163, 184, 0.34);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 22px 44px rgba(15, 23, 42, 0.1);
  overflow: hidden;
`;

export const ReferralHeroBrowserBody = styled.div`
  position: relative;
  display: grid;
  align-content: start;
  gap: 10px;
  height: calc(100% - 34px);
  padding: 24px 110px 0 28px;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.88), rgba(255, 255, 255, 0.94));
`;

export const ReferralHeroLinkBadge = styled.span`
  position: absolute;
  left: 30px;
  top: 56px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 14px;
  border: 1px solid rgba(229, 231, 235, 0.86);
  background: rgba(239, 246, 255, 0.96);
  color: #3b82f6;
  box-shadow: 0 18px 34px rgba(59, 130, 246, 0.14);
`;

export const ReferralHeroSuccess = styled.span`
  position: absolute;
  top: 36px;
  right: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(240, 253, 244, 0.96);
  color: #16a34a;
  box-shadow: 0 16px 28px rgba(22, 163, 74, 0.12);

  svg {
    width: 28px;
    height: 28px;
    padding: 5px;
    border-radius: 999px;
    background: #22c55e;
    color: #ffffff;
  }
`;

export const ReferralHeroBars = styled.span`
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  gap: 9px;
  width: 98px;
  height: 80px;
  padding: 20px 18px 14px;
  border-radius: 16px 0 14px 14px;
  border: 1px solid rgba(229, 231, 235, 0.76);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);

  span {
    display: block;
    width: 14px;
    border-radius: 5px 5px 2px 2px;
  }

  span:nth-child(1) {
    height: 22px;
    background: #bbf7d0;
  }

  span:nth-child(2) {
    height: 38px;
    background: #7dd3fc;
  }

  span:nth-child(3) {
    height: 56px;
    background: #818cf8;
  }
`;

export const Banner = styled.div`
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.6;
`;

const skeletonPulse = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
`;

export const DentistWorkspaceSkeleton = styled.section`
  display: grid;
  gap: 14px;
`;

export const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`;

export const SkeletonCard = styled.div`
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const SkeletonTable = styled(SkeletonCard)`
  gap: 12px;
`;

export const SkeletonLine = styled.span<{ $width?: string }>`
  width: ${({ $width }) => $width ?? '100%'};
  height: 12px;
  border-radius: 6px;
  background: ${({ theme }) =>
    `linear-gradient(90deg, ${theme.colors.bgBase} 0%, ${theme.colors.bgElevated} 42%, ${theme.colors.bgBase} 78%)`};
  background-size: 240% 100%;
  animation: ${skeletonPulse} 1.2s ease-in-out infinite;
`;

export const SkeletonBlock = styled.span<{ $height?: string }>`
  width: 100%;
  height: ${({ $height }) => $height ?? '24px'};
  border-radius: 8px;
  background: ${({ theme }) =>
    `linear-gradient(90deg, ${theme.colors.bgBase} 0%, ${theme.colors.bgElevated} 42%, ${theme.colors.bgBase} 78%)`};
  background-size: 240% 100%;
  animation: ${skeletonPulse} 1.2s ease-in-out infinite;
`;

export const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`;

type AthleteTone = 'blue' | 'amber' | 'green';
type PartnerTone = 'blue' | 'green' | 'purple';
type OperationalTone = 'purple' | 'amber' | 'blue';

const athleteTone = {
  blue: {
    bg: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(59, 130, 246, 0.06))',
    color: '#2563eb',
    halo: 'rgba(59, 130, 246, 0.12)'
  },
  amber: {
    bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(245, 158, 11, 0.06))',
    color: '#d18a00',
    halo: 'rgba(245, 158, 11, 0.14)'
  },
  green: {
    bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.14), rgba(34, 197, 94, 0.05))',
    color: '#16a34a',
    halo: 'rgba(34, 197, 94, 0.12)'
  }
} satisfies Record<AthleteTone, { bg: string; color: string; halo: string }>;

const partnerTone = {
  blue: {
    bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.14), rgba(79, 70, 229, 0.07))',
    color: '#3b82f6',
    halo: 'rgba(59, 130, 246, 0.08)'
  },
  green: {
    bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.06))',
    color: '#1f9d66',
    halo: 'rgba(34, 197, 94, 0.08)'
  },
  purple: {
    bg: 'linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(124, 58, 237, 0.06))',
    color: '#7c3aed',
    halo: 'rgba(124, 58, 237, 0.08)'
  }
} satisfies Record<PartnerTone, { bg: string; color: string; halo: string }>;

const operationalTone = {
  purple: {
    bg: 'linear-gradient(135deg, rgba(109, 61, 245, 0.14), rgba(109, 61, 245, 0.06))',
    color: '#6d3df5',
    halo: 'rgba(109, 61, 245, 0.08)'
  },
  amber: {
    bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(245, 158, 11, 0.06))',
    color: '#d18a00',
    halo: 'rgba(245, 158, 11, 0.1)'
  },
  blue: {
    bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.06))',
    color: '#2784d6',
    halo: 'rgba(59, 130, 246, 0.1)'
  }
} satisfies Record<OperationalTone, { bg: string; color: string; halo: string }>;

const compactStatCard = css`
  @media (max-width: 1280px) {
    grid-template-columns: auto minmax(0, 1fr);
    align-items: flex-start;
    gap: 12px;
    min-height: auto;
    padding: 16px;
    border-radius: 12px;
  }
`;

const compactStatIcon = css`
  @media (max-width: 1280px) {
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    align-self: flex-start;
    border-radius: 8px;
    box-shadow: none;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

export const AthleteStatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const AthleteStatCard = styled.article<{ $tone: AthleteTone }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  min-height: 136px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.9);
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.06);
  color: ${({ theme }) => theme.colors.textSecondary};

  ${compactStatCard}
`;

export const AthleteStatIcon = styled.span<{ $tone: AthleteTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 14px;
  background: ${({ $tone }) => athleteTone[$tone].bg};
  color: ${({ $tone }) => athleteTone[$tone].color};
  box-shadow: 0 0 0 8px ${({ $tone }) => athleteTone[$tone].halo};

  ${compactStatIcon}
`;

export const AthleteStatContent = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

export const PartnerStatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const PartnerStatCard = styled.article<{ $tone: PartnerTone }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  min-height: 136px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.92);
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.06);
  color: ${({ theme }) => theme.colors.textSecondary};

  ${compactStatCard}
`;

export const PartnerStatIcon = styled.span<{ $tone: PartnerTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 14px;
  background: ${({ $tone }) => partnerTone[$tone].bg};
  color: ${({ $tone }) => partnerTone[$tone].color};
  box-shadow: 0 0 0 8px ${({ $tone }) => partnerTone[$tone].halo};

  ${compactStatIcon}
`;

export const PartnerStatContent = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

export const OperationalStatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const OperationalStatCard = styled.article<{ $tone: OperationalTone }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
  min-height: 150px;
  padding: 28px;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.92);
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.06);
  color: ${({ theme }) => theme.colors.textSecondary};

  ${compactStatCard}
`;

export const OperationalStatIcon = styled.span<{ $tone: OperationalTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 74px;
  border-radius: 14px;
  background: ${({ $tone }) => operationalTone[$tone].bg};
  color: ${({ $tone }) => operationalTone[$tone].color};
  box-shadow: 0 0 0 8px ${({ $tone }) => operationalTone[$tone].halo};

  ${compactStatIcon}
`;

export const OperationalStatContent = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`;

export const PartnerDashboardGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.8fr);
  gap: 18px;
  align-items: stretch;

  @media (max-width: 1400px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const PartnerChartPanel = styled.section`
  display: grid;
  gap: 22px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);
`;

export const PartnerChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
`;

export const PartnerPanelTitleGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;

  span {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
`;

export const PartnerPanelIcon = styled.span<{ $tone: 'blue' | 'purple' | 'green' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex: 0 0 auto;
  background: ${({ $tone }) =>
    $tone === 'blue'
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.13), rgba(59, 130, 246, 0.05))'
      : $tone === 'green'
        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.14), rgba(34, 197, 94, 0.05))'
      : 'linear-gradient(135deg, rgba(124, 58, 237, 0.13), rgba(124, 58, 237, 0.05))'};
  color: ${({ $tone }) => ($tone === 'blue' ? '#3b82f6' : $tone === 'green' ? '#16a34a' : '#7c3aed')};
`;

export const PartnerPeriodControl = styled.div`
  display: inline-grid;
  grid-template-columns: repeat(4, auto);
  gap: 4px;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const PartnerPeriodButton = styled.button<{ $active: boolean }>`
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 4px;
  background: ${({ $active, theme }) => ($active ? theme.colors.textPrimary : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.bgElevated : theme.colors.textSecondary)};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease;

  &:hover {
    color: ${({ $active, theme }) => ($active ? theme.colors.bgElevated : theme.colors.textPrimary)};
  }
`;

export const PartnerBarChart = styled.div`
  display: grid;
  gap: 14px;
  min-height: 380px;

  .recharts-wrapper,
  .recharts-surface {
    outline: none;
  }
`;

export const PartnerChartLegend = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const PartnerChartLegendItem = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  line-height: 1.35;

  span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 14px;
    font-weight: 800;
  }
`;

export const PartnerOperationPanel = styled.section`
  display: grid;
  align-content: start;
  gap: 28px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);
`;

export const PartnerActionCards = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
  }
`;

export const PartnerActionCard = styled(Link)`
  display: grid;
  align-content: start;
  gap: 16px;
  min-height: 244px;
  padding: 28px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: none;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.04);
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;

  strong {
    font-size: 18px;
    font-weight: 800;
    line-height: 1.2;
  }

  > svg:last-child {
    margin-top: auto;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.borderStrong};
    box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
  }
`;

export const PartnerActionCardPrimary = styled(PartnerActionCard)`
  border-color: #171717;
  background:
    radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.12), transparent 36%),
    linear-gradient(135deg, #111111, #242424);
  color: #ffffff;

`;

export const PartnerActionText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.55;

  ${PartnerActionCardPrimary} & {
    color: rgba(255, 255, 255, 0.84);
  }
`;

export const PartnerActionIcon = styled.span<{ $dark?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 66px;
  height: 66px;
  border-radius: 12px;
  background: ${({ $dark }) => ($dark ? 'rgba(255, 255, 255, 0.12)' : '#f5f5f5')};
  color: ${({ $dark, theme }) => ($dark ? '#ffffff' : theme.colors.textPrimary)};

  svg {
    margin: 0;
  }
`;

export const PartnerChartLegendDot = styled.span<{ $color: string }>`
  width: 9px;
  height: 9px;
  border-radius: 4px;
  background: ${({ $color }) => $color};
`;

export const PartnerBarColumn = styled.div`
  display: grid;
  grid-template-rows: auto 160px auto auto;
  gap: 8px;
  min-width: 0;

  @media (max-width: 640px) {
    grid-template-columns: 60px 1fr;
    grid-template-rows: auto auto auto;
    align-items: center;
  }
`;

export const PartnerBarValue = styled.strong`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const PartnerBarTrack = styled.div`
  display: flex;
  align-items: flex-end;
  width: 100%;
  min-height: 160px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgBase};
  overflow: hidden;

  @media (max-width: 640px) {
    grid-row: 1 / span 3;
    grid-column: 2;
    min-height: 16px;
    height: 16px;
    align-items: stretch;
  }
`;

export const PartnerBarFill = styled.div<{ $percent: number }>`
  width: 100%;
  height: ${({ $percent }) => `${Math.min(100, Math.max($percent > 0 ? 6 : 0, $percent))}%`};
  background: #171717;
  transition: height 180ms ease;

  @media (max-width: 640px) {
    width: ${({ $percent }) => `${Math.min(100, Math.max($percent > 0 ? 6 : 0, $percent))}%`};
    height: 100%;
    transition: width 180ms ease;
  }
`;

export const PartnerBarLabel = styled.span`
  min-height: 34px;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 640px) {
    grid-column: 1;
  }
`;

export const PartnerBarHint = styled.span`
  min-height: 36px;
  font-size: 12px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 640px) {
    grid-column: 1;
  }
`;

export const StatCard = styled.article`
  display: grid;
  gap: 6px;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const StatLabel = styled.span`
  display: block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StatValue = styled.strong`
  display: block;
  min-width: 0;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow-wrap: anywhere;
`;

export const StatHint = styled.span`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Panel = styled.section`
  display: grid;
  gap: 16px;
  padding: 22px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const OperationalPanel = styled.section`
  display: grid;
  gap: 24px;
  padding: 28px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);

  @media (max-width: 720px) {
    padding: 20px;
  }
`;

export const OperationalPanelHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;

  > span:last-child {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
`;

export const OperationalTableShell = styled.div`
  min-width: 0;
`;

export const ReferralPanel = styled.section`
  display: grid;
  gap: 18px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);

  @media (max-width: 720px) {
    padding: 20px;
  }
`;

export const ReferralPanelHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;

  > span:last-child {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
`;

export const ReferralForm = styled.form`
  display: grid;
  grid-template-columns: minmax(220px, 1.2fr) minmax(220px, 1fr) minmax(140px, auto);
  gap: 18px;
  align-items: end;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const ReferralField = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;

  > span {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  label {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 0 16px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.borderDefault};
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.textSecondary};
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease;

    &:focus-within {
      border-color: ${({ theme }) => theme.colors.textPrimary};
      box-shadow: 0 0 0 3px rgba(23, 23, 23, 0.08);
    }
  }

  input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.textPrimary};
    font: inherit;
    font-size: 14px;

    &::placeholder {
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

export const ReferralSubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 24px;
  border: 1px solid ${({ theme }) => theme.colors.textPrimary};
  border-radius: 8px;
  background:
    radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.12), transparent 36%),
    linear-gradient(135deg, #111111, #242424);
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(23, 23, 23, 0.14);
  transition:
    transform 160ms ease,
    opacity 160ms ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.58;
    transform: none;
  }
`;

export const PanelHeader = styled.div`
  display: grid;
  gap: 6px;
`;

export const PanelHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const PanelText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const AthleteCasePanel = styled.section`
  display: grid;
  gap: 24px;
  padding: 28px 30px;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);

  ${PanelTitle} {
    font-size: clamp(1.5rem, 2vw, 1.85rem);
  }

  ${PanelText} {
    font-size: 15px;
  }

  @media (max-width: 720px) {
    padding: 22px;
  }
`;

export const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgBase};
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
`;

export const SecondaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.bgElevated};
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
`;

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.52;
    cursor: not-allowed;
    box-shadow: none;
    filter: saturate(0.72);
  }
`;

export const PrimaryButton = styled(ActionButton)`
  min-height: 40px;
  padding: 0 16px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgBase};
  border-color: ${({ theme }) => theme.colors.textPrimary};
`;

export const TableActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const tableButtonTone = {
  neutral: {
    bg: '#ffffff',
    border: '#E0E0E0',
    color: '#171717',
    hover: '#f5f5f5'
  },
  success: {
    bg: '#ecfdf5',
    border: '#bbf7d0',
    color: '#059669',
    hover: '#d1fae5'
  },
  danger: {
    bg: '#fef2f2',
    border: '#fecaca',
    color: '#dc2626',
    hover: '#fee2e2'
  },
  warning: {
    bg: '#fffbeb',
    border: '#fde68a',
    color: '#d18a00',
    hover: '#fef3c7'
  },
  info: {
    bg: '#ecfdf5',
    border: '#d1fae5',
    color: '#059669',
    hover: '#d1fae5'
  }
} satisfies Record<string, { bg: string; border: string; color: string; hover: string }>;

export const TableIconButton = styled.button<{ $tone?: keyof typeof tableButtonTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 1px solid ${({ $tone = 'neutral' }) => tableButtonTone[$tone].border};
  background: ${({ $tone = 'neutral' }) => tableButtonTone[$tone].bg};
  color: ${({ $tone = 'neutral' }) => tableButtonTone[$tone].color};
  cursor: pointer;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease;

  &:hover {
    background: ${({ $tone = 'neutral' }) => tableButtonTone[$tone].hover};
    border-color: ${({ $tone = 'neutral' }) => tableButtonTone[$tone].color};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: ${({ theme }) => theme.colors.borderDefault};
    color: ${({ theme }) => theme.colors.textSecondary};
    box-shadow: none;
    filter: saturate(0.72);
  }
`;

export const StagePill = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  background: #e8f3ff;
  color: #0f4b85;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
`;

export const OrderCard = styled.article`
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const OrderHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
`;

export const OrderTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const OrderMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const OrderText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const AthleteOrderHighlight = styled.article`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 22px;
  padding: 24px;
  border-radius: 14px;
  border: 1px solid rgba(245, 158, 11, 0.32);
  background:
    radial-gradient(circle at 8% 0%, rgba(245, 158, 11, 0.12), transparent 32%),
    linear-gradient(135deg, rgba(255, 251, 235, 0.72), rgba(255, 255, 255, 0.94));

  ${OrderText} {
    font-size: 14px;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const AthletePendingActionsPanel = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px;
  border-radius: 14px;
  border: 1px solid rgba(21, 128, 61, 0.28);
  background:
    radial-gradient(circle at 6% 0%, rgba(21, 128, 61, 0.12), transparent 34%),
    linear-gradient(135deg, rgba(240, 253, 244, 0.9), rgba(255, 255, 255, 0.96));

  @media (max-width: 720px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const AthletePendingActionsCopy = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

export const AthletePendingActionButton = styled.button`
  ${biteplanerButtonSurfaceStyles}
  ${biteplanerButtonHoverStyles}
  flex: 0 0 auto;
  min-height: 46px;
  padding: 0 18px;

  @media (max-width: 720px) {
    width: 100%;
  }
`;

export const AthleteOrderAvatar = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  border-radius: 999px;
  background: #fef3c7;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
  font-weight: 800;
`;

export const AthleteOrderMain = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;
`;

export const AthleteOrderHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;

  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

export const EmptyState = styled.div`
  padding: 18px;
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.colors.borderDefault};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.6;
`;

export const LeadTable = styled.div``;

export const SectionStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const DentistStatusBar = styled.section`
  display: grid;
  grid-template-columns: minmax(300px, 1.35fr) minmax(220px, 0.75fr) minmax(220px, 0.9fr);
  gap: 28px;
  padding: 28px 32px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);

  @media (max-width: 1280px) {
    grid-template-columns: minmax(260px, 1fr) minmax(180px, 0.7fr) minmax(180px, 0.8fr);
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
  }

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    padding: 14px;
  }
`;

export const DentistStatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;

  @media (max-width: 1280px) {
    gap: 10px;
  }

  > span:last-child {
    display: grid;
    gap: 8px;
    min-width: 0;
  }
`;

export const DentistStatusContent = styled.div`
  display: grid;
  grid-template-rows: auto auto;
  gap: 4px;
  min-width: 0;
`;

export const DentistStatusIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(109, 61, 245, 0.14), rgba(109, 61, 245, 0.06));
  color: #6d3df5;

  ${compactStatIcon}
`;

export const DentistStatusValue = styled.strong<{ $tone?: 'success' | 'warning' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  max-width: 100%;
  color: ${({ $tone, theme }) =>
    $tone === 'success' ? '#059669' : $tone === 'warning' ? '#d18a00' : theme.colors.textPrimary};
  font-size: 22px;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

export const DentistStatusDescription = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.5;
`;

export const DentistStatusDot = styled.span<{ $tone: 'success' | 'warning' | 'neutral' }>`
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  border-radius: 999px;
  background: ${({ $tone }) =>
    $tone === 'success' ? '#16A34A' : $tone === 'warning' ? '#D18A00' : '#9CA3AF'};
  box-shadow: 0 0 0 3px
    ${({ $tone }) =>
      $tone === 'success'
        ? 'rgba(22, 163, 74, 0.14)'
        : $tone === 'warning'
          ? 'rgba(209, 138, 0, 0.16)'
          : 'rgba(156, 163, 175, 0.14)'};
`;

export const LicensingCard = styled.div`
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const CourseLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(190px, 0.32fr) minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;

  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`;

export const CourseTabs = styled.div`
  display: grid;
  align-content: start;
  gap: 8px;
`;

export const CourseTabButton = styled.button<{ $active: boolean }>`
  display: grid;
  gap: 5px;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.textPrimary : theme.colors.borderDefault)};
  background: ${({ theme, $active }) => ($active ? theme.colors.bgElevated : theme.colors.bgBase)};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: left;
  cursor: pointer;

  span {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  strong {
    font-size: 13px;
    line-height: 1.35;
  }
`;

export const CourseCompletionMark = styled.small`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  width: fit-content;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #15803d;

  svg {
    width: 18px;
    height: 18px;
    padding: 2px;
    border-radius: 999px;
    background: #dcfce7;
    color: #15803d;
  }
`;

export const CourseContentPanel = styled.div`
  display: grid;
  gap: 14px;
  min-width: 0;
`;

export const VideoFrame = styled.div`
  display: grid;
  place-items: center;
  gap: 8px;
  min-height: 240px;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background:
    linear-gradient(135deg, rgba(23, 23, 23, 0.88), rgba(23, 23, 23, 0.72)),
    ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgBase};
  text-align: center;

  strong {
    font-size: 16px;
  }

  span {
    max-width: 360px;
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.72);
  }
`;

export const CourseTextBlock = styled.div`
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const StudyMaterialBox = styled.div`
  max-height: 168px;
  overflow: auto;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const ContractBox = styled.div`
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textPrimary};

  input {
    margin-top: 2px;
  }
`;

export const LockedNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const LockedIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 8px;
  color: #92400e;
  background: #fffbeb;
`;

const celebrationFloat = keyframes`
  0% {
    transform: translateY(0) rotate(-8deg) scale(1);
  }
  50% {
    transform: translateY(-4px) rotate(8deg) scale(1.04);
  }
  100% {
    transform: translateY(0) rotate(-8deg) scale(1);
  }
`;

export const CelebrationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  @media (max-width: 640px) {
    align-items: flex-start;
  }
`;

export const CelebrationIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  border-radius: 12px;
  color: #15803d;
  background: #ecfdf5;
  animation: ${celebrationFloat} 1.8s ease-in-out infinite;
`;

export const SectionHeading = styled.div`
  display: grid;
  gap: 4px;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const SectionDescription = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const InlineForm = styled.form`
  display: grid;
  grid-template-columns: minmax(220px, 1.2fr) minmax(220px, 1fr) auto;
  gap: 12px;
  align-items: end;
  ${biteplanerFormButtonStyles}

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const IconActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:disabled {
    opacity: 0.48;
    cursor: not-allowed;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(23, 23, 23, 0.48);
`;

export const ModalBox = styled.div`
  width: min(100%, 540px);
  display: grid;
  gap: 18px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  box-shadow: 0 24px 64px rgba(23, 23, 23, 0.18);
`;

export const DocumentationModalBox = styled(ModalBox)`
  width: min(100%, 760px);
  max-height: min(86vh, 760px);
  overflow-y: auto;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ModalSubtitle = styled.p`
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ModalCloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
`;

export const QrShell = styled.div`
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const QrCaption = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ModalField = styled.div`
  display: grid;
  gap: 8px;
`;

export const ModalLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const LinkPreview = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  box-sizing: border-box;
`;

export const ModalActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;

  @media (max-width: 560px) {
    justify-content: stretch;

    > button,
    > a {
      width: 100%;
    }
  }
`;

export const ModalSecondaryButton = styled.button`
  ${biteplanerButtonSurfaceStyles}
  min-height: 44px;
  padding: 0 18px;
  border-color: #b91c1c;
  background: #fff1f2;
  color: #b91c1c;
  box-shadow: none;

  &:not(:disabled):hover {
    transform: translateY(-1px);
    border-color: #991b1b;
    background: #fee2e2;
    color: #991b1b;
    box-shadow: 0 10px 22px rgba(185, 28, 28, 0.12);
  }
`;

export const ModalPrimaryButton = styled.button`
  ${biteplanerButtonSurfaceStyles}
  ${biteplanerButtonHoverStyles}
  min-height: 44px;
  padding: 0 20px;
`;

export const ModalActionLink = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.bgBase};
  }
`;

export const ModalForm = styled.form`
  display: grid;
  gap: 14px;
`;

export const DocumentationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const DocumentationItem = styled.div`
  display: grid;
  gap: 6px;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const DocumentationLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const DocumentationValue = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  line-height: 1.55;
  overflow-wrap: anywhere;
`;

export const DocumentationValueRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;

  ${DocumentationValue} {
    min-width: 0;
  }
`;

export const DocumentationIconLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    background: rgba(22, 101, 52, 0.08);
  }
`;

export const DocumentationDownloadLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  max-width: 100%;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.55;
  text-decoration: none;
  overflow-wrap: anywhere;

  &:hover {
    text-decoration: underline;
  }

  svg {
    flex: 0 0 auto;
  }
`;

export const SimpleTableWrap = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const SimpleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 420px;

  th,
  td {
    padding: 12px 14px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
    font-size: 13px;
    vertical-align: top;
  }

  th {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textSecondary};
    background: ${({ theme }) => theme.colors.bgElevated};
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

export const ActionHref = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
`;
