/**
 * Task Controller
 *
 * Handles CRUD operations for tasks: create, read, update, delete, and filtering.
 * Validates requests with Zod and delegates business logic to taskService.
 */
import { Response, NextFunction } from 'express';
import { AuthRequest, CreateTaskDto, UpdateTaskDto } from '../types';
import * as taskService from '../services/taskService';
import { z } from 'zod';

// Validation schemas for incoming requests
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  statusIds: z.array(z.string()).optional(),
  projectIds: z.array(z.string()).optional(),
  done: z.boolean().optional(),
  deadline: z.string().datetime().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  statusIds: z.array(z.string()).optional(),
  projectIds: z.array(z.string()).optional(),
  done: z.boolean().optional(),
  deadline: z.string().datetime().optional(),
});

/**
 * Get all tasks for the current user
 * @route GET /api/tasks
 * @query { search?, statusIds?, projectIds? }
 * @returns { success, data }
 */
export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const filters = {
      search: req.query.search as string | undefined,
      statusIds: req.query.statusIds
        ? (req.query.statusIds as string).split(',')
        : undefined,
      projectIds: req.query.projectIds
        ? (req.query.projectIds as string).split(',')
        : undefined,
    };

    const tasks = await taskService.getTasks(req.user.id, filters);

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single task by ID
 * @route GET /api/tasks/:id
 * @returns { success, data }
 */
export const getTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const task = await taskService.getTaskById(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 */
export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const validatedData = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(
      req.user.id,
      validatedData as CreateTaskDto
    );

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task
 */
export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const validatedData = updateTaskSchema.parse(req.body);
    const task = await taskService.updateTask(
      req.params.id,
      req.user.id,
      validatedData as UpdateTaskDto
    );

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const result = await taskService.deleteTask(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
