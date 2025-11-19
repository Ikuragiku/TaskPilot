/**
 * Task Sorting Utilities
 * Provides types and functions for sorting tasks by multiple fields.
 */
export interface Sort {
  field: string;
  asc: boolean;
}

/**
 * Sorts an array of tasks by multiple fields and directions.
 * Handles array fields and normalizes values for comparison.
 * @param tasks Array of tasks to sort.
 * @param sorts Array of sort criteria.
 * @returns Sorted array of tasks.
 */
export const sortTasks = <T extends Record<string, any>>(
  tasks: T[],
  sorts: Sort[]
): T[] => {
  if (!sorts.length) return tasks;

  return [...tasks].sort((a, b) => {
    for (const s of sorts) {
      let aVal = a[s.field];
      let bVal = b[s.field];

      // Handle array fields (status, project)
      if (Array.isArray(aVal)) aVal = aVal.map((x: any) => x.value).join(', ');
      if (Array.isArray(bVal)) bVal = bVal.map((x: any) => x.value).join(', ');

      // Normalize to string
      aVal = String(aVal || '');
      bVal = String(bVal || '');

      const cmp = aVal.localeCompare(bVal);
      if (cmp !== 0) return s.asc ? cmp : -cmp;
    }
    return 0;
  });
};
