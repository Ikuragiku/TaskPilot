/**
 * Option Controller
 *
 * Handles CRUD operations for status and project options (labels, colors, order).
 * Validates requests with Zod and delegates logic to optionService.
 */
import { Response, NextFunction } from 'express';
import { AuthRequest, CreateOptionDto, UpdateOptionDto } from '../types';
import * as optionService from '../services/optionService';
import { z } from 'zod';

// Validation schemas for incoming requests
const createOptionSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
});

const updateOptionSchema = z.object({
  value: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  order: z.number().optional(),
});

/**
 * Get all status options
 * @route GET /api/options/status
 * @returns { success, data }
 */
export const getStatusOptions = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const options = await optionService.getStatusOptions();
    res.status(200).json({
      success: true,
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new status option
 * @route POST /api/options/status
 * @body { value, color }
 * @returns { success, data }
 */
export const createStatusOption = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createOptionSchema.parse(req.body);
    const option = await optionService.createStatusOption(
      validatedData as CreateOptionDto
    );

    res.status(201).json({
      success: true,
      data: option,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a status option
 * @route PUT /api/options/status/:id
 * @body { value?, color?, order? }
 * @returns { success, data }
 */
export const updateStatusOption = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = updateOptionSchema.parse(req.body);
    const option = await optionService.updateStatusOption(
      req.params.id,
      validatedData as UpdateOptionDto
    );

    res.status(200).json({
      success: true,
      data: option,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a status option
 */
export const deleteStatusOption = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await optionService.deleteStatusOption(req.params.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all project options
 */
export const getProjectOptions = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const options = await optionService.getProjectOptions();
    res.status(200).json({
      success: true,
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project option
 */
export const createProjectOption = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createOptionSchema.parse(req.body);
    const option = await optionService.createProjectOption(
      validatedData as CreateOptionDto
    );

    res.status(201).json({
      success: true,
      data: option,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a project option
 */
export const updateProjectOption = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = updateOptionSchema.parse(req.body);
    const option = await optionService.updateProjectOption(
      req.params.id,
      validatedData as UpdateOptionDto
    );

    res.status(200).json({
      success: true,
      data: option,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project option
 */
export const deleteProjectOption = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await optionService.deleteProjectOption(req.params.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
