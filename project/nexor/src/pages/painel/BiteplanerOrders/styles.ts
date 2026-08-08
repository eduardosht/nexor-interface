import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const PageStack = styled.div`
  display: grid;
  gap: 20px;
`;

export const Header = styled.header`
  display: grid;
  gap: 6px;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;

  @media (max-width: 620px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 24px;
  line-height: 1.2;
`;

export const Subtitle = styled.p`
  margin: 0;
  max-width: 760px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CheckoutNotice = styled.aside<{ $tone: 'success' | 'warning' }>`
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  border: 1px solid ${({ $tone }) => ($tone === 'success' ? '#bbf7d0' : '#f3d27a')};
  border-radius: 8px;
  background: ${({ $tone }) => ($tone === 'success' ? '#f0fdf4' : '#fff8df')};
  color: ${({ theme }) => theme.colors.textPrimary};

  strong {
    font-size: 15px;
  }

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
  }
`;

export const CheckoutOrderLink = styled(Link)`
  justify-self: start;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const FilterActions = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 220px) repeat(2, minmax(140px, 180px));
  gap: 12px;
  align-items: end;

  @media (max-width: 860px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

export const FilterField = styled.label`
  display: grid;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 700;

  input,
  select {
    width: 100%;
    min-height: 42px;
    box-sizing: border-box;
    border: 1px solid ${({ theme }) => theme.colors.borderDefault};
    border-radius: 7px;
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.textPrimary};
    padding: 0 12px;
    font: inherit;
    font-weight: 400;
  }

  input:focus,
  select:focus {
    outline: 2px solid rgba(21, 128, 61, 0.18);
    border-color: rgba(21, 128, 61, 0.42);
  }
`;

export const CellStack = styled.span`
  min-width: 0;
  display: grid;
  gap: 4px;

  strong {
    min-width: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 14px;
    line-height: 1.3;
  }

  span {
    min-width: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
`;

export const MonoValue = styled.span`
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const EmptyState = styled.div`
  display: grid;
  gap: 10px;
  padding: 28px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const DetailLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 7px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.bgElevated};
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.bgInset};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }
`;

export const MobileActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 2px;
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const DetailSection = styled.section`
  display: grid;
  gap: 12px;
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
`;

export const DetailList = styled.dl`
  display: grid;
  gap: 10px;
  margin: 0;

  div {
    display: grid;
    gap: 3px;
  }

  dt {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
  }

  dd {
    margin: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;
export const DetailPage = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  gap: 24px;
`;

export const BackBar = styled(Link)`
  min-height: 54px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);

  &:hover {
    background: ${({ theme }) => theme.colors.bgInset};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }
`;

export const DetailHeader = styled.header`
  display: grid;
  gap: 8px;
`;

export const DetailTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 30px;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: 0;

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

export const DetailSubtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 16px;
  line-height: 1.45;
  overflow-wrap: anywhere;
`;

export const DetailDashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const DetailCard = styled.section<{ $wide?: boolean }>`
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 26px;
  min-height: ${({ $wide }) => ($wide ? 'auto' : '220px')};
  padding: 26px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.035);

  @media (max-width: 640px) {
    gap: 18px;
    min-height: 0;
    padding: 18px;
  }
`;

export const CardTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 20px;
  line-height: 1.2;
  font-weight: 800;
`;

export const SummaryTopGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 26px;

  > * + * {
    border-left: 1px solid ${({ theme }) => theme.colors.borderDefault};
    padding-left: 26px;
  }

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    > *:nth-child(3) {
      border-left: 0;
      border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
      padding-left: 0;
      padding-top: 16px;
    }
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    gap: 16px;

    > * + *,
    > *:nth-child(3) {
      border-left: 0;
      border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
      padding-left: 0;
      padding-top: 16px;
    }
  }
`;

export const SummaryMetric = styled.div`
  min-width: 0;
  display: grid;
  gap: 10px;
`;

export const FieldLabel = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.35;
`;

const statusToneColors = {
  success: '#15803d',
  warning: '#b7791f',
  danger: '#b91c1c',
  neutral: '#737373',
};

export const StatusInline = styled.span<{ $tone: keyof typeof statusToneColors }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  line-height: 1.4;

  span {
    width: 10px;
    height: 10px;
    flex: 0 0 auto;
    border-radius: 999px;
    background: ${({ $tone }) => statusToneColors[$tone]};
  }
`;

