/**
 * Grocery Service (localStorage-backed)
 * Provides basic CRUD operations for groceries stored locally to allow testing separation from tasks.
 */
import { Grocery, CreateGroceryInput, UpdateGroceryInput } from '../types';

const STORAGE_KEY = 'taskpilot_groceries_v1';

const readAll = (): Grocery[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeAll = (items: Grocery[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const getGroceries = async (): Promise<Grocery[]> => {
  return readAll();
};

export const getGrocery = async (id: string): Promise<Grocery | null> => {
  const items = readAll();
  return items.find(i => i.id === id) || null;
};

export const createGrocery = async (input: CreateGroceryInput | any): Promise<Grocery> => {
  const items = readAll();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();
  const newItem: Grocery = {
    id,
    title: input.title || 'New Grocery',
    menge: input.menge || input.description || '',
    kategorieIds: input.kategorieIds || input.projectIds || [],
    done: input.done ?? false,
    createdAt: now,
    updatedAt: now,
  };
  items.unshift(newItem);
  writeAll(items);
  return newItem;
};

export const updateGrocery = async (id: string, input: UpdateGroceryInput | any): Promise<Grocery> => {
  const items = readAll();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) throw new Error('Grocery not found');
  const now = new Date().toISOString();
  const base = items[idx];
  const updated: Grocery = {
    ...base,
    title: input.title ?? base.title,
    menge: input.menge ?? input.description ?? base.menge,
    kategorieIds: input.kategorieIds ?? input.projectIds ?? base.kategorieIds ?? [],
    done: input.done ?? base.done,
    updatedAt: now,
  };
  items[idx] = updated;
  writeAll(items);
  return updated;
};

export const deleteGrocery = async (id: string): Promise<void> => {
  const items = readAll();
  const filtered = items.filter(i => i.id !== id);
  writeAll(filtered);
};

export default {
  getGroceries,
  getGrocery,
  createGrocery,
  updateGrocery,
  deleteGrocery,
};
