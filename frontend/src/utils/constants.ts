/**
 * UI Constants
 * Contains keys for localStorage, default columns, and color palette used throughout the frontend UI.
 */
// Constants from original app.js (UI state keys only)
export const COLUMNS_KEY = 'organize_me_col_order_v1';
export const TABS_KEY = 'organize_me_tabs_v1';
export const ACTIVE_TAB_KEY = 'organize_me_active_tab_v1';
export const FILTERS_KEY = 'organize_me_filters_v1';
export const SORTS_KEY = 'organize_me_sorts_v1';
export const SEARCH_KEY = 'organize_me_search_v1';
export const SHOW_FILTERS_KEY = 'organize_me_show_filters_v1';
export const SHOW_SORTS_KEY = 'organize_me_show_sorts_v1';

// Recipes-specific UI keys (namespaced so Recipes toolbar/tabs don't share state with Tasks/Groceries)
export const RECIPES_TABS_KEY = 'organize_me_recipes_tabs_v1';
export const RECIPES_ACTIVE_TAB_KEY = 'organize_me_recipes_active_tab_v1';
export const RECIPES_SEARCH_KEY = 'organize_me_recipes_search_v1';
export const RECIPES_FILTERS_KEY = 'organize_me_recipes_filters_v1';
export const RECIPES_SORTS_KEY = 'organize_me_recipes_sorts_v1';
export const RECIPES_SHOW_FILTERS_KEY = 'organize_me_recipes_show_filters_v1';
export const RECIPES_SHOW_SORTS_KEY = 'organize_me_recipes_show_sorts_v1';

export const DEFAULT_COLUMNS = ['done', 'name', 'description', 'status', 'deadline', 'project'];

export const PALETTE = [
  { name: 'Dark Gray', color: '#484f58' },
  { name: 'Yellow', color: '#e3b341' },
  { name: 'Teal', color: '#14b8a6' },
  { name: 'Cyan', color: '#06b6d4' },
  { name: 'Green', color: '#3fb950' },
  { name: 'Blue', color: '#2f81f7' },
  { name: 'Navy', color: '#0b5cff' },
  { name: 'Purple', color: '#a371f7' },
  { name: 'Red', color: '#f85149' },
  { name: 'Magenta', color: '#ff4da6' },

];
