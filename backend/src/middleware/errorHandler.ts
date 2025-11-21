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
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Safer logging: avoid inspecting unknown objects that may have getters
  try {
    if (err instanceof ZodError) {
      console.error('Validation error:', JSON.stringify(err.errors));
    } else if (err instanceof Error) {
      console.error('Error message:', err.message);
      if (err.stack) console.error(err.stack);
    } else if (err && typeof err === 'object' && 'message' in err) {
      const maybeMsg = (err as Record<string, unknown>)['message'];
      if (typeof maybeMsg === 'string') console.error('Error message:', maybeMsg);
      const maybeStack = (err as Record<string, unknown>)['stack'];
      if (typeof maybeStack === 'string') console.error(maybeStack);
    } else {
      console.error('Error (non-Error):', String(err));
    }
  } catch (logErr) {
    console.error('Error while logging error');
  }

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
  let message = 'Internal server error';
  if (err instanceof Error) message = err.message;
  else if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as Record<string, unknown>)['message'];
    if (typeof m === 'string') message = m;
  }

  res.status(500).json({
    success: false,
    error: message || 'Internal server error',
  });
};

/**
 * 404 handler for unknown routes
 * Returns a JSON error for any unmatched route.
 */
export const notFoundHandler = (
  _req: Request,
  res: Response
): void => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
};
