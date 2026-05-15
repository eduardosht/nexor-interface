import styled from 'styled-components';

export const FooterDivider = styled.hr`
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 0;
`;

export const FooterLinks = styled.p`
  margin: 0;
  font-size: 14px;
  color: #737373;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;

  a {
    color: #171717;
    font-weight: 600;
    text-decoration: underline;
  }
`;

export const DemoSection = styled.section`
  display: grid;
  gap: 12px;
  padding: 18px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 14px;
  background: #fafafa;
`;

export const DemoTitle = styled.h2`
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #525252;
`;

export const DemoDescription = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #737373;
`;

export const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const DemoTabs = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const DemoTab = styled.button`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #ffffff;
  color: #525252;
  padding: 8px 6px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;

  &[aria-selected='true'] {
    background: #171717;
    border-color: #171717;
    color: #fafafa;
  }
`;

export const DemoButton = styled.button`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #ffffff;
  color: #171717;
  padding: 12px 14px;
  text-align: left;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;

  &:hover {
    background: #f5f5f5;
    border-color: #c8c8c8;
    transform: translateY(-1px);
  }
`;
