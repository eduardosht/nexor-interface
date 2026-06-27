import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  PortalCardTitle,
  PortalSectionDescription,
  PortalSectionTitle,
} from '../styles/portalTypography';

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

export const Title = PortalSectionTitle;

export const Description = styled(PortalSectionDescription)`
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

export const FormTitle = PortalCardTitle;

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
  font-size: 14px;
  font-weight: 500;

  legend {
    padding: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 13px;
    font-weight: 500;
  }

  @media (max-width: 720px) {
    font-size: 12px;

    legend {
      font-size: 12px;
    }
  }
`;

export const FieldAnchor = styled.div`
  min-width: 0;
`;

export const HighlightedClinicalDateField = styled.div`
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid rgba(14, 165, 233, 0.36);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.96), rgba(255, 255, 255, 0.98));
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07);

  ${FieldShell} {
    font-weight: 700;
  }
`;

export const RadioQuestionSlot = styled.div`
  > fieldset {
    display: grid;
    grid-template-columns: 1fr;
    align-items: start;
    justify-content: stretch;
    min-height: 44px;
    gap: 7px;
  }

  > fieldset > legend {
    min-height: auto;
    margin: 0;
    padding: 0;
    line-height: 1.35;
    display: block;
  }

  > fieldset > div {
    align-items: flex-start;
    justify-content: flex-start;
    min-height: 44px;
  }

  @media (max-width: 640px) {
    > fieldset {
      display: grid;
      grid-template-columns: 1fr;
      align-items: start;
      justify-content: stretch;
    }

    > fieldset > div {
      flex: initial;
      justify-content: flex-start;
    }

    > fieldset > legend {
      min-height: auto;
      font-size: 12px;
    }

    > fieldset > [role='alert'] {
      grid-column: 1;
      grid-row: auto;
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
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
`;

export const FieldError = styled.span`
  display: block;
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.error};
  font-size: 12px;
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

export const Feedback = styled.span<{ $tone: 'success' | 'error' }>`
  color: ${({ $tone }) => ($tone === 'success' ? '#15803D' : '#B91C1C')};
  font-size: 13px;
  font-weight: 700;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);

  @media (max-width: 760px) {
    align-items: center;
    justify-content: space-between;
    gap: 14px;

    > button {
      flex: 1 1 calc(50% - 7px);
      min-width: 0;
    }

    > ${Feedback} {
      flex: 1 1 100%;
    }
  }
`;

export const PendingRequiredLegend = styled.aside`
  display: grid;
  gap: 20px;
  margin-top: 24px;
  padding: 24px 26px 0;
  overflow: hidden;
  border: 1px solid rgba(203, 213, 225, 0.88);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  color: #07152f;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.04);

  @media (max-width: 720px) {
    gap: 12px;
    margin-top: 16px;
    padding: 14px 12px 0;
    border-radius: 8px;
  }
`;

export const PendingRequiredHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  min-width: 0;

  @media (max-width: 520px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }
`;

export const PendingRequiredIcon = styled.span`
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 999px;
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;

  @media (max-width: 720px) {
    width: 36px;
    height: 36px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const PendingRequiredHeaderCopy = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

export const PendingRequiredTitle = styled.strong`
  color: #07152f;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.2;

  @media (max-width: 720px) {
    font-size: 13px;
    line-height: 1.2;
  }
`;

export const PendingRequiredDescription = styled.span`
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;

  @media (max-width: 720px) {
    font-size: 12px;
    line-height: 1.25;
  }
`;

export const PendingRequiredCountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 7px;
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;

  @media (max-width: 720px) {
    min-height: 28px;
    padding: 0 9px;
    font-size: 12px;
  }

  @media (max-width: 520px) {
    justify-self: start;
    margin-top: 2px;
  }
`;

export const PendingRequiredHeaderAction = styled.span`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  color: #374151;

  @media (max-width: 720px) {
    width: 28px;
    height: 28px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  @media (max-width: 520px) {
    grid-column: 3;
    grid-row: 1;
  }
`;

export const PendingRequiredList = styled.ul`
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: 720px) {
    gap: 8px;
  }
`;

