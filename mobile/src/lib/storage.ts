import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const storage = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save refresh token:', error);
    }
  },

  async removeRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove refresh token:', error);
    }
  },

  async getUser(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(USER_KEY);
    } catch {
      return null;
    }
  },

  async setUser(user: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_KEY, user);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  },

  async removeUser(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      this.removeToken(),
      this.removeRefreshToken(),
      this.removeUser(),
    ]);
  },
};
