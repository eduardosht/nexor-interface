import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const sadPulse = keyframes`
  0%, 100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-3px) scale(1.04);
  }
`;

export const Panel = styled.section<{ $variant: 'panel' | 'embedded' }>`
  display: grid;
  gap: 16px;
  padding: ${({ $variant }) => ($variant === 'panel' ? '22px' : '0')};
  border: ${({ $variant, theme }) => ($variant === 'panel' ? `1px solid ${theme.colors.borderDefault}` : '0')};
  border-radius: 12px;
  background: ${({ $variant, theme }) => ($variant === 'panel' ? theme.colors.bgElevated : 'transparent')};

  @media (max-width: 1280px) {
    gap: 12px;
    padding: ${({ $variant }) => ($variant === 'panel' ? '14px' : '0')};
  }
`;

export const Header = styled.div`
  display: grid;
  gap: 6px;
`;

export const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
  font-weight: 800;
`;

export const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
`;

export const FormGrid = styled.div`
  display: grid;
  gap: 14px;

  @media (max-width: 1280px) {
    gap: 10px;
  }
`;

export const FormCard = styled.article<{ $presentation: 'card' | 'flat' }>`
  display: grid;
  gap: 16px;
  padding: ${({ $presentation }) => ($presentation === 'flat' ? '0' : '18px')};
  border: ${({ $presentation, theme }) => ($presentation === 'flat' ? '0' : `1px solid ${theme.colors.borderDefault}`)};
  border-radius: ${({ $presentation }) => ($presentation === 'flat' ? '0' : '12px')};
  background: ${({ $presentation, theme }) => ($presentation === 'flat' ? 'transparent' : theme.colors.bgBase)};

  @media (max-width: 1280px) {
    gap: 12px;
    padding: ${({ $presentation }) => ($presentation === 'flat' ? '0' : '14px')};
  }
`;

export const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
`;

export const FormTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 800;
`;

export const Meta = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  line-height: 1.5;
`;

export const Fields = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1280px) {
    gap: 10px;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const FieldSlot = styled.div<{ $span: number }>`
  grid-column: span ${({ $span }) => $span};
  min-width: 0;

  @media (max-width: 1024px) {
    grid-column: span ${({ $span }) => Math.min(12, Math.max($span, 4))};
  }

  @media (max-width: 720px) {
    grid-column: 1 / -1;
  }
`;

export const FullWidth = styled.div`
  grid-column: 1 / -1;
`;

export const FieldShell = styled.label`
  display: grid;
  gap: 7px;
  margin: 0;
  padding: 0;
  border: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 500;

  legend {
    padding: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 13px;
    font-weight: 500;
  }
`;

export const RadioQuestionSlot = styled.div`
  > fieldset {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    gap: 16px;
  }

  > fieldset > legend {
    float: left;
    display: flex;
    align-items: center;
    min-height: 44px;
    margin: 0;
    padding: 0;
    line-height: 1.35;
  }

  > fieldset > div {
    flex: 0 0 auto;
    align-items: center;
  }

  @media (max-width: 640px) {
    > fieldset {
      display: grid;
      align-items: start;
      justify-content: stretch;
    }

    > fieldset > div {
      flex: initial;
      justify-content: flex-start;
    }

    > fieldset > legend {
      min-height: auto;
    }
  }
`;

export const StackedRadioQuestionSlot = styled(RadioQuestionSlot)`
  > fieldset {
    display: grid;
    align-items: start;
    justify-content: stretch;
  }

  > fieldset > legend {
    min-height: auto;
  }

  > fieldset > div {
    flex: initial;
    justify-content: flex-start;
  }
`;

export const ConditionalFieldGroup = styled.div`
  display: grid;
  gap: 10px;
`;

export const ScoreScale = styled.span`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
`;

export const FieldError = styled.span`
  display: block;
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.error};
  font-size: 10px;
  line-height: 1.4;
`;

export const TrainingLocationField = styled.div`
  display: grid;
  gap: 8px;
`;

export const InlineCheckbox = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  cursor: pointer;

  input {
    width: 15px;
    height: 15px;
    margin: 0;
    accent-color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
`;

export const Feedback = styled.span<{ $tone: 'success' | 'error' }>`
  color: ${({ $tone }) => ($tone === 'success' ? '#15803D' : '#B91C1C')};
  font-size: 13px;
  font-weight: 700;
`;

export const OrthodonticBlockerFeedback = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  margin-top: 2px;
  padding: 14px 16px;
  border: 1px solid rgba(185, 28, 28, 0.22);
  border-radius: 10px;
  background: rgba(254, 242, 242, 0.92);
  color: #991B1B;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.45;
`;

export const OrthodonticBlockerIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: #FEE2E2;
  color: #B91C1C;
  animation: ${sadPulse} 1.8s ease-in-out infinite;
`;

export const LockNotice = styled.p`
  margin: 8px 0 0;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgInset};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
`;

export const IntakeProgressShell = styled.div`
  display: grid;
  gap: 20px;
  padding: 22px 24px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgInset};

  @media (max-width: 1280px) {
    gap: 16px;
    padding: 18px;
  }
`;

