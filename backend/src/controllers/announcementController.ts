import { Response } from 'express';
import { AnnouncementStatus, RoleType, InterestStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest, CreateAnnouncementData } from '../types';
import { NotificationService } from '../services/notificationService';
import { AuditService } from '../services/auditService';

export const getAnnouncements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 21, status, medicineId, regionName, search, hasInterests } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by medicine
    if (medicineId) {
      where.medicineId = parseInt(medicineId);
    }

    // Search functionality
    if (search) {
      where.OR = [
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
      ];
    }

    // Filter by region (through pharmacy's city)
    if (regionName) {
      // Convert region name to enum value
      const regionMap: { [key: string]: string } = {
        'TUNIS': 'TUNIS',
        'ARIANA': 'ARIANA',
        'BEN_AROUS': 'BEN_AROUS',
        'MANOUBA': 'MANOUBA',
        'NABEUL': 'NABEUL',
        'ZAGHOUAN': 'ZAGHOUAN',
        'BIZERTE': 'BIZERTE',
        'BEJA': 'BEJA',
        'JENDOUBA': 'JENDOUBA',
        'KEF': 'KEF',
        'SILIANA': 'SILIANA',
        'SOUSSE': 'SOUSSE',
        'MONASTIR': 'MONASTIR',
        'MAHDIA': 'MAHDIA',
        'SFAX': 'SFAX',
        'KAIROUAN': 'KAIROUAN',
        'KASSERINE': 'KASSERINE',
        'SIDI_BOUZID': 'SIDI_BOUZID',
        'GABES': 'GABES',
        'MEDENINE': 'MEDENINE',
        'TATAOUINE': 'TATAOUINE',
        'GAFSA': 'GAFSA',
        'TOZEUR': 'TOZEUR',
        'KEBILI': 'KEBILI'
      };
      where.pharmacyUser = {
        city: {
          region: regionMap[regionName] as any
        }
      };
    }

    // Filter based on user role and query parameters
    const userOnly = req.query['userOnly'] === 'true';
    const excludeMine = req.query['excludeMine'] === 'true';
    const excludeInterested = req.query['excludeInterested'] === 'true';
    const forSupplier = req.query['forSupplier'] === 'true';
    const visibleToSupplierParam = req.query['visibleToSupplier'];

    // User-specific filtering
    if (userOnly && req.user?.id) {
      // MES ANNONCES: (available or pending or reserved) and mine
      where.pharmacyUserId = req.user.id;
      where.status = { in: ['AVAILABLE', 'RESERVED'] }; // Available or reserved
      where.supplierStatus = { in: ['NONE', 'PENDING'] }; // Not done or refused
    } else if (excludeMine && req.user?.id) {
      // DISPONIBLES: available and not mine
      where.pharmacyUserId = { not: req.user.id };
      where.status = 'AVAILABLE'; // Only available
      
      // Exclude only ACCEPTED interests for DISPONIBLES tab
      if (excludeInterested) {
        where.interests = {
          none: {
            pharmacyUserId: req.user.id,
            status: 'ACCEPTED'
          }
        };
      }
    }

    // Supplier-specific filtering
    if (req.user?.role.name === RoleType.SUPPLIER || forSupplier === true) {
      // Suppliers should only see announcements visible to them
      where.visibleToSupplier = true;
      where.status = 'AVAILABLE'; // Still available for B2B
      where.supplierStatus = { in: ['NONE', 'REFUSED'] }; // Not yet accepted or previously refused
    }

    // Explicit visibleToSupplier filter from query params
    if (visibleToSupplierParam !== undefined) {
      where.visibleToSupplier = visibleToSupplierParam === 'true';
    }

    // Filter by hasInterests (for mes-annonces tab)
    if (hasInterests !== undefined) {
      if (hasInterests === 'true') {
        where.interests = {
          some: {}
        };
      } else {
        where.interests = {
          none: {}
        };
      }
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          medicine: true,
          pharmacyUser: {
            select: {
              id: true,
              name: true,
              phone: true,
              city: true
            }
          },
          supplierUser: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          interests: {
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
          createdAt: 'desc'
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
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get announcements'
    });
  }
};

