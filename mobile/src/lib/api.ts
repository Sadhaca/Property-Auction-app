import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from './storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          await storage.setToken(access_token);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        await storage.clearAll();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
