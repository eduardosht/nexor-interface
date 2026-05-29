import styled from 'styled-components';
import { biteplanerFormButtonStyles } from '../styles/biteplanerFormButton';

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
  gap: 28px;
  padding: 38px 34px 30px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 14px;
  background:
    radial-gradient(circle at 88% 4%, rgba(34, 197, 94, 0.12), transparent 26%),
    linear-gradient(180deg, rgba(248, 252, 255, 0.96) 0%, rgba(255, 255, 255, 0) 46%),
    ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);

  @media (max-width: 920px) {
    gap: 22px;
    padding: 24px;
  }

  @media (max-width: 560px) {
    padding: 18px;
  }
`;

export const ProductionHero = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 460px);
  align-items: start;
  gap: 28px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
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
  font-size: 2rem;
  font-weight: 950;
  line-height: 1.1;

  @media (max-width: 640px) {
    font-size: 1.75rem;
    line-height: 1.08;
  }
`;

export const ProductionLead = styled.p`
  max-width: 680px;
  margin: 0;
  color: #334155;
  font-size: 1rem;
  line-height: 1.55;
`;

export const OrderContextCard = styled.section`
  display: grid;
  gap: 18px;
  min-width: 0;
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
`;

export const OrderContextHeader = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const OrderContextIcon = styled.span`
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #d8ffe9 0%, #f3fff8 100%);
  color: #008d3f;
`;

export const ContextGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const ContextItem = styled.div`
  display: grid;
  gap: 5px;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.68);
`;

export const ContextLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 700;
`;

export const ContextStrong = styled.strong`
  display: block;
  color: #07152f;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.2;
  overflow-wrap: anywhere;
`;

export const ContextValue = styled.span`
  color: #07152f;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(0, 156, 74, 0.24);
  border-radius: 999px;
  background: #f0fdf4;
  color: #008d3f;
  font-size: 13px;
  font-weight: 800;
`;

export const WizardShell = styled.section`
  display: grid;
  gap: 18px;
`;

export const WizardContent = styled.div`
  display: grid;
  gap: 18px;
  padding: 0;
  background: transparent;

  @media (max-width: 1280px) {
    gap: 14px;
    padding: 16px;
  }
`;

export const StepContentHeader = styled.div`
  display: grid;
  gap: 10px;
  padding: 26px 32px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);

  @media (max-width: 720px) {
    padding: 20px 16px;
    border-radius: 14px;
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
  gap: 20px;
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
  ${biteplanerFormButtonStyles}

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
  ${biteplanerFormButtonStyles}

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