export const getAnnouncementById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        success: false,
        error: 'Valid announcement ID is required'
      });
      return;
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
      include: {
        medicine: true,
        pharmacyUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            city: true
          }
        },
        supplierUser: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        interests: {
          include: {
            pharmacyUser: {
              select: {
                id: true,
                name: true,
                phone: true,
                city: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!announcement) {
      res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
      return;
    }

    // Check visibility
    if (req.user?.role.name !== RoleType.ADMIN && 
        !announcement.visibleToSupplier && 
        announcement.pharmacyUserId !== req.user?.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get announcement'
    });
  }
};

export const createAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { medicineId, quantity, expiryDate, supplierUserId, manualSupplierName, visibleToSupplier = true }: CreateAnnouncementData = req.body;

    // Only pharmacies can create announcements
    if (req.user?.role.name !== RoleType.PHARMACY) {
      res.status(403).json({
        success: false,
        error: 'Only pharmacies can create announcements'
      });
      return;
    }

    // Validate required fields
    if (!medicineId || !quantity || !expiryDate || (!supplierUserId && !manualSupplierName)) {
      res.status(400).json({
        success: false,
        error: 'Medicine ID, quantity, expiry date, and supplier (ID or name) are required'
      });
      return;
    }

    // Verify medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId }
    });

    if (!medicine) {
      res.status(404).json({
        success: false,
        error: 'Medicine not found'
      });
      return;
    }

    // Verify supplier exists only if supplierUserId provided
    if (supplierUserId) {
      const supplier = await prisma.user.findFirst({
        where: {
          id: supplierUserId,
          role: {
            name: RoleType.SUPPLIER
          },
          isActive: true
        }
      });

      if (!supplier) {
        res.status(404).json({
          success: false,
          error: 'Supplier not found'
        });
        return;
      }
    }

    const announcement = await prisma.announcement.create({
      data: {
        medicineId,
        quantity,
        expiryDate: new Date(expiryDate),
        supplierUserId: supplierUserId || null,
        manualSupplierName: manualSupplierName || null,
        pharmacyUserId: req.user.id,
        visibleToSupplier
      },
      include: {
        medicine: true,
        pharmacyUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            city: true
          }
        },
        supplierUser: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    // Log announcement creation
    await AuditService.logAnnouncementCreated(req.user.id, announcement.id, {
      medicineId,
      quantity,
      expiryDate,
      visibleToSupplier
    });

    // Notify supplier if visible to supplier
    if (visibleToSupplier) {
      await NotificationService.notifyRetourCreated(announcement.id);
      // Log retour creation
      await AuditService.logRetourCreated(req.user.id, announcement.id);
    }

    res.status(201).json({
      success: true,
      data: announcement,
      message: 'Announcement created successfully'
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create announcement'
    });
  }
};

export const updateAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, expiryDate, status, visibleToSupplier } = req.body;

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

    // Check permissions
    if (req.user?.role.name !== RoleType.ADMIN && 
        announcement.pharmacyUserId !== req.user?.id &&
        announcement.supplierUserId !== req.user?.id) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        ...(quantity && { quantity }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(status && { status }),
        ...(visibleToSupplier !== undefined && { visibleToSupplier })
      },
      include: {
        medicine: true,
        pharmacyUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            city: true
          }
        },
        supplierUser: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedAnnouncement,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update announcement'
    });
  }
};

export const deleteAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Check permissions
    if (req.user?.role.name !== RoleType.ADMIN && 
        announcement.pharmacyUserId !== req.user?.id) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    await prisma.announcement.delete({
      where: { id: parseInt(id) }
    });

    // Log announcement deletion
    await AuditService.logAnnouncementDeleted(req.user!.id, parseInt(id));

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete announcement'
    });
  }
};

