import styled from 'styled-components';

export const Shell = styled.section`
  display: grid;
  gap: 18px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.92)),
    ${({ theme }) => theme.colors.bgBase};
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.07);

  @media (max-width: 1280px) {
    gap: 12px;
    padding: 14px;
    border-radius: 14px;
  }
`;

export const Header = styled.header`
  display: grid;
  gap: 16px;
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(14px);

  @media (max-width: 1280px) {
    gap: 10px;
    padding: 14px;
    border-radius: 12px;
  }
`;

export const StickySummary = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  display: grid;
  gap: 12px;
  padding: 12px;
  margin: 0 -12px -12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(14px);
`;

export const HeaderTop = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const Brand = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;

  @media (max-width: 1280px) {
    gap: 10px;
  }
`;

export const BrandMark = styled.span`
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #0f2f57;
  color: #ffffff;

  @media (max-width: 1280px) {
    width: 32px;
    height: 32px;
    border-radius: 9px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

export const TitleGroup = styled.div`
  display: grid;
  gap: 4px;
`;

export const ClinicName = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const Title = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;

  @media (max-width: 1280px) {
    font-size: 20px;
  }
`;

export const Subtitle = styled.p`
  margin: 0;
  max-width: 760px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.65;
`;

export const HeaderMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
`;

export const Badge = styled.span<{ $tone?: 'success' | 'warning' | 'neutral' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid
    ${({ $tone, theme }) => {
    if ($tone === 'success') return '#b7d9c2';
    if ($tone === 'warning') return '#f2d49b';
    if ($tone === 'danger') return '#f2b8b5';
    return theme.colors.borderDefault;
  }};
  border-radius: 999px;
  background:
    ${({ $tone, theme }) => {
    if ($tone === 'success') return '#effaf2';
    if ($tone === 'warning') return '#fff8eb';
    if ($tone === 'danger') return '#fff1f1';
    return theme.colors.bgInset;
  }};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
`;

export const ProgressPanel = styled.div`
  display: grid;
  gap: 8px;
`;

export const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
`;

export const ProgressTrack = styled.div`
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.borderSubtle};
`;

export const ProgressFill = styled.div<{ $value: number }>`
  width: ${({ $value }) => `${$value}%`};
  height: 100%;
  border-radius: inherit;
  background: #0f2f57;
  transition: width 220ms ease;
`;

export const PatientStrip = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 14px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.bgInset};
`;

export const Avatar = styled.div`
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: #dbeafe;
  color: #0f2f57;
  font-size: 20px;
  font-weight: 900;

  @media (max-width: 1280px) {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    font-size: 13px;
  }
`;

export const PatientName = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  line-height: 1.35;
`;

export const PatientHint = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  line-height: 1.5;
`;

export const QuickItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const QuickLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const QuickValue = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 400;
  overflow-wrap: anywhere;
`;

export const Body = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;

  @media (max-width: 1440px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const SideNav = styled.nav`
  position: sticky;
  top: 148px;
  align-self: start;
  display: grid;
  gap: 6px;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.bgBase};

  @media (max-width: 1440px) {
    display: none;
  }

  @media (max-width: 1100px) {
    position: static;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
`;

export const NavItem = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 400;
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.bgInset};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const Sections = styled.div`
  display: grid;
  gap: 16px;

  @media (max-width: 1280px) {
    gap: 10px;
  }
`;

export const SectionGroup = styled.div`
  display: grid;
  gap: 10px;
`;

export const VisibleNotesCard = styled.article`
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid #d8c28a;
  border-radius: 16px;
  background: #fffaf0;
  box-shadow: 0 14px 30px rgba(120, 78, 18, 0.08);

  @media (max-width: 1280px) {
    gap: 10px;
    padding: 12px;
    border-radius: 12px;
  }
`;

export const VisibleNotesHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const VisibleNotesText = styled.p`
  margin: 0;
  padding: 14px;
  border: 1px solid #ead7a5;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
`;

export const Card = styled.details`
  display: grid;
  gap: 14px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.bgBase};
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.045);

  &[open] {
    padding-bottom: 16px;
  }

  @media (max-width: 1280px) {
    gap: 10px;
    border-radius: 12px;

    &[open] {
      padding-bottom: 12px;
    }
  }