export const PendingRequiredItem = styled.li`
  min-width: 0;
`;

export const PendingRequiredButton = styled.button`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  width: 100%;
  min-height: 58px;
  padding: 12px 48px 12px 16px;
  border: 1px solid rgba(203, 213, 225, 0.86);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.74);
  color: #07152f;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    color 160ms ease,
    background 160ms ease;

  &:hover {
    border-color: rgba(220, 38, 38, 0.24);
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  }

  &:focus-visible {
    outline: 2px solid rgba(220, 38, 38, 0.28);
    outline-offset: 2px;
  }

  @media (max-width: 720px) {
    min-height: 50px;
    padding: 10px 40px 10px 12px;
  }
`;

export const PendingRequiredItemNumber = styled.span`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(220, 38, 38, 0.09);
  color: #dc2626;
  font-size: 15px;
  font-weight: 900;
  line-height: 1;

  @media (max-width: 720px) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
`;

export const PendingRequiredItemContent = styled.span`
  min-width: 0;
  width: 100%;
  display: grid;
  gap: 8px;
`;

export const PendingRequiredItemHeader = styled.span`
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  width: 100%;
`;

export const PendingRequiredItemLabel = styled.span`
  min-width: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.25;
  text-align: left;
  overflow-wrap: anywhere;

  @media (max-width: 720px) {
    font-size: 12px;
    line-height: 1.22;
  }
`;

export const PendingRequiredItemMessage = styled.span`
  display: block;
  width: 100%;
  max-width: 100%;
  padding: 0;
  background: transparent;
  color: #dc2626;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: normal;

  @media (max-width: 720px) {
    font-size: 12px;
  }
`;

export const PendingRequiredItemArrow = styled.span`
  position: absolute;
  right: 14px;
  top: 14px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  color: #111827;
  transition:
    background 160ms ease,
    color 160ms ease;

  ${PendingRequiredButton}:hover & {
    background: rgba(220, 38, 38, 0.08);
    color: #dc2626;
  }

  @media (max-width: 720px) {
    right: 10px;
    top: 12px;
    width: 24px;
    height: 24px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const PendingRequiredFooter = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-width: 0;
  margin: 0 -26px;
  padding: 16px 26px;
  border-top: 1px solid rgba(203, 213, 225, 0.7);
  color: #4b5563;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;

  @media (max-width: 720px) {
    gap: 8px;
    margin: 0 -12px;
    padding: 10px 12px;
    font-size: 12px;
  }
`;

export const PendingRequiredFooterMark = styled.span`
  color: #dc2626;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;

  @media (max-width: 720px) {
    font-size: 12px;
  }
`;

export const ActionPrivacyNote = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  width: fit-content;
  max-width: 360px;
  padding: 11px 13px;
  border: 1px solid rgba(0, 156, 74, 0.18);
  border-radius: 8px;
  background: #f6fdf8;
  color: #405169;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  margin-right: auto;

  svg {
    color: #009c4a;
  }

  strong {
    color: #008d3f;
    font-weight: 700;
  }
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
  font-weight: 700;
  line-height: 1.45;
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

export const OnboardingProgressCard = styled.section<{ $expanded?: boolean }>`
  display: grid;
  gap: 24px;
  padding: 26px 32px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);

  @media (max-width: 720px) {
    position: fixed;
    left: 50%;
    right: auto;
    bottom: max(8px, env(safe-area-inset-bottom));
    width: min(100vw, 430px);
    z-index: 86;
    transform: translateX(-50%);
    justify-items: center;
    gap: ${({ $expanded }) => ($expanded ? '14px' : '8px')};
    min-height: ${({ $expanded }) => ($expanded ? '176px' : '58px')};
    padding: 8px 16px calc(16px + env(safe-area-inset-bottom));
    border-color: rgba(226, 232, 240, 0.96);
    border-radius: 18px 18px 0 0;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: ${({ $expanded }) =>
    $expanded ? '0 -18px 44px rgba(15, 23, 42, 0.16)' : '0 -10px 30px rgba(15, 23, 42, 0.12)'};
    cursor: grab;
    outline: none;
    touch-action: none;
    transition:
      min-height 0.2s ease,
      padding 0.2s ease,
      box-shadow 0.2s ease;

    &:focus-visible {
      box-shadow:
        0 -10px 30px rgba(15, 23, 42, 0.12),
        0 0 0 3px rgba(0, 156, 74, 0.16);
    }
  }
`;

