import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './error.middleware';

/**
 * Validation middleware factory
 * Creates middleware to validate request body, query, or params against a Zod schema
 */
export function validate(schema: z.ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validated = await schema.parseAsync(data);

      // Replace original data with validated (and transformed) data
      req[source] = validated;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors into user-friendly message
        const firstError = error.errors[0];
        const field = firstError.path.join('.');
        const message = firstError.message;

        throw new AppError(
          field ? `${field}: ${message}` : message,
          400,
          'VALIDATION_ERROR',
          { errors: error.errors } // Include all errors in details
        );
      }

      next(error);
    }
  };
}

/**
 * Validation middleware that validates multiple sources
 * Useful when you need to validate both body and query params
 */
export function validateMultiple(schemas: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate each source that has a schema
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        const field = firstError.path.join('.');
        const message = firstError.message;

        throw new AppError(
          field ? `${field}: ${message}` : message,
          400,
          'VALIDATION_ERROR',
          { errors: error.errors }
        );
      }

      next(error);
    }
  };
}
