import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      
      if (token && userJson) {
        set({ 
          token, 
          user: JSON.parse(userJson), 
          isAuthenticated: true 
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setAuth: async (user, token, refreshToken) => {
    try {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      
      set({ user: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  },

  updateUser: async (userData) => {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
      set({ user: userData });
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
  }
}));
