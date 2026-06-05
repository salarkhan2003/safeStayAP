import { Theme } from '../types';

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: '#09090b', // High-contrast Deep Carbon
    primaryDark: '#000000',
    primaryLight: '#f4f4f5', // Clean Zinc tint
    secondary: '#2563eb', // Clean Royal Tech Blue
    accent: '#7c3aed', // Minimalist Violet
    background: '#fafafa', // Warm minimal clean background
    surface: '#ffffff',
    card: '#ffffff',
    text: '#09090b', // Deep carbon typography
    textSecondary: '#52525b', // Muted slate-gray
    textMuted: '#a1a1aa', // Soft gray
    border: '#e4e4e7', // Zinc-200 border, razor thin
    error: '#ef4444', // Red-500
    success: '#10b981', // Emerald-500
    warning: '#f59e0b', // Amber-500
    info: '#3b82f6', // Blue-500
    white: '#ffffff',
    black: '#09090b',
    overlay: 'rgba(9, 9, 11, 0.04)',
  },
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: '#f4f4f5', // Crisp Zinc White
    primaryDark: '#ffffff',
    primaryLight: '#27272a', // Zinc Dark Gray tint
    secondary: '#3b82f6', // Tech Blue
    accent: '#a78bfa', // Soft Violet
    background: '#09090b', // Extreme Dark Carbon
    surface: '#121214', // Elevated Carbon
    card: '#121214',
    text: '#f4f4f5',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    border: '#27272a', // Zinc-800 border
    error: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    info: '#60a5fa',
    white: '#ffffff',
    black: '#09090b',
    overlay: 'rgba(244, 244, 245, 0.06)',
  },
};

export const SPACING = {
  xs: 6,
  sm: 10,
  md: 18,
  lg: 26,
  xl: 36,
  xxl: 54,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 17,
  lg: 19,
  xl: 22,
  xxl: 26,
  xxxl: 36,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
};
