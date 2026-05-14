import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const Page = styled.div`
  display: grid;
  gap: 24px;
`;

export const Hero = styled.section`
  display: grid;
  gap: 10px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const Eyebrow = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Description = styled.p`
  margin: 0;
  max-width: 760px;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
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

export const PartnerDashboardGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.8fr);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const PartnerChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
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
  min-height: 348px;
  padding: 16px 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(250, 250, 250, 0.72) 100%),
    ${({ theme }) => theme.colors.bgBase};

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
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StatValue = styled.strong`
  font-size: 26px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
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

export const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

export const TableIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
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
    opacity: 0.5;
    cursor: not-allowed;
    border-color: ${({ theme }) => theme.colors.borderDefault};
    color: ${({ theme }) => theme.colors.textSecondary};
    box-shadow: none;
    filter: saturate(0.72);
  }
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
  grid-template-columns: minmax(0, 1.2fr) minmax(220px, 0.8fr);
  gap: 12px;
  padding: 16px 18px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const DentistStatusItem = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

export const DentistStatusValue = styled.strong`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
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
    font-size: 11px;
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
  font-size: 11px;
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
  gap: 10px;
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
  font-size: 11px;
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
    font-size: 11px;
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
