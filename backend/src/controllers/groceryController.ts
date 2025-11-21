/**
 * Grocery Controller
 *
 * Route handlers for CRUD operations on groceries. All handlers require an
 * authenticated user (checked via `req.user`) and return JSON responses in
 * the `{ success: boolean, data: ... }` format. Request bodies are validated
 * using Zod schemas defined below.
 */
import { Response, NextFunction } from 'express';
import { AuthRequest, CreateGroceryDto, UpdateGroceryDto } from '../types';
import * as groceryService from '../services/groceryService';
import { z } from 'zod';

/**
 * Schema for creating a grocery item.
 * - `title`: required name of the grocery
 * - `menge`: optional quantity/notes
 * - `categoryIds`: optional array of grocery category ids
 * - `done`: optional boolean whether the item is checked off
 */
const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  menge: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  done: z.boolean().optional(),
});

/**
 * Schema for updating a grocery item. All fields are optional to allow partial updates.
 */
const updateSchema = z.object({
  title: z.string().min(1).optional(),
  menge: z.string().optional().nullable(),
  categoryIds: z.array(z.string()).optional(),
  done: z.boolean().optional(),
});

/**
 * GET /api/groceries
 * Returns a list of groceries for the authenticated user. Optional query
 * parameters:
 * - `search`: text search applied to title and menge
 * - `categoryIds`: comma-separated list of category ids to filter by
 */
export const getGroceries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: 'Not authenticated' }); return; }
    const filters = {
      search: req.query.search as string | undefined,
      categoryIds: req.query.categoryIds ? (req.query.categoryIds as string).split(',') : undefined,
    };
    const list = await groceryService.getGroceries(req.user.id, filters);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/groceries/:id
 * Returns a single grocery item by id for the authenticated user.
 */
export const getGrocery = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: 'Not authenticated' }); return; }
    const item = await groceryService.getGroceryById(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/groceries
 * Creates a new grocery item for the authenticated user. Body validated with `createSchema`.
 */
export const createGrocery = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: 'Not authenticated' }); return; }
    const validated = createSchema.parse(req.body);
    const created = await groceryService.createGrocery(req.user.id, validated as CreateGroceryDto);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/groceries/:id
 * Updates a grocery item. Only allowed for the owner (checked by userId).
 * Body validated with `updateSchema`.
 */
export const updateGrocery = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: 'Not authenticated' }); return; }
    const validated = updateSchema.parse(req.body);
    const updated = await groceryService.updateGrocery(req.params.id, req.user.id, validated as UpdateGroceryDto);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/groceries/:id
 * Deletes a grocery item if it belongs to the authenticated user.
 * Returns `{ id }` on success.
 */
export const deleteGrocery = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: 'Not authenticated' }); return; }
    const result = await groceryService.deleteGrocery(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
