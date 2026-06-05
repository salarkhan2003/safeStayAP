import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ROLE: 'user_role',
  USER_ID: 'user_id',
  THEME: 'theme_preference',
  ONBOARDING: 'onboarding_complete',
  LANGUAGE: 'language',
};

// SecureStore for sensitive data
export const secureStorage = {
  setToken: (token: string) => SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token),
  getToken: () => SecureStore.getItemAsync(KEYS.AUTH_TOKEN),
  deleteToken: () => SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN),
};

// AsyncStorage for app data
export const appStorage = {
  setUserRole: (role: string) => AsyncStorage.setItem(KEYS.USER_ROLE, role),
  getUserRole: () => AsyncStorage.getItem(KEYS.USER_ROLE),

  setUserId: (id: string) => AsyncStorage.setItem(KEYS.USER_ID, id),
  getUserId: () => AsyncStorage.getItem(KEYS.USER_ID),

  setTheme: (theme: 'light' | 'dark') => AsyncStorage.setItem(KEYS.THEME, theme),
  getTheme: () => AsyncStorage.getItem(KEYS.THEME),

  setOnboardingComplete: () => AsyncStorage.setItem(KEYS.ONBOARDING, 'true'),
  getOnboardingComplete: () => AsyncStorage.getItem(KEYS.ONBOARDING),

  setLanguage: (lang: string) => AsyncStorage.setItem(KEYS.LANGUAGE, lang),
  getLanguage: () => AsyncStorage.getItem(KEYS.LANGUAGE),

  // Generic cache
  set: (key: string, value: unknown) =>
    AsyncStorage.setItem(key, JSON.stringify(value)),
  get: async <T>(key: string): Promise<T | null> => {
    const val = await AsyncStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : null;
  },
  remove: (key: string) => AsyncStorage.removeItem(key),

  clearAll: () => AsyncStorage.clear(),
};
