import { getBrandTokens } from '@nexor/design-system';

const nexorTokens = getBrandTokens('nexor');

type ThemeColors = {
  bgBase: string;
  bgElevated: string;
  bgInset: string;
  textPrimary: string;
  textSecondary: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  bg: string;
  bg2: string;
  surface: string;
  surface2: string;
  surface3: string;
  chrome: string;
  text: string;
  textMuted: string;
  textSoft: string;
  border: string;
  accent: string;
  green: string;
  greenGhost: string;
  error: string;
  errorBg: string;
  errorBorder: string;
  successBg: string;
  successBorder: string;
  shadow: string;
};

export interface Theme {
  fonts: {
    display: string;
    body: string;
    mono: string;
  };
  space: (n: number) => string;
  maxWidth: string;
  colors: ThemeColors;
}

const baseTheme = {
  fonts: {
    display: nexorTokens.fonts.display,
    body: nexorTokens.fonts.body,
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  space: (n: number) => `${n * 4}px`,
  maxWidth: '1200px',
} as const;

const colors: ThemeColors = {
  bgBase: '#FAFAFA',
  bgElevated: '#FFFFFF',
  bgInset: '#F0F0F0',
  textPrimary: '#171717',
  textSecondary: '#525252',
  borderSubtle: '#F0F0F0',
  borderDefault: '#E0E0E0',
  borderStrong: '#C8C8C8',
  bg: '#FAFAFA',
  bg2: '#F5F5F5',
  surface: '#FFFFFF',
  surface2: '#F7F7F7',
  surface3: '#EFEFEF',
  chrome: '#FAFAFA',
  text: '#171717',
  textMuted: '#525252',
  textSoft: '#737373',
  border: '#E0E0E0',
  accent: '#111111',
  green: '#15803D',
  greenGhost: 'rgba(21,128,61,0.10)',
  error: '#B91C1C',
  errorBg: 'rgba(185,28,28,0.08)',
  errorBorder: 'rgba(185,28,28,0.24)',
  successBg: 'rgba(21,128,61,0.08)',
  successBorder: 'rgba(21,128,61,0.24)',
  shadow: 'rgba(0,0,0,0.12)',
};

export const lightTheme: Theme = { ...baseTheme, colors };

export const theme = lightTheme;
