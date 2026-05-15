import styled from 'styled-components';

export const Page = styled.div`
  display: grid;
  gap: 18px;
`;

export const Panel = styled.section`
  display: grid;
  gap: 20px;
  padding: 22px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const Header = styled.div`
  display: grid;
  gap: 6px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textPrimary};
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
  grid-template-columns: minmax(150px, 0.28fr) minmax(260px, 1fr) minmax(150px, 0.2fr);
  gap: 24px;
  align-items: center;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const ScoreBlock = styled.div`
  display: grid;
  gap: 6px;
  padding-right: 24px;
  border-right: 1px solid ${({ theme }) => theme.colors.borderDefault};

  @media (max-width: 860px) {
    padding-right: 0;
    border-right: 0;
  }
`;

export const Score = styled.strong`
  font-size: 46px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.textPrimary};
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
  gap: 8px;
`;

export const DistributionRow = styled.div`
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 84px;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Track = styled.div`
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.bgBase};
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
  gap: 8px;
`;

export const StatCard = styled.article`
  display: grid;
  gap: 4px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const StatValue = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
`;

export const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
`;

export const TemplateCard = styled.article`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const TemplateScore = styled.strong`
  color: #15803d;
  font-size: 16px;
`;

export const TemplateLabel = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 12px;
  font-weight: 650;
  line-height: 1.35;
`;

export const Section = styled.section`
  display: grid;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
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
  height: 30px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgBase};
  font-size: 13px;
`;

export const PendingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
`;

export const PendingCard = styled.article`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
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
  gap: 8px;
`;

export const TriggerItem = styled.article`
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const TriggerIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #ecfdf5;
  color: #15803d;
`;

export const ReviewList = styled.div`
  display: grid;
`;

export const ReviewCard = styled.article`
  display: grid;
  gap: 10px;
  padding: 18px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
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
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgBase};
  font-size: 11px;
  font-weight: 800;
`;

export const ReviewerName = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
`;

export const ReviewMeta = styled.span`
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
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;

  strong {
    color: #15803d;
  }
`;

export const Banner = styled.div`
  padding: 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
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
  font-weight: 750;

  > span {
    color: #b91c1c;
    margin-left: 3px;
  }
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
  font-size: 11px;
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
