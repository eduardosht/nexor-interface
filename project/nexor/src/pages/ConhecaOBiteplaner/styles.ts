import styled from 'styled-components';

const pageBackground = 'oklch(98.5% 0.006 142)';
const surface = 'oklch(99.3% 0.004 142)';
const mutedSurface = 'oklch(96.5% 0.011 142)';
const border = 'oklch(88% 0.018 145)';
const accent = 'oklch(38% 0.105 150)';
const accentSoft = 'oklch(93% 0.03 150)';

export const Page = styled.main`
  min-height: 100vh;
  min-height: 100svh;
  background: ${pageBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Header = styled.header`
  border-bottom: 1px solid ${border};
  background: ${surface};
`;

export const HeaderInner = styled.div`
  width: min(100%, 1360px);
  margin: 0 auto;
  padding: clamp(92px, 11vw, 128px) clamp(20px, 4vw, 56px) clamp(28px, 5vw, 48px);
`;

export const Kicker = styled.p`
  margin: 0 0 10px;
  color: ${accent};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.35;
`;

export const Title = styled.h1`
  max-width: 900px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(1.75rem, 3vw, 2.75rem);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.08;
`;

export const Lead = styled.p`
  max-width: 760px;
  margin: 18px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  line-height: 1.65;
`;

export const Layout = styled.div`
  width: min(100%, 1360px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  gap: clamp(28px, 5vw, 72px);
  padding: 34px clamp(20px, 4vw, 56px) 80px;

  @media (max-width: 860px) {
    display: block;
    padding-top: 24px;
  }
`;

export const Sidebar = styled.nav`
  position: sticky;
  top: 96px;
  align-self: start;
  padding: 4px 0;

  @media (max-width: 860px) {
    position: static;
    padding: 0 0 22px;
    margin-bottom: 8px;
    border-bottom: 1px solid ${border};
  }
`;

export const SidebarTitle = styled.p`
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
`;

export const SidebarList = styled.ul`
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;

  a {
    display: block;
    border-radius: 6px;
    padding: 8px 10px;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    line-height: 1.35;
    text-decoration: none;
  }

  a:hover,
  a:focus-visible {
    background: ${accentSoft};
    color: ${accent};
    outline: none;
  }

  @media (max-width: 860px) {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;

    a {
      white-space: nowrap;
    }
  }
`;

export const Article = styled.article`
  max-width: 920px;
`;

export const Section = styled.section`
  scroll-margin-top: 96px;
  padding: 0 0 34px;
  border-bottom: 1px solid ${border};

  & + & {
    padding-top: 34px;
  }

  &:last-child {
    border-bottom: 0;
  }
`;

export const SectionTitle = styled.h2`
  margin: 0 0 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(1.15rem, 1.8vw, 1.45rem);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.25;
`;

export const Paragraph = styled.p`
  max-width: 72ch;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  line-height: 1.72;
`;

export const DefinitionList = styled.dl`
  display: grid;
  margin: 0;
  border-top: 1px solid ${border};
`;

export const DefinitionItem = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 260px) minmax(0, 1fr);
  gap: clamp(18px, 4vw, 48px);
  padding: 18px 0;
  border-bottom: 1px solid ${border};

  &:last-child {
    border-bottom: 0;
  }

  dt {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 15px;
    font-weight: 700;
    line-height: 1.45;
  }

  dd {
    max-width: 72ch;
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 15px;
    line-height: 1.7;
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

export const NoteList = styled.ul`
  max-width: 76ch;
  margin: 0;
  padding: 0 0 0 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  line-height: 1.72;

  li + li {
    margin-top: 10px;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border: 1px solid ${border};
  border-radius: 8px;
  background: ${surface};
  font-size: 14px;
  line-height: 1.55;

  th,
  td {
    padding: 14px 16px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid ${border};
  }

  th {
    background: ${mutedSurface};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 700;
  }

  td {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  tr:last-child td {
    border-bottom: 0;
  }

  @media (max-width: 640px) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
`;
