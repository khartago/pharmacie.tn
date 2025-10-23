import prisma from '../lib/prisma';
import { Request } from 'express';

export interface AuditLogData {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Extract IP address and user agent from request
   */
  static getRequestInfo(req: Request) {
    // Try multiple methods to get IP address
    let ipAddress = req.ip || 
                   req.connection?.remoteAddress || 
                   req.socket?.remoteAddress;
    
    // If still not found, try headers
    if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1') {
      ipAddress = req.headers['x-forwarded-for']?.toString().split(',')[0] ||
                  req.headers['x-real-ip']?.toString() ||
                  req.headers['x-client-ip']?.toString() ||
                  req.headers['cf-connecting-ip']?.toString();
    }
    
    // Clean up IPv6 localhost
    if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
      ipAddress = '127.0.0.1';
    }
    
    // Final fallback
    if (!ipAddress || ipAddress === 'Unknown') {
      ipAddress = '127.0.0.1';
    }
    
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    return { ipAddress, userAgent };
  }

  /**
   * Log an action to the audit log
   */
  static async logAction(data: AuditLogData) {
    try {
      // Filter out undefined values to satisfy Prisma's strict type checking
      const auditData: any = {
        action: data.action,
        entityType: data.entityType,
      };

      // Only add properties that are not undefined
      if (data.userId !== undefined) {
        auditData.userId = data.userId;
      }
      if (data.entityId !== undefined) {
        auditData.entityId = data.entityId;
      }

      // Merge details with IP and user agent
      const details = {
        ...data.details,
        ip: data.ipAddress || 'Unknown',
        userAgent: data.userAgent || 'Unknown',
        timestamp: new Date().toISOString()
      };
      auditData.details = details;


      const auditLog = await prisma.auditLog.create({
        data: auditData,
      });

      console.log(`📝 Audit log: ${data.action} on ${data.entityType} by user ${data.userId || 'SYSTEM'} from IP ${details.ip}`);
      return auditLog;
    } catch (error) {
      console.error('❌ Error creating audit log:', error);
      // Don't throw error to avoid breaking the main flow
      return null;
    }
  }

  // User-related audit actions
  static async logUserRegistration(userId: string, userData: any) {
    await this.logAction({
      userId,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: userId,
      details: {
        email: userData.email,
        role: userData.role,
        city: userData.city,
      },
    });
  }

  static async logUserLogin(userId: string, ipAddress?: string, userAgent?: string) {
    await this.logAction({
      userId,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: userId,
      ipAddress: ipAddress || 'Unknown',
      userAgent: userAgent || 'Unknown',
      details: {
        timestamp: new Date().toISOString()
      }
    });
  }

  static async logUserLogout(userId: string, ipAddress?: string, userAgent?: string) {
    await this.logAction({
      userId,
      action: 'USER_LOGOUT',
      entityType: 'USER',
      entityId: userId,
      ipAddress: ipAddress || 'Unknown',
      userAgent: userAgent || 'Unknown',
      details: {
        timestamp: new Date().toISOString()
      }
    });
  }

  static async logPharmacyUpdated(adminId: string, pharmacyId: string, changes: any) {
    await this.logAction({
      userId: adminId,
      action: 'PHARMACY_UPDATED',
      entityType: 'USER',
      entityId: pharmacyId,
      details: changes,
    });
  }

  // Announcement-related audit actions
  static async logAnnouncementCreated(userId: string, announcementId: number, announcementData: any) {
    await this.logAction({
      userId,
      action: 'ANNOUNCEMENT_CREATED',
      entityType: 'ANNOUNCEMENT',
      entityId: announcementId.toString(),
      details: {
        medicineId: announcementData.medicineId,
        quantity: announcementData.quantity,
        expiryDate: announcementData.expiryDate,
        visibleToSupplier: announcementData.visibleToSupplier,
      },
    });
  }

  static async logAnnouncementUpdated(userId: string, announcementId: number, changes: any) {
    await this.logAction({
      userId,
      action: 'ANNOUNCEMENT_UPDATED',
      entityType: 'ANNOUNCEMENT',
      entityId: announcementId.toString(),
      details: changes,
    });
  }

  static async logAnnouncementDeleted(userId: string, announcementId: number) {
    await this.logAction({
      userId,
      action: 'ANNOUNCEMENT_DELETED',
      entityType: 'ANNOUNCEMENT',
      entityId: announcementId.toString(),
    });
  }

  // Interest-related audit actions
  static async logInterestExpressed(userId: string, interestId: number, announcementId: number) {
    await this.logAction({
      userId,
      action: 'INTEREST_EXPRESSED',
      entityType: 'INTEREST',
      entityId: interestId.toString(),
      details: {
        announcementId,
      },
    });
  }

  static async logInterestAccepted(userId: string, interestId: number, announcementId: number) {
    await this.logAction({
      userId,
      action: 'INTEREST_ACCEPTED',
      entityType: 'INTEREST',
      entityId: interestId.toString(),
      details: {
        announcementId,
      },
    });
  }

  static async logInterestRefused(userId: string, interestId: number, announcementId: number) {
    await this.logAction({
      userId,
      action: 'INTEREST_REFUSED',
      entityType: 'INTEREST',
      entityId: interestId.toString(),
      details: {
        announcementId,
      },
    });
  }

  // Request-related audit actions
  static async logRequestCreated(userId: string, requestId: number, requestData: any) {
    await this.logAction({
      userId,
      action: 'REQUEST_CREATED',
      entityType: 'REQUEST',
      entityId: requestId.toString(),
      details: {
        medicineId: requestData.medicineId,
        quantity: requestData.quantity,
        scope: requestData.scope,
        cities: requestData.cities,
        regions: requestData.regions,
      },
    });
  }

  static async logRequestResponded(userId: string, responseId: number, requestId: number) {
    await this.logAction({
      userId,
      action: 'REQUEST_RESPONDED',
      entityType: 'REQUEST_RESPONSE',
      entityId: responseId.toString(),
      details: {
        requestId,
      },
    });
  }

  static async logRequestAccepted(userId: string, responseId: number, requestId: number) {
    await this.logAction({
      userId,
      action: 'REQUEST_ACCEPTED',
      entityType: 'REQUEST_RESPONSE',
      entityId: responseId.toString(),
      details: {
        requestId,
      },
    });
  }

  static async logRequestUpdated(userId: string, requestId: number, changes: any) {
    await this.logAction({
      userId,
      action: 'REQUEST_UPDATED',
      entityType: 'REQUEST',
      entityId: requestId.toString(),
      details: changes,
    });
  }

  static async logRequestDeleted(userId: string, requestId: number) {
    await this.logAction({
      userId,
      action: 'REQUEST_DELETED',
      entityType: 'REQUEST',
      entityId: requestId.toString(),
    });
  }

  // Retour-related audit actions
  static async logRetourCreated(userId: string, announcementId: number) {
    await this.logAction({
      userId,
      action: 'RETOUR_CREATED',
      entityType: 'ANNOUNCEMENT',
      entityId: announcementId.toString(),
      details: {
        type: 'RETOUR',
      },
    });
  }

  static async logRetourAccepted(userId: string, announcementId: number) {
    await this.logAction({
      userId,
      action: 'RETOUR_ACCEPTED',
      entityType: 'ANNOUNCEMENT',
      entityId: announcementId.toString(),
    });
  }

  static async logRetourRefused(userId: string, announcementId: number) {
    await this.logAction({
      userId,
      action: 'RETOUR_REFUSED',
      entityType: 'ANNOUNCEMENT',
      entityId: announcementId.toString(),
    });
  }

  // Subscription-related audit actions
  static async logSubscriptionCreated(userId: string, subscriptionId: number, subscriptionData: any) {
    await this.logAction({
      userId,
      action: 'SUBSCRIPTION_CREATED',
      entityType: 'SUBSCRIPTION',
      entityId: subscriptionId.toString(),
      details: {
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
        status: subscriptionData.status,
      },
    });
  }

  static async logSubscriptionStatusChanged(userId: string, subscriptionId: number, oldStatus: string, newStatus: string) {
    await this.logAction({
      userId,
      action: 'SUBSCRIPTION_STATUS_CHANGED',
      entityType: 'SUBSCRIPTION',
      entityId: subscriptionId.toString(),
      details: {
        oldStatus,
        newStatus,
      },
    });
  }

  static async logSubscriptionExpired(userId: string, subscriptionId: number) {
    await this.logAction({
      userId: null, // System action
      action: 'SUBSCRIPTION_EXPIRED',
      entityType: 'SUBSCRIPTION',
      entityId: subscriptionId.toString(),
      details: {
        userId,
      },
    });
  }

  // Support ticket-related audit actions
  static async logSupportTicketCreated(userId: string, ticketId: number, ticketData: any) {
    await this.logAction({
      userId,
      action: 'SUPPORT_TICKET_CREATED',
      entityType: 'SUPPORT_TICKET',
      entityId: ticketId.toString(),
      details: {
        subject: ticketData.subject,
        status: ticketData.status,
      },
    });
  }

  static async logSupportTicketResolved(userId: string, ticketId: number) {
    await this.logAction({
      userId,
      action: 'SUPPORT_TICKET_RESOLVED',
      entityType: 'SUPPORT_TICKET',
      entityId: ticketId.toString(),
    });
  }

  // System-related audit actions
  static async logAnnouncementExpired(announcementId: number) {
    await this.logAction({
      userId: null, // System action
      action: 'ANNOUNCEMENT_EXPIRED',
      entityType: 'ANNOUNCEMENT',
      entityId: announcementId.toString(),
    });
  }

  static async logRequestExpired(requestId: number) {
    await this.logAction({
      userId: null, // System action
      action: 'REQUEST_EXPIRED',
      entityType: 'REQUEST',
      entityId: requestId.toString(),
    });
  }

  static async logArchiveCreated(entityType: string, count: number) {
    await this.logAction({
      userId: null, // System action
      action: 'ARCHIVE_CREATED',
      entityType: entityType.toUpperCase(),
      details: {
        count,
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async logDataPurged(entityType: string, count: number, retentionPeriod: string) {
    await this.logAction({
      userId: null, // System action
      action: 'DATA_PURGED',
      entityType: entityType.toUpperCase(),
      details: {
        count,
        retentionPeriod,
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async logAuditLogsExported(count: number, exportPath: string) {
    await this.logAction({
      userId: null, // System action
      action: 'AUDIT_LOGS_EXPORTED',
      entityType: 'AUDIT_LOG',
      details: {
        count,
        exportPath,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Security-related audit actions
  static async logLoginFailed(email: string, ip?: string) {
    await this.logAction({
      userId: null, // No user ID for failed login
      action: 'LOGIN_FAILED',
      entityType: 'SECURITY',
      entityId: null,
      details: {
        email,
        ip,
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async logPasswordResetRequested(userId: string, email: string) {
    await this.logAction({
      userId,
      action: 'PASSWORD_RESET_REQUESTED',
      entityType: 'SECURITY',
      entityId: userId,
      details: {
        email,
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async logPasswordChanged(userId: string, email: string) {
    await this.logAction({
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'SECURITY',
      entityId: userId,
      details: {
        email,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Notification lifecycle audit actions
  static async logNotificationRead(userId: string, notificationId: number) {
    await this.logAction({
      userId,
      action: 'NOTIFICATION_READ',
      entityType: 'NOTIFICATION',
      entityId: notificationId.toString(),
      details: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async logNotificationPurged(count: number) {
    await this.logAction({
      userId: null, // System action
      action: 'NOTIFICATION_PURGED',
      entityType: 'NOTIFICATION',
      entityId: null,
      details: {
        count,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Retour lifecycle audit actions
  static async logRetourDeleted(userId: string, announcementId: number) {
    await this.logAction({
      userId,
      action: 'RETOUR_DELETED',
      entityType: 'ANNOUNCEMENT',
      entityId: announcementId.toString(),
      details: {
        type: 'RETOUR',
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async logRetourExpired(announcementId: number) {
    await this.logAction({
      userId: null, // System action
      action: 'RETOUR_EXPIRED',
      entityType: 'ANNOUNCEMENT',
      entityId: announcementId.toString(),
      details: {
        type: 'RETOUR',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Cron task execution audit actions
  static async logCronExecuted(taskName: string, summary: any) {
    await this.logAction({
      userId: null, // System action
      action: 'CRON_EXECUTED',
      entityType: 'SYSTEM',
      entityId: null,
      details: {
        taskName,
        summary,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Account creation audit actions
  static async logAccountCreated(adminId: string, userId: string, userData: any) {
    await this.logAction({
      userId: adminId,
      action: 'ACCOUNT_CREATED',
      entityType: 'USER',
      entityId: userId,
      details: {
        createdUserId: userId,
        email: userData.email,
        role: userData.role,
        createdBy: adminId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async logWelcomeEmailSent(userId: string, email: string) {
    await this.logAction({
      userId: null, // System action
      action: 'WELCOME_EMAIL_SENT',
      entityType: 'USER',
      entityId: userId,
      details: {
        email,
        timestamp: new Date().toISOString(),
      },
    });
  }
} 