// Get user's interests (announcements where user expressed interest)
export const getMyInterests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const { page = 1, limit = 21, search, interestStatus } = req.query as any;
    const limitInt = parseInt(limit);
    const skip = (parseInt(page) - 1) * limitInt;

    // Build announcement filter - exclude completed announcements
    const announcementFilter: any = {
      AND: [
        {
          OR: [
            { status: 'AVAILABLE' }, // Available with my interest
            { status: 'RESERVED' }   // Reserved with my interest
          ]
        },
        {
          status: { notIn: ['SOLD', 'EXPIRED'] } // Not sold or expired
        },
        {
          supplierStatus: { not: 'DONE' } // Not completed retour
        }
      ]
    };

    // Add search functionality
    if (search) {
      announcementFilter.AND = [
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

    // Build interest filter
    const interestFilter: any = {
      pharmacyUserId: req.user.id,
      announcement: announcementFilter
    };

    // Add interest status filter
    if (interestStatus) {
      interestFilter.status = interestStatus;
    }

    // MES INTÉRÊTS: available with interest from me or Reserved and interest from me
    const [interests, total] = await Promise.all([
      prisma.interest.findMany({
        where: interestFilter,
        include: {
          announcement: {
            include: {
              medicine: true,
              pharmacyUser: {
                include: {
                  city: true
                }
              },
              supplierUser: {
                select: {
                  id: true,
                  name: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitInt
      }),
      prisma.interest.count({
        where: interestFilter
      })
    ]);

    res.json({
      success: true,
      data: interests,
      pagination: {
        page: parseInt(page),
        limit: limitInt,
        total,
        totalPages: Math.ceil(total / limitInt)
      }
    });
  } catch (error) {
    console.error('Get my interests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get interests'
    });
  }
};

// Interest management
export const expressInterest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Announcement ID is required'
      });
      return;
    }

    // Only pharmacies can express interest
    if (req.user?.role.name !== RoleType.PHARMACY) {
      res.status(403).json({
        success: false,
        error: 'Only pharmacies can express interest'
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

    // Check if announcement is available
    if (announcement.status !== AnnouncementStatus.AVAILABLE) {
      res.status(400).json({
        success: false,
        error: 'Announcement is not available for interest'
      });
      return;
    }

    // Check if interest already exists
    const existingInterest = await prisma.interest.findUnique({
      where: {
        announcementId_pharmacyUserId: {
          announcementId: parseInt(id),
          pharmacyUserId: req.user.id
        }
      }
    });

    if (existingInterest) {
      res.status(400).json({
        success: false,
        error: 'Interest already expressed'
      });
      return;
    }

    const interest = await prisma.interest.create({
      data: {
        announcementId: parseInt(id),
        pharmacyUserId: req.user.id
      },
      include: {
        announcement: {
          include: {
            medicine: true
          }
        },
        pharmacyUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            city: true
          }
        }
      }
    });

    // Log interest expression
    await AuditService.logInterestExpressed(req.user.id, interest.id, parseInt(id));

    // Notify announcement owner
    await NotificationService.notifyAnnouncementInterest(parseInt(id));

    res.status(201).json({
      success: true,
      data: interest,
      message: 'Interest expressed successfully'
    });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to express interest'
    });
  }
};

