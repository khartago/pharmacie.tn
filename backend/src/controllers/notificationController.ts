import { Response } from 'express';
import { NotificationType, RoleType } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../types';
import { AuditService } from '../services/auditService';

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, isRead, unreadOnly, type } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {
      userId: req.user!.id
    };

    // Filter by read status
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    } else if (unreadOnly === 'true') {
      where.isRead = false;
    }

    // Filter by type
    if (type) {
      where.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: req.user!.id,
          isRead: false
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        data: notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notifications'
    });
  }
};

export const getNotificationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Notification ID is required'
      });
      return;
    }

    const notification = await prisma.notification.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
      return;
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification'
    });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Notification ID is required'
      });
      return;
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user!.id
      }
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
      return;
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });

    // Log notification read
    await AuditService.logNotificationRead(req.user!.id, parseInt(id));

    res.json({
      success: true,
      data: updatedNotification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({
      success: true,
      data: { updatedCount: result.count },
      message: `${result.count} notifications marked as read`
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
};

export const deleteNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Notification ID is required'
      });
      return;
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user!.id
      }
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
      return;
    }

    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
};

export const createNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId, title, message, type } = req.body;

    // Only admins can create notifications for other users
    if (req.user?.role.name !== RoleType.ADMIN && userId !== req.user?.id) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    // Validate required fields
    if (!userId || !title || !message || !type) {
      res.status(400).json({
        success: false,
        error: 'User ID, title, message, and type are required'
      });
      return;
    }

    // Validate type
    if (!Object.values(NotificationType).includes(type)) {
      res.status(400).json({
        success: false,
        error: 'Invalid notification type'
      });
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    });
  }
};

export const getNotificationStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [total, unread, byType] = await Promise.all([
      prisma.notification.count({
        where: { userId: req.user!.id }
      }),
      prisma.notification.count({
        where: {
          userId: req.user!.id,
          isRead: false
        }
      }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId: req.user!.id },
        _count: {
          type: true
        }
      })
    ]);

    const typeStats = byType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        total,
        unread,
        read: total - unread,
        byType: typeStats
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification statistics'
    });
  }
};