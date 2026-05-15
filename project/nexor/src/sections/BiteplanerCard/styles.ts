import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  background: #111113;
  border-radius: 12px;
  text-decoration: none;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: border-color 200ms ease, transform 200ms ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.14);
    transform: translateY(-2px);
  }
  &:focus-visible { outline: 2px solid #3C7C56; outline-offset: 2px; }
`;

export const CardHero = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
  padding: 48px 40px 40px;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

export const AccentLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3C7C56 0%, #1C5E3A 100%);
`;

export const Logo = styled.img`
  width: 180px;
  height: auto;
  object-fit: contain;
  margin-bottom: 24px;
  display: block;
`;

export const Tagline = styled.p`
  font-size: 14px;
  color: rgba(250, 250, 250, 0.55);
  line-height: 1.65;
  margin: 0;
  max-width: 380px;
`;

export const CardBody = styled.div`
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Features = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Feature = styled.li`
  font-size: 13px;
  color: rgba(250, 250, 250, 0.65);
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '';
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #3C7C56;
    flex-shrink: 0;
  }
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
`;

export const Badges = styled.div`
  display: flex;
  gap: 8px;
`;

export const Badge = styled.span`
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 2px;
`;

export const Cta = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #3C7C56;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: gap 150ms ease;

  ${Card}:hover & {
    gap: 10px;
  }
`;
