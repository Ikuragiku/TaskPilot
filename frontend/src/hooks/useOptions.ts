/**
 * useOptions Hooks
 *
 * Provides React Query hooks for fetching, creating, updating, and deleting status/project options.
 * Wraps optionService API calls and manages query cache.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as optionService from '../services/optionService';

/**
 * Hook to fetch all status options
 */
export const useStatusOptions = () => {
  return useQuery({
    queryKey: ['statusOptions'],
    queryFn: optionService.getStatusOptions,
  });
};

/**
 * Hook to fetch all project options
 */
export const useProjectOptions = () => {
  return useQuery({
    queryKey: ['projectOptions'],
    queryFn: optionService.getProjectOptions,
  });
};

/**
 * Hook to create a status option
 */
export const useCreateStatusOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ value, color }: { value: string; color: string }) =>
      optionService.createStatusOption(value, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statusOptions'] });
    },
  });
};

/**
 * Hook to create a project option
 */
export const useCreateProjectOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ value, color }: { value: string; color: string }) =>
      optionService.createProjectOption(value, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectOptions'] });
    },
  });
};

/**
 * Hook to update a status option
 */
export const useUpdateStatusOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { value?: string; color?: string; order?: number } }) =>
      optionService.updateStatusOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statusOptions'] });
    },
  });
};

/**
 * Hook to update a project option
 */
export const useUpdateProjectOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { value?: string; color?: string; order?: number } }) =>
      optionService.updateProjectOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectOptions'] });
    },
  });
};

/**
 * Hook to delete a status option
 */
export const useDeleteStatusOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => optionService.deleteStatusOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statusOptions'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

/**
 * Hook to delete a project option
 */
export const useDeleteProjectOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => optionService.deleteProjectOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectOptions'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
