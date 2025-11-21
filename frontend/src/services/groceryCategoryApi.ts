/**
 * groceryCategoryApi
 *
 * Simple CRUD helpers for grocery categories (project options) used by the
 * Grocery UI. Each function returns the `data` payload from the server response.
 */
import api from './api';
import { ProjectOption } from '../types';
import { API_PATHS } from '../constants/apiPaths';

export const getGroceryCategories = async () => {
  const resp = await api.get(API_PATHS.GROCERY_CATEGORIES);
  return resp.data.data as ProjectOption[];
};

/**
 * createGroceryCategory
 * Create a new category option. `data` should contain a `value` and optional `color`.
 */
export const createGroceryCategory = async (data: { value: string; color?: string }) => {
  const resp = await api.post(API_PATHS.GROCERY_CATEGORIES, data);
  return resp.data.data as ProjectOption;
};

/**
 * updateGroceryCategory
 * Update a category by id with partial `ProjectOption` fields.
 */
export const updateGroceryCategory = async (id: string, data: Partial<ProjectOption>) => {
  const resp = await api.put(`${API_PATHS.GROCERY_CATEGORIES}/${id}`, data);
  return resp.data.data as ProjectOption;
};

/**
 * deleteGroceryCategory
 * Remove a category by id.
 */
export const deleteGroceryCategory = async (id: string) => {
  const resp = await api.delete(`${API_PATHS.GROCERY_CATEGORIES}/${id}`);
  return resp.data.data;
};

export default { getGroceryCategories, createGroceryCategory, updateGroceryCategory, deleteGroceryCategory };
