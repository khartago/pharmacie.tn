import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  archiveExpiredAnnouncements,
  archiveExpiredRequests,
  archiveExpiredRetours,
  getArchivedAnnouncements,
  restoreAnnouncement,
  renewAnnouncement
} from '../controllers/archiveController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Admin-only archive operations
router.post('/announcements', requireRole(['ADMIN']), asyncHandler(archiveExpiredAnnouncements));
router.post('/requests', requireRole(['ADMIN']), asyncHandler(archiveExpiredRequests));
router.post('/retours', requireRole(['ADMIN']), asyncHandler(archiveExpiredRetours));

// Get archived announcements (any authenticated user)
router.get('/announcements', asyncHandler(getArchivedAnnouncements));

// Restore announcement (owner or admin)
router.post('/announcements/:id/restore', asyncHandler(restoreAnnouncement));

// Renew announcement (owner only)
router.post('/announcements/:id/renew', requireRole(['PHARMACY']), asyncHandler(renewAnnouncement));

export default router; 