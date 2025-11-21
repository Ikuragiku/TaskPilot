/**
 * Global Type Definitions
 * Contains all major types and interfaces for users, authentication, options, tasks, API responses, and socket events.
 * Used throughout the frontend for type safety and consistency.
 */

// User types
/**
 * Represents a user in the system.
 */
export interface User {
  id: string;
  username: string;
  name?: string;
  createdAt: string;
}

/**
 * Response returned after successful authentication.
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Credentials required for user login.
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Credentials required for user registration.
 */
export interface RegisterCredentials {
  username: string;
  password: string;
  name?: string;
}

// Option types
/**
 * Represents a status option for tasks.
 */
export interface StatusOption {
  id: string;
  value: string;
  color: string;
  order: number;
  createdAt: string;
}

/**
 * Represents a project option for tasks.
 */
export interface ProjectOption {
  id: string;
  value: string;
  color: string;
  order: number;
  createdAt: string;
}

// Task types
/**
 * Represents a task in the system.
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  done?: boolean;
  deadline?: string | null;
  createdAt: string;
  updatedAt: string;
  statuses: StatusOption[];
  projects: ProjectOption[];
}

/**
 * Input data for creating a new task.
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  statusIds?: string[];
  projectIds?: string[];
  done?: boolean;
  deadline?: string; // ISO date string
}

/**
 * Input data for updating an existing task.
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  statusIds?: string[];
  projectIds?: string[];
  done?: boolean;
  deadline?: string | null; // null to clear
}

/**
 * Filters for querying tasks.
 */
export interface TaskFilters {
  search?: string;
  statusIds?: string[];
  projectIds?: string[];
}

// Grocery types (local-storage backed)
/**
 * Represents a grocery item stored locally.
 */
export interface Grocery {
  id: string;
  title: string; // name of the grocery
  menge?: string; // quantity text
  kategorieIds?: string[]; // references to grocery categories
  done?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroceryInput {
  title: string;
  menge?: string;
  kategorieIds?: string[];
  done?: boolean;
}

export interface UpdateGroceryInput {
  title?: string;
  menge?: string;
  kategorieIds?: string[];
  done?: boolean;
}

// API Response
/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// WebSocket event types
/**
 * Enum for supported socket events.
 */
export enum SocketEvent {
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  OPTION_CREATED = 'option:created',
  OPTION_UPDATED = 'option:updated',
  OPTION_DELETED = 'option:deleted',
}
