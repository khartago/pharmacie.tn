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
        m."brandName" as "brandName",
        m.laboratoire,
        COUNT(*)::int as "requestCount"
      FROM requests r
      JOIN medicines m ON r."medicineId" = m.id
      WHERE r."createdAt" >= ${startDate}
      GROUP BY m.id, m.dci, m."brandName", m.laboratoire
      ORDER BY "requestCount" DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      data: topMedicines
    });
  } catch (error) {
    console.error('Get top medicines error:', error);
    // Return empty data for resilience
    res.json({ success: true, data: [] });
  }
};

export const getRequestsByRegion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const requestsByRegion = await prisma.$queryRaw<Array<{ regionName: string; requestCount: bigint }>>`
      SELECT 
        c.region as "regionName",
        COUNT(*)::int as "requestCount"
      FROM requests r
      JOIN users u ON r."userId" = u.id
      JOIN cities c ON u."cityId" = c.id
      WHERE r."createdAt" >= ${startDate}
      GROUP BY c.region
      ORDER BY "requestCount" DESC
    `;

    // Convert BigInt to number for JSON serialization
    const formattedData = requestsByRegion.map(item => ({
      regionName: item.regionName,
      requestCount: Number(item.requestCount)
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Get requests by region error:', error);
    // Return empty array instead of error for better UX
    res.json({
      success: true,
      data: []
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
        DATE_TRUNC('day', "createdAt")::date as date,
        COUNT(*)::int as count
      FROM announcements
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date
    `;

    res.json({
      success: true,
      data: announcementsTrend
    });
  } catch (error) {
    console.error('Get announcements trend error:', error);
    res.json({ success: true, data: [] });
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
        COUNT(DISTINCT a.id)::int as "announcementsCount",
        COUNT(DISTINCT r.id)::int as "requestsCount",
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
    res.json({ success: true, data: [] });
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
        c.region as "regionName",
        COUNT(DISTINCT a.id)::int as "announcementsCount",
        0::int as "retoursCount",
        u."lastLoginAt"
      FROM users u
      JOIN roles role ON u."roleId" = role.id
      LEFT JOIN cities c ON u."cityId" = c.id
      LEFT JOIN announcements a ON u.id = a."supplierUserId" AND a."createdAt" >= ${startDate}
      WHERE role.name = 'SUPPLIER' AND u."isActive" = true
      GROUP BY u.id, u.name, u.email, c.name, c.region, u."lastLoginAt"
      HAVING COUNT(DISTINCT a.id) > 0
      ORDER BY COUNT(DISTINCT a.id) DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      data: activeSuppliers
    });
  } catch (error) {
    console.error('Get active suppliers error:', error);
    res.json({ success: true, data: [] });
  }
};

export const getOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    const days = parseInt(period);
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - days);
    
    // Previous period for growth calculation
    const previousStartDate = new Date(now);
    previousStartDate.setHours(0, 0, 0, 0);
    previousStartDate.setDate(previousStartDate.getDate() - (days * 2));

    // Current period stats
    const [
      activeUsersResult,
      totalAnnouncements,
      totalRequests,
      totalInterests,
      activePharmaciesResult,
      activeSuppliersResult
    ] = await Promise.all([
      // Active users (with activity in the period) - using DISTINCT
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT u.id)::int as count
        FROM users u
        WHERE u."isActive" = true
          AND (
            EXISTS (SELECT 1 FROM announcements a WHERE a."pharmacyUserId" = u.id AND a."createdAt" >= ${startDate})
            OR EXISTS (SELECT 1 FROM announcements a2 WHERE a2."supplierUserId" = u.id AND a2."createdAt" >= ${startDate})
            OR EXISTS (SELECT 1 FROM requests r WHERE r."userId" = u.id AND r."createdAt" >= ${startDate})
            OR EXISTS (SELECT 1 FROM interests i WHERE i."pharmacyUserId" = u.id AND i."createdAt" >= ${startDate})
          )
      `,
      prisma.announcement.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.request.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.interest.count({
        where: { createdAt: { gte: startDate } }
      }),
      // Active pharmacies
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT u.id)::int as count
        FROM users u
        JOIN roles r ON u."roleId" = r.id
        WHERE r.name = 'PHARMACY' 
          AND u."isActive" = true
          AND (
            EXISTS (SELECT 1 FROM announcements a WHERE a."pharmacyUserId" = u.id AND a."createdAt" >= ${startDate})
            OR EXISTS (SELECT 1 FROM requests req WHERE req."userId" = u.id AND req."createdAt" >= ${startDate})
          )
      `,
      // Active suppliers
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT u.id)::int as count
        FROM users u
        JOIN roles r ON u."roleId" = r.id
        WHERE r.name = 'SUPPLIER' 
          AND u."isActive" = true
          AND EXISTS (SELECT 1 FROM announcements a WHERE a."supplierUserId" = u.id AND a."createdAt" >= ${startDate})
      `
    ]);

    const activeUsers = Number(activeUsersResult[0]?.count || 0);
    const activePharmacies = Number(activePharmaciesResult[0]?.count || 0);
    const activeSuppliers = Number(activeSuppliersResult[0]?.count || 0);

    // Previous period stats for growth calculation
    const [
      previousActiveUsersResult,
      previousTotalAnnouncements,
      previousTotalRequests
    ] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT u.id)::int as count
        FROM users u
        WHERE u."isActive" = true
          AND (
            EXISTS (SELECT 1 FROM announcements a WHERE a."pharmacyUserId" = u.id AND a."createdAt" >= ${previousStartDate} AND a."createdAt" < ${startDate})
            OR EXISTS (SELECT 1 FROM announcements a2 WHERE a2."supplierUserId" = u.id AND a2."createdAt" >= ${previousStartDate} AND a2."createdAt" < ${startDate})
            OR EXISTS (SELECT 1 FROM requests r WHERE r."userId" = u.id AND r."createdAt" >= ${previousStartDate} AND r."createdAt" < ${startDate})
            OR EXISTS (SELECT 1 FROM interests i WHERE i."pharmacyUserId" = u.id AND i."createdAt" >= ${previousStartDate} AND i."createdAt" < ${startDate})
          )
      `,
      prisma.announcement.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate }
        }
      }),
      prisma.request.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate }
        }
      })
    ]);

    const previousActiveUsers = Number(previousActiveUsersResult[0]?.count || 0);

    // Calculate growth percentages
    const userGrowth = calculateGrowth(activeUsers, previousActiveUsers);
    const announcementGrowth = calculateGrowth(totalAnnouncements, previousTotalAnnouncements);
    const requestGrowth = calculateGrowth(totalRequests, previousTotalRequests);

    // Calculate conversion rate (interests / announcements)
    const conversionRate = totalAnnouncements > 0 ? Math.round((totalInterests / totalAnnouncements) * 100) : 0;
    // For conversion growth, we'll use a simple calculation based on period trends
    const conversionGrowth = 0; // Can be enhanced later

    const result = {
      activeUsers,
      userGrowth,
      totalAnnouncements,
      announcementGrowth,
      totalRequests,
      requestGrowth,
      conversionRate,
      conversionGrowth,
      activePharmacies,
      activeSuppliers
    };

    console.log(`[Analytics] Overview for ${days} days:`, {
      period: days,
      startDate: startDate.toISOString(),
      ...result
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get overview statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getActivityTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activityTimeline = await prisma.$queryRaw<Array<{
      date: Date;
      announcements: bigint;
      requests: bigint;
      retours: number;
      total: bigint;
    }>>`
      SELECT 
        DATE_TRUNC('day', "createdAt")::date as date,
        COUNT(CASE WHEN "type" = 'ANNOUNCEMENT' THEN 1 END)::int as announcements,
        COUNT(CASE WHEN "type" = 'REQUEST' THEN 1 END)::int as requests,
        0::int as retours,
        COUNT(*)::int as total
      FROM (
        SELECT 'ANNOUNCEMENT' as type, "createdAt" FROM announcements WHERE "createdAt" >= ${startDate}
        UNION ALL
        SELECT 'REQUEST' as type, "createdAt" FROM requests WHERE "createdAt" >= ${startDate}
      ) combined_activity
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date DESC
    `;

    // Convert BigInt to number and format dates
    const formattedData = activityTimeline.map(item => ({
      date: item.date,
      announcements: Number(item.announcements),
      requests: Number(item.requests),
      retours: item.retours,
      total: Number(item.total)
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Get activity timeline error:', error);
    // Return empty array instead of error for better UX
    res.json({
      success: true,
      data: []
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

// Conversion Funnel: Announcements → Interests → Accepted
export const getConversionFunnel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    const days = parseInt(period);
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - days);

    // Get funnel data using separate queries for accuracy
    // Only count interests on announcements created in the period
    const [announcements, interests, acceptedInterests, requests, fulfilledRequests] = await Promise.all([
      prisma.announcement.count({ where: { createdAt: { gte: startDate } } }),
      prisma.interest.count({ 
        where: { 
          createdAt: { gte: startDate },
          announcement: {
            createdAt: { gte: startDate }
          }
        } 
      }),
      prisma.interest.count({ 
        where: { 
          createdAt: { gte: startDate },
          status: 'ACCEPTED',
          announcement: {
            createdAt: { gte: startDate }
          }
        } 
      }),
      prisma.request.count({ where: { createdAt: { gte: startDate } } }),
      prisma.request.count({ where: { createdAt: { gte: startDate }, status: 'ACCEPTED' } })
    ]);

    // Cap percentages at 100% to avoid unrealistic values
    const interestRate = announcements > 0 ? Math.min(Math.round((interests / announcements) * 100), 100) : 0;
    const acceptanceRate = interests > 0 ? Math.round((acceptedInterests / interests) * 100) : 0;
    const fulfillmentRate = requests > 0 ? Math.round((fulfilledRequests / requests) * 100) : 0;
    const overallConversion = announcements > 0 ? Math.round((acceptedInterests / announcements) * 100) : 0;

    res.json({
      success: true,
      data: {
        stages: [
          { stage: 'Annonces', count: announcements, percentage: 100 },
          { stage: 'Intérêts', count: interests, percentage: interestRate },
          { stage: 'Acceptés', count: acceptedInterests, percentage: acceptanceRate },
          { stage: 'Demandes', count: requests, percentage: 100 },
          { stage: 'Remplies', count: fulfilledRequests, percentage: fulfillmentRate }
        ],
        metrics: {
          interestRate,
          acceptanceRate,
          fulfillmentRate,
          overallConversion
        }
      }
    });
  } catch (error) {
    console.error('Get conversion funnel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversion funnel',
      data: {
        stages: [],
        metrics: {
          interestRate: 0,
          acceptanceRate: 0,
          fulfillmentRate: 0,
          overallConversion: 0
        }
      }
    });
  }
};

// Supplier Performance Metrics
export const getSupplierPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const performance = await prisma.$queryRaw<Array<{
      supplierId: string;
      supplierName: string;
      totalAnnouncements: bigint;
      totalInterests: bigint;
      acceptedInterests: bigint;
      avgResponseTime: number;
      acceptanceRate: number;
    }>>`
      SELECT 
        u.id as "supplierId",
        u.name as "supplierName",
        COUNT(DISTINCT a.id)::int as "totalAnnouncements",
        COUNT(DISTINCT i.id)::int as "totalInterests",
        COUNT(DISTINCT CASE WHEN i.status = 'ACCEPTED' THEN i.id END)::int as "acceptedInterests",
        COALESCE(
          AVG(EXTRACT(EPOCH FROM (i."createdAt" - a."createdAt")) / 3600),
          0
        )::numeric as "avgResponseTime",
        CASE 
          WHEN COUNT(DISTINCT i.id) > 0 
          THEN ROUND((COUNT(DISTINCT CASE WHEN i.status = 'ACCEPTED' THEN i.id END)::float / COUNT(DISTINCT i.id)::float) * 100)
          ELSE 0
        END as "acceptanceRate"
      FROM users u
      JOIN roles r ON u."roleId" = r.id
      LEFT JOIN announcements a ON u.id = a."supplierUserId" AND a."createdAt" >= ${startDate}
      LEFT JOIN interests i ON a.id = i."announcementId" AND i."createdAt" >= ${startDate}
      WHERE r.name = 'SUPPLIER' AND u."isActive" = true
      GROUP BY u.id, u.name
      HAVING COUNT(DISTINCT a.id) > 0
      ORDER BY "totalAnnouncements" DESC, "acceptanceRate" DESC
      LIMIT 20
    `;

    const formattedData = performance.map(p => ({
      supplierId: p.supplierId,
      supplierName: p.supplierName,
      totalAnnouncements: Number(p.totalAnnouncements),
      totalInterests: Number(p.totalInterests),
      acceptedInterests: Number(p.acceptedInterests),
      avgResponseTime: Math.max(0, Math.round(Number(p.avgResponseTime))),
      acceptanceRate: Number(p.acceptanceRate)
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Get supplier performance error:', error);
    res.json({ success: true, data: [] });
  }
};

// Request Fulfillment Metrics
export const getRequestFulfillment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const fulfillment = await prisma.$queryRaw<Array<{
      date: Date;
      totalRequests: bigint;
      fulfilledRequests: bigint;
      avgTimeToFulfill: number;
      fulfillmentRate: number;
    }>>`
      SELECT 
        DATE_TRUNC('day', r."createdAt")::date as date,
        COUNT(*)::int as "totalRequests",
        COUNT(CASE WHEN r.status = 'ACCEPTED' THEN 1 END)::int as "fulfilledRequests",
        COALESCE(
          AVG(EXTRACT(EPOCH FROM (r."updatedAt" - r."createdAt")) / 3600)::int,
          0
        ) as "avgTimeToFulfill",
        CASE 
          WHEN COUNT(*) > 0 
          THEN ROUND((COUNT(CASE WHEN r.status = 'ACCEPTED' THEN 1 END)::float / COUNT(*)::float) * 100)
          ELSE 0
        END as "fulfillmentRate"
      FROM requests r
      WHERE r."createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('day', r."createdAt")
      ORDER BY date DESC
    `;

    const formattedData = fulfillment.map(f => ({
      date: f.date,
      totalRequests: Number(f.totalRequests),
      fulfilledRequests: Number(f.fulfilledRequests),
      avgTimeToFulfill: Math.max(0, Math.round(Number(f.avgTimeToFulfill))),
      fulfillmentRate: Number(f.fulfillmentRate)
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Get request fulfillment error:', error);
    res.json({ success: true, data: [] });
  }
};

// Regional Performance Analysis
export const getRegionalPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as { period: string };
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const regionalData = await prisma.$queryRaw<Array<{
      regionName: string;
      totalRequests: bigint;
      fulfilledRequests: bigint;
      totalAnnouncements: bigint;
      totalPharmacies: bigint;
      totalSuppliers: bigint;
      fulfillmentRate: number;
    }>>`
      SELECT 
        c.region as "regionName",
        COUNT(DISTINCT r.id)::int as "totalRequests",
        COUNT(DISTINCT CASE WHEN r.status = 'ACCEPTED' THEN r.id END)::int as "fulfilledRequests",
        COUNT(DISTINCT a.id)::int as "totalAnnouncements",
        COUNT(DISTINCT CASE WHEN role.name = 'PHARMACY' THEN u.id END)::int as "totalPharmacies",
        COUNT(DISTINCT CASE WHEN role.name = 'SUPPLIER' THEN u.id END)::int as "totalSuppliers",
        CASE 
          WHEN COUNT(DISTINCT r.id) > 0 
          THEN ROUND((COUNT(DISTINCT CASE WHEN r.status = 'ACCEPTED' THEN r.id END)::float / COUNT(DISTINCT r.id)::float) * 100)
          ELSE 0
        END as "fulfillmentRate"
      FROM cities c
      LEFT JOIN users u ON u."cityId" = c.id
      LEFT JOIN roles role ON u."roleId" = role.id
      LEFT JOIN requests r ON r."userId" = u.id AND r."createdAt" >= ${startDate}
      LEFT JOIN announcements a ON a."pharmacyUserId" = u.id AND a."createdAt" >= ${startDate}
      WHERE c.region IS NOT NULL
      GROUP BY c.region
      HAVING COUNT(DISTINCT r.id) > 0 OR COUNT(DISTINCT a.id) > 0
      ORDER BY "totalRequests" DESC, "fulfillmentRate" DESC
    `;

    const formattedData = regionalData.map(r => ({
      regionName: r.regionName,
      totalRequests: Number(r.totalRequests),
      fulfilledRequests: Number(r.fulfilledRequests),
      totalAnnouncements: Number(r.totalAnnouncements),
      totalPharmacies: Number(r.totalPharmacies),
      totalSuppliers: Number(r.totalSuppliers),
      fulfillmentRate: Number(r.fulfillmentRate)
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Get regional performance error:', error);
    res.json({ success: true, data: [] });
  }
}; 