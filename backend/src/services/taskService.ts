import { Prisma } from '@prisma/client';
import prisma from '../prismaClient';
import { CreateTaskDto, UpdateTaskDto } from '../types';

/**
 * Get all tasks for a user with filters
 */
export const getTasks = async (
  userId: string,
  filters?: {
    search?: string;
    statusIds?: string[];
    projectIds?: string[];
  }
) => {
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters?.statusIds && filters.statusIds.length > 0 && {
        statuses: {
          some: {
            statusOptionId: { in: filters.statusIds },
          },
        },
      }),
      ...(filters?.projectIds && filters.projectIds.length > 0 && {
        projects: {
          some: {
            projectOptionId: { in: filters.projectIds },
          },
        },
      }),
    },
    include: {
      statuses: {
        include: {
          statusOption: true,
        },
      },
      projects: {
        include: {
          projectOption: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Transform to cleaner format
  return tasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    done: task.done,
    deadline: task.deadline,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    statuses: task.statuses.map((s: any) => s.statusOption),
    projects: task.projects.map((p: any) => p.projectOption),
  }));
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (taskId: string, userId: string) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
    include: {
      statuses: {
        include: {
          statusOption: true,
        },
      },
      projects: {
        include: {
          projectOption: true,
        },
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    done: task.done,
    deadline: task.deadline,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    statuses: task.statuses.map((s: any) => s.statusOption),
    projects: task.projects.map((p: any) => p.projectOption),
  };
};

/**
 * Create a new task
 */
export const createTask = async (userId: string, data: CreateTaskDto) => {
  // Validate provided status and project IDs to avoid FK errors
  let validStatusIds: string[] | undefined = undefined;
  let validProjectIds: string[] | undefined = undefined;

  if (data.statusIds && data.statusIds.length > 0) {
    const found = await prisma.statusOption.findMany({ where: { id: { in: data.statusIds } }, select: { id: true } });
    validStatusIds = found.map((f) => f.id);
  }

  if (data.projectIds && data.projectIds.length > 0) {
    const found = await prisma.projectOption.findMany({ where: { id: { in: data.projectIds } }, select: { id: true } });
    validProjectIds = found.map((f) => f.id);
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      done: data.done ?? false,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      userId,
      statuses: validStatusIds
        ? {
            create: validStatusIds.map((statusId) => ({
              statusOptionId: statusId,
            })),
          }
        : undefined,
      projects: validProjectIds
        ? {
            create: validProjectIds.map((projectId) => ({
              projectOptionId: projectId,
            })),
          }
        : undefined,
    },
    include: {
      statuses: {
        include: {
          statusOption: true,
        },
      },
      projects: {
        include: {
          projectOption: true,
        },
      },
    },
  });

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    done: task.done,
    deadline: task.deadline,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    statuses: task.statuses.map((s: any) => s.statusOption),
    projects: task.projects.map((p: any) => p.projectOption),
  };
};

/**
 * Update a task
 */
export const updateTask = async (
  taskId: string,
  userId: string,
  data: UpdateTaskDto
) => {
  // Verify task belongs to user
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  // Update task with transaction
  const task = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Update basic fields
    await tx.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        done: data.done,
        deadline: data.deadline ? new Date(data.deadline) : data.deadline === undefined ? undefined : null,
      },
    });

    // Update statuses if provided
    if (data.statusIds !== undefined) {
      // Delete existing statuses
      await tx.taskStatus.deleteMany({
        where: { taskId },
      });

      // Validate provided status IDs to avoid FK errors
      const validStatuses = data.statusIds && data.statusIds.length > 0
        ? (await tx.statusOption.findMany({ where: { id: { in: data.statusIds } }, select: { id: true } })).map((s) => s.id)
        : [];

      if (validStatuses.length > 0) {
        await tx.taskStatus.createMany({
          data: validStatuses.map((statusId) => ({
            taskId,
            statusOptionId: statusId,
          })),
        });
      }
    }

    // Update projects if provided
    if (data.projectIds !== undefined) {
      // Delete existing projects
      await tx.taskProject.deleteMany({
        where: { taskId },
      });

      // Validate provided project IDs to avoid FK errors (they might have been deleted)
      const validProjects = data.projectIds && data.projectIds.length > 0
        ? (await tx.projectOption.findMany({ where: { id: { in: data.projectIds } }, select: { id: true } })).map((p) => p.id)
        : [];

      // Create new projects only for valid IDs
      if (validProjects.length > 0) {
        await tx.taskProject.createMany({
          data: validProjects.map((projectId) => ({
            taskId,
            projectOptionId: projectId,
          })),
        });
      }
    }

    // Fetch updated task with relations
    return await tx.task.findUnique({
      where: { id: taskId },
      include: {
        statuses: {
          include: {
            statusOption: true,
          },
        },
        projects: {
          include: {
            projectOption: true,
          },
        },
      },
    });
  });

  if (!task) {
    throw new Error('Failed to update task');
  }

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    done: task.done,
    deadline: task.deadline,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    statuses: task.statuses.map((s: any) => s.statusOption),
    projects: task.projects.map((p: any) => p.projectOption),
  };
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string, userId: string) => {
  // Verify task belongs to user
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return { id: taskId };
};