export const OnboardingProgressHandle = styled.span`
  display: none;

  @media (max-width: 720px) {
    display: block;
    width: 42px;
    height: 5px;
    border-radius: 999px;
    background: #cbd5e1;
  }
`;

export const ProgressCardTitle = styled.h3<{ $expanded?: boolean }>`
  display: grid;
  grid-template-columns: minmax(48px, 1fr) auto minmax(48px, 1fr);
  align-items: center;
  gap: 20px;
  width: 100%;
  margin: 0;
  color: #07152f;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.25;

  &::before,
  &::after {
    content: '';
    height: 1px;
    background: #dbe3ee;
  }

  @media (max-width: 720px) {
    gap: 12px;
    font-size: 0.82rem;
    font-weight: 900;
    line-height: 1.15;

    &::before,
    &::after {
      opacity: ${({ $expanded }) => ($expanded ? 1 : 0)};
    }
  }
`;

export const OnboardingProgressRail = styled.div<{ $expanded?: boolean }>`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(104px, 1fr);
  grid-template-columns: none;
  align-items: start;
  gap: 12px;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  padding-bottom: 4px;
  scrollbar-width: thin;

  @media (max-width: 720px) {
    grid-auto-flow: column;
    grid-auto-columns: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-content: center;
    width: 100%;
    max-width: 100%;
    gap: 0;
    max-height: ${({ $expanded }) => ($expanded ? '104px' : '0')};
    opacity: ${({ $expanded }) => ($expanded ? 1 : 0)};
    overflow: hidden;
    padding-bottom: 0;
    pointer-events: ${({ $expanded }) => ($expanded ? 'auto' : 'none')};
    transition:
      max-height 0.2s ease,
      opacity 0.16s ease;
  }

`;

export const OnboardingProgressStep = styled.div<{
  $active: boolean;
  $complete: boolean;
  $lineComplete: boolean;
  $blocked: boolean;
}>`
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
  opacity: ${({ $blocked }) => ($blocked ? 0.55 : 1)};
  cursor: default;

  &::before {
    content: '';
    position: absolute;
    top: 18px;
    right: calc(50% + 26px);
    left: -50%;
    height: 6px;
    border-radius: 999px;
    background: ${({ $lineComplete }) => ($lineComplete ? '#009c4a' : '#d7deea')};
  }

  &:first-child::before {
    display: none;
  }

  @media (max-width: 720px) {
    justify-items: center;
    text-align: center;
    align-content: start;
    gap: 12px;
    min-height: 98px;
    padding-top: 0;

    &::before {
      display: block;
      top: 11px;
      right: calc(50% + 12px);
      left: calc(-50% + 12px);
      height: 3px;
      border-radius: 0;
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

  @media (max-width: 720px) {
    width: 24px;
    height: 24px;
    border-width: 2px;
    background: ${({ $active, $complete }) => ($active || $complete ? '#009c4a' : '#f8fafc')};
    box-shadow: ${({ $active }) => ($active ? '0 6px 14px rgba(0, 156, 74, 0.2)' : '0 2px 8px rgba(15, 23, 42, 0.08)')};
    font-size: 0.68rem;
  }
`;

export const OnboardingStepText = styled.span`
  display: grid;
  gap: 2px;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;

  small {
    color: #07152f;
    font-size: 14px;
    font-weight: 500;
  }

  @media (max-width: 720px) {
    display: grid;
    align-content: start;
    gap: 7px;
    width: 100%;
    max-width: 116px;
    min-height: 52px;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.68rem;
    line-height: 1.15;
    text-transform: uppercase;

    > span {
      display: block;
      min-height: 22px;
    }

    small {
      display: block;
      min-height: 22px;
      color: #5f6878;
      font-size: 0.68rem;
      font-weight: 500;
      line-height: 1.15;
      text-transform: uppercase;
    }
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
  font-size: 12px;
  font-weight: 700;

  strong {
    color: #009c4a;
    font-size: 14px;
  }

  @media (max-width: 720px) {
    grid-column: 1 / -1;
    min-width: 0;
  }
`;

