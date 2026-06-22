import { css } from 'styled-components';

export const biteplanerButtonSurfaceStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 auto;
  gap: 8px;
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  min-height: 52px;
  padding: 10px 18px;
  border: 1px solid #15803d;
  border-radius: 8px;
  background: #15803d;
  color: #f8fbff;
  box-shadow: none;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  overflow-wrap: break-word;
  text-align: center;
  text-transform: none;
  white-space: normal;
  cursor: pointer;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease;

  [data-button-content] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 0 1 100%;
    flex-wrap: wrap;
    max-width: 100%;
    min-width: 0;
    line-height: inherit;
    overflow-wrap: inherit;
    white-space: inherit;
  }

  [data-button-label] {
    flex: 0 1 auto;
    max-width: 100%;
    min-width: 0;
    overflow-wrap: inherit;
    white-space: inherit;
  }

  [data-button-icon] {
    flex: 0 0 auto;
  }

  svg {
    flex: 0 0 auto;
  }
`;

export const biteplanerButtonHoverStyles = css`
  &:not(:disabled):hover {
    border-color: #166534;
    background: #166534;
    color: #f8fbff;
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
    border-color: #166534;
    background: #166534;
    color: #f8fbff;
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
      max-width: 100%;
      min-width: 0;
      min-height: 38px;
      padding: 8px 12px;
      font-size: 12px;
      white-space: normal;

      [data-button-content],
      [data-button-label] {
        gap: 8px;
        max-width: 100%;
        min-width: 0;
      }

      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
`;
