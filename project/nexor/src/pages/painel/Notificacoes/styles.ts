import styled from 'styled-components';
import { PortalPageDescription, PortalPageTitle } from '../styles/portalTypography';

export const Page = styled.div`
  display: grid;
  gap: 18px;
  width: 100%;
  max-width: 980px;

  @media (max-width: 640px) {
    padding-bottom: calc(58px + env(safe-area-inset-bottom));
  }
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 640px) {
    display: grid;
    gap: 12px;
  }
`;

export const TitleGroup = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`;

export const PageTitle = styled(PortalPageTitle)``;

export const PageDescription = styled(PortalPageDescription)``;

export const UnreadSummary = styled.span`
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;

  svg {
    color: ${({ theme }) => theme.colors.green};
  }
`;

export const ListPanel = styled.section`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const StateMessage = styled.p`
  margin: 0;
  padding: 28px 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
`;

export const NotificationList = styled.div`
  display: grid;
`;

export const NotificationItem = styled.article<{ $unread: boolean }>`
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 14px;
  padding: 16px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  background: ${({ theme, $unread }) => ($unread ? `${theme.colors.green}05` : theme.colors.bgElevated)};

  &:last-child {
    border-bottom: 0;
  }

  @media (max-width: 640px) {
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 10px;
    padding: 14px 12px;
  }
`;

export const NotificationIcon = styled.span<{ $unread: boolean }>`
  width: 40px;
  height: 40px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme, $unread }) => ($unread ? `${theme.colors.green}0f` : theme.colors.bgInset)};
  color: ${({ theme, $unread }) => ($unread ? theme.colors.green : theme.colors.textSecondary)};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 640px) {
    width: 34px;
    height: 34px;
  }
`;

export const NotificationBody = styled.div`
  display: grid;
  gap: 5px;
  min-width: 0;
`;

export const NotificationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 520px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
`;

export const NotificationTitle = styled.strong`
  min-width: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 800;
  line-height: 1.3;
  overflow-wrap: anywhere;
`;

export const NotificationStatus = styled.span<{ $unread: boolean }>`
  color: ${({ theme, $unread }) => ($unread ? theme.colors.green : theme.colors.textSecondary)};
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
`;

export const NotificationMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.45;
`;

export const NotificationDate = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

export const NotificationActionButton = styled.button`
  justify-self: start;
  min-height: 32px;
  margin-top: 4px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.green};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.green};
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 120ms ease;

  &:hover {
    opacity: 0.88;
  }

  @media (max-width: 520px) {
    width: 100%;
  }
`;

export const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;

  @media (max-width: 640px) {
    position: sticky;
    bottom: 0;
    z-index: 5;
    justify-content: space-between;
    margin: 0 -12px calc(-76px - env(safe-area-inset-bottom));
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
    border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
    background: ${({ theme }) => theme.colors.bgElevated};
    box-shadow: 0 -10px 24px rgba(23, 23, 23, 0.08);
  }
`;

export const PageButton = styled.button`
  width: 34px;
  height: 34px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.bgInset};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
  }
`;

export const PageIndicator = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 700;
`;
