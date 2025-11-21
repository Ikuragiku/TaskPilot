/**
 * useGroceries Hooks
 * React Query hooks for local-storage-backed groceries used for testing separation from tasks.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as groceryService from '../services/groceryApi';
import { Grocery, CreateGroceryInput, UpdateGroceryInput } from '../types';
import { queryKeys } from '../constants/queryKeys';

export const useGroceries = () => {
  return useQuery({
    queryKey: queryKeys.groceries(),
    queryFn: () => groceryService.getGroceries(),
  });
};

export const useGrocery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.groceries(id),
    queryFn: () => groceryService.getGrocery(id),
    enabled: !!id,
  });
};

export const useCreateGrocery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGroceryInput | any) => groceryService.createGrocery(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.groceries() }),
  });
};

export const useUpdateGrocery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGroceryInput | any }) => groceryService.updateGrocery(id, input),
    onSuccess: (updated: Grocery) => {
      qc.setQueryData(queryKeys.groceries(updated.id) as any, updated);
      qc.invalidateQueries({ queryKey: queryKeys.groceries() });
    },
  });
};

export const useDeleteGrocery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groceryService.deleteGrocery(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.groceries() }),
  });
};

export default useGroceries;
