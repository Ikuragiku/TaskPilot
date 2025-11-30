/**
 * Recipe Service
 * 
 * Provides API client functions for recipe and recipe category CRUD operations.
 * All functions wrap API calls with error handling and response validation.
 * 
 * Endpoints:
 * - GET /api/recipes - Fetch all recipes
 * - GET /api/recipes/:id - Fetch single recipe
 * - POST /api/recipes - Create new recipe
 * - PUT /api/recipes/:id - Update recipe
 * - DELETE /api/recipes/:id - Delete recipe
 * - GET /api/recipe-categories - Fetch all categories
 * - POST /api/recipe-categories - Create category
 * - PUT /api/recipe-categories/:id - Update category
 * - DELETE /api/recipe-categories/:id - Delete category
 * 
 * @module recipeService
 */
import api from './api';
import { ApiResponse } from '../types';
import { Recipe, CreateRecipeInput, UpdateRecipeInput } from '../types';

/**
 * Fetches all recipes for the authenticated user
 * @returns {Promise<Recipe[]>} Array of recipes with items and categories
 * @throws {Error} If API call fails or returns error response
 */
export const getRecipes = async (): Promise<Recipe[]> => {
  const { data } = await api.get<ApiResponse<Recipe[]>>('/api/recipes');
  if (data.success && data.data) return data.data;
  throw new Error(data.error || 'Failed to fetch recipes');
};

/**
 * Fetches a single recipe by ID
 * @param {string} id - Recipe ID
 * @returns {Promise<Recipe>} Recipe with items and categories
 * @throws {Error} If recipe not found or API call fails
 */
export const getRecipe = async (id: string): Promise<Recipe> => {
  const { data } = await api.get<ApiResponse<Recipe>>(`/api/recipes/${id}`);
  if (data.success && data.data) return data.data;
  throw new Error(data.error || 'Failed to fetch recipe');
};

/**
 * Creates a new recipe
 * @param {CreateRecipeInput} input - Recipe creation data (title, portions, itemNames, categoryIds)
 * @returns {Promise<Recipe>} Created recipe with generated ID
 * @throws {Error} If validation fails or API call fails
 */
export const createRecipe = async (input: CreateRecipeInput): Promise<Recipe> => {
  const { data } = await api.post<ApiResponse<Recipe>>('/api/recipes', input);
  if (data.success && data.data) return data.data;
  throw new Error(data.error || 'Failed to create recipe');
};

/**
 * Updates an existing recipe
 * @param {string} id - Recipe ID
 * @param {UpdateRecipeInput} input - Fields to update (title, portions, itemNames, categoryIds)
 * @returns {Promise<Recipe>} Updated recipe
 * @throws {Error} If recipe not found or API call fails
 */
export const updateRecipe = async (id: string, input: UpdateRecipeInput): Promise<Recipe> => {
  const { data } = await api.put<ApiResponse<Recipe>>(`/api/recipes/${id}`, input);
  if (data.success && data.data) return data.data;
  throw new Error(data.error || 'Failed to update recipe');
};

/**
 * Deletes a recipe and its associated items
 * @param {string} id - Recipe ID
 * @returns {Promise<void>}
 * @throws {Error} If recipe not found or API call fails
 */
export const deleteRecipe = async (id: string): Promise<void> => {
  const { data } = await api.delete<ApiResponse>(`/api/recipes/${id}`);
  if (!data.success) throw new Error(data.error || 'Failed to delete recipe');
};

/**
 * Fetches all recipe categories for the authenticated user
 * @returns {Promise<RecipeCategory[]>} Array of categories with colors and order
 * @throws {Error} If API call fails
 */
export const getRecipeCategories = async () => {
  const { data } = await api.get<ApiResponse>('/api/recipe-categories');
  if (data.success && data.data) return data.data;
  throw new Error(data.error || 'Failed to load recipe categories');
};

/**
 * Creates a new recipe category
 * @param {Object} payload - Category data
 * @param {string} payload.value - Category name
 * @param {string} [payload.color] - Hex color code
 * @returns {Promise<RecipeCategory>} Created category
 * @throws {Error} If validation fails or API call fails
 */
export const createRecipeCategory = async (payload: { value: string; color?: string }) => {
  const { data } = await api.post<ApiResponse>('/api/recipe-categories', payload);
  if (data.success && data.data) return data.data;
  throw new Error(data.error || 'Failed to create category');
};

/**
 * Updates an existing recipe category
 * @param {string} id - Category ID
 * @param {Object} payload - Fields to update
 * @param {string} [payload.value] - New category name
 * @param {string} [payload.color] - New hex color code
 * @returns {Promise<RecipeCategory>} Updated category
 * @throws {Error} If category not found or API call fails
 */
export const updateRecipeCategory = async (id: string, payload: { value?: string; color?: string }) => {
  const { data } = await api.put<ApiResponse>(`/api/recipe-categories/${id}`, payload);
  if (data.success && data.data) return data.data;
  throw new Error(data.error || 'Failed to update category');
};

/**
 * Deletes a recipe category and removes it from all recipes
 * @param {string} id - Category ID
 * @returns {Promise<void>}
 * @throws {Error} If category not found or API call fails
 */
export const deleteRecipeCategory = async (id: string) => {
  const { data } = await api.delete<ApiResponse>(`/api/recipe-categories/${id}`);
  if (!data.success) throw new Error(data.error || 'Failed to delete category');
};

/**
 * Adds all ingredients from a recipe to the user's grocery list.
 * Uses AI to map ingredients to categories and merges quantities for existing items.
 * @param {string} recipeId - Recipe ID
 * @returns {Promise<{ added: number; updated: number; failed: number; message: string }>}
 * @throws {Error} If recipe not found or API call fails
 */
export const addRecipeToGroceryList = async (recipeId: string): Promise<{
  added: number;
  updated: number;
  failed: number;
  message: string;
}> => {
  const { data } = await api.post<ApiResponse<{
    added: number;
    updated: number;
    failed: number;
    message: string;
  }>>(`/api/recipes/${recipeId}/add-to-groceries`);
  if (data.success && data.data) return data.data;
  throw new Error(data.error || 'Failed to add recipe to grocery list');
};
