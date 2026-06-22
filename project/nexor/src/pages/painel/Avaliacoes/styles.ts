import styled from 'styled-components';

export const Page = styled.div`
  display: grid;
  gap: 18px;
`;

export const Panel = styled.section`
  display: grid;
  gap: 24px;
  padding: 22px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.05);
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const HeaderIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(124, 58, 237, 0.06));
  color: #7c3aed;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.1;
`;

export const Description = styled.p`
  margin: 0;
  max-width: 840px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.6;
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(190px, 0.28fr) minmax(320px, 1fr) minmax(220px, 0.22fr);
  gap: 24px;
  align-items: center;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const ScoreBlock = styled.div`
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 28px 22px;
  border-radius: 10px;
  border: 1px solid rgba(124, 58, 237, 0.14);
  background:
    radial-gradient(circle at 15% 0%, rgba(124, 58, 237, 0.12), transparent 40%),
    linear-gradient(135deg, rgba(250, 245, 255, 0.92), rgba(255, 255, 255, 0.98));

  @media (max-width: 860px) {
    justify-items: start;
  }
`;

export const Score = styled.strong`
  font-size: clamp(3.8rem, 6vw, 5rem);
  line-height: 1;
  color: #7c3aed;
`;

export const Stars = styled.div`
  display: inline-flex;
  gap: 2px;
  color: #7c3aed;
`;

export const SmallText = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

export const Distribution = styled.div`
  display: grid;
  gap: 12px;
`;

export const DistributionRow = styled.div`
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 100px;
  gap: 14px;
  align-items: center;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Track = styled.div`
  height: 10px;
  border-radius: 999px;
  background: #f4f4f5;
  overflow: hidden;
`;

export const Fill = styled.span<{ $percent: number }>`
  display: block;
  width: ${({ $percent }) => `${$percent}%`};
  height: 100%;
  border-radius: inherit;
  background: #7c3aed;
`;

export const StatStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const StatCard = styled.article`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  min-height: 70px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 250, 250, 0.84));
`;

export const StatIcon = styled.span<{ $tone?: 'purple' | 'blue' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: ${({ $tone }) =>
    $tone === 'blue'
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.14), rgba(59, 130, 246, 0.06))'
      : 'linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(124, 58, 237, 0.06))'};
  color: ${({ $tone }) => ($tone === 'blue' ? '#3b82f6' : '#7c3aed')};
`;

export const StatValue = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 20px;
  line-height: 1.15;
`;

export const TemplateGrid = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
`;

export const TemplateCard = styled.article`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
  min-width: 0;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const TemplateScore = styled.strong`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 54px;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
`;

export const TemplateLabel = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 12px;
  font-weight: 650;
  line-height: 1.35;
  white-space: nowrap;
`;

export const Section = styled.section`
  display: grid;
  gap: 14px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
`;

export const SectionTitleGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
`;

export const SectionIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(124, 58, 237, 0.06));
  color: #7c3aed;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 800;
`;

export const SectionDescription = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.5;
`;

export const PendingCount = styled.strong`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #111111, #242424);
  color: ${({ theme }) => theme.colors.bgBase};
  font-size: 13px;
  box-shadow: 0 10px 20px rgba(23, 23, 23, 0.16);
`;

export const PendingCarouselShell = styled.div`
  display: grid;
  gap: 8px;
`;

export const PendingCarouselActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 6px;
`;

export const PendingCarouselButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;

  &:hover {
    border-color: rgba(124, 58, 237, 0.28);
    color: #6d28d9;
  }

  &:focus-visible {
    outline: 2px solid rgba(124, 58, 237, 0.28);
    outline-offset: 2px;
  }
`;

export const PendingCarousel = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-behavior: smooth;
  scroll-padding-inline: 2px;
  scroll-snap-type: x mandatory;
  padding: 2px 2px 8px;
`;

export const PendingCard = styled.article`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  flex: 0 0 min(360px, calc(100vw - 56px));
  scroll-snap-align: start;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const PendingTitle = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  line-height: 1.35;
`;

export const TriggerList = styled.div`
  display: grid;
  gap: 12px;
`;

export const SurveyTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const SurveyTab = styled.button<{ $active: boolean }>`
  min-height: 34px;
  padding: 8px 10px;
  border: 1px solid ${({ $active, theme }) => ($active ? 'rgba(124, 58, 237, 0.3)' : theme.colors.borderDefault)};
  border-radius: 8px;
  background: ${({ $active, theme }) => ($active ? 'rgba(124, 58, 237, 0.1)' : theme.colors.bgElevated)};
  color: ${({ $active, theme }) => ($active ? '#6d28d9' : theme.colors.textSecondary)};
  font: inherit;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
  transition:
    background 120ms ease,
    border-color 120ms ease,
    color 120ms ease;

  &:hover {
    border-color: rgba(124, 58, 237, 0.3);
    color: #6d28d9;
  }

  &:focus-visible {
    outline: 2px solid rgba(124, 58, 237, 0.28);
    outline-offset: 2px;
  }
