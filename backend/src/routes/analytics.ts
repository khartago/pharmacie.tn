import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  getTopMedicines,
  getRequestsByRegion,
  getAnnouncementsTrend,
  getActivePharmacies,
  getActiveSuppliers,
  getDashboardStats,
  getOverview,
  getActivityTimeline,
  getPharmaciesStats,
  getSuppliersStats,
  getAnnouncementsStats,
  getRequestsStats,
  getMyStats
} from '../controllers/analyticsController';

const router = Router();

// User-specific analytics (requires authentication but not admin role)
router.get('/my-stats', authenticateToken, asyncHandler(getMyStats));

// All other routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// Analytics endpoints
router.get('/overview', asyncHandler(getOverview));
router.get('/top-medicines', asyncHandler(getTopMedicines));
router.get('/requests-by-region', asyncHandler(getRequestsByRegion));
router.get('/announcements-trend', asyncHandler(getAnnouncementsTrend));
router.get('/active-pharmacies', asyncHandler(getActivePharmacies));
router.get('/active-suppliers', asyncHandler(getActiveSuppliers));
router.get('/activity', asyncHandler(getActivityTimeline));
router.get('/dashboard-stats', asyncHandler(getDashboardStats));
router.get('/pharmacies/stats', asyncHandler(getPharmaciesStats));
router.get('/suppliers/stats', asyncHandler(getSuppliersStats));
router.get('/announcements/stats', asyncHandler(getAnnouncementsStats));
router.get('/requests/stats', asyncHandler(getRequestsStats));

export default router; 