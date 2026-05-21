import styled from 'styled-components';
import { Button } from '@nexor/design-system';

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
  grid-template-columns: minmax(220px, 320px) max-content;
  gap: 12px;
  align-items: end;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
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
  width: max-content;
  max-width: 100%;
  justify-self: start;
  white-space: nowrap;
`;

export const SecondaryButton = styled(Button).attrs({ variant: 'secondary' })`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  max-width: 100%;
  justify-self: start;
  white-space: nowrap;
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
  font-weight: 800;
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

export const ClinicMeta = styled.span`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
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

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 520px) {
    justify-content: stretch;

    > button {
      width: 100%;
      justify-self: stretch;
    }
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
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
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
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
`;
