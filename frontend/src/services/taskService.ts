/**
 * Task Service
 * Provides functions to interact with the task API endpoints, including CRUD operations and filtering.
 * Each function returns a Promise and handles API response normalization and error handling.
 */
import api from './api';
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  ApiResponse,
} from '../types';

/**
 * Fetches all tasks from the server, optionally filtered by search, status, or project.
 * @param filters Optional filters for searching, status, and project IDs.
 * @returns Promise resolving to an array of Task objects.
 */
export const getTasks = async (filters?: TaskFilters): Promise<Task[]> => {
  const params = new URLSearchParams();
  
  if (filters?.search) {
    params.append('search', filters.search);
  }
  
  if (filters?.statusIds && filters.statusIds.length > 0) {
    params.append('statusIds', filters.statusIds.join(','));
  }
  
  if (filters?.projectIds && filters.projectIds.length > 0) {
    params.append('projectIds', filters.projectIds.join(','));
  }
  
  const { data } = await api.get<ApiResponse<Task[]>>(
    `/api/tasks?${params.toString()}`
  );
  
  if (data.success && data.data) {
    return data.data.map(t => ({
      ...t,
      done: t.done ?? false,
      deadline: t.deadline ?? null,
    }));
  }
  
  throw new Error(data.error || 'Failed to fetch tasks');
};

/**
 * Fetches a single task by its ID.
 * @param id The ID of the task to retrieve.
 * @returns Promise resolving to the Task object.
 */
export const getTask = async (id: string): Promise<Task> => {
  const { data } = await api.get<ApiResponse<Task>>(`/api/tasks/${id}`);
  
  if (data.success && data.data) {
    return { ...data.data, done: data.data.done ?? false, deadline: data.data.deadline ?? null } as Task;
  }
  
  throw new Error(data.error || 'Failed to fetch task');
};

/**
 * Creates a new task on the server.
 * @param input The input data for the new task.
 * @returns Promise resolving to the created Task object.
 */
export const createTask = async (input: CreateTaskInput): Promise<Task> => {
  const { data } = await api.post<ApiResponse<Task>>('/api/tasks', input);
  
  if (data.success && data.data) {
    return { ...data.data, done: data.data.done ?? false, deadline: data.data.deadline ?? null } as Task;
  }
  
  throw new Error(data.error || 'Failed to create task');
};

/**
 * Updates an existing task by its ID.
 * @param id The ID of the task to update.
 * @param input The updated task data.
 * @returns Promise resolving to the updated Task object.
 */
export const updateTask = async (
  id: string,
  input: UpdateTaskInput
): Promise<Task> => {
  const { data } = await api.put<ApiResponse<Task>>(`/api/tasks/${id}`, input);
  
  if (data.success && data.data) {
    return { ...data.data, done: data.data.done ?? false, deadline: data.data.deadline ?? null } as Task;
  }
  
  throw new Error(data.error || 'Failed to update task');
};

/**
 * Deletes a task by its ID.
 * @param id The ID of the task to delete.
 * @returns Promise resolving to void if successful.
 */
export const deleteTask = async (id: string): Promise<void> => {
  const { data } = await api.delete<ApiResponse>(`/api/tasks/${id}`);
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete task');
  }
};
