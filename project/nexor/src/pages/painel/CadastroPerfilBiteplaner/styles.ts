import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const Page = styled.div`
  width: min(100%, 1120px);
  display: grid;
  gap: 22px;
`;

export const ProfileShell = styled.section`
  display: grid;
  gap: 24px;
  padding: 34px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 14px;
  background:
    radial-gradient(circle at 85% 6%, rgba(34, 197, 94, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(248, 252, 255, 0.98) 0%, rgba(255, 255, 255, 0) 42%),
    ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);

  @media (max-width: 760px) {
    gap: 18px;
    padding: 18px;
  }
`;

export const Header = styled.div`
  display: grid;
  gap: 10px;
`;

export const ProfileHero = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  align-items: center;
  gap: 30px;
  min-height: 260px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
    min-height: 0;
  }
`;

export const HeroContent = styled.div`
  display: grid;
  gap: 18px;
  max-width: 700px;
`;

export const HeroTitleRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 18px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const HeroIcon = styled.span`
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  border-radius: 999px;
  background: linear-gradient(145deg, #ecfdf3 0%, #f7fff9 100%);
  color: #008d3f;

  @media (max-width: 560px) {
    width: 58px;
    height: 58px;

    svg {
      width: 34px;
      height: 34px;
    }
  }
`;

export const BackLink = styled(Link)`
  width: fit-content;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    text-decoration: underline;
  }
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 900;
  line-height: 1.06;
  letter-spacing: 0;
`;

export const Description = styled.p`
  max-width: 720px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.65;
`;

export const HeroInfoCallout = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  max-width: 680px;
  padding: 17px 20px;
  border: 1px solid rgba(0, 156, 74, 0.22);
  border-left: 4px solid #009c4a;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(240, 253, 244, 0.96) 0%, rgba(248, 255, 251, 0.88) 100%);
  color: #07152f;
  font-size: 14px;
  line-height: 1.6;

  svg {
    color: #009c4a;
  }

  @media (max-width: 560px) {
    align-items: flex-start;
    padding: 15px;
  }
`;

export const HeroVisual = styled.div`
  position: relative;
  min-height: 250px;

  &::before {
    content: '';
    position: absolute;
    inset: 14px 0 28px 10px;
    border-radius: 999px;
    background: rgba(34, 197, 94, 0.14);
  }

  @media (max-width: 920px) {
    display: none;
  }
`;

export const HeroClipboard = styled.div`
  position: absolute;
  right: 34px;
  top: 28px;
  display: grid;
  gap: 14px;
  width: 184px;
  min-height: 218px;
  padding: 28px 24px;
  border: 3px solid #00a94f;
  border-left-color: #dbe6f3;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  color: #009c4a;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.17);
  transform: rotate(2deg);

  > span:not(:last-child) {
    display: block;
    height: 9px;
    border-radius: 999px;
    background: #dce5f1;
  }

  > span:nth-child(2) {
    width: 88%;
    background: linear-gradient(90deg, #22c55e 0 64%, #dce5f1 64% 100%);
  }

  > span:nth-child(3) {
    width: 74%;
  }

  > span:nth-child(4) {
    width: 94%;
  }
`;

export const HeroShield = styled.span`
  position: absolute;
  right: -32px;
  bottom: 24px;
  display: grid;
  place-items: center;
  width: 72px;
  height: 82px;
  border-radius: 999px 999px 18px 18px;
  background: linear-gradient(180deg, #36d579 0%, #008d3f 100%);
  color: #ffffff;
  box-shadow: 0 18px 34px rgba(0, 156, 74, 0.26);
`;

export const Banner = styled.div`
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.6;
`;

export const Form = styled.form`
  display: grid;
  gap: 20px;
`;

export const Section = styled.fieldset`
  display: grid;
  gap: 16px;
  min-width: 0;
  margin: 0;
  padding: 0 0 0 16px;
  border: 0;
  border-left: 2px solid rgba(148, 163, 184, 0.34);
  background: transparent;
  box-shadow: none;

  @media (max-width: 760px) {
    gap: 14px;
    padding-left: 12px;
  }
`;

export const SectionHeader = styled.legend`
  display: grid;
  grid-template-columns: auto auto minmax(32px, 1fr);
  align-items: center;
  gap: 10px;
  width: 100%;
  margin: 0 0 8px;
  padding: 0;

  &::after {
    content: '';
    height: 1px;
    background: rgba(148, 163, 184, 0.45);
  }
`;

export const StepBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid #009c4a;
  background: #009c4a;
  color: #ffffff;
  box-shadow: inset 0 0 0 4px #ffffff;
  font-size: 12px;
  font-weight: 800;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: #07152f;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0;
`;

export const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;

  > * {
    grid-column: span 6;
    min-width: 0;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;

    > * {
      grid-column: 1 / -1;
    }
  }
`;

export const FullField = styled.div`
  grid-column: 1 / -1;
`;

export const DocumentPurposeCard = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border: 1px solid rgba(0, 156, 74, 0.2);
  border-radius: 8px;
  background: #f6fdf8;
  color: ${({ theme }) => theme.colors.textPrimary};

  svg {
    color: #009c4a;
  }
`;

export const DocumentPurposeTitle = styled.p`
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.4;
`;

export const DocumentPurposeList = styled.ul`
  display: grid;
  gap: 4px;
  margin: 0;
  padding-left: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.5;

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 800;
  }
`;

export const SectionIntro = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.6;
`;

export const SectionSubtitle = styled.p`
  margin: -6px 0 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.55;
`;

export const ClinicSection = styled.fieldset`
  display: grid;
  gap: 14px;
  min-width: 0;
  margin: 0;
  padding: 0 0 0 16px;
  border: 0;
  border-left: 2px solid rgba(148, 163, 184, 0.34);
`;

export const ClinicSectionHeader = styled.legend`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  margin: 0 0 10px;
  padding: 0;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ClinicSectionTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0;
`;

export const ClinicSectionIntro = styled.p`
  max-width: 620px;
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.55;
`;

export const ClinicCard = styled.div`
  display: grid;
  gap: 14px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
`;

export const ClinicCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const ClinicTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0;
`;

export const TermsLabel = styled.span`
  font-weight: 400;

  strong {
    font-weight: 800;
  }
`;

export const TermsReadIntro = styled.p`
  margin: -6px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.6;
`;

export const TermsReadLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);

  > :first-child {
    order: 1;
  }

  button[type='button'] {
    order: 2;
  }

  button[type='submit'] {
    order: 3;
  }

  @media (max-width: 760px) {
    align-items: stretch;
    justify-content: stretch;

    > * {
      flex: 1 1 100%;
    }
  }
`;

export const ActionPrivacyNote = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  width: fit-content;
  max-width: 360px;
  margin-right: auto;
  padding: 11px 13px;
  border: 1px solid rgba(0, 156, 74, 0.18);
  border-radius: 8px;
  background: #f6fdf8;
  color: #405169;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;

  svg {
    color: #009c4a;
  }

  strong {
    color: #008d3f;
    font-weight: 800;
  }
`;
