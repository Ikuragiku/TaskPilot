/**
 * Error Handler Middleware
 *
 * Provides global error handling and 404 response for the API.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Global error handler middleware
 * Handles Zod validation errors and generic server errors.
 * @usage Add as last middleware in Express app
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors,
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
};

/**
 * 404 handler for unknown routes
 * Returns a JSON error for any unmatched route.
 */
export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
};
