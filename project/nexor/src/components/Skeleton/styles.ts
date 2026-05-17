import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
`;

const shimmer = ({ theme }: { theme: { colors: { bgBase: string; bgElevated: string } } }) =>
  `linear-gradient(90deg, ${theme.colors.bgBase} 0%, ${theme.colors.bgElevated} 42%, ${theme.colors.bgBase} 78%)`;

export const Stack = styled.section`
  display: grid;
  gap: 14px;
`;

export const Line = styled.span<{ $width?: string; $height?: string }>`
  display: block;
  width: ${({ $width }) => $width ?? '100%'};
  max-width: 100%;
  height: ${({ $height }) => $height ?? '12px'};
  border-radius: 999px;
  background: ${shimmer};
  background-size: 240% 100%;
  animation: ${pulse} 1.2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Block = styled(Line)<{ $height?: string }>`
  width: 100%;
  height: ${({ $height }) => $height ?? '120px'};
  border-radius: 10px;
`;

export const Card = styled.article`
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const Grid = styled.section<{ $minCardWidth: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${({ $minCardWidth }) => $minCardWidth}), 1fr));
  gap: 12px;
`;

export const Table = styled.section`
  display: grid;
  gap: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const TableHeader = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const TableRow = styled(TableHeader)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};

  &:last-child {
    border-bottom: 0;
  }
`;
