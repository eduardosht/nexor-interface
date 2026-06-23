import { motion } from 'framer-motion';
import styled from 'styled-components';
import { fullBleedSection, pageContainer } from '../../styles/layout';

export const Section = styled.section`
  ${fullBleedSection}
  background: #111113;
  padding: 100px 0;

  @media (max-width: 768px) {
    padding: 40px 0;
  }
`;

export const Inner = styled.div`
  ${pageContainer}
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 56px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

export const Title = styled.h2`
  font-size: clamp(3rem, 3.5vw, 5rem);
  font-weight: 800;
  letter-spacing: 0;
  color: #fafafa;
  margin: 0 0 16px;

  @media (max-width: 640px) {
    font-size: clamp(2.25rem, 10vw, 3rem);
  }
`;

export const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(250, 250, 250, 0.08);
  border: 1px solid rgba(250, 250, 250, 0.08);
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled(motion.article)`
  background: #111113;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: background 200ms ease;
  position: relative;

  &:hover {
    background: #18181b;
  }
`;

export const ProductBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(250, 250, 250, 0.07);
  border: 1px solid rgba(250, 250, 250, 0.1);
  border-radius: 6px;
  padding: 4px 8px;

  img {
    height: 24px;
    width: auto;
    display: block;
  }
`;

export const QuoteMark = styled.span`
  font-size: 40px;
  line-height: 1;
  color: rgba(250, 250, 250, 0.15);
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 700;
  display: block;
  margin-bottom: -32px;
`;

export const QuoteText = styled.blockquote`
  font-size: 15px;
  line-height: 1.7;
  color: rgba(250, 250, 250, 0.75);
  margin: 0;
  flex: 1;
`;

export const Divider = styled.div`
  height: 1px;
  background: rgba(250, 250, 250, 0.08);
`;

export const Attribution = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Name = styled.p`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #fafafa;
  margin: 0;
`;

export const Context = styled.p`
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(250, 250, 250, 0.35);
  margin: 0;
`;

