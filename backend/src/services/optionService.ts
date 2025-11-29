/**
 * Option Service
 *
 * Business logic for status and project options management.
 * Handles CRUD operations and automatic order assignment for both status and project options.
 * Options are global across all users.
 */
import prisma from '../prismaClient';
import { CreateOptionDto, UpdateOptionDto } from '../types';

/**
 * Get all status options
 */
export const getStatusOptions = async () => {
  return await prisma.statusOption.findMany({
    orderBy: { order: 'asc' },
  });
};

/**
 * Create a new status option
 */
export const createStatusOption = async (data: CreateOptionDto) => {
  // Get the highest order number
  const maxOrder = await prisma.statusOption.findFirst({
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  return await prisma.statusOption.create({
    data: {
      value: data.value,
      color: data.color,
      order: (maxOrder?.order || 0) + 1,
    },
  });
};

/**
 * Update a status option
 */
export const updateStatusOption = async (
  id: string,
  data: UpdateOptionDto
) => {
  return await prisma.statusOption.update({
    where: { id },
    data,
  });
};

/**
 * Delete a status option
 */
export const deleteStatusOption = async (id: string) => {
  await prisma.statusOption.delete({
    where: { id },
  });

  return { id };
};

/**
 * Get all project options
 */
export const getProjectOptions = async () => {
  return await prisma.projectOption.findMany({
    orderBy: { order: 'asc' },
  });
};

/**
 * Create a new project option
 */
export const createProjectOption = async (data: CreateOptionDto) => {
  // Get the highest order number
  const maxOrder = await prisma.projectOption.findFirst({
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  return await prisma.projectOption.create({
    data: {
      value: data.value,
      color: data.color,
      order: (maxOrder?.order || 0) + 1,
    },
  });
};

/**
 * Update a project option
 */
export const updateProjectOption = async (
  id: string,
  data: UpdateOptionDto
) => {
  return await prisma.projectOption.update({
    where: { id },
    data,
  });
};

/**
 * Delete a project option
 */
export const deleteProjectOption = async (id: string) => {
  await prisma.projectOption.delete({
    where: { id },
  });

  return { id };
};
