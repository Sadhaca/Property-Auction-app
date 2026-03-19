import { create } from 'zustand';
import { api } from './api';
import { storage } from './storage';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { user, access_token, refresh_token } = response.data;

      await storage.setToken(access_token);
      await storage.setRefreshToken(refresh_token);
      await storage.setUser(JSON.stringify(user));

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Login failed. Please try again.';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { user, access_token, refresh_token } = response.data;

      await storage.setToken(access_token);
      await storage.setRefreshToken(refresh_token);
      await storage.setUser(JSON.stringify(user));

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Registration failed. Please try again.';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout API errors
    } finally {
      await storage.clearAll();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await storage.getToken();
      const userData = await storage.getUser();

      if (token && userData) {
        const user: User = JSON.parse(userData);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        // Verify token is still valid
        try {
          const response = await api.get<User>('/auth/me');
          set({ user: response.data });
          await storage.setUser(JSON.stringify(response.data));
        } catch {
          await storage.clearAll();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  updateUser: (updates: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      set({ user: updatedUser });
      storage.setUser(JSON.stringify(updatedUser));
    }
  },
}));
