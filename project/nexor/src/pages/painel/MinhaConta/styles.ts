import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PortalPageDescription, PortalPageTitle } from '../styles/portalTypography';

export const Page = styled.div`
  max-width: 1040px;
`;

export const PageTitle = styled(PortalPageTitle)`
  margin: 0 0 6px;
`;

export const PageSubtitle = styled(PortalPageDescription)`
  margin: 0 0 32px;
`;

export const Section = styled(motion.section)`
  margin-bottom: 32px;
`;

export const TopGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 24px;
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 12px;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  overflow: hidden;
`;

export const OnboardingStack = styled.div`
  display: grid;
  gap: 16px;
`;

export const DangerCard = styled(Card)`
  border-color: rgba(185, 28, 28, 0.18);
`;

export const CardRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;

  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

export const Field = styled.div<{ $editable?: boolean }>`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;

  &:nth-child(odd) {
    border-right: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  }

  &:last-child, &:nth-last-child(2):nth-child(odd) {
    border-bottom: none;
  }
`;

export const FieldLabel = styled.span`
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const FieldValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const EditableValueRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 24px;
`;

export const EditIconButton = styled.button`
  display: inline-grid;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease, background 150ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const FieldInput = styled.input`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: none;
  border: none;
  outline: none;
  padding: 0;
  font-family: inherit;
  width: 100%;

  &:focus {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &::placeholder { color: ${({ theme }) => theme.colors.textSecondary}; }
`;

export const FieldSelect = styled.select`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: none;
  border: none;
  outline: none;
  padding: 0;
  font-family: inherit;
  width: 100%;
`;

export const FieldLocked = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.6;
`;

export const SaveBtn = styled.button`
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgBase};
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 150ms ease;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

export const DangerButton = styled.button`
  padding: 10px 20px;
  background: #b91c1c;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 150ms ease;

  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

export const CancelButton = styled.button`
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 4px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

export const FormActions = styled.div`
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SecurityContent = styled.div`
  padding: 16px 20px;
`;

export const SecurityTitle = styled.h3`
  margin: 0 0 4px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const SecurityText = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

export const DeletionStatusNotice = styled.div`
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(185, 28, 28, 0.28);
  border-left: 4px solid #b91c1c;
  border-radius: 6px;
  background: rgba(185, 28, 28, 0.08);
`;

export const DeletionStatusTitle = styled.strong`
  display: block;
  margin-bottom: 4px;
  color: #991b1b;
  font-size: 13px;
`;

export const DeletionStatusMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  line-height: 1.5;
`;

export const ProductContent = styled.div`
  padding: 18px 20px;
`;

export const ProductHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
`;

export const ProductTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ProductBadge = styled.span<{ $tone?: 'success' | 'error' }>`
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid ${({ $tone, theme }) => ($tone === 'error' ? theme.colors.errorBorder : `${theme.colors.green}33`)};
  background: ${({ $tone, theme }) => ($tone === 'error' ? theme.colors.errorBg : `${theme.colors.green}1a`)};
  color: ${({ $tone, theme }) => ($tone === 'error' ? theme.colors.error : theme.colors.green)};
  font-size: 12px;
  font-weight: 700;
`;

export const ProductText = styled.p`
  margin: 0 0 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.5;
`;

export const ProductLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgBase};
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    opacity: 0.85;
  }
`;

export const PrivacyPanel = styled(Card)`
  padding: 18px 20px;
`;

export const PrivacyHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const PrivacyBadge = styled.span`
  flex: 0 0 auto;
  min-height: 26px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => `${theme.colors.green}33`};
  background: ${({ theme }) => `${theme.colors.green}14`};
  color: ${({ theme }) => theme.colors.green};
  padding: 0 10px;
  font-size: 12px;
  font-weight: 800;
`;

export const PrivacyActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 920px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const privacyActionStyles = `
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
`;

export const PrivacyActionButton = styled.button`
  ${privacyActionStyles}
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: inherit;
  transition: border-color 150ms ease, background 150ms ease, opacity 150ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const PrivacyActionLink = styled(Link)`
  ${privacyActionStyles}
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const PrivacyActionAnchor = styled.a`
  ${privacyActionStyles}
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const PrivacyConsentSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const PrivacyConsentItem = styled.div`
  min-height: 76px;
  display: grid;
  gap: 6px;
  align-content: start;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const PrivacyConsentLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
`;

export const PrivacyConsentStatus = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 800;
`;

export const PrivacyConsentHint = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  line-height: 1.4;
`;

export const PrivacyInlineButton = styled.button`
  justify-self: start;
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: border-color 150ms ease, opacity 150ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const PrivacyRightsList = styled.ul`
  margin: 16px 0 0;
  padding-left: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.55;
`;


export const PreferenceRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, auto);
  gap: 18px;
  align-items: center;
  padding: 18px 20px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

export const PreferenceContent = styled.div`
  display: grid;
  gap: 8px;
`;

export const PreferenceSwitchLabel = styled.label`
  display: inline-grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
`;

export const PreferenceSwitchInput = styled.input`
  appearance: none;
  width: 44px;
  height: 24px;
  margin: 0;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.borderSubtle};
  position: relative;
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.bgElevated};
    box-shadow: 0 1px 3px rgba(23, 23, 23, 0.2);
    transition: transform 150ms ease;
  }

  &:checked {
    border-color: ${({ theme }) => theme.colors.green};
    background: ${({ theme }) => theme.colors.green};
  }

  &:checked::after {
    transform: translateX(20px);
  }

  &:focus-visible {
    outline: 2px solid rgba(23, 23, 23, 0.2);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const PreferenceSwitchText = styled.span`
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(23, 23, 23, 0.42);
`;

export const Modal = styled.section`
  width: min(560px, 100%);
  border-radius: 12px;
  border: 1px solid rgba(185, 28, 28, 0.24);
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 22px 70px rgba(23, 23, 23, 0.24);
  overflow: hidden;
`;

export const ModalHeader = styled.header`
  padding: 18px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};

  strong {
    color: #991b1b;
  }
`;

export const ModalTitle = styled.h3`
  margin: 0 0 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 850;
`;

export const ModalBody = styled.div`
  display: grid;
  gap: 16px;
  padding: 18px 20px;

  > ${Field} {
    padding: 0;
    border-bottom: none;
    border-right: none;
  }

  @media (max-width: 560px) {
    padding: 16px;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const ReasonChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const ReasonChip = styled.button<{ $active: boolean }>`
  min-height: 34px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.textPrimary : theme.colors.borderDefault)};
  background: ${({ $active, theme }) => ($active ? theme.colors.textPrimary : theme.colors.bgElevated)};
  color: ${({ $active, theme }) => ($active ? theme.colors.bgBase : theme.colors.textSecondary)};
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
    color: ${({ $active, theme }) => ($active ? theme.colors.bgBase : theme.colors.textPrimary)};
  }

  &:focus-visible {
    outline: 2px solid rgba(23, 23, 23, 0.2);
    outline-offset: 2px;
  }
`;

export const TextArea = styled.textarea`
  min-height: 90px;
  resize: vertical;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  line-height: 1.5;
`;
