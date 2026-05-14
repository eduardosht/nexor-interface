export type DesignSystemBrand = 'nexor' | 'biteplaner';

export interface BrandTokens {
  name: DesignSystemBrand;
  spacing: {
    '2': string;
    '4': string;
    '6': string;
    '8': string;
    '10': string;
    '12': string;
    '16': string;
    '20': string;
    '24': string;
    text: {
      tight: string;
      default: string;
      relaxed: string;
    };
    form: {
      fieldGap: string;
      groupGap: string;
      labelGap: string;
      controlGap: string;
      helperGap: string;
    };
  };
  typography: {
    heading: {
      '1': {
        fontSize: string;
        lineHeight: string;
        letterSpacing: string;
      };
      '2': {
        fontSize: string;
        lineHeight: string;
        letterSpacing: string;
      };
      '3': {
        fontSize: string;
        lineHeight: string;
        letterSpacing: string;
      };
      '4': {
        fontSize: string;
        lineHeight: string;
        letterSpacing: string;
      };
      '5': {
        fontSize: string;
        lineHeight: string;
        letterSpacing: string;
      };
      '6': {
        fontSize: string;
        lineHeight: string;
        letterSpacing: string;
      };
    };
    paragraph: {
      lg: {
        fontSize: string;
        lineHeight: string;
      };
      md: {
        fontSize: string;
        lineHeight: string;
      };
      sm: {
        fontSize: string;
        lineHeight: string;
      };
    };
    description: {
      lg: {
        fontSize: string;
        lineHeight: string;
      };
      md: {
        fontSize: string;
        lineHeight: string;
      };
    };
    caption: {
      md: {
        fontSize: string;
        lineHeight: string;
        letterSpacing: string;
      };
      sm: {
        fontSize: string;
        lineHeight: string;
        letterSpacing: string;
      };
    };
  };
  colors: {
    bg: string;
    bgSubtle: string;
    surface: string;
    surfaceSubtle: string;
    surfaceStrong: string;
    border: string;
    borderStrong: string;
    text: string;
    textMuted: string;
    textSoft: string;
    accent: string;
    accentStrong: string;
    accentSoft: string;
    accentContrast: string;
    danger: string;
    dangerBg: string;
    dangerBorder: string;
    successBg: string;
    successBorder: string;
  };
  fonts: {
    display: string;
    body: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    pill: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
  };
  motion: {
    fast: string;
    base: string;
    slow: string;
  };
  biteplanerContext: {
    accentSoft: string;
    accentSubtle: string;
    accentSupport: string;
    accentMid: string;
    accentDefault: string;
    accentStrong: string;
    ink: string;
  };
}

