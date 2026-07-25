import styled from 'styled-components';

export const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.section`
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 8px;
  background: #fff;
`;

export const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 11px 10px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.1);
    text-align: left;
    vertical-align: middle;
  }

  th {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  button {
    min-height: 34px;
    padding: 0 12px;
    border: 1px solid rgba(0, 156, 74, 0.35);
    border-radius: 6px;
    background: #f6fdf8;
    color: #04783d;
    font-weight: 700;
    cursor: pointer;
  }
`;

export const Alert = styled.p`
  margin: 0;
  color: #b42318;
  font-weight: 700;
`;

export const Success = styled.p`
  margin: 0;
  color: #04783d;
  font-weight: 700;
`;

export const SplitHint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
`;