import { Theme } from '../types';

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: '#1a237e',
    primaryDark: '#0d1453',
    primaryLight: '#3949ab',
    secondary: '#0288d1',
    accent: '#00bcd4',
    background: '#f5f7ff',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#1a1a2e',
    textSecondary: '#4a4a6a',
    textMuted: '#9e9eb5',
    border: '#e8eaf6',
    error: '#d32f2f',
    success: '#2e7d32',
    warning: '#f57c00',
    info: '#0288d1',
    white: '#ffffff',
    black: '#000000',
    overlay: 'rgba(26, 35, 126, 0.15)',
  },
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: '#3949ab',
    primaryDark: '#1a237e',
    primaryLight: '#5c6bc0',
    secondary: '#039be5',
    accent: '#00e5ff',
    background: '#0a0a1a',
    surface: '#12122a',
    card: '#1a1a35',
    text: '#e8eaf6',
    textSecondary: '#b0b8d8',
    textMuted: '#6a7299',
    border: '#2a2a4a',
    error: '#ef5350',
    success: '#66bb6a',
    warning: '#ffa726',
    info: '#29b6f6',
    white: '#ffffff',
    black: '#000000',
    overlay: 'rgba(57, 73, 171, 0.25)',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};
