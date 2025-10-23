import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  exportPharmacies,
  exportSuppliers,
  exportAnnouncements,
  exportRequests,
  exportSupportTickets,
  exportAuditLogs,
  exportRetourPDF,
  exportAnalytics,
  exportAccounts,
  exportMedicines,
  exportHealth,
  exportInterests,
  exportRetours
} from '../controllers/exportController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Admin-only export routes
router.get('/pharmacies', requireRole(['ADMIN']), asyncHandler(exportPharmacies));
router.get('/suppliers', requireRole(['ADMIN']), asyncHandler(exportSuppliers));
router.get('/announcements', requireRole(['ADMIN']), asyncHandler(exportAnnouncements));
router.get('/requests', requireRole(['ADMIN']), asyncHandler(exportRequests));
router.get('/support-tickets', requireRole(['ADMIN']), asyncHandler(exportSupportTickets));
router.get('/audit-logs', requireRole(['ADMIN']), asyncHandler(exportAuditLogs));
router.get('/analytics', requireRole(['ADMIN']), asyncHandler(exportAnalytics));
router.get('/accounts', requireRole(['ADMIN']), asyncHandler(exportAccounts));
router.get('/medicines', requireRole(['ADMIN']), asyncHandler(exportMedicines));
router.get('/health', requireRole(['ADMIN']), asyncHandler(exportHealth));
router.get('/interests', requireRole(['ADMIN']), asyncHandler(exportInterests));
router.get('/retours', requireRole(['SUPPLIER']), asyncHandler(exportRetours));

// Fournisseur PDF export (for accepted retours)
router.get('/retour/:retourId/pdf', requireRole(['SUPPLIER']), asyncHandler(exportRetourPDF));

export default router; 