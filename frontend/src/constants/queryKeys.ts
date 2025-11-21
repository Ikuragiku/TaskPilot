// Centralized react-query keys for the frontend
export const queryKeys = {
  groceries: (id?: string) => (id ? ['groceries', id] as const : ['groceries'] as const),
  groceryCategories: ['groceryCategories'] as const,
  tasks: (id?: string) => (id ? ['tasks', id] as const : ['tasks'] as const),
  statusOptions: ['statusOptions'] as const,
  projectOptions: ['projectOptions'] as const,
};

export type QueryKeyFunction = typeof queryKeys.groceries;
