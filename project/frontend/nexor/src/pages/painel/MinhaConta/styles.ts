import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Page = styled.div`
  max-width: 1040px;
`;

export const PageTitle = styled.h1`
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 6px;
`;

export const PageSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
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
  font-size: 11px;
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
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const FieldValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
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
  font-size: 10px;
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

export const FormActions = styled.div`
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SaveMsg = styled.span<{ $error?: boolean }>`
  font-size: 12px;
  color: ${({ $error, theme }) => $error ? theme.colors.error : theme.colors.green};
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
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ProductBadge = styled.span`
  padding: 4px 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.green}1a;
  color: ${({ theme }) => theme.colors.green};
  font-size: 11px;
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