export const brandTokens: Record<DesignSystemBrand, BrandTokens> = {
  nexor: {
    name: 'nexor',
    spacing: {
      '2': '4px',
      '4': '8px',
      '6': '12px',
      '8': '16px',
      '10': '20px',
      '12': '24px',
      '16': '32px',
      '20': '40px',
      '24': '48px',
      text: {
        tight: '8px',
        default: '12px',
        relaxed: '16px',
      },
      form: {
        fieldGap: '16px',
        groupGap: '24px',
        labelGap: '8px',
        controlGap: '8px',
        helperGap: '6px',
      },
    },
    typography: {
      heading: {
        '1': { fontSize: '3.5rem', lineHeight: '1.02', letterSpacing: '-0.045em' },
        '2': { fontSize: '2.75rem', lineHeight: '1.06', letterSpacing: '-0.04em' },
        '3': { fontSize: '2.125rem', lineHeight: '1.1', letterSpacing: '-0.03em' },
        '4': { fontSize: '1.625rem', lineHeight: '1.18', letterSpacing: '-0.02em' },
        '5': { fontSize: '1.25rem', lineHeight: '1.24', letterSpacing: '-0.01em' },
        '6': { fontSize: '1rem', lineHeight: '1.32', letterSpacing: '0' },
      },
      paragraph: {
        lg: { fontSize: '1.125rem', lineHeight: '1.75' },
        md: { fontSize: '1rem', lineHeight: '1.7' },
        sm: { fontSize: '0.875rem', lineHeight: '1.65' },
      },
      description: {
        lg: { fontSize: '1rem', lineHeight: '1.6' },
        md: { fontSize: '0.875rem', lineHeight: '1.55' },
      },
      caption: {
        md: { fontSize: '0.75rem', lineHeight: '1.4', letterSpacing: '0.08em' },
        sm: { fontSize: '0.6875rem', lineHeight: '1.35', letterSpacing: '0.1em' },
      },
    },
    colors: {
      bg: '#FAFAFA',
      bgSubtle: '#F0F0F0',
      surface: '#FFFFFF',
      surfaceSubtle: '#F7F7F7',
      surfaceStrong: '#EFEFEF',
      border: '#E0E0E0',
      borderStrong: '#C8C8C8',
      text: '#171717',
      textMuted: '#525252',
      textSoft: '#737373',
      accent: '#171717',
      accentStrong: '#000000',
      accentSoft: '#F3F3F3',
      accentContrast: '#FAFAFA',
      danger: '#B91C1C',
      dangerBg: '#FFF1F1',
      dangerBorder: '#F1B6B6',
      successBg: '#F4F4F4',
      successBorder: '#D8D8D8',
    },
    fonts: {
      display: "'Inter', system-ui, -apple-system, sans-serif",
      body: "'Inter', system-ui, -apple-system, sans-serif",
    },
    radius: {
      sm: '4px',
      md: '6px',
      lg: '12px',
      xl: '16px',
      pill: '999px',
    },
    shadow: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.06)',
      md: '0 4px 16px rgba(0, 0, 0, 0.08)',
      lg: '0 10px 32px rgba(0, 0, 0, 0.12)',
    },
    motion: {
      fast: '120ms',
      base: '180ms',
      slow: '280ms',
    },
    biteplanerContext: {
      accentSoft:    '#CDFCDD',
      accentSubtle:  '#ACD9BB',
      accentSupport: '#76B78E',
      accentMid:     '#5B9B74',
      accentDefault: '#3C7C56',
      accentStrong:  '#1C5E3A',
      ink:           '#1C5E3A',
    },
  },
  biteplaner: {
    name: 'biteplaner',
    spacing: {
      '2': '4px',
      '4': '8px',
      '6': '12px',
      '8': '16px',
      '10': '20px',
      '12': '24px',
      '16': '32px',
      '20': '40px',
      '24': '48px',
      text: {
        tight: '8px',
        default: '12px',
        relaxed: '16px',
      },
      form: {
        fieldGap: '16px',
        groupGap: '24px',
        labelGap: '8px',
        controlGap: '8px',
        helperGap: '6px',
      },
    },
    typography: {
      heading: {
        '1': { fontSize: '4rem', lineHeight: '0.96', letterSpacing: '0.01em' },
        '2': { fontSize: '3.125rem', lineHeight: '1', letterSpacing: '0.01em' },
        '3': { fontSize: '2.375rem', lineHeight: '1.04', letterSpacing: '0.01em' },
        '4': { fontSize: '1.875rem', lineHeight: '1.08', letterSpacing: '0.01em' },
        '5': { fontSize: '1.375rem', lineHeight: '1.16', letterSpacing: '0.02em' },
        '6': { fontSize: '1.0625rem', lineHeight: '1.25', letterSpacing: '0.03em' },
      },
      paragraph: {
        lg: { fontSize: '1.125rem', lineHeight: '1.78' },
        md: { fontSize: '1rem', lineHeight: '1.72' },
        sm: { fontSize: '0.875rem', lineHeight: '1.68' },
      },
      description: {
        lg: { fontSize: '1rem', lineHeight: '1.62' },
        md: { fontSize: '0.875rem', lineHeight: '1.58' },
      },
      caption: {
        md: { fontSize: '0.75rem', lineHeight: '1.45', letterSpacing: '0.12em' },
        sm: { fontSize: '0.6875rem', lineHeight: '1.4', letterSpacing: '0.14em' },
      },
    },
    colors: {
      bg: '#FFFFFF',
      bgSubtle: '#ACD9BB',
      surface: '#FFFFFF',
      surfaceSubtle: '#CDFCDD',
      surfaceStrong: '#ACD9BB',
      border: '#ACD9BB',
      borderStrong: '#76B78E',
      text: '#1C5E3A',
      textMuted: '#3C7C56',
      textSoft: '#5B9B74',
      accent: '#3C7C56',
      accentStrong: '#1C5E3A',
      accentSoft: '#CDFCDD',
      accentContrast: '#FFFFFF',
      danger: '#B91C1C',
      dangerBg: '#FFF1F1',
      dangerBorder: '#F1B6B6',
      successBg: '#CDFCDD',
      successBorder: '#76B78E',
    },
    fonts: {
      display: "'Barlow Condensed', sans-serif",
      body: "'Inter', sans-serif",
    },
    radius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      pill: '999px',
    },
    shadow: {
      sm: '0 1px 3px rgba(6, 13, 7, 0.08)',
      md: '0 4px 16px rgba(6, 13, 7, 0.12)',
      lg: '0 10px 32px rgba(6, 13, 7, 0.16)',
    },
    motion: {
      fast: '120ms',
      base: '180ms',
      slow: '280ms',
    },
    biteplanerContext: {
      accentSoft:    '#CDFCDD',
      accentSubtle:  '#ACD9BB',
      accentSupport: '#76B78E',
      accentMid:     '#5B9B74',
      accentDefault: '#3C7C56',
      accentStrong:  '#1C5E3A',
      ink:           '#1C5E3A',
    },
  },
};

export function getBrandTokens(brand: DesignSystemBrand) {
  return brandTokens[brand];
}
