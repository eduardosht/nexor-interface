import styled from 'styled-components';
import { motion } from 'motion/react';

export const AuthPage = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 60fr 40fr;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const AuthFormSide = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px 56px;
  background: #fff;
  overflow-y: auto;

  @media (max-width: 1100px) {
    padding: 56px 40px;
  }

  @media (max-width: 640px) {
    padding: 48px 24px;
  }
`;

export const AuthBackLink = styled.a`
  position: absolute;
  top: 28px;
  left: 32px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 8px;
  transition: background 160ms ease, color 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.bgInset};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: 640px) {
    top: 16px;
    left: 16px;
  }
`;

export const AuthVisualSide = styled.div`
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.textPrimary};

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.04),
      inset 0 0 36px rgba(255, 255, 255, 0.035);
    pointer-events: none;
    transform: translate(-50%, -50%) scale(0.65);
    opacity: 0;
    animation: auth-visual-ripple 5.6s ease-out infinite;
  }

  &::after {
    animation-delay: 2.8s;
  }

  @keyframes auth-visual-ripple {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.62);
    }

    18% {
      opacity: 0.44;
    }

    62% {
      opacity: 0.16;
    }

    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(2.7);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after {
      animation: none;
      opacity: 0.18;
    }

    &::before {
      transform: translate(-50%, -50%) scale(1.1);
    }

    &::after {
      transform: translate(-50%, -50%) scale(1.7);
    }
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

export const AuthVisualContent = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 32px;
  z-index: 1;
`;

export const AuthVisualLogo = styled.div`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #fff;
`;

export const AuthVisualTagline = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  max-width: 220px;
  letter-spacing: 0.01em;
`;

export const AuthVisualDivider = styled.div`
  width: 32px;
  height: 1px;
  background: rgba(255, 255, 255, 0.18);
`;

export const AuthCard = styled.section`
  width: 100%;
  max-width: 440px;
  display: grid;
  gap: 28px;
`;

export const Eyebrow = styled.p`
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Title = styled.h1`
  margin: 8px 0 16px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 0.95;
  letter-spacing: -0.03em;
`;

export const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;
`;

export const Form = styled.form`
  display: grid;
  gap: 16px;
`;

export const Field = styled.label`
  display: grid;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Input = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 14px;
  padding: 14px 16px;
  font: inherit;
  background: #fff;
  color: ${({ theme }) => theme.colors.textPrimary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.textPrimary};
    box-shadow: 0 0 0 3px rgba(23, 23, 23, 0.08);
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #fff inset;
    box-shadow: 0 0 0 1000px #fff inset;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

export const PasswordWrapper = styled.div`
  position: relative;
`;

export const ToggleButton = styled.button`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
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

export const PasswordInput_ = styled(Input)`
  padding-right: 44px;
`;

export const Button = styled(motion.button)`
  position: relative;
  border: none;
  border-radius: 14px;
  padding: 15px 18px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: #fff;
  transition: box-shadow 180ms ease, background 180ms ease;

  &::before {
    content: '';
    width: 0;
    height: 0;
    opacity: 0;
  }

  &[aria-busy='true'] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  &[aria-busy='true']::before {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.34);
    border-top-color: #fff;
    opacity: 1;
    animation: auth-button-spin 720ms linear infinite;
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  @keyframes auth-button-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const InlineLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

export const Alert = styled.div`
  border-radius: 14px;
  padding: 14px 16px;
  background: #fff0f0;
  color: #9f1d1d;
  border: 1px solid #f2c8c8;
`;

export const Success = styled.div`
  border-radius: 14px;
  padding: 14px 16px;
  background: #eef8f0;
  color: #1f5130;
  border: 1px solid #cddfce;
`;

export const Muted = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