export const OnboardingProgressCard = styled.section`
  display: grid;
  gap: 24px;
  padding: 26px 32px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);

  @media (max-width: 720px) {
    gap: 18px;
    padding: 20px 16px;
    border-radius: 14px;
  }
`;

export const ProgressCardTitle = styled.h3`
  margin: 0;
  color: #07152f;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.25;
`;

export const OnboardingProgressRail = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: 18px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const OnboardingProgressStep = styled.button<{ $active: boolean; $complete: boolean }>`
  position: relative;
  display: grid;
  justify-items: center;
  gap: 10px;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ $active }) => ($active ? '#008d3f' : '#07152f')};
  font: inherit;
  text-align: center;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &::before {
    content: '';
    position: absolute;
    top: 18px;
    right: calc(50% + 26px);
    left: -50%;
    height: 6px;
    border-radius: 999px;
    background: ${({ $active, $complete }) => ($active || $complete ? '#009c4a' : '#d7deea')};
  }

  &:first-child::before {
    display: none;
  }

  @media (max-width: 720px) {
    grid-template-columns: auto minmax(0, 1fr);
    justify-items: start;
    text-align: left;

    &::before {
      display: none;
    }
  }
`;

export const OnboardingStepNumber = styled.span<{ $active: boolean; $complete: boolean }>`
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 2px solid ${({ $active, $complete }) => ($active || $complete ? '#009c4a' : '#d7deea')};
  border-radius: 999px;
  background: ${({ $active, $complete }) => ($active || $complete ? '#009c4a' : '#ffffff')};
  color: ${({ $active, $complete }) => ($active || $complete ? '#ffffff' : '#07152f')};
  box-shadow: ${({ $active }) => ($active ? '0 10px 28px rgba(0, 156, 74, 0.28)' : 'none')};
  font-size: 16px;
  font-weight: 900;
`;

export const OnboardingStepText = styled.span`
  display: grid;
  gap: 2px;
  min-width: 0;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;

  small {
    color: #07152f;
    font-size: 13px;
    font-weight: 500;
  }
`;

export const SectionOverviewCard = styled.section`
  display: grid;
  gap: 22px;
  padding: 28px 32px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);

  @media (max-width: 720px) {
    gap: 16px;
    padding: 20px 16px;
    border-radius: 14px;
  }
`;

export const SectionOverviewHeader = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 18px;
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

export const SectionOverviewIcon = styled.span`
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #d8ffe9 0%, #f3fff8 100%);
  color: #008d3f;
  box-shadow: 0 14px 32px rgba(0, 156, 74, 0.16);

  @media (max-width: 720px) {
    width: 52px;
    height: 52px;
    border-radius: 14px;
  }
`;

export const SectionOverviewCopy = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`;

export const SectionOverviewKicker = styled.span`
  color: #008d3f;
  font-size: 13px;
  font-weight: 900;
  line-height: 1.2;
  text-transform: uppercase;
`;

export const SectionOverviewTitle = styled.h3`
  margin: 0;
  color: #07152f;
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;

  @media (max-width: 720px) {
    font-size: 20px;
  }
`;

export const SectionOverviewLead = styled.p`
  max-width: 760px;
  margin: 0;
  color: #445066;
  font-size: 14px;
  line-height: 1.65;
`;

export const SectionProgressPill = styled.div`
  display: grid;
  gap: 8px;
  min-width: 160px;
  padding: 12px 16px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 14px;
  background: #ffffff;
  color: #07152f;
  font-size: 14px;
  font-weight: 800;

  strong {
    color: #009c4a;
    font-size: 20px;
  }

  @media (max-width: 720px) {
    grid-column: 1 / -1;
    min-width: 0;
  }
`;

export const TrustBadgeStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  overflow: hidden;
  border: 1px solid rgba(0, 156, 74, 0.16);
  border-radius: 18px;
  background: linear-gradient(90deg, #f7fffb 0%, #ffffff 100%);

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const TrustBadge = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  color: #07152f;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.35;

  & + & {
    border-left: 1px solid rgba(0, 156, 74, 0.12);
  }

  svg {
    color: #008d3f;
  }

  @media (max-width: 900px) {
    & + & {
      border-left: 0;
      border-top: 1px solid rgba(0, 156, 74, 0.12);
    }
  }
`;

export const StepTabsCard = styled.div`
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 14px;
  background: #ffffff;
`;

export const IntakeProgressHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  > div {
    display: grid;
    gap: 8px;
    max-width: 920px;
  }
`;

export const StepKicker = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
`;

export const SectionLead = styled.p`
  max-width: 920px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.75;
`;

export const StepProgressValue = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 800;
`;

export const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.borderSubtle};
`;

export const ProgressFill = styled(motion.div)`
  height: 100%;
  border-radius: inherit;
  background: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepRail = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

export const StepTab = styled.button<{ $active: boolean; $complete: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 62px;
  padding: 12px 14px;
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.textPrimary : theme.colors.borderDefault)};
  border-radius: 8px;
  background: ${({ $active, $complete, theme }) =>
    $active ? theme.colors.bgElevated : $complete ? theme.colors.greenGhost : theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background 180ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }
`;

