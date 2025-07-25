// Design tokens inspired by Atlassian Design System

export const colors = {
  // Primary
  brand: {
    DEFAULT: '#0052CC', // Pacific Bridge - Primary blue
    hover: '#0065FF',
    active: '#0747A6',
  },
  
  // Text
  text: {
    DEFAULT: '#172B4D', // Squid Ink - Primary text
    subtle: '#6B778C', // Concrete Jungle - Secondary text
    subtlest: '#97A0AF', // McFanning - Tertiary text
    inverse: '#FFFFFF',
  },
  
  // Backgrounds
  background: {
    DEFAULT: '#FFFFFF', // White
    subtle: '#F4F5F7', // Porcelain
    subtlest: '#FAFBFC', // White Smoke
    input: '#FAFBFC',
    overlay: 'rgba(9, 30, 66, 0.48)',
  },
  
  // Borders
  border: {
    DEFAULT: '#DFE1E6', // Mystic
    bold: '#C1C7D0', // Quarter Spanish White
    input: '#DFE1E6',
    focus: '#0052CC',
  },
  
  // Semantic colors
  success: {
    DEFAULT: '#36B37E', // Fine Pine
    light: '#E3FCEF',
    text: '#006644',
  },
  
  warning: {
    DEFAULT: '#FFAB00', // Golden State
    light: '#FFF0B3',
    text: '#974F0C',
  },
  
  danger: {
    DEFAULT: '#FF5630', // Poppy Surprise
    light: '#FFEBE6',
    text: '#DE350B',
  },
  
  info: {
    DEFAULT: '#00B8D9', // Bondi Blue
    light: '#E6FCFF',
    text: '#0747A6',
  },
}

export const spacing = {
  0: '0',
  25: '2px', // 0.25 base unit
  50: '4px', // 0.5 base unit
  100: '8px', // 1 base unit
  150: '12px',
  200: '16px', // 2 base units
  250: '20px',
  300: '24px', // 3 base units
  400: '32px', // 4 base units
  500: '40px', // 5 base units
  600: '48px', // 6 base units
  800: '64px', // 8 base units
}

export const typography = {
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '29px',
    '3xl': '35px',
  },
  
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: '16px',
    base: '20px',
    relaxed: '24px',
    loose: '28px',
    xl: '32px',
    '2xl': '40px',
  },
}

export const borderRadius = {
  sm: '3px',
  DEFAULT: '3px',
  md: '4px',
  lg: '6px',
  xl: '8px',
  full: '9999px',
}

export const transitions = {
  duration: {
    fast: '100ms',
    base: '200ms',
    slow: '300ms',
  },
  
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  },
}

export const shadows = {
  sm: '0 1px 1px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
  DEFAULT: '0 2px 2px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
  md: '0 4px 8px -2px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
  lg: '0 8px 16px -4px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
  overlay: '0 20px 32px -8px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
}