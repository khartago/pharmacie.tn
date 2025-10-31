import express from 'express';
import { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../lib/prisma';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all suppliers (public endpoint for authenticated users)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 50 } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {
      role: { name: 'SUPPLIER' },
      isActive: true
    };

    // Add search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true
        },
        orderBy: { name: 'asc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        data: suppliers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suppliers'
    });
  }
}));

export default router;
