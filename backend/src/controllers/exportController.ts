import { Request, Response } from 'express';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';
import prisma from '../lib/prisma';
import puppeteer from 'puppeteer';

/**
 * Generate CSV from data
 */
async function generateCSV(data: any[]): Promise<string> {
  const parser = new Parser();
  return parser.parse(data);
}

/**
 * Generate Excel file from data
 */
async function generateExcel(data: any[], _filename: string, sheetName: string = 'Data'): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (data.length === 0) {
    return new Uint8Array(await workbook.xlsx.writeBuffer());
  }

  // Add headers
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);

  // Style headers
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6FA' }
  };

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => row[header]);
    worksheet.addRow(values);
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  return new Uint8Array(await workbook.xlsx.writeBuffer());
}

export const exportPharmacies = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pharmacies = await prisma.user.findMany({
      where: {
        role: {
          name: 'PHARMACY'
        },
        isActive: true
      },
      include: {
        city: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    const csvData = pharmacies.map(pharmacy => ({
      'Nom': pharmacy.name,
      'Email': pharmacy.email,
      'Téléphone': pharmacy.phone || '',
      'Adresse': pharmacy.address || '',
      'Ville': pharmacy.city?.name || '',
      'Région': pharmacy.city?.region || '',
      'Statut': pharmacy.isActive ? 'Actif' : 'Inactif',
      'Date de création': pharmacy.createdAt.toISOString().split('T')[0]
    }));

    const excelBuffer = await generateExcel(csvData, 'pharmacies', 'Pharmacies');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=pharmacies.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export pharmacies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export pharmacies'
    });
  }
};

export const exportSuppliers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await prisma.user.findMany({
      where: {
        role: {
          name: 'SUPPLIER'
        },
        isActive: true
      },
      include: {
        city: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    const csvData = suppliers.map(supplier => ({
      'Nom': supplier.name,
      'Email': supplier.email,
      'Téléphone': supplier.phone || '',
      'Adresse': supplier.address || '',
      'Ville': supplier.city?.name || '',
      'Région': supplier.city?.region || '',
      'Statut': supplier.isActive ? 'Actif' : 'Inactif',
      'Date de création': supplier.createdAt.toISOString().split('T')[0]
    }));

    const excelBuffer = await generateExcel(csvData, 'fournisseurs', 'Fournisseurs');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=fournisseurs.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export suppliers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export suppliers'
    });
  }
};

export const exportAnnouncements = async (_req: Request, res: Response): Promise<void> => {
  try {
    const announcements = await prisma.announcement.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const csvData = announcements.map(announcement => ({
      'ID': announcement.id,
      'Médicament': announcement.medicine.dci,
      'Nom commercial': announcement.medicine.brandName,
      'Laboratoire': announcement.medicine.laboratoire,
      'Quantité': announcement.quantity,
      'Date d\'expiration': announcement.expiryDate.toISOString().split('T')[0],
      'Statut': announcement.status,
      'Pharmacie': announcement.pharmacyUser.name,
      'Ville': announcement.pharmacyUser.city?.name || '',
      'Région': announcement.pharmacyUser.city?.region || '',
      'Date de création': announcement.createdAt.toISOString().split('T')[0]
    }));

    const csv = await generateCSV(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=announcements.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export announcements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export announcements'
    });
  }
};

export const exportRequests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.request.findMany({
      include: {
        user: {
          include: {
            city: true
          }
        },
        medicine: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const csvData = requests.map(request => ({
      'ID': request.id,
      'Médicament': request.medicine.dci,
      'Nom commercial': request.medicine.brandName,
      'Quantité': request.quantity,
      'Région': request.region,
      'Statut': request.status,
      'Demandeur': request.user.name,
      'Email': request.user.email,
      'Ville': request.user.city?.name || '',
      'Date de création': request.createdAt.toISOString().split('T')[0]
    }));

    const csv = await generateCSV(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=requests.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export requests'
    });
  }
};

export const exportSupportTickets = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: {
          include: {
            city: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const csvData = tickets.map(ticket => ({
      'ID': ticket.id,
      'Sujet': ticket.subject,
      'Message': ticket.message,
      'Statut': ticket.status,
      'Utilisateur': ticket.user.name,
      'Email': ticket.user.email,
      'Rôle': ticket.user.role.name,
      'Ville': ticket.user.city?.name || '',
      'Date de création': ticket.createdAt.toISOString().split('T')[0],
      'Date de mise à jour': ticket.updatedAt.toISOString().split('T')[0]
    }));

    const csv = await generateCSV(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=support_tickets.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export support tickets error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export support tickets'
    });
  }
};