export const StepNumber = styled.span<{ $active: boolean; $complete: boolean }>`
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: ${({ $active, $complete, theme }) =>
    $active || $complete ? theme.colors.textPrimary : theme.colors.bgInset};
  color: ${({ $active, $complete, theme }) =>
    $active || $complete ? theme.colors.bgElevated : theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 900;
`;

export const StepTabLabel = styled.span`
  min-width: 0;
  color: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.35;
`;

export const FormSubsection = styled.section`
  display: grid;
  gap: 12px;

  & + & {
    padding-top: 18px;
  }
`;

export const SubsectionHeading = styled.h4`
  display: grid;
  grid-template-columns: auto minmax(32px, 1fr);
  align-items: center;
  gap: 12px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  font-weight: 800;

  &::after {
    content: '';
    height: 1px;
    background: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const AnimatedStep = styled(motion.div)`
  display: grid;
  gap: 12px;
`;

export const FormSectionGroup = styled.section`
  display: grid;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};

  @media (max-width: 1280px) {
    gap: 10px;
    padding-top: 10px;
  }
`;

export const SectionHeading = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 800;
  line-height: 1.35;
`;

export const SectionDescription = styled.div`
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgInset};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  line-height: 1.55;

  p {
    margin: 0;
  }

  strong {
    display: block;
    margin-bottom: 2px;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  ul {
    display: grid;
    gap: 2px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
`;

export const PrivacyGate = styled.section`
  display: grid;
  gap: 22px;
  padding: 28px 30px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgElevated};

  @media (max-width: 720px) {
    gap: 18px;
    padding: 20px;
  }
`;

export const PrivacyIntro = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  align-items: start;
  padding-bottom: 22px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};

  ${SectionHeading} {
    margin-bottom: 12px;
    font-size: 20px;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const PrivacyIntroIcon = styled.span`
  display: inline-grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.greenGhost};
  color: ${({ theme }) => theme.colors.green};
`;

export const PrivacyIntroText = styled.p`
  max-width: 780px;
  margin: 0 0 10px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.7;
`;

export const PrivacyConsentArea = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const PrivacyShield = styled.span`
  display: inline-grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.greenGhost};
  color: ${({ theme }) => theme.colors.green};
`;

export const PrivacyConsentContent = styled.div`
  display: grid;
  gap: 16px;
`;

export const PrivacyPurposeList = styled.div`
  display: grid;
  gap: 0;
`;

export const PrivacyPurposeItem = styled.div`
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 54px;
  padding: 10px 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.borderDefault};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  line-height: 1.55;

  svg {
    width: 34px;
    height: 34px;
    padding: 8px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.greenGhost};
    color: ${({ theme }) => theme.colors.green};
  }
`;

export const PrivacyInfoBox = styled.div`
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.greenGhost};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  line-height: 1.6;

  svg {
    color: ${({ theme }) => theme.colors.green};
    margin-top: 2px;
  }
`;

export const PrivacyActions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const ReadOnlyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const ReadOnlyItem = styled.div`
  display: grid;
  gap: 5px;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgInset};

  @media (max-width: 1280px) {
    padding: 8px 10px;
  }
`;

export const ReadOnlyLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: uppercase;
`;

export const ReadOnlyValue = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
  overflow-wrap: anywhere;
`;

export const CheckboxGroup = styled.div`
  display: grid;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.bgElevated};

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
  }

  input {
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const ConsentLabel = styled.span`
  font-weight: 400;

  strong {
    font-weight: 800;
  }
`;

export const SurveyPrompt = styled.div`
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #f3d27a;
  background: #fffbeb;

  @media (max-width: 1280px) {
    grid-template-columns: 32px minmax(0, 1fr) auto;
    gap: 10px;
    padding: 10px;
  }

  @media (max-width: 720px) {
    grid-template-columns: 42px minmax(0, 1fr);

    > button {
      grid-column: 1 / -1;
      width: 100%;
    }
  }
`;

export const SurveyPromptIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #facc15;
  color: #713f12;

  @media (max-width: 1280px) {
    width: 32px;
    height: 32px;
    border-radius: 8px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

export const SurveyPromptTitle = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
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

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
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

  @media (max-width: 1280px) {
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 10px;
    padding: 10px;
  }
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

  @media (max-width: 1280px) {
    width: 32px;
    height: 32px;
    border-radius: 8px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
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

  @media (max-width: 1280px) {
    gap: 6px;
    padding: 10px;
  }
`;

export const SurveyLabel = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 750;

  > span {
    margin-left: 3px;
    color: inherit;
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
    border-radius: 6px;
    border: 1px solid ${({ $selected, theme }) => ($selected ? '#eab308' : theme.colors.borderDefault)};
    background: ${({ $selected, theme }) => ($selected ? '#fef3c7' : theme.colors.bgBase)};
    color: ${({ $active, $selected }) => ($active || $selected ? '#eab308' : '#d4d4d4')};
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

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 6px;
`;
