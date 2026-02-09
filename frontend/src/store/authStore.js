import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Login action
            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authAPI.login(email, password);

                    // Store tokens in localStorage (handled by persist middleware)
                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('refreshToken', data.refreshToken);

                    set({
                        user: data.user,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    return { success: true };
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Login failed';
                    set({ isLoading: false, error: errorMessage });
                    return { success: false, error: errorMessage };
                }
            },

            // Signup action
            signup: async (email, password, name) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authAPI.signup(email, password, name);

                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('refreshToken', data.refreshToken);

                    set({
                        user: data.user,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    return { success: true };
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Signup failed';
                    set({ isLoading: false, error: errorMessage });
                    return { success: false, error: errorMessage };
                }
            },

            // Logout action
            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            // Load user profile
            loadProfile: async () => {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    return;
                }

                set({ isLoading: true });
                try {
                    const data = await authAPI.getProfile();
                    set({
                        user: data.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    // Token might be invalid, logout
                    set({ isLoading: false });
                    useAuthStore.getState().logout();
                }
            },

            // Clear error
            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
