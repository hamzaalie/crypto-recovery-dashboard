import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'support_agent';
  status: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

interface AuthResponse {
  requiresTwoFactor?: boolean;
  requiresVerification?: boolean;
  email?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requires2FA: boolean;
  tempToken: string | null;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<AuthResponse>;
  verify2FA: (code: string) => Promise<void>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  enable2FA: () => Promise<{ secret: string; qrCode: string }>;
  disable2FA: (code: string) => Promise<void>;
  verify2FASetup: (code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      requires2FA: false,
      tempToken: null,
      error: null,

      clearError: () => set({ error: null }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const data = response.data;

          // Check if email verification is required
          if (data.requiresVerification) {
            set({ isLoading: false });
            return { requiresVerification: true, email: data.email };
          }

          if (data.requiresTwoFactor) {
            set({
              requires2FA: true,
              tempToken: data.tempToken,
              isLoading: false,
            });
            return { requiresTwoFactor: true };
          }

          set({
            user: data.user,
            token: data.accessToken,
            isAuthenticated: true,
            requires2FA: false,
            tempToken: null,
            isLoading: false,
          });
          return {};
        } catch (error: any) {
          set({ isLoading: false, error: error.response?.data?.message || 'Login failed' });
          throw error;
        }
      },

      verify2FA: async (code: string) => {
        const { tempToken } = get();
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/2fa/verify', {
            tempToken,
            code,
          });
          const data = response.data;

          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
            requires2FA: false,
            tempToken: null,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', data);
          const responseData = response.data;

          // New registration returns requiresVerification instead of tokens
          if (responseData.requiresVerification) {
            set({ isLoading: false });
            return { requiresVerification: true, email: responseData.email };
          }

          // Fallback for if registration returns tokens directly
          set({
            user: responseData.user,
            token: responseData.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return {};
        } catch (error: any) {
          set({ isLoading: false, error: error.response?.data?.message || 'Registration failed' });
          throw error;
        }
      },

      logout: () => {
        api.post('/auth/logout').catch(() => {});
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          requires2FA: false,
          tempToken: null,
        });
      },

      forgotPassword: async (email: string) => {
        await api.post('/auth/forgot-password', { email });
      },

      resetPassword: async (token: string, password: string) => {
        await api.post('/auth/reset-password', { token, newPassword: password });
      },

      updateProfile: async (data: Partial<User>) => {
        const response = await api.patch('/users/profile', data);
        set({ user: response.data });
      },

      enable2FA: async () => {
        const response = await api.post('/auth/2fa/enable');
        return response.data;
      },

      disable2FA: async (code: string) => {
        await api.post('/auth/2fa/disable', { code });
        const { user } = get();
        if (user) {
          set({ user: { ...user, twoFactorEnabled: false } });
        }
      },

      verify2FASetup: async (code: string) => {
        await api.post('/auth/2fa/verify-setup', { code });
        const { user } = get();
        if (user) {
          set({ user: { ...user, twoFactorEnabled: true } });
        }
      },

      refreshUser: async () => {
        try {
          const response = await api.get('/users/profile');
          set({ user: response.data });
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
