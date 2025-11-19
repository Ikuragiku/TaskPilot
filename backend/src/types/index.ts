import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
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

// Auth types
export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
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
