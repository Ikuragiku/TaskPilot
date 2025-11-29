/**
 * Recipe Service
 *
 * Business logic for recipe and recipe category management.
 * Handles CRUD operations for recipes with their items (ingredients/steps) and category assignments.
 * Uses Prisma transactions to ensure data consistency when updating related entities.
 *
 * Key operations:
 * - Recipe CRUD with user scoping
 * - Recipe item management (ingredients/instructions)
 * - Recipe category assignments (many-to-many)
 * - Global recipe category CRUD
 */
import prisma from '../prismaClient';
import { CreateRecipeDto, UpdateRecipeDto } from '../types';

/**
 * Retrieves all recipes for a user with their items and categories.
 * @param userId - The ID of the user
 * @returns Array of recipes with nested items and categories
 */
export const getRecipes = async (userId: string) => {
  const recipes = await prisma.recipe.findMany({
    where: { userId },
    include: {
      items: true,
      categories: {
        include: { recipeCategory: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return recipes.map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    portions: r.portions,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    items: r.items.map((it: any) => ({ id: it.id, name: it.name, order: it.order })),
    categories: r.categories.map((a: any) => a.recipeCategory),
  }));
};

/**
 * Retrieves a single recipe by ID with items and categories.
 * @param id - Recipe ID
 * @param userId - User ID (for ownership verification)
 * @returns Recipe with nested items and categories
 * @throws Error if recipe not found or doesn't belong to user
 */
export const getRecipeById = async (id: string, userId: string) => {
  const r = await prisma.recipe.findFirst({
    where: { id, userId },
    include: { items: true, categories: { include: { recipeCategory: true } } },
  });
  if (!r) throw new Error('Recipe not found');
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    portions: r.portions,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    items: r.items.map((it: any) => ({ id: it.id, name: it.name, order: it.order })),
    categories: r.categories.map((a: any) => a.recipeCategory),
  };
};

/**
 * Creates a new recipe with optional items and category assignments.
 * Uses a transaction to ensure all related entities are created atomically.
 * @param userId - The owner of the recipe
 * @param data - Recipe creation data
 * @returns Newly created recipe with items and categories
 */
export const createRecipe = async (userId: string, data: CreateRecipeDto) => {
  const recipe = await prisma.$transaction(async (tx) => {
    const created = await tx.recipe.create({
      data: { title: data.title, description: data.description, portions: data.portions ?? null, userId },
    });

    if (data.itemNames && data.itemNames.length > 0) {
      await tx.recipeItem.createMany({
        data: data.itemNames.map((name, idx) => ({ recipeId: created.id, name, order: idx })),
      });
    }

    if (data.categoryIds && data.categoryIds.length > 0) {
      await tx.recipeCategoryAssignment.createMany({
        data: data.categoryIds.map((cid) => ({ recipeId: created.id, recipeCategoryId: cid })),
      });
    }

    return created;
  });

  return getRecipeById(recipe.id, userId);
};

/**
 * Updates an existing recipe.
 * Can update basic fields, replace items entirely, or replace category assignments.
 * Uses a transaction to ensure consistency.
 * @param id - Recipe ID
 * @param userId - User ID (for ownership verification)
 * @param data - Partial update data
 * @returns Updated recipe with items and categories
 * @throws Error if recipe not found or doesn't belong to user
 */
export const updateRecipe = async (id: string, userId: string, data: UpdateRecipeDto) => {
  const existing = await prisma.recipe.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Recipe not found');

  const result = await prisma.$transaction(async (tx) => {
    await tx.recipe.update({ where: { id }, data: { title: data.title ?? existing.title, description: data.description ?? existing.description, portions: data.portions === undefined ? existing.portions : data.portions } });

    if (data.itemNames !== undefined) {
      // replace items
      await tx.recipeItem.deleteMany({ where: { recipeId: id } });
      if (data.itemNames && data.itemNames.length > 0) {
        await tx.recipeItem.createMany({ data: data.itemNames.map((name, idx) => ({ recipeId: id, name, order: idx })) });
      }
    }

    if (data.categoryIds !== undefined) {
      await tx.recipeCategoryAssignment.deleteMany({ where: { recipeId: id } });
      if (data.categoryIds && data.categoryIds.length > 0) {
        await tx.recipeCategoryAssignment.createMany({ data: data.categoryIds.map(cid => ({ recipeId: id, recipeCategoryId: cid })) });
      }
    }

    return tx.recipe.findUnique({ where: { id }, include: { items: true, categories: { include: { recipeCategory: true } } } });
  });

  if (!result) throw new Error('Failed to update recipe');
  return getRecipeById(result.id, userId);
};

/**
 * Deletes a recipe and all its related items and category assignments (cascade).
 * @param id - Recipe ID
 * @param userId - User ID (for ownership verification)
 * @returns Object with deleted recipe ID
 * @throws Error if recipe not found or doesn't belong to user
 */
export const deleteRecipe = async (id: string, userId: string) => {
  const existing = await prisma.recipe.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Recipe not found');
  await prisma.recipe.delete({ where: { id } });
  return { id };
};

// Recipe category operations

/**
 * Retrieves all recipe categories ordered by display order.
 * Categories are global (not user-specific).
 * @returns Array of recipe categories
 */
export const getRecipeCategories = async () => {
  const cats = await prisma.recipeCategory.findMany({ orderBy: { order: 'asc' } });
  return cats;
};

/**
 * Creates a new recipe category.
 * @param data - Category data with value and optional color
 * @returns Newly created category
 */
export const createRecipeCategory = async (data: { value: string; color?: string }) => {
  const created = await prisma.recipeCategory.create({ data: { value: data.value, color: data.color ?? '#cccccc' } });
  return created;
};

/**
 * Updates a recipe category's value, color, or display order.
 * @param id - Category ID
 * @param data - Partial update data
 * @returns Updated category
 */
export const updateRecipeCategory = async (id: string, data: { value?: string; color?: string; order?: number }) => {
  const updated = await prisma.recipeCategory.update({ where: { id }, data });
  return updated;
};

/**
 * Deletes a recipe category and removes it from all recipe assignments.
 * @param id - Category ID
 * @returns Object with deleted category ID
 */
export const deleteRecipeCategory = async (id: string) => {
  // remove assignments first
  await prisma.recipeCategoryAssignment.deleteMany({ where: { recipeCategoryId: id } });
  await prisma.recipeCategory.delete({ where: { id } });
  return { id };
};
