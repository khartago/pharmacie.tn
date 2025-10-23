import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): any => {
  console.error('Error:', error);

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(400).json({
          success: false,
          error: 'A record with this data already exists'
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: 'Record not found'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'Database error'
        });
    }
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};