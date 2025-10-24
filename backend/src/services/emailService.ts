import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { AuditService } from './auditService';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId?: string;
  entityType?: string;
  entityId?: string | number;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null;
  private static baseTemplate: string;

  /**
   * Initialize email service
   */
  static async initialize(): Promise<void> {
    try {
      // Load base template first
      this.baseTemplate = this.loadBaseTemplate();

      // Check if email credentials are configured
      if (!process.env['EMAIL_USER'] || !process.env['EMAIL_PASS']) {
        console.log('⚠️ Configuration email manquante - Service email désactivé');
        console.log('💡 Pour activer les emails, configurez EMAIL_USER et EMAIL_PASS dans le fichier .env');
        return;
      }

      // Try alternative Gmail configurations for Render
      const isGmail = process.env['EMAIL_HOST'] === 'smtp.gmail.com' || process.env['EMAIL_HOST']?.includes('gmail');
      if (isGmail && process.env.NODE_ENV === 'production') {
        console.log('🔧 Tentative de connexion Gmail avec configuration optimisée pour Render...');
      }

      // Create transporter with multiple Gmail configurations for Render
      const transporterConfig: any = {
        host: process.env['EMAIL_HOST'] || 'smtp.gmail.com',
        port: parseInt(process.env['EMAIL_PORT'] || '587'),
        secure: process.env['EMAIL_SECURE'] === 'true', // true for 465, false for other ports
        auth: {
          user: process.env['EMAIL_USER'],
          pass: process.env['EMAIL_PASS'],
        },
        // Configuration optimisée pour Render
        connectionTimeout: 60000, // 60 secondes
        greetingTimeout: 30000,     // 30 secondes
        socketTimeout: 60000,      // 60 secondes
        tls: {
          rejectUnauthorized: false
        }
      };

      // Configuration spéciale pour Gmail sur Render
      if (isGmail) {
        transporterConfig.requireTLS = true;
        transporterConfig.secureConnection = false;
        transporterConfig.tls = {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        };
        // Essayer le port 465 en premier pour Gmail
        if (process.env['EMAIL_PORT'] === '587') {
          transporterConfig.port = 465;
          transporterConfig.secure = true;
        }
      }

      this.transporter = nodemailer.createTransport(transporterConfig);

      // Verify connection with retry logic for Gmail on Render
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await this.transporter.verify();
          console.log('✅ Service email initialisé avec succès');
          break;
        } catch (verifyError) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`🔄 Tentative ${retryCount}/${maxRetries} - Retry dans 5 secondes...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          } else {
            throw verifyError;
          }
        }
      }
    } catch (error) {
      console.error('❌ Échec de l\'initialisation du service email:', error);
      
      // Check for specific error types
      if (error && typeof error === 'object' && 'code' in error) {
        const emailError = error as { code: string; responseCode?: number };
        
        if (emailError.code === 'ETIMEDOUT') {
          console.log('⏱️ Timeout de connexion SMTP détecté');
          console.log('💡 Solutions pour Render :');
          console.log('   1. Vérifiez les variables d\'environnement SMTP sur Render');
          console.log('   2. Utilisez un service SMTP plus fiable (SendGrid, Mailgun)');
          console.log('   3. Vérifiez les restrictions réseau de Render');
        } else if (emailError.code === 'EAUTH' && emailError.responseCode === 535) {
          console.log('🔐 Erreur d\'authentification Gmail détectée');
          console.log('💡 Solutions possibles :');
          console.log('   1. Vérifiez que vous utilisez un "Mot de passe d\'application" Gmail');
          console.log('   2. Générez un nouveau mot de passe d\'application :');
          console.log('      - Allez sur https://myaccount.google.com/apppasswords');
          console.log('      - Sélectionnez "Mail" et votre appareil');
          console.log('      - Copiez le mot de passe généré dans EMAIL_PASS');
          console.log('   3. Assurez-vous que l\'authentification à 2 facteurs est activée');
        } else if (emailError.code === 'ECONNREFUSED') {
          console.log('🚫 Connexion refusée par le serveur SMTP');
          console.log('💡 Vérifiez la configuration SMTP_HOST et SMTP_PORT');
        }
      }
      
      console.log('⚠️ Service email désactivé - Les emails ne seront pas envoyés');
      this.transporter = null;
    }
  }

  /**
   * Send email with audit logging
   */
  static async sendMail(options: EmailOptions): Promise<boolean> {
    try {
      // Check if transporter is available
      if (!this.transporter) {
        console.log(`📧 Email simulé (service désactivé) - À: ${options.to}, Sujet: ${options.subject}`);
        return false;
      }

      const mailOptions = {
        from: process.env['EMAIL_FROM'] || 'Pharmacie.tn <no-reply@pharmacie.tn>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email envoyé à ${options.to}: ${options.subject}`);

      // Log audit entry
      await AuditService.logAction({
        userId: options.userId || null,
        action: 'EMAIL_SENT',
        entityType: options.entityType || 'SYSTEM',
        entityId: options.entityId ? options.entityId.toString() : null,
        details: {
          subject: options.subject,
          to: options.to,
          messageId: info.messageId
        }
      });

      return true;
    } catch (error) {
      console.error('❌ Échec de l\'envoi de l\'email:', error);
      
      // Log failed email attempt
      await AuditService.logAction({
        userId: options.userId || null,
        action: 'EMAIL_FAILED',
        entityType: options.entityType || 'SYSTEM',
        entityId: options.entityId ? options.entityId.toString() : null,
        details: {
          subject: options.subject,
          to: options.to,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      });

      return false;
    }
  }

  /**
   * Send email using base template
   */
  static async sendTemplatedEmail(options: EmailOptions): Promise<boolean> {
    const htmlContent = this.baseTemplate.replace('{{content}}', options.html);
    return this.sendMail({
      ...options,
      html: htmlContent
    });
  }

  /**
   * Load base email template
   */
  private static loadBaseTemplate(): string {
    try {
      // Try multiple possible paths for the template
      const possiblePaths = [
        path.join(__dirname, '../templates/base.html'),
        path.join(__dirname, '../../templates/base.html'),
        path.join(process.cwd(), 'src/templates/base.html'),
        path.join(process.cwd(), 'backend/src/templates/base.html')
      ];
      
      for (const templatePath of possiblePaths) {
        try {
          if (fs.existsSync(templatePath)) {
            return fs.readFileSync(templatePath, 'utf8');
          }
        } catch (e) {
          continue;
        }
      }
      
      throw new Error('Template not found in any of the expected locations');
    } catch (error) {
      console.error('❌ Échec du chargement du template de base:', error);
      // Fallback template
      return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pharmacie.tn</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">
              <span style="color: #2ECC71;">Pharmacie</span><span style="color: #000;">.tn</span>
            </h1>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            {{content}}
          </div>
          <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            © Pharmacie.tn — Tous droits réservés
          </div>
        </body>
        </html>
      `;
    }
  }

  /**
   * Send welcome email for newly created accounts
   */
  static async sendWelcomeEmail(
    to: string,
    userName: string,
    email: string,
    password: string,
    role: string,
    userId: string
  ): Promise<boolean> {
    const roleDisplay = role === 'PHARMACY' ? 'Pharmacie' : role === 'SUPPLIER' ? 'Fournisseur' : 'Administrateur';
    
    const html = `
      <h2 style="color: #2ECC71; margin-bottom: 20px;">Bienvenue sur Pharmacie.tn</h2>
      <p>Bonjour ${userName},</p>
      <p>Votre compte ${roleDisplay} a été créé avec succès sur la plateforme Pharmacie.tn.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2ECC71;">
        <h3 style="margin-top: 0; color: #333;">Vos identifiants de connexion :</h3>
        <p><strong>Identifiant :</strong> ${email}</p>
        <p><strong>Mot de passe :</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
      </div>
      
      <p><strong>Note importante :</strong> Vous pouvez conserver ce mot de passe ou le modifier à tout moment depuis vos paramètres de profil.</p>
      
      <p>Pour commencer à utiliser la plateforme, veuillez vous connecter à l'adresse suivante :</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env['FRONTEND_URL']}" style="background: #2ECC71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Accéder à Pharmacie.tn
        </a>
      </div>
      
      <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe de support.</p>
      
      <p>Cordialement,<br>L'équipe Pharmacie.tn</p>
    `;

    return this.sendTemplatedEmail({
      to,
      subject: 'Bienvenue sur Pharmacie.tn - Vos identifiants de connexion',
      html,
      userId,
      entityType: 'USER',
      entityId: userId
    });
  }

  /**
   * Generate password reset email
   */
  static async sendPasswordResetEmail(
    to: string, 
    resetToken: string, 
    userId: string
  ): Promise<boolean> {
    const resetUrl = `${process.env['FRONTEND_URL']}/reset-password?token=${resetToken}`;
    
    const html = `
      <h2 style="color: #2ECC71; margin-bottom: 20px;">Réinitialisation de mot de passe</h2>
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Pharmacie.tn.</p>
      <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #2ECC71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Réinitialiser le mot de passe
        </a>
      </div>
      <p><strong>Ce lien expire dans 1 heure.</strong></p>
      <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
      <p>Cordialement,<br>L'équipe Pharmacie.tn</p>
    `;

    return this.sendTemplatedEmail({
      to,
      subject: 'Réinitialisation de mot de passe - Pharmacie.tn',
      html,
      userId,
      entityType: 'USER',
      entityId: userId
    });
  }

  /**
   * Send password reset confirmation email
   */
  static async sendPasswordResetConfirmation(
    to: string, 
    userId: string
  ): Promise<boolean> {
    const html = `
      <h2 style="color: #2ECC71; margin-bottom: 20px;">Mot de passe mis à jour</h2>
      <p>Bonjour,</p>
      <p>Votre mot de passe a été mis à jour avec succès.</p>
      <p>Si vous n'êtes pas à l'origine de cette modification, veuillez contacter immédiatement notre équipe de support.</p>
      <p>Cordialement,<br>L'équipe Pharmacie.tn</p>
    `;

    return this.sendTemplatedEmail({
      to,
      subject: 'Mot de passe mis à jour - Pharmacie.tn',
      html,
      userId,
      entityType: 'USER',
      entityId: userId
    });
  }

  /**
   * Send subscription trial ending reminder
   */
  static async sendTrialEndingReminder(
    to: string, 
    userName: string, 
    endDate: Date,
    userId: string
  ): Promise<boolean> {
    const formattedDate = endDate.toLocaleDateString('fr-FR');
    
    const html = `
      <h2 style="color: #2ECC71; margin-bottom: 20px;">Votre essai se termine bientôt</h2>
      <p>Bonjour ${userName},</p>
      <p>Votre période d'essai se termine le <strong>${formattedDate}</strong>.</p>
      <p>Pour continuer à bénéficier de nos services, merci de contacter notre équipe de support pour renouveler votre abonnement.</p>
      <p>Cordialement,<br>L'équipe Pharmacie.tn</p>
    `;

    return this.sendTemplatedEmail({
      to,
      subject: 'Votre essai se termine bientôt - Pharmacie.tn',
      html,
      userId,
      entityType: 'SUBSCRIPTION',
      entityId: userId
    });
  }

  /**
   * Send subscription expired notification
   */
  static async sendSubscriptionExpired(
    to: string, 
    userName: string,
    userId: string
  ): Promise<boolean> {
    const html = `
      <h2 style="color: #e74c3c; margin-bottom: 20px;">Abonnement expiré</h2>
      <p>Bonjour ${userName},</p>
      <p>Votre abonnement a expiré. Pour continuer à utiliser nos services, merci de contacter notre équipe de support pour renouveler.</p>
      <p>Cordialement,<br>L'équipe Pharmacie.tn</p>
    `;

    return this.sendTemplatedEmail({
      to,
      subject: 'Abonnement expiré - Pharmacie.tn',
      html,
      userId,
      entityType: 'SUBSCRIPTION',
      entityId: userId
    });
  }

  /**
   * Send support ticket confirmation
   */
  static async sendSupportTicketConfirmation(
    to: string, 
    userName: string, 
    ticketId: string,
    subject: string,
    userId: string
  ): Promise<boolean> {
    const html = `
      <h2 style="color: #2ECC71; margin-bottom: 20px;">Ticket de support créé</h2>
      <p>Bonjour ${userName},</p>
      <p>Votre ticket de support a été créé avec succès.</p>
      <p><strong>Numéro de ticket :</strong> ${ticketId}</p>
      <p><strong>Sujet :</strong> ${subject}</p>
      <p>Notre équipe vous répondra dans les plus brefs délais.</p>
      <p>Cordialement,<br>L'équipe Pharmacie.tn</p>
    `;

    return this.sendTemplatedEmail({
      to,
      subject: 'Ticket de support créé - Pharmacie.tn',
      html,
      userId,
      entityType: 'SUPPORT_TICKET',
      entityId: ticketId
    });
  }

  /**
   * Send support ticket reply
   */
  static async sendSupportTicketReply(
    to: string, 
    userName: string, 
    ticketId: string,
    replyMessage: string,
    userId: string
  ): Promise<boolean> {
    const html = `
      <h2 style="color: #2ECC71; margin-bottom: 20px;">Nouvelle réponse à votre ticket</h2>
      <p>Bonjour ${userName},</p>
      <p>Une nouvelle réponse a été ajoutée à votre ticket de support.</p>
      <p><strong>Numéro de ticket :</strong> ${ticketId}</p>
      <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #2ECC71; margin: 20px 0;">
        <p style="margin: 0;">${replyMessage}</p>
      </div>
      <p>Cordialement,<br>L'équipe Pharmacie.tn</p>
    `;

    return this.sendTemplatedEmail({
      to,
      subject: 'Nouvelle réponse - Ticket de support - Pharmacie.tn',
      html,
      userId,
      entityType: 'SUPPORT_TICKET',
      entityId: ticketId
    });
  }

  /**
   * Send contact form notification
   */
  static async sendContactFormNotification(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    const html = `
      <h2 style="color: #2ECC71; margin-bottom: 20px;">Nouveau message de contact</h2>
      <p>Un nouveau message a été envoyé via le formulaire de contact.</p>
      <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #2ECC71; margin: 20px 0;">
        <p><strong>Nom :</strong> ${data.name}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>Sujet :</strong> ${data.subject}</p>
        <p><strong>Message :</strong></p>
        <p style="white-space: pre-wrap; margin-top: 10px;">${data.message}</p>
      </div>
      <p>Veuillez répondre à ce message dans les plus brefs délais.</p>
    `;

    // Send to admin email
    const adminEmail = process.env['ADMIN_EMAIL'] || 'contact@pharmacie.tn';
    
    return this.sendTemplatedEmail({
      to: adminEmail,
      subject: `Nouveau message de contact - ${data.subject}`,
      html,
      entityType: 'CONTACT_FORM',
      entityId: 'public'
    });
  }

  /**
   * Send important notification email
   */
  static async sendImportantNotification(
    to: string, 
    userName: string, 
    title: string, 
    message: string,
    userId: string,
    entityType: string,
    entityId: string | number
  ): Promise<boolean> {
    const html = `
      <h2 style="color: #2ECC71; margin-bottom: 20px;">${title}</h2>
      <p>Bonjour ${userName},</p>
      <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #2ECC71; margin: 20px 0;">
        <p style="margin: 0;">${message}</p>
      </div>
      <p>Cordialement,<br>L'équipe Pharmacie.tn</p>
    `;

    return this.sendTemplatedEmail({
      to,
      subject: `${title} - Pharmacie.tn`,
      html,
      userId,
      entityType,
      entityId
    });
  }
} 