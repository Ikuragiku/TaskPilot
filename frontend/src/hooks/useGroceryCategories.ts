/**
 * Hooks for grocery categories
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as service from '../services/groceryCategoryApi';
import { ProjectOption, Grocery } from '../types';
import { queryKeys } from '../constants/queryKeys';

export const useGroceryCategories = () => {
  return useQuery({ queryKey: queryKeys.groceryCategories, queryFn: () => service.getGroceryCategories() });
};

export const useCreateGroceryCategory = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: { value: string; color?: string }) => service.createGroceryCategory(data), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.groceryCategories }) });
};

export const useUpdateGroceryCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectOption> }) => service.updateGroceryCategory(id, data),
    onSuccess: (updated: ProjectOption) => {
      qc.setQueryData([...queryKeys.groceryCategories, updated.id] as any, updated);
      qc.invalidateQueries({ queryKey: queryKeys.groceryCategories });
    },
  });
};

export const useDeleteGroceryCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.deleteGroceryCategory(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: queryKeys.groceryCategories });
      await qc.cancelQueries({ queryKey: queryKeys.groceries() });
      const prevCats = qc.getQueryData<ProjectOption[]>(queryKeys.groceryCategories as any);
      const prevGroceries = qc.getQueryData<Grocery[]>(queryKeys.groceries() as any);
      // Optimistically remove the category from categories list
      qc.setQueryData(queryKeys.groceryCategories as any, (old: ProjectOption[] | undefined) => {
        if (!old) return old;
        return old.filter(c => c.id !== id);
      });
      // Optimistically strip the category id from all groceries so UI doesn't flicker
      qc.setQueryData(queryKeys.groceries() as any, (old: Grocery[] | undefined) => {
        if (!old) return old;
        return old.map(g => ({ ...g, kategorieIds: (g.kategorieIds || []).filter(k => k !== id) }));
      });
      return { prevCats, prevGroceries };
    },
    onError: (_err, _id, context: any) => {
      // Rollback if something went wrong
      if (context?.prevCats) qc.setQueryData(queryKeys.groceryCategories as any, context.prevCats);
      if (context?.prevGroceries) qc.setQueryData(queryKeys.groceries() as any, context.prevGroceries);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.groceryCategories });
      qc.invalidateQueries({ queryKey: queryKeys.groceries() });
    }
  });
};

export default useGroceryCategories;