export const TotalValue = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 22px;
  line-height: 1.2;
  font-weight: 800;
`;

export const MetaList = styled.dl`
  display: grid;
  gap: 14px;
  margin: 0;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};

  div {
    display: grid;
    grid-template-columns: minmax(130px, 1fr) minmax(0, 1.35fr);
    gap: 18px;
    align-items: baseline;
  }

  dt,
  dd {
    margin: 0;
    font-size: 15px;
    line-height: 1.4;
  }

  dt {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  dd {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: 520px) {
    div {
      grid-template-columns: 1fr;
      gap: 4px;
    }
  }
`;

export const ProductStack = styled.div`
  display: grid;
  gap: 24px;
`;

export const ProductItem = styled.div`
  min-width: 0;
  display: grid;
  gap: 18px;
`;

export const ProductName = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 17px;
  line-height: 1.35;
  font-weight: 650;
`;

export const ProductDescription = styled.p`
  margin: 0;
  padding-top: 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  line-height: 1.55;
  overflow-wrap: anywhere;
`;

export const TotalBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 66px;
  padding: 0 18px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgInset};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  font-weight: 700;

  strong {
    font-size: 18px;
    font-weight: 800;
    white-space: nowrap;
  }
`;

export const DetailTextStack = styled.div`
  display: grid;
  gap: 18px;
`;

export const DetailParagraph = styled.p`
  margin: 12px 0 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  line-height: 1.5;
  overflow-wrap: anywhere;
`;

export const EmptyDetailText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  line-height: 1.5;
`;

export const InlineLink = styled.a`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 700;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const Timeline = styled.ol`
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const TimelineItem = styled.li<{ $active?: boolean }>`
  position: relative;
  min-height: 58px;
  display: grid;
  gap: 4px;
  padding-left: 44px;
  padding-bottom: 18px;

  &::before {
    content: '';
    position: absolute;
    left: 17px;
    top: 10px;
    width: 12px;
    height: 12px;
    border-radius: 999px;
    border: 2px solid ${({ $active }) => ($active ? '#15803d' : '#cbd5e1')};
    background: ${({ $active }) => ($active ? '#15803d' : '#ffffff')};
    box-shadow: 0 0 0 4px #ffffff;
  }

  &::after {
    content: '';
    position: absolute;
    left: 23px;
    top: 25px;
    bottom: -2px;
    width: 1px;
    background: ${({ theme }) => theme.colors.borderDefault};
  }

  &:last-child {
    padding-bottom: 0;
  }

  &:last-child::after {
    display: none;
  }
`;

export const TimelineDate = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.35;
`;

export const TimelineLabel = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  line-height: 1.4;
  font-weight: 500;
`;
export const DetailHeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 8px;
`;

export const DetailActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.textPrimary};
  border-radius: 7px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgElevated};
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;

  &:hover {
    opacity: 0.92;
  }
`;

export const CorrectionNotice = styled.aside`
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid #f3d27a;
  border-radius: 8px;
  background: #fff8df;
  color: ${({ theme }) => theme.colors.textPrimary};

  strong {
    font-size: 15px;
  }

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
  }
`;

export const CompletionSlotList = styled.div`
  display: grid;
  gap: 14px;
`;

export const CompletionSlotItem = styled.section`
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const CompletionSlotHeader = styled.header`
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 14px;

  > div {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

export const SlotIndex = styled.span`
  width: 28px;
  height: 28px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.bgInset};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 800;
  font-size: 13px;
`;

export const SlotTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 17px;
  line-height: 1.3;
`;

export const CompletionSlotStatus = styled.span<{ $complete: boolean }>`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: ${({ $complete }) => ($complete ? '#dcfce7' : '#fff8df')};
  color: ${({ $complete }) => ($complete ? '#166534' : '#92400e')};
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
`;

export const FileMeta = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  overflow-wrap: anywhere;
`;

export const FileInputRow = styled.label`
  display: block;

  input {
    width: 100%;
    box-sizing: border-box;
    min-height: 42px;
    padding: 9px 10px;
    border: 1px solid ${({ theme }) => theme.colors.borderDefault};
    border-radius: 7px;
    background: ${({ theme }) => theme.colors.bgInset};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const SlotError = styled.p`
  margin: 0;
  color: #b91c1c;
  font-size: 14px;
  line-height: 1.4;
`;

export const CompletionActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;
