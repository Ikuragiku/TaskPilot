import api from './api';
import { Grocery, CreateGroceryInput, UpdateGroceryInput } from '../types';
import { API_PATHS } from '../constants/apiPaths';

/**
 * ServerGrocery
 * Partial shape of the grocery object returned by the server API.
 * Dates are returned as ISO strings and categories are returned as minimal objects.
 */
type ServerGrocery = {
  id: string;
  title: string;
  menge?: string | null;
  done?: boolean;
  createdAt: string;
  updatedAt: string;
  categories?: Array<{ id: string } | null> | null;
};

/**
 * mapServerToFrontend
 * Convert the server-side grocery representation into the frontend `Grocery` type.
 * Normalizes optional fields and maps `categories` -> `kategorieIds`.
 */
const mapServerToFrontend = (g: ServerGrocery): Grocery => ({
  id: g.id,
  title: g.title,
  menge: (g.menge as string) || undefined,
  done: Boolean(g.done),
  createdAt: g.createdAt,
  updatedAt: g.updatedAt,
  // server returns `categories` as objects; map to ids for the UI
  kategorieIds: Array.isArray(g.categories) ? g.categories.filter(Boolean).map((c) => (c as { id: string }).id) : [],
});

/**
 * getGroceries
 * Fetch a list of groceries from the server. Optional `params` supports
 * text `search` and `categoryIds` (array of ids).
 */
export const getGroceries = async (params?: { search?: string; categoryIds?: string[] }) => {
  const query: any = {};
  if (params?.search) query.search = params.search;
  if (params?.categoryIds) query.categoryIds = params.categoryIds.join(',');
  const resp = await api.get(API_PATHS.GROCERIES, { params: query });
  const data = resp.data.data as ServerGrocery[];
  return data.map(mapServerToFrontend);
};

/**
 * getGrocery
 * Fetch a single grocery by id and map to the frontend type.
 */
export const getGrocery = async (id: string) => {
  const resp = await api.get(`${API_PATHS.GROCERIES}/${id}`);
  return mapServerToFrontend(resp.data.data);
};

/**
 * normalizePayload
 * Normalize various frontend payload shapes to the shape expected by the API.
 */
const normalizePayload = (input: any) => ({
  title: input.title,
  menge: input.menge ?? input.description,
  done: input.done,
  categoryIds: input.categoryIds ?? input.kategorieIds ?? input.projectIds ?? undefined,
});

/**
 * createGrocery
 * Create a new grocery on the server. Accepts the typed `CreateGroceryInput`
 * or a partial frontend `Grocery` object.
 */
export const createGrocery = async (input: CreateGroceryInput | Partial<Grocery>) => {
  const payload = normalizePayload(input as Record<string, unknown>);
  const resp = await api.post(API_PATHS.GROCERIES, payload);
  return mapServerToFrontend(resp.data.data as ServerGrocery);
};

/**
 * updateGrocery
 * Update an existing grocery by id with the given partial input.
 */
export const updateGrocery = async (id: string, input: UpdateGroceryInput | Partial<Grocery>) => {
  const payload = normalizePayload(input as Record<string, unknown>);
  const resp = await api.put(`${API_PATHS.GROCERIES}/${id}`, payload);
  return mapServerToFrontend(resp.data.data as ServerGrocery);
};

/**
 * deleteGrocery
 * Delete a grocery by id. Returns server response data.
 */
export const deleteGrocery = async (id: string) => {
  const resp = await api.delete(`${API_PATHS.GROCERIES}/${id}`);
  return resp.data.data;
};

export default { getGroceries, getGrocery, createGrocery, updateGrocery, deleteGrocery };
