import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Panel = styled.section<{ $variant: 'panel' | 'embedded' }>`
  display: grid;
  gap: 16px;
  padding: ${({ $variant }) => ($variant === 'panel' ? '22px' : '0')};
  border: ${({ $variant, theme }) => ($variant === 'panel' ? `1px solid ${theme.colors.borderDefault}` : '0')};
  border-radius: 12px;
  background: ${({ $variant, theme }) => ($variant === 'panel' ? theme.colors.bgElevated : 'transparent')};
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
`;

export const FormGrid = styled.div`
  display: grid;
  gap: 14px;
`;

export const FormCard = styled.article<{ $presentation: 'card' | 'flat' }>`
  display: grid;
  gap: 16px;
  padding: ${({ $presentation }) => ($presentation === 'flat' ? '0' : '18px')};
  border: ${({ $presentation, theme }) => ($presentation === 'flat' ? '0' : `1px solid ${theme.colors.borderDefault}`)};
  border-radius: ${({ $presentation }) => ($presentation === 'flat' ? '0' : '12px')};
  background: ${({ $presentation, theme }) => ($presentation === 'flat' ? 'transparent' : theme.colors.bgBase)};
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
  font-weight: 700;

  legend {
    padding: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 13px;
    font-weight: 700;
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

export const Select = styled.select`
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
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
  gap: 14px;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgInset};
`;

export const IntakeProgressHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const StepKicker = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
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
  gap: 8px;
`;

export const StepTab = styled.button<{ $active: boolean; $complete: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 8px 10px;
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
  line-height: 1.25;
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
`;

export const SectionHeading = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 400;
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
`;

export const ReadOnlyLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 800;
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
    margin-left: 3px;
    color: #b91c1c;
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
