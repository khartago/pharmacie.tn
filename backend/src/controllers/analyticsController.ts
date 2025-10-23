import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getTopMedicines = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topMedicines = await prisma.$queryRaw`
      SELECT 
        m.id,
        m.dci,
        m.brandName,
        m.laboratoire,
        COUNT(*) as requestCount
      FROM "Request" r
      JOIN "Medicine" m ON r."medicineId" = m.id
      WHERE r."createdAt" >= ${startDate}
      GROUP BY m.id, m.dci, m."brandName", m.laboratoire
      ORDER BY requestCount DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      data: topMedicines
    });
  } catch (error) {
    console.error('Get top medicines error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get top medicines'
    });
  }
};

export const getRequestsByRegion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const requestsByRegion = await prisma.$queryRaw`
      SELECT 
        c.region as "regionName",
        COUNT(*) as requestCount
      FROM requests r
      JOIN users u ON r."userId" = u.id
      JOIN cities c ON u."cityId" = c.id
      WHERE r."createdAt" >= ${startDate}
      GROUP BY c.region
      ORDER BY requestCount DESC
    `;

    res.json({
      success: true,
      data: requestsByRegion
    });
  } catch (error) {
    console.error('Get requests by region error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get requests by region'
    });
  }
};

export const getAnnouncementsTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const announcementsTrend = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM announcements
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date
    `;

    res.json({
      success: true,
      data: announcementsTrend
    });
  } catch (error) {
    console.error('Get announcements trend error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get announcements trend'
    });
  }
};

export const getActivePharmacies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activePharmacies = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.name,
        u.email,
        c.name as cityName,
        c.region as "regionName",
        COUNT(DISTINCT a.id) as announcementsCount,
        COUNT(DISTINCT r.id) as requestsCount,
        u."lastLoginAt"
      FROM users u
      JOIN roles role ON u."roleId" = role.id
      LEFT JOIN cities c ON u."cityId" = c.id
      LEFT JOIN announcements a ON u.id = a."pharmacyUserId" AND a."createdAt" >= ${startDate}
      LEFT JOIN requests r ON u.id = r."userId" AND r."createdAt" >= ${startDate}
      WHERE role.name = 'PHARMACY' AND u."isActive" = true
      GROUP BY u.id, u.name, u.email, c.name, c.region, u."lastLoginAt"
      HAVING COUNT(DISTINCT a.id) > 0 OR COUNT(DISTINCT r.id) > 0
      ORDER BY (COUNT(DISTINCT a.id) + COUNT(DISTINCT r.id)) DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      data: activePharmacies
    });
  } catch (error) {
    console.error('Get active pharmacies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active pharmacies'
    });
  }
};

export const getActiveSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activeSuppliers = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.name,
        u.email,
        c.name as cityName,
        c."regionName",
        COUNT(DISTINCT a.id) as announcementsCount,
        COUNT(DISTINCT ret.id) as retoursCount,
        u."lastLoginAt"
      FROM "User" u
      JOIN "Role" role ON u."roleId" = role.id
      LEFT JOIN "City" c ON u."cityId" = c.id
      LEFT JOIN "Announcement" a ON u.id = a."userId" AND a."createdAt" >= ${startDate}
      LEFT JOIN "Retour" ret ON u.id = ret."supplierId" AND ret."createdAt" >= ${startDate}
      WHERE role.name = 'SUPPLIER' AND u."isActive" = true
      GROUP BY u.id, u.name, u.email, c.name, c."regionName", u."lastLoginAt"
      HAVING COUNT(DISTINCT a.id) > 0 OR COUNT(DISTINCT ret.id) > 0
      ORDER BY (COUNT(DISTINCT a.id) + COUNT(DISTINCT ret.id)) DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      data: activeSuppliers
    });
  } catch (error) {
    console.error('Get active suppliers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active suppliers'
    });
  }
};

