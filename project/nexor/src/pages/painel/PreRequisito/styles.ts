import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Page = styled.div`
  display: grid;
  gap: 26px;
`;

export const Banner = styled.div`
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const GuidanceBanner = styled(Banner)`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 18px;
  padding: 20px 22px;
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #0f2a5f;

  p {
    margin: 0;
  }

  p + p {
    margin-top: 2px;
    color: #334155;
  }
`;

export const InfoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 2px solid #2563eb;
  border-radius: 999px;
  color: #2563eb;
`;

export const RequiredStar = styled.span`
  color: inherit;
  font-weight: 800;
`;

export const OnboardingHeroTitle = styled.span`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 28px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const OnboardingHeroIcon = styled.span`
  position: relative;
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 68% 72%, rgba(21, 128, 61, 0.18), transparent 28%),
    linear-gradient(145deg, #ecfdf3 0%, #f7fff9 100%);
  color: #15803d;

  @media (max-width: 720px) {
    width: 64px;
    height: 64px;

    svg {
      width: 34px;
      height: 34px;
    }
  }
`;

export const OnboardingHeroIconBadge = styled.span`
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: #15803d;
  color: #f8fbff;
  box-shadow: 0 10px 22px rgba(21, 128, 61, 0.24);

  @media (max-width: 720px) {
    right: 4px;
    bottom: 4px;
    width: 20px;
    height: 20px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

export const OnboardingCard = styled.section`
  display: grid;
  gap: 28px;
  padding: 34px 42px 28px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(247, 255, 249, 0.72) 0%, rgba(255, 255, 255, 0) 36%),
    ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);

  @media (max-width: 920px) {
    padding: 24px;
  }

  @media (max-width: 560px) {
    padding: 18px;
  }
`;

export const OnboardingIntro = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 18px;
  }
`;

export const OnboardingIntroCopy = styled.div`
  display: grid;
  gap: 18px;
  max-width: 900px;
  color: #0f1b36;
  font-size: 15px;
  line-height: 1.62;

  p {
    margin: 0;
  }
`;

export const OnboardingCardTitle = styled.h2`
  margin: 0;
  color: #07142e;
  font-size: 22px;
  font-weight: 850;
  line-height: 1.15;
`;

export const RequiredHint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 700;
`;

export const OnboardingDivider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 0;
  border: 0;
  background: ${({ theme }) => theme.colors.borderDefault};
`;

export const PrivacyGate = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 22px;
  color: #0f1b36;
  font-size: 15px;
  line-height: 1.62;

  @media (max-width: 720px) {
    gap: 18px;
  }
`;

export const PrivacyGateIcon = styled.span`
  display: grid;
  place-items: center;
  width: 92px;
  height: 92px;
  border-radius: 14px;
  background:
    radial-gradient(circle at 70% 20%, rgba(21, 128, 61, 0.12), transparent 32%),
    linear-gradient(145deg, #ecfdf3 0%, #f8fff9 100%);
  color: #15803d;
`;

export const PrivacyGateContent = styled.div`
  display: grid;
  gap: 22px;
`;

export const PrivacyGateLabel = styled.label`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 22px;
  align-items: flex-start;
  cursor: pointer;

  input {
    appearance: none;
    display: grid;
    place-content: center;
    width: 24px;
    height: 24px;
    margin-top: 1px;
    border-radius: 6px;
    border: 1px solid #94a3b8;
    background: #f8fafc;
    transition:
      background 0.16s ease,
      border-color 0.16s ease,
      box-shadow 0.16s ease;
  }

  input::after {
    content: '';
    width: 6px;
    height: 11px;
    margin-bottom: 2px;
    border: solid #f8fff9;
    border-width: 0 2px 2px 0;
    opacity: 0;
    transform: rotate(45deg) scale(0.8);
    transition:
      opacity 0.16s ease,
      transform 0.16s ease;
  }

  input:checked {
    border-color: #15803d;
    background: #15803d;
  }

  input:checked::after {
    opacity: 1;
    transform: rotate(45deg) scale(1);
  }

  input:focus-visible {
    outline: 2px solid rgba(21, 128, 61, 0.18);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(21, 128, 61, 0.08);
  }
`;

export const PrivacyGateLink = styled(Link)`
  color: #15803d;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
`;

export const PrivacyGateList = styled.ul`
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  color: #0f1b36;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 16px;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px dashed #d8dfed;
  }

  li:first-child {
    padding-top: 0;
  }

  svg {
    display: grid;
    place-self: center;
    width: 48px;
    height: 48px;
    padding: 13px;
    border-radius: 999px;
    background: #dcfce7;
    color: #15803d;
  }
`;

export const PrivacyGateText = styled.p`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  margin: 0;
  padding: 16px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f0fdf4;
  color: #334155;
  font-size: 14px;
  line-height: 1.55;

  > svg {
    color: #15803d;
  }
`;

export const PrivacyGateAction = styled.button`
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 22px;
  min-height: 52px;
  padding: 0 22px 0 30px;
  border: 1px solid #15803d;
  border-radius: 8px;
  background: #15803d;
  color: #f8fbff;
  box-shadow: 0 14px 30px rgba(21, 128, 61, 0.24);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;

  &:not(:disabled):hover {
    transform: translateY(-1px);
    background: #166534;
    box-shadow: 0 18px 38px rgba(21, 128, 61, 0.28);
  }

  &:disabled {
    border-color: ${({ theme }) => theme.colors.borderDefault};
    background: ${({ theme }) => theme.colors.bgInset};
    color: ${({ theme }) => theme.colors.textMuted};
    box-shadow: none;
    cursor: not-allowed;
  }
`;

export const OnboardingCompletion = styled.div`
  display: grid;
  justify-items: center;
  gap: 14px;
  padding: 34px 24px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgElevated};
  text-align: center;
`;

export const OnboardingCompletionIcon = styled.span`
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.greenGhost};
  color: ${({ theme }) => theme.colors.green};
  font-size: 30px;
  font-weight: 900;
  animation: completionPulse 1.4s ease-in-out infinite;

  @keyframes completionPulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(21, 128, 61, 0.16);
    }

    50% {
      transform: scale(1.06);
      box-shadow: 0 0 0 12px rgba(21, 128, 61, 0);
    }
  }
`;

export const OnboardingCompletionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 20px;
  font-weight: 800;
`;

export const OnboardingCompletionText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  line-height: 1.6;
`;

export const OnboardingCountdown = styled.p`
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 700;
`;

export const ImpedimentBanner = styled(Banner)`
  border-color: #fecaca;
  background: #fef2f2;
  color: #7f1d1d;
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.08);

  > strong {
    color: #991b1b;
  }
`;

export const ImpedimentList = styled.ul`
  display: grid;
  gap: 10px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
`;

export const ImpedimentItem = styled.li`
  display: grid;
  gap: 2px;

  strong {
    font-size: 14px;
    color: #991b1b;
  }

  span {
    color: #7f1d1d;
  }
`;

export const Content = styled.div`
  display: grid;
  gap: 18px;

  > form {
    display: grid;
    gap: 18px;
  }
`;

export const Section = styled.section`
  display: grid;
  gap: 18px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const StepBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgElevated};
  font-size: 14px;
  font-weight: 800;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 20px;
  font-weight: 800;
`;

export const QuestionBlock = styled.div`
  display: grid;
  gap: 12px;
`;

export const QuestionIntro = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const QuestionRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 254px);
  align-items: center;
  gap: 18px;
  padding: 0 0 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }

  > fieldset {
    grid-column: 1 / -1;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;
