
/**
 * Auth Store
 * Zustand store for managing authentication state and actions.
 * Handles user login, registration, logout, authentication checks, and error management.
 */

import { create } from 'zustand';
import { User } from '../types';
import * as authService from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  /**
   * Sets the current user and authentication status.
   */
  setUser: (user: User | null) => void;
  /**
    * Logs in a user with username and password.
   */
  login: (username: string, password: string) => Promise<void>;
  /**
    * Registers a new user with username, password, and optional name.
   */
  register: (username: string, password: string, name?: string) => Promise<void>;
  /**
   * Logs out the current user.
   */
  logout: () => Promise<void>;
  /**
   * Checks authentication status and updates store.
   */
  checkAuth: () => void;
  /**
   * Clears any authentication errors.
   */
  clearError: () => void;
}

/**
 * useAuthStore
 * Zustand hook for accessing and updating authentication state and actions.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  /**
   * Sets the current user and authentication status.
   */
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  /**
   * Logs in a user with username and password.
   * Updates store with user info and authentication status.
   */
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login({ username, password });
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Registers a new user and updates store with user info and authentication status.
   */
  register: async (username, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.register({ username, password, name });
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Logs out the current user and clears authentication state.
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // Logout locally even if API call fails
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Checks authentication status and updates store.
   */
  checkAuth: () => {
    const user = authService.getStoredUser();
    const isAuthenticated = authService.isAuthenticated();
    set({ user, isAuthenticated });
  },

  /**
   * Clears any authentication errors from the store.
   */
  clearError: () => set({ error: null }),
}));
