/**
 * Option Service
 *
 * Provides functions for CRUD operations on status and project options.
 * Wraps API calls for options endpoints.
 */
import api from './api';
import { StatusOption, ProjectOption, ApiResponse } from '../types';

/**
 * Get all status options
 */
export const getStatusOptions = async (): Promise<StatusOption[]> => {
  const { data } = await api.get<ApiResponse<StatusOption[]>>(
    '/api/options/status'
  );
  
  if (data.success && data.data) {
    return data.data;
  }
  
  throw new Error(data.error || 'Failed to fetch status options');
};

/**
 * Create a new status option
 */
export const createStatusOption = async (
  value: string,
  color: string
): Promise<StatusOption> => {
  const { data } = await api.post<ApiResponse<StatusOption>>(
    '/api/options/status',
    { value, color }
  );
  
  if (data.success && data.data) {
    return data.data;
  }
  
  throw new Error(data.error || 'Failed to create status option');
};

/**
 * Update a status option
 */
export const updateStatusOption = async (
  id: string,
  updates: { value?: string; color?: string; order?: number }
): Promise<StatusOption> => {
  const { data } = await api.put<ApiResponse<StatusOption>>(
    `/api/options/status/${id}`,
    updates
  );
  
  if (data.success && data.data) {
    return data.data;
  }
  
  throw new Error(data.error || 'Failed to update status option');
};

/**
 * Delete a status option
 */
export const deleteStatusOption = async (id: string): Promise<void> => {
  const { data } = await api.delete<ApiResponse>(`/api/options/status/${id}`);
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete status option');
  }
};

/**
 * Get all project options
 */
export const getProjectOptions = async (): Promise<ProjectOption[]> => {
  const { data } = await api.get<ApiResponse<ProjectOption[]>>(
    '/api/options/project'
  );
  
  if (data.success && data.data) {
    return data.data;
  }
  
  throw new Error(data.error || 'Failed to fetch project options');
};

/**
 * Create a new project option
 */
export const createProjectOption = async (
  value: string,
  color: string
): Promise<ProjectOption> => {
  const { data } = await api.post<ApiResponse<ProjectOption>>(
    '/api/options/project',
    { value, color }
  );
  
  if (data.success && data.data) {
    return data.data;
  }
  
  throw new Error(data.error || 'Failed to create project option');
};

/**
 * Update a project option
 */
export const updateProjectOption = async (
  id: string,
  updates: { value?: string; color?: string; order?: number }
): Promise<ProjectOption> => {
  const { data } = await api.put<ApiResponse<ProjectOption>>(
    `/api/options/project/${id}`,
    updates
  );
  
  if (data.success && data.data) {
    return data.data;
  }
  
  throw new Error(data.error || 'Failed to update project option');
};

/**
 * Delete a project option
 */
export const deleteProjectOption = async (id: string): Promise<void> => {
  const { data } = await api.delete<ApiResponse>(`/api/options/project/${id}`);
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete project option');
  }
};
