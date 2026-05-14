import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const slideUp = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: ${fadeIn} 180ms ease;
`;

export const ModalBox = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 1040px;
  position: relative;
  animation: ${slideUp} 200ms ease;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
`;

export const ModalTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #171717;
`;

export const ModalSubtitle = styled.p`
  margin: 0 0 24px;
  font-size: 13px;
  color: #737373;
`;

export const CloseBtn = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #737373;
  border-radius: 6px;
  transition: background 120ms ease, color 120ms ease;
  &:hover { background: #f5f5f5; color: #171717; }
`;

export const AccessCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 1120px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const AccessCard = styled.button<{ $selected: boolean; $allowed: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
  padding: 16px;
  border-radius: 12px;
  border: ${({ $selected }) => ($selected ? '2px solid #171717' : '1px solid #E0E0E0')};
  background: #ffffff;
  text-align: left;
  cursor: ${({ $allowed }) => ($allowed ? 'pointer' : 'default')};
  opacity: ${({ $allowed }) => ($allowed ? 1 : 1)};
  transition: border-color 150ms ease, box-shadow 150ms ease;
  &:hover {
    border-color: ${({ $allowed, $selected }) => $allowed && !$selected ? '#A3A3A3' : undefined};
    box-shadow: ${({ $allowed }) => $allowed ? '0 4px 16px rgba(23,23,23,0.08)' : 'none'};
  }
`;

export const AccessCardRadio = styled.span<{ $selected: boolean }>`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: ${({ $selected }) => ($selected ? '2px solid #171717' : '1.5px solid #D4D4D4')};
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  &::after {
    content: '';
    display: ${({ $selected }) => ($selected ? 'block' : 'none')};
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #171717;
  }
`;

export const AccessCardIconWrap = styled.div<{ $selected: boolean; $allowed: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ $selected, $allowed }) => $selected ? '#171717' : $allowed ? '#F5F5F5' : '#F5F5F5'};
  color: ${({ $selected, $allowed }) => $selected ? '#ffffff' : $allowed ? '#171717' : '#A3A3A3'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 150ms ease, color 150ms ease;
`;

export const AccessCardTitle = styled.strong<{ $allowed: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${({ $allowed }) => ($allowed ? '#171717' : '#A3A3A3')};
  line-height: 1.3;
  overflow-wrap: anywhere;
`;

export const AccessCardDesc = styled.p<{ $allowed: boolean }>`
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
  color: ${({ $allowed }) => ($allowed ? '#737373' : '#A3A3A3')};
`;

export const AccessCardBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #F5F5F5;
  color: #A3A3A3;
  border: 1px solid #E0E0E0;
  width: fit-content;
`;

export const ModalNote = styled.p`
  margin: 0 0 24px;
  font-size: 12px;
  color: #737373;
  line-height: 1.5;
  padding: 12px 14px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  background: #FAFAFA;
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

export const ModalBtnSecondary = styled.button`
  min-height: 44px;
  padding: 0 24px;
  border-radius: 4px;
  border: 1px solid #E0E0E0;
  background: #ffffff;
  color: #171717;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  transition: background 120ms ease;
  &:hover { background: #F5F5F5; }
`;

export const ModalBtnPrimary = styled.button`
  min-height: 44px;
  padding: 0 32px;
  border-radius: 4px;
  border: none;
  background: #171717;
  color: #FAFAFA;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  transition: opacity 120ms ease;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.4; cursor: default; }
`;

export const Shell = styled.div`
  width: 100vw;
  min-width: 0;
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const Sidebar = styled.nav<{ $collapsed: boolean }>`
  width: ${({ $collapsed }) => ($collapsed ? '64px' : '220px')};
  height: 100vh;
  background: ${({ theme }) => theme.colors.bgElevated};
  border-right: 1px solid ${({ theme }) => theme.colors.borderDefault};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: sticky;
  top: 0;
`;

export const SidebarTop = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'space-between')};
  padding: ${({ $collapsed }) => ($collapsed ? '0' : '0 16px')};
  height: 64px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  flex-shrink: 0;
`;

export const Logo = styled.img<{ $collapsed: boolean }>`
  height: auto;
  width: ${({ $collapsed }) => ($collapsed ? '0px' : '150px')};
  opacity: ${({ $collapsed }) => ($collapsed ? '0' : '1')};
  overflow: hidden;
  transition: opacity 150ms ease, width 150ms ease;
  pointer-events: ${({ $collapsed }) => ($collapsed ? 'none' : 'auto')};
  flex-shrink: 0;
`;

export const ToggleBtn = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 6px;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-shrink: 0;
  transition: background 120ms ease, color 120ms ease;
  &:hover {
    background: ${({ theme }) => theme.colors.bgInset};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const NavSection = styled.div`
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const StyledNavLink = styled(NavLink)<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  white-space: nowrap;
  transition: color 120ms ease, background 120ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.bgInset};
  }

  &.active {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.bgInset};
    font-weight: 600;
  }

  svg { flex-shrink: 0; }
`;

export const NavButton = styled.button<{ $collapsed: boolean; $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  width: 100%;
  background: ${({ theme, $active }) => ($active ? theme.colors.bgInset : 'none')};
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  color: ${({ theme, $active }) => ($active ? theme.colors.textPrimary : theme.colors.textSecondary)};
  text-align: left;
  white-space: nowrap;
  transition: color 120ms ease, background 120ms ease;

  svg { flex-shrink: 0; }

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.bgInset};
  }
`;

