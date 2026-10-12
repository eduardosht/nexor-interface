import styled from 'styled-components';
import { fullBleedSection, pageContainer } from '../../styles/layout';

export const Section = styled.section`
  ${fullBleedSection}
  padding: 72px 0;
  background: #171717;
  color: #fff;
`;
export const Inner = styled.div`
  ${pageContainer}
`;
export const Title = styled.h2`
  margin: 0 0 28px;
  font-size: clamp(30px, 4vw, 44px);
  line-height: 1.1;
`;
export const Steps = styled.ol`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
  li { padding-top: 16px; border-top: 1px solid #676767; color: #d7d7d7; }
  strong { display: block; margin-bottom: 8px; color: #fff; font-size: 16px; }
  @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
`;
