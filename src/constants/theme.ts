import { Theme } from '../types';

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: '#1565c0', // Trust-focused AP Police Blue
    primaryDark: '#0d47a1', // Deep indigo
    primaryLight: '#e3f2fd', // Soft blue tint
    secondary: '#00897b', // Soft safety teal
    accent: '#ff9800', // Warning safety gold
    background: '#f8fafc', // Softer, cleaner off-white (slate-50) for comfortable trust-focused screen
    surface: '#ffffff',
    card: '#ffffff',
    text: '#0f172a', // Premium slate-900 typography
    textSecondary: '#475569', // Slate-600
    textMuted: '#94a3b8', // Slate-400
    border: '#e2e8f0', // Slate-200, extremely clean and subtle
    error: '#e11d48', // Premium rose-600
    success: '#059669', // Soft emerald-600
    warning: '#d97706', // Amber-600
    info: '#2563eb', // Royal blue
    white: '#ffffff',
    black: '#0f172a',
    overlay: 'rgba(21, 101, 192, 0.08)',
  },
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: '#38bdf8', // Cyber Cyan for Gov-Tech Intelligence Dashboard
    primaryDark: '#0284c7', // Deep ocean cyan
    primaryLight: '#7dd3fc', // Soft neon cyan glow
    secondary: '#10b981', // Glowing neon emerald
    accent: '#f59e0b', // Neon gold
    background: '#0b0f19', // Deep dark space tech background
    surface: '#111827', // Rich slate dark surface
    card: '#1f2937', // Slate-800 cards
    text: '#f9fafb', // High-contrast clean off-white
    textSecondary: '#d1d5db', // Cool gray-300
    textMuted: '#9ca3af', // Cool gray-400
    border: '#374151', // Slate-700 clean border grid lines
    error: '#f87171', // Neon rose
    success: '#34d399', // Neon emerald
    warning: '#fbbf24', // Neon amber
    info: '#60a5fa', // Neon blue
    white: '#ffffff',
    black: '#030712',
    overlay: 'rgba(56, 189, 248, 0.15)',
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
