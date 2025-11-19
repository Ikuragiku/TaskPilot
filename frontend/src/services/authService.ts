/**
 * Auth Service
 *
 * Provides functions for user authentication: register, login, logout, and get current user.
 * Wraps API calls and manages localStorage for tokens and user info.
 */
import api from './api';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
  ApiResponse,
} from '../types';

/**
 * Register a new user
 */
export const register = async (
  credentials: RegisterCredentials
): Promise<AuthResponse> => {
  const { data } = await api.post<ApiResponse<AuthResponse>>(
    '/api/auth/register',
    credentials
  );
  
  if (data.success && data.data) {
    // Save token and user to localStorage
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data;
  }
  
  throw new Error(data.error || 'Registration failed');
};

/**
 * Login user
 */
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const { data } = await api.post<ApiResponse<AuthResponse>>(
    '/api/auth/login',
    credentials
  );
  
  if (data.success && data.data) {
    // Save token and user to localStorage
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data;
  }
  
  throw new Error(data.error || 'Login failed');
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout');
  } finally {
    // Clear local storage regardless of API call success
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User> => {
  const { data } = await api.get<ApiResponse<User>>('/api/auth/me');
  
  if (data.success && data.data) {
    return data.data;
  }
  
  throw new Error(data.error || 'Failed to get user');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Get stored user from localStorage
 */
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};
