import styled from 'styled-components';
import {
  AuthCard,
  AuthFormSide,
  AuthPage,
  AuthVisualContent,
  AuthVisualSide,
  Button as BaseButton
} from '../auth-shared';

export const Page = AuthPage;
export const FormSide = styled(AuthFormSide)``;
export const Card = styled(AuthCard)`
  max-width: 560px;
`;

export const VisualSide = styled(AuthVisualSide)`
  &::before,
  &::after {
    display: none;
  }
`;

export const VisualContent = styled(AuthVisualContent)`
  isolation: isolate;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.28);
    transform: translate(-50%, -50%) scale(0.82);
    opacity: 0;
    animation: cadastro-ripple 4.8s ease-out infinite;
    pointer-events: none;
    z-index: -1;
  }

  &::after {
    animation-delay: 2.4s;
  }

  @keyframes cadastro-ripple {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.72);
    }

    18% {
      opacity: 0.5;
    }

    72% {
      opacity: 0.16;
    }

    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(2.35);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after {
      animation: none;
      opacity: 0.28;
      transform: translate(-50%, -50%) scale(1.35);
    }
  }
`;

export const VisualLogoImage = styled.img`
  width: min(260px, 64%);
  height: auto;
  display: block;
`;

export const StepList = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
`;

export const StepItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

export const StepConnector = styled.div`
  flex: 1;
  height: 1px;
  background: ${({ theme }) => theme.colors.borderDefault};
  margin: 0 8px;
`;

export const StepBadge = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const StepNumber = styled.div<{ $active: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  background: ${({ $active }) => ($active ? '#171717' : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : '#737373')};
  border: 1px solid ${({ $active }) => ($active ? '#171717' : '#E0E0E0')};
`;

export const StepLabel = styled.span<{ $active: boolean }>`
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  color: ${({ $active }) => ($active ? '#171717' : '#737373')};
  white-space: nowrap;
`;

export const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const TypeCard = styled.button<{ $selected: boolean }>`
  text-align: left;
  border: 2px solid ${({ $selected }) => ($selected ? '#171717' : '#E0E0E0')};
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 16px;
  align-items: start;
  position: relative;
  transition: border-color 0.15s;

  strong {
    font-size: 1rem;
    font-weight: 600;
    color: #171717;
    display: block;
    margin-bottom: 4px;
  }

  span {
    font-size: 13px;
    color: #525252;
    line-height: 1.4;
  }

  &:hover {
    border-color: ${({ $selected }) => ($selected ? '#171717' : '#C8C8C8')};
  }
`;

export const TypeCardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
`;

export const TypeCardCheck = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #171717;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? '1' : '0')};
  transition: opacity 0.15s;

  svg {
    color: #fff;
  }
`;

export const TypeCardBody = styled.div`
  display: grid;
  gap: 4px;
`;

export const TypeCardHeading = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #171717;
`;

export const Fields = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;


export const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

export const Button = styled(BaseButton)<{ $secondary?: boolean }>`
  background: ${({ theme, $secondary }) => ($secondary ? '#fff' : theme.colors.textPrimary)};
  color: ${({ theme, $secondary }) => ($secondary ? theme.colors.textPrimary : '#fff')};
  border: 1px solid ${({ theme, $secondary }) => ($secondary ? theme.colors.borderDefault : theme.colors.textPrimary)};
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FooterDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
  margin: 0;
`;

export const FooterLinks = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;

  a {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 600;
    text-decoration: underline;
  }
`;

export const StepSectionTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: #171717;
`;

export const StepSectionDesc = styled.p`
  margin: 0 0 16px;
  font-size: 13px;
  color: #525252;
`;

export const ErrorText = styled.p`
  margin: 0;
  color: #9f1d1d;
  font-size: 13px;
`;

export const EyeToggleButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: inline-flex;
  align-items: center;
  line-height: 1;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.textPrimary};
    border-radius: 4px;
  }
`;
