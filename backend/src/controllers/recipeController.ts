/**
 * Recipe Controller
 *
 * HTTP request handlers for recipe CRUD operations and recipe category management.
 * Validates incoming requests with Zod schemas and delegates business logic to recipeService.
 */
import { Response, NextFunction } from 'express';
import { AuthRequest, CreateRecipeDto, UpdateRecipeDto } from '../types';
import * as recipeService from '../services/recipeService';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  portions: z.number().nullable().optional(),
  ingredientNames: z.array(z.string()).optional(),
  stepNames: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  portions: z.number().nullable().optional(),
  ingredientNames: z.array(z.string()).nullable().optional(),
  stepNames: z.array(z.string()).nullable().optional(),
  categoryIds: z.array(z.string()).nullable().optional(),
});

/**
 * GET /api/recipes
 * Retrieves all recipes for the authenticated user with their items and categories.
 */
export const getRecipes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
    const data = await recipeService.getRecipes(req.user.id);
    res.json({ success: true, data });
    return;
  } catch (err) { next(err); return; }
};

/**
 * GET /api/recipes/:id
 * Retrieves a single recipe by ID for the authenticated user.
 */
export const getRecipe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
    const data = await recipeService.getRecipeById(req.params.id, req.user.id);
    res.json({ success: true, data });
    return;
  } catch (err) { next(err); return; }

};

/**
 * POST /api/recipes
 * Creates a new recipe with optional items and category assignments.
 * Validates request body against createSchema.
 */
export const createRecipe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
    const validated = createSchema.parse(req.body) as CreateRecipeDto;
    const created = await recipeService.createRecipe(req.user.id, validated);
    res.status(201).json({ success: true, data: created });
    return;
  } catch (err) { next(err); return; }

};

/**
 * PUT /api/recipes/:id
 * Updates an existing recipe. Can modify title, description, portions, items, and category assignments.
 * Validates request body against updateSchema.
 */
export const updateRecipe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
    const validated = updateSchema.parse(req.body) as UpdateRecipeDto;
    const updated = await recipeService.updateRecipe(req.params.id, req.user.id, validated);
    res.json({ success: true, data: updated });
    return;
  } catch (err) { next(err); return; }

};

/**
 * DELETE /api/recipes/:id
 * Deletes a recipe and its associated items/category assignments.
 */
export const deleteRecipe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
    const result = await recipeService.deleteRecipe(req.params.id, req.user.id);
    res.json({ success: true, data: result });
    return;
  } catch (err) { next(err); return; }

};

/**
 * GET /api/recipe-categories
 * Retrieves all recipe categories (global, not user-specific).
 */
export const getCategories = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cats = await recipeService.getRecipeCategories();
    res.json({ success: true, data: cats });
    return;
  } catch (err) { next(err); return; }
};

/**
 * POST /api/recipe-categories
 * Creates a new recipe category with a value and optional color.
 */
export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const created = await recipeService.createRecipeCategory(req.body);
    res.status(201).json({ success: true, data: created });
    return;
  } catch (err) { next(err); return; }
};

/**
 * PUT /api/recipe-categories/:id
 * Updates a recipe category's value, color, or display order.
 */
export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await recipeService.updateRecipeCategory(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); return; }
};

/**
 * DELETE /api/recipe-categories/:id
 * Deletes a recipe category and removes it from all recipe assignments.
 */
export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await recipeService.deleteRecipeCategory(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); return; }
};

/**
 * POST /api/recipes/:id/add-to-groceries
 * Adds all ingredients from a recipe to the user's grocery list.
 * Uses AI to intelligently map ingredients to grocery categories.
 * Merges quantities if items already exist.
 */
export const addToGroceryList = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
    const result = await recipeService.addRecipeToGroceryList(req.params.id, req.user.id);
    res.json({ success: true, data: result });
    return;
  } catch (err) { next(err); return; }
};
