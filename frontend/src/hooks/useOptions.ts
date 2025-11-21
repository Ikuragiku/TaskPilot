/**
 * useOptions Hooks
 *
 * Provides React Query hooks for fetching, creating, updating, and deleting status/project options.
 * Wraps optionService API calls and manages query cache.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as optionService from '../services/optionService';
import { queryKeys } from '../constants/queryKeys';

/**
 * Hook to fetch all status options
 */
export const useStatusOptions = () => {
  return useQuery({
    queryKey: queryKeys.statusOptions,
    queryFn: optionService.getStatusOptions,
  });
};

/**
 * Hook to fetch all project options
 */
export const useProjectOptions = () => {
  return useQuery({
    queryKey: queryKeys.projectOptions,
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
    onSuccess: (data) => {
      // Add created option to cache immediately
      queryClient.setQueryData(queryKeys.statusOptions as any, (old: any) => {
        if (!old) return [data];
        return [...old, data];
      });
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
    onSuccess: (data) => {
      // Add created project to cache immediately
      queryClient.setQueryData(queryKeys.projectOptions as any, (old: any) => {
        if (!old) return [data];
        return [...old, data];
      });
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
    onSuccess: (updated) => {
      // Update cached status option in-place for immediate UI feedback
      queryClient.setQueryData(queryKeys.statusOptions as any, (old: any[]) => {
        if (!old) return [updated];
        return old.map((o) => (o.id === updated.id ? updated : o));
      });
      // Also update tasks cache so task.statuses reflect the new option label/color immediately
      queryClient.setQueryData(queryKeys.tasks() as any, (old: any[]) => {
        if (!old) return old;
        return old.map((task) => ({
          ...task,
          statuses: Array.isArray(task.statuses)
            ? task.statuses.map((s: any) => (s.id === updated.id ? updated : s))
            : task.statuses,
        }));
      });
      // Force refetch to ensure consistency across components
      queryClient.invalidateQueries({ queryKey: queryKeys.statusOptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
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
    onSuccess: (updated) => {
      // Update cached project option in-place for immediate UI feedback
      queryClient.setQueryData(queryKeys.projectOptions as any, (old: any[]) => {
        if (!old) return [updated];
        return old.map((o) => (o.id === updated.id ? updated : o));
      });
      // Also update any UI pieces derived from projectOptions (tasks cache)
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
      // Force refetch of project options to ensure all components receive latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.projectOptions });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.statusOptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.projectOptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
    },
  });
};