`;

export const CardSummary = styled.summary`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }

  @media (max-width: 1280px) {
    gap: 10px;
    padding: 12px;
  }
`;

export const CardSummaryMeta = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

export const ExpandIcon = styled.span`
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.bgInset};
  transition:
    color 160ms ease,
    transform 160ms ease;

  ${Card}[open] & {
    color: ${({ theme }) => theme.colors.textPrimary};
    transform: rotate(180deg);
  }
`;

export const SectionTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 700;
`;

export const SectionDescription = styled.p`
  margin: 3px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  line-height: 1.55;
`;

export const CardContent = styled.div`
  display: grid;
  gap: 14px;
  padding: 0 16px;

  @media (max-width: 1280px) {
    gap: 10px;
    padding: 0 12px;
  }
`;

export const Grid = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns = 3 }) => $columns}, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const DownloadActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
  min-width: 0;

  > button {
    width: fit-content;
    max-width: 100%;
    min-width: 0;
    background: #15803d;
    border-color: #15803d;
    color: #f8fafc;
    white-space: normal;
  }

  > button [data-button-content],
  > button [data-button-label] {
    max-width: 100%;
    min-width: 0;
    overflow-wrap: anywhere;
    white-space: normal;
    text-wrap: wrap;
  }

  > button [data-button-icon] {
    flex: 0 0 auto;
  }

  > button:not(:disabled):hover {
    background: #166534;
    border-color: #166534;
  }

  > button:not(:disabled):active {
    background: #14532d;
    border-color: #14532d;
  }

  @media (max-width: 640px) {
    display: grid;
    justify-content: initial;

    > button {
      width: min(100%, max-content);
    }
  }
`;

export const DataField = styled.div<{ $important?: boolean }>`
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: ${({ $important }) => ($important ? '16px' : '12px')};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ $important, theme }) => ($important ? '#f8fbff' : theme.colors.bgInset)};

  @media (max-width: 1280px) {
    padding: ${({ $important }) => ($important ? '12px' : '10px')};
    border-radius: 10px;
  }
`;

export const DataLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const DataValue = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;
  overflow-wrap: anywhere;
`;

export const EmptyValue = styled(DataValue)`
  color: ${({ theme }) => theme.colors.textSoft};
  font-weight: 400;
`;

export const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Tag = styled.span<{ $tone?: 'blue' | 'green' | 'amber' | 'gray' }>`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background:
    ${({ $tone }) => {
    if ($tone === 'green') return '#ecfdf3';
    if ($tone === 'amber') return '#fff7ed';
    if ($tone === 'blue') return '#eff6ff';
    return '#f3f4f6';
  }};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 12px;
  font-weight: 400;
`;

export const Intensity = styled.div`
  display: grid;
  gap: 8px;
`;

export const Slider = styled.div<{ $value: number }>`
  position: relative;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.borderSubtle};

  &::before {
    content: '';
    display: block;
    width: ${({ $value }) => `${$value}%`};
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #2f80ed, #f59e0b);
  }
`;

export const ModernTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  font-size: 13px;

  th,
  td {
    padding: 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    text-align: left;
    vertical-align: top;
  }

  th {
    background: ${({ theme }) => theme.colors.bgInset};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  tr:last-child td {
    border-bottom: 0;
  }
`;

export const Timeline = styled.ol`
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const TimelineItem = styled.li`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: start;
`;

export const TimelineDot = styled.span`
  width: 12px;
  height: 12px;
  margin-top: 4px;
  border-radius: 999px;
  background: #0f2f57;
  box-shadow: 0 0 0 4px #eef4ff;
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 140px;
  resize: vertical;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  &:focus {
    border-color: #0f2f57;
    box-shadow: 0 0 0 3px rgba(15, 47, 87, 0.12);
  }
`;
