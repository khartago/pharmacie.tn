import express from 'express';
import {
  createPharmacy,
  getPharmacies,
  getPharmacyById,
  updatePharmacy,
  deactivatePharmacy,
  activatePharmacy,
  updatePharmacyStatus,
  createSubscription,
  updateSubscription
} from '../controllers/pharmacyController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create pharmacy (admin only)
router.post('/', requireRole(['ADMIN']), asyncHandler(createPharmacy));

// Get all pharmacies (any authenticated user can view)
router.get('/', asyncHandler(getPharmacies));

// Get pharmacy by ID
router.get('/:id', asyncHandler(getPharmacyById));

// Update pharmacy (admin or own pharmacy)
router.put('/:id', asyncHandler(updatePharmacy));

// Admin only routes
router.post('/:id/deactivate', requireRole(['ADMIN']), asyncHandler(deactivatePharmacy));
router.post('/:id/activate', requireRole(['ADMIN']), asyncHandler(activatePharmacy));

// Status toggle (admin only)
router.put('/:id/status', requireRole(['ADMIN']), asyncHandler(updatePharmacyStatus));

// Subscription management (admin only)
router.post('/:id/subscription', requireRole(['ADMIN']), asyncHandler(createSubscription));
router.put('/:id/subscription/:subId', requireRole(['ADMIN']), asyncHandler(updateSubscription));

export default router;