export const StepTabsCard = styled.div`
  padding: 10px;
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
  font-size: 12px;
  font-weight: 700;
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
  font-weight: 700;
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
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 92px), 1fr));
  gap: 8px;
`;

export const StepTab = styled.button<{ $active: boolean; $complete: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 9px 10px;
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
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: ${({ $active, $complete, theme }) =>
    $active || $complete ? theme.colors.textPrimary : theme.colors.bgInset};
  color: ${({ $active, $complete, theme }) =>
    $active || $complete ? theme.colors.bgElevated : theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 900;
`;

export const StepTabLabel = styled.span`
  min-width: 0;
  color: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.25;
  overflow-wrap: anywhere;
`;

export const FormSubsection = styled.fieldset`
  display: grid;
  gap: 14px;
  min-width: 0;
  margin: 0;
  padding: 0 0 0 16px;
  border: 0;
  border-left: 2px solid rgba(148, 163, 184, 0.34);

  & + & {
    padding-top: 22px;
  }
`;

export const SubsectionHeading = styled.legend`
  display: grid;
  grid-template-columns: auto minmax(32px, 1fr);
  align-items: center;
  gap: 10px;
  width: 100%;
  margin: 0 0 10px;
  padding: 0;
  color: #07152f;
  font-size: 13px;
  font-weight: 900;
  line-height: 1.3;

  &::after {
    content: '';
    height: 1px;
    background: rgba(148, 163, 184, 0.45);
  }
`;

export const AnimatedStep = styled(motion.div)`
  display: grid;
  gap: 12px;
`;

export const FormSectionGroup = styled.section`
  display: grid;
  gap: 16px;
  padding: 6px 0 0;
  border-top: 0;

  @media (max-width: 1280px) {
    gap: 14px;
  }
`;

export const SectionHeading = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 700;
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
    font-size: 12px;
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

export const PrivacyActions = styled(Actions)``;

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
  font-size: 12px;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 42px;
  row-gap: 13px;

  label {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 13px;
    font-weight: 500;
    line-height: 1.45;
    cursor: pointer;
  }

  input {
    position: relative;
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.colors.textPrimary};
    appearance: none;
    margin: 0;
    border: 1px solid rgba(148, 163, 184, 0.54);
    border-radius: 4px;
    background: #fbfdff;
    cursor: pointer;
    transition:
      background 160ms ease,
      border-color 160ms ease,
      box-shadow 160ms ease;
  }

  input:checked {
    border-color: #4f9363;
    background: #4f9363;
  }

  input:checked::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 5px;
    height: 9px;
    border: solid #fbfdff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  input:focus-visible {
    outline: 2px solid rgba(79, 147, 99, 0.28);
    outline-offset: 2px;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    row-gap: 12px;

    label {
      font-size: 12px;
    }
  }
`;

export const CheckboxFieldShell = styled.fieldset`
  display: grid;
  gap: 20px;
  min-width: 0;
  margin: 0;
  padding: 26px 28px;
  border: 1px solid rgba(203, 213, 225, 0.72);
  border-radius: 8px;
  background: #fbfdff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.035);
  color: ${({ theme }) => theme.colors.textPrimary};

  legend {
    float: left;
    width: 100%;
    padding: 0;
    color: #17213a;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.35;
  }

  @media (max-width: 1280px) {
    padding: 22px 24px;
  }

  @media (max-width: 720px) {
    gap: 16px;
    padding: 20px 16px;

    legend {
      font-size: 12px;
      margin-bottom: 8px;
    }
  }
`;

export const ConsentLabel = styled.span`
  font-weight: 400;

  strong {
    font-weight: 700;
  }

  @media (max-width: 720px) {
    font-size: 12px;
    line-height: 1.45;
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

  @media (max-width: 720px) {
    font-size: 12px;
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
