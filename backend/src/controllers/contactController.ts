import { Request, Response } from 'express';
import { EmailService } from '../services/emailService';
import { AuditService } from '../services/auditService';

export const createPublicContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        error: 'Tous les champs sont requis'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Format d\'email invalide'
      });
      return;
    }

    // Validate message length
    if (message.trim().length < 10) {
      res.status(400).json({
        success: false,
        error: 'Le message doit contenir au moins 10 caractères'
      });
      return;
    }

    // Send contact form email
    await EmailService.sendContactFormNotification({
      name,
      email,
      subject,
      message
    });

    // Log contact form submission
    await AuditService.logAction({
      userId: null, // Public submission
      action: 'CONTACT_FORM_SUBMITTED',
      entityType: 'CONTACT',
      entityId: null,
      details: { 
        name, 
        email, 
        subject,
        messageLength: message.length,
        ip: req.ip 
      }
    });

    res.status(200).json({
      success: true,
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
    });
  }
}; 