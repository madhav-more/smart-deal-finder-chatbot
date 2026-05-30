import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// const API_BASE_URL = 'http://localhost:3009/api'; 
const API_BASE_URL = 'http://10.61.141.48:5001/api'; 
// NOTE: For Android Emulator, use 'http://10.0.2.2:3009/api'
// For physical devices, use your machine's local IP address (e.g., 'http://192.168.1.5:3009/api')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          await SecureStore.setItemAsync('auth_token', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Handle refresh failure (e.g., logout user)
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('refresh_token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: async (email, password, name) => {
    const response = await api.post('/auth/signup', { email, password, name });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const chatAPI = {
  sendMessage: async (message, conversationId = null) => {
    const response = await api.post('/chat/message', { message, conversationId });
    return response.data;
  },
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },
  getConversation: async (id) => {
    const response = await api.get(`/chat/conversations/${id}`);
    return response.data;
  },
};

export default api;