export const updateInterestStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, interestId } = req.params;
    const { status } = req.body;

    if (!id || !interestId) {
      res.status(400).json({
        success: false,
        error: 'Announcement ID and Interest ID are required'
      });
      return;
    }

    if (!Object.values(InterestStatus).includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Invalid interest status'
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

    // Only pharmacy owner or supplier can update interest status
    if (announcement.pharmacyUserId !== req.user?.id && 
        announcement.supplierUserId !== req.user?.id &&
        req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    const updatedInterest = await prisma.interest.update({
      where: { id: parseInt(interestId) },
      data: { status },
      include: {
        announcement: {
          include: {
            medicine: true
          }
        },
        pharmacyUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            city: true
          }
        }
      }
    });

    // Update announcement status when accepting interest
    if (status === 'ACCEPTED') {
      if (announcement.status !== 'AVAILABLE') {
        res.status(400).json({ success: false, error: 'Announcement no longer available' });
        return;
      }
      
      await prisma.announcement.update({
        where: { id: parseInt(id) },
        data: { status: 'RESERVED' }
      });
      
      // If supplierStatus is PENDING, notify supplier that pharmacy won
      if (announcement.supplierStatus === 'PENDING' && announcement.supplierUserId) {
        await prisma.notification.create({
          data: {
            userId: announcement.supplierUserId,
            type: 'RETOUR',
            title: 'Retour annulé',
            message: `Le médicament a été vendu en B2B avant finalisation du retour.`
          }
        });
      }
      
      await AuditService.logInterestAccepted(req.user!.id, parseInt(interestId), parseInt(id));
    } else if (status === 'REFUSED') {
      await AuditService.logInterestRefused(req.user!.id, parseInt(interestId), parseInt(id));
    }

    // Notify interested pharmacy
    await NotificationService.notifyInterestResponse(parseInt(interestId), status);

    res.json({
      success: true,
      data: updatedInterest,
      message: 'Interest status updated successfully'
    });
  } catch (error) {
    console.error('Update interest status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update interest status'
    });
  }
};

export const supplierAcceptRetour = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Announcement ID is required'
      });
      return;
    }

    // Only suppliers can directly accept retours
    if (req.user?.role.name !== RoleType.SUPPLIER) {
      res.status(403).json({
        success: false,
        error: 'Only suppliers can accept retours'
      });
      return;
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
      include: {
        medicine: true,
        pharmacyUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            city: true
          }
        }
      }
    });

    if (!announcement) {
      res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
      return;
    }

    // Must be visible to suppliers
    if (!announcement.visibleToSupplier) {
      res.status(403).json({
        success: false,
        error: 'This announcement is not available for suppliers'
      });
      return;
    }

    // Check if announcement is still available for B2B
    if (announcement.status !== AnnouncementStatus.AVAILABLE) {
      res.status(400).json({
        success: false,
        error: 'Announcement already reserved/sold in B2B'
      });
      return;
    }
    
    if (announcement.supplierStatus !== 'NONE' && announcement.supplierStatus !== 'REFUSED') {
      res.status(400).json({
        success: false,
        error: 'Retour already processed'
      });
      return;
    }

    // Update only supplier status
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { 
        supplierStatus: 'PENDING'
      },
      include: {
        medicine: true,
        pharmacyUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            city: true
          }
        }
      }
    });

    // Log supplier acceptance
    await AuditService.logRetourAccepted(req.user.id, parseInt(id));

    // Notify pharmacy that supplier accepted
    await NotificationService.notifyRetourCreated(parseInt(id));

    res.json({
      success: true,
      data: updatedAnnouncement,
      message: 'Retour accepté avec succès'
    });
  } catch (error) {
    console.error('Supplier accept retour error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept retour'
    });
  }
};

export const refuseRetour = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!id) {
      res.status(400).json({ success: false, error: 'Announcement ID required' });
      return;
    }
    
    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
      include: { pharmacyUser: true, medicine: true }
    });
    
    if (!announcement || announcement.supplierUserId !== req.user?.id) {
      res.status(403).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { supplierStatus: 'REFUSED' }
    });
    
    await prisma.notification.create({
      data: {
        userId: announcement.pharmacyUserId,
        type: 'RETOUR',
        title: 'Retour refusé',
        message: `Retour refusé pour ${announcement.medicine?.brandName}. ${reason ? `Raison: ${reason}` : ''}`
      }
    });
    
    res.json({ success: true, message: 'Retour refused, still available for B2B' });
  } catch (error) {
    console.error('Refuse retour error:', error);
    res.status(500).json({ success: false, error: 'Failed to refuse retour' });
  }
};

