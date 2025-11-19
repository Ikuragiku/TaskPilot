/**
 * Task Filtering Utilities
 * Provides types and functions for filtering tasks by tab, status, project, done state, and search query.
 */
import { Task } from '../types';

export interface Filters {
  status: string[];
  project: string[];
  done: boolean | null;
}

/**
 * Filters an array of tasks by active tab, status, project, done state, and search query.
 * @param tasks Array of tasks to filter.
 * @param activeTab The currently active tab name.
 * @param filters Filter criteria for status, project, and done state.
 * @param searchQuery Search string to match against task fields.
 * @returns Filtered array of tasks.
 */
export const filterTasks = (
  tasks: Task[],
  activeTab: string,
  filters: Filters,
  searchQuery: string
): Task[] => {
  let list = tasks;

  // Filter by active tab
  if (activeTab !== 'All Tasks') {
    list = list.filter(t => {
      const taskProjects = t.projects || [];
      return taskProjects.some(p => p.value.toLowerCase() === activeTab.toLowerCase());
    });
  }

  // Apply filters
  if (filters.status.length) {
    list = list.filter(t => {
      const taskStatuses = t.statuses || [];
      return filters.status.some(s =>
        taskStatuses.some(ts => ts.value.toLowerCase() === s.toLowerCase())
      );
    });
  }

  if (filters.project.length) {
    list = list.filter(t => {
      const taskProjects = t.projects || [];
      return filters.project.some(p =>
        taskProjects.some(tp => tp.value.toLowerCase() === p.toLowerCase())
      );
    });
  }

  if (filters.done !== null) {
    list = list.filter(t => !!(t.done) === filters.done);
  }

  // Search filter
  const s = searchQuery.trim().toLowerCase();
  if (s) {
    list = list.filter(t => {
      const statusStr = (t.statuses || []).map(x => x.value).join(' ');
      const projectStr = (t.projects || []).map(x => x.value).join(' ');
      return [t.title, t.description || '', statusStr, projectStr]
        .map(v => v.toLowerCase())
        .some(v => v.includes(s));
    });
  }

  return list;
};
