import styled from 'styled-components';
import { AdminModalAction, Button } from '@nexor/design-system';
import { biteplanerButtonHoverStyles, biteplanerButtonSurfaceStyles } from '../styles/biteplanerFormButton';

export const Page = styled.div`
  display: grid;
  gap: 24px;
`;

export const Description = styled.p`
  margin: 0;
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

export const SearchBar = styled.section`
  display: grid;
  grid-template-columns: minmax(220px, 320px) max-content max-content;
  gap: 12px;
  align-items: end;

  @media (max-width: 860px) {
    grid-template-columns: minmax(0, 1fr) 44px 44px;
    gap: 8px;
    align-items: center;
  }
`;

export const LoadingStack = styled.div`
  display: grid;
  gap: 24px;
`;

export const SkeletonGridList = styled.div`
  display: grid;
  gap: 10px;
`;

export const SearchButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: auto;
  max-width: 100%;
  justify-self: start;
  white-space: nowrap;

  @media (max-width: 860px) {
    width: 44px;
    min-width: 44px;
    height: 44px;
    padding: 0;
    justify-self: stretch;
    border-radius: 8px;
  }
`;

export const ScheduleButton = styled(Button)`
  ${biteplanerButtonSurfaceStyles}
  ${biteplanerButtonHoverStyles}
  width: auto;
  max-width: 100%;
  justify-self: start;
`;

export const SecondaryButton = styled(Button).attrs({ variant: 'secondary' })`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: auto;
  max-width: 100%;
  justify-self: start;
  white-space: nowrap;

  @media (max-width: 860px) {
    width: 44px;
    min-width: 44px;
    height: 44px;
    padding: 0;
    justify-self: stretch;
    border-radius: 8px;
  }
`;

export const MobileHiddenButtonText = styled.span`
  @media (max-width: 860px) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

export const ClinicFilterBar = styled.section`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const ClinicRequirementBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 700;
`;

export const FilterCheckbox = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 700;

  input {
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.colors.green};
  }

  input:disabled + span {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StepActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
`;

export const CepField = styled.input`
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  box-sizing: border-box;
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 420px);
  gap: 24px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const MapCard = styled.section`
  position: relative;
  z-index: 0;
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const SideCard = styled.section`
  display: grid;
  gap: 16px;
  align-content: start;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const MapViewport = styled.div`
  position: relative;
  z-index: 0;
  height: 460px;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};

  .leaflet-container {
    width: 100%;
    height: 100%;
    z-index: 0;
  }
`;

export const ClinicList = styled.div`
  display: grid;
  gap: 10px;
`;

export const ClinicButton = styled.button<{ $active: boolean }>`
  display: grid;
  gap: 6px;
  width: 100%;
  padding: 14px;
  text-align: left;
  border-radius: 12px;
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.textPrimary : theme.colors.borderDefault)};
  background: ${({ $active, theme }) => ($active ? theme.colors.bgBase : theme.colors.bgElevated)};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: border-color 180ms ease, opacity 180ms ease;
`;

export const ClinicName = styled.strong`
  font-size: 14px;
  font-weight: 700;
`;

export const ClinicHeader = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const AdaptedBadge = styled.span<{ $adapted: boolean }>`
  display: inline-flex;
  align-items: center;
  width: max-content;
  max-width: 100%;
  min-height: 22px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid ${({ $adapted }) => ($adapted ? 'rgba(22, 101, 52, 0.24)' : 'rgba(107, 114, 128, 0.28)')};
  background: ${({ $adapted }) => ($adapted ? 'rgba(22, 101, 52, 0.1)' : 'rgba(107, 114, 128, 0.1)')};
  color: ${({ $adapted }) => ($adapted ? '#166534' : '#4b5563')};
  font-size: 12px;
  font-weight: 700;
`;

export const ClinicMeta = styled.span`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ClinicFooter = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const ClinicPagination = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding-top: 2px;
`;

export const ClinicPageSummary = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
`;

export const ClinicPageActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const ClinicPageIndicator = styled.span`
  display: inline-grid;
  min-width: 34px;
  min-height: 34px;
  place-items: center;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 700;
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

export const DetailValueStack = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

export const GuidanceCard = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const PositiveFeedback = styled.p`
  margin: -4px 0 0;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.successBorder};
  background: ${({ theme }) => theme.colors.successBg};
  color: ${({ theme }) => theme.colors.green};
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(23, 23, 23, 0.48);
`;

export const ConfirmationDialog = styled.div`
  display: grid;
  gap: 16px;
  width: min(100%, 480px);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.22);
`;

export const CancelModalAction = styled(AdminModalAction)`
  background: ${({ theme }) => theme.colors.bgElevated};
  border-color: ${({ theme }) => theme.colors.borderDefault};
  color: ${({ theme }) => theme.colors.textPrimary};
  box-shadow: none;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.bgBase};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    color: ${({ theme }) => theme.colors.textPrimary};
    box-shadow: none;
  }
`;

export const ReferralCard = styled.section`
  display: grid;
  gap: 18px;
  align-items: start;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};

`;

export const ReferralContent = styled.div`
  display: grid;
  gap: 12px;
`;

export const MessageTextarea = styled.textarea`
  width: 100%;
  min-height: 148px;
  margin: 0;
  padding: 14px 16px;
  box-sizing: border-box;
  resize: vertical;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-line;
`;

export const ReferralNotice = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.6;
`;

export const ReferralActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, max-content));
  gap: 10px;
  justify-content: start;
  align-items: center;

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const ActionHref = styled.a`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: 100%;
  min-height: 40px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: break-word;
  text-align: center;
  white-space: normal;

  span {
    min-width: 0;
  }
`;

export const WhatsappActionHref = styled(ActionHref)`
  border-color: #52b967;
  background: #52b967;
  color: #f8fff9;
  box-shadow: 0 8px 18px rgba(31, 150, 72, 0.18);
  transition:
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;

  svg {
    width: 16px;
    height: 16px;
    color: currentColor;
    stroke-width: 2.4;
  }

  &:hover {
    border-color: #47a95d;
    background: #47a95d;
    box-shadow: 0 10px 22px rgba(31, 150, 72, 0.24);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 3px solid rgba(82, 185, 103, 0.3);
    outline-offset: 2px;
  }

  @media (max-width: 560px) {
    width: 100%;
  }
`;

export const EmailActionHref = styled(ActionHref)`
  border-color: ${({ theme }) => theme.colors.borderDefault};
  background: #ffffff;
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.green};
    box-shadow: 0 10px 22px rgba(23, 23, 23, 0.08);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 3px solid rgba(7, 132, 90, 0.24);
    outline-offset: 2px;
  }

  @media (max-width: 560px) {
    width: 100%;
  }
`;
