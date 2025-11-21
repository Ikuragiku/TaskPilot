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
      // Map singular sort fields to actual task properties
      const fieldKey = s.field === 'status' ? 'statuses' : s.field === 'project' ? 'projects' : s.field;
      let aVal = a[fieldKey];
      let bVal = b[fieldKey];

      // Handle array fields (status, project)
      if (Array.isArray(aVal)) aVal = aVal.map((x: any) => x.value).join(', ');
      if (Array.isArray(bVal)) bVal = bVal.map((x: any) => x.value).join(', ');

      // Special handling for certain fields
      if (s.field === 'deadline') {
        const aTs = aVal ? new Date(aVal).getTime() : 0;
        const bTs = bVal ? new Date(bVal).getTime() : 0;
        if (aTs !== bTs) return s.asc ? (aTs - bTs) : (bTs - aTs);
        continue;
      }

      if (s.field === 'done') {
        const aNum = aVal ? 1 : 0;
        const bNum = bVal ? 1 : 0;
        if (aNum !== bNum) return s.asc ? (aNum - bNum) : (bNum - aNum);
        continue;
      }

      // Normalize to string for other comparisons
      aVal = String(aVal || '');
      bVal = String(bVal || '');

      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
      if (cmp !== 0) return s.asc ? cmp : -cmp;
    }
    return 0;
  });
};
