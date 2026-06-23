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

export const ProductionCard = styled.section`
  display: grid;
  gap: 24px;
  min-width: 0;

  @media (max-width: 920px) {
    gap: 20px;
  }

  @media (max-width: 560px) {
    gap: 16px;
  }
`;

export const ProductionHero = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 460px);
  align-items: start;
  gap: 20px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 560px) {
    gap: 14px;
  }
`;

export const ProductionHeroCopy = styled.div`
  display: grid;
  gap: 16px;
  max-width: 720px;
`;

export const HeroEyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  color: #008d3f;
  font-size: 13px;
  font-weight: 900;
  line-height: 1.2;
`;

export const ProductionTitle = styled.h1`
  margin: 0;
  color: #07152f;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 950;
  line-height: 1.1;

  @media (max-width: 640px) {
    line-height: 1.08;
  }
`;

export const ProductionLead = styled.p`
  max-width: 680px;
  margin: 0;
  color: #334155;
  font-size: 14px;
  line-height: 1.55;
`;

export const WizardShell = styled.section`
  display: grid;
  gap: 16px;
  min-width: 0;
`;

export const WizardContent = styled.div`
  display: grid;
  gap: 16px;
  padding: 0;
  background: transparent;

  @media (max-width: 1280px) {
    gap: 14px;
  }
`;

export const StepContentHeader = styled.div`
  display: grid;
  gap: 8px;
  padding: 0 0 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.26);

  @media (max-width: 720px) {
    padding-bottom: 12px;
  }
`;

export const StepContentTitle = styled.h3`
  margin: 0;
  color: #07152f;
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;

  @media (max-width: 720px) {
    font-size: 20px;
  }
`;

export const StepKicker = styled.span`
  color: #008d3f;
  font-size: 13px;
  font-weight: 900;
  line-height: 1.2;
`;

export const StepContentDescription = styled.p`
  margin: 0;
  max-width: 760px;
  font-size: 14px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const FormPanel = styled.section`
  display: grid;
  gap: 16px;
  min-width: 0;
  padding: 0;
  background: transparent;

  @media (max-width: 1280px) {
    gap: 14px;
  }
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

export const PurchaseConfigurationBox = styled.div`
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(21, 128, 61, 0.22);
  background: ${({ theme }) => theme.colors.greenGhost};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const PurchaseConfigurationTitle = styled.strong`
  font-size: 14px;
  font-weight: 800;
  line-height: 1.3;
`;

export const PurchaseConfigurationList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const PurchaseConfigurationHint = styled.span`
  font-size: 13px;
  line-height: 1.5;
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
  min-width: 0;

  && button {
    width: fit-content;
    max-width: 100%;
    min-width: 0;

    [data-button-content] {
      flex: 0 1 100%;
      flex-wrap: wrap;
    }

    [data-button-label] {
      flex: 0 1 auto;
      max-width: 100%;
      min-width: 0;
    }
  }

  @media (max-width: 860px) {
    flex: 1 1 0;
    justify-content: space-between;

    && button {
      width: 100%;
      padding-inline: 10px;
    }
  }
`;

export const StepActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: nowrap;

  @media (max-width: 860px) {
    align-items: stretch;
    gap: 10px;
  }

  @media (max-width: 420px) {
    gap: 8px;

    ${SecondaryActions} {
      min-width: 0;
    }

    && button {
      font-size: 11px;
      padding-inline: 8px;
    }
  }

  @media (max-width: 360px) {
    && button svg {
      display: none;
    }
  }
`;

export const DeepLinkStepActions = styled(StepActions)`
  @media (max-width: 860px) {
    justify-content: flex-end;
  }

  ${SecondaryActions} {
    flex: 0 1 auto;
  }

  @media (max-width: 520px) {
    > span {
      display: none;
    }

    ${SecondaryActions} {
      flex: 1 1 100%;
    }

    && button {
      width: 100%;
    }
  }
`;

export const SearchActionSlot = styled.div`
  display: flex;
  align-items: end;
  min-width: 0;

  > button {
    width: fit-content;
    max-width: 100%;
    min-width: 0;
  }
`;

export const SearchActionsGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
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

export const MapCard = styled.section`
  position: relative;
  z-index: 0;
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};

  @media (max-width: 560px) {
    padding: 12px;
  }
`;

export const SideCard = styled.section`
  display: grid;
  gap: 16px;
  align-content: start;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};

  @media (max-width: 560px) {
    padding: 12px;
  }
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Description = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
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

export const DetailList = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: minmax(0, 110px) minmax(0, 1fr);
  gap: 10px 14px;
`;

export const DetailTerm = styled.dt`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const DetailValue = styled.dd`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const GuidanceCard = styled.div`
  padding: 12px 0 0;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textPrimary};
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
