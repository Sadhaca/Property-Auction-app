import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to attach auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoint helpers
export const endpoints = {
  auth: {
    login: "/auth/login",
    me: "/auth/me",
    logout: "/auth/logout",
  },
  dashboard: {
    stats: "/admin/dashboard/stats",
    ingestionChart: "/admin/dashboard/ingestion-chart",
    recentJobs: "/admin/dashboard/recent-jobs",
    dataQuality: "/admin/dashboard/data-quality",
    topCities: "/admin/dashboard/top-cities",
  },
  properties: {
    list: "/admin/properties",
    detail: (id: string) => `/admin/properties/${id}`,
    update: (id: string) => `/admin/properties/${id}`,
    history: (id: string) => `/admin/properties/${id}/history`,
  },
  sources: {
    list: "/admin/sources",
    create: "/admin/sources",
    update: (id: string) => `/admin/sources/${id}`,
    trigger: (id: string) => `/admin/sources/${id}/trigger`,
    toggle: (id: string) => `/admin/sources/${id}/toggle`,
  },
  ingestion: {
    jobs: "/admin/ingestion/jobs",
    jobDetail: (id: string) => `/admin/ingestion/jobs/${id}`,
    jobLogs: (id: string) => `/admin/ingestion/jobs/${id}/logs`,
    summary: "/admin/ingestion/summary",
  },
  users: {
    list: "/admin/users",
    detail: (id: string) => `/admin/users/${id}`,
    update: (id: string) => `/admin/users/${id}`,
    toggleActive: (id: string) => `/admin/users/${id}/toggle-active`,
  },
  audit: {
    logs: "/admin/audit-logs",
  },
  settings: {
    get: "/admin/settings",
    update: "/admin/settings",
  },
} as const;
