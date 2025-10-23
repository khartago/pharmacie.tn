import { NotificationType } from '@prisma/client';
import prisma from '../lib/prisma';
import { EmailService } from './emailService';

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isImportant?: boolean;
}

export class NotificationService {
  /**
   * Create a notification for a user
   */
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          isImportant: data.isImportant || false,
        },
      });

      console.log(`📧 Notification created: ${data.type} for user ${data.userId}`);

      // Send email for important notifications
      if (data.isImportant) {
        const user = await prisma.user.findUnique({
          where: { id: data.userId },
          select: { name: true, email: true }
        });

        if (user) {
          await EmailService.sendImportantNotification(
            user.email,
            user.name,
            data.title,
            data.message,
            data.userId,
            'NOTIFICATION',
            notification.id
          );
        }
      }

      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Notify announcement owner when someone expresses interest
   */
  static async notifyAnnouncementInterest(announcementId: number) {
    try {
      const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
          pharmacyUser: true,
          medicine: true,
        },
      });

      if (!announcement) return;

      await this.createNotification({
        userId: announcement.pharmacyUserId,
        title: 'Nouvel intérêt pour votre annonce',
        message: `Une pharmacie s'est intéressée à votre annonce "${announcement.medicine.brandName}". Consultez les détails pour accepter ou refuser.`,
        type: NotificationType.INTEREST,
      });
    } catch (error) {
      console.error('❌ Error notifying announcement interest:', error);
    }
  }

  /**
   * Notify pharmacy when their interest is accepted/refused
   */
  static async notifyInterestResponse(interestId: number, status: 'ACCEPTED' | 'REFUSED') {
    try {
      const interest = await prisma.interest.findUnique({
        where: { id: interestId },
        include: {
          pharmacyUser: true,
          announcement: {
            include: {
              medicine: true,
            },
          },
        },
      });

      if (!interest) return;

      const title = status === 'ACCEPTED' 
        ? 'Intérêt accepté' 
        : 'Intérêt refusé';
      
      const message = status === 'ACCEPTED'
        ? `Votre intérêt pour "${interest.announcement.medicine.brandName}" a été accepté. Vous pouvez maintenant contacter le fournisseur.`
        : `Votre intérêt pour "${interest.announcement.medicine.brandName}" a été refusé. Vous pouvez rechercher d'autres annonces.`;

      await this.createNotification({
        userId: interest.pharmacyUserId,
        title,
        message,
        type: NotificationType.INTEREST,
      });
    } catch (error) {
      console.error('❌ Error notifying interest response:', error);
    }
  }

  /**
   * Notify all pharmacies in the same region when a request is created
   */
  static async notifyRequestCreated(requestId: number) {
    try {
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: {
          medicine: true,
          user: {
            include: {
              city: true,
            },
          },
        },
      });

      if (!request) return;

      // Find pharmacies based on request scope
      let whereClause: any = {
        role: {
          name: 'PHARMACY',
        },
        isActive: true,
        id: {
          not: request.userId, // Exclude the requesting user
        },
      };

      if (request.scope === 'CITY' && request.cities) {
        whereClause.cityId = {
          in: request.cities,
        };
      } else if (request.scope === 'REGION' && request.regions) {
        whereClause.city = {
          region: {
            in: request.regions,
          },
        };
      } else if (request.scope === 'ALL_TUNISIA') {
        // No additional filters - all pharmacies
      }

      const pharmaciesInScope = await prisma.user.findMany({
        where: whereClause,
      });

      // Create notifications for each pharmacy
      for (const pharmacy of pharmaciesInScope) {
        const scopeMessage = request.scope === 'CITY' ? 'votre ville' : 
                           request.scope === 'REGION' ? 'votre région' : 
                           'Toute la Tunisie';
        
        await this.createNotification({
          userId: pharmacy.id,
          title: 'Nouvelle demande de rupture',
          message: `Une demande de rupture pour "${request.medicine.brandName}" a été créée dans ${scopeMessage}. Consultez les détails pour y répondre.`,
          type: NotificationType.REQUEST,
        });
      }
    } catch (error) {
      console.error('❌ Error notifying request created:', error);
    }
  }

  /**
   * Notify requesting pharmacy when someone responds
   */
  static async notifyRequestResponse(requestId: number) {
    try {
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: {
          medicine: true,
        },
      });

      if (!request) return;

      await this.createNotification({
        userId: request.userId,
        title: 'Réponse à votre demande',
        message: `Une pharmacie a répondu à votre demande de rupture pour "${request.medicine.brandName}". Consultez les détails pour accepter ou refuser.`,
        type: NotificationType.REQUEST,
      });
    } catch (error) {
      console.error('❌ Error notifying request response:', error);
    }
  }

  /**
   * Notify responding pharmacy when their response is accepted
   */
  static async notifyResponseAccepted(responseId: number) {
    try {
      const response = await prisma.requestResponse.findUnique({
        where: { id: responseId },
        include: {
          request: {
            include: {
              medicine: true,
            },
          },
        },
      });

      if (!response) return;

      await this.createNotification({
        userId: response.pharmacyUserId,
        title: 'Réponse acceptée',
        message: `Votre réponse à la demande de rupture pour "${response.request.medicine.brandName}" a été acceptée. Vous pouvez maintenant contacter la pharmacie demandante.`,
        type: NotificationType.REQUEST,
      });
    } catch (error) {
      console.error('❌ Error notifying response accepted:', error);
    }
  }

  /**
   * Notify supplier when a retour is created (if visible to supplier)
   */
  static async notifyRetourCreated(announcementId: number) {
    try {
      const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
          supplierUser: true,
          medicine: true,
        },
      });

      if (!announcement || !announcement.visibleToSupplier) return;

      await this.createNotification({
        userId: announcement.supplierUserId!,
        title: 'Nouveau retour créé',
        message: `Une pharmacie a demandé un retour pour "${announcement.medicine.brandName}". Consultez les détails pour accepter ou refuser.`,
        type: NotificationType.RETOUR,
      });
    } catch (error) {
      console.error('❌ Error notifying retour created:', error);
    }
  }

  /**
   * Notify pharmacy when supplier accepts/refuses retour
   */
  static async notifyRetourResponse(announcementId: number, status: 'ACCEPTED' | 'REFUSED') {
    try {
      const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
          pharmacyUser: true,
          medicine: true,
        },
      });

      if (!announcement) return;

      const title = status === 'ACCEPTED' 
        ? 'Retour accepté' 
        : 'Retour refusé';
      
      const message = status === 'ACCEPTED'
        ? `Votre retour pour "${announcement.medicine.brandName}" a été accepté par le fournisseur. Vous pouvez procéder au retour.`
        : `Votre retour pour "${announcement.medicine.brandName}" a été refusé par le fournisseur. Contactez le fournisseur pour plus d'informations.`;

      await this.createNotification({
        userId: announcement.pharmacyUserId,
        title,
        message,
        type: NotificationType.RETOUR,
      });
    } catch (error) {
      console.error('❌ Error notifying retour response:', error);
    }
  }

  /**
   * Notify user when subscription trial ends in 5 days
   */
  static async notifySubscriptionTrialEnding(userId: string, endDate: Date) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return;

      await this.createNotification({
        userId,
        title: 'Essai se termine bientôt',
        message: `Votre période d'essai se termine dans 5 jours (${endDate.toLocaleDateString()}). Pensez à renouveler votre abonnement pour continuer à utiliser nos services.`,
        type: NotificationType.SUBSCRIPTION,
        isImportant: true,
      });
    } catch (error) {
      console.error('❌ Error notifying subscription trial ending:', error);
    }
  }

  /**
   * Notify user when subscription expires
   */
  static async notifySubscriptionExpired(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return;

      await this.createNotification({
        userId,
        title: 'Abonnement expiré',
        message: 'Votre abonnement a expiré. Renouvelez-le pour continuer à utiliser nos services et accéder à toutes les fonctionnalités.',
        type: NotificationType.SUBSCRIPTION,
        isImportant: true,
      });
    } catch (error) {
      console.error('❌ Error notifying subscription expired:', error);
    }
  }

  /**
   * Notify pharmacy when their announcement expires
   */
  static async notifyAnnouncementExpired(announcementId: number) {
    try {
      const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
          pharmacyUser: true,
          medicine: true,
        },
      });

      if (!announcement) return;

      await this.createNotification({
        userId: announcement.pharmacyUserId,
        title: 'Annonce expirée',
        message: `Votre annonce pour "${announcement.medicine.brandName}" a expiré. Vous pouvez créer une nouvelle annonce si nécessaire.`,
        type: NotificationType.SYSTEM,
      });
    } catch (error) {
      console.error('❌ Error notifying announcement expired:', error);
    }
  }

  /**
   * Notify pharmacy when their request expires
   */
  static async notifyRequestExpired(requestId: number) {
    try {
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: {
          user: true,
          medicine: true,
        },
      });

      if (!request) return;

      await this.createNotification({
        userId: request.userId,
        title: 'Demande expirée',
        message: `Votre demande de rupture pour "${request.medicine.brandName}" a expiré. Vous pouvez créer une nouvelle demande si nécessaire.`,
        type: NotificationType.SYSTEM,
      });
    } catch (error) {
      console.error('❌ Error notifying request expired:', error);
    }
  }
} 