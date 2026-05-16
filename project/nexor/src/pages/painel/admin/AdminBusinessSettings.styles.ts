import styled from 'styled-components';

export const ContractsInlineGrid = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 12px;
`;

export const DesktopSettingsWrap = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileSettingsWrap = styled.section`
  @media (max-width: 768px) {
    padding-bottom: calc(76px + env(safe-area-inset-bottom));
  }
`;
