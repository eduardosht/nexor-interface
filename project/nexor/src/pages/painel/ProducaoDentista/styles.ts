import styled from 'styled-components';

export const Banner = styled.div`
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.6;
`;

export const LoadingStack = styled.div`
  display: grid;
  gap: 16px;
`;

export const WizardShell = styled.section`
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  gap: 0;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  overflow: hidden;

  @media (max-width: 1440px) {
    grid-template-columns: 1fr;
    overflow: visible;
  }

  @media (max-width: 1280px) {
    border-radius: 14px;
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const WizardSidebar = styled.aside`
  position: relative;
  padding: 28px 22px;
  border-right: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: linear-gradient(180deg, rgba(250, 250, 250, 0.96), rgba(244, 244, 244, 0.96));

  @media (max-width: 1440px) {
    position: sticky;
    top: 0;
    z-index: 4;
    padding: 10px 12px;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
    border-radius: 20px 20px 0 0;
    background: rgba(250, 250, 250, 0.96);
    backdrop-filter: blur(12px);
  }

  @media (max-width: 1280px) {
    padding: 8px 10px;
    border-radius: 14px 14px 0 0;
  }

  @media (max-width: 980px) {
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
  }
`;

export const StepList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;

  @media (max-width: 1440px) {
    grid-template-columns: repeat(4, minmax(150px, 1fr));
    overflow-x: auto;
    padding-bottom: 2px;
  }

  @media (max-width: 1280px) {
    gap: 6px;
  }
`;

export const StepCard = styled.button<{ $active: boolean; $completed: boolean; $disabled: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  text-align: left;
  border: 1px solid
    ${({ $active, $completed, theme }) =>
    $active ? theme.colors.textPrimary : $completed ? '#86D39D' : theme.colors.borderDefault};
  border-radius: 14px;
  background: ${({ $active, $completed, theme }) =>
    $active ? theme.colors.bgBase : $completed ? '#ECFDF3' : 'transparent'};
  box-shadow: ${({ $active }) => ($active ? '0 10px 24px rgba(23, 23, 23, 0.06)' : 'none')};
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition:
    background 180ms ease,
    box-shadow 180ms ease,
    opacity 180ms ease,
    transform 120ms ease;

  &:hover {
    transform: ${({ $disabled }) => ($disabled ? 'none' : 'translateX(2px)')};
  }

  @media (max-width: 1440px) {
    min-height: 100%;
    gap: 4px;
    padding: 10px 12px;
    border-radius: 10px;
    box-shadow: ${({ $active }) => ($active ? '0 6px 16px rgba(23, 23, 23, 0.06)' : 'none')};

    &:hover {
      transform: ${({ $disabled }) => ($disabled ? 'none' : 'translateY(-1px)')};
    }
  }

  @media (max-width: 1280px) {
    padding: 8px 10px;
  }
`;

export const StepTop = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
`;

export const StepBadge = styled.span<{ $active: boolean; $completed: boolean; $disabled: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid
    ${({ $active, $completed, theme }) =>
    $active || $completed ? theme.colors.textPrimary : theme.colors.borderDefault};
  background: ${({ $active, $completed, theme }) =>
    $active || $completed ? theme.colors.textPrimary : theme.colors.bgElevated};
  color: ${({ $active, $completed, theme }) =>
    $active || $completed ? theme.colors.bgBase : theme.colors.textPrimary};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  flex: 0 0 auto;

  @media (max-width: 1440px) {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
`;

export const StepMeta = styled.span<{ $active: boolean; $completed: boolean; $disabled: boolean }>`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ $active, $completed, $disabled, theme }) => {
    if ($disabled) {
      return theme.colors.textSoft;
    }

    if ($active) {
      return theme.colors.textPrimary;
    }

    if ($completed) {
      return theme.colors.textSecondary;
    }

    return theme.colors.textSecondary;
  }};
`;

export const StepTitle = styled.strong`
  font-size: 14px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepText = styled.span`
  grid-column: 2;
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 1440px) {
    display: none;
  }
`;

export const WizardContent = styled.div`
  display: grid;
  gap: 24px;
  padding: 28px;
  background: ${({ theme }) => theme.colors.bgBase};

  @media (max-width: 1280px) {
    gap: 14px;
    padding: 16px;
  }
`;

export const StepContentHeader = styled.div`
  display: grid;
  gap: 8px;
`;

export const StepContentTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepContentDescription = styled.p`
  margin: 0;
  max-width: 760px;
  font-size: 14px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const NoticeBox = styled.div`
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};

  @media (max-width: 1280px) {
    padding: 12px;
  }
`;

export const NoticeTitle = styled.strong`
  font-size: 13px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const NoticeText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const RetentionConsentLabel = styled.span`
  font-weight: 400;

  strong {
    font-weight: 800;
  }
`;

export const ActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
`;

export const SecondaryActions = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;

  @media (max-width: 860px) {
    justify-content: space-between;
  }
`;

export const StepActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: nowrap;

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchActionSlot = styled.div`
  display: flex;
  align-items: end;

  > button {
    width: max-content;
    max-width: 100%;
    white-space: nowrap;
  }
`;

export const StepStatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const LabLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 420px);
  gap: 20px;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const AttachmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1280px) {
    gap: 10px;
  }

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

export const MapViewport = styled.div`
  height: 420px;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};

  .leaflet-container {
    width: 100%;
    height: 100%;
  }
`;

export const LabList = styled.div`
  display: grid;
  gap: 10px;
  align-content: start;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
`;

export const LabButton = styled.button<{ $active: boolean }>`
  display: grid;
  gap: 6px;
  width: 100%;
  padding: 12px;
  text-align: left;
  border-radius: 12px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.textPrimary : theme.colors.borderDefault)};
  background: ${({ $active, theme }) => ($active ? theme.colors.bgBase : theme.colors.bgElevated)};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
`;

export const LabName = styled.strong`
  font-size: 14px;
  font-weight: 700;
`;

export const LabMeta = styled.span`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const LabFooter = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const RatingBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  width: max-content;
  max-width: 100%;
  min-height: 24px;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid rgba(245, 158, 11, 0.28);
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
`;

export const EmptyState = styled.div`
  padding: 18px;
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.colors.borderDefault};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 1280px) {
    padding: 14px;
  }
`;