export const markRetourDone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ success: false, error: 'Announcement ID required' });
      return;
    }
    
    const announcement = await prisma.announcement.findUnique({ 
      where: { id: parseInt(id) },
      include: { pharmacyUser: true, supplierUser: true, medicine: true }
    });
    
    if (!announcement || announcement.supplierStatus !== 'PENDING') {
      res.status(400).json({ success: false, error: 'Invalid retour status' });
      return;
    }
    
    const isSupplier = announcement.supplierUserId === req.user?.id;
    const isPharmacy = announcement.pharmacyUserId === req.user?.id;
    
    if (!isSupplier && !isPharmacy) {
      res.status(403).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { 
        supplierStatus: 'DONE',
        status: 'EXPIRED' // Archive the B2B side too
      }
    });
    
    const recipientId = isSupplier ? announcement.pharmacyUserId : announcement.supplierUserId;
    if (recipientId) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'RETOUR',
          title: 'Retour finalisé',
          message: `Le retour pour ${announcement.medicine?.brandName} est terminé.`
        }
      });
    }
    
    res.json({ success: true, message: 'Retour marked as done' });
  } catch (error) {
    console.error('Mark retour done error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark retour as done' });
  }
};

export const markAsSold = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ success: false, error: 'Announcement ID required' });
      return;
    }
    
    const announcement = await prisma.announcement.findUnique({ 
      where: { id: parseInt(id) },
      include: { interests: { where: { status: 'ACCEPTED' } }, medicine: true, supplierUser: true }
    });
    
    if (!announcement || announcement.pharmacyUserId !== req.user?.id) {
      res.status(403).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    if (announcement.status !== 'RESERVED') {
      res.status(400).json({ success: false, error: 'Must be reserved first' });
      return;
    }
    
    await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { status: 'SOLD' }
    });
    
    // Notify buyer
    if (announcement.interests.length > 0 && announcement.interests[0]) {
      await prisma.notification.create({
        data: {
          userId: announcement.interests[0].pharmacyUserId,
          type: 'ANNOUNCEMENT' as any,
          title: 'Achat confirmé',
          message: `Achat confirmé pour ${announcement.medicine?.brandName}.`
        }
      });
    }
    
    // If supplier had pending retour, notify them
    if (announcement.supplierStatus === 'PENDING' && announcement.supplierUserId) {
      await prisma.notification.create({
        data: {
          userId: announcement.supplierUserId,
          type: 'RETOUR',
          title: 'Retour annulé',
          message: `Le médicament a été vendu en B2B.`
        }
      });
    }
    
    res.json({ success: true, message: 'Marked as sold' });
  } catch (error) {
    console.error('Mark as sold error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark as sold' });
  }
};

export const cancelInterest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const { interestId } = req.params;

    if (!interestId) {
      res.status(400).json({
        success: false,
        error: 'Interest ID is required'
      });
      return;
    }

    const interestIdNum = parseInt(interestId);
    if (isNaN(interestIdNum)) {
      res.status(400).json({
        success: false,
        error: 'Invalid interest ID'
      });
      return;
    }

    // Check if the interest exists and belongs to the current user
    const interest = await prisma.interest.findFirst({
      where: {
        id: interestIdNum,
        pharmacyUserId: req.user.id
      },
      include: {
        announcement: true
      }
    });

    if (!interest) {
      res.status(404).json({
        success: false,
        error: 'Interest not found or you do not have permission to cancel it'
      });
      return;
    }

    // Only allow canceling if interest is still PENDING
    if (interest.status !== 'PENDING') {
      res.status(400).json({
        success: false,
        error: 'Cannot cancel interest that has already been processed'
      });
      return;
    }

    // Delete the interest
    await prisma.interest.delete({
      where: {
        id: interestIdNum
      }
    });

    // Notify the announcement owner about the cancellation
    if (interest.announcement.pharmacyUserId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: interest.announcement.pharmacyUserId,
          type: 'INTEREST',
          title: 'Intérêt annulé',
          message: `Un intérêt a été annulé pour votre annonce.`
        }
      });
    }

    res.json({ success: true, message: 'Interest cancelled successfully' });
  } catch (error) {
    console.error('Cancel interest error:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel interest' });
  }
};