import { PrismaClient } from '@prisma/client';
import { CreateTaskDto, UpdateTaskDto } from '../types';

const prisma = new PrismaClient();

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
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      done: data.done ?? false,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      userId,
      statuses: data.statusIds
        ? {
            create: data.statusIds.map((statusId) => ({
              statusOptionId: statusId,
            })),
          }
        : undefined,
      projects: data.projectIds
        ? {
            create: data.projectIds.map((projectId) => ({
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
  const task = await prisma.$transaction(async (tx: PrismaClient) => {
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

      // Create new statuses
      if (data.statusIds.length > 0) {
        await tx.taskStatus.createMany({
          data: data.statusIds.map((statusId) => ({
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

      // Create new projects
      if (data.projectIds.length > 0) {
        await tx.taskProject.createMany({
          data: data.projectIds.map((projectId) => ({
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
