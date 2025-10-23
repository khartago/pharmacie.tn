import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../lib/prisma';
import { socketService } from '../services/socketService';

export const archiveExpiredAnnouncements = async (_req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();

    // Find expired announcements
    const expiredAnnouncements = await prisma.announcement.findMany({
      where: {
        status: 'AVAILABLE',
        expiryDate: { lt: today }
      },
      include: {
        pharmacyUser: true,
        supplierUser: true
      }
    });

    // Update status to EXPIRED
    const archivedCount = await prisma.announcement.updateMany({
      where: {
        status: 'AVAILABLE',
        expiryDate: { lt: today }
      },
      data: {
        status: 'EXPIRED'
      }
    });

    // Send notifications to both pharmacy and supplier
    expiredAnnouncements.forEach(announcement => {
      socketService.notifyExpiration(
        announcement.id.toString(),
        'annonce',
        announcement.pharmacyUserId
      );
      socketService.notifyExpiration(
        announcement.id.toString(),
        'annonce',
        announcement.supplierUserId || ''
      );
    });

    res.json({
      success: true,
      data: {
        archivedCount: archivedCount.count,
        message: `${archivedCount.count} annonces ont été archivées`
      }
    });
  } catch (error) {
    console.error('Archive expired announcements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive expired announcements'
    });
  }
};

export const archiveExpiredRequests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find expired requests
    const expiredRequests = await prisma.request.findMany({
      where: {
        status: 'OPEN',
        createdAt: { lt: sevenDaysAgo }
      },
      include: {
        user: true
      }
    });

    // Update status to EXPIRED
    const archivedCount = await prisma.request.updateMany({
      where: {
        status: 'OPEN',
        createdAt: { lt: sevenDaysAgo }
      },
      data: {
        status: 'EXPIRED'
      }
    });

    // Send notifications to request owners
    expiredRequests.forEach(request => {
      socketService.notifyExpiration(
        request.id.toString(),
        'request',
        request.userId
      );
    });

    res.json({
      success: true,
      data: {
        archivedCount: archivedCount.count,
        message: `${archivedCount.count} demandes ont été archivées`
      }
    });
  } catch (error) {
    console.error('Archive expired requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive expired requests'
    });
  }
};

export const archiveExpiredRetours = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find old retours (announcements with return status)
    const expiredRetours = await prisma.announcement.findMany({
      where: {
        supplierStatus: {
          in: ['PENDING', 'DONE', 'REFUSED']
        },
        createdAt: { lt: sevenDaysAgo }
      },
      include: {
        pharmacyUser: true,
        supplierUser: true
      }
    });

    // Update status to EXPIRED
    const archivedCount = await prisma.announcement.updateMany({
      where: {
        supplierStatus: {
          in: ['PENDING', 'DONE', 'REFUSED']
        },
        createdAt: { lt: sevenDaysAgo }
      },
      data: {
        status: 'EXPIRED'
      }
    });

    // Send notifications to both pharmacy and supplier
    expiredRetours.forEach(retour => {
      socketService.notifyExpiration(
        retour.id.toString(),
        'retour',
        retour.pharmacyUserId
      );
      socketService.notifyExpiration(
        retour.id.toString(),
        'retour',
        retour.supplierUserId || ''
      );
    });

    res.json({
      success: true,
      data: {
        archivedCount: archivedCount.count,
        message: `${archivedCount.count} retours ont été archivés`
      }
    });
  } catch (error) {
    console.error('Archive expired retours error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive expired retours'
    });
  }
};

export const getArchivedAnnouncements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', search, status, supplierStatus } = req.query as { 
      page: string; 
      limit: string; 
      search?: string; 
      status?: string; 
      supplierStatus?: string; 
    };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where: any = {
      pharmacyUserId: req.user?.id || '', // Only MY announcements
      OR: [
        { status: { in: ['SOLD', 'EXPIRED'] } }, // Done or sold or expired
        { supplierStatus: 'DONE' } // Done retours
      ]
    };

    // Add status filter
    if (status) {
      where.OR = [
        { status: status }
      ];
    }

    // Add supplier status filter
    if (supplierStatus) {
      if (where.OR) {
        where.OR.push({ supplierStatus: supplierStatus });
      } else {
        where.supplierStatus = supplierStatus;
      }
    }

    // Add search functionality
    if (search) {
      where.AND = [
        {
          OR: [
            {
              medicine: {
                OR: [
                  { brandName: { contains: search, mode: 'insensitive' } },
                  { dci: { contains: search, mode: 'insensitive' } },
                  { laboratoire: { contains: search, mode: 'insensitive' } }
                ]
              }
            },
            {
              pharmacyUser: {
                name: { contains: search, mode: 'insensitive' }
              }
            },
            {
              supplierUser: {
                name: { contains: search, mode: 'insensitive' }
              }
            },
            {
              manualSupplierName: { contains: search, mode: 'insensitive' }
            }
          ]
        }
      ];
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          pharmacyUser: {
            include: {
              city: true
            }
          },
          supplierUser: {
            include: {
              city: true
            }
          },
          medicine: true,
          interests: {
            where: {
              status: 'ACCEPTED'
            },
            include: {
              pharmacyUser: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          updatedAt: 'desc'
        }
      }),
      prisma.announcement.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        announcements,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get archived announcements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get archived announcements'
    });
  }
};

export const restoreAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Announcement ID is required'
      });
      return;
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!announcement) {
      res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
      return;
    }

    if (announcement.status !== 'EXPIRED') {
      res.status(400).json({
        success: false,
        error: 'Only expired announcements can be restored'
      });
      return;
    }

    const restoredAnnouncement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        status: 'AVAILABLE'
      },
      include: {
        pharmacyUser: {
          include: {
            city: true
          }
        },
        supplierUser: {
          include: {
            city: true
          }
        },
        medicine: true
      }
    });

    res.json({
      success: true,
      data: restoredAnnouncement,
      message: 'Announcement restored successfully'
    });
  } catch (error) {
    console.error('Restore announcement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore announcement'
    });
  }
};

export const renewAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ success: false, error: 'Announcement ID required' });
      return;
    }
    
    const announcement = await prisma.announcement.findUnique({ where: { id: parseInt(id) } });
    
    if (!announcement || announcement.pharmacyUserId !== req.user?.id) {
      res.status(403).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    if (announcement.status !== 'EXPIRED') {
      res.status(400).json({ success: false, error: 'Only expired announcements can be renewed' });
      return;
    }
    
    await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { 
        status: 'AVAILABLE',
        supplierStatus: 'NONE', // Reset supplier status too
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    res.json({ success: true, message: 'Announcement renewed' });
  } catch (error) {
    console.error('Renew error:', error);
    res.status(500).json({ success: false, error: 'Failed to renew' });
  }
}; 