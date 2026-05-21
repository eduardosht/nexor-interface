import styled from 'styled-components';

export type StepTone = 'complete' | 'current' | 'upcoming';

export const Page = styled.div`
  display: grid;
  gap: 28px;
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
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepFlow = styled.section`
  display: grid;
  gap: 26px;
`;

export const SectionHeader = styled.div`
  display: grid;
  gap: 6px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 28px;
  min-width: 1040px;
`;

export const StepScroll = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  padding: 16px 8px 10px;
`;

export const StepFormsSection = styled.div`
  display: grid;
  gap: 14px;
`;

export const StepFormsHeader = styled.div`
  display: grid;
  gap: 4px;
  padding-top: 26px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const StepFormsGrid = styled.div`
  display: grid;
  gap: 14px;
`;

export const StepFormsGroup = styled.div`
  display: grid;
  gap: 12px;
`;

export const StepItem = styled.li<{ $tone: StepTone }>`
  position: relative;
  min-width: 0;
  text-align: center;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 24px;
    left: calc(50% + 52px);
    width: calc(100% - 76px);
    height: 1px;
    background: ${({ theme }) => theme.colors.borderDefault};
  }
`;

export const StepPanel = styled.div<{ $tone: StepTone }>`
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 14px;
  min-height: 250px;
  opacity: ${({ $tone }) => ($tone === 'upcoming' ? 0.48 : 1)};
`;

export const StepBadge = styled.span<{ $tone: StepTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: ${({ $tone, theme }) =>
    $tone === 'current' || $tone === 'complete' ? theme.colors.textPrimary : theme.colors.bgInset};
  color: ${({ $tone, theme }) =>
    $tone === 'complete' || $tone === 'current' ? theme.colors.bgBase : theme.colors.textPrimary};
  box-shadow: ${({ $tone }) => ($tone === 'current' ? '0 8px 18px rgba(0, 0, 0, 0.18)' : 'none')};
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0;
`;

export const StepName = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepCopy = styled.p`
  margin: 0;
  max-width: 190px;
  font-size: 14px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StepStatus = styled.span<{ $tone: StepTone }>`
  width: fit-content;
  justify-self: center;
  padding: 7px 12px;
  border-radius: 8px;
  border: ${({ $tone, theme }) => ($tone === 'current' ? `1px solid ${theme.colors.borderDefault}` : '0')};
  background: ${({ $tone, theme }) =>
    $tone === 'complete' ? theme.colors.bgInset : $tone === 'current' ? theme.colors.bgBase : theme.colors.bgInset};
  color: ${({ $tone, theme }) =>
    $tone === 'current' ? theme.colors.textPrimary : theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 800;
`;

export const OrderGrid = styled.div`
  display: grid;
  gap: 14px;
`;

export const OrderCard = styled.article<{ $active: boolean }>`
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.textPrimary : theme.colors.borderDefault)};
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const OrderTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const SecondaryActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const OrderProblemSection = styled.section`
  display: grid;
  gap: 28px;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);

  ${SectionTitle} {
    font-size: clamp(1.65rem, 2.4vw, 2.35rem);
    line-height: 1.1;
  }

  @media (max-width: 720px) {
    padding: 22px;
  }
`;

export const OrderProblemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const OrderProblemIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  flex: 0 0 70px;
  border-radius: 18px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
`;

export const OrderProblemStage = styled.strong`
  color: #dc2626;
  font-weight: 900;
`;

export const OrderProblemReason = styled.p`
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 24px;
  margin: 0;
  padding: 28px 30px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-left: 6px solid #dc2626;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 17px;
  line-height: 1.55;

  strong {
    color: #dc2626;
  }

  > svg {
    color: #dc2626;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const ContactPanel = styled.div`
  display: grid;
  gap: 24px;
  padding: 32px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};

  @media (max-width: 720px) {
    padding: 22px;
  }
`;

export const ContactHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }
`;

export const ContactHeaderIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  flex: 0 0 64px;
  border-radius: 16px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
`;

export const ContactEmail = styled.strong`
  color: #dc2626;
  font-weight: 800;
`;

export const ContactForm = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 28px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const ContactField = styled.label<{ $full?: boolean }>`
  display: grid;
  grid-column: ${({ $full }) => ($full ? '1 / -1' : 'auto')};
  gap: 7px;
  min-width: 0;

  span {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  label {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 14px;
    border: 1px solid ${({ theme }) => theme.colors.borderDefault};
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.textPrimary};
    padding: 0 16px;
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease;

    &:focus-within {
      border-color: ${({ theme }) => theme.colors.textPrimary};
      box-shadow: 0 0 0 3px rgba(23, 23, 23, 0.08);
    }

    > svg {
      color: ${({ theme }) => theme.colors.textPrimary};
    }
  }

  input {
    width: 100%;
    min-width: 0;
    min-height: 46px;
    border: 0;
    outline: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.textPrimary};
    font: inherit;
    font-size: 15px;
  }

  textarea {
    width: 100%;
    min-width: 0;
    resize: vertical;
    min-height: 170px;
    border: 0;
    outline: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.textPrimary};
    font: inherit;
    font-size: 15px;
    line-height: 1.65;
    padding: 16px 0;
  }

  &:has(textarea) label {
    align-items: center;
  }
`;

export const ContactActions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  grid-column: 1 / -1;
  gap: 28px;
`;

export const ContactSubmitLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: fit-content;
  min-height: 52px;
  padding: 0 28px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.textPrimary};
  background: linear-gradient(135deg, #111111, #242424);
  color: #ffffff;
  text-decoration: none;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(23, 23, 23, 0.18);
`;

export const ContactPrivacyNote = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;
