/**
 * Grocery Category Controller
 *
 * Contains HTTP route handlers for managing grocery categories (CRUD).
 * Handlers validate request bodies with Zod and delegate work to the
 * `groceryCategoryService`. Responses follow the `{ success: boolean, data: ... }` shape.
 */
import { Response, NextFunction } from 'express';
import { AuthRequest, CreateOptionDto, UpdateOptionDto } from '../types';
import * as svc from '../services/groceryCategoryService';
import { z } from 'zod';

/**
 * Validation schema for creating a grocery category.
 * - `value`: human readable label for the category
 * - `color`: hex color string used for UI badges
 */
const createSchema = z.object({ value: z.string().min(1), color: z.string().min(1) });

/**
 * Validation schema for updating a grocery category.
 * All fields are optional to allow partial updates.
 */
const updateSchema = z.object({ value: z.string().optional(), color: z.string().optional(), order: z.number().optional() });

/**
 * GET /api/grocery-categories
 * Returns a list of grocery categories ordered by their `order` field.
 */
export const getCategories = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const list = await svc.getGroceryCategories();
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/grocery-categories
 * Creates a new grocery category. Request body must satisfy `createSchema`.
 * Returns the created category object.
 */
export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = createSchema.parse(req.body);
    const created = await svc.createGroceryCategory(validated as CreateOptionDto);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/grocery-categories/:id
 * Updates an existing grocery category by id. Body validated by `updateSchema`.
 * Returns the updated category object.
 */
export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = updateSchema.parse(req.body);
    const updated = await svc.updateGroceryCategory(req.params.id, validated as UpdateOptionDto);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/grocery-categories/:id
 * Deletes a grocery category.
 * Returns `{ id }` on success.
 */
export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await svc.deleteGroceryCategory(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
