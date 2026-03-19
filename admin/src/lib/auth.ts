import { create } from "zustand";
import api, { endpoints } from "./api";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  isAdmin: () => boolean;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await api.post(endpoints.auth.login, { email, password });
    const { token, user } = response.data;

    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(user));

    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    window.location.href = "/login";
  },

  getToken: () => {
    const state = get();
    if (state.token) return state.token;
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_token");
    }
    return null;
  },

  isAdmin: () => {
    const state = get();
    return state.user?.role === "admin" || state.user?.role === "super_admin";
  },

  loadUser: async () => {
    try {
      const response = await api.get(endpoints.auth.me);
      const user = response.data;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
    }
  },

  setUser: (user: User) => {
    set({ user });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
