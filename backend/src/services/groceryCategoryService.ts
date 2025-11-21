/**
 * Grocery Category Service
 *
 * Provides CRUD operations for grocery categories using Prisma.
 * Returned values are Prisma model objects matching the `groceryCategory` table.
 */
import { CreateOptionDto, UpdateOptionDto } from '../types';
import prisma from '../prismaClient';

export const getGroceryCategories = async () => {
  /**
   * Return all grocery categories ordered by the `order` field (ascending).
   */
  return await prisma.groceryCategory.findMany({ orderBy: { order: 'asc' } });
};

/**
 * Create a new grocery category.
 * - `data.value`: label
 * - `data.color`: hex color
 * The function ensures a sensible `order` value by reading the current max.
 */
export const createGroceryCategory = async (data: CreateOptionDto) => {
  const maxOrder = await prisma.groceryCategory.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
  return await prisma.groceryCategory.create({
    data: {
      value: data.value,
      color: data.color,
      order: (maxOrder?.order || 0) + 1,
    },
  });
};

/**
 * Update an existing grocery category by id. Returns the updated record.
 */
export const updateGroceryCategory = async (id: string, data: UpdateOptionDto) => {
  return await prisma.groceryCategory.update({ where: { id }, data });
};

/**
 * Delete a grocery category by id. Returns `{ id }` on success.
 */
export const deleteGroceryCategory = async (id: string) => {
  await prisma.groceryCategory.delete({ where: { id } });
  return { id };
};

export default {
  getGroceryCategories,
  createGroceryCategory,
  updateGroceryCategory,
  deleteGroceryCategory,
};
