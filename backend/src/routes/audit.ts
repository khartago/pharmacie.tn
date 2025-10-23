import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get audit logs with filters
router.get('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      userId,
      startDate,
      endDate,
      entityType,
      entityId
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build where clause
    const where: any = {};
    
    if (action) {
      where.action = action;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (entityType) {
      where.entityType = entityType;
    }
    
    if (entityId) {
      where.entityId = entityId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          userId: true,
          action: true,
          entityType: true,
          entityId: true,
          details: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: Number(limit)
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs'
    });
  }
});

// Get audit log by ID
router.get('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Audit log ID is required'
      });
      return;
    }

    const log = await prisma.auditLog.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        userId: true,
        action: true,
        entityType: true,
        entityId: true,
        details: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!log) {
      res.status(404).json({
        success: false,
        error: 'Audit log not found'
      });
      return;
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Failed to fetch audit log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit log'
    });
  }
});

// Get audit statistics
router.get('/stats/overview', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalLogs,
      logsToday,
      logsThisWeek,
      logsThisMonth,
      actionStats,
      userStats,
      entityStats
    ] = await Promise.all([
      // Total logs
      prisma.auditLog.count(),
      
      // Logs today
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Logs this week
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      }),
      
      // Logs this month
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      }),
      
      // Action statistics
      prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          action: true
        },
        orderBy: {
          _count: {
            action: 'desc'
          }
        },
        take: 10
      }),
      
      // User statistics
      prisma.auditLog.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          userId: true
        },
        orderBy: {
          _count: {
            userId: 'desc'
          }
        },
        take: 10
      }),
      
      // Entity statistics
      prisma.auditLog.groupBy({
        by: ['entityType'],
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          entityType: true
        },
        orderBy: {
          _count: {
            entityType: 'desc'
          }
        }
      })
    ]);

    // Get user details for user stats
    const userDetails = await Promise.all(
      userStats.map(async (stat) => {
        if (!stat.userId) {
          return {
            userId: null,
            count: stat._count.userId,
            user: null
          };
        }
        
        const user = await prisma.user.findUnique({
          where: { id: stat.userId },
          select: { email: true, name: true, role: true }
        });
        return {
          userId: stat.userId,
          count: stat._count.userId,
          user
        };
      })
    );

    res.json({
      success: true,
      data: {
        overview: {
          total: totalLogs,
          today: logsToday,
          thisWeek: logsThisWeek,
          thisMonth: logsThisMonth
        },
        actions: actionStats.map(stat => ({
          action: stat.action,
          count: stat._count.action
        })),
        users: userDetails,
        entities: entityStats.map(stat => ({
          entityType: stat.entityType,
          count: stat._count.entityType
        }))
      }
    });
  } catch (error) {
    console.error('Failed to fetch audit statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit statistics'
    });
  }
});

// Get available filters
router.get('/filters/available', authenticateToken, requireRole(['ADMIN']), async (_req, res) => {
  try {
    const [actions, entityTypes, users] = await Promise.all([
      prisma.auditLog.findMany({
        select: { action: true },
        distinct: ['action'],
        orderBy: { action: 'asc' }
      }),
      prisma.auditLog.findMany({
        select: { entityType: true },
        distinct: ['entityType'],
        orderBy: { entityType: 'asc' }
      }),
      prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true },
        orderBy: { name: 'asc' }
      })
    ]);

    res.json({
      success: true,
      data: {
        actions: actions.map(a => a.action),
        entityTypes: entityTypes.map(e => e.entityType),
        users: users.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role
        }))
      }
    });
  } catch (error) {
    console.error('Failed to fetch available filters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available filters'
    });
  }
});

export default router; 