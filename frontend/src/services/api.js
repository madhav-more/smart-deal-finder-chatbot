import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data;
                    localStorage.setItem('accessToken', accessToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
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

// Chat API
export const chatAPI = {
    sendMessage: async (message, conversationId = null) => {
        const response = await api.post('/chat/message', {
            message,
            conversationId,
        });
        return response.data;
    },

    getConversations: async () => {
        const response = await api.get('/chat/conversations');
        return response.data;
    },

    getConversation: async (conversationId) => {
        const response = await api.get(`/chat/conversations/${conversationId}`);
        return response.data;
    },
};

// Search API
export const searchAPI = {
    searchProducts: async (query) => {
        const response = await api.get('/search', { params: { q: query } });
        return response.data;
    },

    comparePrice: async (productId) => {
        const response = await api.get(`/products/${productId}/compare`);
        return response.data;
    },
};

export default api;
