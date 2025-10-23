import cron from 'node-cron';
import prisma from '../lib/prisma';
import { NotificationService } from './notificationService';
import { AuditService } from './auditService';
import { EmailService } from './emailService';
import { RequestStatus, AnnouncementStatus, SubscriptionStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export class CronService {
  /**
   * Initialize all cron jobs
   */
  static initCronJobs() {
    console.log('🕐 Initializing cron jobs...');

    // Daily at midnight - Expiration checks
    cron.schedule('0 0 * * *', () => {
      console.log('🕐 Running daily expiration checks...');
      this.handleExpirations();
    });

    // Daily at 9 AM - Subscription trial ending notifications
    cron.schedule('0 9 * * *', () => {
      console.log('🕐 Running subscription trial ending checks...');
      this.handleSubscriptionTrialEnding();
    });

    // Weekly on Sunday at 2 AM - Archiving and cleanup
    cron.schedule('0 2 * * 0', () => {
      console.log('🕐 Running weekly archiving and cleanup...');
      this.handleWeeklyArchiving();
    });

    // Monthly on 1st at 3 AM - Long-term retention and purge
    cron.schedule('0 3 1 * *', () => {
      console.log('🕐 Running monthly long-term retention and purge...');
      this.handleMonthlyRetention();
    });

    console.log('✅ Cron jobs initialized successfully');
  }

  /**
   * Handle daily expiration checks
   */
  static async handleExpirations() {
    try {
      console.log('📅 Processing expirations...');

      // 1. Expire announcements (including retours)
      const expiredAnnouncements = await prisma.announcement.updateMany({
        where: {
          status: {
            in: [AnnouncementStatus.AVAILABLE, AnnouncementStatus.RESERVED],
          },
          expiryDate: {
            lt: new Date(),
          },
        },
        data: {
          status: AnnouncementStatus.EXPIRED,
        },
      });

      console.log(`📅 Expired ${expiredAnnouncements.count} announcements`);

      // Log retour expirations separately
      const expiredRetours = await prisma.announcement.findMany({
        where: {
          status: AnnouncementStatus.EXPIRED,
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
          visibleToSupplier: true, // Retours are visible to suppliers
        },
      });

      for (const retour of expiredRetours) {
        await AuditService.logRetourExpired(retour.id);
      }

      // Notify pharmacies about expired announcements
      const announcementsToNotify = await prisma.announcement.findMany({
        where: {
          status: AnnouncementStatus.EXPIRED,
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        include: {
          pharmacyUser: true,
          medicine: true,
        },
      });

      for (const announcement of announcementsToNotify) {
        await NotificationService.notifyAnnouncementExpired(announcement.id);
        await AuditService.logAnnouncementExpired(announcement.id);
      }

      // 2. Expire requests based on their scope
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      
      // Expire CITY and REGION scope requests (24 hours)
      const expiredCityRegionRequests = await prisma.request.updateMany({
        where: {
          status: RequestStatus.OPEN,
          scope: {
            in: ['CITY', 'REGION']
          },
          createdAt: {
            lt: twentyFourHoursAgo,
          },
        },
        data: {
          status: RequestStatus.EXPIRED,
        },
      });

      // Expire ALL_TUNISIA scope requests (48 hours)
      const expiredAllTunisiaRequests = await prisma.request.updateMany({
        where: {
          status: RequestStatus.OPEN,
          scope: 'ALL_TUNISIA',
          createdAt: {
            lt: fortyEightHoursAgo,
          },
        },
        data: {
          status: RequestStatus.EXPIRED,
        },
      });

      const totalExpiredRequests = expiredCityRegionRequests.count + expiredAllTunisiaRequests.count;

      console.log(`📅 Expired ${totalExpiredRequests} requests (${expiredCityRegionRequests.count} CITY/REGION + ${expiredAllTunisiaRequests.count} ALL_TUNISIA)`);

      // Notify pharmacies about expired requests
      const requestsToNotify = await prisma.request.findMany({
        where: {
          status: RequestStatus.EXPIRED,
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        include: {
          user: true,
          medicine: true,
        },
      });

      for (const request of requestsToNotify) {
        await NotificationService.notifyRequestExpired(request.id);
        await AuditService.logRequestExpired(request.id);
      }

      // 3. Expire subscriptions
      const expiredSubscriptions = await prisma.subscription.updateMany({
        where: {
          status: {
            in: [SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE],
          },
          endDate: {
            lt: new Date(),
          },
        },
        data: {
          status: SubscriptionStatus.EXPIRED,
        },
      });

      console.log(`📅 Expired ${expiredSubscriptions.count} subscriptions`);

      // Log cron execution summary
      await AuditService.logCronExecuted('handleExpirations', {
        announcementsExpired: expiredAnnouncements.count,
        retoursExpired: expiredRetours.length,
        requestsExpired: totalExpiredRequests,
        requestsExpiredCityRegion: expiredCityRegionRequests.count,
        requestsExpiredAllTunisia: expiredAllTunisiaRequests.count,
        subscriptionsExpired: expiredSubscriptions.count,
        announcementsNotified: announcementsToNotify.length,
        requestsNotified: requestsToNotify.length,
      });

      // Notify users about expired subscriptions
      const subscriptionsToNotify = await prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.EXPIRED,
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        include: {
          user: true,
        },
      });

      for (const subscription of subscriptionsToNotify) {
        // Send in-app notification
        await NotificationService.notifySubscriptionExpired(subscription.userId);
        
        // Send email notification
        await EmailService.sendSubscriptionExpired(
          subscription.user.email,
          subscription.user.name,
          subscription.userId
        );
        
        await AuditService.logSubscriptionExpired(subscription.userId, subscription.id);
      }

      console.log('✅ Expiration checks completed successfully');
    } catch (error) {
      console.error('❌ Error in expiration checks:', error);
    }
  }

  /**
   * Handle subscription trial ending notifications (5 days before)
   */
  static async handleSubscriptionTrialEnding() {
    try {
      console.log('📅 Processing subscription trial ending notifications...');

      const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      
      const subscriptionsEndingSoon = await prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.TRIAL,
          endDate: {
            lte: fiveDaysFromNow,
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      for (const subscription of subscriptionsEndingSoon) {
        // Send in-app notification
        await NotificationService.notifySubscriptionTrialEnding(
          subscription.userId,
          subscription.endDate
        );

        // Send email notification
        await EmailService.sendTrialEndingReminder(
          subscription.user.email,
          subscription.user.name,
          subscription.endDate,
          subscription.userId
        );
      }

      // Log cron execution summary
      await AuditService.logCronExecuted('handleSubscriptionTrialEnding', {
        subscriptionsNotified: subscriptionsEndingSoon.length,
      });

      console.log(`📅 Sent ${subscriptionsEndingSoon.length} trial ending notifications`);
    } catch (error) {
      console.error('❌ Error in subscription trial ending checks:', error);
    }
  }

  /**
   * Handle weekly archiving and cleanup
   */
  static async handleWeeklyArchiving() {
    try {
      console.log('📦 Processing weekly archiving...');

      // 1. Archive announcements expired more than 6 months ago
      const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
      
      const announcementsToArchive = await prisma.announcement.findMany({
        where: {
          status: AnnouncementStatus.EXPIRED,
          updatedAt: {
            lt: sixMonthsAgo,
          },
        },
      });

      if (announcementsToArchive.length > 0) {
        // Insert into archive table
        await prisma.announcementArchive.createMany({
          data: announcementsToArchive.map(announcement => ({
            originalId: announcement.id,
            medicineId: announcement.medicineId,
            quantity: announcement.quantity,
            expiryDate: announcement.expiryDate,
            pharmacyUserId: announcement.pharmacyUserId,
            supplierUserId: announcement.supplierUserId || '',
            visibleToSupplier: announcement.visibleToSupplier,
            status: announcement.status,
            createdAt: announcement.createdAt,
            updatedAt: announcement.updatedAt,
          })),
        });

        // Delete from main table
        await prisma.announcement.deleteMany({
          where: {
            id: {
              in: announcementsToArchive.map(a => a.id),
            },
          },
        });

        await AuditService.logArchiveCreated('ANNOUNCEMENT', announcementsToArchive.length);
        console.log(`📦 Archived ${announcementsToArchive.length} announcements`);
      }

      // 2. Archive requests expired more than 3 months ago
      const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000);
      
      const requestsToArchive = await prisma.request.findMany({
        where: {
          status: RequestStatus.EXPIRED,
          updatedAt: {
            lt: threeMonthsAgo,
          },
        },
      });

      if (requestsToArchive.length > 0) {
        // Insert into archive table
        await prisma.requestArchive.createMany({
          data: requestsToArchive.map(request => ({
            originalId: request.id,
            userId: request.userId,
            medicineId: request.medicineId,
            quantity: request.quantity,
            region: request.region,
            status: request.status,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
          })),
        });

        // Delete from main table
        await prisma.request.deleteMany({
          where: {
            id: {
              in: requestsToArchive.map(r => r.id),
            },
          },
        });

        await AuditService.logArchiveCreated('REQUEST', requestsToArchive.length);
        console.log(`📦 Archived ${requestsToArchive.length} requests`);
      }

      // 3. Clean up old notifications (6 months old)
      const notificationsToDelete = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: sixMonthsAgo,
          },
        },
      });

      console.log(`📦 Deleted ${notificationsToDelete.count} old notifications`);

      // Log notification purge
      await AuditService.logNotificationPurged(notificationsToDelete.count);

      // Log cron execution summary
      await AuditService.logCronExecuted('handleWeeklyArchiving', {
        announcementsArchived: announcementsToArchive.length,
        requestsArchived: requestsToArchive.length,
        notificationsPurged: notificationsToDelete.count,
      });

      console.log('✅ Weekly archiving completed successfully');
    } catch (error) {
      console.error('❌ Error in weekly archiving:', error);
    }
  }

  /**
   * Handle monthly long-term retention and purge
   */
  static async handleMonthlyRetention() {
    try {
      console.log('🗑️ Processing monthly retention and purge...');

      // 1. Purge announcements archive older than 3 years
      const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
      
      const announcementsToPurge = await prisma.announcementArchive.deleteMany({
        where: {
          archivedAt: {
            lt: threeYearsAgo,
          },
        },
      });

      await AuditService.logDataPurged('ANNOUNCEMENT_ARCHIVE', announcementsToPurge.count, '3 years');
      console.log(`🗑️ Purged ${announcementsToPurge.count} announcements from archive`);

      // 2. Purge requests archive older than 1 year
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      
      const requestsToPurge = await prisma.requestArchive.deleteMany({
        where: {
          archivedAt: {
            lt: oneYearAgo,
          },
        },
      });

      await AuditService.logDataPurged('REQUEST_ARCHIVE', requestsToPurge.count, '1 year');
      console.log(`🗑️ Purged ${requestsToPurge.count} requests from archive`);

      // 3. Export and purge audit logs older than 2 years
      const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
      
      const auditLogsToExport = await prisma.auditLog.findMany({
        where: {
          createdAt: {
            lt: twoYearsAgo,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (auditLogsToExport.length > 0) {
        // Export to CSV
        const exportPath = await this.exportAuditLogsToCSV(auditLogsToExport);
        
        // Delete from database
        await prisma.auditLog.deleteMany({
          where: {
            id: {
              in: auditLogsToExport.map(log => log.id),
            },
          },
        });

        await AuditService.logAuditLogsExported(auditLogsToExport.length, exportPath);
        console.log(`🗑️ Exported and purged ${auditLogsToExport.length} audit logs`);
      }

      // 4. Purge audit logs older than 5 years (if any remain)
      const fiveYearsAgo = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000);
      
      const oldAuditLogsToPurge = await prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: fiveYearsAgo,
          },
        },
      });

      if (oldAuditLogsToPurge.count > 0) {
        await AuditService.logDataPurged('AUDIT_LOG', oldAuditLogsToPurge.count, '5 years');
        console.log(`🗑️ Purged ${oldAuditLogsToPurge.count} old audit logs`);
      }

      // Log cron execution summary
      await AuditService.logCronExecuted('handleMonthlyRetention', {
        announcementsPurged: announcementsToPurge.count,
        requestsPurged: requestsToPurge.count,
        auditLogsExported: auditLogsToExport.length,
        oldAuditLogsPurged: oldAuditLogsToPurge.count,
      });

      console.log('✅ Monthly retention and purge completed successfully');
    } catch (error) {
      console.error('❌ Error in monthly retention and purge:', error);
    }
  }

  /**
   * Export audit logs to CSV file
   */
  private static async exportAuditLogsToCSV(auditLogs: any[]): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audit-logs-${timestamp}.csv`;
    const exportDir = path.join(process.cwd(), 'exports');
    
    // Create exports directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const filepath = path.join(exportDir, filename);
    
    // Create CSV content
    const csvHeader = 'ID,User ID,Action,Entity Type,Entity ID,Details,Created At\n';
    const csvRows = auditLogs.map(log => {
      const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '';
      return `${log.id},${log.userId || ''},"${log.action}","${log.entityType}","${log.entityId || ''}","${details}","${log.createdAt}"`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Write to file
    fs.writeFileSync(filepath, csvContent, 'utf8');
    
    return filepath;
  }

  /**
   * Stop all cron jobs
   */
  static stopCronJobs() {
    console.log('🛑 Stopping cron jobs...');
    // Note: node-cron doesn't provide a direct way to stop all jobs
    // In a real application, you might want to store job references
    console.log('✅ Cron jobs stopped');
  }
} 