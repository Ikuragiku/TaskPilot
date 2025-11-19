/**
 * useTasks Hooks
 *
 * Provides React Query hooks for fetching, creating, updating, deleting, and subscribing to tasks.
 * Wraps taskService API calls and manages query cache and WebSocket updates.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as taskService from '../services/taskService';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters, SocketEvent } from '../types';
import { socketService } from '../services/socketService';

/**
 * Hook to fetch all tasks with filters
 */
export const useTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskService.getTasks(filters),
  });
};

/**
 * Hook to fetch a single task
 */
export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskService.getTask(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new task
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.createTask(input),
    onSuccess: () => {
      // Invalidate tasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

/**
 * Hook to update a task
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      taskService.updateTask(id, input),
    onSuccess: (updatedTask) => {
      // Update the task in cache
      queryClient.setQueryData(['tasks', updatedTask.id], updatedTask);
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

/**
 * Hook to delete a task
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      // Invalidate tasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

/**
 * Hook to listen for real-time task updates via WebSocket
 */
export const useTaskRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleTaskCreated = (task: Task) => {
      console.log('Task created:', task);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    const handleTaskUpdated = (task: Task) => {
      console.log('Task updated:', task);
      queryClient.setQueryData(['tasks', task.id], task);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    const handleTaskDeleted = (data: { id: string }) => {
      console.log('Task deleted:', data.id);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    // Subscribe to socket events
    socketService.on(SocketEvent.TASK_CREATED, handleTaskCreated);
    socketService.on(SocketEvent.TASK_UPDATED, handleTaskUpdated);
    socketService.on(SocketEvent.TASK_DELETED, handleTaskDeleted);

    // Cleanup
    return () => {
      socketService.off(SocketEvent.TASK_CREATED, handleTaskCreated);
      socketService.off(SocketEvent.TASK_UPDATED, handleTaskUpdated);
      socketService.off(SocketEvent.TASK_DELETED, handleTaskDeleted);
    };
  }, [queryClient]);
};
