import styled from 'styled-components';

export const ReadinessCell = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`;

export const ReadinessText = styled.span`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