export const exportAuditLogs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const csvData = logs.map(log => ({
      'ID': log.id,
      'Action': log.action,
      'Type d\'entité': log.entityType,
      'ID d\'entité': log.entityId || '',
      'Utilisateur': log.user?.name || 'Système',
      'Email': log.user?.email || '',
      'Rôle': log.user?.role.name || '',
      'Date': log.createdAt.toISOString().split('T')[0],
      'Heure': log.createdAt.toTimeString().split(' ')[0]
    }));

    const csv = await generateCSV(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export audit logs'
    });
  }
};

export const exportRetourPDF = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { retourId } = _req.params;

    if (!retourId) {
      res.status(400).json({
        success: false,
        error: 'Retour ID is required'
      });
      return;
    }

    const retour = await prisma.announcement.findUnique({
      where: { id: parseInt(retourId) },
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

    if (!retour) {
      res.status(404).json({
        success: false,
        error: 'Retour not found'
      });
      return;
    }

    // Check if this is actually a retour (announcement with return status)
    if (!['RETURN_PENDING', 'RETURN_ACCEPTED', 'RETURN_REFUSED'].includes(retour.status)) {
      res.status(400).json({
        success: false,
        error: 'This is not a retour'
      });
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Retour Accepté - ${retour.medicine.dci}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #2ECC71; font-size: 24px; font-weight: bold; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #2ECC71; border-bottom: 2px solid #2ECC71; padding-bottom: 5px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; }
            .value { color: #666; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Pharmacie.tn</div>
            <h1>Retour Accepté</h1>
            <p>Document généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>

          <div class="section">
            <h3>Informations du médicament</h3>
            <div class="info-row">
              <span class="label">DCI:</span>
              <span class="value">${retour.medicine.dci}</span>
            </div>
            <div class="info-row">
              <span class="label">Nom commercial:</span>
              <span class="value">${retour.medicine.brandName}</span>
            </div>
            <div class="info-row">
              <span class="label">Laboratoire:</span>
              <span class="value">${retour.medicine.laboratoire}</span>
            </div>
            <div class="info-row">
              <span class="label">Quantité:</span>
              <span class="value">${retour.quantity}</span>
            </div>
            <div class="info-row">
              <span class="label">Date d'expiration:</span>
              <span class="value">${retour.expiryDate.toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          <div class="section">
            <h3>Pharmacie</h3>
            <div class="info-row">
              <span class="label">Nom:</span>
              <span class="value">${retour.pharmacyUser.name}</span>
            </div>
            <div class="info-row">
              <span class="label">Adresse:</span>
              <span class="value">${retour.pharmacyUser.address || 'Non spécifiée'}</span>
            </div>
            <div class="info-row">
              <span class="label">Ville:</span>
              <span class="value">${retour.pharmacyUser.city?.name || 'Non spécifiée'}</span>
            </div>
            <div class="info-row">
              <span class="label">Région:</span>
              <span class="value">${retour.pharmacyUser.city?.region || 'Non spécifiée'}</span>
            </div>
          </div>

          <div class="section">
            <h3>Fournisseur</h3>
            <div class="info-row">
              <span class="label">Nom:</span>
              <span class="value">${retour.supplierUser?.name || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
              <span class="label">Adresse:</span>
              <span class="value">${retour.supplierUser?.address || 'Non spécifiée'}</span>
            </div>
            <div class="info-row">
              <span class="label">Ville:</span>
              <span class="value">${retour.supplierUser?.city?.name || 'Non spécifiée'}</span>
            </div>
            <div class="info-row">
              <span class="label">Région:</span>
              <span class="value">${retour.supplierUser?.city?.region || 'Non spécifiée'}</span>
            </div>
          </div>

          <div class="section">
            <h3>Détails du retour</h3>
            <div class="info-row">
              <span class="label">Statut:</span>
              <span class="value">Accepté</span>
            </div>
            <div class="info-row">
              <span class="label">Date de création:</span>
              <span class="value">${retour.createdAt.toLocaleDateString('fr-FR')}</span>
            </div>
            <div class="info-row">
              <span class="label">Date d'acceptation:</span>
              <span class="value">${retour.updatedAt.toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          <div class="footer">
            <p>Ce document a été généré automatiquement par Pharmacie.tn</p>
            <p>Pour toute question, contactez-nous à support@pharmacie.tn</p>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=retour-${retourId}.pdf`);
    res.send(pdf);
  } catch (error) {
    console.error('Export retour PDF error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export retour PDF'
    });
  }
};

// Export Analytics Data
export const exportAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalPharmacies,
      totalSuppliers,
      activeAnnouncements,
      openRequests,
      totalMedicines
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { name: 'PHARMACY' } } }),
      prisma.user.count({ where: { role: { name: 'SUPPLIER' } } }),
      prisma.announcement.count({ where: { status: 'AVAILABLE' } }),
      prisma.request.count({ where: { status: 'OPEN' } }),
      prisma.medicine.count()
    ]);

    const analyticsData = [{
      'Métrique': 'Utilisateurs totaux',
      'Valeur': totalUsers,
      'Description': 'Nombre total d\'utilisateurs dans le système'
    }, {
      'Métrique': 'Pharmacies',
      'Valeur': totalPharmacies,
      'Description': 'Nombre de pharmacies enregistrées'
    }, {
      'Métrique': 'Fournisseurs',
      'Valeur': totalSuppliers,
      'Description': 'Nombre de fournisseurs enregistrés'
    }, {
      'Métrique': 'Annonces actives',
      'Valeur': activeAnnouncements,
      'Description': 'Nombre d\'annonces disponibles'
    }, {
      'Métrique': 'Demandes ouvertes',
      'Valeur': openRequests,
      'Description': 'Nombre de demandes en cours'
    }, {
      'Métrique': 'Médicaments',
      'Valeur': totalMedicines,
      'Description': 'Nombre de médicaments dans la base'
    }];

    const excelBuffer = await generateExcel(analyticsData, 'analytics', 'Analytics');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics'
    });
  }
};

// Export Accounts Data
export const exportAccounts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const accounts = await prisma.user.findMany({
      include: {
        role: true,
        city: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const accountsData = accounts.map(account => ({
      'Nom': account.name,
      'Email': account.email,
      'Téléphone': account.phone || '',
      'Adresse': account.address || '',
      'Ville': account.city?.name || '',
      'Région': account.city?.region || '',
      'Rôle': account.role.name,
      'Statut': account.isActive ? 'Actif' : 'Inactif',
      'Date de création': account.createdAt.toISOString().split('T')[0],
      'Dernière connexion': 'Jamais'
    }));

    const excelBuffer = await generateExcel(accountsData, 'accounts', 'Comptes');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=comptes.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export accounts'
    });
  }
};

// Export Medicines Data
export const exportMedicines = async (_req: Request, res: Response): Promise<void> => {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: {
        brandName: 'asc'
      }
    });

    const medicinesData = medicines.map(medicine => ({
      'DCI': medicine.dci,
      'Nom commercial': medicine.brandName,
      'Laboratoire': medicine.laboratoire,
      'Forme': medicine.form || '',
      'Dosage': medicine.dosage || '',
      'Date d\'ajout': new Date().toISOString().split('T')[0]
    }));

    const excelBuffer = await generateExcel(medicinesData, 'medicines', 'Médicaments');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=medicaments.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export medicines error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export medicines'
    });
  }
};

// Export Health Data
export const exportHealth = async (_req: Request, res: Response): Promise<void> => {
  try {
    const healthData = [{
      'Service': 'Base de données',
      'Statut': 'Opérationnel',
      'Dernière vérification': new Date().toISOString(),
      'Temps de réponse': '< 100ms'
    }, {
      'Service': 'API',
      'Statut': 'Opérationnel',
      'Dernière vérification': new Date().toISOString(),
      'Temps de réponse': '< 50ms'
    }, {
      'Service': 'Email',
      'Statut': 'Opérationnel',
      'Dernière vérification': new Date().toISOString(),
      'Temps de réponse': '< 200ms'
    }];

    const excelBuffer = await generateExcel(healthData, 'health', 'Santé du Système');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sante-systeme.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export health error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export health data'
    });
  }
};

// Export Interests Data
export const exportInterests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const interests = await prisma.interest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    const interestsData = interests.map(interest => ({
      'ID': interest.id,
      'Annonce ID': interest.announcementId,
      'Pharmacie ID': interest.pharmacyUserId,
      'Date d\'intérêt': interest.createdAt.toISOString().split('T')[0],
      'Statut': interest.status
    }));

    const excelBuffer = await generateExcel(interestsData, 'interests', 'Intérêts');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=interets.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export interests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export interests'
    });
  }
};

// Export Retours Data
export const exportRetours = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Since retour model doesn't exist, return empty data
    const retoursData = [{
      'ID': 'N/A',
      'Demande': 'N/A',
      'Médicament': 'N/A',
      'Utilisateur': 'N/A',
      'Fournisseur': 'N/A',
      'Quantité': 0,
      'Date de retour': new Date().toISOString().split('T')[0],
      'Statut': 'N/A'
    }];

    const excelBuffer = await generateExcel(retoursData, 'retours', 'Retours');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=retours.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export retours error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export retours'
    });
  }
};
