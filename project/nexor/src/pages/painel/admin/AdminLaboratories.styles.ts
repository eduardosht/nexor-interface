import styled from 'styled-components';
import { Surface } from '@nexor/design-system';

export const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, .75fr);
  gap: 20px;
  @media (max-width: 980px) { grid-template-columns: 1fr; }
`;
export const Panel = styled(Surface)`
  display: flex; flex-direction: column; gap: 18px; box-shadow: none; min-width: 0;
`;
export const FormGrid = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
export const FieldWrap = styled.label`
  display: grid; gap: 6px; color: ${({ theme }) => theme.colors.textSecondary}; font-size: 12px; font-weight: 700;
  input, select { width: 100%; min-height: 42px; box-sizing: border-box; border: 1px solid ${({ theme }) => theme.colors.borderDefault}; border-radius: 6px; padding: 0 10px; background: ${({ theme }) => theme.colors.bgElevated}; color: ${({ theme }) => theme.colors.textPrimary}; font: inherit; }
`;
export const Full = styled(FieldWrap)` grid-column: 1 / -1; `;
export const Actions = styled.div` display: flex; flex-wrap: wrap; gap: 8px; align-items: center; `;
export const Button = styled.button<{ $tone?: 'primary' | 'quiet' | 'danger' }>`
  min-height: 40px; border: 1px solid ${({ theme, $tone }) => $tone === 'primary' ? theme.colors.textPrimary : theme.colors.borderDefault}; border-radius: 6px; padding: 0 14px; background: ${({ theme, $tone }) => $tone === 'primary' ? theme.colors.textPrimary : theme.colors.bgElevated}; color: ${({ theme, $tone }) => $tone === 'primary' ? theme.colors.bgBase : $tone === 'danger' ? '#b91c1c' : theme.colors.textPrimary}; font: inherit; font-weight: 700; cursor: pointer;
  &:disabled { opacity: .55; cursor: not-allowed; }
`;
export const TableScroller = styled.div` overflow-x: auto; `;
export const Table = styled.table`
  width: 100%; min-width: 760px; border-collapse: collapse;
  th, td { padding: 13px 10px; border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault}; text-align: left; vertical-align: middle; }
  th { color: ${({ theme }) => theme.colors.textSecondary}; font-size: 11px; text-transform: uppercase; }
  td { color: ${({ theme }) => theme.colors.textPrimary}; font-size: 13px; }
  td span { display: block; margin-top: 3px; color: ${({ theme }) => theme.colors.textSecondary}; font-size: 12px; }
`;
export const Badge = styled.span<{ $ok?: boolean }>` display: inline-flex; padding: 4px 8px; border-radius: 999px; background: ${({ $ok }) => $ok ? 'rgba(21,128,61,.12)' : 'rgba(209,138,0,.14)'}; color: ${({ $ok }) => $ok ? '#15803d' : '#a16207'}; font-size: 11px; font-weight: 700; `;
export const Notice = styled.p` margin: 0; color: ${({ theme }) => theme.colors.textSecondary}; font-size: 13px; line-height: 1.5; `;