export const getOverview = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalAnnouncements, totalRequests, totalInterests] = await Promise.all([
      prisma.user.count(),
      prisma.announcement.count(),
      prisma.request.count(),
      prisma.interest.count()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAnnouncements,
        totalRequests,
        totalInterests
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get overview'
    });
  }
};

export const getActivityTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activityTimeline = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(CASE WHEN "type" = 'ANNOUNCEMENT' THEN 1 END) as announcements,
        COUNT(CASE WHEN "type" = 'REQUEST' THEN 1 END) as requests,
        0 as retours,
        COUNT(*) as total
      FROM (
        SELECT 'ANNOUNCEMENT' as type, "createdAt" FROM announcements WHERE "createdAt" >= ${startDate}
        UNION ALL
        SELECT 'REQUEST' as type, "createdAt" FROM requests WHERE "createdAt" >= ${startDate}
      ) combined_activity
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `;

    res.json({
      success: true,
      data: activityTimeline
    });
  } catch (error) {
    console.error('Get activity timeline error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get activity timeline'
    });
  }
};

// Helper function to calculate growth percentage
const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Current period stats
    const [
      totalUsers,
      activeAnnouncements,
      openRequests,
      totalMedicines,
      todayAnnouncements,
      todayRequests,
      totalPharmacies,
      totalSuppliers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.announcement.count({
        where: { status: 'AVAILABLE' }
      }),
      prisma.request.count({
        where: { status: 'OPEN' }
      }),
      prisma.medicine.count(),
      prisma.announcement.count({
        where: {
          status: 'AVAILABLE',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.request.count({
        where: {
          status: 'OPEN',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.user.count({
        where: { 
          role: {
            name: 'PHARMACY'
          }
        }
      }),
      prisma.user.count({
        where: { 
          role: {
            name: 'SUPPLIER'
          }
        }
      })
    ]);

    // Previous period stats for growth calculation
    const [
      previousTotalUsers,
      previousActiveAnnouncements,
      previousOpenRequests
    ] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      }),
      prisma.announcement.count({
        where: { 
          status: 'AVAILABLE',
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      }),
      prisma.request.count({
        where: { 
          status: 'OPEN',
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      })
    ]);

    // Calculate conversion rate (interests / announcements)
    const totalInterests = await prisma.interest.count();
    const conversionRate = activeAnnouncements > 0 ? Math.round((totalInterests / activeAnnouncements) * 100) : 0;

    // Calculate growth percentages
    const userGrowth = calculateGrowth(totalUsers, previousTotalUsers);
    const announcementGrowth = calculateGrowth(activeAnnouncements, previousActiveAnnouncements);
    const requestGrowth = calculateGrowth(openRequests, previousOpenRequests);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeAnnouncements,
        openRequests,
        conversionRate,
        totalMedicines,
        todayAnnouncements,
        todayRequests,
        totalPharmacies,
        totalSuppliers,
        userGrowth,
        announcementGrowth,
        requestGrowth,
        conversionGrowth: 0 // Will be calculated based on trends
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard stats'
    });
  }
};

export const getPharmaciesStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalPharmacies,
      activePharmacies,
      inactivePharmacies,
      pharmaciesWithActiveSubscription,
      pharmaciesWithTrialSubscription,
      pharmaciesWithExpiredSubscription,
      pharmaciesWithoutSubscription,
      newPharmaciesThisMonth,
      newPharmaciesThisWeek,
      pharmaciesByRegion
    ] = await Promise.all([
      // Total pharmacies
      prisma.user.count({
        where: { 
          role: {
            name: 'PHARMACY'
          }
        }
      }),
      // Active pharmacies
      prisma.user.count({
        where: { 
          role: {
            name: 'PHARMACY'
          },
          isActive: true
        }
      }),
      // Inactive pharmacies
      prisma.user.count({
        where: { 
          role: {
            name: 'PHARMACY'
          },
          isActive: false
        }
      }),
      // Pharmacies with active subscription
      prisma.user.count({
        where: { 
          role: {
            name: 'PHARMACY'
          },
          subscriptions: {
            some: {
              status: 'ACTIVE'
            }
          }
        }
      }),
      // Pharmacies with trial subscription
      prisma.user.count({
        where: { 
          role: {
            name: 'PHARMACY'
          },
          subscriptions: {
            some: {
              status: 'TRIAL'
            }
          }
        }
      }),
      // Pharmacies with expired subscription
      prisma.user.count({
        where: { 
          role: {
            name: 'PHARMACY'
          },
          subscriptions: {
            some: {
              status: 'EXPIRED'
            }
          }
        }
      }),
      // Pharmacies without subscription
      prisma.user.count({
        where: { 
          role: {
            name: 'PHARMACY'
          },
          subscriptions: {
            none: {}
          }
        }
      }),
      // New pharmacies this month
      prisma.user.count({
        where: { 
          role: {
            name: 'PHARMACY'
          },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      // New pharmacies this week
      prisma.user.count({
        where: { 
          role: {
            name: 'PHARMACY'
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      // Pharmacies by region
      prisma.user.groupBy({
        by: ['cityId'],
        where: {
          role: {
            name: 'PHARMACY'
          }
        },
        _count: {
          id: true
        }
      })
    ]);

    // Get region names for the grouped data
    const regionStats = await Promise.all(
      pharmaciesByRegion.map(async (stat) => {
        if (!stat.cityId) {
          return {
            region: 'UNKNOWN',
            city: 'Unknown',
            count: stat._count.id
          };
        }
        
        const city = await prisma.city.findUnique({
          where: { id: stat.cityId },
          select: { name: true, region: true }
        });
        return {
          region: city?.region || 'UNKNOWN',
          city: city?.name || 'Unknown',
          count: stat._count.id
        };
      })
    );

    // Group by region
    const regionCounts = regionStats.reduce((acc, stat) => {
      acc[stat.region] = (acc[stat.region] || 0) + stat.count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalPharmacies,
        activePharmacies,
        inactivePharmacies,
        pharmaciesWithActiveSubscription,
        pharmaciesWithTrialSubscription,
        pharmaciesWithExpiredSubscription,
        pharmaciesWithoutSubscription,
        newPharmaciesThisMonth,
        newPharmaciesThisWeek,
        regionCounts,
        // Calculated percentages
        activePercentage: totalPharmacies > 0 ? Math.round((activePharmacies / totalPharmacies) * 100) : 0,
        subscriptionPercentage: totalPharmacies > 0 ? Math.round((pharmaciesWithActiveSubscription / totalPharmacies) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Get pharmacies stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pharmacies stats'
    });
  }
};

export const getSuppliersStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      suppliersWithAddress
    ] = await Promise.all([
      // Total suppliers
      prisma.user.count({
        where: { 
          role: {
            name: 'SUPPLIER'
          }
        }
      }),
      // Active suppliers
      prisma.user.count({
        where: { 
          role: {
            name: 'SUPPLIER'
          },
          isActive: true
        }
      }),
      // Inactive suppliers
      prisma.user.count({
        where: { 
          role: {
            name: 'SUPPLIER'
          },
          isActive: false
        }
      }),
      // Suppliers with address
      prisma.user.count({
        where: { 
          role: {
            name: 'SUPPLIER'
          },
          address: {
            not: null
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        total: totalSuppliers,
        active: activeSuppliers,
        inactive: inactiveSuppliers,
        new: suppliersWithAddress
      }
    });
  } catch (error) {
    console.error('Get suppliers stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suppliers stats'
    });
  }
};

export const getRequestsStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalRequests,
      openRequests,
      closedRequests,
      acceptedRequests,
      expiredRequests
    ] = await Promise.all([
      // Total requests
      prisma.request.count(),
      // Open requests
      prisma.request.count({
        where: { status: 'OPEN' }
      }),
      // Closed requests
      prisma.request.count({
        where: { status: 'CLOSED' }
      }),
      // Accepted requests
      prisma.request.count({
        where: { status: 'ACCEPTED' }
      }),
      // Expired requests
      prisma.request.count({
        where: { status: 'EXPIRED' }
      })
    ]);

    res.json({
      success: true,
      data: {
        total: totalRequests,
        open: openRequests,
        closed: closedRequests,
        accepted: acceptedRequests,
        expired: expiredRequests
      }
    });
  } catch (error) {
    console.error('Get requests stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get requests stats'
    });
  }
};

export const getAnnouncementsStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalAnnouncements,
      activeAnnouncements,
      pendingAnnouncements,
      expiredAnnouncements,
      totalRequests,
      openRequests,
      closedRequests,
      acceptedRequests,
      expiredRequests
    ] = await Promise.all([
      // Total announcements
      prisma.announcement.count(),
      // Active announcements (AVAILABLE status)
      prisma.announcement.count({
        where: { status: 'AVAILABLE' }
      }),
      // Pending announcements (RESERVED status)
      prisma.announcement.count({
        where: { status: 'RESERVED' }
      }),
      // Expired announcements
      prisma.announcement.count({
        where: { status: 'EXPIRED' }
      }),
      // Total requests
      prisma.request.count(),
      // Open requests
      prisma.request.count({
        where: { status: 'OPEN' }
      }),
      // Closed requests
      prisma.request.count({
        where: { status: 'CLOSED' }
      }),
      // Accepted requests
      prisma.request.count({
        where: { status: 'ACCEPTED' }
      }),
      // Expired requests
      prisma.request.count({
        where: { status: 'EXPIRED' }
      })
    ]);

    res.json({
      success: true,
      data: {
        // Announcement stats
        total: totalAnnouncements,
        active: activeAnnouncements,
        pending: pendingAnnouncements,
        expired: expiredAnnouncements,
        // Request stats
        totalRequests: totalRequests,
        openRequests: openRequests,
        closedRequests: closedRequests,
        acceptedRequests: acceptedRequests,
        expiredRequests: expiredRequests
      }
    });
  } catch (error) {
    console.error('Get announcements stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get announcements stats'
    });
  }
};

export const getMyStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const userRole = (req as any).user?.role?.name;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Get user-specific statistics based on role
    let stats: any = {};

    if (userRole === 'PHARMACY') {
      const [
        activeAnnouncements,
        openRequests,
        pendingInterests,
        unreadNotifications,
        expiredItems,
        successRate,
        // Previous period stats for growth calculation
        previousActiveAnnouncements,
        previousOpenRequests,
        previousPendingInterests
      ] = await Promise.all([
        // Active announcements created by this pharmacy
        prisma.announcement.count({
          where: { 
            pharmacyUserId: userId,
            status: 'AVAILABLE'
          }
        }),
        // Open requests created by this pharmacy
        prisma.request.count({
          where: { 
            userId,
            status: 'OPEN'
          }
        }),
        // Pending interests on this pharmacy's announcements
        prisma.interest.count({
          where: {
            announcement: {
              pharmacyUserId: userId
            },
            status: 'PENDING'
          }
        }),
        // Unread notifications for this user
        prisma.notification.count({
          where: {
            userId,
            isRead: false
          }
        }),
        // Expired announcements
        prisma.announcement.count({
          where: { 
            pharmacyUserId: userId,
            status: 'EXPIRED'
          }
        }),
        // Calculate success rate (accepted interests / total interests)
        prisma.interest.count({
          where: {
            announcement: {
              pharmacyUserId: userId
            },
            status: 'ACCEPTED'
          }
        }).then(accepted => 
          prisma.interest.count({
            where: {
              announcement: {
                pharmacyUserId: userId
              }
            }
          }).then(total => total > 0 ? Math.round((accepted / total) * 100) : 0)
        ),
        // Previous period stats
        prisma.announcement.count({
          where: { 
            pharmacyUserId: userId,
            status: 'AVAILABLE',
            createdAt: {
              lt: thirtyDaysAgo
            }
          }
        }),
        prisma.request.count({
          where: { 
            userId,
            status: 'OPEN',
            createdAt: {
              lt: thirtyDaysAgo
            }
          }
        }),
        prisma.interest.count({
          where: {
            announcement: {
              pharmacyUserId: userId
            },
            status: 'PENDING',
            createdAt: {
              lt: thirtyDaysAgo
            }
          }
        })
      ]);

      // Calculate growth percentages
      const announcementGrowth = calculateGrowth(activeAnnouncements, previousActiveAnnouncements);
      const requestGrowth = calculateGrowth(openRequests, previousOpenRequests);
      const interestGrowth = calculateGrowth(pendingInterests, previousPendingInterests);

      stats = {
        activeAnnouncements,
        openRequests,
        pendingInterests,
        unreadNotifications,
        expiredItems,
        successRate,
        announcementGrowth,
        requestGrowth,
        interestGrowth
      };

    } else if (userRole === 'SUPPLIER') {
      const [
        availableAnnouncements,
        myInterests,
        acceptedInterests,
        unreadNotifications,
        openDemandes,
        successRate,
        // Previous period stats for growth calculation
        previousAvailableAnnouncements,
        previousMyInterests,
        previousAcceptedInterests
      ] = await Promise.all([
        // Available announcements (not created by this supplier)
        prisma.announcement.count({
          where: { 
            status: 'AVAILABLE',
            supplierUserId: { not: userId }
          }
        }),
        // My pending interests
        prisma.interest.count({
          where: {
            pharmacyUserId: userId,
            status: 'PENDING'
          }
        }),
        // My accepted interests
        prisma.interest.count({
          where: {
            pharmacyUserId: userId,
            status: 'ACCEPTED'
          }
        }),
        // Unread notifications for this user
        prisma.notification.count({
          where: {
            userId,
            isRead: false
          }
        }),
        // Open requests visible to this supplier
        prisma.request.count({
          where: { 
            status: 'OPEN'
          }
        }),
        // Calculate success rate (accepted interests / total interests)
        prisma.interest.count({
          where: {
            pharmacyUserId: userId,
            status: 'ACCEPTED'
          }
        }).then(accepted => 
          prisma.interest.count({
            where: {
              pharmacyUserId: userId
            }
          }).then(total => total > 0 ? Math.round((accepted / total) * 100) : 0)
        ),
        // Previous period stats
        prisma.announcement.count({
          where: { 
            status: 'AVAILABLE',
            supplierUserId: { not: userId },
            createdAt: {
              lt: thirtyDaysAgo
            }
          }
        }),
        prisma.interest.count({
          where: {
            pharmacyUserId: userId,
            status: 'PENDING',
            createdAt: {
              lt: thirtyDaysAgo
            }
          }
        }),
        prisma.interest.count({
          where: {
            pharmacyUserId: userId,
            status: 'ACCEPTED',
            createdAt: {
              lt: thirtyDaysAgo
            }
          }
        })
      ]);

      // Calculate growth percentages
      const announcementGrowth = calculateGrowth(availableAnnouncements, previousAvailableAnnouncements);
      const interestGrowth = calculateGrowth(myInterests, previousMyInterests);
      const acceptedGrowth = calculateGrowth(acceptedInterests, previousAcceptedInterests);

      stats = {
        availableAnnouncements,
        myInterests,
        acceptedInterests,
        unreadNotifications,
        openDemandes,
        successRate,
        announcementGrowth,
        interestGrowth,
        acceptedGrowth
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get my stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics'
    });
  }
}; 