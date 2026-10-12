import styled from 'styled-components';
import { pageContainer, fullBleedSection } from '../../styles/layout';

export const Section = styled.section`
  ${fullBleedSection}
  background: #f4f5f4;
  padding: 80px 0;
`;

export const Inner = styled.div`
  ${pageContainer}
`;

export const Heading = styled.h2`
  max-width: 760px;
  margin: 0;
  color: #171717;
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.08;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin-top: 38px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

export const Item = styled.article`
  padding-top: 18px;
  border-top: 1px solid #c8c8c8;
  h3 { margin: 0 0 10px; font-size: 16px; color: #171717; }
  p { margin: 0; color: #525252; font-size: 14px; line-height: 1.65; }
`;
