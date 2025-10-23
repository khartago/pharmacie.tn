import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import prisma from '../lib/prisma';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        error: 'JWT secret not configured'
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
              include: {
          role: true,
          city: true
        }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or inactive user'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};