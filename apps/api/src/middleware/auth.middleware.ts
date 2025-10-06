import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';

interface JWTPayload {
  id: string;
  email: string;
  name: string;
  username?: string;
  tier: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Validate JWT secret on module load - fail fast if not configured
const JWT_SECRET = process.env.NEXTAUTH_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    'FATAL: NEXTAUTH_SECRET environment variable is required for authentication. ' +
    'Please set NEXTAUTH_SECRET in your .env file.'
  );
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      req.user = decoded;
      next();
    } catch (error) {
      throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
    }
  } catch (error) {
    next(error);
  }
};