export const NavLabel = styled.span<{ $collapsed: boolean }>`
  opacity: ${({ $collapsed }) => ($collapsed ? '0' : '1')};
  transition: opacity 150ms ease;
  pointer-events: ${({ $collapsed }) => ($collapsed ? 'none' : 'auto')};
`;

export const NavSectionLabel = styled.div<{ $collapsed: boolean }>`
  padding: 12px 16px 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  pointer-events: none;
  transition: opacity 150ms ease;
  white-space: nowrap;
  overflow: hidden;
`;

export const NavSectionDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.borderSubtle};
  margin: 6px 12px;
`;

export const SubNavLink = styled(NavLink)<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px 8px 42px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  white-space: nowrap;
  transition: color 120ms ease, background 120ms ease;
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  pointer-events: ${({ $collapsed }) => ($collapsed ? 'none' : 'auto')};

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.bgInset};
  }

  &.active {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.bgInset};
    font-weight: 600;
  }

  svg { flex-shrink: 0; }
`;

export const SubNavText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MvpBadge = styled.span`
  margin-left: auto;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.06em;
  line-height: 1.4;
`;

export const SidebarProfileBlock = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.bgInset};
  border-radius: 8px;
  margin: 0 8px;
  overflow: hidden;
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  pointer-events: ${({ $collapsed }) => ($collapsed ? 'none' : 'auto')};
  transition: opacity 150ms ease;
`;

export const SidebarProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

export const SidebarProfileName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
`;

export const SidebarProfileEmail = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
`;

export const SidebarAvatarCollapsed = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  opacity: ${({ $collapsed }) => ($collapsed ? 1 : 0)};
  pointer-events: ${({ $collapsed }) => ($collapsed ? 'auto' : 'none')};
  position: ${({ $collapsed }) => ($collapsed ? 'relative' : 'absolute')};
  transition: opacity 150ms ease;
`;

export const SidebarFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  padding: 8px 0;
  flex-shrink: 0;
`;

export const LogoutBtn = styled.button<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: left;
  white-space: nowrap;
  transition: color 120ms ease, background 120ms ease;

  svg { flex-shrink: 0; }

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.bgInset};
  }
`;

export const ContentArea = styled.div`
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`;

export const Topbar = styled.div`
  height: 64px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  background: ${({ theme }) => theme.colors.bgElevated};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-shrink: 0;
  gap: 16px;

  @media (max-width: 640px) {
    padding: 0 16px;
  }
`;

export const TopbarGreeting = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const TopbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const NotificationArea = styled.div`
  position: relative;
`;

export const NotifBtn = styled.button<{ $hasUnread?: boolean }>`
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ theme, $hasUnread }) => ($hasUnread ? theme.colors.textPrimary : theme.colors.borderDefault)};
  background: ${({ theme, $hasUnread }) => ($hasUnread ? theme.colors.bgInset : 'none')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $hasUnread }) => ($hasUnread ? theme.colors.textPrimary : theme.colors.textSecondary)};
  transition: background 120ms ease, color 120ms ease;

  &::after {
    content: '';
    position: absolute;
    top: 7px;
    right: 7px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $hasUnread }) => ($hasUnread ? '#DC2626' : 'transparent')};
    box-shadow: ${({ $hasUnread }) => ($hasUnread ? '0 0 0 2px #ffffff' : 'none')};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.bgInset};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const NotificationsPanel = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 80;
  width: min(360px, calc(100vw - 32px));
  max-height: min(520px, calc(100vh - 92px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 18px 48px rgba(23, 23, 23, 0.16);
`;

export const NotificationsPanelHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

export const NotificationsPanelTitle = styled.strong`
  font-size: 13px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const NotificationsPanelMeta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const NotificationsList = styled.div`
  display: grid;
  overflow-y: auto;
`;

export const NotificationItem = styled.button<{ $unread: boolean }>`
  width: 100%;
  display: grid;
  gap: 5px;
  padding: 14px 16px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  background: ${({ theme, $unread }) => ($unread ? theme.colors.bgInset : theme.colors.bgElevated)};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.bgInset};
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const NotificationItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

export const NotificationTitle = styled.strong`
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const NotificationStatus = styled.span<{ $unread: boolean }>`
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid ${({ theme, $unread }) => ($unread ? theme.colors.textPrimary : theme.colors.borderDefault)};
  color: ${({ theme, $unread }) => ($unread ? theme.colors.textPrimary : theme.colors.textSecondary)};
  background: ${({ theme, $unread }) => ($unread ? theme.colors.bgElevated : 'transparent')};
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const NotificationDate = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const NotificationPreview = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const NotificationModalBox = styled(ModalBox)`
  max-width: 560px;
`;

export const NotificationModalDate = styled.span`
  display: block;
  margin-bottom: 18px;
  font-size: 12px;
  color: #737373;
`;

export const NotificationModalMessage = styled.p`
  margin: 0;
  color: #404040;
  font-size: 14px;
  line-height: 1.7;
`;

export const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.bgInset};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  flex-shrink: 0;
`;

export const ContentScroll = styled.div`
  flex: 1;
  width: 100%;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const ContentInner = styled(motion.main)`
  width: 100%;
  max-width: none;
  min-width: 0;
  box-sizing: border-box;
  padding: 40px 32px;

  @media (max-width: 900px) {
    padding: 28px 20px;
  }

  @media (max-width: 640px) {
    padding: 20px 14px;
  }
`;
