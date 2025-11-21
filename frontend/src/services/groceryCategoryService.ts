/**
 * Grocery Category Service (localStorage-backed)
 * Stores grocery categories (kategorie) separately from project/status options.
 */
import { ProjectOption } from '../types';

const STORAGE_KEY = 'taskpilot_grocery_categories_v1';

const readAll = (): ProjectOption[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeAll = (items: ProjectOption[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const getGroceryCategories = async (): Promise<ProjectOption[]> => {
  return readAll();
};

export const createGroceryCategory = async (data: { value: string; color?: string }) => {
  const items = readAll();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();
  const nextOrder = items.length ? Math.max(...items.map(i => i.order || 0)) + 1 : 1;
  const item: ProjectOption = {
    id,
    value: data.value,
    color: data.color || '#c9d1d9',
    order: nextOrder,
    createdAt: now,
  };
  items.push(item);
  writeAll(items);
  return item;
};

export const updateGroceryCategory = async (id: string, data: { value?: string; color?: string }) => {
  const items = readAll();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) throw new Error('Category not found');
  const updated = { ...items[idx], ...data };
  items[idx] = updated;
  writeAll(items);
  return updated;
};

export const deleteGroceryCategory = async (id: string) => {
  const items = readAll();
  writeAll(items.filter(i => i.id !== id));
};

export default {
  getGroceryCategories,
  createGroceryCategory,
  updateGroceryCategory,
  deleteGroceryCategory,
};
