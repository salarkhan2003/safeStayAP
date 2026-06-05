import { create } from 'zustand';
import { authApi } from '../services/mockApi';
import { appStorage, secureStorage } from '../services/storage';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  hasCompletedOnboarding: boolean;
}

interface AuthActions {
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setRole: (role: UserRole) => void;
  initSession: () => Promise<void>;
  setOnboardingComplete: () => void;
  resetAll: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set, _get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  hasCompletedOnboarding: false,

  sendOtp: async (phone) => {
    await authApi.sendOtp(phone);
  },

  verifyOtp: async (phone, otp) => {
    const result = await authApi.verifyOtp(phone, otp);
    if (result.success && result.user && result.token) {
      set({
        user: result.user,
        token: result.token,
        isAuthenticated: true,
        role: result.user.role,
      });
    }
    return { isNewUser: result.isNewUser || false };
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, token: null, isAuthenticated: false, role: null });
  },

  setUser: (user) => set({ user, role: user.role, isAuthenticated: true }),
  setRole: (role) => set({ role }),

  setOnboardingComplete: () => {
    set({ hasCompletedOnboarding: true });
    appStorage.setOnboardingComplete();
  },

  resetAll: async () => {
    await appStorage.clearAll();
    await secureStorage.deleteToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      hasCompletedOnboarding: false,
    });
  },

  initSession: async () => {
    set({ isLoading: true });
    try {
      const [token, userId, role, onboarding] = await Promise.all([
        secureStorage.getToken(),
        appStorage.getUserId(),
        appStorage.getUserRole(),
        appStorage.getOnboardingComplete(),
      ]);

      if (token && userId) {
        const user = await authApi.getMe(userId);
        if (user) {
          set({
            user,
            token,
            isAuthenticated: true,
            role: user.role,
            hasCompletedOnboarding: onboarding === 'true',
          });
        } else {
          set({ isLoading: false });
        }
      } else {
        set({
          isLoading: false,
          hasCompletedOnboarding: onboarding === 'true',
        });
      }
    } catch {
      set({ isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
