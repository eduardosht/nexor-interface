import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  PortalMetaLabel,
  PortalPageDescription,
  PortalPageTitle,
  PortalSectionDescription,
  PortalSectionTitle
} from '../styles/portalTypography';

export const Page = styled.div`
  display: grid;
  gap: 22px;
  max-width: 1040px;
`;

export const Header = styled.header`
  display: grid;
  gap: 6px;
`;

export const Eyebrow = PortalMetaLabel;

export const Title = styled(PortalPageTitle).attrs({ as: 'h1' })`
  margin: 0;
`;

export const Description = styled(PortalPageDescription)`
  margin: 0;
`;

export const Notice = styled.div<{ $tone?: 'success' | 'warning' | 'error' }>`
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid ${({ $tone, theme }) =>
    $tone === 'error'
      ? theme.colors.errorBorder
      : $tone === 'success'
        ? `${theme.colors.green}44`
        : 'rgba(245, 158, 11, 0.34)'};
  background: ${({ $tone, theme }) =>
    $tone === 'error'
      ? theme.colors.errorBg
      : $tone === 'success'
        ? `${theme.colors.green}14`
        : '#fffbeb'};
  color: ${({ $tone, theme }) => ($tone === 'error' ? theme.colors.error : theme.colors.textPrimary)};
`;

export const NoticeTitle = styled.strong`
  font-size: 14px;
`;

export const NoticeText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.45;
`;

export const Form = styled.form`
  display: grid;
  gap: 18px;
`;

export const Section = styled.section`
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 4px;

  @media (max-width: 620px) {
    display: grid;
  }
`;

export const SectionHeaderText = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

export const SectionTitle = styled(PortalSectionTitle).attrs({ as: 'h2', $size: 'sm' as const })`
  margin: 0;
`;

export const SectionDescription = styled(PortalSectionDescription).attrs({ $size: 'sm' as const })`
  margin: 0;
`;

export const AsaasLogoLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 42px;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  letter-spacing: 0;
  line-height: 1;
  white-space: nowrap;

  img {
    display: block;
    width: 112px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
  }

  &:hover {
    border-color: #0057ff;
  }

  &:focus-visible {
    outline: 2px solid #0057ff;
    outline-offset: 2px;
  }
`;

export const AccountSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgBase};

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

export const AccountSummaryItem = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
    font-weight: 700;
  }

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 14px;
    font-weight: 800;
    overflow-wrap: anywhere;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

export const GridItem = styled.div<{ $span?: 'two' | 'full' }>`
  min-width: 0;
  grid-column: ${({ $span }) => ($span === 'full' ? '1 / -1' : $span === 'two' ? 'span 2' : 'span 1')};

  @media (max-width: 620px) {
    grid-column: 1 / -1;
  }
`;

export const Field = styled.label<{ $span?: 'two' | 'full' }>`
  display: grid;
  gap: 7px;
  min-width: 0;
  grid-column: ${({ $span }) => ($span === 'full' ? '1 / -1' : $span === 'two' ? 'span 2' : 'span 1')};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 700;

  @media (max-width: 620px) {
    grid-column: 1 / -1;
  }
`;

const controlStyles = `
  width: 100%;
  min-height: 42px;
  box-sizing: border-box;
  border-radius: 6px;
  font: inherit;
  font-size: 14px;
`;

export const Input = styled.input`
  ${controlStyles}
  padding: 0 11px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Select = styled.select`
  ${controlStyles}
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const CheckboxLabel = styled.label`
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  line-height: 1.45;
`;

export const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  margin: 1px 0 0;
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
`;

export const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgBase};
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }
`;

export const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
  min-height: 52px;
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid #15803d;
  color: #15803d;
  background: transparent;
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;

  &:hover {
    border-color: #166534;
    background: rgba(21, 128, 61, 0.08);
    color: #166534;
    box-shadow: 0 10px 22px rgba(21, 128, 61, 0.12);
  }

  &:focus-visible {
    outline: 2px solid rgba(21, 128, 61, 0.36);
    outline-offset: 2px;
  }

  @media (max-width: 760px) {
    min-height: 38px;
    padding: 8px 12px;
    font-size: 12px;
  }
`;
