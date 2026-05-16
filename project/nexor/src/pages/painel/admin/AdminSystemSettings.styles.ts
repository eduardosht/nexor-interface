import styled from 'styled-components';

export const FlowHeader = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

export const DesktopSettingsWrap = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileSettingsWrap = styled.section`
  @media (min-width: 769px) {
    display: none;
  }

  @media (max-width: 768px) {
    padding-bottom: calc(76px + env(safe-area-inset-bottom));
  }
`;
