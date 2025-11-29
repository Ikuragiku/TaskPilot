/**
 * Type Definitions
 *
 * Shared TypeScript types and interfaces for the backend API.
 * Includes:
 * - Request/Response types
 * - DTOs for tasks, groceries, recipes, options, and auth
 * - WebSocket event enums
 * - User preferences
 */
import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    name?: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Task types
export interface CreateTaskDto {
  title: string;
  description?: string;
  statusIds?: string[];
  projectIds?: string[];
  done?: boolean;
  deadline?: string; // ISO date string
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  statusIds?: string[];
  projectIds?: string[];
  done?: boolean;
  deadline?: string; // ISO date string
}

// Grocery DTOs
export interface CreateGroceryDto {
  title: string;
  menge?: string;
  categoryIds?: string[];
  done?: boolean;
}

export interface UpdateGroceryDto {
  title?: string;
  menge?: string | null;
  categoryIds?: string[];
  done?: boolean;
}

// Option types
export interface CreateOptionDto {
  value: string;
  color: string;
}

export interface UpdateOptionDto {
  value?: string;
  color?: string;
  order?: number;
}

// Recipe DTOs
export interface RecipeItemDto {
  id?: string;
  name: string;
  order?: number;
}

export interface CreateRecipeDto {
  title: string;
  description?: string;
  portions?: number | null;
  itemNames?: string[]; // simple list of item names for creation
  categoryIds?: string[];
}

export interface UpdateRecipeDto {
  title?: string;
  description?: string | null;
  portions?: number | null;
  itemNames?: string[] | null; // null to clear
  categoryIds?: string[] | null; // null to clear
}

// Auth types
export interface RegisterDto {
  username: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    name?: string;
  };
}

// User preferences
export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  width?: number;
  order: number;
}

export interface UserPreferencesDto {
  columns?: ColumnConfig[];
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

// WebSocket event types
export enum SocketEvent {
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  OPTION_CREATED = 'option:created',
  OPTION_UPDATED = 'option:updated',
  OPTION_DELETED = 'option:deleted',
}
