import { create } from 'zustand';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../constants/theme';
import { appStorage } from '../services/storage';
import type { Theme } from '../types';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  initTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: lightTheme,
  isDark: false,

  toggleTheme: () => {
    const newIsDark = !get().isDark;
    const newTheme = newIsDark ? darkTheme : lightTheme;
    set({ theme: newTheme, isDark: newIsDark });
    appStorage.setTheme(newIsDark ? 'dark' : 'light');
  },

  setTheme: (isDark: boolean) => {
    const newTheme = isDark ? darkTheme : lightTheme;
    set({ theme: newTheme, isDark });
    appStorage.setTheme(isDark ? 'dark' : 'light');
  },

  initTheme: async () => {
    const savedTheme = await appStorage.getTheme();
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      set({ theme: isDark ? darkTheme : lightTheme, isDark });
    }
  },
}));
