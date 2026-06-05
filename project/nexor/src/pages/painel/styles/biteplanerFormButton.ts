import { css } from 'styled-components';

export const biteplanerButtonSurfaceStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 max-content;
  box-sizing: border-box;
  inline-size: max-content;
  width: max-content;
  max-width: none;
  min-inline-size: max-content;
  min-width: max-content;
  min-height: 52px;
  padding: 0 22px 0 30px;
  border: 1px solid #15803d;
  border-radius: 8px;
  background: #15803d;
  color: #f8fbff;
  box-shadow: 0 14px 30px rgba(21, 128, 61, 0.24);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  overflow-wrap: normal;
  text-align: center;
  text-transform: none;
  white-space: nowrap;
  text-wrap: nowrap;
  cursor: pointer;
  gap: 0;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease;

  > span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 22px;
    flex: 0 0 max-content;
    inline-size: max-content;
    width: max-content;
    max-width: none;
    min-inline-size: max-content;
    min-width: max-content;
    line-height: inherit;
    overflow-wrap: normal;
    white-space: inherit;
    text-wrap: inherit;
  }

  svg {
    flex: 0 0 auto;
  }
`;

export const biteplanerButtonHoverStyles = css`
  &:not(:disabled):hover {
    transform: translateY(-1px);
    border-color: #166534;
    background: #166534;
    color: #f8fbff;
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

export const biteplanerFormButtonStyles = css`
  && button {
    ${biteplanerButtonSurfaceStyles}
  }

  && button[data-variant='secondary'] {
    border-color: #15803d;
    background: transparent;
    color: #15803d;
    box-shadow: none;
  }

  && button:not(:disabled):hover {
    transform: translateY(-1px);
    border-color: #166534;
    background: #166534;
    color: #f8fbff;
    box-shadow: 0 18px 38px rgba(21, 128, 61, 0.28);
  }

  && button[data-variant='secondary']:not(:disabled):hover {
    border-color: #166534;
    background: rgba(21, 128, 61, 0.08);
    color: #166534;
    box-shadow: 0 10px 22px rgba(21, 128, 61, 0.12);
  }

  && button[data-variant='secondary']:not(:disabled):active {
    background: rgba(21, 128, 61, 0.14);
    color: #14532d;
    box-shadow: none;
  }

  && button:disabled {
    border-color: ${({ theme }) => theme.colors.borderDefault};
    background: ${({ theme }) => theme.colors.bgInset};
    color: ${({ theme }) => theme.colors.textMuted};
    box-shadow: none;
    cursor: not-allowed;
  }

  @media (max-width: 760px) {
    && button {
      inline-size: max-content;
      width: max-content;
      max-width: none;
      min-inline-size: max-content;
      min-width: max-content;
      gap: 12px;
      padding: 12px 14px;
      white-space: nowrap;

      > span {
        gap: 12px;
        inline-size: max-content;
        width: max-content;
        max-width: none;
        min-inline-size: max-content;
        min-width: max-content;
      }
    }
  }
`;
