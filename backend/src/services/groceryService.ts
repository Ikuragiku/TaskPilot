/**
 * Grocery Service
 *
 * Performs database operations for groceries and maps Prisma model shapes to
 * the simplified objects used by the API. Functions throw errors for not-found
 * cases and return objects that include expanded `categories` arrays.
 */
import { Prisma } from '@prisma/client';
import prisma from '../prismaClient';
import { CreateGroceryDto, UpdateGroceryDto } from '../types';

export const getGroceries = async (userId: string, filters?: { search?: string; categoryIds?: string[] }) => {
  const groceries = await prisma.grocery.findMany({
    where: {
      userId,
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { menge: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters?.categoryIds && filters.categoryIds.length > 0 && {
        categories: {
          some: {
            groceryCategoryId: { in: filters.categoryIds },
          },
        },
      }),
    },
    include: {
      categories: { include: { groceryCategory: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return groceries.map((g: any) => ({
    id: g.id,
    title: g.title,
    menge: g.menge,
    done: g.done,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    categories: g.categories.map((c: any) => c.groceryCategory),
  }));
};

export const getGroceryById = async (id: string, userId: string) => {
  const g = await prisma.grocery.findFirst({ where: { id, userId }, include: { categories: { include: { groceryCategory: true } } } });
  if (!g) throw new Error('Grocery not found');
  return {
    id: g.id,
    title: g.title,
    menge: g.menge,
    done: g.done,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    categories: g.categories.map((c: any) => c.groceryCategory),
  };
};

export const createGrocery = async (userId: string, data: CreateGroceryDto) => {
  const grocery = await prisma.grocery.create({
    data: {
      title: data.title,
      menge: data.menge,
      done: data.done ?? false,
      userId,
      categories: data.categoryIds
        ? { create: data.categoryIds.map((cid) => ({ groceryCategoryId: cid })) }
        : undefined,
    },
    include: { categories: { include: { groceryCategory: true } } },
  });

  return {
    id: grocery.id,
    title: grocery.title,
    menge: grocery.menge,
    done: grocery.done,
    createdAt: grocery.createdAt,
    updatedAt: grocery.updatedAt,
    categories: grocery.categories.map((c: any) => c.groceryCategory),
  };
};

export const updateGrocery = async (id: string, userId: string, data: UpdateGroceryDto) => {
  const existing = await prisma.grocery.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Grocery not found');

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.grocery.update({ where: { id }, data: { title: data.title, menge: data.menge, done: data.done } });

    if (data.categoryIds !== undefined) {
      await tx.groceryCategoryAssignment.deleteMany({ where: { groceryId: id } });
      if (data.categoryIds.length > 0) {
        await tx.groceryCategoryAssignment.createMany({
          data: data.categoryIds.map((cid) => ({ groceryId: id, groceryCategoryId: cid })),
        });
      }
    }

    return await tx.grocery.findUnique({ where: { id }, include: { categories: { include: { groceryCategory: true } } } });
  });

  if (!result) throw new Error('Failed to update grocery');
  return {
    id: result.id,
    title: result.title,
    menge: result.menge,
    done: result.done,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    categories: result.categories.map((c: any) => c.groceryCategory),
  };
};

export const deleteGrocery = async (id: string, userId: string) => {
  const existing = await prisma.grocery.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Grocery not found');
  await prisma.grocery.delete({ where: { id } });
  return { id };
};

export default {
  getGroceries,
  getGroceryById,
  createGrocery,
  updateGrocery,
  deleteGrocery,
};
