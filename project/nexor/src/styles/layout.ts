import { css } from 'styled-components';

// Avoid `100vw` full-bleed hacks, which include the scrollbar width and can
// push public pages a few pixels past the viewport.
export const fullBleedSection = css`
  width: 100%;
  margin-left: 0;
`;

export const pageContainer = css`
  width: min(calc(100% - clamp(40px, 8vw, 96px)), ${({ theme }) => theme.maxWidth});
  max-width: ${({ theme }) => theme.maxWidth};
  margin-right: auto;
  margin-left: auto;
`;