`;

export const MomentPanel = styled.div`
  display: grid;
  gap: 12px;
`;

export const TriggerItem = styled.article`
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const TriggerIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 42px;
  width: 42px;
  border-radius: 8px;
  background: #ecfdf5;
  color: #15803d;
`;

export const ReviewList = styled.div`
  display: grid;
  gap: 14px;
`;

export const ReviewCard = styled.article`
  display: grid;
  gap: 14px;
  padding: 18px 22px;
  border-radius: 10px;
  border: 1px solid rgba(124, 58, 237, 0.16);
  background:
    radial-gradient(circle at 0% 0%, rgba(124, 58, 237, 0.08), transparent 28%),
    ${({ theme }) => theme.colors.bgElevated};
`;

export const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
`;

export const Reviewer = styled.div`
  display: flex;
  gap: 10px;
  min-width: 0;
`;

export const Avatar = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6d28d9, #8b5cf6);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
`;

export const ReviewerName = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
`;

export const ReviewMeta = styled.span`
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

export const ReviewScore = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 800;
`;

export const Comment = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.6;
`;

export const CriteriaGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const CriteriaPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;

  strong {
    color: #15803d;
  }
`;

export const Banner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const ButtonBase = styled.button`
  border: 0;
  border-radius: 4px;
  font-weight: 750;
  font-size: 12px;
  cursor: pointer;

  &:disabled {
    cursor: wait;
    opacity: 0.7;
  }
`;

export const SecondaryButton = styled(ButtonBase)`
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const GhostButton = styled(ButtonBase)`
  padding: 10px 12px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const PrimaryButton = styled(ButtonBase)`
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgBase};
`;

export const IconButton = styled(ButtonBase)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(23, 23, 23, 0.42);
`;

export const Modal = styled.section`
  width: min(760px, 100%);
  max-height: min(760px, calc(100vh - 40px));
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  border-radius: 12px;
  border: 1px solid #f3d27a;
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 22px 70px rgba(23, 23, 23, 0.24);
  overflow: hidden;
`;

export const ModalHeader = styled.header`
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
  border-bottom: 1px solid #f3d27a;
  background: linear-gradient(180deg, #fffbeb 0%, ${({ theme }) => theme.colors.bgElevated} 100%);
`;

export const ModalForm = styled.form`
  display: grid;
  gap: 14px;
  padding: 18px;
  overflow: auto;
`;

export const SurveyIntro = styled.div`
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #f3d27a;
  background: #fffbeb;
`;

export const SurveyIntroIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #facc15;
  color: #713f12;
`;

export const SurveyIntroTitle = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
`;

export const SurveyField = styled.div`
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-left: 4px solid #facc15;
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const SurveyLabel = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 500;

  > span {
    color: inherit;
    margin-left: 3px;
  }
`;

export const FieldError = styled.span`
  color: #b91c1c;
  font-size: 12px;
  line-height: 1.4;
`;

export const ScoreOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};

  @media (max-width: 560px) {
    gap: 4px;
  }
`;

export const ScoreOption = styled.label<{ $active: boolean; $selected: boolean }>`
  position: relative;
  display: inline-grid;

  input {
    position: absolute;
    opacity: 0;
  }

  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 6px;
    border: 1px solid ${({ $selected, theme }) => ($selected ? '#eab308' : theme.colors.borderDefault)};
    background: ${({ $selected, theme }) => ($selected ? '#fef3c7' : theme.colors.bgBase)};
    color: ${({ $active, $selected }) => ($active || $selected ? '#eab308' : '#d4d4d4')};
    font-size: 13px;
    font-weight: 800;
    transition:
      color 120ms ease,
      background 120ms ease,
      border-color 120ms ease,
      transform 120ms ease;
  }

  &:hover > span {
    border-color: #eab308;
    color: #eab308;
    transform: translateY(-1px);
  }

  input:focus-visible + span {
    outline: 2px solid rgba(234, 179, 8, 0.35);
    outline-offset: 2px;
  }
`;

export const ScreenReaderText = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const ScaleHint = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

export const TextArea = styled.textarea`
  min-height: 96px;
  resize: vertical;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  line-height: 1.5;
`;

export const ErrorText = styled.p`
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 13px;
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 6px;
`;
