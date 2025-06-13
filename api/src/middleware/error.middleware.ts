import { Request, Response, NextFunction } from 'express';

/**
 * Error handling middleware
 * Converts errors to JSON responses with 400 status code
 * Logs full error stack to console
 */
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the full error stack to console
  console.error('Error occurred:', error);
  console.error('Stack trace:', error.stack);

  // Send JSON response with 400 status code
  res.status(400).json({
    error: error.message || 'An unexpected error occurred'
  });
};
